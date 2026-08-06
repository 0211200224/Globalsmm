import type { ReactNode } from "react";

export type DataTableColumn<T> = {
  header: string;
  align?: "left" | "right";
  render: (row: T) => ReactNode;
};

type DataTableProps<T> = {
  title?: string;
  action?: ReactNode;
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyMessage?: string;
};

export function DataTable<T>({
  title,
  action,
  columns,
  rows,
  rowKey,
  emptyMessage = "Nothing to show yet.",
}: DataTableProps<T>) {
  return (
    <div className="glass-panel rounded-xl overflow-hidden">
      {(title || action) && (
        <div className="p-stack-md flex justify-between items-center border-b border-outline-variant/10">
          {title && (
            <h4 className="text-headline-md font-bold text-on-surface">
              {title}
            </h4>
          )}
          {action}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-surface-container-high/30">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.header}
                  className={`px-6 py-4 text-label-sm font-bold text-on-surface-variant uppercase tracking-wider ${
                    col.align === "right" ? "text-right" : ""
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/5">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-10 text-center text-body-sm text-on-surface-variant"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={rowKey(row)}
                  className="hover:bg-primary/5 transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={col.header}
                      className={`px-6 py-4 ${
                        col.align === "right" ? "text-right" : ""
                      }`}
                    >
                      {col.render(row)}
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
