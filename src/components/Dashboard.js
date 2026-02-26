import React from 'react';
import OrderForm from './OrderForm';
import RouteMap from './RouteMap';
import PremiumStats from './PremiumStats';
const Dashboard = ({
    orders,
    route,
    setRoute,
    optimizedOrders,
    onAddOrder,
    onDeleteOrder,
    onActiveOrdersClick,
    onRouteStopsClick,
    onCompletedOrdersClick
}) => {
    const handleGenerateRoute = () => {
        setRoute(optimizedOrders);
    };

    return (
        <div className="command-center">
            <section className="stats-strip">
                <PremiumStats
                    orders={orders}
                    route={optimizedOrders}
                    onActiveOrdersClick={onActiveOrdersClick}
                    onRouteStopsClick={onRouteStopsClick}
                    onCompletedOrdersClick={onCompletedOrdersClick}
                    compact={false}
                />
            </section>

            <div className="main-control-grid">
                <div className="control-pane">
                    <div className="pane-header">
                        <h3>New Assignment</h3>
                        <p>Dispatch new payloads into the active network</p>
                    </div>
                    <OrderForm onAddOrder={onAddOrder} />

                    <button className="dispatch-action-btn" onClick={handleGenerateRoute}>
                        <span className="btn-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                            </svg>
                        </span>
                        Optimize & Dispatch Fleet
                    </button>
                </div>

                <div className="map-pane">
                    <div className="pane-header">
                        <h3>Active Fleet Telemetry</h3>
                        <div className="telemetry-tags">
                            <span className="tag">GPS: Active</span>
                            <span className="tag">Network: Stable</span>
                        </div>
                    </div>
                    <div className="map-container-inner">
                        <RouteMap stops={optimizedOrders} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
