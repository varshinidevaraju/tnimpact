import { saveToStorage, getFromStorage } from "../utils/storage";

// Traffic zones configuration
export const trafficZones = {
    low: 1.0,
    medium: 1.3,
    high: 1.6
};

// Get multiplier safely
export const getTrafficMultiplier = (zone) => {
    if (!zone || !trafficZones[zone]) {
        return 1.0; // Default traffic
    }
    return trafficZones[zone];
};

// Save selected traffic zone
export const setTrafficZone = (zone) => {
    try {
        if (trafficZones[zone]) {
            saveToStorage("route_traffic", zone);
        }
    } catch (error) {
        console.error("Error setting traffic zone", error);
    }
};

// Get currently selected traffic zone
export const getCurrentTrafficZone = () => {
    try {
        const savedZone = getFromStorage("route_traffic");
        return savedZone && trafficZones[savedZone]
            ? savedZone
            : "low"; // Default zone
    } catch (error) {
        console.error("Error getting current traffic zone", error);
        return "low";
    }
};
if (typeof window !== "undefined") {
    window.setTrafficZone = setTrafficZone;
    window.getCurrentTrafficZone = getCurrentTrafficZone;
    window.getTrafficMultiplier = getTrafficMultiplier;
}