'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

import {
  Search,
  Plus,
  FileSpreadsheet,
  Trash2,
  Edit,
  Eye,
  MoreHorizontal,
  Phone,
  Wifi,
  AlertCircle,
  Download,
  Copy,
  Receipt,
  MessageSquare,
  Server,
  Package as PackageIcon,
  MapPin,
  RotateCcw,
  Send,
  ToggleLeft,
  Key,
  Calendar,
  X,
} from 'lucide-react';
import {
  useAreaOptions,
  useCustomerActions,
  useCustomerSummary,
  useCustomers,
  useDeleteCustomer,
  useExportCustomers,
  usePrefetchCustomer,
  usePackageOptions,
  useRouterOptions,
} from '../hooks/use-customers';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { replaceQuery } from '@/hooks/use-url-state';
import { SendSmsDialog } from '../components/SendSmsDialog';
import type { Customer, CustomerListFilters } from '../types';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import type { RowSelectionState } from '@tanstack/react-table';
import { DataTable } from '@/features/shared/data-table';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Can } from '@/components/shared/Can';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants/status';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/i18n/locale-context';
import { customerStatusLabel } from '../lib/labels';

type QuickStatus = 'all' | 'active' | 'online' | 'offline' | 'expired' | 'suspended';
type BulkModal = 'delete' | 'sms' | 'router' | 'package' | 'accStatus' | 'recharge' | null;

const QUICK_STATUSES: QuickStatus[] = ['all', 'active', 'online', 'offline', 'expired', 'suspended'];

/** Quick status pill → backend list filter. */
const QUICK_FILTER: Record<QuickStatus, CustomerListFilters> = {
  all: {},
  active: { status: 'active' },
  online: { connection: 'online' },
  offline: { connection: 'offline' },
  expired: { status: 'expired' },
  suspended: { connStatus: 'disconn' },
};

const ymd = (value: string | null | undefined) => (value ? value.slice(0, 10) : '—');
/** id → label map for Select `items` (trigger shows the label, not the id). */
const labels = (options: { id: string; name: string }[]) => Object.fromEntries(options.map((o) => [o.id, o.name]));

/**
 * Every filter, the search text, the page and the page size live in the URL (`?status=expired&area=3&page=2`), so
 * Back, refresh and shared links keep the same view and the dashboard can link straight into a filtered list.
 */
function useCustomerListUrl() {
  const params = useSearchParams();
  const read = (key: string, fallback = 'all') => params.get(key) || fallback;
  const status = read('status');
  const state = {
    status: (QUICK_STATUSES as string[]).includes(status) ? (status as QuickStatus) : ('all' as QuickStatus),
    area: read('area'),
    pkg: read('package'),
    router: read('router'),
    conn: read('conn'),
    expiry: read('expiry'),
    reseller: read('resellerId', ''),
    search: read('q', ''),
    page: Math.max(1, Number(params.get('page')) || 1),
    pageSize: Number(params.get('size')) || DEFAULT_PAGE_SIZE,
  };
  const update = useCallback((patch: Record<string, string | number | null>) => {
    replaceQuery((p) => {
      for (const [key, value] of Object.entries(patch)) {
        if (value === null || value === '' || value === 'all') p.delete(key);
        else p.set(key, String(value));
      }
      // a changed filter, search or page size starts again from page 1
      if (!('page' in patch)) p.delete('page');
    });
  }, []);
  return { state, update };
}

