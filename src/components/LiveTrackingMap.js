import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { fetchStreetRoute } from '../logic/streetRouting';
import './LiveTrackingMap.css';

// Fix for default marker icons in Vite/React environment
const DefaultIcon = L.icon({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom futuristic glowing moving vehicle icon
const vehicleIcon = new L.DivIcon({
    className: 'custom-nav-icon',
    html: `
        <div style="width: 40px; height: 40px; display:flex; align-items:center; justify-content:center; filter: drop-shadow(0 0 10px #00f2fe);">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 4L28 28L16 22L4 28L16 4Z" fill="#00f2fe" stroke="#ffffff" stroke-width="2"/>
            </svg>
        </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
});

// Custom Glowing Stop Marker with Label
const createGlowingStopIcon = (number) => new L.DivIcon({
    className: 'custom-glowing-stop',
    html: `
        <div class="glowing-stop-wrapper">
            <div class="pulse-ring"></div>
            <div class="stop-core"></div>
            <div class="stop-label">Stop ${number}</div>
        </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
});

const MapController = ({ position, isNavigating, allCoords }) => {
    const map = useMap();
    useEffect(() => {
        if (!allCoords || allCoords.length === 0) return;

        const timer = setTimeout(() => {
            map.invalidateSize();
            if (isNavigating) {
                if (position) {
                    map.setView(position, 17, { animate: true, duration: 0.5 });
                }
            } else {
                // Overview Mode: Fit all stops
                const bounds = L.latLngBounds(allCoords);
                map.fitBounds(bounds, {
                    padding: [100, 100], // Generous padding for labels
                    maxZoom: 14,
                    animate: true
                });
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [position, isNavigating, JSON.stringify(allCoords), map]);

    return null;
};

const LiveTrackingMap = ({ routeCoordinates = [], isNavigating = false, onNavUpdate }) => {
    // Safety Filter: Ensure we only pass valid numeric pairs
    const validCoords = (routeCoordinates || []).filter(c =>
        Array.isArray(c) &&
        c.length >= 2 &&
        typeof c[0] === 'number' && !isNaN(c[0]) &&
        typeof c[1] === 'number' && !isNaN(c[1])
    );

    const [currentIndex, setCurrentIndex] = useState(0);
    const [vehiclePos, setVehiclePos] = useState(validCoords[0] || [13.0827, 80.2707]);
    const [heading, setHeading] = useState(0);
    const [streetPath, setStreetPath] = useState([]);
    const [navSteps, setNavSteps] = useState([]);

    useEffect(() => {
        if (!validCoords || validCoords.length === 0) return;

        setCurrentIndex(0);
        setVehiclePos(validCoords[0]);

        const getStreetPath = async () => {
            const coords = validCoords.map(stop => [stop[0], stop[1]]);
            const result = await fetchStreetRoute(coords);
            setStreetPath(result.path || validCoords);
            setNavSteps(result.steps || []);
        };
        getStreetPath();
    }, [JSON.stringify(validCoords)]);

    // Simulate smoother movement along the actual street geometry
    useEffect(() => {
        const pathArray = streetPath.length > 0 ? streetPath : validCoords;
        if (pathArray.length === 0) return;

        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % pathArray.length);
        }, streetPath.length > 0 ? 800 : 2000); // 800ms updates for smooth dense street paths

        return () => clearInterval(interval);
    }, [streetPath, validCoords]);

    // Handle physics and side effects of index changes safely
    useEffect(() => {
        const pathArray = streetPath.length > 0 ? streetPath : validCoords;
        if (pathArray.length === 0) return;

        const newPos = pathArray[currentIndex];
        const prevIndex = currentIndex === 0 ? pathArray.length - 1 : currentIndex - 1;
        const currentPos = pathArray[prevIndex];

        // Calculate Heading (angle) for realistic marker rotation
        if (currentPos && newPos) {
            const lat1 = currentPos[0] * (Math.PI / 180);
            const lng1 = currentPos[1] * (Math.PI / 180);
            const lat2 = newPos[0] * (Math.PI / 180);
            const lng2 = newPos[1] * (Math.PI / 180);

            const dLng = lng2 - lng1;
            const y = Math.sin(dLng) * Math.cos(lat2);
            const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
            const angle = (Math.atan2(y, x) * (180 / Math.PI) + 360) % 360;
            setHeading(angle);
        }

        setVehiclePos(newPos);

        // Emulate turn-by-turn finding
        if (onNavUpdate && navSteps.length > 0) {
            // Just pass a mock or nearby instruction for visual effect
            const stepIndex = Math.floor((currentIndex / pathArray.length) * navSteps.length);
            const currentStep = navSteps[stepIndex] || navSteps[navSteps.length - 1];
            if (currentStep) {
                onNavUpdate({ instruction: currentStep.instruction, distance: currentStep.distance });
            }
        }
    }, [currentIndex, streetPath, validCoords, navSteps, onNavUpdate]);

    if (validCoords.length === 0) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>No valid GPS coordinates for tracking.</div>;
    }

    // Dynamic Navigation Icon (Blue Chevron for nav mode, truck for overview)
    const dynamicIcon = isNavigating ? L.divIcon({
        className: 'custom-nav-icon',
        html: `<div style="transform: rotate(${heading}deg); width: 40px; height: 40px; display:flex; align-items:center; justify-content:center; drop-shadow(0 2px 4px rgba(0,0,0,0.2));">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16 2L30 30L16 23.5L2 30L16 2Z" fill="#101828" stroke="white" stroke-width="1.5"/>
                  </svg>
               </div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
    }) : vehicleIcon;

    return (
        <div className={`tracking-map-container ${isNavigating ? 'navigating-3d' : ''}`}>
            {/* Visual Status Overlay */}
            {!isNavigating && (
                <div className="tracking-overlay">
                    <div className="tracking-status">
                        <div className="blink"></div>
                        <span>GPS ACTIVE</span>
                    </div>
                </div>
            )}

            <MapContainer
                center={vehiclePos}
                zoom={14}
                scrollWheelZoom={true}
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                <MapController position={vehiclePos} isNavigating={isNavigating} allCoords={validCoords} />

                <Polyline
                    positions={streetPath.length > 0 ? streetPath : validCoords}
                    pathOptions={{ color: '#000000', weight: 5, opacity: 1, lineCap: 'round', lineJoin: 'round' }}
                />

                {/* Destination Markers */}
                {validCoords.map((stop, i) => (
                    <Marker key={i} position={stop} icon={createGlowingStopIcon(i + 1)}>
                        <Popup className="futuristic-popup">
                            <div className="stop-popup">
                                <strong>Stop #{i + 1}</strong>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Actual Vehicle/Chevron Position */}
                <Marker position={vehiclePos} icon={dynamicIcon}>
                    <Popup>Current Location Simulator</Popup>
                </Marker>
            </MapContainer>
        </div>
    );
};

export default LiveTrackingMap;
