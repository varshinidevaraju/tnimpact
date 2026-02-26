import React, { useState } from 'react';
import './DriverManagement.css';
import Dashboard from './Dashboard';
import { optimizeRoute } from '../logic/routeOptimizer';

const mockDrivers = [
    { id: 'DRV-001', name: 'Alex Johnson', status: 'On Route', vehicle: 'Van L-10', rating: 4.8, completedToday: 12, phone: '+1 234 567 8900', avatar: 'AJ' },
    { id: 'DRV-002', name: 'Maria Garcia', status: 'Idle', vehicle: 'Truck H-04', rating: 4.9, completedToday: 0, phone: '+1 234 567 8901', avatar: 'MG' },
    { id: 'DRV-003', name: 'David Smith', status: 'Offline', vehicle: 'Van L-12', rating: 4.6, completedToday: 8, phone: '+1 234 567 8902', avatar: 'DS' },
    { id: 'DRV-004', name: 'Sarah Williams', status: 'On Route', vehicle: 'Truck H-02', rating: 5.0, completedToday: 24, phone: '+1 234 567 8903', avatar: 'SW' },
];

const DriverManagementIcons = {
    Search: () => (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    ),
    Star: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#ffc107" stroke="#ffc107" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    ),
    Phone: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.27-2.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
    ),
    Map: () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
            <line x1="8" y1="2" x2="8" y2="18" />
            <line x1="16" y1="6" x2="16" y2="22" />
        </svg>
    )
};

const DriverManagement = ({ orders, route, setRoute, optimizedOrders, onAddOrder, onDeleteOrder }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDriver, setSelectedDriver] = useState(null);


    const filteredDrivers = mockDrivers.filter(driver =>
        driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusClass = (status) => {
        switch (status) {
            case 'On Route': return 'status-active';
            case 'Idle': return 'status-idle';
            default: return 'status-offline';
        }
    };

    if (selectedDriver) {
        // Filter orders specific to this driver
        const driverOrders = orders.filter(o => o.driverId === selectedDriver.id);

        // Calculate the optimized route uniquely for this driver's orders
        const pendingDriverOrders = driverOrders.filter(o => o.status === 'Pending');
        const driverOptimizedOrders = optimizeRoute({ lat: 0, lng: 0 }, pendingDriverOrders).orderedRoute;

        return (
            <div className="driver-management-container" style={{ paddingBottom: '2rem' }}>
                <div className="dm-header" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <button
                        className="back-btn"
                        onClick={() => setSelectedDriver(null)}
                        style={{ padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid #d0d5dd', background: '#fff', cursor: 'pointer', fontWeight: '500' }}
                    >
                        ← Back to Fleet
                    </button>
                    <div className="driver-info-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div className="driver-avatar" style={{ width: '40px', height: '40px' }}>{selectedDriver.avatar}</div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{selectedDriver.name}'s Route</h2>
                            <p style={{ margin: 0, color: '#667085', fontSize: '0.85rem' }}>Managing active assignments for {selectedDriver.id} ({selectedDriver.vehicle})</p>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '2rem' }}>
                    <Dashboard
                        orders={driverOrders}
                        route={route}
                        setRoute={setRoute}
                        optimizedOrders={driverOptimizedOrders}
                        onAddOrder={(newOrder) => onAddOrder({ ...newOrder, driverId: selectedDriver.id })}
                        onDeleteOrder={onDeleteOrder}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="driver-management-container">
            <div className="dm-header">
                <div className="dm-title-section">
                    <h2>Driver Fleet</h2>
                    <p>Manage and track your active delivery personnel</p>
                </div>
                <div className="dm-actions">
                    <div className="search-bar">
                        <span className="search-icon"><DriverManagementIcons.Search /></span>
                        <input
                            type="text"
                            placeholder="Search by name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="add-driver-btn">+ Add New Driver</button>
                </div>
            </div>

            <div className="drivers-grid">
                {filteredDrivers.map(driver => (
                    <div className="driver-card" key={driver.id}>
                        <div className="driver-card-header">
                            <div className="driver-avatar">{driver.avatar}</div>
                            <div className="driver-info">
                                <h3>{driver.name}</h3>
                                <span className="driver-id">{driver.id}</span>
                            </div>
                            <div className={`status-badge ${getStatusClass(driver.status)}`}>
                                <span className="status-dot"></span>
                                {driver.status}
                            </div>
                        </div>

                        <div className="driver-stats">
                            <div className="d-stat">
                                <span className="d-label">Vehicle</span>
                                <span className="d-value">{driver.vehicle}</span>
                            </div>
                            <div className="d-stat">
                                <span className="d-label">Rating</span>
                                <span className="d-value"><DriverManagementIcons.Star /> {driver.rating}</span>
                            </div>
                            <div className="d-stat">
                                <span className="d-label">Completed</span>
                                <span className="d-value">{driver.completedToday}</span>
                            </div>
                        </div>

                        <div className="driver-actions">
                            <button
                                className="contact-btn"
                                onClick={() => window.location.href = `tel:${driver.phone}`}
                            >
                                <DriverManagementIcons.Phone /> Contact
                            </button>
                            <button
                                className="assign-btn"
                                onClick={() => setSelectedDriver(driver)}
                            >
                                <DriverManagementIcons.Map /> Manage Route
                            </button>
                        </div>
                    </div>
                ))}

                {filteredDrivers.length === 0 && (
                    <div className="no-drivers-found">
                        <p>No drivers found matching "{searchTerm}"</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DriverManagement;
