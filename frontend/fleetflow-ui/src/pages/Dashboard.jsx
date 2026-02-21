import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import StatusBadge from '@/components/StatusBadge';
import SkeletonTable from '@/components/SkeletonTable';
import useCountUp from '@/hooks/useCountUp';
import vehicleService from '@/services/vehicleService';
import driverService from '@/services/driverService';
import tripService from '@/services/tripService';
import maintenanceService from '@/services/maintenanceService';
import { getRelativeTime, getVehicleName } from '@/services/utils';

function KPICard({ label, value, icon, color, delay, onClick }) {
    const animatedValue = useCountUp(value);
    const isPercent = String(label).toLowerCase().includes('utilization');

    return (
        <div
            className="ff-card"
            onClick={onClick}
            style={{
                padding: '1.5rem',
                cursor: onClick ? 'pointer' : 'default',
                animation: `fadeInScale 0.4s ease forwards ${delay}ms`,
                opacity: 0
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.25rem' }}>{icon}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {label}
                </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {animatedValue}
                </h2>
                {isPercent && <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-muted)' }}>%</span>}
            </div>
        </div>
    );
}

function EfficiencyCard({ value }) {
    const animatedValue = useCountUp(value);
    return (
        <div className="ff-card" style={{ padding: '1.5rem', background: 'var(--primary)', color: 'white' }}>
            <h3 style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>Operational Efficiency</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                {animatedValue}%
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '2rem' }}>
                +2.4% from last month
            </div>
            <div style={{ height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }}>
                <div style={{ width: `${value}%`, height: '100%', background: 'white', borderRadius: '2px' }} />
            </div>
        </div>
    );
}

