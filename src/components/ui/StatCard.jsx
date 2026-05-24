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
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <strong className="mt-2 block text-3xl font-semibold tracking-tight text-slate-950">{value}</strong>
        </div>
        {Icon ? (
          <span className={cn('grid h-11 w-11 place-items-center rounded-lg ring-1', tones[tone])}>
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 text-sm">
        <span className="text-slate-500">{description}</span>
        {trend ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 font-medium text-emerald-700">
            <ArrowUpRight className="h-3.5 w-3.5" />
            {trend}
          </span>
        ) : null}
      </div>
    </article>
  );
}
