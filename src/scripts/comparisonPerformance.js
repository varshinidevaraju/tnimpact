import { optimizeRoute } from '../logic/optimizer.js';
import { mockOrders } from '../data/mockOrders.js';

async function runComparison() {
    const startLocation = { lat: 13.0827, lng: 80.2707 }; // Chennai Center
    const ordersToOptimize = mockOrders.filter(o => o.status === 'Pending');

    console.log("------------------------------------------------------------------");
    console.log("LOGISTICS OPTIMIZER BENCHMARK: STATIC VS. ML-PREDICTIVE TRAFFIC");
    console.log("------------------------------------------------------------------");
    console.log(`Analyzing ${ordersToOptimize.length} pending delivery points...`);
    console.log("");

    // 1. Run with STATIC Traffic (Standard 1.2 multiplier)
    const staticConfig = {
        staticTrafficMultiplier: 1.2,
        baseSpeed: 40,
        vehicleConsumptionRate: 0.15,
        timeWeight: 0.6,
        fuelWeight: 0.3,
        penaltyWeight: 0.1,
        latePenalty: 20
    };

    console.log("Running Static Baseline...");
    const staticResult = await optimizeRoute(startLocation, ordersToOptimize, staticConfig);

    // 2. Run with ML Traffic (API Call)
    const mlConfig = {
        // No static override, will use fetchTrafficMultiplier
        baseSpeed: 40,
        vehicleConsumptionRate: 0.15,
        timeWeight: 0.6,
        fuelWeight: 0.3,
        penaltyWeight: 0.1,
        latePenalty: 20
    };

    console.log("Running ML-Enhanced Optimization (Connecting to FastAPI)...");
    let mlResult;
    try {
        mlResult = await optimizeRoute(startLocation, ordersToOptimize, mlConfig);
    } catch (error) {
        console.error("ML Optimization failed (is your FastAPI server running?). Falling back.");
        return;
    }

    // 3. Comparison Logic
    const diffTime = staticResult.totalTime - mlResult.totalTime;
    const diffFuel = staticResult.totalFuel - mlResult.totalFuel;
    const diffCost = staticResult.totalCost - mlResult.totalCost;

    const improvementPercent = ((diffCost / staticResult.totalCost) * 100).toFixed(2);

    // 4. Output Table
    console.log("\n+-----------------+-----------------+-----------------+-----------------+");
    console.log("| Metric          | Static Baseline | ML-Enhanced     | Improvement (%) |");
    console.log("+-----------------+-----------------+-----------------+-----------------+");
    console.log(`| Total Distance  | ${staticResult.totalDistance.toFixed(2)} km      | ${mlResult.totalDistance.toFixed(2)} km      | ---             |`);
    console.log(`| Estimated Time  | ${staticResult.totalTime.toFixed(2)} min     | ${mlResult.totalTime.toFixed(2)} min     | ${((diffTime / staticResult.totalTime) * 100).toFixed(1)}%            |`);
    console.log(`| Fuel Consumed   | ${staticResult.totalFuel.toFixed(2)} L       | ${mlResult.totalFuel.toFixed(2)} L       | ${((diffFuel / staticResult.totalFuel) * 100).toFixed(1)}%            |`);
    console.log(`| Total Cost Score| ${staticResult.totalCost.toFixed(2)}          | ${mlResult.totalCost.toFixed(2)}          | ${improvementPercent}%          |`);
    console.log("+-----------------+-----------------+-----------------+-----------------+");

    console.log(`\nCONCLUSION: ML-Enhanced routing achieved a ${improvementPercent}% reduction in total operational costs.`);
    console.log("------------------------------------------------------------------\n");
}

runComparison();
