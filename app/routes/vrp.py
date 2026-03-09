"""
USES: Defines the logical endpoints for Vehicle Routing Problem (VRP) optimization.
SUPPORT: Handles incoming optimization requests from the frontend and communicates with the VRPSolver to return cost-minimized routes.
"""
from fastapi import APIRouter, HTTPException  # Import FastAPI components for routing and error handling
from models.schemas import OptimizationRequest, OptimizationResponse  # Import Pydantic models for data validation
from routing.vrp_solver import vrp_solver  # Import the core logic for solving the routing problem
from services.realtime_router import realtime_router  # Import service for handling live telemetry updates
from app.utils.logger import logger  # Import the logging utility for tracking system activity

router = APIRouter()  # Create an APIRouter instance to group related endpoints

@router.post("/optimize-route", response_model=OptimizationResponse)  # Define a POST endpoint for route optimization
async def optimize_route(request: OptimizationRequest):  # asynchronous function to handle the optimization request
    """
    Main Enterprise VRP Optimization Endpoint.
    """
    try:
        # Step 1: Solve VRP using the logic engine
        result = await vrp_solver.solve_vrp(  # Call the solver with provided hardware and logistical constraints
            office=request.office.model_dump(),  # Pass the depot location as a dictionary
            vehicles=[v.model_dump() for v in request.vehicles],  # Convert vehicle objects to list of dicts
            stops=[s.model_dump() for s in request.stops]  # Convert stop objects to list of dicts
        )
        
        if "error" in result:  # Check if the solver returned a logic error (e.g., no solution possible)
            raise HTTPException(status_code=400, detail=result["error"])  # Return a 400 Client Error with details
            
        return result  # Return the successfully calculated and cost-optimized route
    except Exception as e:  # Catch any unexpected runtime errors
        logger.error(f"Enterprise Optimization Failed: {e}")  # Log the error for administrator debugging
        raise HTTPException(status_code=500, detail=str(e))  # Return a 500 Internal Server Error to the client

@router.post("/update-position")  # Define a POST endpoint for real-time location tracking
async def update_position(vehicle_id: str, lat: float, lng: float):  # asynchronous function to record new GPS coordinates
    """
    Real-time telemetry update endpoint.
    """
    return realtime_router.update_vehicle_position(vehicle_id, lat, lng)  # Forward the telemetry data to the tracking service
