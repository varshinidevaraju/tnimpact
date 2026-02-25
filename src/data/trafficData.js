export const trafficData = {
    'Fashion Ave': { congestion: 0.2, speedLimit: 40 },
    'Innovation Blvd': { congestion: 0.8, speedLimit: 50 },
    'Culinary Way': { congestion: 0.4, speedLimit: 30 },
    'Metro St': { congestion: 0.9, speedLimit: 45 },
    'Glass Rd': { congestion: 0.1, speedLimit: 35 },
};

export const getDelayFactor = (street) => {
    const data = trafficData[street];
    if (!data) return 1.0;
    return 1 + (data.congestion * 0.5); // Max 50% delay
};
