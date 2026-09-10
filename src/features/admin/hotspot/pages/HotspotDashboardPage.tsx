'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { useHotspotData } from '../hooks/useHotspotData';
import type { HotspotUserItem } from '@/data/admin/network-ops.data';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatBdtWithSymbol } from '@/lib/format/currency';
import { formatMac } from '@/lib/format/network';
import {
  Wifi,
  Activity,
  Router,
  TrendingUp,
  Download,
  BarChart3,
  MoreHorizontal,
  UserX,
  Clock,
  ArrowDownUp,
  Laptop,
} from 'lucide-react';
import { toast } from 'sonner';

const sessionSearchFilter = (
  row: LegacyRow<HotspotUserItem>,
  _columnId: string,
  filterValue: unknown,
) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const u = row.original;
  return (
    u.username.toLowerCase().includes(q) ||
    u.macAddress.toLowerCase().includes(q) ||
    u.ipAddress.includes(q) ||
    u.profileName.toLowerCase().includes(q)
  );
};

export function HotspotDashboardPage() {
  const { data, isLoading, isError, refetch } = useHotspotData();

  const users = data?.users ?? [];
  const reports = data?.reports ?? [];
  const routers = data?.routers ?? [];
  const activeSessions = users.filter((u) => u.status === 'active');
  const onlineRouters = routers.filter((r) => r.status === 'online').length;
  const totalRevenue = reports.reduce((s, r) => s + (r.priceBdt || 0), 0);
  const totalTrafficMb = users.reduce((s, u) => s + (u.bytesInMb || 0) + (u.bytesOutMb || 0), 0);

  const handleExportCsv = () => {
    const headers = ['Username', 'Profile', 'MAC Address', 'IP Address', 'Uptime', 'Bytes In (MB)', 'Bytes Out (MB)', 'Status'];
    const rows = users.map((u) => [
      u.username,
      u.profileName,
      u.macAddress,
      u.ipAddress,
      u.uptime,
      u.bytesInMb,
      u.bytesOutMb,
      u.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hotspot_active_sessions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Hotspot sessions exported to CSV');
  };

  const columns = useMemo<LegacyColumnDef<HotspotUserItem, unknown>[]>(
    () => [
      {
        accessorKey: 'username',
        header: 'Client / Voucher User',
        enableHiding: false,
        size: 200,
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
              <Laptop className="h-4 w-4" />
            </div>
            <div>
              <span className="font-semibold text-foreground text-sm">{row.original.username}</span>
              <span className="text-xs text-muted-foreground block font-mono">PIN: {row.original.pin}</span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'profileName',
        header: 'Bandwidth Tier',
        size: 160,
        cell: ({ row }) => (
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-medium">
            {row.original.profileName}
          </Badge>
        ),
      },
      {
        accessorKey: 'macAddress',
        header: 'MAC Address',
        size: 160,
        cell: ({ row }) => (
          <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted text-foreground border border-border/70">
            {formatMac(row.original.macAddress)}
          </span>
        ),
      },
      {
        accessorKey: 'ipAddress',
        header: 'Allocated IP',
        size: 140,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">{row.original.ipAddress}</span>
        ),
      },
      {
        accessorKey: 'uptime',
        header: 'Session Uptime',
        size: 130,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span>{row.original.uptime}</span>
          </div>
        ),
      },
      {
        id: 'traffic',
        header: 'Traffic (In / Out)',
        size: 170,
        cell: ({ row }) => (
          <div className="text-xs font-mono">
            <span className="text-emerald-500">↓ {row.original.bytesInMb} MB</span>
            <span className="text-muted-foreground mx-1">/</span>
            <span className="text-sky-500">↑ {row.original.bytesOutMb} MB</span>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 110,
        cell: ({ row }) => {
          const active = row.original.status === 'active';
          return (
            <Badge
              variant="outline"
              className={active ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' : 'bg-muted text-muted-foreground'}
            >
              {active ? 'Online' : 'Expired'}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        size: 60,
        cell: ({ row }) => {
          const u = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors">
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Session Options</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => toast.success(`Extended 1hr validity for ${u.username}`)}>
                  <Clock className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                  Extend 1 Hour
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-rose-500 focus:text-rose-500"
                  onClick={() => toast.warning(`Session ${u.username} disconnected`)}
                >
                  <UserX className="h-3.5 w-3.5 mr-2" />
                  Disconnect Session
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="dashboard" rows={6} />;
  if (isError) {
    return (
      <div className="p-6">
        <EmptyState
          title="Failed to load hotspot dashboard"
          description="Could not fetch sessions and router health."
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hotspot Live Dashboard"
        subtitle="Real-time guest client sessions, bandwidth throughput, MAC address bindings, and router status."
        breadcrumb={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Hotspot', href: '/admin/hotspot' },
          { label: 'Live Dashboard' },
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <Button variant="outline" size="sm" onClick={handleExportCsv} className="h-9">
              <Download className="mr-2 h-4 w-4" />
              Export Sessions
            </Button>
            <Link href="/admin/hotspot/reports">
              <Button size="sm" className="h-9">
                <BarChart3 className="mr-2 h-4 w-4" />
                Sales Report
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Live Active Sessions</span>
            <Activity className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
            {activeSessions.length}
          </div>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">Guest devices connected</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Gateways Online</span>
            <Router className="h-4 w-4 text-sky-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {onlineRouters} / {routers.length}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Synchronized MikroTik APs</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Voucher Sales</span>
            <TrendingUp className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {formatBdtWithSymbol(totalRevenue)}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Total voucher revenue</p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Data Consumed</span>
            <ArrowDownUp className="h-4 w-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {(totalTrafficMb / 1024).toFixed(2)} GB
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Session bandwidth throughput</p>
        </div>
      </div>

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={users}
        searchKey="username"
        searchFilterFn={sessionSearchFilter}
        searchPlaceholder="Search session by username, MAC, IP, or profile..."
      />
    </div>
  );
}
