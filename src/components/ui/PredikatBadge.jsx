import { cn } from '../../lib/utils.js';

const variants = {
  A: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  B: 'bg-sky-50 text-sky-700 ring-sky-200',
  C: 'bg-amber-50 text-amber-700 ring-amber-200',
  D: 'bg-rose-50 text-rose-700 ring-rose-200'
};

export default function PredikatBadge({ value = '-', className }) {
  const predikat = String(value || '-').toUpperCase();

  return (
    <span className={cn('inline-flex min-w-8 items-center justify-center rounded-full px-2.5 py-1 text-xs font-bold ring-1', variants[predikat] || 'bg-slate-100 text-slate-600 ring-slate-200', className)}>
      {predikat}
    </span>
  );
}

export function getPredikat(nilai) {
  const score = Number(nilai);

  if (Number.isNaN(score)) {
    return '-';
  }

  if (score >= 90) {
    return 'A';
  }

  if (score >= 80) {
    return 'B';
  }

  if (score >= 70) {
    return 'C';
  }

  return 'D';
}
