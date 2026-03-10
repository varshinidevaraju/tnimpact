import React, { useState } from 'react';
import Dashboard from '../components/Dashboard';

const AdminPage = ({ orders, optimizedOrders, onAddOrder, onLogout }) => {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <div className="admin-page">
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <span className="logo-icon">🚚</span>
                    <h3>Control Center</h3>
                </div>
                <nav className="sidebar-nav">
                    <button
                        className={activeTab === 'overview' ? 'active' : ''}
                        onClick={() => setActiveTab('overview')}
                    >
                        📊 Operations Overview
                    </button>
                    <button
                        className={activeTab === 'analytics' ? 'active' : ''}
                        onClick={() => setActiveTab('analytics')}
                    >
                        📈 Fleet Analytics
                    </button>
                    <button
                        className={activeTab === 'drivers' ? 'active' : ''}
                        onClick={() => setActiveTab('drivers')}
                    >
                        👥 Driver Management
                    </button>
                    <button
                        className={activeTab === 'settings' ? 'active' : ''}
                        onClick={() => setActiveTab('settings')}
                    >
                        ⚙️ System Settings
                    </button>
                </nav>
                <button className="logout-btn" onClick={onLogout}>
                    🚪 Sign Out
                </button>
            </aside>

            <main className="admin-main">
                <header className="admin-header">
                    <div className="header-info">
                        <h1>Logistics Dashboard</h1>
                        <p>Managing {orders.length} active orders across the network</p>
                    </div>
                    <div className="header-actions">
                        <span className="live-indicator">LIVE</span>
                        <div className="user-profile">
                            <div className="avatar">AD</div>
                        </div>
                    </div>
                </header>

                <div className="admin-content">
                    {activeTab === 'overview' ? (
                        <Dashboard
                            orders={orders}
                            optimizedOrders={optimizedOrders}
                            onAddOrder={onAddOrder}
                        />
                    ) : (
                        <div className="placeholder-content">
                            <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module</h2>
                            <p>This section is under development for the enterprise version.</p>
                            <div className="skeleton-loader"></div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminPage;
