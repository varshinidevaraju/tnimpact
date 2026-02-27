/**
 * Local Search Optimization Module
 * 
 * This module uses the 2-opt algorithm to refine a pre-calculated route.
 * 2-opt works by systematically swapping segments of the route and 
 * checking if the total cost of the journey decreases.
 */

/**
 * Applies the 2-opt algorithm to refine a route.
 * 
 * Logic:
 * 1. Take two non-adjacent edges in the route.
 * 2. Swap them (reverse the order of the stops between them).
 * 3. Calculate the new total cost.
 * 4. If the new cost is lower, keep the swap and repeat.
 * 5. Otherwise, revert and try the next pair.
 * 
 * @param {Array} route - The initial ordered list of stops.
 * @param {Function} calculateTotalCost - A function that takes a route array and returns its total cost.
 * @returns {Array} The optimized route after local search.
 */
export const applyTwoOpt = (route, calculateTotalCost) => {
    let bestRoute = [...route];
    let bestCost = calculateTotalCost(bestRoute);
    let improved = true;

    // Continue looping as long as we find improvements
    while (improved) {
        improved = false;

        // Iterate through all pairs of stops (i, j)
        // We start from 1 to skip the starting point if it's fixed, 
        // but here we assume the input is just the list of stops to visit.
        for (let i = 0; i < bestRoute.length - 1; i++) {
            for (let j = i + 1; j < bestRoute.length; j++) {

                // Create a new route by reversing the segment between i and j
                const newRoute = twoOptSwap(bestRoute, i, j);
                const newCost = calculateTotalCost(newRoute);

                // If the swap results in a lower cost, update the best route
                if (newCost < bestCost) {
                    bestRoute = newRoute;
                    bestCost = newCost;
                    improved = true;
                }
            }
        }
    }

    return bestRoute;
};

/**
 * Helper function to perform a 2-opt swap.
 * Reverses the order of elements in the route between index i and index j.
 */
const twoOptSwap = (route, i, j) => {
    const newRoute = [...route];
    const segment = newRoute.slice(i, j + 1);
    segment.reverse();
    newRoute.splice(i, segment.length, ...segment);
    return newRoute;
};
