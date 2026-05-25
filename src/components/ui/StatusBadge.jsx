import { cn } from '../../lib/utils.js';

const variants = {
  aktif: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  lancar: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  selesai: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  nonaktif: 'bg-slate-100 text-slate-600 ring-slate-200',
  perlu_perbaikan: 'bg-rose-50 text-rose-700 ring-rose-200',
  murajaah: 'bg-amber-50 text-amber-700 ring-amber-200',
  baru: 'bg-sky-50 text-sky-700 ring-sky-200',
  lulus: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  pindah: 'bg-orange-50 text-orange-700 ring-orange-200'
};

export default function StatusBadge({ status = 'aktif', children }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize shadow-sm ring-1', variants[status] || variants.nonaktif)}>
      {children || status.replaceAll('_', ' ')}
    </span>
  );
}
