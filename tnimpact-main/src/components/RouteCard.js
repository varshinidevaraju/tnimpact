import React from 'react';

const RouteCard = ({ order, index }) => {
    const priorityColors = {
        High: '#ff4d4d',
        Medium: '#ffa500',
        Low: '#2ecc71'
    };

    return (
        <div className="route-card">
            <div className="card-index">{index + 1}</div>
            <div className="card-content">
                <h3>{order.customer}</h3>
                <p className="address">{order.address}</p>
                <div className="card-footer">
                    <span
                        className="priority-badge"
                        style={{ backgroundColor: priorityColors[order.priority] }}
                    >
                        {order.priority}
                    </span>
                    <span className="weight-badge">{order.weight} kg</span>
                </div>
            </div>
        </div>
    );
};

export default RouteCard;
