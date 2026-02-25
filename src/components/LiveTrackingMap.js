import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './LiveTrackingMap.css';

// Fix for default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom vehicle icon
const vehicleIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/819/819873.png', // A simple truck icon
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
});

// Helper component to auto-center the map as the vehicle moves
const RecenterMap = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (position) {
            map.flyTo(position, 14, { duration: 1.5 });
        }
    }, [position, map]);
    return null;
};

const LiveTrackingMap = ({ routeCoordinates = [] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [vehiclePos, setVehiclePos] = useState(routeCoordinates[0] || [11.0168, 76.9558]);

    useEffect(() => {
        // Safety check: Don't do anything if we don't have a route
        if (!routeCoordinates || routeCoordinates.length === 0) return;

        // NEW LOGIC: When the route changes, reset the vehicle to the start of the NEW route
        // This ensures the marker "continues" from the first point of the fresh path
        setCurrentIndex(0);
        setVehiclePos(routeCoordinates[0]);

        // Start the timer for the NEW route
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => {
                const nextIndex = (prevIndex + 1) % routeCoordinates.length;
                setVehiclePos(routeCoordinates[nextIndex]);
                return nextIndex;
            });
        }, 2000);

        // CLEANUP: If the route changes again before 2 seconds, stop this timer immediately
        return () => clearInterval(interval);
    }, [routeCoordinates]); // <--- This dependency array is the "trigger" for the update

    if (!routeCoordinates || routeCoordinates.length === 0) {
        return <div>No route data provided for tracking.</div>;
    }

    return (
        <div className="tracking-map-container">
            {/* Visual Status Overlay */}
            <div className="tracking-overlay">
                <div className="tracking-status">
                    <span className="blink"></span>
                    LIVE TRACKING: {currentIndex + 1} / {routeCoordinates.length}
                </div>
            </div>

            <MapContainer center={vehiclePos} zoom={13}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Existing Route Path */}
                <Polyline positions={routeCoordinates} color="#4c6ef5" weight={3} opacity={0.5} dashArray="10, 10" />

                {/* The MOVING Vehicle Marker */}
                <Marker position={vehiclePos} icon={vehicleIcon}>
                    <Popup>
                        <strong>Truck #104</strong><br />
                        Speed: 45 km/h
                    </Popup>
                </Marker>

                {/* Smoothly recenter the map to follow the vehicle */}
                <RecenterMap position={vehiclePos} />
            </MapContainer>
        </div>
    );
};

export default LiveTrackingMap;
