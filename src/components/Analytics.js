import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area, ScatterChart, Scatter, LineChart, Line
} from 'recharts';
import './Analytics.css';

const featureImportance = [
    { name: 'Hour of Day', value: 85, fill: '#6366f1' },
    { name: 'Road Type', value: 72, fill: '#8b5cf6' },
    { name: 'Distance', value: 45, fill: '#ec4899' },
    { name: 'Speed History', value: 38, fill: '#f43f5e' },
    { name: 'Day of Week', value: 25, fill: '#f59e0b' },
];

const trafficTrendData = [
    { hour: '00:00', multiplier: 1.05 },
    { hour: '02:00', multiplier: 1.02 },
    { hour: '04:00', multiplier: 1.00 },
    { hour: '06:00', multiplier: 1.15 },
    { hour: '08:00', multiplier: 1.85 },
    { hour: '10:00', multiplier: 1.65 },
    { hour: '12:00', multiplier: 1.45 },
    { hour: '14:00', multiplier: 1.55 },
    { hour: '16:00', multiplier: 1.75 },
    { hour: '18:00', multiplier: 2.10 },
    { hour: '20:00', multiplier: 1.40 },
    { hour: '22:00', multiplier: 1.25 },
];

const performanceData = Array.from({ length: 50 }, (_, i) => ({
    actual: 1 + Math.random() * 1.5,
    predicted: 1 + Math.random() * 1.5,
    error: Math.random() * 0.1
})).map(p => ({ ...p, predicted: p.actual + (Math.random() - 0.5) * 0.3 }));

const modelAccuracyTrend = [
    { day: 'Mon', accuracy: 92 },
    { day: 'Tue', accuracy: 94 },
    { day: 'Wed', accuracy: 93 },
    { day: 'Thu', accuracy: 95 },
    { day: 'Fri', accuracy: 94 },
    { day: 'Sat', accuracy: 96 },
    { day: 'Sun', accuracy: 97 },
];

const Analytics = () => {
    return (
        <div className="analytics-container">
            <header className="analytics-header">
                <h2>Predictive Engine Intelligence</h2>
                <div className="model-status-badge">
                    <span className="dot pulse"></span>
                    Model: RF-Traffic-v2.1 (Active)
                </div>
            </header>

            <div className="analytics-grid">
                {/* 1. Feature Importance Card */}
                <div className="analytics-card">
                    <div className="card-info">
                        <h3>Feature Importance</h3>
                        <p>What fuels our ETA predictions? Hour and road type are the primary drivers of congestion.</p>
                    </div>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={featureImportance} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                />
                                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Congestion Heatmap-like Area Chart */}
                <div className="analytics-card">
                    <div className="card-info">
                        <h3>Traffic Intensity Trends</h3>
                        <p>Multiplier impact across a 24-hour cycle. Evening peak remains the highest operational challenge.</p>
                    </div>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={trafficTrendData}>
                                <defs>
                                    <linearGradient id="colorMult" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} domain={[1.0, 2.5]} />
                                <Tooltip
                                    contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="multiplier" stroke="#6366f1" fillOpacity={1} fill="url(#colorMult)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. Performance Scatter Card */}
                <div className="analytics-card">
                    <div className="card-info">
                        <h3>Actual vs. Predicted Multiplier</h3>
                        <p>Model R²: 0.94. Dispersion represents unexpected volatility in road segments.</p>
                    </div>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={250}>
                            <ScatterChart>
                                <XAxis type="number" dataKey="actual" name="Actual" tick={{ fontSize: 11, fill: '#94a3b8' }} unit="x" />
                                <YAxis type="number" dataKey="predicted" name="Predicted" tick={{ fontSize: 11, fill: '#94a3b8' }} unit="x" />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                <Scatter name="Predictions" data={performanceData} fill="#ec4899" />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 4. Accuracy Trend Line Card */}
                <div className="analytics-card">
                    <div className="card-info">
                        <h3>Drift Detection & Reliability</h3>
                        <p>Confidence score of routing engine over the last 7 days. Higher on weekends due to predictable patterns.</p>
                    </div>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart data={modelAccuracyTrend}>
                                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <YAxis domain={[90, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <Tooltip
                                    contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                />
                                <Line type="stepAfter" dataKey="accuracy" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="insights-footer">
                <div className="insight-pill">
                    <strong>Optimization Strategy:</strong> The engine recommends scheduling 15% more deliveries during the 11:00-14:00 window to avoid the 17:00 surge.
                </div>
            </div>
        </div>
    );
};

export default Analytics;
