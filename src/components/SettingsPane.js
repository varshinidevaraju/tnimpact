/**
 * USES: System-wide administrative settings.
 * SUPPORT: Configures global parameters such as depot location (Office HQ), service times per stop, and default vehicle consumption rates.
 */
import React, { useState } from 'react';

import './SettingsPane.css';

const SettingsPane = () => {
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('route_settings');
        return saved ? JSON.parse(saved) : {
            algorithm: 'fastest',
            routingProfile: 'car',
            autoDispatch: false,
            liveTracking: true,
            maxStops: 50,
            fuelCost: 1.25,
            serviceTimeMin: 10,
            defaultTimeWindowHours: 4,
            notifications: true,
            darkMode: false,
            officeLat: 13.0827,
            officeLng: 80.2707
        };
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings({
            ...settings,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSave = () => {
        localStorage.setItem('route_settings', JSON.stringify(settings));
        alert("System Configuration Saved Successfully");
        window.location.reload();
    };

    return (
        <div className="settings-pane">
            <div className="settings-section">
                <div className="section-header">
                    <h3>Routing Engine Configuration</h3>
                    <p>Adjust the parameters used by the core optimizer algorithm.</p>
                </div>
                <div className="settings-grid">
                    <div className="setting-item">
                        <label>Optimization Strategy</label>
                        <select name="algorithm" value={settings.algorithm} onChange={handleChange}>
                            <option value="fastest">Fastest Route (Time-Optimized)</option>
                            <option value="shortest">Shortest Route (Distance-Optimized)</option>
                            <option value="balanced">Balanced (Eco-Friendly)</option>
                        </select>
                    </div>
                    <div className="setting-item">
                        <label>Vehicle Profile</label>
                        <select name="routingProfile" value={settings.routingProfile} onChange={handleChange}>
                            <option value="car">Standard Delivery Van</option>
                            <option value="bike">Motorcycle / Scooter</option>
                            <option value="truck">Heavy Truck</option>
                        </select>
                    </div>
                    <div className="setting-item">
                        <label>Max Stops Per Route</label>
                        <input
                            type="number"
                            name="maxStops"
                            value={settings.maxStops}
                            onChange={handleChange}
                            min="1"
                            max="200"
                        />
                    </div>
                    <div className="setting-item">
                        <label>Fuel Cost Multiplier (per km)</label>
                        <input
                            type="number"
                            name="fuelCost"
                            value={settings.fuelCost}
                            onChange={handleChange}
                            step="0.01"
                        />
                    </div>
                    <div className="setting-item">
                        <label>Avg. Service Time (Min)</label>
                        <input
                            type="number"
                            name="serviceTimeMin"
                            value={settings.serviceTimeMin}
                            onChange={handleChange}
                            min="1"
                            max="60"
                        />
                    </div>
                    <div className="setting-item">
                        <label>Default Time Window (Hours)</label>
                        <input
                            type="number"
                            name="defaultTimeWindowHours"
                            value={settings.defaultTimeWindowHours}
                            onChange={handleChange}
                            min="1"
                            max="24"
                        />
                    </div>
                </div>
            </div>

            <div className="settings-section">
                <div className="section-header">
                    <h3>Headquarters Location</h3>
                    <p>Set the default office coordinates for first and last route points.</p>
                </div>
                <div className="settings-grid">
                    <div className="setting-item">
                        <label>Office Latitude</label>
                        <input
                            type="number"
                            name="officeLat"
                            value={settings.officeLat}
                            onChange={(e) => setSettings({ ...settings, officeLat: parseFloat(e.target.value) })}
                            step="0.0001"
                        />
                    </div>
                    <div className="setting-item">
                        <label>Office Longitude</label>
                        <input
                            type="number"
                            name="officeLng"
                            value={settings.officeLng}
                            onChange={(e) => setSettings({ ...settings, officeLng: parseFloat(e.target.value) })}
                            step="0.0001"
                        />
                    </div>
                </div>
            </div>

            <div className="settings-section">
                <div className="section-header">
                    <h3>Platform Operations</h3>
                    <p>Control fleet tracking and automated dispatch behaviors.</p>
                </div>

                <div className="toggle-item">
                    <div className="toggle-info">
                        <span>Automated Dispatch</span>
                        <p>Automatically push optimized routes to driver devices.</p>
                    </div>
                    <label className="switch">
                        <input
                            type="checkbox"
                            name="autoDispatch"
                            checked={settings.autoDispatch}
                            onChange={handleChange}
                        />
                        <span className="slider"></span>
                    </label>
                </div>

                <div className="toggle-item" style={{ borderTop: '1px solid #f5f5f5' }}>
                    <div className="toggle-info">
                        <span>High-Frequency Telemetry</span>
                        <p>Receive GPS updates from drivers every 5 seconds instead of 30.</p>
                    </div>
                    <label className="switch">
                        <input
                            type="checkbox"
                            name="liveTracking"
                            checked={settings.liveTracking}
                            onChange={handleChange}
                        />
                        <span className="slider"></span>
                    </label>
                </div>

                <div className="toggle-item" style={{ borderTop: '1px solid #f5f5f5' }}>
                    <div className="toggle-info">
                        <span>Critical Alerts</span>
                        <p>Receive system notifications for off-route behavior and delays.</p>
                    </div>
                    <label className="switch">
                        <input
                            type="checkbox"
                            name="notifications"
                            checked={settings.notifications}
                            onChange={handleChange}
                        />
                        <span className="slider"></span>
                    </label>
                </div>
            </div>

            <div className="save-settings-bar">
                <p>Unsaved changes to algorithmic parameters</p>
                <button className="save-btn" onClick={handleSave}>
                    APPLY CONFIGURATION
                </button>
            </div>
        </div>
    );
};

export default SettingsPane;
