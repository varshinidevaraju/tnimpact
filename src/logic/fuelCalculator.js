/**
 * Fuel Calculator Module
 * 
 * This module provides a simple way to estimate fuel requirements for a journey
 * based on distance, traffic conditions, and the vehicle's efficiency.
 */

/**
 * Calculates the amount of fuel needed for a trip.
 * 
 * @param {number} distance - The total distance of the trip.
 * @param {number} trafficFactor - A multiplier for traffic (e.g., 1.0 for no traffic, 1.5 for heavy traffic).
 * @param {number} vehicleConsumptionRate - The fuel consumption rate (e.g., liters per km).
 * @returns {number} The total fuel needed, rounded to 2 decimal places.
 */
export const calculateFuel = (distance, trafficFactor, vehicleConsumptionRate) => {
    // Formula: distance × trafficFactor × vehicleConsumptionRate
    const totalFuel = distance * trafficFactor * vehicleConsumptionRate;

    // Rounding the result to 2 decimal places
    return Math.round(totalFuel * 100) / 100;
};

/**
 * Legacy Alias for calculateFuel to maintain backward compatibility.
 */
export const calculateFuelConsumption = calculateFuel;

/**
 * Calculates the carbon footprint based on fuel used.
 * 
 * @param {number} fuelUsed - Total liters of fuel.
 * @returns {number} The estimated kg of CO2 emitted.
 */
export const calculateCarbonFootprint = (fuelUsed) => {
    // Constant: Roughly 2.31kg of CO2 per liter of fuel
    const totalCarbon = fuelUsed * 2.31;
    return Math.round(totalCarbon * 100) / 100;
};
