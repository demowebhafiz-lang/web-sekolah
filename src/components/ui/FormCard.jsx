import { cn } from '../../lib/utils.js';

export default function FormCard({ title, description, children, footer, className }) {
  return (
    <section className={cn('rounded-xl border border-slate-200 bg-white shadow-sm', className)}>
      {(title || description) ? (
        <div className="border-b border-slate-100 px-6 py-5">
          {title ? <h3 className="text-base font-bold text-slate-950">{title}</h3> : null}
          {description ? <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{description}</p> : null}
        </div>
      ) : null}
      <div className="p-6">{children}</div>
      {footer ? <div className="border-t border-slate-100 px-6 py-5">{footer}</div> : null}
    </section>
  );
}
