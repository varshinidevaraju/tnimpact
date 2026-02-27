import { calculateDistance } from './optimizer.js';
import { predictTravelTime } from './predictor.js';
import { calculateFuel } from './fuelCalculator.js';
import { calculateCost } from './costFunction.js';

export const optimizeRouteDistanceOnly = (startLocation, stops, config) => {
    let currentPos = { lat: startLocation.lat, lng: startLocation.lng };
    let pendingStops = [...stops];
    let orderedRoute = [];

    // 1. Simple Greedy Distance-Only Construction
    while (pendingStops.length > 0) {
        let bestStopIndex = -1;
        let shortestDist = Infinity;

        for (let i = 0; i < pendingStops.length; i++) {
            const stop = pendingStops[i];
            const dist = calculateDistance(currentPos.lat, currentPos.lng, stop.lat, stop.lng);
            if (dist < shortestDist) {
                shortestDist = dist;
                bestStopIndex = i;
            }
        }

        const chosenStop = pendingStops.splice(bestStopIndex, 1)[0];
        orderedRoute.push(chosenStop);
        currentPos = { lat: chosenStop.lat, lng: chosenStop.lng };
    }

    // 2. Evaluate metrics for the resulting path
    let totalDistance = 0;
    let totalTime = 0;
    let totalFuel = 0;
    let totalCost = 0;
    let finalStops = [];
    currentPos = { lat: startLocation.lat, lng: startLocation.lng };

    for (const stop of orderedRoute) {
        const dist = calculateDistance(currentPos.lat, currentPos.lng, stop.lat, stop.lng);
        const time = predictTravelTime(dist, stop.trafficFactor, config.timeOfDayFactor);
        const fuel = calculateFuel(dist, stop.trafficFactor, config.vehicleConsumptionRate);

        const arrivalTime = totalTime + time;
        const delayPenalty = Math.max(0, arrivalTime - stop.timeWindowEnd);
        const finalPenalty = arrivalTime > stop.timeWindowEnd ? delayPenalty + 20 : delayPenalty;

        const cost = calculateCost(time, fuel, finalPenalty);

        totalDistance += dist;
        totalTime += time;
        totalFuel += fuel;
        totalCost += cost;
        finalStops.push({ ...stop, arrivalTime });

        currentPos = { lat: stop.lat, lng: stop.lng };
    }

    return {
        orderedRoute: finalStops,
        totalDistance: parseFloat(totalDistance.toFixed(2)),
        totalTime: parseFloat(totalTime.toFixed(2)),
        totalFuel: parseFloat(totalFuel.toFixed(2)),
        totalCost: parseFloat(totalCost.toFixed(2))
    };
};
