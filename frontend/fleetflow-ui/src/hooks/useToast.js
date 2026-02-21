// Custom event emitter for zero-dependency toasts
const toastEvents = new EventTarget();

export const showToast = (message, type = 'info', duration = 4000) => {
    const detail = {
        id: Math.random().toString(36).substring(2, 9),
        message,
        type,
        duration
    };
    toastEvents.dispatchEvent(new CustomEvent('ff-toast', { detail }));
};

export { toastEvents };
