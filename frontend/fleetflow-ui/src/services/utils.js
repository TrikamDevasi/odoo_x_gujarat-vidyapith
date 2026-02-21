/**
 * Common utility functions for the FleetFlow UI
 */

export const getVehicleName = (vehicles, idOrObj) => {
    if (!idOrObj) return 'Unknown';
    if (typeof idOrObj === 'object' && idOrObj.name) return idOrObj.name;
    const idStr = String(idOrObj?._id || idOrObj?.id || idOrObj);
    const v = vehicles.find(v => String(v._id || v.id) === idStr);
    return v ? v.name : `Vehicle #${idStr.slice(-6)}`;
};

export const getDriverName = (drivers, idOrObj) => {
    if (!idOrObj) return 'Assigning...';
    if (typeof idOrObj === 'object' && idOrObj.name) return idOrObj.name;
    const idStr = String(idOrObj?._id || idOrObj?.id || idOrObj);
    const d = drivers.find(d => String(d._id || d.id) === idStr);
    return d ? d.name : `Driver #${idStr.slice(-6)}`;
};

export const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
    }).format(val || 0);
};

export const getRelativeTime = (date) => {
    if (!date) return '---';
    const diff = Date.now() - new Date(date).getTime();
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return new Date(date).toLocaleDateString();
};

export const getStatusColor = (status) => {
    const s = String(status).toLowerCase().replace(' ', '_');
    return `var(--color-${s})`;
};

/**
 * Simple classname merger (similar to clsx or cn)
 */
export const cn = (...inputs) => {
    return inputs
        .filter(Boolean)
        .map(input => {
            if (typeof input === 'string') return input;
            if (Array.isArray(input)) return cn(...input);
            if (typeof input === 'object') {
                return Object.entries(input)
                    .filter(([_, value]) => Boolean(value))
                    .map(([key]) => key)
                    .join(' ');
            }
            return '';
        })
        .join(' ')
        .trim();
};
