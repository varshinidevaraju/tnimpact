import React, { useState } from 'react';

const OrderForm = ({ onAddOrder }) => {
    const [formData, setFormData] = useState({
        customer: '',
        address: '',
        priority: 'Medium',
        weight: '',
        width: '',
        height: '',
        breadth: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.customer || !formData.address) return;

        setIsSubmitting(true);
        setError('');

        try {
            let lat = null;
            let lng = null;
            let searchQuery = formData.address;

            // 1. Check if the user pasted a Google Maps URL or raw coordinates
            const coordMatch = formData.address.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) || formData.address.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);

            if (coordMatch) {
                lat = parseFloat(coordMatch[1] || coordMatch[2]);
                lng = parseFloat(coordMatch[2] || coordMatch[3]);
            } else if (formData.address.includes('google.com/maps') || formData.address.includes('maps.app.goo.gl')) {
                // If it's a map link without explicit @coords, extract a search query "q=" or fallback to the full path
                try {
                    const urlObj = new URL(formData.address);
                    const queryParam = urlObj.searchParams.get('q');
                    if (queryParam) {
                        searchQuery = queryParam.replace(/\+/g, ' ');
                    } else {
                        // Sometimes the destination is just in the URL path (e.g. /maps/place/Sree+Meditec/...)
                        const pathMatch = urlObj.pathname.match(/\/place\/([^\/]+)/);
                        if (pathMatch) {
                            searchQuery = decodeURIComponent(pathMatch[1]).replace(/\+/g, ' ');
                        }
                    }
                } catch (e) {
                    console.warn("Could not parse Maps URL cleanly", e);
                }
            }

            // 2. Try Nominatim Geocoding API if no direct coordinates
            if (!lat || !lng) {
                const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(searchQuery)}`);
                const data = await response.json();

                if (data && data.length > 0) {
                    lat = parseFloat(data[0].lat);
                    lng = parseFloat(data[0].lon);
                }
            }

            // 3. Fallback: If no coordinates found, abort and show error
            if (!lat || !lng) {
                setError(`Business name "${searchQuery}" not found on OpenStreetMap. Please provide a street address, city name, or paste exact coordinates (e.g. "13.0827, 80.2707").`);
                setIsSubmitting(false);
                return;
            }

            onAddOrder({
                ...formData,
                id: `ORD${Math.floor(Math.random() * 1000)}`,
                status: 'Pending',
                weight: parseFloat(formData.weight) || 0,
                width: parseFloat(formData.width) || 0,
                height: parseFloat(formData.height) || 0,
                breadth: parseFloat(formData.breadth) || 0,
                lat: lat,
                lng: lng
            });

            setFormData({ customer: '', address: '', priority: 'Medium', weight: '', width: '', height: '', breadth: '' });
            setError(''); // Clear any previous errors

        } catch (err) {
            console.error("Failed to geocode address", err);
            setError("Network error while validating address.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form className="order-form" onSubmit={handleSubmit}>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem' }}>Add Order</h3>
            {error && <p style={{ color: '#d92d20', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}
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
                    placeholder="e.g. 123 Main St, Chennai"
                />
                <small style={{ color: '#667085', fontSize: '0.7rem', marginTop: '0.2rem', display: 'block', opacity: 0.8 }}>
                    Paste coordinates (e.g. 13.082, 80.270) for accuracy.
                </small>
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
            <div className="form-row">
                <div className="form-group">
                    <label>Width (cm)</label>
                    <input
                        type="number"
                        value={formData.width}
                        onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                        placeholder="0"
                    />
                </div>
                <div className="form-group">
                    <label>Height (cm)</label>
                    <input
                        type="number"
                        value={formData.height}
                        onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                        placeholder="0"
                    />
                </div>
                <div className="form-group">
                    <label>Breadth (cm)</label>
                    <input
                        type="number"
                        value={formData.breadth}
                        onChange={(e) => setFormData({ ...formData, breadth: e.target.value })}
                        placeholder="0"
                    />
                </div>
            </div>
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Validating Address...' : 'Register Order'}
            </button>
        </form>
    );
};

export default OrderForm;
