import { Search } from 'lucide-react';
import { cn } from '../../lib/utils.js';

export default function FilterBar({ children, onSubmit, actionLabel = 'Tampilkan', className }) {
  return (
    <form
      className={cn('rounded-xl border border-slate-200 bg-white p-5 shadow-sm', className)}
      onSubmit={onSubmit}
    >
      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
        <button className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" type="submit">
          <Search className="h-4 w-4" />
          {actionLabel}
        </button>
      </div>
    </form>
  );
}
