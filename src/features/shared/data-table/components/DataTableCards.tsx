'use client';

import type { LegacyRow, LegacyTable } from '@tanstack/react-table/legacy';
import { flexRender, type RowData } from '@tanstack/react-table';
import { cn } from '@/lib/utils';
import '../column-meta';

type LegacyCell<TData extends RowData> = ReturnType<LegacyRow<TData>['getVisibleCells']>[number];

type Role = 'select' | 'actions' | 'status' | 'title' | 'field' | 'hide';

function humanize(id: string) {
  return id.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ');
}

function roleOf<TData extends RowData>(cell: LegacyCell<TData>): Role {
  const id = cell.column.id;
  if (id === 'select') return 'select';
  const explicit = cell.column.columnDef.meta?.mobile;
  if (explicit) return explicit;
  if (id === 'actions') return 'actions';
  if (/status/i.test(id)) return 'status';
  return 'field';
}

function labelOf<TData extends RowData>(cell: LegacyCell<TData>): string {
  const def = cell.column.columnDef;
  return def.meta?.mobileLabel ?? (typeof def.header === 'string' ? def.header : humanize(cell.column.id));
}

/** Phone layout for a DataTable: one card per row. Columns are placed by `meta.mobile`, with sensible defaults. */
export function DataTableCards<TData extends RowData>({ table, className }: { table: LegacyTable<TData>; className?: string }) {
  return (
    <ul className={cn('divide-y divide-border/60', className)}>
      {table.getRowModel().rows.map((row) => {
        const cells = row.getVisibleCells().map((cell) => ({ cell, role: roleOf(cell) }));
        const explicitTitle = cells.find((c) => c.role === 'title');
        const firstField = explicitTitle ? undefined : cells.find((c) => c.role === 'field');
        const title = explicitTitle ?? firstField;
        const select = cells.find((c) => c.role === 'select');
        const statuses = cells.filter((c) => c.role === 'status');
        const actions = cells.find((c) => c.role === 'actions');
        const fields = cells.filter((c) => c.role === 'field' && c !== title);
        const render = (c?: { cell: LegacyCell<TData> }) =>
          c ? flexRender(c.cell.column.columnDef.cell, c.cell.getContext()) : null;
        return (
          <li key={row.id} data-state={row.getIsSelected() ? 'selected' : undefined} className="flex flex-col gap-2.5 p-3.5 data-[state=selected]:bg-muted/60">
            <div className="flex items-start gap-3">
              {select ? <div className="pt-0.5">{render(select)}</div> : null}
              <div className="min-w-0 flex-1 text-sm font-semibold text-foreground">{render(title)}</div>
              {statuses.length > 0 ? (
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {statuses.map((c) => (
                    <div key={c.cell.id}>{render(c)}</div>
                  ))}
                </div>
              ) : null}
            </div>
            {fields.length > 0 ? (
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                {fields.map((f) => (
                  <div key={f.cell.id} className="min-w-0">
                    <dt className="text-muted-foreground capitalize">{labelOf(f.cell)}</dt>
                    <dd className="mt-0.5 break-words font-medium text-foreground">{render(f)}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {actions ? <div className="flex justify-end">{render(actions)}</div> : null}
          </li>
        );
      })}
    </ul>
  );
}
