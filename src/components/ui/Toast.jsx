import { createContext, useContext, useMemo, useState } from 'react';
import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { cn } from '../../lib/utils.js';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const value = useMemo(() => ({
    showToast(nextToast) {
      setToast(nextToast);
      window.setTimeout(() => setToast(null), nextToast.duration || 3200);
    }
  }), []);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? <ToastMessage toast={toast} onClose={() => setToast(null)} /> : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return { showToast: () => {} };
  }
  return context;
}

function ToastMessage({ toast, onClose }) {
  const isError = toast.variant === 'error';
  const Icon = isError ? XCircle : toast.variant === 'success' ? CheckCircle2 : Info;

  return (
    <div className="fixed bottom-5 right-5 z-50 w-[calc(100%-2.5rem)] max-w-sm">
      <div className={cn('flex items-start gap-3 rounded-xl border bg-white p-4 shadow-2xl', isError ? 'border-rose-200' : 'border-slate-200')}>
        <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', isError ? 'text-rose-600' : 'text-emerald-600')} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-950">{toast.title}</p>
          {toast.description ? <p className="mt-1 text-sm text-slate-500">{toast.description}</p> : null}
        </div>
        <button className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" type="button" onClick={onClose} aria-label="Tutup notifikasi">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
