'use client';

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { toast } from 'sonner';
import {
  ExternalLink,
  Server,
  Plus,
  RefreshCw,
  Film,
  PlaySquare,
  Globe,
  CheckCircle2,
  Tv,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MovieServer {
  id: string;
  name: string;
  type: string;
  url: string;
  status: string;
}

export function MovieServersPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'domain', 'movieServers'],
    queryFn: async () => {
      const res = await mockFetch('admin.domain', 'movieServers');
      return res as { items: MovieServer[] };
    },
  });

  const list = useMemo(() => data?.items ?? [], [data?.items]);

  const stats = useMemo(() => {
    const total = list.length;
    const active = list.filter((s) => s.status.toLowerCase() === 'active').length;
    const bdixCount = list.filter((s) => s.name.toLowerCase().includes('bdix') || s.type?.toLowerCase().includes('bdix')).length;
    return { total, active, bdixCount };
  }, [list]);

  if (isLoading) return <PageSkeleton variant="cards" rows={4} />;
  if (isError || !data) {
    return <EmptyState title="Failed to load movie servers" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Top Header */}
      <PageHeader
        title="BDIX Movie & Media Server Endpoints"
        subtitle="Manage high-speed BDIX FTP servers, IPTV live streaming hubs, and CDN cache endpoints for subscriber discovery."
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Movie Servers' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="border-border/80 hover:bg-accent text-xs h-9 gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => toast.success('Add Media Server dialog (mock)')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-sm text-xs h-9 gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Add Media Server
            </Button>
          </div>
        }
      />

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Media Hubs</span>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Film className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black font-mono text-foreground">{stats.total}</div>
            <div className="mt-2 text-[11px] text-muted-foreground">FTP, OTT & IPTV portals</div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Online & Healthy</span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black font-mono text-emerald-400">{stats.active}</div>
            <div className="mt-2 text-[11px] text-muted-foreground">Reachable over local BDIX</div>
          </CardContent>
        </Card>

        <Card className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm relative overflow-hidden col-span-2 sm:col-span-1">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Direct Peering</span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Tv className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black font-mono text-blue-400">10 Gbps BDIX</div>
            <div className="mt-2 text-[11px] text-muted-foreground">Ultra-low latency streaming</div>
          </CardContent>
        </Card>
      </div>

      {/* Media Server Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {list.map((srv) => (
          <Card
            key={srv.id}
            className="border border-border/70 bg-card/60 backdrop-blur-md shadow-sm hover:border-primary/50 hover:bg-card/90 transition-all duration-200 overflow-hidden"
          >
            <CardHeader className="p-5 border-b border-border/50 flex flex-row items-start justify-between space-y-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <PlaySquare className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-foreground">{srv.name}</CardTitle>
                  <span className="font-mono text-xs text-muted-foreground">{srv.type || 'FTP BDIX'}</span>
                </div>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  'text-[10px] font-semibold uppercase',
                  srv.status === 'active'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-muted text-muted-foreground border-border/60'
                )}
              >
                {srv.status}
              </Badge>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="p-2.5 rounded-lg bg-muted/30 border border-border/50">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground block mb-0.5">Endpoint URL</span>
                <p className="font-mono text-xs text-foreground truncate">{srv.url}</p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border/50">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 gap-1.5 border-border/80 hover:bg-accent"
                  onClick={() => toast.success(`Testing reachability to ${srv.name}... Status: OK (1ms)`)}
                >
                  <RefreshCw className="h-3 w-3" /> Test Ping
                </Button>
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-8 gap-1.5"
                  onClick={() => toast.success(`Opened ${srv.name} endpoint in customer browser`)}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Launch Web Player
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
