import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './MapView.css';

// Fix for default marker icons not showing in React-Leaflet
// This is a common beginner pitfall that we're handling here
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapView = ({ centerLat = 13.0827, centerLng = 80.2707, warehouseName = "Central Warehouse" }) => {
    const position = [centerLat, centerLng];

    return (
        <div className="map-container">
            <MapContainer center={position} zoom={13} scrollWheelZoom={false}>
                {/* The TileLayer is the background map (using OpenStreetMap) */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* The Marker shows a specific point on the map */}
                <Marker position={position}>
                    <Popup>
                        <div className="warehouse-label">
                            <strong>{warehouseName}</strong><br />
                            Dispatch point
                        </div>
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
};

export default MapView;
