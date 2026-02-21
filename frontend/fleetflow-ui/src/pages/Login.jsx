import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { ArrowRight, ShieldCheck, Info } from 'lucide-react';
import authService from '../services/authService';

const ROLES = [
    { id: 'Fleet Manager', icon: '💎', desc: 'Control & Strategy' },
    { id: 'Dispatcher', icon: '⚡', desc: 'Route Ops' },
    { id: 'Finance Admin', icon: '📊', desc: 'Audit & Fuel' }
];

function AuthPortal() {
    return ReactDOM.createPortal(
        <div className="auth-overlay">
            <div className="portal-tunnel">
                {[...Array(7)].map((_, i) => (
                    <div key={i} className={`portal-ring ring-${i + 1}`} />
                ))}
                <div className="portal-orb" />
            </div>
            <div className="portal-status">
                <div className="portal-loader" />
                <span className="portal-label">VALIDATING CREDENTIALS...</span>
            </div>
        </div>,
        document.body
    );
}

export default function Login({ onLogin }) {
    const [email, setEmail] = useState('manager@fleetflow.com');
    const [password, setPassword] = useState('password');
    const [role, setRole] = useState('Fleet Manager');
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsAuthenticating(true);

        // Simulation delay for the premium animation
        await new Promise(r => setTimeout(r, 2800));

        try {
            const data = await authService.login(email, password, role);
            onLogin(data.user);
        } catch (err) {
            setError(err.response?.data?.message || 'Authorization failed');
            setIsAuthenticating(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-bg-blobs">
                <div className="blob blob-1" />
                <div className="blob blob-2" />
                <div className="blob blob-3" />
            </div>

            <div className="login-card">
                <div className="login-logo-glow">
                    <ShieldCheck size={32} />
                </div>
                <h1 className="login-app-name">FleetFlow</h1>
                <p className="login-tagline">Fleet & Logistics Management System</p>

                <div className="shimmer-divider" />

                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="login-input-group">
                        <label className="login-label">Operational Email</label>
                        <div className="login-input-wrapper">
                            <input
                                type="email"
                                className="login-control"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="login-input-group">
                        <label className="login-label">Access Key</label>
                        <div className="login-input-wrapper">
                            <input
                                type="password"
                                className="login-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <label className="login-label">Command Role</label>
                    <div className="login-role-grid">
                        {ROLES.map((r) => (
                            <div
                                key={r.id}
                                className={`role-option ${role === r.id ? 'active' : ''}`}
                                onClick={() => setRole(r.id)}
                            >
                                <span className="role-icon">{r.icon}</span>
                                <span className="role-name">{r.id.split(' ')[1] || r.id}</span>
                            </div>
                        ))}
                    </div>

                    {error && (
                        <div style={{ color: '#ff6b6b', fontSize: '12px', marginBottom: '16px', textAlign: 'center', fontWeight: 600 }}>
                            {error}
                        </div>
                    )}

                    <button type="submit" className="login-submit-btn">
                        INITIALIZE SESSION <ArrowRight size={18} />
                    </button>
                </form>

                <div className="login-links">
                    <span>Forgot password?</span>
                    <span>Create account</span>
                </div>

                <div className="demo-pill">
                    <Info size={14} />
                    <span>Demo Mode Active: Use any password</span>
                </div>
            </div>

            {isAuthenticating && <AuthPortal />}
        </div>
    );
}