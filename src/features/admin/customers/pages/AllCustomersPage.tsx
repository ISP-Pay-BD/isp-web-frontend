'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
  SlidersHorizontal,
  Server,
  Package as PackageIcon,
  MapPin,
  CheckSquare,
  Square,
  RotateCcw,
  Send,
  ToggleLeft,
  Key,
  Calendar,
  X,
  AlignJustify,
  AlignCenter,
} from 'lucide-react';
import {
  useAreaOptions,
  useCustomerActions,
  useCustomerSummary,
  useCustomers,
  useDeleteCustomer,
  useExportCustomers,
  usePackageOptions,
  useRouterOptions,
} from '../hooks/use-customers';
import { useDebouncedValue } from '../hooks/use-debounced-value';
import { SendSmsDialog } from '../components/SendSmsDialog';
import type { CustomerListFilters } from '../types';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Can } from '@/components/shared/Can';
import { TablePagination } from '@/components/shared/TablePagination';
import { DEFAULT_PAGE_SIZE, STORAGE_KEYS } from '@/lib/constants/status';
import { useThemeCustomizerStore } from '@/stores/theme-store';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Column visibility keys matching the old ISP portal
type ColumnKey =
  | 'id'
  | 'customer'
  | 'package'
  | 'area'
  | 'mobile'
  | 'address'
  | 'router'
  | 'pppoeSecret'
  | 'payment'
  | 'status'
  | 'accStatus'
  | 'balance';

interface ColumnConfig {
  key: ColumnKey;
  label: string;
  locked?: boolean;
}

const ALL_COLUMNS: ColumnConfig[] = [
  { key: 'id', label: 'C.ID' },
  { key: 'customer', label: 'Customer', locked: true },
  { key: 'package', label: 'Package' },
  { key: 'area', label: 'Area / Sub-area' },
  { key: 'mobile', label: 'Mobile' },
  { key: 'address', label: 'Address' },
  { key: 'router', label: 'Router' },
  { key: 'pppoeSecret', label: 'PPPoE Secret' },
  { key: 'payment', label: 'Expiry & Cycle' },
  { key: 'status', label: 'Conn Status' },
  { key: 'accStatus', label: 'Acc Status' },
  { key: 'balance', label: 'Balance' },
];

type QuickStatus = 'all' | 'online' | 'offline' | 'expired' | 'suspended';
type BulkModal = 'delete' | 'sms' | 'router' | 'package' | 'accStatus' | 'recharge' | null;

/** Quick status pill → backend list filter. */
const QUICK_FILTER: Record<QuickStatus, CustomerListFilters> = {
  all: {},
  online: { connection: 'online' },
  offline: { connection: 'offline' },
  expired: { status: 'expired' },
  suspended: { connStatus: 'disconn' },
};

const ymd = (value: string | null | undefined) => (value ? value.slice(0, 10) : '—');
/** id → label map for Select `items` (trigger shows the label, not the id). */
const labels = (options: { id: string; name: string }[]) => Object.fromEntries(options.map((o) => [o.id, o.name]));

