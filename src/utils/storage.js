
export const saveToStorage = (key, data) => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving to storage', error);
    }
};
export const getFromStorage = (key) => {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error reading from storage', error);
        return null;
    }
};
export const removeFromStorage = (key) => {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('Error removing from storage', error);
    }
};

// Clear all localStorage
export const clearStorage = () => {
    try {
        localStorage.clear();
    } catch (error) {
        console.error('Error clearing storage', error);
    }
};

// Update storage value for a key using a callback
export const updateStorage = (key, callback) => {
    try {
        const currentData = getFromStorage(key);
        // Pass null if no data exists
        const updatedData = callback(currentData);
        saveToStorage(key, updatedData);
    } catch (error) {
        console.error('Error updating storage', error);
    }
};

// Initialize default storage values for orders, routes, vehicles
export const initializeDefaultStorage = () => {
    try {
        if (getFromStorage('route_orders') === null) {
            saveToStorage('route_orders', []);
        }

        if (getFromStorage('route_routes') === null) {
            saveToStorage('route_routes', []);
        }

        if (getFromStorage('route_vehicles') === null) {
            saveToStorage('route_vehicles', []);
        }

        if (getFromStorage('route_user') === null) {
            saveToStorage('route_user', null);
        }

    } catch (error) {
        console.error('Error initializing default storage', error);
    }
};
