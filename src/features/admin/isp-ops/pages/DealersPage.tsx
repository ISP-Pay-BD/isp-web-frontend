'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import {
  Building2,
  Users,
  Award,
  Plus,
  Download,
  Phone,
  MapPin,
  ShieldCheck,
  Star,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  TrendingUp,
  LogIn,
} from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { DataTable } from '@/features/shared/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useIspOps } from '../hooks/use-isp-ops';
import type { IspOpsData } from '@/data/admin/isp-ops.data';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Row = IspOpsData['dealers'][number];

const TIER_LABELS: Record<number, { label: string; badgeClass: string; stars: number }> = {
  1: { label: 'Tier-1 Super Master', badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20', stars: 5 },
  2: { label: 'Tier-2 Master Dealer', badgeClass: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20', stars: 4 },
  3: { label: 'Tier-3 Regional Hub', badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20', stars: 3 },
  4: { label: 'Tier-4 Local Franchise', badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', stars: 2 },
  5: { label: 'Tier-5 Sub Dealer', badgeClass: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20', stars: 1 },
  6: { label: 'Tier-6 Field Agent', badgeClass: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20', stars: 1 },
};

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.name).toLowerCase().includes(q) ||
    String(r.area).toLowerCase().includes(q) ||
    String(r.tier).includes(q) ||
    String(r.status).toLowerCase().includes(q)
  );
};

export function DealersPage() {
  const { data, isLoading, isError, refetch } = useIspOps();
  const [selectedDealer, setSelectedDealer] = useState<Row | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newDealer, setNewDealer] = useState({
    name: '',
    tier: '1',
    area: '',
    customers: 50,
  });

  const rows = data?.dealers ?? [];

  const stats = useMemo(() => {
    const totalDealers = rows.length;
    const activeDealers = rows.filter((r) => r.status === 'active').length;
    const totalCustomers = rows.reduce((s, r) => s + r.customers, 0);
    const avgCustomers = totalDealers ? Math.round(totalCustomers / totalDealers) : 0;
    return { totalDealers, activeDealers, totalCustomers, avgCustomers };
  }, [rows]);

  const handleExportCsv = () => {
    const headers = ['Dealer Name', 'Tier', 'Tier Label', 'Area', 'Customers', 'Status'];
    const csvRows = rows.map((r) => [
      r.name,
      r.tier,
      TIER_LABELS[r.tier]?.label ?? `Tier ${r.tier}`,
      r.area,
      r.customers,
      r.status,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...csvRows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `dealers_6tier_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Dealer directory exported to CSV');
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDealer.name || !newDealer.area) {
      toast.error('Please enter dealer name and coverage territory');
      return;
    }
    toast.success(`Dealer partner "${newDealer.name}" registered under Tier ${newDealer.tier} (mock)`);
    setAddDialogOpen(false);
    setNewDealer({ name: '', tier: '1', area: '', customers: 50 });
  };

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Dealer Entity',
        enableHiding: false,
        size: 240,
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0 font-bold text-xs">
              <Award className="h-4 w-4" />
            </div>
            <div>
              <div
                className="font-bold text-sm text-foreground hover:text-primary transition-colors cursor-pointer"
                onClick={() => setSelectedDealer(row.original)}
              >
                {row.original.name}
              </div>
              <div className="text-[10px] text-muted-foreground font-mono">
                {row.original.id}
              </div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'tier',
        header: 'Tier Level (1-6)',
        size: 180,
        cell: ({ row }) => {
          const tier = row.original.tier;
          const tierInfo = TIER_LABELS[tier] ?? { label: `Tier-${tier}`, badgeClass: 'bg-muted', stars: 1 };
          return (
            <div className="space-y-1">
              <Badge variant="outline" className={cn('text-[10px] font-semibold', tierInfo.badgeClass)}>
                {tierInfo.label}
              </Badge>
              <div className="flex items-center gap-0.5 text-amber-500">
                {Array.from({ length: tierInfo.stars }).map((_, i) => (
                  <Star key={i} className="h-2.5 w-2.5 fill-current" />
                ))}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'area',
        header: 'Franchise Territory',
        size: 180,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-xs text-foreground">
            <MapPin className="h-3 w-3 text-primary shrink-0" />
            <span>{row.original.area}</span>
          </div>
        ),
      },
      {
        accessorKey: 'customers',
        header: 'Subscribers',
        size: 130,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center justify-center h-6 px-2 rounded-md bg-secondary/80 border border-border/50 text-xs font-bold font-mono text-foreground">
              <Users className="h-3 w-3 mr-1 text-primary" />
              {row.original.customers}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 110,
        cell: ({ row }) => (
          row.original.status === 'active' ? (
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-medium gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
              Active
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-[10px] font-medium gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500 inline-block" />
              Suspended
            </Badge>
          )
        ),
      },
      {
        id: 'actions',
        header: '',
        size: 120,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedDealer(row.original)}
              className="h-7 text-xs text-primary hover:bg-primary/10"
            >
              Details
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast.success(`Impersonating dealer portal session for ${row.original.name}`)}
              className="h-7 px-2 text-xs"
            >
              <LogIn className="h-3 w-3" />
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (isError || !data) {
    return (
      <EmptyState
        title="Failed to load dealers"
        description="Could not fetch dealer hierarchy records."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader
        title="Dealers (6-Tier Hierarchy)"
        subtitle="Multi-level franchise dealer network management, tier commissions, and subscriber distribution"
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Dealers' },
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
              <Plus className="h-3.5 w-3.5" /> Add Dealer Partner
            </Button>
          </div>
        }
      />

      {/* KPI Stats Ribbon */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums text-foreground">{stats.totalDealers}</span>{' '}
          <span className="text-muted-foreground">registered dealers · {stats.activeDealers} active</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-foreground">{stats.totalCustomers.toLocaleString()}</span>{' '}
          <span className="text-muted-foreground">total served subscribers</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-primary">{stats.avgCustomers}</span>{' '}
          <span className="text-muted-foreground">average customer footprint / dealer</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">6 Tiers</span>{' '}
          <span className="text-muted-foreground">revenue sharing hierarchy active</span>
        </p>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.id}
        searchKey="name"
        searchPlaceholder="Search dealer name, area, or tier..."
        searchFilterFn={searchFilter}
        facetFilters={[
          { columnId: 'status', title: 'Status' },
        ]}
        emptyTitle="No dealers found"
        emptyDescription="Register a dealer partner to expand your localized network presence."
      />

      {/* Dealer Details Dialog */}
      <Dialog open={!!selectedDealer} onOpenChange={(open) => !open && setSelectedDealer(null)}>
        <DialogContent className="max-w-md p-6 border-border/80 shadow-[var(--shadow-md)]">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                  <Award className="h-4 w-4" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold">{selectedDealer?.name}</DialogTitle>
                  <DialogDescription className="text-xs">
                    {selectedDealer && TIER_LABELS[selectedDealer.tier]?.label}
                  </DialogDescription>
                </div>
              </div>
              {selectedDealer && (
                <Badge variant="outline" className="capitalize text-xs">
                  {selectedDealer.status}
                </Badge>
              )}
            </div>
          </DialogHeader>

          {selectedDealer && (
            <div className="space-y-4 pt-2 text-xs">
              <div className="p-3.5 rounded-xl bg-muted/20 border border-border/50 space-y-2">
                <div className="flex justify-between items-center py-0.5 border-b border-border/40">
                  <span className="text-muted-foreground">Entity ID:</span>
                  <span className="font-mono font-semibold text-foreground">{selectedDealer.id}</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-border/40">
                  <span className="text-muted-foreground">Coverage Territory:</span>
                  <span className="font-medium text-foreground">{selectedDealer.area}</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-border/40">
                  <span className="text-muted-foreground">Active Customer Base:</span>
                  <span className="font-mono font-bold text-foreground">{selectedDealer.customers} Subscribers</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="text-muted-foreground">Revenue Share Split:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {selectedDealer.tier === 1 ? '12% Top Tier' : `${10 - selectedDealer.tier}% Standard`}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button size="sm" variant="outline" onClick={() => setSelectedDealer(null)} className="text-xs">
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    toast.success(`Switched portal session to dealer "${selectedDealer.name}"`);
                    setSelectedDealer(null);
                  }}
                  className="text-xs font-semibold"
                >
                  <LogIn className="mr-1.5 h-3.5 w-3.5" /> Impersonate Dealer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Dealer Partner Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-md p-6 border-border/80 shadow-[var(--shadow-md)]">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" /> Register New Franchise Dealer
            </DialogTitle>
            <DialogDescription className="text-xs">
              Establish a new 6-tier partner with assigned territory and subscriber allocation.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSubmit} className="space-y-3.5 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Dealer Enterprise Name *</Label>
              <Input
                placeholder="e.g. Uttara North Broadband Franchise"
                value={newDealer.name}
                onChange={(e) => setNewDealer({ ...newDealer, name: e.target.value })}
                className="text-xs h-9"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Hierarchy Tier *</Label>
                <Select
                  value={newDealer.tier}
                  onValueChange={(v) => v && setNewDealer({ ...newDealer, tier: v })}
                >
                  <SelectTrigger className="text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Tier 1 — Super Master</SelectItem>
                    <SelectItem value="2">Tier 2 — Master Dealer</SelectItem>
                    <SelectItem value="3">Tier 3 — Regional Hub</SelectItem>
                    <SelectItem value="4">Tier 4 — Local Franchise</SelectItem>
                    <SelectItem value="5">Tier 5 — Sub Dealer</SelectItem>
                    <SelectItem value="6">Tier 6 — Field Agent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Initial Subscribers</Label>
                <Input
                  type="number"
                  value={newDealer.customers}
                  onChange={(e) => setNewDealer({ ...newDealer, customers: Number(e.target.value) })}
                  className="text-xs h-9 font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Coverage Territory / Area *</Label>
              <Input
                placeholder="e.g. Uttara Sector 4 & 6, Dhaka"
                value={newDealer.area}
                onChange={(e) => setNewDealer({ ...newDealer, area: e.target.value })}
                className="text-xs h-9"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="outline" size="sm" onClick={() => setAddDialogOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="text-xs font-semibold">
                Register Dealer
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
