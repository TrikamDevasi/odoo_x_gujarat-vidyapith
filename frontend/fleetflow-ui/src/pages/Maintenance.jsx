import { useState, useEffect } from 'react';
import { Plus, AlertCircle, Wrench, Search } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import Modal from '@/components/Modal';
import SkeletonTable from '@/components/SkeletonTable';
import maintenanceService from '../services/maintenanceService';
import vehicleService from '../services/vehicleService';

const EMPTY = { vehicle_id: '', description: '', cost: '', service_date: '' };

export default function Maintenance() {
    const [maintenance, setMaintenance] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(false);
    const [form, setForm] = useState(EMPTY);
    const [search, setSearch] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [maintenanceData, vehiclesData] = await Promise.all([
                maintenanceService.getAll(),
                vehicleService.getAll()
            ]);
            setMaintenance(maintenanceData);
            setVehicles(vehiclesData);
        } catch (error) {
            console.error('Error fetching data:', error);
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const vehicleName = (idOrObj) => {
        // Handle if populated as object
        if (idOrObj && typeof idOrObj === 'object' && idOrObj.name) return idOrObj.name;

        // Fallback to searching in vehicles list
        const idStr = String(idOrObj?._id || idOrObj?.id || idOrObj);
        const v = vehicles.find(v => String(v._id || v.id) === idStr);
        return v ? v.name : `Vehicle #${idStr.slice(-6)}`;
    };

    const handleSave = async () => {
        try {
            if (!form.vehicle_id || !form.description || !form.cost) {
                setError('Please fill all required fields');
                return;
            }

            const data = {
                vehicle_id: form.vehicle_id,
                description: form.description,
                cost: Number(form.cost),
                service_date: form.service_date || new Date().toISOString()
            };

            await maintenanceService.create(data);
            await fetchData(); // Refresh data
            setModal(false);
            setForm(EMPTY);
            setError('');
        } catch (err) {
            setError('Failed to save maintenance record');
            console.error(err);
        }
    };

    const handleComplete = async (maintenanceId) => {
        try {
            if (!maintenanceId) return;
            // Ensure we are passing a string ID
            const id = typeof maintenanceId === 'string' ? maintenanceId : (maintenanceId._id || maintenanceId.id || String(maintenanceId));

            await maintenanceService.complete(String(id));
            await fetchData(); // Refresh data
            setError('');
        } catch (err) {
            setError('Failed to complete maintenance: ' + (err.message || 'Server error'));
            console.error(err);
        }
    };

    const filtered = maintenance.filter(m => {
        const q = search.toLowerCase();
        return !q ||
            m.description?.toLowerCase().includes(q) ||
            vehicleName(m.vehicle_id).toLowerCase().includes(q);
    });

    const totalCost = maintenance.reduce((s, m) => s + (m.cost || 0), 0);
    const recentCount = maintenance.filter(m => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return new Date(m.service_date) > thirtyDaysAgo;
    }).length;

    if (loading) return <SkeletonTable rows={10} cols={6} />;

    return (
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Maintenance Logs</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>{recentCount} in last 30 days · ${totalCost.toLocaleString()} total cost</p>
                </div>
                <button className="btn btn-primary" onClick={() => { setForm(EMPTY); setModal(true); }}>
                    <Plus size={18} style={{ marginRight: '8px' }} /> Log Service
                </button>
            </div>

            {error && (
                <div className="alert alert-danger pulse">
                    <AlertCircle size={18} /> {error}
                </div>
            )}

            <div className="table-wrapper">
                <div className="table-toolbar">
                    <h3 className="table-toolbar-title">Service Records ({filtered.length})</h3>
                    <div className="search-wrap">
                        <span className="search-icon">🔍</span>
                        <input
                            className="search-input"
                            placeholder="Search records…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Description</th><th>Vehicle</th>
                            <th>Date</th><th>Cost</th><th>Status</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={6}><div className="empty-state"><div className="empty-state-icon">🔧</div><div className="empty-state-text">No service records</div></div></td></tr>
                        ) : filtered.map(m => (
                            <tr key={m._id || m.id}>
                                <td><strong>{m.description}</strong></td>
                                <td>{vehicleName(m.vehicle_id)}</td>
                                <td className="text-muted">{new Date(m.service_date).toLocaleDateString()}</td>
                                <td style={{ fontWeight: 600 }}>${m.cost?.toLocaleString()}</td>
                                <td>
                                    <StatusBadge status={m.status || 'Pending'} />
                                </td>
                                <td>
                                    {m.status !== 'Completed' && (
                                        <button
                                            className="btn btn-success btn-sm"
                                            onClick={() => handleComplete(m._id || m.id)}
                                        >
                                            Mark Completed
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {modal && (
                <Modal
                    title="Log New Service"
                    onClose={() => setModal(false)}
                    footer={
                        <>
                            <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSave}>Save Record</button>
                        </>
                    }
                >
                    <div className="alert alert-warning">
                        <AlertCircle size={18} />
                        <span>Adding a service record will automatically set the vehicle status to <strong>In Shop</strong>.</span>
                    </div>
                    <div className="form-grid">
                        <div className="form-group form-grid-full">
                            <label className="form-label">Service Description</label>
                            <input
                                className="form-control"
                                placeholder="e.g. Oil Change"
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Vehicle</label>
                            <select
                                className="form-control"
                                value={form.vehicle_id}
                                onChange={e => setForm({ ...form, vehicle_id: e.target.value })}
                            >
                                <option value="">Select vehicle…</option>
                                {vehicles.map(v => (
                                    <option key={v._id || v.id} value={v._id || v.id}>
                                        {v.name} - {v.license_plate}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Service Date</label>
                            <input
                                className="form-control"
                                type="date"
                                value={form.service_date}
                                onChange={e => setForm({ ...form, service_date: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Cost ($)</label>
                            <input
                                className="form-control"
                                type="number"
                                value={form.cost}
                                onChange={e => setForm({ ...form, cost: e.target.value })}
                            />
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}