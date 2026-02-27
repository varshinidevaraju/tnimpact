import { optimizeRoute } from './src/logic/optimizer.js';
import { optimizeRouteDistanceOnly } from './src/logic/routeOptimizer_legacy.js';

/**
 * OPTIMIZER COMPARISON TEST
 * 
 * Compares:
 * 1. Legacy Distance-Only Optimizer: Simple greedy distance sorting.
 * 2. New Hybrid Optimizer: Cost-aware construction + 2-opt refinement.
 */

// 1. Setup Data
const startLocation = { id: 'HUB_CHENNAI', lat: 13.0827, lng: 80.2707 };

const sampleStops = [
    { id: 'STOP_A', lat: 13.0475, lng: 80.2089, trafficFactor: 1.2, timeWindowEnd: 45 },
    { id: 'STOP_B', lat: 12.9172, lng: 80.1923, trafficFactor: 1.8, timeWindowEnd: 90 },
    { id: 'STOP_C', lat: 13.0067, lng: 80.2547, trafficFactor: 1.1, timeWindowEnd: 30 },
    { id: 'STOP_D', lat: 13.0674, lng: 80.2376, trafficFactor: 1.5, timeWindowEnd: 120 },
    { id: 'STOP_E', lat: 12.8342, lng: 79.7036, trafficFactor: 1.3, timeWindowEnd: 240 },
    { id: 'STOP_F', lat: 13.1585, lng: 80.2871, trafficFactor: 1.6, timeWindowEnd: 150 }
];

const config = {
    vehicleConsumptionRate: 0.15,
    timeOfDayFactor: 1.25
};

// 2. Run Both Optimizers
console.log("=== RUNNING OPTIMIZER COMPETITION ===\n");

const legacyResult = optimizeRouteDistanceOnly(startLocation, sampleStops, config);
const hybridResult = optimizeRoute(startLocation, sampleStops, config);

// 3. Clear formatting and log the comparison
const printResults = (name, result) => {
    console.log(`--- ${name.toUpperCase()} ---`);
    console.log(`Route Order:  ${result.orderedRoute.map(s => s.id).join(' -> ')}`);
    console.log(`Total Distance: ${result.totalDistance.toFixed(2)} km`);
    console.log(`Total Time:     ${result.totalTime.toFixed(2)} mins`);
    console.log(`Total Fuel:     ${result.totalFuel.toFixed(2)} L`);
    console.log(`TOTAL COST:     ${result.totalCost.toFixed(2)}`);
    console.log("");
};

printResults("Legacy (Distance-Only)", legacyResult);
printResults("New Hybrid (Cost-Aware)", hybridResult);

// 4. Comparison Analysis
console.log("=== PERFORMANCE SUMMARY ===");
const costDiff = (legacyResult.totalCost - hybridResult.totalCost).toFixed(2);
const timeDiff = (legacyResult.totalTime - hybridResult.totalTime).toFixed(2);
const fuelDiff = (legacyResult.totalFuel - hybridResult.totalFuel).toFixed(2);

console.log(`Cost Savings:     ${costDiff} units (${((costDiff / legacyResult.totalCost) * 100).toFixed(1)}% improvement)`);
console.log(`Time Reduction:   ${timeDiff} mins`);
console.log(`Fuel Efficiency:  ${fuelDiff} L`);

if (hybridResult.totalCost < legacyResult.totalCost) {
    console.log("\n[Verdict]: The Hybrid Optimizer successfully reduced the weighted cost by balancing distance, traffic, and penalties.");
} else {
    console.log("\n[Verdict]: The algorithms performed similarly in this scenario.");
}

console.log("\n>>> COMPARISON COMPLETE <<<");
