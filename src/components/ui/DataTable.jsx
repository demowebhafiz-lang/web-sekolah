import EmptyState from './EmptyState.jsx';
import LoadingState from './LoadingState.jsx';
import { cn } from '../../lib/utils.js';

export default function DataTable({ columns, rows, keyField = 'id', loading, emptyTitle = 'Belum ada data', emptyDescription, className }) {
  if (loading) {
    return <LoadingState label="Memuat data tabel..." />;
  }

  if (!rows?.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className={cn('overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/70 ring-1 ring-white/70', className)}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-50/90 text-xs font-bold uppercase tracking-wider text-slate-600">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="border-b border-slate-200/70 px-5 py-3.5">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, rowIndex) => (
              <tr key={row[keyField] || rowIndex} className="transition hover:bg-emerald-50/40">
                {columns.map((column) => (
                  <td key={column.key} className="px-5 py-4 align-middle text-slate-700">
                    {column.render ? column.render(row, rowIndex) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
