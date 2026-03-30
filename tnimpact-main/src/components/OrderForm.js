import React, { useState } from 'react';

const OrderForm = ({ onAddOrder }) => {
    const [formData, setFormData] = useState({
        customer: '',
        address: '',
        priority: 'Medium',
        weight: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.customer || !formData.address) return;
        onAddOrder({
            ...formData,
            id: `ORD${Math.floor(Math.random() * 1000)}`,
            status: 'Pending',
            weight: parseFloat(formData.weight) || 0
        });
        setFormData({ customer: '', address: '', priority: 'Medium', weight: '' });
    };

    return (
        <form className="order-form" onSubmit={handleSubmit}>
            <h2>Add New Order</h2>
            <div className="form-group">
                <label>Customer Name</label>
                <input
                    type="text"
                    value={formData.customer}
                    onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                    placeholder="e.g. Acme Corp"
                />
            </div>
            <div className="form-group">
                <label>Delivery Address</label>
                <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. 123 Main St"
                />
            </div>
            <div className="form-row">
                <div className="form-group">
                    <label>Priority</label>
                    <select
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    >
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Weight (kg)</label>
                    <input
                        type="number"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                        placeholder="0"
                    />
                </div>
            </div>
            <button type="submit" className="submit-btn">Register Order</button>
        </form>
    );
};

export default OrderForm;
