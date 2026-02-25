export const calculateFuelConsumption = (distance, loadWeight) => {
    const baseRate = 0.15; // 0.15 liters per km
    const loadFactor = loadWeight * 0.002; // Extra fuel per kg
    return distance * (baseRate + loadFactor);
};

export const calculateCarbonFootprint = (fuelUsed) => {
    return fuelUsed * 2.31; // 2.31 kg CO2 per liter of diesel
};
