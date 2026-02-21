import { useState, useEffect, useMemo } from 'react';
import {
    User,
    Search,
    Plus,
    Phone,
    Mail,
    ShieldCheck,
    Calendar,
    History,
    TrendingUp,
    AlertTriangle,
    Pencil,
    Trash2,
    ChevronRight
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import Modal from '@/components/Modal';
import SkeletonTable from '@/components/SkeletonTable';
import useCountUp from '@/hooks/useCountUp';
import { showToast } from '@/hooks/useToast';
import driverService from '@/services/driverService';
import tripService from '@/services/tripService';

const EMPTY = {
    name: '', license_number: '', license_expiry: '', license_category: 'van',
    status: 'off_duty', safety_score: 100, phone: '', email: ''
};

function LicenseBadge({ expiry }) {
    const daysLeft = Math.ceil((new Date(expiry) - Date.now()) / 86400000);

    if (daysLeft <= 0) {
        return (
            <span className="ff-badge badge-suspended ff-badge-shake" style={{ background: 'var(--red-bg)', color: 'var(--color-suspended)', fontWeight: 700 }}>
                EXPIRED
            </span>
        );
    }

    if (daysLeft <= 60) {
        return (
            <span className="ff-badge badge-in_shop ff-badge-dot-pulse" style={{ background: 'var(--orange-bg)', color: 'var(--color-in-shop)', fontWeight: 600 }}>
                ⚠️ Expires in {daysLeft}d
            </span>
        );
    }

    return (
        <span className="ff-badge badge-available" style={{ background: 'var(--green-bg)', color: 'var(--color-available)', fontWeight: 600 }}>
            ✓ Valid
        </span>
    );
}

function ScorecardModal({ driver, trips, onClose }) {
    const score = useCountUp(driver.safety_score || 0);
    const strokeDasharray = 339; // 2 * PI * 54
    const offset = strokeDasharray - (score / 100) * strokeDasharray;

    const driverTrips = useMemo(() => {
        const dId = String(driver._id || driver.id);
        return trips.filter(t => String(t.driver_id?._id || t.driver_id?.id || t.driver_id) === dId)
            .sort((a, b) => new Date(b.date_start) - new Date(a.date_start))
            .slice(0, 3);
    }, [trips, driver]);

    const completionRate = useMemo(() => {
        const dId = String(driver._id || driver.id);
        const relevantTrips = trips.filter(t => String(t.driver_id?._id || t.driver_id?.id || t.driver_id) === dId);
        const total = relevantTrips.length;
        const completed = relevantTrips.filter(t => t.status === 'completed').length;
        return total > 0 ? Math.round((completed / total) * 100) : 100;
    }, [trips, driver]);

    return (
        <Modal title="Personnel Performance Portfolio" onClose={onClose}>
            <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '2.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ position: 'relative', width: '130px', height: '130px', marginBottom: '1.5rem' }}>
                        <svg width="130" height="130" style={{ transform: 'rotate(-90deg)' }}>
                            <circle cx="65" cy="65" r="54" fill="none" stroke="var(--bg-app)" strokeWidth="8" />
                            <circle
                                cx="65" cy="65" r="54" fill="none"
                                stroke={score > 80 ? 'var(--color-available)' : score > 50 ? 'var(--color-in-shop)' : 'var(--color-suspended)'}
                                strokeWidth="8"
                                strokeDasharray={strokeDasharray}
                                strokeDashoffset={offset}
                                style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
                            />
                        </svg>
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: 'var(--font-heading)' }}>{score}</span>
                            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Safety Score</span>
                        </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{driver.name}</h3>
                        <StatusBadge status={driver.status} />
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Operation Metrics</h4>
                        <div style={{ background: 'var(--bg-app)', padding: '1rem', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                                <span>Trip Completion Rate</span>
                                <span style={{ fontWeight: 600 }}>{completionRate}%</span>
                            </div>
                            <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px' }}>
                                <div style={{ height: '100%', width: `${completionRate}%`, background: 'var(--primary)', borderRadius: '3px', transition: 'width 1s ease' }} />
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Service History (Last 3)</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {driverTrips.length === 0 ? <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No logs recorded</p> : driverTrips.map(t => (
                                <div key={t._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border-light)', padding: '8px 12px', borderRadius: '6px' }}>
                                    <div style={{ fontSize: '0.8rem' }}>
                                        <div style={{ fontWeight: 600 }}>#{String(t._id).slice(-6).toUpperCase()}</div>
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.start_location} → {t.end_location}</div>
                                    </div>
                                    <StatusBadge status={t.status} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                            <Phone size={14} /> <span>{driver.phone || '---'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                            <Mail size={14} /> <span>{driver.email || '---'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}

export default function Drivers() {
    const [drivers, setDrivers] = useState([]);
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState(null);
    const [scorecardDriver, setScorecardDriver] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [d, t] = await Promise.all([driverService.getAll(), tripService.getAll()]);
            setDrivers(d || []);
            setTrips(t || []);
        } catch (err) {
            showToast('Connection interrupted', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (!form.name || !form.license_expiry) {
                showToast('Identification required', 'warning');
                return;
            }
            if (modal === 'add') {
                await driverService.create(form);
                showToast('Driver registered', 'success');
            } else {
                await driverService.updateStatus(editId, form.status);
            }
            fetchData();
            setModal(null);
        } catch (err) {
            showToast(err.message, 'error');
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm('Revoke access for this driver?')) return;
        try {
            await driverService.delete(id);
            setDrivers(prev => prev.filter(d => (d._id || d.id) !== id));
            showToast('Personnel removed', 'success');
        } catch (err) {
            showToast('Deletioin failed', 'error');
        }
    };

    const filtered = useMemo(() =>
        drivers.filter(d => !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.license_number.toLowerCase().includes(search.toLowerCase()))
        , [drivers, search]);

    if (loading) return <SkeletonTable rows={10} cols={7} />;

    return (
        <div className="fade-in">
            <div className="page-header" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title">Personnel Management</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Coordinating {drivers.length} authorized personnel</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="search-wrap" style={{ width: '280px' }}>
                        <Search size={16} className="search-icon" />
                        <input
                            className="search-input"
                            placeholder="Search by name or license..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <button className="btn btn-primary" onClick={() => { setForm(EMPTY); setModal('add'); }}>
                        <Plus size={18} /> Register Driver
                    </button>
                </div>
            </div>

            <div className="table-wrapper ff-card">
                <table className="ff-table data-table">
                    <thead>
                        <tr>
                            <th>Personnel</th>
                            <th>License #</th>
                            <th>Status</th>
                            <th>Compliance</th>
                            <th>Safety</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(d => (
                            <tr key={d._id} onClick={() => setScorecardDriver(d)} style={{ cursor: 'pointer' }}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-app)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', color: 'var(--primary)' }}>
                                            {d.name.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{d.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{d.license_category.toUpperCase()} Class</div>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ fontFamily: 'monospace' }}>{d.license_number}</td>
                                <td><StatusBadge status={d.status} /></td>
                                <td><LicenseBadge expiry={d.license_expiry} /></td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '40px', height: '4px', background: 'var(--border)', borderRadius: '2px' }}>
                                            <div style={{ height: '100%', width: `${d.safety_score}%`, background: d.safety_score > 80 ? 'var(--color-available)' : 'var(--color-in-shop)', borderRadius: '2px' }} />
                                        </div>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{d.safety_score}</span>
                                    </div>
                                </td>
                                <td style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); setEditId(d._id); setForm(d); setModal('edit'); }}>
                                        <Pencil size={14} />
                                    </button>
                                    <button className="btn btn-secondary btn-sm" style={{ color: 'var(--color-suspended)' }} onClick={(e) => handleDelete(e, d._id)}>
                                        <Trash2 size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {scorecardDriver && (
                <ScorecardModal
                    driver={scorecardDriver}
                    trips={trips}
                    onClose={() => setScorecardDriver(null)}
                />
            )}

            {modal && (
                <Modal
                    title={modal === 'add' ? 'Personnel Enrollment' : 'Update Credentials'}
                    onClose={() => setModal(null)}
                    footer={
                        <>
                            <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSave}>Confirm Dossier</button>
                        </>
                    }
                >
                    <div className="form-grid">
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label className="form-label">Full Legal Name</label>
                            <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">License Number</label>
                            <input className="form-control" style={{ fontFamily: 'monospace' }} value={form.license_number} onChange={e => setForm({ ...form, license_number: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">License Expiry</label>
                            <input className="form-control" type="date" value={form.license_expiry?.split('T')[0]} onChange={e => setForm({ ...form, license_expiry: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">License Class</label>
                            <select className="form-control" value={form.license_category} onChange={e => setForm({ ...form, license_category: e.target.value })}>
                                <option value="van">Van / Light Utility</option>
                                <option value="truck">Heavy Truck (HGV)</option>
                                <option value="bike">Dispatch Bike</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Duty Status</label>
                            <select className="form-control" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                                <option value="on_duty">On Duty</option>
                                <option value="off_duty">Off Duty</option>
                                <option value="suspended">Suspended</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone Contact</label>
                            <input className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input className="form-control" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}