import { AlertTriangle, RotateCcw } from 'lucide-react';
import { cn } from '../../lib/utils.js';

export default function ErrorState({
  title = 'Gagal memuat data',
  description = 'Periksa koneksi atau coba lagi.',
  actionLabel = 'Coba Lagi',
  onRetry,
  className
}) {
  return (
    <div className={cn('grid min-h-36 place-items-center rounded-xl border border-rose-200 bg-rose-50 p-6 text-center', className)}>
      <div className="max-w-md">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-white text-rose-600 shadow-sm">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-rose-950">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-rose-700">{description}</p>
        {onRetry ? (
          <button className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700" type="button" onClick={onRetry}>
            <RotateCcw className="h-4 w-4" />
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
