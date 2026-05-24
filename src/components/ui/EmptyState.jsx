import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'Belum ada data', description = 'Data akan tampil setelah tersedia.', action }) {
  return (
    <div className="grid min-h-44 place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-8 text-center">
      <div>
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
          <Inbox className="h-5 w-5" />
        </span>
        <h3 className="mt-4 text-sm font-semibold text-slate-950">{title}</h3>
        <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    </div>
  );
}
