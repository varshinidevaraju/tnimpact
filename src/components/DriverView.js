import React, { useState } from 'react';
import './DriverView.css';

const DriverView = ({
    route = [],
    currentStopIndex,
    setCurrentStopIndex,
    routeStatus,
    setRouteStatus,
    delayMinutes,
    setDelayMinutes,
    recalculateRoute
}) => {
    const [fuel, setFuel] = useState(100);
    const [isLoading, setIsLoading] = useState(false);

    const currentStop = route[currentStopIndex];
    const nextStop = route[currentStopIndex + 1];

    // Progress calculation based on the global route array
    const progress = route.length > 0 ? Math.round(((currentStopIndex) / route.length) * 100) : 0;

    const handleReportDelay = () => {
        setIsLoading(true);

        // 1. Add 10 minutes delay
        setDelayMinutes(prev => prev + 10);

        // 2. Change routeStatus to "Delayed"
        setRouteStatus('Delayed');

        // 3. Trigger route recalculation
        recalculateRoute();

        // 4. Hide spinner after 2 seconds
        setTimeout(() => {
            setIsLoading(false);
        }, 2000);
    };

    // Check if we have reached the end of the route
    const isFinished = route.length > 0 && currentStopIndex >= route.length;

    const handleComplete = () => {
        if (!isFinished) {
            // Decrease fuel and move to next index globally
            setFuel(prev => Math.max(0, prev - 8));
            setCurrentStopIndex(prev => prev + 1);
        }
    };

    // If there is no route generated yet at all
    if (route.length === 0) {
        return (
            <div className="driver-screen">
                <div className="driver-card empty-state">
                    <span className="empty-icon">⏳</span>
                    <h2>Awaiting Route</h2>
                    <p>Please wait for dispatch to generate your delivery route.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="driver-screen">
            <div className="driver-card">
                {isLoading && (
                    <div className="loader-container">
                        <div className="spinner"></div>
                        <span className="loading-text">Optimizing Route...</span>
                    </div>
                )}
                <span className="offline-status">Offline Mode Active</span>

                {/* Current Stop Section */}
                <header className="stop-section">
                    <span className="label">Current Stop</span>
                    <h1 className="stop-name">
                        {isFinished ? "Route Completed ✅" : currentStop?.customer}
                    </h1>
                    <p className="address">
                        {isFinished ? "All deliveries finished for this shift." : currentStop?.address}
                    </p>
                </header>

                <div className="divider" />

                {/* Next Stop Section */}
                <section className="stop-section">
                    <span className="label">Next Stop</span>
                    <div className="next-stop-info">
                        <h2 className="stop-name">{nextStop ? nextStop.customer : "None (End of Route)"}</h2>
                        <span className="distance">{nextStop ? "Calculating..." : "--"}</span>
                    </div>
                </section>

                {/* Info Grid for ETA and Progress */}
                <div className="info-grid">
                    <div className="info-item">
                        <span className="label">ETA</span>
                        <div className="eta-value">12:40</div>
                        <span className="time-remaining">
                            {delayMinutes > 0 ? `+${delayMinutes}m delay reported` : 'approx. 15 mins'}
                        </span>
                    </div>

                    <div className="info-item">
                        <span className="label">Route Progress</span>
                        <div className="progress-container">
                            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                        </div>
                        <span className="progress-text">{progress}% Tracked</span>
                    </div>

                    <div className="info-item">
                        <span className="label">Fuel Remaining</span>
                        <div className="fuel-display">
                            <span className="fuel-icon">⛽</span>
                            <span className={`fuel-value ${fuel < 20 ? 'low' : ''}`}>{fuel}%</span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="action-footer">
                    <button
                        className={`delay-btn ${routeStatus === 'Delayed' ? 'active' : ''}`}
                        onClick={handleReportDelay}
                        disabled={isFinished}
                    >
                        {routeStatus === 'Delayed' ? '⚠️ Delay Reported' : 'Report Delay'}
                    </button>

                    <button
                        className="complete-btn"
                        onClick={handleComplete}
                        disabled={isFinished}
                        style={isFinished ? { background: '#ccc', boxShadow: 'none', cursor: 'not-allowed' } : {}}
                    >
                        {isFinished ? "Finished" : "Complete Delivery"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DriverView;
