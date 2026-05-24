import { cn } from '../../lib/utils.js';

export default function PageHeader({ eyebrow, title, description, actions, className }) {
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div>
        {eyebrow ? <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">{eyebrow}</p> : null}
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
