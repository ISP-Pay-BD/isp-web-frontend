'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { toast } from 'sonner';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { useServerTable } from '@/features/admin/routers/hooks/useServerTable';
import { useHotspotRouter } from '../hooks/useHotspotRouter';
import { useDisconnectHotspotSession, useHotspotDashboard, useHotspotSessions } from '../hooks/useHotspotData';
import { HotspotRouterSelect } from '../components/HotspotRouterSelect';
import { HotspotQueryError, HotspotRouterGate } from '../components/HotspotStates';
import { HotspotKpi, HotspotKpiRow, HotspotKpiSkeleton } from '../components/HotspotKpi';
import type { HotspotSession } from '../types';
import { formatBytes } from '../utils';
import { DataTable } from '@/features/shared/data-table';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatBdtWithSymbol } from '@/lib/format/currency';
import { formatMac } from '@/lib/format/network';
import { Activity, BarChart3, Clock, Cpu, Laptop, MoreHorizontal, ScrollText, TrendingUp, Users, UserX } from 'lucide-react';

export function HotspotDashboardPage() {
  const hs = useHotspotRouter();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hotspot Live Dashboard"
        subtitle="Live guest sessions, router health and the hotspot log of the selected router."
        breadcrumb={[
          { label: 'Dashboard', href: '/admin/dashboard' },
          { label: 'Hotspot', href: '/admin/hotspot' },
          { label: 'Live Dashboard' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <HotspotRouterSelect state={hs} />
            <Link href="/admin/hotspot/reports">
              <Button size="sm" className="h-9">
                <BarChart3 className="mr-2 h-4 w-4" />
                Sales Report
              </Button>
            </Link>
          </div>
        }
      />
      <HotspotRouterGate state={hs}>
        {hs.router ? <LiveDashboard key={hs.router.id} routerId={hs.router.id} routerName={hs.router.name} /> : null}
      </HotspotRouterGate>
    </div>
  );
}

function LiveDashboard({ routerId, routerName }: { routerId: string; routerName: string }) {
  const table = useServerTable();
  const { page, pageSize, search } = table;
  const [kick, setKick] = useState<HotspotSession | null>(null);

  const dashboard = useHotspotDashboard(routerId, { live: true });
  const sessions = useHotspotSessions(routerId, { page, pageSize, search });
  const disconnect = useDisconnectHotspotSession(routerId);

  const columns = useMemo<LegacyColumnDef<HotspotSession, unknown>[]>(
    () => [
      {
        accessorKey: 'user',
        header: 'Guest / Voucher User',
        enableHiding: false,
        size: 200,
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
              <Laptop className="h-4 w-4" />
            </div>
            <div>
              <span className="font-semibold text-foreground text-sm">{row.original.user || '—'}</span>
              {row.original.loginBy ? (
                <span className="text-xs text-muted-foreground block">via {row.original.loginBy}</span>
              ) : null}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'macAddress',
        header: 'MAC Address',
        size: 160,
        cell: ({ row }) =>
          row.original.macAddress ? (
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted text-foreground border border-border/70">
              {formatMac(row.original.macAddress)}
            </span>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        accessorKey: 'address',
        header: 'IP Address',
        size: 140,
        cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.address || '—'}</span>,
      },
      {
        accessorKey: 'uptime',
        header: 'Session Uptime',
        size: 150,
        cell: ({ row }) => (
          <div className="text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-primary" />
              <span>{row.original.uptime || '—'}</span>
            </div>
            {row.original.sessionTimeLeft ? <span className="block pl-5">{row.original.sessionTimeLeft} left</span> : null}
          </div>
        ),
      },
      {
        id: 'traffic',
        header: 'Traffic (In / Out)',
        size: 170,
        cell: ({ row }) => (
          <div className="text-xs font-mono">
            <span className="text-emerald-500">↓ {formatBytes(row.original.bytesIn)}</span>
            <span className="text-muted-foreground mx-1">/</span>
            <span className="text-sky-500">↑ {formatBytes(row.original.bytesOut)}</span>
          </div>
        ),
      },
      {
        id: 'actions',
        header: '',
        size: 60,
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Session options"
              className="inline-flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
            >
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Session Options</DropdownMenuLabel>
                <DropdownMenuItem className="text-rose-500 focus:text-rose-500" onClick={() => setKick(row.original)}>
                  <UserX className="h-3.5 w-3.5 mr-2" />
                  Disconnect Session
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [],
  );

  if (dashboard.isError) {
    return (
      <HotspotQueryError
        error={dashboard.error}
        routerName={routerName}
        title="Failed to load hotspot dashboard"
        onRetry={() => {
          void dashboard.refetch();
          void sessions.refetch();
        }}
      />
    );
  }

  const d = dashboard.data;
  const routerInfo = d ? [d.boardName, d.os && `RouterOS ${d.os}`, d.uptime && `up ${d.uptime}`].filter(Boolean).join(' · ') : '';

  return (
    <>
      {dashboard.isLoading || !d ? (
        <HotspotKpiSkeleton />
      ) : (
        <HotspotKpiRow>
          <HotspotKpi
            label="Live Sessions"
            value={d.activeSessions}
            hint="Guests online now"
            icon={<Activity className="h-4 w-4 text-emerald-500" />}
            positive
          />
          <HotspotKpi
            label="Hotspot Users"
            value={d.totalUsers}
            hint="Accounts & vouchers on the router"
            icon={<Users className="h-4 w-4 text-sky-500" />}
          />
          <HotspotKpi
            label="Sales Today"
            value={formatBdtWithSymbol(d.incomeToday)}
            hint={`This month ${formatBdtWithSymbol(d.incomeMonth)}`}
            icon={<TrendingUp className="h-4 w-4 text-amber-500" />}
          />
          <HotspotKpi
            label="Router CPU"
            value={`${d.cpuLoad}%`}
            hint={routerInfo || undefined}
            icon={<Cpu className="h-4 w-4 text-primary" />}
          />
        </HotspotKpiRow>
      )}

      {sessions.isError ? (
        <HotspotQueryError
          error={sessions.error}
          routerName={routerName}
          title="Failed to load live sessions"
          onRetry={() => void sessions.refetch()}
        />
      ) : (
        <DataTable
          columns={columns}
          data={sessions.data?.items ?? []}
          isLoading={sessions.isLoading}
          emptyTitle="No guests online"
          emptyDescription="Active hotspot sessions on this router appear here."
          searchPlaceholder="Search by user, MAC or IP..."
          getRowId={(r) => r.id}
          server={table.server(sessions.data?.meta.total ?? 0)}
        />
      )}

      {d && d.logs.length > 0 ? (
        <Card className="border-border/60 bg-card/60">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <ScrollText className="h-4 w-4 text-primary" />
              Hotspot Log
              <Badge variant="outline" className="ml-1 font-mono text-xs tabular-nums">
                {d.logs.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="max-h-64 space-y-1 overflow-y-auto text-xs">
              {d.logs.map((log, i) => (
                <li key={`${log.time}-${i}`} className="flex gap-3 border-b border-border/40 py-1 last:border-0">
                  <span className="shrink-0 font-mono text-muted-foreground tabular-nums">{log.time}</span>
                  <span className="text-foreground">{log.message}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      <ConfirmDialog
        open={kick !== null}
        onOpenChange={(open) => {
          if (!open) setKick(null);
        }}
        title="Disconnect this session?"
        description={kick ? `${kick.user || kick.address} will be logged out of the hotspot and can log in again.` : undefined}
        confirmLabel="Disconnect"
        destructive
        onConfirm={() => {
          if (!kick) return;
          const target = kick;
          setKick(null);
          disconnect.mutate(target.id, {
            onSuccess: () => toast.success(`${target.user || target.address} disconnected`),
          });
        }}
      />
    </>
  );
}
