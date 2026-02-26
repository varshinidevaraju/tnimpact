import React, { useEffect, useState } from 'react';
import './PremiumStats.css';
import { fetchRouteMetadata } from '../logic/streetRouting';

// Black SVG Icons for Stats
const Icons = {
    Package: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.29 7 12 12 20.71 7" />
            <line x1="12" y1="22" x2="12" y2="12" />
        </svg>
    ),
    Marker: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
        </svg>
    ),
    CheckCircle: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    ),
    Route: () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 18l5-5-5-5" />
            <path d="M6 18V6" />
            <path d="M6 12h12" />
        </svg>
    )
};

const StatCard = ({ title, value, unit, icon, colorClass, trend, onClick, compact }) => {
    return (
        <div
            className={`premium-stat-card ${colorClass} ${onClick ? 'clickable' : ''} ${compact ? 'compact-stat' : ''}`}
            onClick={onClick}
            style={onClick ? { cursor: 'pointer' } : {}}
        >
            <div className="stat-icon-wrapper">
                <span className="stat-icon">{icon}</span>
            </div>
            <div className="stat-details">
                <h4 className="stat-title">{title}</h4>
                <div className="stat-value-row">
                    <span className="stat-value">
                        {String(value || 0)}
                    </span>
                    <span className="stat-unit">{unit}</span>
                </div>
                {trend && (
                    <div className="stat-trend">
                        <span className="trend-arrow">▲</span>
                        <span className="trend-value">{trend}</span>
                    </div>
                )}
            </div>
            <div className="card-glow" />
        </div>
    );
};

const PremiumStats = ({ orders, route, onActiveOrdersClick, onRouteStopsClick, onCompletedOrdersClick, compact, vertical }) => {
    const activeOrders = orders.filter(o => o.status === 'Pending').length;
    const completedOrders = orders.filter(o => o.status === 'Completed').length;
    const totalStops = route.length;

    const [realDistance, setRealDistance] = useState("0.0");

    useEffect(() => {
        const getDistanceData = async () => {
            if (route && route.length > 1) {
                try {
                    // OSRM requires coordinates in [lat, lng] arrays
                    const coords = route.map(p => [p.lat, p.lng]);
                    const metadata = await fetchRouteMetadata(coords);

                    if (metadata && metadata.distance > 0) {
                        setRealDistance(metadata.distance);
                        return;
                    }
                } catch (e) {
                    console.warn("OSRM distance fetch failed, falling back to geodetic");
                }

                // Fallback: Accurate Geodetic Distance Calculation (Haversine Formula)
                const calculateDistance = (p1, p2) => {
                    const R = 6371; // Earth's radius in km
                    const dLat = (p2.lat - p1.lat) * (Math.PI / 180);
                    const dLon = (p2.lng - p1.lng) * (Math.PI / 180);
                    const a =
                        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                        Math.cos(p1.lat * (Math.PI / 180)) * Math.cos(p2.lat * (Math.PI / 180)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
                    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                    return R * c;
                };

                let totalDistKm = 0;
                for (let i = 0; i < route.length - 1; i++) {
                    totalDistKm += calculateDistance(route[i], route[i + 1]);
                }
                // Multiply spherical distance by 1.41 to approximate urban road network routing constraints
                setRealDistance((totalDistKm * 1.41).toFixed(1));
            } else {
                setRealDistance("0.0");
            }
        };

        getDistanceData();
    }, [route]);

    return (
        <div className={`premium-stats-container ${compact ? 'compact-grid' : ''} ${vertical ? 'vertical-stack' : ''}`}>
            <StatCard
                title="Active Orders"
                value={activeOrders}
                unit="Deliveries"
                icon={<Icons.Package />}
                colorClass="stat-blue"
                trend="12% vs last hr"
                onClick={onActiveOrdersClick}
                compact={compact}
            />
            <StatCard
                title="Route Stops"
                value={totalStops}
                unit="Points"
                icon={<Icons.Marker />}
                colorClass="stat-purple"
                trend="Optimized"
                onClick={onRouteStopsClick}
                compact={compact}
            />
            <StatCard
                title="Completed"
                value={completedOrders}
                unit="Today"
                icon={<Icons.CheckCircle />}
                colorClass="stat-green"
                onClick={onCompletedOrdersClick}
                compact={compact}
            />
            <StatCard
                title="Est. Distance"
                value={realDistance}
                unit="km"
                icon={<Icons.Route />}
                colorClass="stat-orange"
                compact={compact}
            />
        </div>
    );
};

export default PremiumStats;
