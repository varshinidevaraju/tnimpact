import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { fetchStreetRoute } from '../logic/streetRouting';
import './RouteMap.css';

// Helper component to handle map movement without re-mounting the whole MapContainer
const MapController = ({ coords }) => {
    const map = useMap();

    React.useEffect(() => {
        if (!coords || coords.length === 0) return;

        // Use a timeout to ensure container dimensions are final
        const timer = setTimeout(() => {
            map.invalidateSize();

            if (coords.length === 1) {
                map.setView(coords[0], 14, { animate: true });
            } else {
                const bounds = L.latLngBounds(coords);
                map.fitBounds(bounds, {
                    padding: [50, 50], // Standard uniform padding
                    maxZoom: 14,
                    animate: true
                });
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [JSON.stringify(coords), map]);

    return null;
};

const createAddressLabelIcon = (number, label, isSpecial = false) => new L.DivIcon({
    className: 'address-label-marker',
    html: `
        <div class="map-label-wrapper ${isSpecial ? 'special-label' : ''}">
            <span class="label-number">${number}</span>
            <span class="label-text">${label}</span>
        </div>
    `,
    iconSize: [120, 35],
    iconAnchor: [60, 35]
});

const RouteMap = ({ stops = [], unassignedOrders = [] }) => {
    // Safety Filter: Ensure we only pass valid numeric pairs to Leaflet
    const validStops = (stops || []).filter(o =>
        o && typeof o.lat === 'number' && typeof o.lng === 'number'
    );

    // Filter unassigned orders that aren't already in the sequence
    const stopIds = new Set(validStops.map(s => s.id));
    const extraPins = (unassignedOrders || []).filter(o =>
        o && typeof o.lat === 'number' && typeof o.lng === 'number' && !stopIds.has(o.id) && o.status === 'Pending'
    );

    const validCoords = validStops.map(o => [o.lat, o.lng]);
    const allCoords = [...validCoords, ...extraPins.map(p => [p.lat, p.lng])];

    const [fleetPaths, setFleetPaths] = React.useState({});

    const getFleetColor = (driverId) => {
        if (!driverId || driverId === 'unassigned') return '#667085'; // Default gray for unassigned
        // Distinct, vibrant colors for the active fleet
        const colors = [
            '#2e90fa', // Azure Blue
            '#f79009', // Deep Orange
            '#12b76a', // Emerald Green
            '#ee46bc', // Hot Pink
            '#7a5af8', // Royal Purple
            '#f04438', // Scarlet Red
            '#00d5ff', // Cyber Cyan
            '#9b2c2c', // Maroon
            '#4a5568'  // Charcoal
        ];
        const hash = String(driverId).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
    };

    React.useEffect(() => {
        if (validStops.length === 0) {
            setFleetPaths({});
            return;
        }

        const fetchPaths = async () => {
            const groups = {};
            validStops.forEach(s => {
                const fid = s.driverId || 'unassigned';
                if (!groups[fid]) groups[fid] = [];
                groups[fid].push([s.lat, s.lng]);
            });

            const newPaths = {};
            for (const fid in groups) {
                if (groups[fid].length >= 2) {
                    const result = await fetchStreetRoute(groups[fid]);
                    newPaths[fid] = result.path;
                } else {
                    newPaths[fid] = groups[fid];
                }
            }
            setFleetPaths(newPaths);
        };
        fetchPaths();
    }, [JSON.stringify(validStops)]);

    if (validStops.length === 0 && extraPins.length === 0) {
        return <div className="route-map-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Valid Route Data Available</div>;
    }

    const centerPosition = allCoords.length > 0 ? allCoords[0] : [13.0827, 80.2707];

    return (
        <div className="route-map-wrapper">
            <MapContainer
                center={centerPosition}
                zoom={13}
                scrollWheelZoom={true}
                zoomControl={false}
                style={{ height: '100%', width: '100%' }}
            >
                <MapController coords={allCoords} />

                {/* Grayscale CartoDB Positron for the monochromatic look */}
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
                />

                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
                    opacity={0.6}
                />

                {Object.entries(fleetPaths).map(([fid, path]) => (
                    <Polyline
                        key={`path-${fid}`}
                        positions={path}
                        pathOptions={{
                            color: getFleetColor(fid),
                            weight: 5,
                            opacity: 0.8,
                            lineCap: 'round',
                            lineJoin: 'round',
                            dashArray: fid === 'unassigned' ? '10, 10' : null
                        }}
                    />
                ))}

                {/* Draw unassigned orders as subtle pins */}
                {extraPins.map((pin) => (
                    <Marker
                        key={`pin-${pin.id}`}
                        position={[pin.lat, pin.lng]}
                        icon={new L.DivIcon({
                            className: 'unassigned-pin',
                            html: `<div class="pin-dot"></div>`,
                            iconSize: [12, 12],
                            iconAnchor: [6, 6]
                        })}
                    >
                        <Popup>
                            <strong>{pin.customer}</strong><br />
                            Status: Pending (Unoptimized)
                        </Popup>
                    </Marker>
                ))}

                {/* Draw custom address labels for route stops */}
                {validStops.map((stop, index) => (
                    <Marker
                        key={`${stop.id}-${index}`}
                        position={[stop.lat, stop.lng]}
                        icon={createAddressLabelIcon(
                            index + 1,
                            stop.customer || `Stop ${index + 1}`,
                            index === 0 || index === validStops.length - 1
                        )}
                    />
                ))}
            </MapContainer>
        </div>
    );
};

export default RouteMap;
