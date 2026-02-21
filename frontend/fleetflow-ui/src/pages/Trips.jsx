import React, { useState, useEffect, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
    Plus,
    Search,
    LayoutGrid,
    List,
    ArrowRight,
    MapPin,
    User,
    Truck,
    AlertCircle,
    MoreVertical
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import Modal from '@/components/Modal';
import SkeletonTable from '@/components/SkeletonTable';
import { showToast } from '@/hooks/useToast';
import tripService from '@/services/tripService';
import vehicleService from '@/services/vehicleService';
import driverService from '@/services/driverService';
import { getVehicleName, getDriverName } from '@/services/utils';

const EMPTY_FORM = {
    vehicle_id: '',
    driver_id: '',
    start_location: '',
    end_location: '',
    cargo_weight: '',
    start_time: '',
    odometer_start: ''
};

const COLUMNS = ['Draft', 'Dispatched', 'Completed', 'Cancelled'];

function TripCard({ trip, vehicle, driver, index, isMoving }) {
    const initials = driver?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??';
    const charCode = (driver?.name || 'A').charCodeAt(0);
    const avatarColor = `hsl(${charCode * 137.5 % 360}, 60%, 50%)`;

    const capacityPct = vehicle ? Math.round((trip.cargo_weight / (vehicle.max_load || 1000)) * 100) : 0;
    const progressColor = capacityPct < 70 ? 'var(--color-available)' : capacityPct < 85 ? 'var(--color-in-shop)' : 'var(--color-suspended)';

    const isOverdue = trip.status === 'Dispatched' && new Date(trip.start_time) < new Date();

    const typeEmoji = { van: '🚐', truck: '🚛', bike: '🏍️' }[vehicle?.type?.toLowerCase()] || '🚛';

    return (
        <Draggable draggableId={trip._id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="ff-card"
                    style={{
                        ...provided.draggableProps.style,
                        padding: '1rem',
                        marginBottom: '0.75rem',
                        background: snapshot.isDragging ? 'var(--bg-hover)' : 'var(--bg-surface)',
                        border: snapshot.isDragging ? '1px solid var(--primary)' : '1px solid var(--border)',
                        position: 'relative',
                        opacity: isMoving ? 0.6 : 1
                    }}
                >
                    {isMoving && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, borderRadius: 'inherit' }}>
                            <div className="ff-badge-spin">⏳</div>
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: 'monospace' }}>#{String(trip._id).slice(-6).toUpperCase()}</span>
                        {isOverdue && (
                            <span style={{ fontSize: '0.65rem', background: 'var(--red-bg)', color: 'var(--color-suspended)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>OVERDUE</span>
                        )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: avatarColor, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>
                            {initials}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{driver?.name || 'Assigning...'}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{typeEmoji} {vehicle?.name || 'Vehicle'}</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                        <span style={{ fontWeight: 600 }}>{trip.start_location}</span>
                        <ArrowRight size={12} />
                        <span style={{ fontWeight: 600 }}>{trip.end_location}</span>
                    </div>

                    <div style={{ marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 600 }}>Cargo Load</span>
                            <span style={{ color: progressColor }}>{trip.cargo_weight}kg ({capacityPct}%)</span>
                        </div>
                        <div style={{ height: '4px', background: 'var(--bg-app)', borderRadius: '2px' }}>
                            <div style={{ height: '100%', width: `${Math.min(capacityPct, 100)}%`, background: progressColor, borderRadius: '2px', transition: 'width 0.3s ease' }} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(trip.start_time).toLocaleDateString()}</span>
                        <StatusBadge status={trip.status} />
                    </div>
                </div>
            )}
        </Draggable>
    );
}

