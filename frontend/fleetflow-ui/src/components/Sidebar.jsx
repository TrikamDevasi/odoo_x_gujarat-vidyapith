import { useLocation, useNavigate } from 'react-router-dom';
import {
    BarChart3,
    Map,
    Truck,
    Fuel,
    Settings,
    Users,
    LayoutDashboard,
    LogOut,
    AlertCircle
} from 'lucide-react';

const NAV = [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard', section: 'GENERAL' },
    { label: 'Trips', icon: <Map size={20} />, path: '/trips', section: 'OPERATIONS' },
    { label: 'Vehicles', icon: <Truck size={20} />, path: '/vehicles', section: 'ASSETS' },
    { label: 'Fuel Logs', icon: <Fuel size={20} />, path: '/fuel', section: 'ASSETS', roles: ['Fleet Manager', 'Finance Admin', 'Dispatcher'] },
    { label: 'Maintenance', icon: <Settings size={20} />, path: '/maintenance', section: 'SYSTEM' },
    { label: 'Drivers', icon: <Users size={20} />, path: '/drivers', section: 'PEOPLE' },
    { label: 'Analytics', icon: <BarChart3 size={20} />, path: '/analytics', section: 'REPORTS', roles: ['Fleet Manager'] },
];

export default function Sidebar({ user, onLogout }) {
    const location = useLocation();
    const navigate = useNavigate();

    const filteredNav = NAV.filter(item => !item.roles || item.roles.includes(user?.role));
    let currentSection = null;

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon">
                    <Truck size={20} strokeWidth={2.5} />
                </div>
                <div className="sidebar-logo-text">FLEETFLOW</div>
            </div>

            <nav className="sidebar-nav">
                {filteredNav.map((item) => {
                    const showSection = item.section !== currentSection;
                    currentSection = item.section;
                    return (
                        <div key={item.path}>
                            {showSection && (
                                <div className="sidebar-section-label">{item.section}</div>
                            )}
                            <button
                                className={`sidebar-link${location.pathname === item.path ? ' active' : ''}`}
                                onClick={() => navigate(item.path)}
                            >
                                <span className="sidebar-link-icon">{item.icon}</span>
                                {item.label}
                            </button>
                        </div>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-user">
                    <div className="sidebar-avatar">
                        {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user?.name}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user?.role}</div>
                    </div>
                    <button
                        className="btn-icon"
                        onClick={onLogout}
                        title="Logout"
                    >
                        <LogOut size={16} />
                    </button>
                </div>

                <div className="sidebar-command-hint">
                    <span>COMMAND CENTER</span>
                    <div style={{ display: 'flex', gap: '2px' }}>
                        <kbd>⌘</kbd>
                        <kbd>K</kbd>
                    </div>
                </div>
            </div>
        </aside>
    );
}
