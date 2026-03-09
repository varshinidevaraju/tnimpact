"""
USES: Implements the Vehicle Routing Problem (VRP) solver using Google OR-Tools.
SUPPORT: Calculates the most efficient delivery routes by minimizing a multi-factor cost function (fuel, wages, penalties) while respecting vehicle capacities and time windows.
"""
from ortools.constraint_solver import routing_enums_pb2  # Import search algorithms and strategies for route finding
from ortools.constraint_solver import pywrapcp  # Import the core routing model wrapper for constraint programming
import numpy as np  # Import numpy for numerical operations and array handling
from app.utils.logger import logger  # Import logging for tracking solver progress and surfacing errors
from app.config import config  # Import system configuration for environment-specific parameters
from routing.matrix_builder import matrix_builder  # Helper to construct travel duration matrices between coordinates
from routing.route_builder import route_builder  # Helper to build detailed road geometries from solver results
import time  # Standard library for generating high-resolution timestamps

class VRPSolver:  # Singleton class to encapsulate the VRP solving logic
    def __init__(self):  # Constructor for the VRPSolver class
        pass  # No initialization state is required for this logic engine

    async def solve_vrp(self, office: dict, vehicles: list, stops: list, penalty_rate: float = 500.0):  # Main async entry point
        """
        Solves Enterprise VRP with Financial Cost Minimization Objective.
        """
        # STEP 1 — Aggregate all coordinates into an ordered list (Depot first)
        all_coords = [[office['lat'], office['lng']]] + [[s['lat'], s['lng']] for s in stops]
        
        # STEP 2 — Generate the travel duration matrix using the map engine
        matrix = await matrix_builder.get_duration_matrix(all_coords)  # Get seconds between every pair of points
        if not matrix:  # Check if the map engine failed to respond
            return {"error": "Matrix building failed"}  # Abort if we lack the data to calculate costs

        num_nodes = len(all_coords)  # Define the total nodes (1 depot + N customers)
        num_vehicles = len(vehicles)  # Define how many slots/drivers are in the simulation
        depot = 0  # Index 0 is always the warehouse HQ
        matrix = [[int(val) for val in row] for row in matrix] # Solver requires integers for consistent cost comparison

        # STEP 3 — Initialize the OR-Tools Routing Model
        manager = pywrapcp.RoutingIndexManager(num_nodes, num_vehicles, depot)  # Manages node-to-index mapping
        routing = pywrapcp.RoutingModel(manager)  # The actual mathematical model for the VRP

        # 3.1 Custom Cost Definition (Financial optimization)
        def create_cost_callback(v_idx):  # Closure to bake in specific vehicle costs (fuel, wage)
            v_data = vehicles[v_idx]  # Access the configuration for this specific vehicle
            consumption = v_data.get('consumption_liters_per_100km', 12.0)  # L/100km fuel factor
            fuel_price = v_data.get('fuel_price_per_litre', 95.0)  # Current cost per liter
            wage = v_data.get('driver_hourly_wage', 250.0)  # Driver's hourly remuneration
            
            def callback(from_index, to_index):  # The internal callback function called by the solver
                from_node = manager.IndexToNode(from_index)  # Map index back to coordinate node
                to_node = manager.IndexToNode(to_index)  # Map index back to coordinate node
                duration_sec = matrix[from_node][to_node]  # Get travel time in seconds
                
                # Conversion logic: 1 sec ~ 0.01 km (Assumes avg. 36km/h for cost proxying)
                dist_km = duration_sec * 0.01  # Estimated distance
                fuel_cost = dist_km * (consumption / 100) * fuel_price  # Fuel burn in INR
                labor_cost = (duration_sec / 3600.0) * wage  # Driver time in INR
                
                return int((fuel_cost + labor_cost) * 100) # Returns scaled integer to maintain precision
            return callback  # Returns the function for registration

        # Attach cost evaluators per vehicle to the model
        for v_idx in range(num_vehicles):  # For every vehicle in the fleet
            cost_callback = create_cost_callback(v_idx)  # Generate its specific cost handler
            cost_index = routing.RegisterTransitCallback(cost_callback)  # Register with OR-Tools
            routing.SetArcCostEvaluatorOfVehicle(cost_index, v_idx)  # Apply this cost evaluation specifically to vehicle v_idx

        # 3.2 Time Tracking Dimension (for delivery windows)
        def time_callback(from_index, to_index):  # Tracks cumulative time on the route
            from_node = manager.IndexToNode(from_index)  # Map index to node
            to_node = manager.IndexToNode(to_index)  # Map index to node
            service_time = 0  # Overhead for delivery at the stop
            if from_node > 0:  # If we are leaving a customer site
                service_time = stops[from_node - 1].get('service_time_minutes', 10) * 60  # Loading/Unloading time
            return matrix[from_node][to_node] + service_time  # Return total time spent on this edge

        time_callback_index = routing.RegisterTransitCallback(time_callback)  # Register time callback
        routing.AddDimension(  # Add 'Time' dimension to the routing model
            time_callback_index,  # Callback to use
            3600,  # Max wait time (slack) per stop: 1 hour
            86400, # Max route duration: 24 hours
            False, # Time doesn't have to start at 0
            'Time' # Dimension name
        )
        time_dimension = routing.GetDimensionOrDie('Time')  # Fetch the dimension handle

        # 3.3 Apply Hard Time Window Constraints
        for i, stop in enumerate(stops):  # Iterate through all customer requirements
            index = manager.NodeToIndex(i + 1)  # Get internal solver index
            time_dimension.CumulVar(index).SetRange(  # Constrain arrival window
                stop.get('time_window_start', 0),  # Earliest possible arrival
                stop.get('time_window_end', 86400) # Latest possible arrival
            )

        # 3.4 Apply Driver Shift Constraints
        for v_idx, v in enumerate(vehicles):  # Iterate through all driver schedules
            index = routing.Start(v_idx)  # Get start index for driver's route
            time_dimension.CumulVar(index).SetRange(  # Constrain when driver can leave the depot
                v.get('shift_start', 0),  # Start of shift
                v.get('shift_end', 86400) # End of shift
            )

        # 3.5 Payload Capacity Dimension
        def demand_callback(from_index):  # Tracks cargo volume on board
            from_node = manager.IndexToNode(from_index)  # Map to node
            if from_node == 0: return 0  # Depot has zero cargo demand itself
            return stops[from_node - 1].get('demand_units', 1)  # Amount removed from vehicle at this stop

        demand_callback_index = routing.RegisterUnaryTransitCallback(demand_callback)  # Register load callback
        routing.AddDimensionWithVehicleCapacity(  # Add 'Capacity' dimension
            demand_callback_index, 0,  # Load callback and 0 spill/slack
            [v.get('capacity', 100) for v in vehicles],  # Individual capacity limits per vehicle
            True, 'Capacity'  # Start at zero load, named 'Capacity'
        )

        # STEP 4 — Define Search Parameters and Solve
        for i in range(1, num_nodes):  # Allow dropping stops if they are impossible to fulfill
            routing.AddDisjunction([manager.NodeToIndex(i)], int(penalty_rate))  # Penalize omission but allow it

        search_p = pywrapcp.DefaultRoutingSearchParameters()  # Default system search config
        search_p.first_solution_strategy = (  # Strategy for finding the first valid route
            routing_enums_pb2.FirstSolutionStrategy.PARALLEL_CHEAPEST_INSERTION  # Prioritize fast initial greedy assignment
        )
        search_p.local_search_metaheuristic = (  # Strategy for optimizing the initial route
            routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH  # High-quality optimization metaheuristic
        )
        search_p.time_limit.seconds = 5  # Give the solver 5 seconds to refine the solution

        assignment = routing.SolveWithParameters(search_p)  # Execute the solve engine

        # STEP 5 — Parse and Return Solution Data
        if not assignment:  # If no valid path was found even with penalties
            return {"error": "Optimization engine could not find a compliant route configuration."}

        routes_results = []  # Final container for driver routes
        total_d = 0  # Global distance counter
        total_t = 0  # Global duration counter
        
        for vehicle_id in range(num_vehicles):  # Extract path for each vehicle
            idx = routing.Start(vehicle_id)  # Start at driver's beginning
            plan = []  # Ordered sequence of node indices 
            
            while not routing.IsEnd(idx):  # Collect indices until end of route
                plan.append(manager.IndexToNode(idx))  # Add index to the plan
                idx = assignment.Value(routing.NextVar(idx))  # Go to next step
            plan.append(manager.IndexToNode(idx))  # Append final return-to-depot
            
            if len(plan) > 2:  # Only report routes that actually visit customers
                nodes_data = []  # Detailed stop data container
                for n_idx in plan:  # for each stop in the sequence
                    if n_idx == 0:  # Map index 0 to Depot object
                        nodes_data.append({"id": "DEPOT", "name": "HQ", "lat": office['lat'], "lng": office['lng'], "status": "Depot"})
                    else:  # Map indices 1+ to Stop objects
                        nodes_data.append(stops[n_idx - 1])
                
                # Fetch route geometry from OSRM for frontend visualization
                path_data = await route_builder.build_full_route_data(nodes_data)  # Call the builder
                
                routes_results.append({  # Construct single route response
                    "vehicle_id": vehicle_id,
                    "stops": nodes_data,
                    "geometry": path_data.get('geometry'),
                    "distance_km": path_data.get('distance_km', 0),
                    "duration_min": path_data.get('duration_min', 0)
                })
                
                total_d += path_data.get('distance_km', 0)  # Aggregation
                total_t += path_data.get('duration_min', 0)  # Aggregation

        # Final return object structure for the API
        return {
            "routes": routes_results,
            "summary": {
                "total_vehicles_used": len(routes_results),
                "total_distance_km": round(total_d, 2),
                "total_duration_min": round(total_t, 2),
                "status": "Success",
                "timestamp": time.time()
            }
        }

vrp_solver = VRPSolver()  # Export a singleton for app-wide use
