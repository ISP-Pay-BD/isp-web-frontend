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
  Link2,
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
import { useCustomers, useDeleteCustomer } from '../hooks/use-customers';
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
import { areas } from '@/data/admin/areas.data';
import { packages } from '@/data/admin/packages.data';

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
  | 'password'
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
  { key: 'password', label: 'Password' },
  { key: 'payment', label: 'Expiry & Cycle' },
  { key: 'status', label: 'Conn Status' },
  { key: 'accStatus', label: 'Acc Status' },
  { key: 'balance', label: 'Balance Due' },
];

export function AllCustomersPage() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useCustomers();
  const deleteMutation = useDeleteCustomer();

  // Filters state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | online | offline | expired | suspended
  const [areaFilter, setAreaFilter] = useState('all');
  const [packageFilter, setPackageFilter] = useState('all');
  const [connFilter, setConnFilter] = useState('all'); // all | pppoe | hotspot | static
  const [expiryFilter, setExpiryFilter] = useState('all'); // all | expired_today | expired_7 | due_today | due_3 | due_7 | paid

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Delete & Bulk Action Modal States
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bulkModal, setBulkModal] = useState<
    'delete' | 'sms' | 'router' | 'package' | 'accStatus' | 'recharge' | null
  >(null);

  // Bulk Action Form States
  const [targetRouter, setTargetRouter] = useState('MikroTik-RB4011');
  const [targetPackage, setTargetPackage] = useState(packages[0]?.id || '');
  const [targetAccStatus, setTargetAccStatus] = useState<'active' | 'suspended'>('active');
  const [smsMessage, setSmsMessage] = useState('Dear customer, your ISP Pay BD monthly internet subscription is due. Please pay to avoid service disconnection. Thank you.');

  // Pagination & Layout Mode state
  const globalTableLayout = useThemeCustomizerStore((s) => s.tableLayout);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [layoutMode, setLayoutMode] = useState<'full' | 'centered'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEYS.tableLayout);
      if (saved === 'centered' || saved === 'full') return saved;
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
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.tableLayout, mode);
    }
  };

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
    password: true,
    payment: true,
    status: true,
    accStatus: true,
    balance: true,
  });

  const rawList = useMemo(() => data?.items ?? [], [data?.items]);

  // Derived counts for KPI quick filters
  const onlineCount = useMemo(() => rawList.filter((c) => c.online).length, [rawList]);
  const offlineCount = useMemo(() => rawList.filter((c) => !c.online).length, [rawList]);
  const expiredCount = useMemo(() => rawList.filter((c) => c.status === 'expired').length, [rawList]);
  const suspendedCount = useMemo(() => rawList.filter((c) => c.status === 'suspended').length, [rawList]);
  const totalDueBdt = useMemo(
    () => rawList.filter((c) => c.balanceBdt > 0).reduce((acc, c) => acc + c.balanceBdt, 0),
    [rawList]
  );

  // Multi-facet filtering matching old ISP DataTables
  const filteredData = useMemo(() => {
    return rawList.filter((c) => {
      // 1. Search (Name, username, phone, IP, code, address)
      if (search) {
        const q = search.toLowerCase().trim();
        const matches =
          c.name.toLowerCase().includes(q) ||
          c.username.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          (c.code && c.code.toLowerCase().includes(q)) ||
          (c.ipAddress && c.ipAddress.includes(q)) ||
          (c.address && c.address.toLowerCase().includes(q)) ||
          (c.macAddress && c.macAddress.toLowerCase().includes(q));
        if (!matches) return false;
      }

      // 2. Status Filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'online' && !c.online) return false;
        if (statusFilter === 'offline' && c.online) return false;
        if (statusFilter === 'expired' && c.status !== 'expired') return false;
        if (statusFilter === 'suspended' && c.status !== 'suspended') return false;
        if (statusFilter === 'active' && c.status !== 'active') return false;
      }

      // 3. Area Filter
      if (areaFilter !== 'all' && c.areaId !== areaFilter) {
        return false;
      }

      // 4. Package Filter
      if (packageFilter !== 'all' && c.packageId !== packageFilter) {
        return false;
      }

      // 5. Connection Type Filter
      if (connFilter !== 'all' && c.connectionType !== connFilter) {
        return false;
      }

      // 6. Expiry Filter
      if (expiryFilter !== 'all') {
        const now = new Date();
        const exp = new Date(c.expiryDate);
        const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (expiryFilter === 'expired_today' && (diffDays > 0 || diffDays < -1)) return false;
        if (expiryFilter === 'expired_7' && (diffDays > 0 || diffDays < -7)) return false;
        if (expiryFilter === 'due_today' && (diffDays < 0 || diffDays > 1)) return false;
        if (expiryFilter === 'due_3' && (diffDays < 0 || diffDays > 3)) return false;
        if (expiryFilter === 'due_7' && (diffDays < 0 || diffDays > 7)) return false;
        if (expiryFilter === 'paid' && diffDays < 7) return false;
      }

      return true;
    });
  }, [rawList, search, statusFilter, areaFilter, packageFilter, connFilter, expiryFilter]);

  // Paginated slice
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedData = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, safeCurrentPage, pageSize]);

  // Bulk selection helpers
  const allFilteredSelected =
    paginatedData.length > 0 &&
    paginatedData.every((c) => selectedIds.has(c.id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds(new Set());
    } else {
      const next = new Set(selectedIds);
      paginatedData.forEach((c) => next.add(c.id));
      setSelectedIds(next);
    }
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
    setConnFilter('all');
    setExpiryFilter('all');
  };

  const activeFilterCount = [
    statusFilter !== 'all',
    areaFilter !== 'all',
    packageFilter !== 'all',
    connFilter !== 'all',
    expiryFilter !== 'all',
    search !== '',
  ].filter(Boolean).length;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleCopySubscriptionLink = (customerId: string) => {
    const url = `${window.location.origin}/customer/subscription?ref=${customerId}`;
    navigator.clipboard.writeText(url);
    toast.success('Subscription link copied to clipboard');
  };

  const handleExportCsv = () => {
    const headers = [
      'CID',
      'Name',
      'Username',
      'Phone',
      'Package',
      'Area',
      'Sub-Area',
      'Router',
      'PPPoE Secret',
      'Connection',
      'Status',
      'Expiry',
      'Balance BDT',
      'Address',
    ];
    const rows = filteredData.map((c) => [
      c.code || c.id,
      c.name,
      c.username,
      c.phone,
      c.packageName,
      c.areaName,
      c.subAreaName || '',
      c.routerName || 'MikroTik-Main',
      c.pppoeDetails?.name || c.username,
      c.connectionType,
      c.status,
      c.expiryDate,
      c.balanceBdt,
      `"${(c.address || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `isppaybd_customers_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filteredData.length} subscribers to CSV`);
  };

  // Bulk Actions
  const handleBulkSms = () => {
    if (selectedIds.size === 0) {
      toast.error('Please select at least one customer first');
      return;
    }
    toast.success(`Dispatched SMS broadcast to ${selectedIds.size} customers`);
    setBulkModal(null);
  };

  const handleBulkChangeRouter = () => {
    if (selectedIds.size === 0) {
      toast.error('Please select at least one customer first');
      return;
    }
    toast.success(`Migrated ${selectedIds.size} customers to router: ${targetRouter}`);
    setBulkModal(null);
    setSelectedIds(new Set());
  };

  const handleBulkChangePackage = () => {
    if (selectedIds.size === 0) {
      toast.error('Please select at least one customer first');
      return;
    }
    const pkg = packages.find((p) => p.id === targetPackage);
    toast.success(`Updated package to "${pkg?.name || targetPackage}" for ${selectedIds.size} customers`);
    setBulkModal(null);
    setSelectedIds(new Set());
  };

  const handleBulkAccStatus = () => {
    if (selectedIds.size === 0) {
      toast.error('Please select at least one customer first');
      return;
    }
    toast.success(
      `Account status set to "${targetAccStatus.toUpperCase()}" for ${selectedIds.size} customers`
    );
    setBulkModal(null);
    setSelectedIds(new Set());
  };

  const handleBulkRechargeAll = () => {
    if (selectedIds.size === 0) {
      toast.error('Please select at least one customer first');
      return;
    }
    toast.success(`Bulk monthly recharge triggered for ${selectedIds.size} customers`);
    setBulkModal(null);
    setSelectedIds(new Set());
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    for (const id of Array.from(selectedIds)) {
      await deleteMutation.mutateAsync(id);
    }
    toast.success(`Deleted ${selectedIds.size} customer accounts`);
    setBulkModal(null);
    setSelectedIds(new Set());
  };

  const handleSyncPppoe = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: 'Syncing PPPoE credentials with MikroTik Routers...',
        success: 'All PPPoE secrets synchronized successfully with active routers.',
        error: 'Failed to sync with MikroTik routers.',
      }
    );
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

            {/* Export CSV */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="text-xs h-8 border-border/80 hover:bg-accent transition-all duration-150"
            >
              <Download className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> Export
            </Button>

            {/* Sync PPPoE button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSyncPppoe}
              className="text-xs h-8 border-border/80 hover:bg-accent transition-all duration-150"
              title="Sync PPPoE credentials with active routers"
            >
              <Key className="mr-1.5 h-3.5 w-3.5 text-amber-500" /> Sync PPPoE
            </Button>

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
                <DropdownMenuItem
                  className="gap-2 cursor-pointer text-xs"
                  onClick={() => {
                    if (selectedIds.size === 0) return toast.error('Select customers first');
                    setBulkModal('sms');
                  }}
                >
                  <Send className="h-3.5 w-3.5 text-blue-500" /> Send SMS / Voice Alert
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2 cursor-pointer text-xs"
                  onClick={() => {
                    if (selectedIds.size === 0) return toast.error('Select customers first');
                    setBulkModal('router');
                  }}
                >
                  <Server className="h-3.5 w-3.5 text-primary" /> Migrate / Change Router
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2 cursor-pointer text-xs"
                  onClick={() => {
                    if (selectedIds.size === 0) return toast.error('Select customers first');
                    setBulkModal('package');
                  }}
                >
                  <PackageIcon className="h-3.5 w-3.5 text-amber-500" /> Change Package Tier
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2 cursor-pointer text-xs"
                  onClick={() => {
                    if (selectedIds.size === 0) return toast.error('Select customers first');
                    setBulkModal('accStatus');
                  }}
                >
                  <ToggleLeft className="h-3.5 w-3.5 text-emerald-500" /> Toggle Account Status
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2 cursor-pointer text-xs"
                  onClick={() => {
                    if (selectedIds.size === 0) return toast.error('Select customers first');
                    setBulkModal('recharge');
                  }}
                >
                  <Receipt className="h-3.5 w-3.5 text-purple-500" /> Bulk Recharge All
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  className="gap-2 cursor-pointer text-xs"
                  onClick={() => {
                    if (selectedIds.size === 0) return toast.error('Select customers first');
                    setBulkModal('delete');
                  }}
                >
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

      {/* KPI Metric Strips & Quick Scope Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm px-4 py-3 text-xs shadow-2xs">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-muted-foreground">
          <span>
            Total <span className="font-bold text-foreground tabular-nums">{rawList.length}</span> subscribers
          </span>
          <span className="hidden h-3 w-px bg-border sm:block" aria-hidden />
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {onlineCount}
            </span>{' '}
            online
          </span>
          <span className="hidden h-3 w-px bg-border sm:block" aria-hidden />
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-muted-foreground/50" />
            <span className="font-bold text-muted-foreground tabular-nums">
              {offlineCount}
            </span>{' '}
            offline
          </span>
          <span className="hidden h-3 w-px bg-border sm:block" aria-hidden />
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            <span className="font-bold text-rose-500 tabular-nums">{expiredCount}</span> expired
          </span>
          <span className="hidden h-3 w-px bg-border sm:block" aria-hidden />
          <span>
            Total Due{' '}
            <CurrencyDisplay
              amount={totalDueBdt}
              className="inline font-mono font-bold text-amber-500"
            />
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

      {/* Multi-facet Toolbar & Filters (Full ISP Specs) */}
      <Card className="border-border/70 shadow-2xs bg-card">
        <CardContent className="p-4 space-y-3">
          {/* Top Row: Search & Quick Status Buttons */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, username, phone, IP, MAC, address, code..."
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
              <Button
                type="button"
                size="sm"
                variant={statusFilter === 'all' ? 'default' : 'ghost'}
                onClick={() => setStatusFilter('all')}
                className="text-xs h-7 px-2.5"
              >
                All ({rawList.length})
              </Button>
              <Button
                type="button"
                size="sm"
                variant={statusFilter === 'online' ? 'default' : 'ghost'}
                onClick={() => setStatusFilter('online')}
                className="text-xs h-7 px-2.5 text-emerald-600 dark:text-emerald-400"
              >
                <span className="mr-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Online ({onlineCount})
              </Button>
              <Button
                type="button"
                size="sm"
                variant={statusFilter === 'offline' ? 'default' : 'ghost'}
                onClick={() => setStatusFilter('offline')}
                className="text-xs h-7 px-2.5 text-muted-foreground"
              >
                <span className="mr-1 h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                Offline ({offlineCount})
              </Button>
              <Button
                type="button"
                size="sm"
                variant={statusFilter === 'expired' ? 'default' : 'ghost'}
                onClick={() => setStatusFilter('expired')}
                className="text-xs h-7 px-2.5 text-rose-500"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mr-1" />
                Expired ({expiredCount})
              </Button>
              <Button
                type="button"
                size="sm"
                variant={statusFilter === 'suspended' ? 'default' : 'ghost'}
                onClick={() => setStatusFilter('suspended')}
                className="text-xs h-7 px-2.5 text-amber-500"
              >
                Suspended ({suspendedCount})
              </Button>
            </div>
          </div>

          {/* Bottom Row: Detailed Dropdown Filters (Area, Package, Connection, Expiry) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 pt-2 border-t border-border/40">
            {/* Area Filter */}
            <Select value={areaFilter} onValueChange={(val) => setAreaFilter(val || 'all')}>
              <SelectTrigger className="h-8 text-xs bg-background border-border/60">
                <MapPin className="h-3 w-3 mr-1 text-muted-foreground shrink-0" />
                <SelectValue placeholder="All Areas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Coverage Areas</SelectItem>
                {areas.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name} ({a.subareas.length} sub)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Package Filter */}
            <Select value={packageFilter} onValueChange={(val) => setPackageFilter(val || 'all')}>
              <SelectTrigger className="h-8 text-xs bg-background border-border/60">
                <PackageIcon className="h-3 w-3 mr-1 text-muted-foreground shrink-0" />
                <SelectValue placeholder="All Packages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Packages</SelectItem>
                {packages.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} — ৳{p.priceBdt}
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
                <SelectItem value="pppoe">PPPoE Protocol</SelectItem>
                <SelectItem value="static">Static IP</SelectItem>
                <SelectItem value="hotspot">Hotspot Client</SelectItem>
              </SelectContent>
            </Select>

            {/* Expiry & Cycle Filter */}
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
                <SelectItem value="paid">Paid (7+ Days Left)</SelectItem>
              </SelectContent>
            </Select>

            {/* Reset Filter Button */}
            {activeFilterCount > 0 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="h-8 text-xs font-medium border-border/80 text-muted-foreground hover:text-foreground col-span-2 sm:col-span-4 lg:col-span-1 gap-1"
              >
                <RotateCcw className="h-3 w-3" /> Reset ({activeFilterCount})
              </Button>
            ) : (
              <div className="hidden lg:flex items-center justify-end text-xs text-muted-foreground pr-2 font-mono">
                {filteredData.length} records
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Customers Comprehensive Data Table */}
      <Card className="border-border/70 shadow-2xs bg-card overflow-hidden ring-1 ring-border/50">
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
                    title={allFilteredSelected ? 'Deselect all' : 'Select all'}
                  >
                    {allFilteredSelected ? (
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
                {visibleColumns.password && <th className="py-3 px-4">Password</th>}
                {visibleColumns.payment && <th className="py-3 px-4">Expiry Date</th>}
                {visibleColumns.status && <th className="py-3 px-4">Status</th>}
                {visibleColumns.accStatus && <th className="py-3 px-4">Acc Status</th>}
                {visibleColumns.balance && <th className="py-3 px-4">Balance</th>}
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={Object.values(visibleColumns).filter(Boolean).length + 2} className="text-center py-16 text-muted-foreground">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Search className="h-8 w-8 mx-auto text-muted-foreground/50" />
                      <p className="font-semibold text-foreground">No matching subscribers</p>
                      <p className="text-xs text-muted-foreground">
                        Try clearing or relaxing your active search and filter combinations.
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
                paginatedData.map((c) => {
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
                          {c.code || c.id.replace('cust_', 'C')}
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
                                {c.username}
                              </div>
                            </div>
                          </div>
                        </td>
                      )}

                      {/* Package */}
                      {visibleColumns.package && (
                        <td className="py-3 px-4">
                          <div className="font-semibold text-foreground truncate max-w-[130px]">
                            {c.packageName}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-mono">
                            ৳{c.packagePrice || 800}/mo
                          </div>
                        </td>
                      )}

                      {/* Area / Sub-area */}
                      {visibleColumns.area && (
                        <td className="py-3 px-4">
                          <div className="font-medium text-foreground truncate max-w-[120px]">
                            {c.areaName}
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
                            <span>{c.phone}</span>
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
                            <span>{c.routerName || 'MikroTik-Main'}</span>
                          </div>
                        </td>
                      )}

                      {/* PPPoE Secret */}
                      {visibleColumns.pppoeSecret && (
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 font-mono text-[11px] text-foreground bg-muted/40 px-2 py-0.5 rounded border border-border/50 max-w-[120px] justify-between">
                            <span className="truncate">{c.pppoeDetails?.name || c.username}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(c.pppoeDetails?.name || c.username, 'PPPoE Secret')}
                              className="text-muted-foreground hover:text-primary transition-colors shrink-0"
                            >
                              <Copy className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        </td>
                      )}

                      {/* Router Password */}
                      {visibleColumns.password && (
                        <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground">
                          {c.connectionDetails?.routerPassword || '••••••••'}
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
                            <span>{c.expiryDate}</span>
                          </div>
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

                      {/* Acc Status (Active / Suspended / Expired) */}
                      {visibleColumns.accStatus && (
                        <td className="py-3 px-4">
                          <StatusBadge status={c.status} />
                        </td>
                      )}

                      {/* Balance Due */}
                      {visibleColumns.balance && (
                        <td className="py-3 px-4 font-mono font-bold text-xs">
                          {c.balanceBdt > 0 ? (
                            <span className="text-amber-500">
                              <CurrencyDisplay amount={c.balanceBdt} />
                            </span>
                          ) : (
                            <span className="text-muted-foreground">৳0</span>
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
                            <DropdownMenuItem
                              className="gap-2 cursor-pointer text-xs"
                              onClick={() => handleCopySubscriptionLink(c.id)}
                            >
                              <Link2 className="h-3.5 w-3.5 text-violet-500" /> Copy Subscription Link
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
                              onClick={() => toast.success(`SMS alert queued for ${c.phone}`)}
                            >
                              <MessageSquare className="h-3.5 w-3.5 text-amber-500" /> Send SMS Alert
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

        {/* Global Pagination Bar */}
        <TablePagination
          currentPage={safeCurrentPage}
          pageSize={pageSize}
          totalItems={filteredData.length}
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
        description="Are you sure you want to remove this subscriber? This will terminate their active MikroTik PPPoE secret and revoke billing access."
        confirmLabel="Confirm Delete"
        destructive
        onConfirm={async () => {
          if (deleteId) {
            await deleteMutation.mutateAsync(deleteId);
            setDeleteId(null);
          }
        }}
      />

      {/* ── Bulk SMS Broadcast Dialog ───────────────────────────────── */}
      <Dialog open={bulkModal === 'sms'} onOpenChange={(o) => !o && setBulkModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-blue-500" />
              Send SMS Broadcast
            </DialogTitle>
            <DialogDescription>
              Deliver notification message to <strong className="text-foreground">{selectedIds.size}</strong> selected customers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Message Body</Label>
              <textarea
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value)}
                rows={4}
                className="w-full rounded-md border border-border/80 bg-background p-2.5 text-xs focus:ring-1 focus:ring-primary shadow-inner"
              />
              <p className="text-[11px] text-muted-foreground">
                Character count: {smsMessage.length} (Estimated {Math.ceil(smsMessage.length / 160)} SMS parts)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setBulkModal(null)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleBulkSms} className="bg-blue-600 hover:bg-blue-700 text-white gap-1">
              <Send className="h-3.5 w-3.5" /> Send Broadcast
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Bulk Migrate Router Dialog ──────────────────────────────── */}
      <Dialog open={bulkModal === 'router'} onOpenChange={(o) => !o && setBulkModal(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Server className="h-5 w-5 text-primary" />
              Migrate Router
            </DialogTitle>
            <DialogDescription>
              Reassign and provision <strong className="text-foreground">{selectedIds.size}</strong> subscribers on a target MikroTik router.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Target MikroTik Router</Label>
              <Select value={targetRouter} onValueChange={(val) => setTargetRouter(val || 'MikroTik-RB4011')}>
                <SelectTrigger className="h-10 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MikroTik-RB4011">MikroTik-RB4011 (Uttara Core POP)</SelectItem>
                  <SelectItem value="MikroTik-CCR1036">MikroTik-CCR1036 (Mirpur Master)</SelectItem>
                  <SelectItem value="MikroTik-CCR1009">MikroTik-CCR1009 (Dhanmondi Edge)</SelectItem>
                  <SelectItem value="MikroTik-hAP-ac2">MikroTik-hAP ac² (CTG Branch)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setBulkModal(null)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleBulkChangeRouter} className="gap-1">
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
              Change Package Tier
            </DialogTitle>
            <DialogDescription>
              Upgrade or downgrade speed package for <strong className="text-foreground">{selectedIds.size}</strong> selected subscribers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">New Bandwidth Package</Label>
              <Select value={targetPackage} onValueChange={(val) => setTargetPackage(val || packages[0]?.id || '')}>
                <SelectTrigger className="h-10 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {packages.map((pkg) => (
                    <SelectItem key={pkg.id} value={pkg.id}>
                      {pkg.name} — {pkg.speedMbps} Mbps (৳{pkg.priceBdt}/mo)
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
            <Button size="sm" onClick={handleBulkChangePackage} className="bg-amber-600 hover:bg-amber-700 text-white gap-1">
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
              Set provisioning status for <strong className="text-foreground">{selectedIds.size}</strong> selected accounts.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Status</Label>
              <Select
                value={targetAccStatus}
                onValueChange={(v) => setTargetAccStatus(v as 'active' | 'suspended')}
              >
                <SelectTrigger className="h-10 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active (Connected & Enabled)</SelectItem>
                  <SelectItem value="suspended">Suspended (Disconnected / Locked)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setBulkModal(null)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleBulkAccStatus} className="gap-1">
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
              Renew monthly cycle and extend validity for <strong className="text-foreground">{selectedIds.size}</strong> customers.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 text-xs text-muted-foreground space-y-2">
            <p>
              This will automatically generate invoice records, mark monthly packages as renewed, and extend PPPoE active duration on MikroTik.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setBulkModal(null)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleBulkRechargeAll} className="bg-purple-600 hover:bg-purple-700 text-white gap-1">
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
              This action cannot be undone. All PPPoE secrets, active subscriptions, and billing history for these {selectedIds.size} accounts will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setBulkModal(null)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleBulkDelete} className="gap-1">
              <Trash2 className="h-3.5 w-3.5" /> Delete Selected
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
