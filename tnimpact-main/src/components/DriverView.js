import React from 'react';

const DriverView = ({ currentOrder, onComplete }) => {
    if (!currentOrder) {
        return (
            <div className="driver-empty">
                <div className="status-circle pulse"></div>
                <h2>All Deliveries Completed</h2>
                <p>Awaiting new route assignments...</p>
            </div>
        );
    }

    return (
        <div className="driver-view">
            <div className="current-stop">
                <label>NEXT STOP</label>
                <h1>{currentOrder.customer}</h1>
                <p className="large-address">{currentOrder.address}</p>
            </div>

            <div className="details-grid">
                <div className="detail-item">
                    <label>Priority</label>
                    <span className={`status-${currentOrder.priority.toLowerCase()}`}>
                        {currentOrder.priority}
                    </span>
                </div>
                <div className="detail-item">
                    <label>Load</label>
                    <span>{currentOrder.weight} kg</span>
                </div>
            </div>

            <div className="action-area">
                <button className="complete-btn" onClick={() => onComplete(currentOrder.id)}>
                    Mark as Delivered
                </button>
            </div>
        </div>
    );
};

export default DriverView;
