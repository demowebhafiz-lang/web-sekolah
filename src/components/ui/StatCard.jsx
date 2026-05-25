import { ArrowUpRight } from 'lucide-react';
import { cn } from '../../lib/utils.js';

export default function StatCard({ title, value, description, icon: Icon, tone = 'emerald', trend }) {
  const tones = {
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    amber: 'bg-amber-50 text-amber-700 ring-amber-100',
    slate: 'bg-slate-100 text-slate-700 ring-slate-200',
    rose: 'bg-rose-50 text-rose-700 ring-rose-100'
  };

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <strong className="mt-2.5 block text-3xl font-bold tracking-tight text-slate-950">{value}</strong>
        </div>
        {Icon ? (
          <span className={cn('grid h-12 w-12 place-items-center rounded-xl ring-1', tones[tone])}>
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
      </div>
      <div className="mt-5 flex items-center justify-between gap-3 text-sm">
        <span className="text-slate-600">{description}</span>
        {trend ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            <ArrowUpRight className="h-3.5 w-3.5" />
            {trend}
          </span>
        ) : null}
      </div>
    </article>
  );
}
