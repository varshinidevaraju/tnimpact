import { predictTravelTime } from './predictor.js';
import { calculateFuel } from './fuelCalculator.js';
import { calculateCost } from './costFunction.js';
import { applyTwoOpt } from './localSearch.js';

/**
 * HYBRID ROUTE OPTIMIZATION ARCHITECTURE
 * 
 * This module follows a three-stage approach:
 * 1. Construction (Nearest Neighbor): Build a valid initial route.
 * 2. Refinement (2-opt): Improve the route by swapping segments.
 * 3. Validation: Recalculate finals and arrival times.
 */

/**
 * Stage 0: Geometric Utilities
 * Calculates the straight-line distance between two coordinates using Haversine formula.
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

/**
 * Stage 1: Constraint Validation
 * Calculates the delay penalty for a specific segment.
 * Includes a fixed penalty for missing time windows.
 */
export const validateConstraints = (predictedArrivalTime, timeWindowEnd) => {
    let delayPenalty = Math.max(0, predictedArrivalTime - timeWindowEnd);

    // Hard Constraint: Penalty for being late
    if (predictedArrivalTime > timeWindowEnd) {
        delayPenalty += 20;
    }

    return delayPenalty;
};

/**
 * Stage 2: Initial Construction (Nearest Neighbor)
 * Rapidly builds a starting route by picking the "cheapest" next stop.
 */
export const buildInitialRoute = (startPoint, stops, config) => {
    let currentPos = { lat: startPoint.lat, lng: startPoint.lng };
    let pendingStops = [...stops];
    let route = [];
    let currentTime = 0;

    while (pendingStops.length > 0) {
        let bestStopIndex = -1;
        let lowestStopCost = Infinity;

        for (let i = 0; i < pendingStops.length; i++) {
            const stop = pendingStops[i];
            const dist = calculateDistance(currentPos.lat, currentPos.lng, stop.lat, stop.lng);
            const time = predictTravelTime(dist, stop.trafficFactor, config.timeOfDayFactor);
            const fuel = calculateFuel(dist, stop.trafficFactor, config.vehicleConsumptionRate);

            const penalty = validateConstraints(currentTime + time, stop.timeWindowEnd);
            const cost = calculateCost(time, fuel, penalty);

            if (cost < lowestStopCost) {
                lowestStopCost = cost;
                bestStopIndex = i;
            }
        }

        const chosenStop = pendingStops.splice(bestStopIndex, 1)[0];
        route.push(chosenStop);

        const dist = calculateDistance(currentPos.lat, currentPos.lng, chosenStop.lat, chosenStop.lng);
        currentTime += predictTravelTime(dist, chosenStop.trafficFactor, config.timeOfDayFactor);
        currentPos = { lat: chosenStop.lat, lng: chosenStop.lng };
    }

    return route;
};

/**
 * Stage 3: Local Improvement (2-opt)
 * Refines the constructed route to eliminate inefficiencies.
 */
export const applyLocalImprovement = (startPoint, initialRoute, config) => {
    return applyTwoOpt(initialRoute, (testRoute) => {
        // Evaluation function for local search
        const metrics = calculateFinalMetrics(startPoint, testRoute, config);
        return metrics.totalCost;
    });
};

/**
 * Internal helper to calculate final route statistics.
 */
const calculateFinalMetrics = (startPoint, route, config) => {
    let currentPos = { lat: startPoint.lat, lng: startPoint.lng };
    let metrics = { totalDistance: 0, totalTime: 0, totalFuel: 0, totalCost: 0, stops: [] };

    for (const stop of route) {
        const dist = calculateDistance(currentPos.lat, currentPos.lng, stop.lat, stop.lng);
        const time = predictTravelTime(dist, stop.trafficFactor, config.timeOfDayFactor);
        const fuel = calculateFuel(dist, stop.trafficFactor, config.vehicleConsumptionRate);

        const arrivalTime = metrics.totalTime + time;
        const penalty = validateConstraints(arrivalTime, stop.timeWindowEnd);
        const cost = calculateCost(time, fuel, penalty);

        metrics.totalDistance += dist;
        metrics.totalTime += time;
        metrics.totalFuel += fuel;
        metrics.totalCost += cost;
        metrics.stops.push({ ...stop, arrivalTime });

        currentPos = { lat: stop.lat, lng: stop.lng };
    }

    return metrics;
};

/**
 * Default Configuration for Optimization
 */
const DEFAULT_CONFIG = {
    vehicleConsumptionRate: 0.15,
    timeOfDayFactor: 1.0
};

/**
 * Public API: Optimize full route
 */
export const optimizeRoute = (startLocation, stops, config = DEFAULT_CONFIG) => {
    // Use merge to allow partial configs
    const finalConfig = { ...DEFAULT_CONFIG, ...config };

    // 1. Build
    const initial = buildInitialRoute(startLocation, stops, finalConfig);
    // 2. Improve
    const improved = applyLocalImprovement(startLocation, initial, finalConfig);
    // 3. Score
    const final = calculateFinalMetrics(startLocation, improved, finalConfig);

    return {
        orderedRoute: final.stops,
        totalDistance: Math.round(final.totalDistance * 100) / 100,
        totalTime: Math.round(final.totalTime * 100) / 100,
        totalFuel: Math.round(final.totalFuel * 100) / 100,
        totalCost: Math.round(final.totalCost * 100) / 100
    };
};

/**
 * Public API: Dynamic Re-optimization (for remaining stops)
 */
export const reoptimizeRoute = (currentLocation, remainingStops, config = DEFAULT_CONFIG) => {
    return optimizeRoute(currentLocation, remainingStops, config);
};

/**
 * Public API: Optimized route with history persistence
 */
export const optimizeWithPersistentHistory = (currentLocation, fullRoute, currentStopIndex, config = DEFAULT_CONFIG) => {
    const completedStops = fullRoute.slice(0, currentStopIndex);
    const pendingStops = fullRoute.slice(currentStopIndex);

    const optimizationResult = optimizeRoute(currentLocation, pendingStops, config);

    return [...completedStops, ...optimizationResult.orderedRoute];
};