export default function Dashboard() {
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [trips, setTrips] = useState([]);
    const [maintenance, setMaintenance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dismissedAlerts, setDismissedAlerts] = useState(() =>
        JSON.parse(sessionStorage.getItem('ff-dismissed-alerts') || '[]')
    );
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            const [v, d, t, m] = await Promise.all([
                vehicleService.getAll(),
                driverService.getAll(),
                tripService.getAll(),
                maintenanceService.getAll()
            ]);
            setVehicles(v || []);
            setDrivers(d || []);
            setTrips(t || []);
            setMaintenance(m || []);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    const kpis = useMemo(() => {
        const active = vehicles.filter(v => v.status === 'on_trip').length;
        const shop = vehicles.filter(v => v.status === 'in_shop').length;
        const total = vehicles.length;
        const util = total ? Math.round((active / total) * 100) : 0;
        const pending = trips.filter(t => t.status === 'draft').length;

        return [
            { label: 'Active Fleet', value: active, icon: '🚛', color: 'var(--color-on-trip)', delay: 0 },
            { label: 'In Shop', value: shop, icon: '🔧', color: 'var(--color-in_shop)', delay: 100 },
            { label: 'Utilization', value: util, icon: '📈', color: 'var(--color-available)', delay: 200 },
            { label: 'Pending Cargo', value: pending, icon: '📦', color: 'var(--primary)', delay: 300 },
        ];
    }, [vehicles, trips]);

    const alerts = useMemo(() => {
        const list = [];

        // License expiry
        drivers.forEach(d => {
            const days = Math.ceil((new Date(d.license_expiry) - Date.now()) / 86400000);
            if (days <= 30 && days > 0) {
                list.push({ id: `lic-${d._id}`, message: `⚠️ ${d.name}'s license expires in ${days} days`, type: 'warning' });
            } else if (days <= 0) {
                list.push({ id: `lic-${d._id}`, message: `🚨 ${d.name}'s license has EXPIRED`, type: 'danger' });
            }
        });

        // Overdue trips
        trips.forEach(t => {
            if (t.status === 'dispatched' && new Date(t.date_start) < new Date(Date.now() - 86400000)) {
                list.push({ id: `trip-${t._id || t.id}`, message: `🚛 Trip #${String(t._id || t.id).slice(-6)} is overdue for start`, type: 'warning' });
            }
        });

        return list.filter(a => !dismissedAlerts.includes(a.id));
    }, [drivers, trips, dismissedAlerts]);

    const chartData = useMemo(() => {
        const counts = vehicles.reduce((acc, v) => {
            acc[v.status] = (acc[v.status] || 0) + 1;
            return acc;
        }, {});

        return [
            { name: 'On Trip', value: counts.on_trip || 1, color: '#0EA5E9' },
            { name: 'Available', value: counts.available || 1, color: '#22C55E' },
            { name: 'In Shop', value: counts.in_shop || 1, color: '#F59E0B' },
            { name: 'Retired', value: counts.retired || 1, color: '#94A3B8' },
        ];
    }, [vehicles]);

    const activityFeed = useMemo(() => {
        const tFeed = trips.slice(0, 5).map(t => ({
            id: t._id,
            type: 'trip',
            date: t.createdAt,
            msg: `New trip #${String(t._id).slice(-4)} created: ${t.start_location} → ${t.end_location}`
        }));
        const mFeed = maintenance.slice(0, 5).map(m => ({
            id: m._id,
            type: 'maint',
            date: m.createdAt,
            msg: `Maintenance logged for ${getVehicleName(vehicles, m.vehicle_id)}: ${m.description || 'Routine Check'}`
        }));

        return [...tFeed, ...mFeed].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);
    }, [trips, maintenance]);

    const handleDismiss = (id) => {
        const newDismissed = [...dismissedAlerts, id];
        setDismissedAlerts(newDismissed);
        sessionStorage.setItem('ff-dismissed-alerts', JSON.stringify(newDismissed));
    };

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="ff-chart-tooltip">
                    <div className="ff-tooltip-color" style={{ color: payload[0].payload.color, backgroundColor: payload[0].payload.color }} />
                    <span className="ff-tooltip-label">{payload[0].name}</span>
                    <span className="ff-tooltip-value">{payload[0].value}</span>
                </div>
            );
        }
        return null;
    };

    if (loading) return <SkeletonTable rows={8} cols={4} />;

    return (
        <div className="fade-in">
            <div style={{ marginBottom: '2rem' }}>
                <h1 className="page-title" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Status Overview</h1>
                <p style={{ color: 'var(--text-muted)' }}>Real-time coordination of 124 fleet units.</p>
            </div>

            {/* Alerts Banner */}
            {alerts.length > 0 && (
                <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {alerts.map(alert => (
                        <div
                            key={alert.id}
                            style={{
                                background: alert.type === 'danger' ? 'var(--red-bg)' : 'var(--orange-bg)',
                                color: alert.type === 'danger' ? 'var(--color-suspended)' : 'var(--color-in-shop)',
                                padding: '0.75rem 1.25rem',
                                borderRadius: '8px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                border: `1px solid ${alert.type === 'danger' ? '#fecaca' : '#fde68a'}`
                            }}
                        >
                            <span>{alert.message}</span>
                            <button onClick={() => handleDismiss(alert.id)} style={{ padding: '0.25rem', opacity: 0.6 }}>✕</button>
                        </div>
                    ))}
                </div>
            )}

            {/* KPI Grid */}
            <div className="kpi-grid">
                {kpis.map(kpi => <KPICard key={kpi.label} {...kpi} />)}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', marginTop: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Recent Trips Table */}
                    <div className="table-wrapper ff-card">
                        <div className="table-toolbar">
                            <h3 className="modal-title" style={{ fontSize: '1.1rem' }}>Active Dispatch Stream</h3>
                            <button className="btn btn-secondary" onClick={() => navigate('/trips')} style={{ fontSize: '0.8rem', padding: '4px 12px' }}>
                                View Logs
                            </button>
                        </div>
                        <table className="ff-table data-table">
                            <thead>
                                <tr>
                                    <th>Ref</th>
                                    <th>Vehicle</th>
                                    <th>Route</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trips.slice(0, 8).map(trip => (
                                    <tr key={trip._id}>
                                        <td style={{ fontWeight: 600, fontSize: '0.85rem' }}>#{String(trip._id).slice(-6).toUpperCase()}</td>
                                        <td>{getVehicleName(vehicles, trip.vehicle_id)}</td>
                                        <td style={{ fontSize: '0.85rem' }}>{trip.start_location} → {trip.end_location}</td>
                                        <td><StatusBadge status={trip.status} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                        {/* Donut Chart */}
                        <div className="ff-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, alignSelf: 'flex-start', marginBottom: '1rem' }}>Fleet Health</h3>
                            <div style={{ width: '100%', height: 200, position: 'relative' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {chartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip />} offset={20} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>{Math.round((vehicles.filter(v => v.status === 'on_trip').length / vehicles.length) * 100)}%</span>
                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px', marginTop: '1rem' }}>
                                {chartData.map(item => (
                                    <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{item.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Efficiency Mini Card */}
                        <EfficiencyCard value={98} />
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="ff-card" style={{ padding: '1.5rem', height: 'fit-content' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1.5rem' }}>System Pulse</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '560px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                        {activityFeed.map(item => (
                            <div key={item.id} style={{ borderLeft: `3px solid ${item.type === 'trip' ? 'var(--primary)' : 'var(--color-in-shop)'}`, paddingLeft: '1rem' }}>
                                <p style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '4px' }}>
                                    {item.msg}
                                </p>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                    {getRelativeTime(item.date)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
