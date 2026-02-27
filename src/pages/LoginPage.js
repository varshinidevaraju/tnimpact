import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = ({ onLogin, mode = 'login' }) => {
    const [isLogin, setIsLogin] = useState(mode === 'login');
    const navigate = useNavigate();
    const [role, setRole] = useState('driver'); // 'driver' or 'admin'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (email && password) {
            onLogin({ email, role });
        }
    };

    return (
        <div className="login-screen">
            <div className="login-side-pane">
                <div className="pane-content">
                    <div className="brand-badge">PREMIUM LOGISTICS</div>
                    <div className="brand-logo">
                        <span className="logo-symbol">R</span>
                        <span className="logo-text">Routenizz</span>
                    </div>
                    <div className="brand-tagline">
                        Precision navigation for the modern logistics industry.
                        Optimize your journey with state-of-the-art routing AI.
                    </div>
                </div>
                <div className="pane-footer">
                    © 2026 Routenizz Inc. All rights reserved.
                </div>
            </div>

            <div className="login-form-pane">
                <div className="form-container">
                    <div className="form-header">
                        <h2>{isLogin ? 'Sign In' : 'Create Account'}</h2>
                        <p>{isLogin ? 'Enter your credentials to access your dashboard' : 'Join our network of precision logistics'}</p>
                    </div>

                    <div className="role-toggle">
                        <button
                            className={role === 'driver' ? 'active' : ''}
                            onClick={() => setRole('driver')}
                        >
                            Driver
                        </button>
                        <button
                            className={role === 'admin' ? 'active' : ''}
                            onClick={() => setRole('admin')}
                        >
                            Administrator
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="premium-form">
                        <div className="input-field">
                            <label>Email Address</label>
                            <input
                                type="email"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-field">
                            <div className="label-row">
                                <label>Password</label>
                                {isLogin && <a href="#forgot" className="forgot-link">Forgot password?</a>}
                            </div>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="prime-login-btn">
                            {isLogin ? `Continue as ${role === 'driver' ? 'Driver' : 'Admin'}` : 'Get Started'}
                        </button>
                    </form>

                    <div className="switch-auth">
                        <span>{isLogin ? "Don't have an account?" : "Already have an account?"}</span>
                        <button onClick={() => navigate(isLogin ? '/signup' : '/login')}>
                            {isLogin ? "Sign up now" : "Go to login"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
