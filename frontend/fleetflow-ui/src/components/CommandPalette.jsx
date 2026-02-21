import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Truck,
    User,
    MapPin,
    CornerDownLeft,
    Command,
    X
} from 'lucide-react';
import { useFleet } from '@/context/FleetContext';
import StatusBadge from './StatusBadge';

export default function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const navigate = useNavigate();
    const inputRef = useRef(null);

    // Note: Command Palette uses FleetContext as per requirements
    const { vehicles, drivers, trips } = useFleet() || { vehicles: [], drivers: [], trips: [] };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(true);
            }
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
            setQuery('');
        }
    }, [isOpen]);

    useEffect(() => {
        if (!query) {
            setResults([]);
            return;
        }

        const q = query.toLowerCase();
        const v = vehicles.filter(v =>
            v.name.toLowerCase().includes(q) || v.license_plate.toLowerCase().includes(q)
        ).map(v => ({ ...v, type: 'vehicle', icon: '🚐' }));

        const d = drivers.filter(d =>
            d.name.toLowerCase().includes(q)
        ).map(d => ({ ...d, type: 'driver', icon: '👤' }));

        const t = trips.filter(t =>
            t.reference?.toLowerCase().includes(q) ||
            t.start_location?.toLowerCase().includes(q) ||
            t.end_location?.toLowerCase().includes(q)
        ).map(t => ({ ...t, type: 'trip', icon: '📦' }));

        setResults([...v, ...d, ...t].slice(0, 8));
        setActiveIndex(0);
    }, [query, vehicles, drivers, trips]);

    const handleSelect = (item) => {
        if (item.type === 'vehicle') navigate('/vehicles', { state: { highlightId: item.id || item._id } });
        if (item.type === 'driver') navigate('/drivers', { state: { highlightId: item.id || item._id } });
        if (item.type === 'trip') navigate('/trips', { state: { highlightId: item.id || item._id } });
        setIsOpen(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => (prev + 1) % results.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => (prev - 1 + results.length) % results.length);
        } else if (e.key === 'Enter' && results[activeIndex]) {
            handleSelect(results[activeIndex]);
        }
    };

    if (!isOpen) return null;

    return createPortal(
        <div
            className="modal-overlay"
            onClick={() => setIsOpen(false)}
            style={{ background: 'rgba(0,0,0,0.6)', cursor: 'default' }}
        >
            <div
                className="ff-card"
                onClick={e => e.stopPropagation()}
                style={{
                    width: '560px',
                    maxHeight: '480px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    animation: 'fadeInScale 0.2s ease-out forwards',
                    padding: 0
                }}
            >
                <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Search size={20} color="var(--text-muted)" />
                    <input
                        ref={inputRef}
                        className="form-control"
                        placeholder="Search assets, personnel, or routes..."
                        style={{ border: 'none', padding: 0, fontSize: '1.1rem', background: 'transparent' }}
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <div style={{ display: 'flex', gap: '4px' }}>
                        <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'var(--bg-app)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text-muted)' }}>ESC</span>
                    </div>
                </div>

                <div style={{ overflowY: 'auto', flex: 1 }}>
                    {results.length === 0 ? (
                        <div style={{ padding: '3rem 2rem', textAlign: 'center' }}>
                            <Command size={40} color="var(--border)" style={{ marginBottom: '1rem' }} />
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                {query ? 'No matching resources found.' : 'Type to search across the fleet...'}
                            </p>
                        </div>
                    ) : (
                        <div style={{ padding: '0.5rem' }}>
                            {['vehicle', 'driver', 'trip'].map(type => {
                                const group = results.filter(r => r.type === type);
                                if (group.length === 0) return null;
                                return (
                                    <div key={type}>
                                        <div style={{ padding: '0.75rem 0.75rem 0.25rem', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            {type}s
                                        </div>
                                        {group.map((item, idx) => {
                                            const globalIdx = results.indexOf(item);
                                            return (
                                                <div
                                                    key={item.id || item._id}
                                                    onClick={() => handleSelect(item)}
                                                    onMouseEnter={() => setActiveIndex(globalIdx)}
                                                    style={{
                                                        padding: '0.75rem',
                                                        borderRadius: '8px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '12px',
                                                        cursor: 'pointer',
                                                        background: activeIndex === globalIdx ? 'var(--primary-light)' : 'transparent',
                                                        color: activeIndex === globalIdx ? 'var(--primary)' : 'inherit',
                                                        transition: 'var(--transition-fast)'
                                                    }}
                                                >
                                                    <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                                                            {item.name || item.reference || 'Unnamed Resource'}
                                                        </div>
                                                        <div style={{ fontSize: '0.75rem', color: activeIndex === globalIdx ? 'var(--primary)' : 'var(--text-muted)', opacity: 0.8 }}>
                                                            {item.type === 'trip' ? `${item.start_location} → ${item.end_location}` : (item.license_plate || item.license_category || '')}
                                                        </div>
                                                    </div>
                                                    {item.status && <StatusBadge status={item.status} />}
                                                    {activeIndex === globalIdx && <CornerDownLeft size={14} opacity={0.5} />}
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div style={{ padding: '0.75rem 1.25rem', background: 'var(--bg-app)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <kbd style={{ padding: '2px 4px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '3px' }}>↑↓</kbd> to navigate
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <kbd style={{ padding: '2px 4px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '3px' }}>↵</kbd> to select
                        </span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>FleetFlow Search</span>
                </div>
            </div>
        </div>,
        document.body
    );
}
