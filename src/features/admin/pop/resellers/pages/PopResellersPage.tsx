'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { Building2, Users, Phone, Plus, Download, Wallet, MapPin, CreditCard } from 'lucide-react';
import { usePops, type PopReseller } from '../../hooks/use-pop';
import { RegisterPopDialog } from '../../components/RegisterPopDialog';
import { LoginAsPopDialog } from '../../components/LoginAsPopDialog';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/features/shared/data-table';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { downloadCsv } from '@/features/admin/accounting/shared/table-utils';

import { formatCount } from '@/lib/format';
import { useLocale, useTranslations } from '@/i18n/locale-context';

type StatusFilter = '' | 'active' | 'inactive';
type Translate = ReturnType<typeof useTranslations>;

function billingLabel(t: Translate, billing: PopReseller['billingType']): string {
  return billing === 'prepaid' ? t('admin.pop.resellers.prepaid', 'Prepaid') : t('admin.pop.resellers.postpaid', 'Postpaid');
}

export function PopResellersPage() {
  const { t } = useLocale();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('');
  const { data, isLoading, isError, error, refetch } = usePops({ page, pageSize, search, status });
  const [selectedReseller, setSelectedReseller] = useState<PopReseller | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [loginAs, setLoginAs] = useState<PopReseller | null>(null);

  const onSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const resellers = useMemo(() => data?.items ?? [], [data?.items]);
  const total = data?.meta.total ?? 0;

  const pageStats = useMemo(
    () => ({
      balance: resellers.reduce((s, r) => s + r.balanceBdt, 0),
      customers: resellers.reduce((s, r) => s + r.customers, 0),
      active: resellers.filter((r) => r.status === 'active').length,
    }),
    [resellers],
  );

  const handleExportCsv = () =>
    downloadCsv(
      `pop_resellers_${new Date().toISOString().slice(0, 10)}.csv`,
      ['POP ID', 'POP Name', 'Mobile', 'Email', 'Address', 'Billing', 'Balance (BDT)', 'Customers', 'Status'],
      resellers.map((r) => [r.id, r.name, r.mobile, r.email, r.address, r.billingType, r.balanceBdt, r.customers, r.status]),
    );

  const columns = useMemo<LegacyColumnDef<PopReseller, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('admin.pop.resellers.colHub', 'POP Reseller Hub'),
        enableHiding: false,
        size: 240,
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 font-bold text-xs uppercase shadow-2xs">
                <Building2 className="h-4 w-4" />
              </div>
              <div>
                <button
                  type="button"
                  className="font-bold text-sm text-foreground hover:text-primary transition-colors text-left"
                  onClick={() => setSelectedReseller(r)}
                >
                  {r.name}
                </button>
                {r.address && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <MapPin className="h-3 w-3 text-primary/70 shrink-0" />
                    <span className="line-clamp-1">{r.address}</span>
                  </div>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'balanceBdt',
        header: t('admin.pop.resellers.walletBalance', 'Wallet Balance'),
        size: 140,
        cell: ({ row }) => (
          <div>
            <div className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
              <CurrencyDisplay amount={row.original.balanceBdt} />
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1 capitalize">
              <Wallet className="h-2.5 w-2.5" />
              {billingLabel(t, row.original.billingType)}
              {!row.original.fundEnabled && ` · ${t('admin.pop.resellers.fundingOff', 'funding off')}`}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'customers',
        header: t('admin.pop.resellers.subscribers', 'Subscribers'),
        size: 130,
        cell: ({ row }) => (
          <div className="space-y-0.5">
            <span className="inline-flex items-center justify-center h-6 px-2 rounded-md bg-secondary/80 border border-border/50 text-xs font-bold font-mono">
              <Users className="h-3 w-3 mr-1 text-primary" />
              {row.original.customers}
            </span>
            <span className="text-xs text-muted-foreground block">
              {t('admin.pop.resellers.enabledExpired', '{enabled} enabled · {expired} expired', {
                enabled: row.original.clientsEnabled,
                expired: row.original.clientsDisabled,
              })}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'mobile',
        header: t('admin.pop.resellers.colContact', 'Primary Contact'),
        size: 170,
        cell: ({ row }) => (
          <div className="space-y-0.5">
            <span className="flex items-center gap-1.5 font-mono text-xs font-medium text-foreground">
              <Phone className="h-3 w-3 text-muted-foreground" /> {row.original.mobile || '—'}
            </span>
            {row.original.email && (
              <span className="text-xs text-muted-foreground block truncate max-w-[160px]">{row.original.email}</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: t('admin.customerPayments.list.colStatus', 'Status'),
        size: 110,
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">{t('admin.customers.list.colActions', 'Actions')}</span>,
        size: 170,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2.5 text-xs hover:bg-primary/10 hover:text-primary gap-1"
              disabled={row.original.status !== 'active'}
              title={row.original.status !== 'active' ? t('admin.pop.resellers.inactiveNoAccess', 'Inactive POPs cannot be accessed') : undefined}
              onClick={() => setLoginAs(row.original)}
            >
              {t('admin.pop.resellers.loginAs', 'Log in as')}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 px-2.5 text-xs hover:bg-primary/10 hover:text-primary gap-1"
              onClick={() => setSelectedReseller(row.original)}
            >
              {t('admin.pop.resellers.details', 'Details')}
            </Button>
          </div>
        ),
      },
    ],
    [t],
  );

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (isError) {
    return (
      <EmptyState variant="error"
        title={t('admin.pop.resellers.loadFailed', 'Failed to load POP resellers')}
        description={error?.message ?? t('admin.pop.resellers.loadFailedHint', 'Could not fetch the POP directory.')}
        actionLabel={t('admin.customers.list.retry', 'Retry')}
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader
        title={t('nav.pop-list', 'POP Resellers')}
        subtitle={t('admin.pop.resellers.subtitle', 'Point-of-Presence partner hubs managing localized downstream subscriber distributions')}
        breadcrumb={[
          { label: t('admin.customers.list.breadcrumbAdmin', 'Admin'), url: '/admin/dashboard' },
          { label: t('common.crumb.pop_suite', 'POP Suite') },
          { label: t('nav.pop-list', 'POP Resellers') },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              disabled={resellers.length === 0}
              className="text-xs border-border/80 hover:bg-accent"
            >
              <Download className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> {t('admin.pop.resellers.exportPage', 'Export Page')}
            </Button>
            <Button
              size="sm"
              onClick={() => setAddDialogOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-2xs gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" /> {t('admin.pop.resellers.addPartner', 'Add POP Partner')}
            </Button>
          </div>
        }
      />

      {/* KPI Stats Ribbon */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums text-foreground">{total}</span>{' '}
          <span className="text-muted-foreground">
            {status
              ? t('admin.pop.resellers.registeredFiltered', 'registered POPs ({status})', {
                  status: status === 'active' ? t('status.active', 'Active') : t('status.inactive', 'Inactive'),
                })
              : t('admin.pop.resellers.registered', 'registered POPs')}
          </span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
            <CurrencyDisplay amount={pageStats.balance} className="inline font-semibold" />
          </span>{' '}
          <span className="text-muted-foreground">{t('admin.pop.resellers.pageBalance', 'wallet balance on this page')}</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-foreground">{formatCount(pageStats.customers)}</span>{' '}
          <span className="text-muted-foreground">
            {t('admin.pop.resellers.pageCustomers', 'customers on this page · {n} active POPs', { n: pageStats.active })}
          </span>
        </p>
      </div>

      <DataTable urlState
        columns={columns}
        data={resellers}
        getRowId={(row) => row.id}
        searchPlaceholder={t('admin.pop.resellers.searchPlaceholder', 'Search POP name, mobile or email...')}
        emptyTitle={
          search || status
            ? t('admin.pop.resellers.emptyFiltered', 'No POPs match your filters')
            : t('admin.pop.resellers.emptyNone', 'No POP resellers yet')
        }
        emptyDescription={t('admin.pop.resellers.emptyHint', 'Add POP reseller partners to distribute packages in remote and suburban zones.')}
        server={{
          page,
          pageSize,
          total,
          onPageChange: setPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setPage(1);
          },
          search,
          onSearchChange,
        }}
        toolbarActions={
          <Select
            value={status || 'all'}
            onValueChange={(v) => {
              setStatus(v === 'active' || v === 'inactive' ? v : '');
              setPage(1);
            }}
          >
            <SelectTrigger aria-label={t('admin.pop.resellers.filterStatus', 'Filter by status')} className="h-9 min-w-[130px] text-xs">
              <SelectValue>
                {(v: string | null) =>
                  v === 'active'
                    ? t('status.active', 'Active')
                    : v === 'inactive'
                      ? t('status.inactive', 'Inactive')
                      : t('admin.customerPayments.list.allStatuses', 'All statuses')
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('admin.customerPayments.list.allStatuses', 'All statuses')}</SelectItem>
              <SelectItem value="active">{t('status.active', 'Active')}</SelectItem>
              <SelectItem value="inactive">{t('status.inactive', 'Inactive')}</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      {/* POP Details Dialog */}
      <Dialog open={!!selectedReseller} onOpenChange={(open) => !open && setSelectedReseller(null)}>
        <DialogContent className="max-w-lg p-6 border-border/80 shadow-[var(--shadow-md)]">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold">{selectedReseller?.name}</DialogTitle>
                  <DialogDescription className="text-xs flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-3 w-3 text-primary" /> {selectedReseller?.address || '—'}
                  </DialogDescription>
                </div>
              </div>
              {selectedReseller && <StatusBadge status={selectedReseller.status} />}
            </div>
          </DialogHeader>

          {selectedReseller && (
            <div className="space-y-4 pt-2 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-1">
                  <span className="text-muted-foreground text-xs block">{t('admin.pop.resellers.walletBalance', 'Wallet Balance')}</span>
                  <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    <CurrencyDisplay amount={selectedReseller.balanceBdt} />
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-1">
                  <span className="text-muted-foreground text-xs block">{t('admin.pop.resellers.subscribers', 'Subscribers')}</span>
                  <div className="text-lg font-bold font-mono text-foreground">
                    {t('admin.pop.resellers.usersCount', '{n} Users', { n: selectedReseller.customers })}
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/20 border border-border/50 space-y-2">
                {[
                  [t('admin.pop.resellers.resellerId', 'Reseller ID'), selectedReseller.id],
                  [t('admin.pop.resellers.contactPhone', 'Contact Phone'), selectedReseller.mobile || '—'],
                  [t('admin.pop.resellers.email', 'Email'), selectedReseller.email || '—'],
                  [t('admin.pop.resellers.billingType', 'Billing Type'), billingLabel(t, selectedReseller.billingType)],
                  [
                    t('admin.pop.resellers.walletFunding', 'Wallet Funding'),
                    selectedReseller.fundEnabled ? t('admin.pop.resellers.enabled', 'Enabled') : t('admin.pop.resellers.disabled', 'Disabled'),
                  ],
                  [
                    t('admin.pop.resellers.clientsBreakdown', 'Clients (enabled / expired / left)'),
                    `${selectedReseller.clientsEnabled} / ${selectedReseller.clientsDisabled} / ${selectedReseller.clientsLeft}`,
                  ],
                ].map(([label, value], i, arr) => (
                  <div
                    key={label}
                    className={`flex justify-between items-center py-0.5 ${i < arr.length - 1 ? 'border-b border-border/40' : ''}`}
                  >
                    <span className="text-muted-foreground">{label}:</span>
                    <span className="font-mono font-semibold text-foreground capitalize">{value}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button size="sm" variant="outline" onClick={() => setSelectedReseller(null)} className="text-xs">
                  {t('common.close', 'Close')}
                </Button>
                <Link
                  href="/admin/pop/funding"
                  className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  <CreditCard className="mr-1.5 h-3.5 w-3.5" /> {t('admin.pop.resellers.fundWallet', 'Fund Wallet')}
                </Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <RegisterPopDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
      <LoginAsPopDialog pop={loginAs} onClose={() => setLoginAs(null)} />
    </div>
  );
}
