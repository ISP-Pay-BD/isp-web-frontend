import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { DataTable } from '@/features/shared/data-table';

let mobile = false;
vi.mock('@/hooks/use-mobile', () => ({ useIsMobile: () => mobile }));
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams('page=1'),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/admin/customers',
}));

type Row = { id: string; name: string; plan: string; status: string };
const rows: Row[] = [
  { id: '1', name: 'Rahim Uddin', plan: '20 Mbps', status: 'active' },
  { id: '2', name: 'Karim Hossain', plan: '10 Mbps', status: 'expired' },
];
const columns: LegacyColumnDef<Row, unknown>[] = [
  { accessorKey: 'name', header: 'Subscriber', cell: ({ row }) => <b>{row.original.name}</b>, meta: { mobile: 'title' } },
  { accessorKey: 'plan', header: 'Plan' },
  { accessorKey: 'status', header: 'Status', cell: ({ row }) => <span>{row.original.status}</span> },
  { id: 'actions', header: '', cell: () => <button type="button">Open</button> },
];

beforeEach(() => {
  mobile = false;
  vi.stubGlobal('localStorage', { getItem: () => null, setItem: () => undefined, removeItem: () => undefined });
});

describe('DataTable', () => {
  it('renders a sortable, sticky-header table on desktop', () => {
    render(<DataTable columns={columns} data={rows} urlState />);
    const table = screen.getByRole('table');
    expect(within(table).getByText('Rahim Uddin')).toBeTruthy();
    const head = within(table).getByRole('columnheader', { name: /Subscriber/ });
    expect(head.getAttribute('aria-sort')).toBe('none');
    expect(table.closest('[data-slot="table-container"]')?.className).toContain('md:max-h-');
  });

  it('renders cards instead of a table on phones, with the title, a label/value line and the actions', () => {
    mobile = true;
    render(<DataTable columns={columns} data={rows} />);
    expect(screen.queryByRole('table')).toBeNull();
    const first = within(screen.getByText('Rahim Uddin').closest('li') as HTMLElement);
    expect(screen.getByText('Karim Hossain').closest('li')).not.toBe(first);
    expect(first.getByText('Rahim Uddin')).toBeTruthy();
    expect(first.getByText('Plan')).toBeTruthy();
    expect(first.getByText('20 Mbps')).toBeTruthy();
    expect(first.getByRole('button', { name: 'Open' })).toBeTruthy();
  });

  it('shows the empty message when there are no rows', () => {
    render(<DataTable columns={columns} data={[]} emptyTitle="No customers yet" />);
    expect(screen.getByText('No customers yet')).toBeTruthy();
  });
});
