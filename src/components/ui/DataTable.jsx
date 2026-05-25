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
    <div className={cn('overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm', className)}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-600">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-5 py-3.5">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, rowIndex) => (
              <tr key={row[keyField] || rowIndex} className="transition hover:bg-slate-50/80">
                {columns.map((column) => (
                  <td key={column.key} className="px-5 py-4 text-slate-700">
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
