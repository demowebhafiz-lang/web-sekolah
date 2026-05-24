import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDialog({ open, title, description, confirmLabel = 'Konfirmasi', cancelLabel = 'Batal', onConfirm, onCancel, tone = 'danger' }) {
  if (!open) return null;

  const confirmClass = tone === 'danger'
    ? 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500'
    : 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500';

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="flex items-start gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-700 ring-1 ring-amber-100">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold text-slate-950">{title}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
          </div>
          <button className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" type="button" onClick={onCancel} aria-label="Tutup">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50" type="button" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button className={`rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${confirmClass}`} type="button" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
