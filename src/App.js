import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import DriverView from './components/DriverView';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import { mockOrders } from './data/mockOrders';
import { initializeDefaultStorage } from "./utils/storage";
import { optimizeRoute, optimizeWithPersistentHistory } from './logic/routeOptimizer';
import { calculateFuelConsumption, calculateCarbonFootprint } from './logic/fuelCalculator';
import { saveToStorage, getFromStorage } from './utils/storage';
import { getCurrentTrafficZone, getTrafficMultiplier } from "./data/trafficData";
import './index.css';

function App() {
    const [user, setUser] = useState(null); // { email, role }
    const [orders, setOrders] = useState([]);
    const [route, setRoute] = useState([]);
    const [currentStopIndex, setCurrentStopIndex] = useState(0);
    const [routeStatus, setRouteStatus] = useState('On Time');
    const [delayMinutes, setDelayMinutes] = useState(0);
    const [stats, setStats] = useState({ fuel: 0, carbon: 0 });

    useEffect(() => {
        const savedUser = getFromStorage('route_user');
        if (savedUser) setUser(savedUser);

        const savedOrders = getFromStorage('route_orders');
        if (savedOrders && savedOrders.length > 0) {
            setOrders(savedOrders);
        } else {
            setOrders(mockOrders);
        }

        // Load route and progress from localStorage
        const savedRoute = getFromStorage('route_active');
        if (savedRoute) setRoute(savedRoute);

        const savedIndex = getFromStorage('route_index');
        if (savedIndex !== null) setCurrentStopIndex(Number(savedIndex));

        const savedStatus = getFromStorage('route_status');
        if (savedStatus) setRouteStatus(savedStatus);
    }, []);

    useEffect(() => {
        initializeDefaultStorage();
    }, []);

    useEffect(() => {
        if (user) saveToStorage('route_user', user);
        saveToStorage('route_orders', orders);
        saveToStorage('route_active', route);
        saveToStorage('route_index', currentStopIndex);
        saveToStorage('route_status', routeStatus);

        // Update stats
        const safeOrders = Array.isArray(orders) ? orders : [];
        const totalWeight = safeOrders.reduce((sum, o) => sum + (o?.weight || 0), 0);
        const estDistance = safeOrders.length * 5;

        // Defensive traffic data acquisition
        const currentZone = getCurrentTrafficZone() || "low";
        const trafficMultiplier = getTrafficMultiplier(currentZone) || 1.0;

        // Corrected parameters to match fuelCalculator.js signature: (totalDistance, trafficFactor, vehicleConsumptionRate)
        // Using a standard rate of 0.15 L/km as defined in routeOptimizer.js
        const baseFuel = calculateFuelConsumption(estDistance, 1.0, 0.15) || 0;
        const fuel = baseFuel * trafficMultiplier;

        const carbon = calculateCarbonFootprint(fuel) || 0;
        setStats({
            fuel: (fuel || 0).toFixed(2),
            carbon: (carbon || 0).toFixed(2)
        });
    }, [orders, user, route, currentStopIndex, routeStatus]);

    const optimizationResult = optimizeRoute({ lat: 0, lng: 0 }, orders.filter(o => o.status === 'Pending'));
    const optimizedOrders = optimizationResult.orderedRoute;

    const handleLogin = (userData) => {
        setUser(userData);
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('route_user');
    };

    const handleAddOrder = (newOrder) => {
        setOrders([...orders, newOrder]);
    };

    const handleCompleteOrder = (id) => {
        setOrders(orders.map(o => o.id === id ? { ...o, status: 'Completed' } : o));
    };

    const handleRecalculateRoute = () => {
        console.log("Recalculating route based on current conditions...");

        // Simulating current location for the optimizer
        const currentLoc = { lat: 0, lng: 0 };

        // Important: We only optimize the REMAINING stops
        const updatedRoute = optimizeWithPersistentHistory(
            currentLoc,
            route,
            currentStopIndex,
            0.15,
            delayMinutes
        );

        setRoute(updatedRoute);
    };

    const toggleRole = () => {
        const newRole = user.role === 'admin' ? 'driver' : 'admin';
        setUser({ ...user, role: newRole });
    };

    if (!user) {
        return <LoginPage onLogin={handleLogin} />;
    }

    // Common toggle component for development
    const RoleToggle = () => (
        <button className="dev-role-toggle" onClick={toggleRole}>
            Switch to {user.role === 'admin' ? 'Driver' : 'Admin'} Mode
        </button>
    );

    if (user.role === 'admin') {
        return (
            <>
                <AdminPage
                    orders={orders}
                    setOrders={setOrders}
                    route={route}
                    setRoute={setRoute}
                    currentStopIndex={currentStopIndex}
                    setCurrentStopIndex={setCurrentStopIndex}
                    routeStatus={routeStatus}
                    setRouteStatus={setRouteStatus}
                    delayMinutes={delayMinutes}
                    optimizedOrders={optimizedOrders}
                    onAddOrder={handleAddOrder}
                    onLogout={handleLogout}
                />
                <RoleToggle />
            </>
        );
    }

    return (
        <div className="app-container">
            <RoleToggle />
            <header className="app-header">
                <div className="logo">
                    <span className="logo-icon">🚚</span>
                    <h1>RouteOptima <span className="view-tag">Driver</span></h1>
                </div>
                <button className="logout-inline" onClick={handleLogout}>Logout</button>
            </header>

            <div className="stats-bar">
                <div className="stat">
                    <span className="stat-label">Active Stops</span>
                    <span className="stat-value">{optimizedOrders.length}</span>
                </div>
                <div className="stat border-left">
                    <span className="stat-label">Truck Load</span>
                    <span className="stat-value">{orders.filter(o => o.status === 'Pending').reduce((s, o) => s + o.weight, 0)} kg</span>
                </div>
            </div>

            <main className="content">
                <DriverView
                    orders={orders}
                    setOrders={setOrders}
                    route={route}
                    setRoute={setRoute}
                    currentStopIndex={currentStopIndex}
                    setCurrentStopIndex={setCurrentStopIndex}
                    routeStatus={routeStatus}
                    setRouteStatus={setRouteStatus}
                    delayMinutes={delayMinutes}
                    setDelayMinutes={setDelayMinutes}
                    recalculateRoute={handleRecalculateRoute}
                    currentOrder={optimizedOrders[currentStopIndex]}
                    onComplete={handleCompleteOrder}
                />
            </main>

            <footer className="app-footer">
                <p>© 2026 RouteOptima - Logged in as {user.email}</p>
            </footer>
        </div>
    );
}

export default App;
