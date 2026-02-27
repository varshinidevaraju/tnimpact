import { optimizeRoute } from './src/logic/optimizer.js';

/**
 * Route Optimizer Validation Script
 * 
 * This script tests the 3-stage hybrid optimization architecture:
 * 1. Initial Construction (Nearest Neighbor)
 * 2. Refinement (2nd-opt)
 * 3. Final Metric Validation
 */

// 1. Setup Test Data
const startLocation = {
    lat: 13.0827,
    lng: 80.2707,
    id: 'Start_Point'
};

const sampleStops = [
    { id: 'Stop_1', lat: 13.0475, lng: 80.2089, trafficFactor: 1.2, timeWindowEnd: 30 },
    { id: 'Stop_2', lat: 12.9172, lng: 80.1923, trafficFactor: 1.8, timeWindowEnd: 60 },
    { id: 'Stop_3', lat: 13.0067, lng: 80.2547, trafficFactor: 1.1, timeWindowEnd: 25 },
    { id: 'Stop_4', lat: 13.0674, lng: 80.2376, trafficFactor: 1.5, timeWindowEnd: 90 },
    { id: 'Stop_5', lat: 12.8342, lng: 79.7036, trafficFactor: 1.3, timeWindowEnd: 180 },
    { id: 'Stop_6', lat: 13.1585, lng: 80.2871, trafficFactor: 1.6, timeWindowEnd: 120 }
];

const config = {
    vehicleConsumptionRate: 0.15, // Gallons/Liters per KM
    timeOfDayFactor: 1.25        // Peak hour adjustment
};

// 2. Execute Optimization
console.log("--- Initializing Hybrid Route Optimizer Test ---");
console.log(`Starting from: ${startLocation.lat}, ${startLocation.lng}`);
console.log(`Processing ${sampleStops.length} delivery stops...\n`);

const result = optimizeRoute(startLocation, sampleStops, config);

// 3. Log Validation Results
console.log("=== OPTIMIZED ROUTE SEQUENCE ===");
result.orderedRoute.forEach((stop, index) => {
    const status = stop.arrivalTime > stop.timeWindowEnd ? "DELAYED" : "ON TIME";
    console.log(`${index + 1}. [${stop.id}] Arrival: ${stop.arrivalTime.toFixed(1)}m | Goal: <${stop.timeWindowEnd}m | Status: ${status}`);
});

console.log("\n=== CONSOLIDATED PERFORMANCE METRICS ===");
console.log(`Total Distance: ${result.totalDistance} km`);
console.log(`Total Time:     ${result.totalTime} minutes`);
console.log(`Total Fuel:     ${result.totalFuel} liters`);
console.log(`Total Cost:     ${result.totalCost} (Optimized Score)`);

console.log("\n--- Validation Completed ---");
