'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { Plus, MapPin, Phone, Mail, Building2, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/i18n/locale-context';
import { useBandwidthClients, useDeleteBandwidthClient } from '../hooks/useBandwidthSell';
import { useServerTable } from '@/features/admin/routers/hooks/useServerTable';
import type { ActiveStatus, BandwidthSellClient } from '../types';
import { ClientFormDialog } from '../components/ClientFormDialog';
import { OptionSelect } from '../components/OptionSelect';
import { RefreshState } from '../components/RefreshState';
import { activeLabel, dayText } from '../utils';

export function BandwidthSellClientsPage() {
  const { t } = useLocale();
  const table = useServerTable();
  const [popStatus, setPopStatus] = useState<'' | ActiveStatus>('');
  const { data, isLoading, isError, error, refetch, isFetching } = useBandwidthClients({
    page: table.page,
    pageSize: table.pageSize,
    search: table.search,
    popStatus,
  });
  const active = useBandwidthClients({ page: 1, pageSize: 1, popStatus: 'active' });
  const remove = useDeleteBandwidthClient();
  const [form, setForm] = useState<{ client: BandwidthSellClient | null } | null>(null);
  const [toDelete, setToDelete] = useState<BandwidthSellClient | null>(null);

  const clients = useMemo(() => data?.items ?? [], [data]);
  const total = data?.meta.total ?? 0;
  const filtered = Boolean(popStatus || table.search);

  const confirmDelete = () => {
    if (!toDelete) return;
    remove.mutate(toDelete.id, { onSuccess: () => toast.success(t('admin.bandwidth.clients.deleted', 'Client deleted')) });
    setToDelete(null);
  };

  const columns = useMemo<LegacyColumnDef<BandwidthSellClient, unknown>[]>(
    () => [
      {
        accessorKey: 'customerName',
        header: t('admin.bandwidth.clients.colCustomer', 'Customer'),
        enableHiding: false,
        size: 240,
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <div className="font-bold text-sm text-foreground">{row.original.customerName}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                {row.original.customerCode ? <span className="font-mono">{row.original.customerCode}</span> : null}
                {row.original.popName ? (
                  <>
                    <MapPin className="h-3 w-3 text-primary/70 shrink-0" />
                    <span>{row.original.popName}</span>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'contactPerson',
        header: t('admin.bandwidth.clients.colContact', 'Contact & Mobile'),
        size: 190,
        cell: ({ row }) => (
          <div className="space-y-0.5">
            <div className="font-semibold text-xs text-foreground">{row.original.contactPerson || '—'}</div>
            <div className="font-mono text-xs text-muted-foreground flex items-center gap-1">
              <Phone className="h-3 w-3 text-muted-foreground" /> {row.original.mobileNumber || '—'}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'email',
        header: t('admin.bandwidth.shared.email', 'Email'),
        size: 180,
        cell: ({ row }) =>
          row.original.email ? (
            <span className="text-xs font-mono text-muted-foreground inline-flex items-center gap-1">
              <Mail className="h-3 w-3" /> {row.original.email}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          ),
      },
      {
        accessorKey: 'activationDate',
        header: t('admin.bandwidth.clients.colActivated', 'Activated'),
        size: 120,
        cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{dayText(row.original.activationDate)}</span>,
      },
      {
        accessorKey: 'username',
        header: t('admin.bandwidth.clientForm.username', 'Username'),
        size: 130,
        cell: ({ row }) => <span className="font-mono text-xs text-foreground">{row.original.username || '—'}</span>,
      },
      {
        accessorKey: 'popStatus',
        header: t('admin.customers.list.statusLabel', 'Status'),
        size: 110,
        cell: ({ row }) => <StatusBadge status={row.original.popStatus === 'active' ? 'active' : 'suspended'} label={activeLabel(t, row.original.popStatus === 'active')} />,
      },
      {
        id: 'actions',
        header: '',
        size: 90,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" aria-label={t('common.edit', 'Edit')} onClick={() => setForm({ client: row.original })}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" aria-label={t('common.delete', 'Delete')} onClick={() => setToDelete(row.original)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [t],
  );

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (isError && !data) {
    return (
      <div className="p-6">
        <EmptyState variant="error" title={t('admin.bandwidth.clients.loadFailed', 'Failed to load sell clients')} description={t('admin.bandwidth.clients.loadFailedHint', 'Could not fetch bandwidth sell clients.')} actionLabel={t('admin.customers.list.retry', 'Retry')} onAction={() => refetch()} />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader
        title={t('admin.bandwidth.clients.title', 'Bandwidth Sell Clients')}
        subtitle={t('admin.bandwidth.clients.subtitle', 'POP and corporate clients that bandwidth is sold and invoiced to')}
        breadcrumb={[
          { label: t('admin.customers.list.breadcrumbAdmin', 'Admin'), url: '/admin/dashboard' },
          { label: t('nav.bandwidth-sell', 'Bandwidth Sell'), url: '/admin/bandwidth/sell' },
          { label: t('nav.bw-sell-clients', 'Clients') },
        ]}
        actions={
          <Button size="sm" onClick={() => setForm({ client: null })} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-2xs gap-1.5">
            <Plus className="h-3.5 w-3.5" /> {t('admin.bandwidth.clients.add', 'Add Client')}
          </Button>
        }
      />

      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums text-foreground">{total}</span>{' '}
          <span className="text-muted-foreground">{filtered ? t('admin.bandwidth.clients.statMatching', 'matching clients') : t('admin.bandwidth.clients.stat', 'clients')}</span>
        </p>
        {active.data ? (
          <p>
            <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">{active.data.meta.total}</span>{' '}
            <span className="text-muted-foreground">{t('admin.bandwidth.clients.statActive', 'active POPs')}</span>
          </p>
        ) : null}
        <RefreshState fetching={isFetching} error={isError ? error : null} onRetry={() => refetch()} />
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <div className="w-44">
          <OptionSelect
            value={popStatus}
            onChange={(v) => {
              setPopStatus(v === 'active' || v === 'inactive' ? v : '');
              table.resetPage();
            }}
            emptyLabel={t('admin.bandwidth.shared.allStatuses', 'All statuses')}
            options={[
              { value: 'active', label: activeLabel(t, true) },
              { value: 'inactive', label: activeLabel(t, false) },
            ]}
          />
        </div>
      </div>

      <DataTable urlState
        columns={columns}
        data={clients}
        getRowId={(row) => String(row.id)}
        searchPlaceholder={t('admin.bandwidth.clients.search', 'Search by name, code, contact, mobile, POP, username...')}
        server={table.server(total)}
        emptyTitle={filtered ? t('admin.bandwidth.clients.emptyFiltered', 'No clients match these filters') : t('admin.bandwidth.clients.emptyNone', 'No sell clients yet')}
        emptyDescription={filtered ? undefined : t('admin.bandwidth.clients.emptyHint', 'Add a POP or corporate client to start invoicing.')}
      />

      <ClientFormDialog open={form !== null} client={form?.client ?? null} onOpenChange={(open) => !open && setForm(null)} />

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={t('admin.bandwidth.clients.deleteTitle', 'Delete "{name}"?', { name: toDelete?.customerName ?? '' })}
        description={t('admin.bandwidth.clients.deleteDesc', 'A client that still has sales invoices cannot be deleted.')}
        confirmLabel={t('common.delete', 'Delete')}
        destructive
        onConfirm={confirmDelete}
      />
    </div>
  );
}
