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

const RouteMap = ({ stops = [] }) => {
    // Safety Filter: Ensure we only pass valid numeric pairs to Leaflet
    const validStops = (stops || []).filter(o =>
        o && typeof o.lat === 'number' && typeof o.lng === 'number'
    );

    const validCoords = validStops.map(o => [o.lat, o.lng]);

    const [streetPath, setStreetPath] = React.useState([]);

    React.useEffect(() => {
        if (!validCoords || validCoords.length < 2) {
            setStreetPath([]);
            return;
        }

        const getPath = async () => {
            const result = await fetchStreetRoute(validCoords);
            setStreetPath(result.path || validCoords);
        };
        getPath();
    }, [JSON.stringify(validCoords)]);

    if (validStops.length === 0) {
        return <div className="route-map-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Valid Route Data Available</div>;
    }

    const centerPosition = [validStops[0].lat, validStops[0].lng];

    return (
        <div className="route-map-wrapper">
            <MapContainer
                center={centerPosition}
                zoom={13}
                scrollWheelZoom={true}
                zoomControl={false}
                style={{ height: '100%', width: '100%' }}
            >
                <MapController coords={validCoords} />

                {/* Grayscale CartoDB Positron for the monochromatic look */}
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
                />

                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
                    opacity={0.6}
                />

                <Polyline
                    positions={streetPath.length > 0 ? streetPath : validCoords}
                    pathOptions={{ color: '#000000', weight: 5, opacity: 0.9, lineCap: 'round', lineJoin: 'round' }}
                />

                {/* Draw custom address labels */}
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
