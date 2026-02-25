/**
 * Simple Route Optimization using the Nearest Neighbor Algorithm.
 * This approach starts from a point and always moves to the closest unvisited stop.
 */

/**
 * Calculates the Euclidean distance between two points.
 * Beginner-friendly version of the distance formula.
 * @param {Object} p1 - { lat, lng }
 * @param {Object} p2 - { lat, lng }
 * @returns {number}
 */
const getDistance = (p1, p2) => {
    const latDiff = p2.lat - p1.lat;
    const lngDiff = p2.lng - p1.lng;
    return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
};

import { calculateFuelConsumption, calculateCarbonFootprint } from './fuelCalculator.js';

const AVG_SPEED_KMH = 40;
const KM_PER_UNIT = 111;
const DEFAULT_VEHICLE_RATE = 0.15; // 0.15 L/km

/**
 * Dynamic Route Optimizer with Partial Recalculation
 * 
 * @param {Object} currentLocation - Current position { lat, lng }
 * @param {Array} fullRoute - The entire list of stops (completed + pending)
 * @param {number} currentStopIndex - The index the driver is currently at
 * @param {number} [vehicleRate] - Optional liters per km
 * @param {number} [delayMinutes] - Delay at current location
 * @returns {Array} - The new full route with pending stops optimized
 */
export const optimizeWithPersistentHistory = (currentLocation, fullRoute, currentStopIndex, vehicleRate = DEFAULT_VEHICLE_RATE, delayMinutes = 0) => {
    // 1. Separate stops into Completed and Remaining
    // Slice(0, currentIndex) gets stops up to where we are (including the one just finished)
    const completedStops = fullRoute.slice(0, currentStopIndex);
    const pendingStops = fullRoute.slice(currentStopIndex);

    // 2. Only optimize the pending (remaining) stops
    // We send the pending list to our existing logic
    const optimizationResult = optimizeRoute(currentLocation, pendingStops, vehicleRate, delayMinutes);

    // 3. Combine them back together
    // This keeps the "already visited" history untouched
    return [...completedStops, ...optimizationResult.orderedRoute];
};

export const optimizeRoute = (currentLocation, remainingStops, vehicleRate = DEFAULT_VEHICLE_RATE, delayMinutes = 0) => {
    let orderedRoute = [];
    let totalDistance = 0;
    let totalWeightedDistance = 0;
    let activeLocation = currentLocation;

    // Rule: Recalculate (optimize) only if delay is significant (>10 mins) 
    // or if this is the initial plan (delayMinutes === 0).
    const shouldRecalculate = delayMinutes > 10 || delayMinutes === 0;

    if (shouldRecalculate) {
        const stopsToProcess = [...remainingStops];
        while (stopsToProcess.length > 0) {
            let nearestIndex = 0;
            let shortestWeightedDistance = Infinity;

            for (let i = 0; i < stopsToProcess.length; i++) {
                const stop = stopsToProcess[i];
                const actualDistance = getDistance(activeLocation, stop);
                const trafficFactor = stop.trafficMultiplier || 1;
                const weightedDistance = actualDistance * trafficFactor;

                if (weightedDistance < shortestWeightedDistance) {
                    shortestWeightedDistance = weightedDistance;
                    nearestIndex = i;
                }
            }

            const nextStop = stopsToProcess.splice(nearestIndex, 1)[0];
            const actualDistToNext = getDistance(activeLocation, nextStop);

            orderedRoute.push(nextStop);
            totalDistance += actualDistToNext;
            totalWeightedDistance += actualDistToNext * (nextStop.trafficMultiplier || 1);
            activeLocation = nextStop;
        }
    } else {
        // Low delay: Stick to the current planned order but update stats
        orderedRoute = [...remainingStops];
        for (const stop of orderedRoute) {
            const actualDistToNext = getDistance(activeLocation, stop);
            totalDistance += actualDistToNext;
            totalWeightedDistance += actualDistToNext * (stop.trafficMultiplier || 1);
            activeLocation = stop;
        }
    }

    const totalDistanceKM = totalDistance * KM_PER_UNIT;
    const totalWeightedKM = totalWeightedDistance * KM_PER_UNIT;

    // Time & Fuel Calculations
    // Travel time + any current delays
    const travelTimeMinutes = (totalWeightedKM / AVG_SPEED_KMH) * 60;
    const totalTimeMinutes = travelTimeMinutes + delayMinutes;

    const avgTrafficFactor = totalDistance > 0 ? totalWeightedDistance / totalDistance : 1.0;
    const fuelNeeded = calculateFuelConsumption(totalDistanceKM, avgTrafficFactor, vehicleRate);
    const co2Emissions = calculateCarbonFootprint(fuelNeeded);

    return {
        orderedRoute,
        recalculated: shouldRecalculate,
        stats: {
            totalDistanceKm: parseFloat(totalDistanceKM.toFixed(2)),
            totalTimeMins: Math.round(totalTimeMinutes),
            delayImpactMins: delayMinutes,
            fuelRequiredLiters: fuelNeeded,
            carbonFootprintKg: co2Emissions
        }
    };
};

/**
 * Example Usage:
 * 
 * const start = { lat: 0, lng: 0 };
 * const stops = [
 *   { id: 'A', lat: 2, lng: 3 },
 *   { id: 'B', lat: 10, lng: 10 },
 *   { id: 'C', lat: 1, lng: 1 }
 * ];
 * 
 * const result = optimizeRoute(start, stops);
 * console.log(result.orderedRoute); // [C, A, B]
 */
