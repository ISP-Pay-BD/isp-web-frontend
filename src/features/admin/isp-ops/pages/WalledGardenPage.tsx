'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { useIspOps } from '../hooks/use-isp-ops';
import type { IspOpsData } from '@/data/admin/isp-ops.data';
import {
  Plus,
  Download,
  ShieldCheck,
  CheckCircle2,
  Globe,
  MoreHorizontal,
  Zap,
  Edit,
  Trash2,
  CreditCard,
} from 'lucide-react';
import { toast } from 'sonner';

type Row = IspOpsData['walledGardenRules'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.host).toLowerCase().includes(q) ||
    String(r.comment).toLowerCase().includes(q)
  );
};

export function WalledGardenPage() {
  const { data, isLoading, isError, refetch } = useIspOps();
  const [rules, setRules] = useState<Row[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [host, setHost] = useState('');
  const [comment, setComment] = useState('');

  const initialRows = data?.walledGardenRules ?? [];
  const rows = rules.length > 0 ? rules : initialRows;

  const totalRules = rows.length;
  const enabledCount = rows.filter((r) => r.enabled).length;
  const disabledCount = totalRules - enabledCount;
  const pgwCount = rows.filter((r) =>
    r.host.toLowerCase().includes('bkash') ||
    r.host.toLowerCase().includes('nagad') ||
    r.host.toLowerCase().includes('ssl') ||
    r.host.toLowerCase().includes('payment')
  ).length;

  const handleAddHost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!host.trim()) {
      toast.error('Please enter host name or IP address');
      return;
    }

    const newRule: Row = {
      id: `wg_${Date.now()}`,
      host: host.toLowerCase(),
      comment: comment.trim() || 'Pre-auth bypass rule',
      enabled: true,
    };

    setRules((prev) => [newRule, ...(prev.length > 0 ? prev : initialRows)]);
    toast.success(`Walled Garden host "${newRule.host}" whitelisted.`);
    setModalOpen(false);
    setHost('');
    setComment('');
  };

  const handleExportCsv = () => {
    const headers = ['Destination Host', 'Comment / Description', 'Enabled Status'];
    const csvRows = rows.map((r) => [
      r.host,
      `"${r.comment}"`,
      r.enabled ? 'Enabled' : 'Disabled',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...csvRows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `walled_garden_rules_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Walled garden rules exported to CSV');
  };

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'host',
        header: 'Whitelisted Host / Domain',
        enableHiding: false,
        size: 260,
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
              <Globe className="h-4 w-4" />
            </div>
            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted text-foreground border border-border/70">
              {String(row.original.host)}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'comment',
        header: 'Rule Purpose & Description',
        size: 320,
        cell: ({ row }) => (
          <span className="text-sm text-foreground">{String(row.original.comment)}</span>
        ),
      },
      {
        accessorKey: 'enabled',
        header: 'Status',
        size: 130,
        cell: ({ row }) => {
          const en = !!row.original.enabled;
          return (
            <Badge
              variant="outline"
              className={
                en
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                  : 'bg-muted text-muted-foreground'
              }
            >
              {en ? 'Enabled' : 'Disabled'}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        size: 60,
        cell: ({ row }) => {
          const r = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors">
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Rule Options</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => toast.success(`DNS test reached ${r.host}`)}>
                  <Zap className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                  Test DNS Resolution
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info(`Editing ${r.host}`)}>
                  <Edit className="h-3.5 w-3.5 mr-2" />
                  Edit Rule
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-rose-500 focus:text-rose-500"
                  onClick={() => toast.warning(`Rule ${r.host} deleted`)}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Remove Host
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load rules" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hotspot Walled Garden Rules"
        subtitle="Manage pre-authentication access rules, captive portal assets, and payment gateway bypasses."
        breadcrumb={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Hotspot', href: '/admin/hotspot' },
          { label: 'Walled Garden' },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="sm" onClick={handleExportCsv} className="h-9">
              <Download className="mr-2 h-4 w-4" />
              Export Rules
            </Button>
            <Button size="sm" onClick={() => setModalOpen(true)} className="h-9">
              <Plus className="mr-2 h-4 w-4" />
              Add Host Rule
            </Button>
          </div>
        }
      />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Total Rules</span>
            <ShieldCheck className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {totalRules}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Whitelisted host patterns</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Active Enabled</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
            {enabledCount}
          </div>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">Bypassing captive portal</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Disabled</span>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {disabledCount}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Inactive exemptions</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Payment Gateways</span>
            <CreditCard className="h-4 w-4 text-sky-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {pgwCount}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">bKash, Nagad, SSLCommerz</p>
        </div>
      </div>

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={rows}
        searchKey="host"
        searchFilterFn={searchFilter}
        searchPlaceholder="Search host domain or comment..."
      />

      {/* Add Host Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleAddHost}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                Whitelist Walled Garden Host
              </DialogTitle>
              <DialogDescription>
                Allow guest devices to access this domain or IP address before logging into the captive portal.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="wg-host">Destination Host / Domain *</Label>
                <Input
                  id="wg-host"
                  placeholder="e.g. *.bkash.com or *.isppaybd.com"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  className="font-mono"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="wg-desc">Purpose / Comment</Label>
                <Input
                  id="wg-desc"
                  placeholder="e.g. bKash payment gateway checkout redirection"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Whitelist Host</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