export function AllCustomersPage() {
  const t = useTranslations();
  const { state, update } = useCustomerListUrl();
  const statusFilter = state.status;

  // Search box: typed locally, written to the URL once the typing pauses.
  const [searchInput, setSearchInput] = useState(state.search);
  const debouncedSearch = useDebouncedValue(searchInput.trim());
  useEffect(() => {
    if (debouncedSearch !== state.search) update({ q: debouncedSearch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  /** Scope filters shared by the list and the KPI summary. */
  const scopeFilters = useMemo<CustomerListFilters>(
    () => ({
      search: state.search || undefined,
      areaId: state.area !== 'all' ? state.area : undefined,
      packageId: state.pkg !== 'all' ? state.pkg : undefined,
      routerId: state.router !== 'all' ? state.router : undefined,
      accessType: state.conn === 'pppoe' || state.conn === 'static' ? state.conn : undefined,
      resellerId: state.reseller || undefined,
    }),
    [state.search, state.area, state.pkg, state.router, state.conn, state.reseller],
  );
  const listFilters = useMemo<CustomerListFilters>(
    () => ({ ...scopeFilters, ...QUICK_FILTER[statusFilter], expiry: state.expiry !== 'all' ? state.expiry : undefined }),
    [scopeFilters, statusFilter, state.expiry],
  );

  const { data, isLoading, isError, isFetching, refetch } = useCustomers({ ...listFilters, page: state.page, perPage: state.pageSize });
  const summaryQuery = useCustomerSummary(scopeFilters);
  const areasQuery = useAreaOptions();
  const packagesQuery = usePackageOptions();
  const routersQuery = useRouterOptions();
  const deleteMutation = useDeleteCustomer();
  const exportMutation = useExportCustomers();
  const actions = useCustomerActions();
  const prefetchCustomer = usePrefetchCustomer();

  const rows = useMemo(() => data?.items ?? [], [data?.items]);
  const totalRows = data?.meta.total ?? 0;
  const summary = summaryQuery.data;

  // Bulk selection state (ids survive paging, so bulk actions can span pages)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const selected = useMemo(() => Array.from(selectedIds), [selectedIds]);
  const rowSelection = useMemo<RowSelectionState>(() => Object.fromEntries(selected.map((id) => [id, true])), [selected]);

  // Delete & Bulk Action Modal States
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bulkModal, setBulkModal] = useState<BulkModal>(null);
  const [smsTargets, setSmsTargets] = useState<string[]>([]);

  // Bulk Action Form States
  const [targetRouter, setTargetRouter] = useState('');
  const [targetPackage, setTargetPackage] = useState('');
  const [targetAccStatus, setTargetAccStatus] = useState<'conn' | 'disconn'>('conn');
  const [rechargeUntil, setRechargeUntil] = useState('');
  const [rechargePackage, setRechargePackage] = useState('');

  const clearFilters = () => {
    setSearchInput('');
    update({ q: null, status: null, area: null, package: null, router: null, conn: null, expiry: null, resellerId: null });
  };

  const activeFilterCount = [
    statusFilter !== 'all',
    state.area !== 'all',
    state.pkg !== 'all',
    state.router !== 'all',
    state.conn !== 'all',
    state.expiry !== 'all',
    Boolean(state.reseller),
    state.search !== '',
  ].filter(Boolean).length;

  const handleCopy = useCallback(
    (text: string, label: string) => {
      navigator.clipboard.writeText(text);
      toast.success(t('admin.customers.list.copied', '{label} copied to clipboard', { label }));
    },
    [t],
  );

  const finishBulk = () => {
    setBulkModal(null);
    setSelectedIds(new Set());
  };

  const openBulk = (modal: Exclude<BulkModal, null>) => {
    if (selectedIds.size === 0) {
      toast.error(t('admin.customers.list.selectFirst', 'Select customers first'));
      return;
    }
    if (modal === 'sms') setSmsTargets(selected);
    setBulkModal(modal);
  };

  const columns = useMemo<LegacyColumnDef<Customer, unknown>[]>(
    () => [
      {
        id: 'id',
        header: t('admin.customers.list.colId', 'C.ID'),
        cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.id}</span>,
        meta: { mobile: 'hide' },
      },
      {
        id: 'customer',
        header: t('admin.customers.list.colSubscriber', 'Subscriber'),
        enableHiding: false,
        cell: ({ row }) => {
          const c = row.original;
          return (
            <div className="flex items-center gap-2.5">
              <div className="relative shrink-0">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-xs font-bold text-primary">
                  {c.name.slice(0, 2).toUpperCase()}
                </div>
                <span
                  className={cn(
                    'absolute -right-0.5 -bottom-0.5 h-2 w-2 rounded-full ring-2 ring-background',
                    c.online ? 'bg-emerald-500' : 'bg-muted-foreground/40',
                  )}
                />
              </div>
              <div className="min-w-0">
                <Link
                  href={`/admin/customers/${c.id}`}
                  onMouseEnter={() => void prefetchCustomer(c.id)}
                  onFocus={() => void prefetchCustomer(c.id)}
                  className="block max-w-[200px] truncate py-0.5 text-left text-sm font-bold text-foreground transition-colors hover:text-primary hover:underline"
                >
                  {c.name}
                </Link>
                <div className="truncate font-mono text-xs text-muted-foreground">{c.username || '—'}</div>
              </div>
            </div>
          );
        },
        meta: { mobile: 'title' },
      },
      {
        id: 'package',
        header: t('admin.customers.list.colPackage', 'Package'),
        cell: ({ row }) => (
          <>
            <div className="max-w-[140px] truncate font-semibold text-foreground">{row.original.packageName || '—'}</div>
            {row.original.packagePrice !== null && (
              <div className="font-mono text-xs text-muted-foreground">
                <CurrencyDisplay amount={row.original.packagePrice} />
              </div>
            )}
          </>
        ),
      },
      {
        id: 'area',
        header: t('admin.customers.list.colArea', 'Area / Sub-area'),
        cell: ({ row }) => (
          <>
            <div className="max-w-[130px] truncate font-medium text-foreground">{row.original.areaName || '—'}</div>
            {row.original.subAreaName && <div className="truncate text-xs text-muted-foreground">{row.original.subAreaName}</div>}
          </>
        ),
      },
      {
        id: 'mobile',
        header: t('admin.customers.list.colMobile', 'Mobile'),
        cell: ({ row }) => (
          <div className="flex items-center gap-1 font-mono text-xs text-foreground">
            <Phone className="h-3 w-3 text-muted-foreground" />
            {row.original.phone ? <a href={`tel:${row.original.phone}`} className="hover:underline">{row.original.phone}</a> : <span>—</span>}
          </div>
        ),
      },
      {
        id: 'address',
        header: t('admin.customers.list.colAddress', 'Address'),
        cell: ({ row }) => <span className="block max-w-[160px] truncate text-xs text-muted-foreground">{row.original.address || '—'}</span>,
        meta: { mobile: 'hide' },
      },
      {
        id: 'router',
        header: t('admin.customers.list.colRouter', 'Router'),
        cell: ({ row }) => (
          <div className="flex max-w-[130px] items-center gap-1 truncate font-mono text-xs text-foreground">
            <Server className="h-3 w-3 shrink-0 text-primary/70" />
            <span>{row.original.routerName || '—'}</span>
          </div>
        ),
      },
      {
        id: 'pppoeSecret',
        header: t('admin.customers.list.colPppoe', 'PPPoE Secret'),
        cell: ({ row }) =>
          row.original.username ? (
            <div className="flex max-w-[140px] items-center justify-between gap-1 rounded border border-border/50 bg-muted/40 px-2 py-0.5 font-mono text-xs text-foreground">
              <span className="truncate">{row.original.username}</span>
              <button
                type="button"
                onClick={() => handleCopy(row.original.username, t('admin.customers.list.pppoeSecret', 'PPPoE Secret'))}
                aria-label={t('admin.customers.list.copyPppoe', 'Copy PPPoE secret')}
                className="shrink-0 text-muted-foreground transition-colors hover:text-primary"
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
        meta: { mobile: 'hide' },
      },
      {
        id: 'payment',
        header: t('admin.customers.list.colExpiry', 'Expiry Date'),
        cell: ({ row }) => {
          const isExpired = row.original.status === 'expired';
          return (
            <>
              <div className={cn('font-mono text-xs font-semibold', isExpired ? 'flex items-center gap-1 text-destructive' : 'text-foreground')}>
                {isExpired && <AlertCircle className="h-3 w-3 shrink-0 text-destructive" />}
                <span>{ymd(row.original.expiryDate)}</span>
              </div>
              {row.original.paymentSummary && <div className="text-xs text-muted-foreground">{row.original.paymentSummary}</div>}
            </>
          );
        },
        meta: { mobileLabel: t('admin.customers.list.expires', 'Expires') },
      },
      {
        id: 'connStatus',
        header: t('admin.customers.list.colConn', 'Conn Status'),
        cell: ({ row }) => (
          <StatusBadge status={row.original.online ? 'online' : 'offline'} label={customerStatusLabel(t, row.original.online ? 'online' : 'offline')} />
        ),
        meta: { mobile: 'status' },
      },
      {
        id: 'accStatus',
        header: t('admin.customers.list.colAcc', 'Acc Status'),
        cell: ({ row }) => (
          <StatusBadge status={row.original.status} label={customerStatusLabel(t, row.original.status)} />
        ),
        meta: { mobile: 'status' },
      },
      {
        id: 'balance',
        header: t('admin.customers.list.colBalance', 'Balance'),
        cell: ({ row }) => (
          <span className={cn('font-mono text-xs font-bold', row.original.balanceBdt > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground')}>
            <CurrencyDisplay amount={row.original.balanceBdt} />
          </span>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">{t('admin.customers.list.colActions', 'Actions')}</span>,
        enableHiding: false,
        enableSorting: false,
        cell: ({ row }) => {
          const c = row.original;
          return (
            <div className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="ghost" size="icon" aria-label={t('admin.customers.list.actionsFor', 'Actions for {name}', { name: c.name })} className="h-9 w-9 rounded-md hover:bg-muted/80">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  }
                />
                <DropdownMenuContent align="end" className="w-52 p-1">
                  <div className="px-2 py-1 text-xs font-bold tracking-wider text-muted-foreground uppercase">{t('admin.customers.list.subscriberActions', 'Subscriber Actions')}</div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer gap-2 text-xs" render={<Link href={`/admin/customers/${c.id}`} />}>
                    <Eye className="h-3.5 w-3.5 text-primary" /> {t('admin.customers.list.viewDetails', 'View Details')}
                  </DropdownMenuItem>
                  <Can menu="customer" action="update">
                    <DropdownMenuItem className="cursor-pointer gap-2 text-xs" render={<Link href={`/admin/customers/${c.id}/edit`} />}>
                      <Edit className="h-3.5 w-3.5" /> {t('admin.customers.list.editProfile', 'Edit Profile')}
                    </DropdownMenuItem>
                  </Can>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer gap-2 text-xs" render={<Link href={`/admin/customer-payments/new?customerId=${c.id}`} />}>
                    <Receipt className="h-3.5 w-3.5 text-emerald-500" /> {t('admin.customers.list.collectPayment', 'Collect Payment')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer gap-2 text-xs"
                    onClick={() => {
                      setSmsTargets([c.id]);
                      setBulkModal('sms');
                    }}
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-amber-500" /> {t('admin.customers.list.sendSms', 'Send SMS')}
                  </DropdownMenuItem>
                  <Can menu="customer" action="delete">
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" className="cursor-pointer gap-2 text-xs" onClick={() => setDeleteId(c.id)}>
                      <Trash2 className="h-3.5 w-3.5" /> {t('admin.customers.list.deleteAccount', 'Delete Account')}
                    </DropdownMenuItem>
                  </Can>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
        meta: { mobile: 'actions' },
      },
    ],
    [handleCopy, prefetchCustomer, t],
  );

  if (isLoading) return <PageSkeleton variant="table" rows={8} />;
  if (isError) {
    return (
      <EmptyState variant="error"
        title={t('admin.customers.list.loadFailed', 'Failed to load customers')}
        description={t('admin.customers.list.loadFailedHint', 'Could not fetch subscriber directory from backend.')}
        actionLabel={t('admin.customers.list.retry', 'Retry')}
        onAction={() => refetch()}
      />
    );
  }

  const areaOptions = areasQuery.data ?? [];
  const packageOptions = packagesQuery.data ?? [];
  const routerOptions = routersQuery.data ?? [];
  const count = (n: number | undefined) => (summary ? n ?? 0 : '…');
  const connItems: Record<string, string> = {
    all: t('admin.customers.list.allProtocols', 'All Protocols'),
    pppoe: 'PPPoE',
    static: t('admin.customers.list.staticIp', 'Static IP (corporate)'),
  };
  const expiryItems: Record<string, string> = {
    all: t('admin.customers.list.allExpiry', 'All Expiry Cycles'),
    expired_today: t('admin.customers.list.expiredToday', 'Expired Today'),
    expired_7: t('admin.customers.list.expired7', 'Expired (Last 7 Days)'),
    due_today: t('admin.customers.list.dueToday', 'Due Today'),
    due_3: t('admin.customers.list.due3', 'Due in 3 Days'),
    due_7: t('admin.customers.list.due7', 'Due in 7 Days'),
    paid_7: t('admin.customers.list.paid7', 'Paid (7+ Days Left)'),
  };
  const accStatusItems: Record<string, string> = {
    conn: t('admin.customers.list.accConn', 'Connected (PPPoE enabled)'),
    disconn: t('admin.customers.list.accDisconn', 'Disconnected (PPPoE disabled)'),
  };

  return (
    <div className="w-full space-y-6 pb-16">
      {/* Page Header with Action Toolbar */}
      <PageHeader
        title={t('admin.customers.list.title', 'Customer Directory')}
        subtitle={t('admin.customers.list.subtitle', 'Manage broadband subscribers, PPPoE credentials, bandwidth tiers, routers, and payment cycles')}
        breadcrumb={[
          { label: t('admin.customers.list.breadcrumbAdmin', 'Admin'), url: '/admin/dashboard' },
          { label: t('admin.customers.list.breadcrumbCustomers', 'Customers') },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* Export (server-side xlsx with the active filters) */}
            <Button
              variant="outline"
              size="sm"
              disabled={exportMutation.isPending}
              onClick={() => exportMutation.mutate(listFilters)}
              className="text-xs h-9 border-border/80 hover:bg-accent"
            >
              <Download className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
              {exportMutation.isPending ? t('admin.customers.list.exporting', 'Exporting…') : t('admin.customers.list.export', 'Export')}
            </Button>

            {/* Sync PPPoE ids with the routers (whole tenant) */}
            <Can menu="customer" action="update">
              <Button
                variant="outline"
                size="sm"
                disabled={actions.syncPppoe.isPending}
                onClick={() => actions.syncPppoe.mutate(undefined)}
                className="text-xs h-9 border-border/80 hover:bg-accent"
                title={t('admin.customers.list.syncHint', "Re-link every customer's PPPoE secret id from its router")}
              >
                <Key className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
                {actions.syncPppoe.isPending ? t('admin.customers.list.syncing', 'Syncing…') : t('admin.customers.list.sync', 'Sync PPPoE')}
              </Button>
            </Can>

            {/* More Operations Menu (Classic ISP Actions) */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="outline" size="sm" aria-label={t('admin.customers.list.bulkOps', 'Bulk operations')} className="text-xs h-9 border-border/80 hover:bg-accent">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-56 p-1">
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t('admin.customers.list.bulkTitle', 'Bulk Operations ({n} Selected)', { n: selectedIds.size })}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 cursor-pointer text-xs" onClick={() => openBulk('sms')}>
                  <Send className="h-3.5 w-3.5 text-blue-500" /> {t('admin.customers.list.sendSms', 'Send SMS')}
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer text-xs" onClick={() => openBulk('router')}>
                  <Server className="h-3.5 w-3.5 text-primary" /> {t('admin.customers.list.bulkRouter', 'Migrate / Change Router')}
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer text-xs" onClick={() => openBulk('package')}>
                  <PackageIcon className="h-3.5 w-3.5 text-amber-500" /> {t('admin.customers.list.bulkPackage', 'Change Package')}
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer text-xs" onClick={() => openBulk('accStatus')}>
                  <ToggleLeft className="h-3.5 w-3.5 text-emerald-500" /> {t('admin.customers.list.bulkAccStatus', 'Set Account Status')}
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer text-xs" onClick={() => openBulk('recharge')}>
                  <Receipt className="h-3.5 w-3.5 text-purple-500" /> {t('admin.customers.list.bulkRecharge', 'Bulk Recharge')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" className="gap-2 cursor-pointer text-xs" onClick={() => openBulk('delete')}>
                  <Trash2 className="h-3.5 w-3.5" /> {t('admin.customers.list.bulkDelete', 'Delete Selected ({n})', { n: selectedIds.size })}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Import & New Customer buttons */}
            <Can menu="customer" action="create">
              <Button variant="outline" size="sm" className="text-xs h-9 border-border/80 hover:bg-accent" render={<Link href="/admin/customers/import" />}>
                <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5 text-emerald-500" /> {t('admin.customers.list.importExcel', 'Import Excel')}
              </Button>
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-9 shadow-sm" render={<Link href="/admin/customers/new" />}>
                <Plus className="mr-1.5 h-3.5 w-3.5" /> {t('admin.customers.list.newCustomer', 'New Customer')}
              </Button>
            </Can>
          </div>
        }
      />

      {/* KPI Metric Strip (backend summary) */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm px-4 py-3 text-xs shadow-2xs">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-muted-foreground">
          <span>
            {t('admin.customers.list.kpiTotal', 'Total')} <span className="font-bold text-foreground tabular-nums">{count(summary?.total)}</span> {t('admin.customers.list.kpiSubscribers', 'subscribers')}
          </span>
          <span className="hidden h-3 w-px bg-border sm:block" aria-hidden />
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{count(summary?.online)}</span> {t('admin.customers.list.kpiOnline', 'online')}
          </span>
          <span className="hidden h-3 w-px bg-border sm:block" aria-hidden />
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-muted-foreground/50" />
            <span className="font-bold text-muted-foreground tabular-nums">{count(summary?.offline)}</span> {t('admin.customers.list.kpiOffline', 'offline')}
          </span>
          <span className="hidden h-3 w-px bg-border sm:block" aria-hidden />
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            <span className="font-bold text-rose-500 tabular-nums">{count(summary?.expired)}</span> {t('admin.customers.list.kpiExpired', 'expired')}
          </span>
          <span className="hidden h-3 w-px bg-border sm:block" aria-hidden />
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="font-bold text-amber-500 tabular-nums">{count(summary?.due7)}</span> {t('admin.customers.list.kpiDue7', 'due in 7 days')}
          </span>
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <span>{t('admin.customers.list.selected', '{n} customer(s) selected', { n: selectedIds.size })}</span>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="ml-1 cursor-pointer text-xs text-muted-foreground underline hover:text-foreground"
            >
              {t('admin.customers.list.clear', 'Clear')}
            </button>
          </div>
        )}
      </div>

      {/* Multi-facet Toolbar & Filters */}
      <Card className="border-border/70 shadow-2xs bg-card">
        <CardContent className="p-4 space-y-3">
          {/* Top Row: Search & Quick Status Buttons */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('admin.customers.list.searchPlaceholder', 'Search by name, mobile, email, PPPoE username or ID...')}
                aria-label={t('admin.customers.list.searchLabel', 'Search customers')}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 pr-9 h-10 text-sm bg-background border-border/60 rounded-lg shadow-inner"
              />
              {searchInput && (
                <button
                  type="button"
                  aria-label={t('admin.customers.list.clearSearch', 'Clear search')}
                  onClick={() => setSearchInput('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-muted/40 border border-border/60">
              {(
                [
                  { key: 'all', label: t('admin.customers.list.pillAll', 'All'), n: summary?.total, className: '' },
                  { key: 'active', label: t('admin.customers.status.active', 'Active'), n: undefined, className: '' },
                  { key: 'online', label: t('admin.customers.status.online', 'Online'), n: summary?.online, className: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
                  { key: 'offline', label: t('admin.customers.status.offline', 'Offline'), n: summary?.offline, className: 'text-muted-foreground', dot: 'bg-muted-foreground/40' },
                  { key: 'expired', label: t('admin.customers.status.expired', 'Expired'), n: summary?.expired, className: 'text-rose-500', dot: 'bg-rose-500' },
                  { key: 'suspended', label: t('admin.customers.status.disconnected', 'Disconnected'), n: summary?.disconnected, className: 'text-amber-500' },
                ] as { key: QuickStatus; label: string; n?: number; className: string; dot?: string }[]
              ).map((pill) => (
                <Button
                  key={pill.key}
                  type="button"
                  size="sm"
                  variant={statusFilter === pill.key ? 'default' : 'ghost'}
                  aria-pressed={statusFilter === pill.key}
                  onClick={() => update({ status: pill.key })}
                  className={cn('text-xs h-8 px-2.5', statusFilter !== pill.key && pill.className)}
                >
                  {pill.dot && <span className={cn('mr-1 h-1.5 w-1.5 rounded-full', pill.dot)} />}
                  {pill.label}
                  {pill.n !== undefined ? ` (${count(pill.n)})` : ''}
                </Button>
              ))}
            </div>
          </div>

          {/* Reseller scope chip (set by the hierarchy view) */}
          {state.reseller ? (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{t('admin.customers.list.resellerScope', 'Showing customers of reseller')}</span>
              <Badge variant="outline" className="gap-1 font-mono">
                #{state.reseller}
                <button type="button" aria-label={t('admin.customers.list.removeReseller', 'Remove reseller filter')} onClick={() => update({ resellerId: null })} className="hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            </div>
          ) : null}

          {/* Bottom Row: Detailed Dropdown Filters (Area, Package, Router, Protocol, Expiry) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2 border-t border-border/40">
            <Select value={state.area} onValueChange={(val) => update({ area: val || 'all' })} items={{ all: t('admin.customers.list.allAreas', 'All Coverage Areas'), ...labels(areaOptions) }}>
              <SelectTrigger className="h-9 text-xs bg-background border-border/60">
                <MapPin className="h-3 w-3 mr-1 text-muted-foreground shrink-0" />
                <SelectValue placeholder={t('admin.customers.list.allAreasShort', 'All Areas')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.customers.list.allAreas', 'All Coverage Areas')}</SelectItem>
                {areaOptions.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={state.pkg} onValueChange={(val) => update({ package: val || 'all' })} items={{ all: t('admin.customers.list.allPackages', 'All Packages'), ...labels(packageOptions) }}>
              <SelectTrigger className="h-9 text-xs bg-background border-border/60">
                <PackageIcon className="h-3 w-3 mr-1 text-muted-foreground shrink-0" />
                <SelectValue placeholder={t('admin.customers.list.allPackages', 'All Packages')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.customers.list.allPackages', 'All Packages')}</SelectItem>
                {packageOptions.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                    {p.price !== null ? ` — ৳${p.price}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={state.router} onValueChange={(val) => update({ router: val || 'all' })} items={{ all: t('admin.customers.list.allRouters', 'All Routers'), ...labels(routerOptions) }}>
              <SelectTrigger className="h-9 text-xs bg-background border-border/60">
                <Server className="h-3 w-3 mr-1 text-muted-foreground shrink-0" />
                <SelectValue placeholder={t('admin.customers.list.allRouters', 'All Routers')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.customers.list.allRouters', 'All Routers')}</SelectItem>
                {routerOptions.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={state.conn} onValueChange={(val) => update({ conn: val || 'all' })} items={connItems}>
              <SelectTrigger className="h-9 text-xs bg-background border-border/60">
                <Wifi className="h-3 w-3 mr-1 text-muted-foreground shrink-0" />
                <SelectValue placeholder={t('admin.customers.list.allProtocols', 'All Protocols')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{connItems.all}</SelectItem>
                <SelectItem value="pppoe">{connItems.pppoe}</SelectItem>
                <SelectItem value="static">{connItems.static}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={state.expiry} onValueChange={(val) => update({ expiry: val || 'all' })} items={expiryItems}>
              <SelectTrigger className="h-9 text-xs bg-background border-border/60">
                <Calendar className="h-3 w-3 mr-1 text-muted-foreground shrink-0" />
                <SelectValue placeholder={t('admin.customers.list.allExpiryShort', 'All Expiry')} />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(expiryItems).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {activeFilterCount > 0 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="h-9 text-xs font-medium border-border/80 text-muted-foreground hover:text-foreground col-span-2 sm:col-span-3 lg:col-span-1 gap-1"
              >
                <RotateCcw className="h-3 w-3" /> {t('admin.customers.list.reset', 'Reset ({n})', { n: activeFilterCount })}
              </Button>
            ) : (
              <div className="hidden lg:flex items-center justify-end text-xs text-muted-foreground pr-2 font-mono">{t('admin.customers.list.records', '{n} records', { n: totalRows })}</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Customers Data Table (current server page) */}
      <div className={cn(isFetching && 'opacity-80')}>
        <DataTable
          columns={columns}
          data={rows}
          getRowId={(c) => c.id}
          enableRowSelection
          rowSelection={rowSelection}
          onRowSelectionChange={(next) => setSelectedIds(new Set(Object.keys(next).filter((id) => next[id])))}
          enableLayoutToggle={false}
          pageSizeOptions={[10, 20, 50, 100]}
          emptyTitle={activeFilterCount > 0 ? t('admin.customers.list.emptyFiltered', 'No matching subscribers') : t('admin.customers.list.emptyNone', 'No customers yet')}
          emptyDescription={
            activeFilterCount > 0
              ? t('admin.customers.list.emptyFilteredHint', 'Try clearing or relaxing your active search and filter combinations.')
              : t('admin.customers.list.emptyNoneHint', 'Add a customer or import them from Excel to get started.')
          }
          server={{
            page: state.page,
            pageSize: state.pageSize,
            total: totalRows,
            onPageChange: (page) => update({ page }),
            onPageSizeChange: (size) => update({ size }),
          }}
        />
      </div>

      {/* ── Single Delete Confirmation Dialog ──────────────────────── */}
      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t('admin.customers.list.deleteTitle', 'Delete Customer Account')}
        description={t('admin.customers.list.deleteHint', 'Are you sure you want to remove this subscriber? This removes their PPPoE secret from the router and deletes the account.')}
        confirmLabel={t('admin.customers.list.deleteConfirm', 'Confirm Delete')}
        destructive
        onConfirm={async () => {
          if (deleteId) {
            await deleteMutation.mutateAsync(deleteId);
            setDeleteId(null);
          }
        }}
      />

      {/* ── SMS Dialog (bulk or single) ─────────────────────────────── */}
      <SendSmsDialog
        open={bulkModal === 'sms'}
        onOpenChange={(o) => !o && setBulkModal(null)}
        ids={smsTargets}
        title={t('admin.customers.list.sendSms', 'Send SMS')}
      />

      {/* ── Bulk Migrate Router Dialog ──────────────────────────────── */}
      <Dialog open={bulkModal === 'router'} onOpenChange={(o) => !o && setBulkModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Server className="h-5 w-5 text-primary" />
              {t('admin.customers.list.routerTitle', 'Change Router')}
            </DialogTitle>
            <DialogDescription>
              {t('admin.customers.list.routerHint', 'Reassign {n} subscribers to another MikroTik router.', { n: selectedIds.size })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="targetRouter" className="text-xs font-semibold">{t('admin.customers.list.targetRouter', 'Target Router')}</Label>
              <Select value={targetRouter || null} onValueChange={(val) => setTargetRouter(val || '')} items={labels(routerOptions)}>
                <SelectTrigger id="targetRouter" className="h-10 text-xs">
                  <SelectValue placeholder={routersQuery.isLoading ? t('admin.customers.list.loadingRouters', 'Loading routers…') : t('admin.customers.list.selectRouter', 'Select router')} />
                </SelectTrigger>
                <SelectContent>
                  {routerOptions.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setBulkModal(null)}>
              {t('admin.customers.list.cancel', 'Cancel')}
            </Button>
            <Button
              size="sm"
              disabled={!targetRouter || actions.bulkUpdateRouter.isPending}
              onClick={() => actions.bulkUpdateRouter.mutate({ ids: selected, routerId: targetRouter }, { onSuccess: finishBulk })}
              className="gap-1"
            >
              <Server className="h-3.5 w-3.5" /> {t('admin.customers.list.reassignRouter', 'Reassign Router')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Bulk Change Package Dialog ──────────────────────────────── */}
      <Dialog open={bulkModal === 'package'} onOpenChange={(o) => !o && setBulkModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PackageIcon className="h-5 w-5 text-amber-500" />
              {t('admin.customers.list.bulkPackage', 'Change Package')}
            </DialogTitle>
            <DialogDescription>
              {t('admin.customers.list.packageHint', 'Move {n} selected subscribers to another package.', { n: selectedIds.size })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="newPackage" className="text-xs font-semibold">{t('admin.customers.list.newPackage', 'New Package')}</Label>
              <Select value={targetPackage || null} onValueChange={(val) => setTargetPackage(val || '')} items={labels(packageOptions)}>
                <SelectTrigger id="newPackage" className="h-10 text-xs">
                  <SelectValue placeholder={packagesQuery.isLoading ? t('admin.customers.list.loadingPackages', 'Loading packages…') : t('admin.customers.list.selectPackage', 'Select package')} />
                </SelectTrigger>
                <SelectContent>
                  {packageOptions.map((pkg) => (
                    <SelectItem key={pkg.id} value={pkg.id}>
                      {pkg.name}
                      {pkg.price !== null ? ` (৳${pkg.price})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setBulkModal(null)}>
              {t('admin.customers.list.cancel', 'Cancel')}
            </Button>
            <Button
              size="sm"
              disabled={!targetPackage || actions.bulkChangePackage.isPending}
              onClick={() => actions.bulkChangePackage.mutate({ ids: selected, packageId: targetPackage }, { onSuccess: finishBulk })}
              className="bg-amber-700 hover:bg-amber-800 text-white gap-1"
            >
              <PackageIcon className="h-3.5 w-3.5" /> {t('admin.customers.list.applyPackage', 'Apply Package')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Bulk Account Status Dialog ──────────────────────────────── */}
      <Dialog open={bulkModal === 'accStatus'} onOpenChange={(o) => !o && setBulkModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ToggleLeft className="h-5 w-5 text-emerald-500" />
              {t('admin.customers.list.bulkAccStatus', 'Set Account Status')}
            </DialogTitle>
            <DialogDescription>
              {t('admin.customers.list.accStatusHint', 'Enable or disable the PPPoE secret of {n} selected accounts on their routers.', { n: selectedIds.size })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="statusLabel" className="text-xs font-semibold">{t('admin.customers.list.statusLabel', 'Status')}</Label>
              <Select
                value={targetAccStatus}
                onValueChange={(v) => setTargetAccStatus(v === 'disconn' ? 'disconn' : 'conn')}
                items={accStatusItems}
              >
                <SelectTrigger id="statusLabel" className="h-10 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conn">{accStatusItems.conn}</SelectItem>
                  <SelectItem value="disconn">{accStatusItems.disconn}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setBulkModal(null)}>
              {t('admin.customers.list.cancel', 'Cancel')}
            </Button>
            <Button
              size="sm"
              disabled={actions.bulkConnStatus.isPending}
              onClick={() => actions.bulkConnStatus.mutate({ ids: selected, status: targetAccStatus }, { onSuccess: finishBulk })}
              className="gap-1"
            >
              {t('admin.customers.list.applyStatus', 'Apply Status')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Bulk Recharge Dialog ────────────────────────────────────── */}
      <Dialog open={bulkModal === 'recharge'} onOpenChange={(o) => !o && setBulkModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-purple-500" />
              {t('admin.customers.list.rechargeTitle', 'Bulk Recharge Subscribers')}
            </DialogTitle>
            <DialogDescription>
              {t('admin.customers.list.rechargeHint', 'Set a new expiry for {n} customers. A future date activates and connects them.', { n: selectedIds.size })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="validUntil" className="text-xs font-semibold">{t('admin.customers.list.validUntil', 'Valid until')}</Label>
              <Input id="validUntil" type="date" value={rechargeUntil} onChange={(e) => setRechargeUntil(e.target.value)} className="h-10 text-xs" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="packageOptional" className="text-xs font-semibold">{t('admin.customers.list.packageOptional', 'Package (optional)')}</Label>
              <Select value={rechargePackage || 'keep'} onValueChange={(v) => setRechargePackage(!v || v === 'keep' ? '' : v)} items={{ keep: t('admin.customers.list.keepPackage', 'Keep current package'), ...labels(packageOptions) }}>
                <SelectTrigger id="packageOptional" className="h-10 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="keep">{t('admin.customers.list.keepPackage', 'Keep current package')}</SelectItem>
                  {packageOptions.map((pkg) => (
                    <SelectItem key={pkg.id} value={pkg.id}>
                      {pkg.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setBulkModal(null)}>
              {t('admin.customers.list.cancel', 'Cancel')}
            </Button>
            <Button
              size="sm"
              disabled={!rechargeUntil || actions.bulkRecharge.isPending}
              onClick={() =>
                actions.bulkRecharge.mutate(
                  { ids: selected, willExpire: `${rechargeUntil} 23:59:59`, packageId: rechargePackage || undefined },
                  { onSuccess: finishBulk },
                )
              }
              className="bg-purple-600 hover:bg-purple-700 text-white gap-1"
            >
              <Receipt className="h-3.5 w-3.5" /> {t('admin.customers.list.executeRecharge', 'Execute Recharge')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Bulk Delete Confirmation Dialog ─────────────────────────── */}
      <Dialog open={bulkModal === 'delete'} onOpenChange={(o) => !o && setBulkModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              {t('admin.customers.list.bulkDeleteTitle', 'Delete {n} Customers?', { n: selectedIds.size })}
            </DialogTitle>
            <DialogDescription>
              {t('admin.customers.list.bulkDeleteHint', 'This action cannot be undone. PPPoE secrets are removed from the routers and the {n} accounts are deleted.', { n: selectedIds.size })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setBulkModal(null)}>
              {t('admin.customers.list.cancel', 'Cancel')}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={actions.bulkDelete.isPending}
              onClick={() => actions.bulkDelete.mutate(selected, { onSuccess: finishBulk })}
              className="gap-1"
            >
              <Trash2 className="h-3.5 w-3.5" /> {t('admin.customers.list.deleteSelected', 'Delete Selected')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
