import React from 'react';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  data,
  emptyMessage = 'No data available.',
}: DataTableProps<T>) {
  return (
    <div className="w-full overflow-hidden border border-border rounded-xl bg-neutral-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-slate-900/30">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className="p-4 text-xs font-semibold uppercase tracking-wider text-neutral-muted"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-sm text-neutral-muted">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-slate-800/10 transition-colors">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="p-4 text-sm text-neutral-text">
                      {typeof col.accessor === 'function'
                        ? col.accessor(row)
                        : (row[col.accessor] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
