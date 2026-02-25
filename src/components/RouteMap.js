import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './RouteMap.css';

// Fix for default marker icons (essential for Vite/React)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const RouteMap = ({ coordinates = [] }) => {
    // If no data is provided, show a basic message
    if (!coordinates || coordinates.length === 0) {
        return <div className="route-map-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Route Data Available</div>;
    }

    // Use the first coordinate as the initial map center
    const centerPosition = coordinates[0];

    return (
        <div className="route-map-wrapper">
            <MapContainer
                center={centerPosition}
                zoom={13}
                scrollWheelZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* 1. DRAW THE PATH: Polyline connects the dots */}
                <Polyline
                    positions={coordinates}
                    pathOptions={{ color: '#4c6ef5', weight: 5, opacity: 0.7 }}
                />

                {/* 2. ADD MARKERS: Loop through each coordinate */}
                {coordinates.map((pos, index) => (
                    <Marker key={index} position={pos}>
                        <Popup>
                            <div className="stop-popup">
                                <strong>Stop #{index + 1}</strong><br />
                                {index === 0 ? "Starting Point" : index === coordinates.length - 1 ? "Final Destination" : "Delivery Stop"}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default RouteMap;
