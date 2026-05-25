import { cn } from '../../lib/utils.js';

export default function PageHeader({ eyebrow, title, description, actions, className }) {
  return (
    <div className={cn('relative overflow-hidden rounded-2xl border border-white/70 bg-white/75 p-5 shadow-sm shadow-slate-200/70 backdrop-blur sm:p-6', className)}>
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-amber-400 to-sky-500" />
      <div className="absolute -right-16 -top-20 h-44 w-44 rounded-full bg-emerald-100/80 blur-3xl" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          {eyebrow ? <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">{eyebrow}</p> : null}
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
          {description ? <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-slate-600">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2.5 sm:pt-1">{actions}</div> : null}
      </div>
    </div>
  );
}