export default function Trips() {
    const [trips, setTrips] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState(() => localStorage.getItem('ff-trips-view') || 'kanban');
    const [modal, setModal] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [movingIds, setMovingIds] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchAll();
    }, []);

    useEffect(() => {
        localStorage.setItem('ff-trips-view', view);
    }, [view]);

    const fetchAll = async () => {
        try {
            const [t, v, d] = await Promise.all([
                tripService.getAll(),
                vehicleService.getAll(),
                driverService.getAll()
            ]);
            setTrips(t || []);
            setVehicles(v || []);
            setDrivers(d || []);
        } catch (err) {
            showToast('Connection failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    const onDragEnd = async (result) => {
        const { source, destination, draggableId } = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId) return;

        const fromCol = source.droppableId;
        const toCol = destination.droppableId;

        let valid = false;
        if (fromCol === 'Draft' && toCol === 'Dispatched') valid = true;
        if (fromCol === 'Dispatched' && (toCol === 'Completed' || toCol === 'Cancelled')) valid = true;

        if (!valid) {
            showToast(`Cannot move from ${fromCol} to ${toCol}`, 'warning');
            return;
        }

        setMovingIds(prev => [...prev, draggableId]);

        try {
            if (toCol === 'Dispatched') {
                await tripService.dispatch(draggableId);
            } else if (toCol === 'Completed') {
                const odo = prompt('Enter final odometer reading:');
                if (!odo) throw new Error('Odometer required');
                await tripService.complete(draggableId, Number(odo));
            } else if (toCol === 'Cancelled') {
                await tripService.cancel(draggableId);
            }

            showToast(`Trip ${toCol.toLowerCase()} successfully`, 'success');
            fetchAll();
        } catch (err) {
            showToast(err.message || 'Update failed', 'error');
        } finally {
            setMovingIds(prev => prev.filter(id => id !== draggableId));
        }
    };

    const filtered = useMemo(() => {
        return trips.filter(t => {
            const q = search.toLowerCase();
            const v = vehicles.find(v => v._id === t.vehicle_id || v.id === t.vehicle_id);
            const d = drivers.find(d => d._id === t.driver_id || d.id === t.driver_id);
            return !q ||
                t.start_location.toLowerCase().includes(q) ||
                t.end_location.toLowerCase().includes(q) ||
                v?.name.toLowerCase().includes(q) ||
                d?.name.toLowerCase().includes(q);
        });
    }, [trips, search, vehicles, drivers]);

    const handleCreate = async () => {
        try {
            await tripService.create(form);
            showToast('Trip scheduled', 'success');
            setModal(false);
            setForm(EMPTY_FORM);
            fetchAll();
        } catch (err) {
            showToast(err.message || 'Creation failed', 'error');
        }
    };

    if (loading) return <SkeletonTable rows={10} cols={6} />;

    return (
        <div className="fade-in">
            <div className="page-header" style={{ marginBottom: '2rem' }}>
                <div>
                    <h1 className="page-title">Operations Control</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Managing {trips.length} active routes</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="search-wrap" style={{ width: '280px' }}>
                        <Search size={16} className="search-icon" />
                        <input
                            className="search-input"
                            placeholder="Search routes or drivers..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div style={{ display: 'flex', background: 'var(--bg-app)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <button
                            className={`btn btn-sm ${view === 'kanban' ? 'btn-primary' : ''}`}
                            onClick={() => setView('kanban')}
                            style={{ padding: '4px 12px', border: 'none' }}
                        >
                            <LayoutGrid size={16} />
                        </button>
                        <button
                            className={`btn btn-sm ${view === 'list' ? 'btn-primary' : ''}`}
                            onClick={() => setView('list')}
                            style={{ padding: '4px 12px', border: 'none' }}
                        >
                            <List size={16} />
                        </button>
                    </div>
                    <button className="btn btn-primary" onClick={() => setModal(true)}>
                        <Plus size={18} /> Schedule Trip
                    </button>
                </div>
            </div>

            {view === 'kanban' ? (
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="kanban-board">
                        {COLUMNS.map(col => (
                            <Droppable key={col} droppableId={col}>
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="kanban-col"
                                        style={{
                                            background: snapshot.isDraggingOver ? 'rgba(99, 102, 241, 0.1)' : ''
                                        }}
                                    >
                                        <div className="kanban-col-header">
                                            <span className="kanban-col-title">{col}</span>
                                            <span className="ff-badge" style={{ background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}>
                                                {filtered.filter(t => t.status === col).length}
                                            </span>
                                        </div>
                                        {filtered.filter(t => t.status === col).map((trip, idx) => (
                                            <TripCard
                                                key={trip._id}
                                                trip={trip}
                                                index={idx}
                                                isMoving={movingIds.includes(trip._id)}
                                                vehicle={vehicles.find(v => String(v._id || v.id) === String(trip.vehicle_id?._id || trip.vehicle_id?._id || trip.vehicle_id))}
                                                driver={drivers.find(d => String(d._id || d.id) === String(trip.driver_id?._id || trip.driver_id?._id || trip.driver_id))}
                                            />
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        ))}
                    </div>
                </DragDropContext>
            ) : (
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Reference</th>
                                <th>Vehicle</th>
                                <th>Driver</th>
                                <th>Route</th>
                                <th>Cargo</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(trip => {
                                return (
                                    <tr key={trip._id}>
                                        <td style={{ fontWeight: 700, fontFamily: 'monospace', color: '#6366f1' }}>#{String(trip._id).slice(-6).toUpperCase()}</td>
                                        <td>{getVehicleName(vehicles, trip.vehicle_id)}</td>
                                        <td>{getDriverName(drivers, trip.driver_id)}</td>
                                        <td style={{ fontSize: '0.85rem' }}>{trip.start_location} <ArrowRight size={10} style={{ margin: '0 4px', opacity: 0.5 }} /> {trip.end_location}</td>
                                        <td>{trip.cargo_weight}kg</td>
                                        <td><StatusBadge status={trip.status} /></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {modal && (
                <Modal
                    title="Schedule New Trip"
                    onClose={() => setModal(false)}
                    footer={
                        <>
                            <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleCreate}>Deploy Logistics</button>
                        </>
                    }
                >
                    <div className="form-grid">
                        <div className="form-group form-grid-full">
                            <label className="form-label">Vehicle</label>
                            <select className="form-control" value={form.vehicle_id} onChange={e => setForm({ ...form, vehicle_id: e.target.value })}>
                                <option value="">Select vehicle...</option>
                                {vehicles.filter(v => v.status === 'Available').map(v => (
                                    <option key={v._id} value={v._id}>{v.name} ({v.license_plate} - {v.max_load}kg capacity)</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group form-grid-full">
                            <label className="form-label">Driver</label>
                            <select className="form-control" value={form.driver_id} onChange={e => setForm({ ...form, driver_id: e.target.value })}>
                                <option value="">Select personnel...</option>
                                {drivers.filter(d => d.status === 'On Duty' || d.status === 'on_duty').map(d => (
                                    <option key={d._id} value={d._id}>{d.name} ({d.license_category})</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Origin</label>
                            <input className="form-control" placeholder="City A" value={form.start_location} onChange={e => setForm({ ...form, start_location: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Destination</label>
                            <input className="form-control" placeholder="City B" value={form.end_location} onChange={e => setForm({ ...form, end_location: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Cargo Weight (kg)</label>
                            <input className="form-control" type="number" placeholder="500" value={form.cargo_weight} onChange={e => setForm({ ...form, cargo_weight: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Start Time</label>
                            <input className="form-control" type="datetime-local" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} />
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}