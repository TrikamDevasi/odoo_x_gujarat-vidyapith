import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Map,
  Truck,
  Fuel,
  LayoutDashboard,
  ShieldCheck
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/pages/Dashboard';
import Vehicles from '@/pages/Vehicles';
import Drivers from '@/pages/Drivers';
import Trips from '@/pages/Trips';
import FuelLogs from '@/pages/FuelLogs';
import Maintenance from '@/pages/Maintenance';
import Analytics from '@/pages/Analytics';
import Login from '@/pages/Login';
import authService from './services/authService';
import { AnimatedThemeToggler } from '@/components/AnimatedThemeToggler';
import ToastContainer from '@/components/ToastContainer';
import CommandPalette from '@/components/CommandPalette';
import QuickActionFAB from '@/components/QuickActionFAB';
import { FleetProvider } from '@/context/FleetContext';

const PAGE_TITLES = {
  '/dashboard': { title: 'Dashboard' },
  '/vehicles': { title: 'Fleet Registry' },
  '/drivers': { title: 'Personnel Management' },
  '/trips': { title: 'Operations Feed' },
  '/maintenance': { title: 'System Diagnostics' },
  '/fuel': { title: 'Asset Expenses' },
  '/analytics': { title: 'Strategic Insights' },
};

const ProtectedRoute = ({ children, allowedRoles, user }) => {
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }
  return children;
};

function MobileNav({ path }) {
  const navigate = useNavigate();
  const items = [
    { label: 'Dash', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { label: 'Trips', icon: <Map size={20} />, path: '/trips' },
    { label: 'Fleet', icon: <Truck size={20} />, path: '/vehicles' },
    { label: 'Fuel', icon: <Fuel size={20} />, path: '/fuel' },
  ];

  return (
    <div className="mobile-nav">
      {items.map((item) => (
        <button
          key={item.path}
          className={`mobile-nav-item${path === item.path ? ' active' : ''}`}
          onClick={() => navigate(item.path)}
        >
          <span className="mobile-nav-icon">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}

function AppShell({ user, onLogout, theme, toggleTheme }) {
  const location = useLocation();
  const path = location.pathname;
  const navigate = useNavigate();

  const meta = PAGE_TITLES[path] || { title: 'FleetFlow' };

  const handleLogout = () => {
    authService.logout();
    onLogout();
  };

  return (
    <div className="app-shell">
      <Sidebar user={user} onLogout={handleLogout} />
      <div className="app-main">
        <header className="header">
          <div style={{ flex: 1 }}>
            <div className="header-title">{meta.title}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <AnimatedThemeToggler theme={theme} toggleTheme={toggleTheme} />

            <div style={{
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--text-secondary)',
              background: 'var(--bg-hover)',
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid var(--border)',
            }}>
              {user?.role}
            </div>
          </div>
        </header>
        <main className="page-content fade-in" key={path}>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/drivers" element={<Drivers />} />
            <Route path="/trips" element={<Trips />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="/fuel" element={
              <ProtectedRoute allowedRoles={['Fleet Manager', 'Finance Admin', 'Dispatcher']} user={user}>
                <FuelLogs />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute allowedRoles={['Fleet Manager']} user={user}>
                <Analytics />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNav path={path} />

      {/* Global Interactive Components */}
      <CommandPalette />
      <QuickActionFAB />
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    const savedUser = authService.getCurrentUser();
    if (savedUser) setUser(savedUser);
    setLoading(false);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  if (loading) return null;

  return (
    <FleetProvider>
      <div className="fleetflow-root">
        <ToastContainer />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={
              user ? <Navigate to="/dashboard" /> : <Login onLogin={setUser} />
            } />
            <Route path="/*" element={
              user ? (
                <AppShell
                  user={user}
                  onLogout={() => setUser(null)}
                  theme={theme}
                  toggleTheme={toggleTheme}
                />
              ) : <Navigate to="/login" />
            } />
          </Routes>
        </BrowserRouter>
      </div>
    </FleetProvider>
  );
}