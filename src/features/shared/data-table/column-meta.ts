import type { CellData, RowData, TableFeatures } from '@tanstack/react-table';

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<in out TFeatures extends TableFeatures, in out TData extends RowData, TValue extends CellData = CellData> {
    /**
     * Where this column goes in the phone card layout (below 768px). Unset columns are placed by a default:
     * `select` / `actions` columns keep their role, a column with "status" in its id becomes the badge,
     * the first other column is the card title and the rest become "label: value" lines.
     */
    mobile?: 'title' | 'status' | 'actions' | 'hide';
    /** Label for the card line when the column header is not plain text. */
    mobileLabel?: string;
  }
}
