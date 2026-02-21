import React, { useEffect } from 'react';

const STATUS_CONFIG = {
    available: { label: 'Available', color: 'var(--color-available)', dot: 'pulse', icon: null },
    on_trip: { label: 'On Trip', color: 'var(--color-on-trip)', dot: 'pulse', icon: null },
    in_shop: { label: 'In Shop', color: 'var(--color-in-shop)', dot: null, icon: '🔧', iconAnim: 'spin-slow' },
    retired: { label: 'Retired', color: 'var(--color-retired)', dot: null, icon: null, textDecoration: 'line-through' },
    suspended: { label: 'Suspended', color: 'var(--color-suspended)', dot: null, icon: '⚠', anim: 'shake' },
    on_duty: { label: 'On Duty', color: 'var(--color-available)', dot: 'steady', icon: null },
    off_duty: { label: 'Off Duty', color: 'var(--color-retired)', dot: 'steady', icon: null },
    draft: { label: 'Draft', color: 'var(--color-retired)', pill: true },
    dispatched: { label: 'Dispatched', color: 'var(--color-on-trip)', dot: 'pulse', pill: true },
    completed: { label: 'Completed', color: 'var(--color-available)', pill: true },
    cancelled: { label: 'Cancelled', color: 'var(--color-suspended)', pill: true, opacity: 0.7 },
    scheduled: { label: 'Scheduled', color: 'var(--color-in-shop)', pill: true },
    in_progress: { label: 'In Progress', color: 'var(--color-on-trip)', dot: 'pulse', pill: true },
    done: { label: 'Done', color: 'var(--color-available)', pill: true },
    expired: { label: 'Expired', color: 'var(--color-suspended)', dot: null, icon: '⚠', anim: 'shake' },
};

export default function StatusBadge({ status }) {
    useEffect(() => {
        if (document.getElementById('ff-status-badge-styles')) return;
        const style = document.createElement('style');
        style.id = 'ff-status-badge-styles';
        style.innerHTML = `
      .ff-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 2px 10px;
        border-radius: 99px;
        font-size: 12px;
        font-weight: 600;
        white-space: nowrap;
        border: 1px solid rgba(0,0,0,0.05);
      }
      .ff-badge-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: currentColor;
      }
      .ff-badge-dot-pulse {
        animation: pulse-dot 1.5s infinite;
      }
      .ff-badge-shake {
        animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
      }
      .ff-badge-spin {
        display: inline-block;
        animation: spin-slow 3s linear infinite;
      }
      .ff-badge-pill {
        background: currentColor;
        color: white !important;
      }
      .ff-badge-pill span {
        color: white !important;
      }
    `;
        document.head.appendChild(style);
    }, []);

    if (!status) return null;
    const key = String(status).toLowerCase().trim().replace(/\s+/g, '_');
    const config = STATUS_CONFIG[key] || { label: status, color: 'var(--text-muted)' };

    const badgeStyle = {
        color: config.color,
        backgroundColor: config.pill ? config.color : `${config.color}15`,
        borderColor: config.pill ? 'transparent' : `${config.color}30`,
        textDecoration: config.textDecoration || 'none',
        opacity: config.opacity || 1,
    };

    const textStyle = {
        color: config.pill ? 'white' : config.color
    };

    return (
        <span
            className={`ff-badge ${config.anim ? `ff-badge-${config.anim}` : ''} ${config.pill ? 'ff-badge-pill' : ''}`}
            style={badgeStyle}
        >
            {config.icon && (
                <span className={config.iconAnim ? `ff-badge-${config.iconAnim.replace('spin-slow', 'spin')}` : ''}>
                    {config.icon}
                </span>
            )}
            {config.dot && (
                <span className={`ff-badge-dot ${config.dot === 'pulse' ? 'ff-badge-dot-pulse' : ''}`} />
            )}
            <span style={textStyle}>{config.label}</span>
            {key === 'retired' && <span style={{ textDecoration: 'none', marginLeft: -4 }}> </span>}
        </span>
    );
}
