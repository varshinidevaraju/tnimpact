import React from 'react';
import RouteCard from './RouteCard';
import OrderForm from './OrderForm';

const Dashboard = ({ orders, optimizedOrders, onAddOrder }) => {
    return (
        <div className="dashboard-grid">
            <div className="orders-section">
                <OrderForm onAddOrder={onAddOrder} />
            </div>
            <div className="optimization-section">
                <div className="header-flex">
                    <h2>Optimized Route</h2>
                    <span className="count-badge">{optimizedOrders.length} Stops</span>
                </div>
                <div className="route-list">
                    {optimizedOrders.map((order, index) => (
                        <RouteCard key={order.id} order={order} index={index} />
                    ))}
                    {optimizedOrders.length === 0 && (
                        <p className="empty-state">No orders to optimize yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
