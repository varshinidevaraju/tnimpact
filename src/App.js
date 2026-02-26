import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
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

// Protected Route Component
const ProtectedRoute = ({ children, allowedRole, user }) => {
    if (!user) return <Navigate to="/login" replace />;
    if (allowedRole && user.role !== allowedRole) {
        return <Navigate to={user.role === 'admin' ? '/admin' : '/driver'} replace />;
    }
    return children;
};

function AppContent() {
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [route, setRoute] = useState([]);
    const [currentStopIndex, setCurrentStopIndex] = useState(0);
    const [routeStatus, setRouteStatus] = useState('On Time');
    const [delayMinutes, setDelayMinutes] = useState(0);
    const [stats, setStats] = useState({ fuel: 0, carbon: 0 });
    const navigate = useNavigate();

    useEffect(() => {
        const savedUser = getFromStorage('route_user');
        if (savedUser) setUser(savedUser);

        const savedOrders = getFromStorage('route_orders');
        if (savedOrders && savedOrders.length > 0) {
            setOrders(savedOrders);
        } else {
            setOrders(mockOrders);
        }

        const savedRoute = getFromStorage('route_active');
        if (savedRoute) setRoute(savedRoute);

        const savedIndex = getFromStorage('route_index');
        if (savedIndex !== null) setCurrentStopIndex(Number(savedIndex));

        const savedStatus = getFromStorage('route_status');
        if (savedStatus) setRouteStatus(savedStatus);

        initializeDefaultStorage();
    }, []);

    useEffect(() => {
        if (user) saveToStorage('route_user', user);
        saveToStorage('route_orders', orders);
        saveToStorage('route_active', route);
        saveToStorage('route_index', currentStopIndex);
        saveToStorage('route_status', routeStatus);

        const safeOrders = Array.isArray(orders) ? orders : [];
        const totalWeight = safeOrders.reduce((sum, o) => sum + (o?.weight || 0), 0);
        const estDistance = safeOrders.length * 5;

        const currentZone = getCurrentTrafficZone() || "low";
        const trafficMultiplier = getTrafficMultiplier(currentZone) || 1.0;

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
        if (userData.role === 'admin') navigate('/admin');
        else navigate('/driver');
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('route_user');
        navigate('/login');
    };

    const handleAddOrder = (newOrder) => {
        setOrders([...orders, newOrder]);
    };

    const handleCompleteOrder = (id) => {
        setOrders(orders.map(o => o.id === id ? { ...o, status: 'Completed' } : o));
    };

    const handleDeleteOrder = (id) => {
        setOrders(orders.filter(o => o.id !== id));
    };

    const handleRecalculateRoute = () => {
        const currentLoc = { lat: 0, lng: 0 };
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
        const updatedUser = { ...user, role: newRole };
        setUser(updatedUser);
        navigate(newRole === 'admin' ? '/admin' : '/driver');
    };

    return (
        <Routes>
            <Route
                path="/"
                element={<LoginPage onLogin={handleLogin} mode="login" />}
            />
            <Route
                path="/login"
                element={<LoginPage onLogin={handleLogin} mode="login" />}
            />
            <Route
                path="/signup"
                element={<LoginPage onLogin={handleLogin} mode="signup" />}
            />
            <Route
                path="/admin"
                element={
                    <ProtectedRoute user={user} allowedRole="admin">
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
                            onDeleteOrder={handleDeleteOrder}
                            onLogout={handleLogout}
                            onToggleRole={toggleRole}
                        />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/driver"
                element={
                    <ProtectedRoute user={user} allowedRole="driver">
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
                            onLogout={handleLogout}
                        />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

export default App;
