export const optimizeRoute = (orders, trafficData) => {
    // Simple heuristic: Rank by priority then distance (simulated)
    const priorityMap = { High: 0, Medium: 1, Low: 2 };

    return [...orders].sort((a, b) => {
        if (priorityMap[a.priority] !== priorityMap[b.priority]) {
            return priorityMap[a.priority] - priorityMap[b.priority];
        }
        return 0; // In a real app, calculate distance between points
    });
};

export const calculateEstimatedTime = (orders) => {
    return orders.length * 25; // Simple simulation: 25 mins per stop
};
