import { Search } from 'lucide-react';
import { cn } from '../../lib/utils.js';

export default function FilterBar({ children, onSubmit, actionLabel = 'Tampilkan', className }) {
  return (
    <form
      className={cn('rounded-2xl border border-white/70 bg-white/85 p-5 shadow-sm shadow-slate-200/70 ring-1 ring-slate-200/60 backdrop-blur', className)}
      onSubmit={onSubmit}
    >
      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
        <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm shadow-emerald-700/20 transition hover:-translate-y-0.5 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" type="submit">
          <Search className="h-4 w-4" />
          {actionLabel}
        </button>
      </div>
    </form>
  );
}
