import { X } from 'lucide-react';

export default function FormModal({ open, title, description, children, onClose, size = 'lg' }) {
  if (!open) return null;

  const maxWidth = size === 'xl' ? 'max-w-4xl' : 'max-w-3xl';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-hidden bg-slate-950/40 p-3 backdrop-blur-sm sm:p-6">
      <div className={`my-3 flex max-h-[90vh] w-full ${maxWidth} flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-2xl sm:my-4`}>
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-slate-950">{title}</h2>
            {description ? <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p> : null}
          </div>
          <button className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" type="button" onClick={onClose} aria-label="Tutup">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {children}
        </div>
      </div>
    </div>
  );
}