export function AllCustomersPage() {
  const router = useRouter();

  // Filters state (all applied server-side)
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim());
  const [statusFilter, setStatusFilter] = useState<QuickStatus>('all');
  const [areaFilter, setAreaFilter] = useState('all');
  const [packageFilter, setPackageFilter] = useState('all');
  const [routerFilter, setRouterFilter] = useState('all');
  const [connFilter, setConnFilter] = useState('all'); // all | pppoe | static
  const [expiryFilter, setExpiryFilter] = useState('all');

  // Pagination & Layout Mode state
  const globalTableLayout = useThemeCustomizerStore((s) => s.tableLayout);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [layoutMode, setLayoutMode] = useState<'full' | 'centered'>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.tableLayout);
        if (saved === 'centered' || saved === 'full') return saved;
      } catch {
        /* storage unavailable */
      }
    }
    return globalTableLayout || 'full';
  });

  // Sync when global theme setting changes
  useEffect(() => {
    if (globalTableLayout) {
      setLayoutMode(globalTableLayout);
    }
  }, [globalTableLayout]);

  const handleLayoutModeChange = (mode: 'full' | 'centered') => {
    setLayoutMode(mode);
    try {
      localStorage.setItem(STORAGE_KEYS.tableLayout, mode);
    } catch {
      /* storage unavailable */
    }
  };

  /** Scope filters shared by the list and the KPI summary. */
  const scopeFilters = useMemo<CustomerListFilters>(
    () => ({
      search: debouncedSearch || undefined,
      areaId: areaFilter !== 'all' ? areaFilter : undefined,
      packageId: packageFilter !== 'all' ? packageFilter : undefined,
      routerId: routerFilter !== 'all' ? routerFilter : undefined,
      accessType: connFilter === 'pppoe' || connFilter === 'static' ? connFilter : undefined,
    }),
    [debouncedSearch, areaFilter, packageFilter, routerFilter, connFilter],
  );
  const listFilters = useMemo<CustomerListFilters>(
    () => ({ ...scopeFilters, ...QUICK_FILTER[statusFilter], expiry: expiryFilter !== 'all' ? expiryFilter : undefined }),
    [scopeFilters, statusFilter, expiryFilter],
  );

  // Any filter / page-size change starts again from page 1.
  const pageKey = `${JSON.stringify(listFilters)}|${pageSize}`;
  const [pageState, setPageState] = useState({ key: pageKey, page: 1 });
  const currentPage = pageState.key === pageKey ? pageState.page : 1;
  const setCurrentPage = (page: number) => setPageState({ key: pageKey, page });

  const { data, isLoading, isError, isFetching, refetch } = useCustomers({ ...listFilters, page: currentPage, perPage: pageSize });
  const summaryQuery = useCustomerSummary(scopeFilters);
  const areasQuery = useAreaOptions();
  const packagesQuery = usePackageOptions();
  const routersQuery = useRouterOptions();
  const deleteMutation = useDeleteCustomer();
  const exportMutation = useExportCustomers();
  const actions = useCustomerActions();

  const rows = useMemo(() => data?.items ?? [], [data?.items]);
  const totalRows = data?.meta.total ?? 0;
  const summary = summaryQuery.data;

  // Bulk selection state (ids survive paging, so bulk actions can span pages)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const selected = useMemo(() => Array.from(selectedIds), [selectedIds]);

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

  // Column Visibility state
  const [visibleColumns, setVisibleColumns] = useState<Record<ColumnKey, boolean>>({
    id: true,
    customer: true,
    package: true,
    area: true,
    mobile: true,
    address: true,
    router: true,
    pppoeSecret: true,
    payment: true,
    status: true,
    accStatus: true,
    balance: true,
  });

  // Bulk selection helpers
  const allPageSelected = rows.length > 0 && rows.every((c) => selectedIds.has(c.id));

  const toggleSelectAll = () => {
    const next = new Set(selectedIds);
    if (allPageSelected) rows.forEach((c) => next.delete(c.id));
    else rows.forEach((c) => next.add(c.id));
    setSelectedIds(next);
  };

  const toggleSelectRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setAreaFilter('all');
    setPackageFilter('all');
    setRouterFilter('all');
    setConnFilter('all');
    setExpiryFilter('all');
  };

  const activeFilterCount = [
    statusFilter !== 'all',
    areaFilter !== 'all',
    packageFilter !== 'all',
    routerFilter !== 'all',
    connFilter !== 'all',
    expiryFilter !== 'all',
    search !== '',
  ].filter(Boolean).length;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const finishBulk = () => {
    setBulkModal(null);
    setSelectedIds(new Set());
  };

  const openBulk = (modal: Exclude<BulkModal, null>) => {
    if (selectedIds.size === 0) {
      toast.error('Select customers first');
      return;
    }
    if (modal === 'sms') setSmsTargets(selected);
    setBulkModal(modal);
  };

  if (isLoading) return <PageSkeleton variant="table" rows={8} layoutMode={layoutMode} />;
  if (isError) {
    return (
      <EmptyState
        title="Failed to load customers"
        description="Could not fetch subscriber directory from backend."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  const areaOptions = areasQuery.data ?? [];
  const packageOptions = packagesQuery.data ?? [];
  const routerOptions = routersQuery.data ?? [];
  const count = (n: number | undefined) => (summary ? n ?? 0 : '…');

  return (
    <div
      className={cn(
        'space-y-6 pb-16 transition-all duration-200',
        layoutMode === 'centered' ? 'max-w-7xl mx-auto' : 'w-full'
      )}
    >
      {/* Page Header with Action Toolbar */}
      <PageHeader
        title="Customer Directory"
        subtitle="Manage broadband subscribers, PPPoE credentials, bandwidth tiers, routers, and payment cycles"
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Customers' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* Layout Alignment Toggle */}
            <div className="flex items-center rounded-lg border border-border/70 p-0.5 bg-muted/40">
              <button
                type="button"
                onClick={() => handleLayoutModeChange('full')}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-150',
                  layoutMode === 'full'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                title="Full width edge-to-edge layout"
              >
                <AlignJustify className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Full</span>
              </button>
              <button
                type="button"
                onClick={() => handleLayoutModeChange('centered')}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-150',
                  layoutMode === 'centered'
                    ? 'bg-background text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                title="Centered container layout"
              >
                <AlignCenter className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Center</span>
              </button>
            </div>

            {/* Column Picker */}
            <Popover>
              <PopoverTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 gap-1.5 border-border/80 hover:bg-accent"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                    Columns
                  </Button>
                }
              />
              <PopoverContent align="end" className="w-56 p-3 space-y-2">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <span className="text-xs font-bold text-foreground">Show Columns</span>
                  <button
                    type="button"
                    onClick={() => {
                      const resetObj = {} as Record<ColumnKey, boolean>;
                      ALL_COLUMNS.forEach((c) => (resetObj[c.key] = true));
                      setVisibleColumns(resetObj);
                    }}
                    className="text-[10px] text-primary hover:underline font-semibold"
                  >
                    Reset
                  </button>
                </div>
                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                  {ALL_COLUMNS.map((col) => (
                    <label
                      key={col.key}
                      className={cn(
                        'flex items-center gap-2 text-xs py-1 px-1.5 rounded hover:bg-muted/50 cursor-pointer',
                        col.locked && 'opacity-60 cursor-not-allowed'
                      )}
                    >
                      <Checkbox
                        checked={visibleColumns[col.key]}
                        disabled={col.locked}
                        onCheckedChange={(checked) => {
                          if (col.locked) return;
                          setVisibleColumns((prev) => ({
                            ...prev,
                            [col.key]: Boolean(checked),
                          }));
                        }}
                      />
                      <span className="text-foreground text-xs">{col.label}</span>
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            {/* Export (server-side xlsx with the active filters) */}
            <Button
              variant="outline"
              size="sm"
              disabled={exportMutation.isPending}
              onClick={() => exportMutation.mutate(listFilters)}
              className="text-xs h-8 border-border/80 hover:bg-accent transition-all duration-150"
            >
              <Download className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
              {exportMutation.isPending ? 'Exporting…' : 'Export'}
            </Button>

            {/* Sync PPPoE ids with the routers (whole tenant) */}
            <Can menu="customer" action="update">
              <Button
                variant="outline"
                size="sm"
                disabled={actions.syncPppoe.isPending}
                onClick={() => actions.syncPppoe.mutate(undefined)}
                className="text-xs h-8 border-border/80 hover:bg-accent transition-all duration-150"
                title="Re-link every customer's PPPoE secret id from its router"
              >
                <Key className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
                {actions.syncPppoe.isPending ? 'Syncing…' : 'Sync PPPoE'}
              </Button>
            </Can>

            {/* More Operations Menu (Classic ISP Actions) */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 border-border/80 hover:bg-accent"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end" className="w-56 p-1">
                <div className="px-2 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Bulk Operations ({selectedIds.size} Selected)
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 cursor-pointer text-xs" onClick={() => openBulk('sms')}>
                  <Send className="h-3.5 w-3.5 text-blue-500" /> Send SMS
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer text-xs" onClick={() => openBulk('router')}>
                  <Server className="h-3.5 w-3.5 text-primary" /> Migrate / Change Router
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer text-xs" onClick={() => openBulk('package')}>
                  <PackageIcon className="h-3.5 w-3.5 text-amber-500" /> Change Package
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer text-xs" onClick={() => openBulk('accStatus')}>
                  <ToggleLeft className="h-3.5 w-3.5 text-emerald-500" /> Set Account Status
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer text-xs" onClick={() => openBulk('recharge')}>
                  <Receipt className="h-3.5 w-3.5 text-purple-500" /> Bulk Recharge
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" className="gap-2 cursor-pointer text-xs" onClick={() => openBulk('delete')}>
                  <Trash2 className="h-3.5 w-3.5" /> Delete Selected ({selectedIds.size})
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Import & New Customer buttons */}
            <Can menu="customer" action="create">
              <Link href="/admin/customers/import">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 border-border/80 hover:bg-accent transition-all duration-150"
                >
                  <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5 text-emerald-500" /> Import Excel
                </Button>
              </Link>
              <Link href="/admin/customers/new">
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-8 shadow-sm transition-all duration-150"
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> New Customer
                </Button>
              </Link>
            </Can>
          </div>
        }
      />

      {/* KPI Metric Strip (backend summary) */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm px-4 py-3 text-xs shadow-2xs">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-muted-foreground">
          <span>
            Total <span className="font-bold text-foreground tabular-nums">{count(summary?.total)}</span> subscribers
          </span>
          <span className="hidden h-3 w-px bg-border sm:block" aria-hidden />
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {count(summary?.online)}
            </span>{' '}
            online
          </span>
          <span className="hidden h-3 w-px bg-border sm:block" aria-hidden />
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-muted-foreground/50" />
            <span className="font-bold text-muted-foreground tabular-nums">
              {count(summary?.offline)}
            </span>{' '}
            offline
          </span>
          <span className="hidden h-3 w-px bg-border sm:block" aria-hidden />
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            <span className="font-bold text-rose-500 tabular-nums">{count(summary?.expired)}</span> expired
          </span>
          <span className="hidden h-3 w-px bg-border sm:block" aria-hidden />
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="font-bold text-amber-500 tabular-nums">{count(summary?.due7)}</span> due in 7 days
          </span>
        </div>

        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-lg text-xs font-semibold animate-in fade-in duration-200">
            <span>{selectedIds.size} customer(s) selected</span>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="text-muted-foreground hover:text-foreground text-[10px] ml-1 underline cursor-pointer"
            >
              Clear
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
                placeholder="Search by name, mobile, email, PPPoE username or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-8 h-9 text-xs bg-background border-border/60 rounded-lg shadow-inner"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-muted/40 border border-border/60">
              {(
                [
                  { key: 'all', label: 'All', n: summary?.total, className: '' },
                  { key: 'online', label: 'Online', n: summary?.online, className: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
                  { key: 'offline', label: 'Offline', n: summary?.offline, className: 'text-muted-foreground', dot: 'bg-muted-foreground/40' },
                  { key: 'expired', label: 'Expired', n: summary?.expired, className: 'text-rose-500', dot: 'bg-rose-500' },
                  { key: 'suspended', label: 'Disconnected', n: summary?.disconnected, className: 'text-amber-500' },
                ] as { key: QuickStatus; label: string; n?: number; className: string; dot?: string }[]
              ).map((pill) => (
                <Button
                  key={pill.key}
                  type="button"
                  size="sm"
                  variant={statusFilter === pill.key ? 'default' : 'ghost'}
                  onClick={() => setStatusFilter(pill.key)}
                  className={cn('text-xs h-7 px-2.5', pill.className)}
                >
                  {pill.dot && <span className={cn('mr-1 h-1.5 w-1.5 rounded-full', pill.dot)} />}
                  {pill.label} ({count(pill.n)})
                </Button>
              ))}
            </div>
          </div>

          {/* Bottom Row: Detailed Dropdown Filters (Area, Package, Router, Protocol, Expiry) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-2 border-t border-border/40">
            {/* Area Filter */}
            <Select value={areaFilter} onValueChange={(val) => setAreaFilter(val || 'all')} items={{ all: 'All Coverage Areas', ...labels(areaOptions) }}>
              <SelectTrigger className="h-8 text-xs bg-background border-border/60">
                <MapPin className="h-3 w-3 mr-1 text-muted-foreground shrink-0" />
                <SelectValue placeholder="All Areas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Coverage Areas</SelectItem>
                {areaOptions.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Package Filter */}
            <Select value={packageFilter} onValueChange={(val) => setPackageFilter(val || 'all')} items={{ all: 'All Packages', ...labels(packageOptions) }}>
              <SelectTrigger className="h-8 text-xs bg-background border-border/60">
                <PackageIcon className="h-3 w-3 mr-1 text-muted-foreground shrink-0" />
                <SelectValue placeholder="All Packages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Packages</SelectItem>
                {packageOptions.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                    {p.price !== null ? ` — ৳${p.price}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Router Filter */}
            <Select value={routerFilter} onValueChange={(val) => setRouterFilter(val || 'all')} items={{ all: 'All Routers', ...labels(routerOptions) }}>
              <SelectTrigger className="h-8 text-xs bg-background border-border/60">
                <Server className="h-3 w-3 mr-1 text-muted-foreground shrink-0" />
                <SelectValue placeholder="All Routers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Routers</SelectItem>
                {routerOptions.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Connection Protocol Filter */}
            <Select value={connFilter} onValueChange={(val) => setConnFilter(val || 'all')}>
              <SelectTrigger className="h-8 text-xs bg-background border-border/60">
                <Wifi className="h-3 w-3 mr-1 text-muted-foreground shrink-0" />
                <SelectValue placeholder="All Protocols" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Protocols</SelectItem>
                <SelectItem value="pppoe">PPPoE</SelectItem>
                <SelectItem value="static">Static IP (corporate)</SelectItem>
              </SelectContent>
            </Select>

            {/* Expiry & Cycle Filter (backend expiry buckets) */}
            <Select value={expiryFilter} onValueChange={(val) => setExpiryFilter(val || 'all')}>
              <SelectTrigger className="h-8 text-xs bg-background border-border/60">
                <Calendar className="h-3 w-3 mr-1 text-muted-foreground shrink-0" />
                <SelectValue placeholder="All Expiry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Expiry Cycles</SelectItem>
                <SelectItem value="expired_today">Expired Today</SelectItem>
                <SelectItem value="expired_7">Expired (Last 7 Days)</SelectItem>
                <SelectItem value="due_today">Due Today</SelectItem>
                <SelectItem value="due_3">Due in 3 Days</SelectItem>
                <SelectItem value="due_7">Due in 7 Days</SelectItem>
                <SelectItem value="paid_7">Paid (7+ Days Left)</SelectItem>
              </SelectContent>
            </Select>

            {/* Reset Filter Button */}
            {activeFilterCount > 0 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="h-8 text-xs font-medium border-border/80 text-muted-foreground hover:text-foreground col-span-2 sm:col-span-3 lg:col-span-1 gap-1"
              >
                <RotateCcw className="h-3 w-3" /> Reset ({activeFilterCount})
              </Button>
            ) : (
              <div className="hidden lg:flex items-center justify-end text-xs text-muted-foreground pr-2 font-mono">
                {totalRows} records
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Customers Data Table (current server page) */}
      <Card className={cn('border-border/70 shadow-2xs bg-card overflow-hidden ring-1 ring-border/50', isFetching && 'opacity-80')}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1300px] text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
                {/* Bulk Checkbox */}
                <th className="py-3 px-4 w-10">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="flex items-center text-muted-foreground hover:text-foreground focus:outline-none"
                    title={allPageSelected ? 'Deselect page' : 'Select page'}
                  >
                    {allPageSelected ? (
                      <CheckSquare className="h-4 w-4 text-primary" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                  </button>
                </th>

                {visibleColumns.id && <th className="py-3 px-3 w-16">C.ID</th>}
                {visibleColumns.customer && <th className="py-3 px-4">Subscriber</th>}
                {visibleColumns.package && <th className="py-3 px-4">Package</th>}
                {visibleColumns.area && <th className="py-3 px-4">Area / Sector</th>}
                {visibleColumns.mobile && <th className="py-3 px-4">Mobile</th>}
                {visibleColumns.address && <th className="py-3 px-4">Address</th>}
                {visibleColumns.router && <th className="py-3 px-4">Router</th>}
                {visibleColumns.pppoeSecret && <th className="py-3 px-4">PPPoE Secret</th>}
                {visibleColumns.payment && <th className="py-3 px-4">Expiry Date</th>}
                {visibleColumns.status && <th className="py-3 px-4">Status</th>}
                {visibleColumns.accStatus && <th className="py-3 px-4">Acc Status</th>}
                {visibleColumns.balance && <th className="py-3 px-4">Balance</th>}
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={Object.values(visibleColumns).filter(Boolean).length + 2} className="text-center py-16 text-muted-foreground">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Search className="h-8 w-8 mx-auto text-muted-foreground/50" />
                      <p className="font-semibold text-foreground">
                        {activeFilterCount > 0 ? 'No matching subscribers' : 'No customers yet'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activeFilterCount > 0
                          ? 'Try clearing or relaxing your active search and filter combinations.'
                          : 'Add a customer or import them from Excel to get started.'}
                      </p>
                      {activeFilterCount > 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={clearFilters}
                          className="mt-2 text-xs"
                        >
                          Clear All Filters
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((c) => {
                  const isExpired = c.status === 'expired';
                  const isSelected = selectedIds.has(c.id);

                  return (
                    <tr
                      key={c.id}
                      className={cn(
                        'group transition-colors duration-150',
                        isSelected
                          ? 'bg-primary/[0.04] hover:bg-primary/[0.08]'
                          : 'hover:bg-muted/30'
                      )}
                    >
                      {/* Row Checkbox */}
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => toggleSelectRow(c.id)}
                          className="flex items-center text-muted-foreground hover:text-foreground focus:outline-none"
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-primary" />
                          ) : (
                            <Square className="h-4 w-4 text-muted-foreground/60" />
                          )}
                        </button>
                      </td>

                      {/* C.ID */}
                      {visibleColumns.id && (
                        <td className="py-3 px-3 font-mono text-[11px] text-muted-foreground">
                          {c.id}
                        </td>
                      )}

                      {/* Subscriber Name & User */}
                      {visibleColumns.customer && (
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="relative shrink-0">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs border border-primary/20">
                                {c.name.slice(0, 2).toUpperCase()}
                              </div>
                              <span
                                className={cn(
                                  'absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full ring-2 ring-background',
                                  c.online ? 'bg-emerald-500' : 'bg-muted-foreground/40'
                                )}
                              />
                            </div>
                            <div className="min-w-0">
                              <button
                                type="button"
                                onClick={() => router.push(`/admin/customers/${c.id}`)}
                                className="font-bold text-foreground hover:text-primary hover:underline transition-colors text-xs text-left truncate block max-w-[150px]"
                              >
                                {c.name}
                              </button>
                              <div className="text-[10px] text-muted-foreground font-mono truncate">
                                {c.username || '—'}
                              </div>
                            </div>
                          </div>
                        </td>
                      )}

                      {/* Package */}
                      {visibleColumns.package && (
                        <td className="py-3 px-4">
                          <div className="font-semibold text-foreground truncate max-w-[130px]">
                            {c.packageName || '—'}
                          </div>
                          {c.packagePrice !== null && (
                            <div className="text-[10px] text-muted-foreground font-mono">
                              ৳{c.packagePrice}
                            </div>
                          )}
                        </td>
                      )}

                      {/* Area / Sub-area */}
                      {visibleColumns.area && (
                        <td className="py-3 px-4">
                          <div className="font-medium text-foreground truncate max-w-[120px]">
                            {c.areaName || '—'}
                          </div>
                          {c.subAreaName && (
                            <div className="text-[10px] text-muted-foreground truncate">
                              {c.subAreaName}
                            </div>
                          )}
                        </td>
                      )}

                      {/* Mobile */}
                      {visibleColumns.mobile && (
                        <td className="py-3 px-4 font-mono text-[11px] text-foreground">
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span>{c.phone || '—'}</span>
                          </div>
                        </td>
                      )}

                      {/* Address */}
                      {visibleColumns.address && (
                        <td className="py-3 px-4 text-[11px] text-muted-foreground truncate max-w-[140px]">
                          {c.address || '—'}
                        </td>
                      )}

                      {/* Router */}
                      {visibleColumns.router && (
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 font-mono text-[11px] text-foreground truncate max-w-[120px]">
                            <Server className="h-3 w-3 text-primary/70 shrink-0" />
                            <span>{c.routerName || '—'}</span>
                          </div>
                        </td>
                      )}

                      {/* PPPoE Secret */}
                      {visibleColumns.pppoeSecret && (
                        <td className="py-3 px-4">
                          {c.username ? (
                            <div className="flex items-center gap-1 font-mono text-[11px] text-foreground bg-muted/40 px-2 py-0.5 rounded border border-border/50 max-w-[120px] justify-between">
                              <span className="truncate">{c.username}</span>
                              <button
                                type="button"
                                onClick={() => handleCopy(c.username, 'PPPoE Secret')}
                                className="text-muted-foreground hover:text-primary transition-colors shrink-0"
                              >
                                <Copy className="h-2.5 w-2.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      )}

                      {/* Payment & Expiry */}
                      {visibleColumns.payment && (
                        <td className="py-3 px-4">
                          <div
                            className={cn(
                              'font-mono text-xs font-semibold',
                              isExpired ? 'text-destructive flex items-center gap-1' : 'text-foreground'
                            )}
                          >
                            {isExpired && <AlertCircle className="h-3 w-3 text-destructive shrink-0" />}
                            <span>{ymd(c.expiryDate)}</span>
                          </div>
                          {c.paymentSummary && (
                            <div className="text-[10px] text-muted-foreground">{c.paymentSummary}</div>
                          )}
                        </td>
                      )}

                      {/* Conn Status (Online/Offline) */}
                      {visibleColumns.status && (
                        <td className="py-3 px-4">
                          {c.online ? (
                            <Badge
                              variant="outline"
                              className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-medium gap-1"
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                              Online
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-muted text-muted-foreground border-border/60 text-[10px] font-medium gap-1"
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground inline-block" />
                              Offline
                            </Badge>
                          )}
                        </td>
                      )}

                      {/* Acc Status (Active / Disconnected / Expired) */}
                      {visibleColumns.accStatus && (
                        <td className="py-3 px-4">
                          <StatusBadge status={c.status} label={c.status === 'suspended' ? 'Disconnected' : undefined} />
                        </td>
                      )}

                      {/* Balance */}
                      {visibleColumns.balance && (
                        <td className="py-3 px-4 font-mono font-bold text-xs">
                          {c.balanceBdt > 0 ? (
                            <span className="text-amber-500">
                              <CurrencyDisplay amount={c.balanceBdt} />
                            </span>
                          ) : (
                            <span className="text-muted-foreground">
                              <CurrencyDisplay amount={0} />
                            </span>
                          )}
                        </td>
                      )}

                      {/* Action Dropdown */}
                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-md hover:bg-muted/80 focus:outline-none"
                              >
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </Button>
                            }
                          />
                          <DropdownMenuContent align="end" className="w-52 p-1">
                            <div className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                              Subscriber Actions
                            </div>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="gap-2 cursor-pointer text-xs"
                              onClick={() => router.push(`/admin/customers/${c.id}`)}
                            >
                              <Eye className="h-3.5 w-3.5 text-primary" /> View Details
                            </DropdownMenuItem>
                            <Can menu="customer" action="update">
                              <DropdownMenuItem
                                className="gap-2 cursor-pointer text-xs"
                                onClick={() => router.push(`/admin/customers/${c.id}/edit`)}
                              >
                                <Edit className="h-3.5 w-3.5" /> Edit Profile
                              </DropdownMenuItem>
                            </Can>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="gap-2 cursor-pointer text-xs"
                              onClick={() =>
                                router.push(`/admin/customer-payments/new?customerId=${c.id}`)
                              }
                            >
                              <Receipt className="h-3.5 w-3.5 text-emerald-500" /> Collect Payment
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2 cursor-pointer text-xs"
                              onClick={() => {
                                setSmsTargets([c.id]);
                                setBulkModal('sms');
                              }}
                            >
                              <MessageSquare className="h-3.5 w-3.5 text-amber-500" /> Send SMS
                            </DropdownMenuItem>
                            <Can menu="customer" action="delete">
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant="destructive"
                                className="gap-2 cursor-pointer text-xs"
                                onClick={() => setDeleteId(c.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" /> Delete Account
                              </DropdownMenuItem>
                            </Can>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Server Pagination Bar */}
        <TablePagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={totalRows}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          pageSizeOptions={[10, 20, 50, 100]}
        />
      </Card>

      {/* ── Single Delete Confirmation Dialog ──────────────────────── */}
      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Customer Account"
        description="Are you sure you want to remove this subscriber? This removes their PPPoE secret from the router and deletes the account."
        confirmLabel="Confirm Delete"
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
        title="Send SMS"
      />

      {/* ── Bulk Migrate Router Dialog ──────────────────────────────── */}
      <Dialog open={bulkModal === 'router'} onOpenChange={(o) => !o && setBulkModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Server className="h-5 w-5 text-primary" />
              Change Router
            </DialogTitle>
            <DialogDescription>
              Reassign <strong className="text-foreground">{selectedIds.size}</strong> subscribers to another MikroTik router.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Target Router</Label>
              <Select value={targetRouter || null} onValueChange={(val) => setTargetRouter(val || '')} items={labels(routerOptions)}>
                <SelectTrigger className="h-10 text-xs">
                  <SelectValue placeholder={routersQuery.isLoading ? 'Loading routers…' : 'Select router'} />
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
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!targetRouter || actions.bulkUpdateRouter.isPending}
              onClick={() => actions.bulkUpdateRouter.mutate({ ids: selected, routerId: targetRouter }, { onSuccess: finishBulk })}
              className="gap-1"
            >
              <Server className="h-3.5 w-3.5" /> Reassign Router
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
              Change Package
            </DialogTitle>
            <DialogDescription>
              Move <strong className="text-foreground">{selectedIds.size}</strong> selected subscribers to another package.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">New Package</Label>
              <Select value={targetPackage || null} onValueChange={(val) => setTargetPackage(val || '')} items={labels(packageOptions)}>
                <SelectTrigger className="h-10 text-xs">
                  <SelectValue placeholder={packagesQuery.isLoading ? 'Loading packages…' : 'Select package'} />
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
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!targetPackage || actions.bulkChangePackage.isPending}
              onClick={() => actions.bulkChangePackage.mutate({ ids: selected, packageId: targetPackage }, { onSuccess: finishBulk })}
              className="bg-amber-600 hover:bg-amber-700 text-white gap-1"
            >
              <PackageIcon className="h-3.5 w-3.5" /> Apply Package
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
              Set Account Status
            </DialogTitle>
            <DialogDescription>
              Enable or disable the PPPoE secret of <strong className="text-foreground">{selectedIds.size}</strong> selected accounts on their routers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Status</Label>
              <Select
                value={targetAccStatus}
                onValueChange={(v) => setTargetAccStatus(v === 'disconn' ? 'disconn' : 'conn')}
              >
                <SelectTrigger className="h-10 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conn">Connected (PPPoE enabled)</SelectItem>
                  <SelectItem value="disconn">Disconnected (PPPoE disabled)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setBulkModal(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={actions.bulkConnStatus.isPending}
              onClick={() => actions.bulkConnStatus.mutate({ ids: selected, status: targetAccStatus }, { onSuccess: finishBulk })}
              className="gap-1"
            >
              Apply Status
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
              Bulk Recharge Subscribers
            </DialogTitle>
            <DialogDescription>
              Set a new expiry for <strong className="text-foreground">{selectedIds.size}</strong> customers. A future date activates and connects them.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Valid until</Label>
              <Input type="date" value={rechargeUntil} onChange={(e) => setRechargeUntil(e.target.value)} className="h-10 text-xs" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Package (optional)</Label>
              <Select value={rechargePackage || 'keep'} onValueChange={(v) => setRechargePackage(!v || v === 'keep' ? '' : v)} items={{ keep: 'Keep current package', ...labels(packageOptions) }}>
                <SelectTrigger className="h-10 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="keep">Keep current package</SelectItem>
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
              Cancel
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
              <Receipt className="h-3.5 w-3.5" /> Execute Recharge
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
              Delete {selectedIds.size} Customers?
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. PPPoE secrets are removed from the routers and the {selectedIds.size} accounts are deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setBulkModal(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={actions.bulkDelete.isPending}
              onClick={() => actions.bulkDelete.mutate(selected, { onSuccess: finishBulk })}
              className="gap-1"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete Selected
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
