'use client';

import { useEffect, useRef } from 'react';
import { useToast } from '@/context/ToastContext';

const icons: Record<string, string> = {
  success: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 12 2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>',
  info: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
  warning: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
  error: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>',
};

const colors: Record<string, { bg: string; border: string; text: string }> = {
  success: { bg: 'rgba(16, 185, 129, 0.15)', border: '#10B981', text: '#059669' },
  info: { bg: 'rgba(124, 58, 237, 0.15)', border: '#7C3AED', text: '#6D28D9' },
  warning: { bg: 'rgba(245, 158, 11, 0.15)', border: '#F59E0B', text: '#D97706' },
  error: { bg: 'rgba(239, 68, 68, 0.15)', border: '#EF4444', text: '#DC2626' },
};

function Toast({ id, message, type }: { id: number; message: string; type: string }) {
  const { dismiss } = useToast();
  const ref = useRef<HTMLDivElement>(null);
  const c = colors[type] || colors.info;

  useEffect(() => {
    requestAnimationFrame(() => {
      ref.current?.classList.add('fidgetopia-toast--visible');
    });
  }, []);

  const handleDismiss = () => {
    ref.current?.classList.add('fidgetopia-toast--dismissed');
    ref.current?.classList.remove('fidgetopia-toast--visible');
    setTimeout(() => dismiss(id), 300);
  };

  return (
    <div
      ref={ref}
      className={`fidgetopia-toast fidgetopia-toast--${type}`}
      style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}
    >
      <span className="fidgetopia-toast-icon" dangerouslySetInnerHTML={{ __html: icons[type] || icons.info }} />
      <span className="fidgetopia-toast-msg">{message}</span>
      <button className="fidgetopia-toast-close" onClick={handleDismiss} aria-label="Dismiss notification">&times;</button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useToast();

  return (
    <div id="fidgetopia-toast-container" aria-live="polite" aria-atomic="false" role="status">
      {toasts.map(toast => (
        <Toast key={toast.id} id={toast.id} message={toast.message} type={toast.type} />
      ))}
    </div>
  );
}
