/**
 * Travels Time Predictor Module
 * 
 * This module provides simple calculations to estimate travel duration 
 * based on distance and environmental factors like traffic and time of day.
 */

/**
 * Predicts the travel time for a given journey.
 * 
 * @param {number} distance - The distance to travel (e.g., in kilometers or miles).
 * @param {number} trafficFactor - A multiplier representing traffic density (e.g., 1.0 for clear, 2.0 for heavy).
 * @param {number} timeOfDayFactor - A multiplier based on the time of day (e.g., 1.2 for rush hour).
 * @returns {number} The estimated travel time in minutes.
 */
export const predictTravelTime = (distance, trafficFactor, timeOfDayFactor) => {
    // Formula: distance × trafficFactor × timeOfDayFactor
    // We assume the base units and factors are curated to result in minutes.
    const estimatedMinutes = distance * trafficFactor * timeOfDayFactor;

    // Rounding to 2 decimal places for better readability in UI
    return Math.round(estimatedMinutes * 100) / 100;
};
