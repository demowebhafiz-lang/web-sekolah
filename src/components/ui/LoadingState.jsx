import { Loader2 } from 'lucide-react';

export default function LoadingState({ label = 'Memuat data...' }) {
  return (
    <div className="grid min-h-36 place-items-center rounded-xl border border-slate-200 bg-white p-6 text-center">
      <div className="inline-flex items-center gap-3 rounded-full bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
        <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
        {label}
      </div>
    </div>
  );
}
