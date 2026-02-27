/**
 * Cost Function Module
 * 
 * This module calculates the "Total Cost" of a route by balancing different
 * priorities like time efficiency, fuel consumption, and reliability (delays).
 */

/**
 * Calculates the total optimized cost of a journey using a weighted formula.
 * 
 * Why using weights (0.6, 0.3, 0.1)?
 * - 0.6 (60%) for Time: Time is the highest priority as delivery speed is critical.
 * - 0.3 (30%) for Fuel: Fuel consumption is important for cost management and sustainability.
 * - 0.1 (10%) for Delay Penalty: Penalties represent the risk of being late, but have a smaller weight 
 *   unless the delay is significant.
 * 
 * @param {number} time - Estimated travel time in minutes.
 * @param {number} fuel - Estimated fuel consumption in liters.
 * @param {number} delayPenalty - A value representing the impact of potential delays.
 * @returns {number} The total calculated cost.
 */
export const calculateCost = (time, fuel, delayPenalty) => {
    // Formula: (0.6 × time) + (0.3 × fuel) + (0.1 × delayPenalty)
    const totalCost = (0.6 * time) + (0.3 * fuel) + (0.1 * delayPenalty);

    // Rounding to 2 decimal places for a clean result
    return Math.round(totalCost * 100) / 100;
};
