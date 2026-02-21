import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    MapPin,
    Truck,
    Fuel,
    X
} from 'lucide-react';

export default function QuickActionFAB() {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const actions = [
        {
            label: 'New Trip',
            icon: <MapPin size={20} />,
            path: '/trips',
            state: { openCreate: true },
            color: 'var(--blue-t)'
        },
        {
            label: 'Add Vehicle',
            icon: <Truck size={20} />,
            path: '/vehicles',
            state: { openCreate: true },
            color: 'var(--green-t)'
        },
        {
            label: 'Log Fuel',
            icon: <Fuel size={20} />,
            path: '/fuel',
            state: { openCreate: true },
            color: 'var(--orange-t)'
        },
    ];

    return (
        <div
            ref={menuRef}
            style={{
                position: 'fixed',
                bottom: '2rem',
                right: '2rem',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                gap: '12px'
            }}
        >
            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '12px', marginBottom: '8px' }}>
                {actions.map((action, i) => (
                    <div
                        key={action.label}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            visibility: isOpen ? 'visible' : 'hidden',
                            opacity: isOpen ? 1 : 0,
                            transform: isOpen ? 'translateY(0)' : 'translateY(20px)',
                            transition: `all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${i * 0.05}s`,
                            pointerEvents: isOpen ? 'auto' : 'none'
                        }}
                    >
                        <span style={{
                            background: 'rgba(0,0,0,0.8)',
                            color: 'white',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}>
                            {action.label}
                        </span>
                        <button
                            onClick={() => {
                                navigate(action.path, { state: action.state });
                                setIsOpen(false);
                            }}
                            className="ff-card"
                            style={{
                                width: '44px',
                                height: '44px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border)',
                                cursor: 'pointer',
                                color: action.color,
                                transition: 'var(--transition-fast)'
                            }}
                        >
                            {action.icon}
                        </button>
                    </div>
                ))}
            </div>

            {/* Primary FAB */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 8px 16px var(--accent-glow)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isOpen ? 'rotate(135deg)' : 'rotate(0)'
                }}
            >
                <Plus size={28} />
            </button>

            <style dangerouslySetInnerHTML={{
                __html: `
        .ff-card:hover {
          transform: scale(1.1);
          border-color: var(--primary) !important;
          box-shadow: var(--shadow-card-hover) !important;
        }
      `}} />
        </div>
    );
}
