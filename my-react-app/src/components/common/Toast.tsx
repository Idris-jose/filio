import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite" aria-label="Notifications">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast toast-${toast.type}`} role="status">
          {toast.type === 'success' && <CheckCircle size={16} color="var(--color-success)" />}
          {toast.type === 'error' && <AlertCircle size={16} color="var(--color-error)" />}
          {toast.type === 'info' && <Info size={16} color="var(--color-amber)" />}
          <span>{toast.message}</span>
          <button
            style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', opacity: 0.7 }}
            onClick={() => removeToast(toast.id)}
            aria-label="Dismiss notification"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
