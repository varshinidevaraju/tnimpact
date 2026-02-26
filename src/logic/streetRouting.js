/**
 * Street Routing Utility using OSRM (Open Source Routing Machine)
 * This turns straight lines into real street paths just like Google Maps.
 */

/**
 * Fetches street-level geometry for a sequence of stops.
 * @param {Array} coordinates - Array of [lat, lng] pairs
 * @returns {Promise<Array>} - Array of [lat, lng] pairs representing the street path
 */
export const fetchStreetRoute = async (coordinates) => {
    if (!coordinates || coordinates.length < 2) return coordinates;

    try {
        // Convert to OSRM format: lng,lat;lng,lat
        const locString = coordinates
            .map(coord => `${coord[1]},${coord[0]}`)
            .join(';');

        const response = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${locString}?overview=full&geometries=geojson&steps=true`
        );

        const data = await response.json();

        if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
            console.warn('OSRM Route failed, falling back to straight lines:', data.code);
            return { path: coordinates, steps: [] };
        }

        // Extract geometry from GeoJSON (OSRM returns [lng, lat], we need [lat, lng])
        const streetCoords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);

        // Extract turn-by-turn steps
        const steps = [];
        if (data.routes[0].legs) {
            data.routes[0].legs.forEach(leg => {
                if (leg.steps) {
                    leg.steps.forEach(step => {
                        if (step.maneuver && step.maneuver.type !== "arrive") {
                            steps.push({
                                instruction: `${step.maneuver.type} ${step.maneuver.modifier ? step.maneuver.modifier : ''} ${step.name ? 'onto ' + step.name : ''}`,
                                distance: step.distance,
                                location: [step.maneuver.location[1], step.maneuver.location[0]], // [lat, lng]
                            });
                        }
                    });
                }
            });
        }

        return { path: streetCoords, steps };
    } catch (error) {
        console.error('Error fetching street route:', error);
        return { path: coordinates, steps: [] }; // Fallback to straight lines on error
    }
};

/**
 * Fetches Distance and Duration for a route
 */
export const fetchRouteMetadata = async (coordinates) => {
    if (!coordinates || coordinates.length < 2) return { distance: 0, duration: 0 };

    try {
        const locString = coordinates
            .map(coord => `${coord[1]},${coord[0]}`)
            .join(';');

        const response = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${locString}?overview=false`
        );

        const data = await response.json();

        if (data.code !== 'Ok') return { distance: 0, duration: 0 };

        return {
            distance: (data.routes[0].distance / 1000).toFixed(2), // KM
            duration: Math.round(data.routes[0].duration / 60) // Minutes
        };
    } catch (error) {
        return { distance: 0, duration: 0 };
    }
};
