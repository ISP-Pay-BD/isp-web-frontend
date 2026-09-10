'use client';

import { useState, useMemo } from 'react';
import {
  Building2,
  Users,
  Phone,
  LogIn,
  Plus,
  Download,
  Search,
  Wallet,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  MapPin,
  UserCheck,
  TrendingUp,
  CreditCard,
  Wifi,
  ExternalLink,
} from 'lucide-react';
import { usePopData } from '../../hooks/use-pop';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/features/shared/data-table';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import type { PopReseller } from '../../hooks/use-pop';
import { cn } from '@/lib/utils';

export function PopResellersPage() {
  const { data, isLoading, isError, refetch } = usePopData();
  const [selectedReseller, setSelectedReseller] = useState<PopReseller | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newPop, setNewPop] = useState({
    name: '',
    area: '',
    contact: '',
    manager: '',
    initialBalance: 50000,
  });

  const resellers = data?.resellers ?? [];

  const stats = useMemo(() => {
    const totalBalance = resellers.reduce((s, r) => s + r.balanceBdt, 0);
    const totalCustomers = resellers.reduce((s, r) => s + r.customers, 0);
    const activeCount = resellers.filter((r) => r.status === 'active').length;
    const avgCustomers = resellers.length ? Math.round(totalCustomers / resellers.length) : 0;
    return { totalBalance, totalCustomers, activeCount, avgCustomers };
  }, [resellers]);

  const handleExportCsv = () => {
    const headers = ['POP Name', 'Area', 'Balance (BDT)', 'Customers', 'Contact', 'Status'];
    const rows = resellers.map((r) => [
      r.name,
      r.area,
      r.balanceBdt,
      r.customers,
      r.contact,
      r.status,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pop_resellers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('POP Reseller directory exported to CSV');
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPop.name || !newPop.area) {
      toast.error('Please enter POP name and coverage area');
      return;
    }
    toast.success(`POP Reseller "${newPop.name}" registered successfully (mock)`);
    setAddDialogOpen(false);
    setNewPop({ name: '', area: '', contact: '', manager: '', initialBalance: 50000 });
  };

  const popSearchFilter = (
    row: LegacyRow<PopReseller>,
    _columnId: string,
    filterValue: unknown,
  ) => {
    const q = String(filterValue ?? '').toLowerCase().trim();
    if (!q) return true;
    const r = row.original;
    return (
      r.name.toLowerCase().includes(q) ||
      r.area.toLowerCase().includes(q) ||
      r.contact.toLowerCase().includes(q)
    );
  };

  const columns = useMemo<LegacyColumnDef<PopReseller, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'POP Reseller Hub',
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
                <div className="font-bold text-sm text-foreground hover:text-primary transition-colors cursor-pointer" onClick={() => setSelectedReseller(r)}>
                  {r.name}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                  <MapPin className="h-3 w-3 text-primary/70 shrink-0" />
                  <span>{r.area}</span>
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'balanceBdt',
        header: 'Wallet Balance',
        size: 140,
        cell: ({ row }) => {
          const bal = row.original.balanceBdt;
          const isLow = bal < 10000;
          return (
            <div>
              <div className={cn('font-mono font-bold text-sm', isLow ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400')}>
                <CurrencyDisplay amount={bal} />
              </div>
              <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Wallet className="h-2.5 w-2.5" />
                {isLow ? 'Low balance alert' : 'Prepaid balance'}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'customers',
        header: 'Subscribers',
        size: 130,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center justify-center h-6 px-2 rounded-md bg-secondary/80 border border-border/50 text-xs font-bold font-mono">
              <Users className="h-3 w-3 mr-1 text-primary" />
              {row.original.customers}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'contact',
        header: 'Primary Contact',
        size: 160,
        cell: ({ row }) => (
          <div className="space-y-0.5">
            <span className="flex items-center gap-1.5 font-mono text-xs font-medium text-foreground">
              <Phone className="h-3 w-3 text-muted-foreground" /> {row.original.contact}
            </span>
            <span className="text-[10px] text-muted-foreground block">
              Direct Desk Contact
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 110,
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: 'actions',
        header: '',
        size: 160,
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="flex items-center justify-end gap-1.5">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 px-2.5 text-xs hover:bg-primary/10 hover:text-primary gap-1"
                onClick={() => setSelectedReseller(r)}
              >
                Details
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-2.5 text-xs gap-1 border-border/80 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200 shadow-2xs"
                onClick={() => toast.success(`Switched portal session to POP "${r.name}" (mock)`)}
              >
                <LogIn className="h-3.5 w-3.5" />
                Login POP
              </Button>
            </div>
          );
        },
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (isError) {
    return (
      <EmptyState
        title="Failed to load POP resellers"
        description="Could not fetch POP directory from system database."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader
        title="POP Resellers"
        subtitle="Point-of-Presence partner hubs managing localized downstream subscriber distributions"
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'POP Suite' },
          { label: 'POP Resellers' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="text-xs border-border/80 hover:bg-accent"
            >
              <Download className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> Export Directory
            </Button>
            <Button
              size="sm"
              onClick={() => setAddDialogOpen(true)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-2xs gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" /> Add POP Partner
            </Button>
          </div>
        }
      />

      {/* KPI Stats Ribbon */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums text-foreground">{resellers.length}</span>{' '}
          <span className="text-muted-foreground">registered POPs · {stats.activeCount} active</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
            <CurrencyDisplay amount={stats.totalBalance} className="inline font-semibold" />
          </span>{' '}
          <span className="text-muted-foreground">combined wallet balance</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-foreground">{stats.totalCustomers.toLocaleString()}</span>{' '}
          <span className="text-muted-foreground">downstream customers</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-foreground">{stats.avgCustomers}</span>{' '}
          <span className="text-muted-foreground">avg customers / POP</span>
        </p>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={resellers}
        getRowId={(row) => row.id}
        searchKey="name"
        searchPlaceholder="Search POP name, coverage area, contact phone..."
        searchFilterFn={popSearchFilter}
        facetFilters={[
          { columnId: 'status', title: 'Status' },
        ]}
        emptyTitle="No POP resellers found"
        emptyDescription="Add POP reseller partners to distribute packages in remote and suburban zones."
      />

      {/* POP Inspector Details Dialog */}
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
                    <MapPin className="h-3 w-3 text-primary" /> {selectedReseller?.area}
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
                  <span className="text-muted-foreground text-[11px] block">Wallet Balance</span>
                  <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    ৳{selectedReseller.balanceBdt.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-1">
                  <span className="text-muted-foreground text-[11px] block">Active Subscribers</span>
                  <div className="text-lg font-bold font-mono text-foreground">
                    {selectedReseller.customers} Users
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-muted/20 border border-border/50 space-y-2">
                <div className="flex justify-between items-center py-0.5 border-b border-border/40">
                  <span className="text-muted-foreground">Reseller ID:</span>
                  <span className="font-mono font-semibold text-foreground">{selectedReseller.id}</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-border/40">
                  <span className="text-muted-foreground">Contact Phone:</span>
                  <span className="font-mono font-semibold text-foreground">{selectedReseller.contact}</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-border/40">
                  <span className="text-muted-foreground">Coverage Territory:</span>
                  <span className="font-medium text-foreground">{selectedReseller.area}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-muted-foreground">Assigned Billing Policy:</span>
                  <span className="font-medium text-primary">Prepaid Reseller Allocation</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    toast.success(`Funding request opened for ${selectedReseller.name}`);
                    setSelectedReseller(null);
                  }}
                  className="text-xs"
                >
                  <CreditCard className="mr-1.5 h-3.5 w-3.5" /> Top-Up Wallet
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    toast.success(`Switched portal session to POP "${selectedReseller.name}" (mock)`);
                    setSelectedReseller(null);
                  }}
                  className="text-xs font-semibold"
                >
                  <LogIn className="mr-1.5 h-3.5 w-3.5" /> Impersonate POP
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Register New POP Partner Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-md p-6 border-border/80 shadow-[var(--shadow-md)]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" /> Register New POP Reseller
            </DialogTitle>
            <DialogDescription className="text-xs">
              Establish a new Point-of-Presence franchise partner with an allocated wallet.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSubmit} className="space-y-3.5 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">POP Reseller Name *</Label>
              <Input
                placeholder="e.g. Skyline POP Uttara Sector 14"
                value={newPop.name}
                onChange={(e) => setNewPop({ ...newPop, name: e.target.value })}
                className="text-xs h-9"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Coverage Territory / Area *</Label>
              <Input
                placeholder="e.g. Sector 14, Uttara, Dhaka"
                value={newPop.area}
                onChange={(e) => setNewPop({ ...newPop, area: e.target.value })}
                className="text-xs h-9"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Contact Person</Label>
                <Input
                  placeholder="Manager Name"
                  value={newPop.manager}
                  onChange={(e) => setNewPop({ ...newPop, manager: e.target.value })}
                  className="text-xs h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Phone Number</Label>
                <Input
                  placeholder="+880 1700-000000"
                  value={newPop.contact}
                  onChange={(e) => setNewPop({ ...newPop, contact: e.target.value })}
                  className="text-xs h-9 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Initial Wallet Funding (BDT)</Label>
              <Input
                type="number"
                value={newPop.initialBalance}
                onChange={(e) => setNewPop({ ...newPop, initialBalance: Number(e.target.value) })}
                className="text-xs h-9 font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="outline" size="sm" onClick={() => setAddDialogOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="text-xs font-semibold">
                Register POP
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
