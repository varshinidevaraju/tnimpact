import React, { useState } from 'react';

const LoginPage = ({ onLogin }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [role, setRole] = useState('user'); // 'user' or 'admin'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate authentication
        if (email && password) {
            onLogin({ email, role });
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <span className="logo-icon">🚚</span>
                    <h1>RouteOptima</h1>
                    <p>{isLogin ? 'Welcome back! Please login' : 'Create an account'}</p>
                </div>

                <div className="role-selector">
                    <button
                        className={role === 'user' ? 'active' : ''}
                        onClick={() => setRole('user')}
                    >
                        Driver
                    </button>
                    <button
                        className={role === 'admin' ? 'active' : ''}
                        onClick={() => setRole('admin')}
                    >
                        Admin
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="login-submit-btn">
                        {isLogin ? `Login as ${role.charAt(0).toUpperCase() + role.slice(1)}` : 'Sign Up'}
                    </button>
                </form>

                <div className="login-footer">
                    <button onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
