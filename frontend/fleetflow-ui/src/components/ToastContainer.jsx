import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { toastEvents } from '../hooks/useToast';

const ICONS = {
  success: <CheckCircle size={18} />,
  error: <AlertCircle size={18} />,
  warning: <AlertTriangle size={18} />,
  info: <Info size={18} />,
};

const Toast = ({ id, message, type, duration, onRemove }) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleRemove();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration]);

  const handleRemove = () => {
    setIsClosing(true);
    setTimeout(() => onRemove(id), 280); // match transition speed
  };

  return (
    <div
      className={`ff-toast ff-toast-${type} ${isClosing ? 'ff-toast-exit' : ''}`}
      style={{ animation: `slideInRight var(--transition-med)` }}
    >
      <div className="ff-toast-content">
        <span className="ff-toast-icon">{ICONS[type]}</span>
        <span className="ff-toast-message">{message}</span>
        <button className="ff-toast-close" onClick={handleRemove}>
          <X size={16} />
        </button>
      </div>
      <div
        className="ff-toast-progress"
        style={{ animation: `shrinkWidth ${duration}ms linear forwards` }}
      />
    </div>
  );
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToast = (e) => {
      setToasts(prev => [...prev.slice(-4), e.detail]); // keep last 5
    };

    toastEvents.addEventListener('ff-toast', handleToast);

    // Inject styles
    if (!document.getElementById('ff-toast-styles')) {
      const style = document.createElement('style');
      style.id = 'ff-toast-styles';
      style.innerHTML = `
        .ff-toast-container {
          position: fixed;
          top: 1.5rem;
          right: 1.5rem;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          pointer-events: none;
        }
        .ff-toast {
          pointer-events: auto;
          min-width: 320px;
          max-width: 400px;
          background: rgba(20, 26, 46, 0.9);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          overflow: hidden;
          position: relative;
        }
        .ff-toast-exit {
          transform: translateX(120%);
          opacity: 0;
          transition: var(--transition-med);
        }
        .ff-toast-content {
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .ff-toast-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ff-toast-message {
          flex: 1;
          font-size: 14px;
          font-weight: 500;
          color: #f8fafc;
        }
        .ff-toast-close {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.4);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          border-radius: 50%;
          transition: all 0.2s ease;
        }
        .ff-toast-close:hover { 
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }
        .ff-toast-progress {
          height: 3px;
          position: absolute;
          bottom: 0;
          left: 0;
          background: var(--primary);
          opacity: 0.5;
        }
        .ff-toast-success .ff-toast-icon { color: #4ade80; }
        .ff-toast-error .ff-toast-icon { color: #f87171; }
        .ff-toast-warning .ff-toast-icon { color: #fbbf24; }
        .ff-toast-info .ff-toast-icon { color: #60a5fa; }
        .ff-toast-success .ff-toast-progress { background: #4ade80; }
        .ff-toast-error .ff-toast-progress { background: #f87171; }
        .ff-toast-warning .ff-toast-progress { background: #fbbf24; }
        .ff-toast-info .ff-toast-progress { background: #60a5fa; }
        
        @keyframes shrinkWidth {
          from { width: 100%; }
          to { width: 0%; }
        }
      `;
      document.head.appendChild(style);
    }

    return () => toastEvents.removeEventListener('ff-toast', handleToast);
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return createPortal(
    <div className="ff-toast-container">
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} onRemove={removeToast} />
      ))}
    </div>,
    document.body
  );
}
