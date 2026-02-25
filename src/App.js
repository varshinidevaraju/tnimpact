import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import DriverView from './components/DriverView';
import { mockOrders } from './data/mockOrders';
import { optimizeRoute } from './logic/optimizer';
import { calculateFuelConsumption, calculateCarbonFootprint } from './logic/fuelCalculator';
import { saveToStorage, getFromStorage } from './utils/storage';
import './index.css';

function App() {
    const [orders, setOrders] = useState([]);
    const [view, setView] = useState('admin'); // 'admin' or 'driver'
    const [stats, setStats] = useState({ fuel: 0, carbon: 0 });

    useEffect(() => {
        const saved = getFromStorage('route_orders');
        if (saved && saved.length > 0) {
            setOrders(saved);
        } else {
            setOrders(mockOrders);
        }
    }, []);

    useEffect(() => {
        saveToStorage('route_orders', orders);

        // Update stats
        const totalWeight = orders.reduce((sum, o) => sum + o.weight, 0);
        const estDistance = orders.length * 5; // Simulating 5km per stop
        const fuel = calculateFuelConsumption(estDistance, totalWeight);
        const carbon = calculateCarbonFootprint(fuel);
        setStats({ fuel: fuel.toFixed(2), carbon: carbon.toFixed(2) });
    }, [orders]);

    const optimizedOrders = optimizeRoute(orders.filter(o => o.status === 'Pending'), {});

    const handleAddOrder = (newOrder) => {
        setOrders([...orders, newOrder]);
    };

    const handleCompleteOrder = (id) => {
        setOrders(orders.map(o => o.id === id ? { ...o, status: 'Completed' } : o));
    };

    return (
        <div className="app-container">
            <header className="app-header">
                <div className="logo">
                    <span className="logo-icon">🚚</span>
                    <h1>RouteOptima</h1>
                </div>
                <nav className="view-switcher">
                    <button
                        className={view === 'admin' ? 'active' : ''}
                        onClick={() => setView('admin')}
                    >
                        Logistics Dashboard
                    </button>
                    <button
                        className={view === 'driver' ? 'active' : ''}
                        onClick={() => setView('driver')}
                    >
                        Driver App
                    </button>
                </nav>
            </header>

            <div className="stats-bar">
                <div className="stat">
                    <span className="stat-label">Est. Fuel</span>
                    <span className="stat-value">{stats.fuel} L</span>
                </div>
                <div className="stat border-left">
                    <span className="stat-label">CO2 Impact</span>
                    <span className="stat-value">{stats.carbon} kg</span>
                </div>
            </div>

            <main className="content">
                {view === 'admin' ? (
                    <Dashboard
                        orders={orders}
                        optimizedOrders={optimizedOrders}
                        onAddOrder={handleAddOrder}
                    />
                ) : (
                    <DriverView
                        currentOrder={optimizedOrders[0]}
                        onComplete={handleCompleteOrder}
                    />
                )}
            </main>

            <footer className="app-footer">
                <p>© 2026 RouteOptima AI - Intelligent Logistics</p>
            </footer>
        </div>
    );
}

export default App;
