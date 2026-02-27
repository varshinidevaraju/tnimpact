import { optimizeRoute } from './src/logic/optimizer.js';

/**
 * MANUAL TEST SCRIPT: Hybrid Route Optimizer Validation
 * 
 * This script validates the 3-stage optimization pipeline:
 * 1. Construction (Nearest Neighbor)
 * 2. Refinement (2-opt)
 * 3. Final Scoring
 */

// 1. Define Test Data
const startLocation = { lat: 13.0827, lng: 80.2707 }; // Chennai Central

const sampleStops = [
    { id: 'Stop_1', lat: 13.0475, lng: 80.2089, trafficFactor: 1.2, timeWindowEnd: 30 },  // Nearby, low traffic
    { id: 'Stop_2', lat: 12.9172, lng: 80.1923, trafficFactor: 1.8, timeWindowEnd: 60 },  // Farther, high traffic
    { id: 'Stop_3', lat: 13.0067, lng: 80.2547, trafficFactor: 1.1, timeWindowEnd: 20 },  // Tight deadline
    { id: 'Stop_4', lat: 13.0674, lng: 80.2376, trafficFactor: 1.5, timeWindowEnd: 90 },  // Mid distance
    { id: 'Stop_5', lat: 12.8342, lng: 79.7036, trafficFactor: 1.3, timeWindowEnd: 150 }, // Very far (Kanchipuram direction)
    { id: 'Stop_6', lat: 13.1585, lng: 80.2871, trafficFactor: 1.6, timeWindowEnd: 120 }  // North direction
];

const config = {
    vehicleConsumptionRate: 0.12, // 0.12 Liters per KM
    timeOfDayFactor: 1.4         // Rush hour multiplier
};

// 2. Execute Optimizer
console.log("--- Starting Hybrid Route Optimization Test ---");
const result = optimizeRoute(startLocation, sampleStops, config);

// 3. Log Results
console.log("\n1. OPTIMIZED ROUTE SEQUENCE:");
result.orderedRoute.forEach((stop, index) => {
    console.log(`   [${index + 1}] ID: ${stop.id} | Arrival: ${stop.arrivalTime.toFixed(2)} mins | Deadline: ${stop.timeWindowEnd} mins`);
});

console.log("\n2. TOTAL PERFORMANCE METRICS:");
console.log(`   - Distance: ${result.totalDistance} km`);
console.log(`   - Time:     ${result.totalTime} mins`);
console.log(`   - Fuel:     ${result.totalFuel} liters`);
console.log(`   - COST:     ${result.totalCost} (Aggregated Score)`);

console.log("\n--- Test Completed Successfully ---");
