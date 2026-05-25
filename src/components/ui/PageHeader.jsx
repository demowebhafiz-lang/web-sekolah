import { cn } from '../../lib/utils.js';

export default function PageHeader({ eyebrow, title, description, actions, className }) {
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between', className)}>
      <div className="flex-1">
        {eyebrow ? <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">{eyebrow}</p> : null}
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
        {description ? <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-slate-600">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2.5 sm:pt-1">{actions}</div> : null}
    </div>
  );
}
