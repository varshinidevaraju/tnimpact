/**
 * Calculates fuel consumption based on distance, traffic, and vehicle efficiency.
 * 
 * @param {number} totalDistance - Distance in kilometers
 * @param {number} trafficFactor - Average traffic multiplier (e.g., 1.2 for 20% more fuel)
 * @param {number} vehicleConsumptionRate - Liters per kilometer (e.g., 0.1 for 10km/L)
 * @returns {number} - Total fuel required rounded to 2 decimals
 */
export const calculateFuelConsumption = (totalDistance, trafficFactor, vehicleConsumptionRate) => {
    const fuel = totalDistance * trafficFactor * vehicleConsumptionRate;
    return parseFloat(fuel.toFixed(2));
};

/**
 * Calculates the carbon footprint based on fuel used.
 * @param {number} fuelUsed - Total liters of fuel
 * @returns {number} - kg CO2 emitted
 */
export const calculateCarbonFootprint = (fuelUsed) => {
    return parseFloat((fuelUsed * 2.31).toFixed(2)); // 2.31 kg CO2 per liter of diesel
};
