'use client';

import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import { PageHeader } from '@/features/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { toast } from 'sonner';
import { ExternalLink, Server } from 'lucide-react';

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

  if (isLoading) return <PageSkeleton variant="cards" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load movie servers" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Movie Servers"
        subtitle="BDIX / FTP / CDN endpoints published to customer portals"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Movie Servers' }]}
        actions={
          <Button onClick={() => toast.message('Add server (mock)')}>Add server</Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {data.items.map((srv) => (
          <Card key={srv.id} className="border-border/60">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">{srv.name}</CardTitle>
              </div>
              <Badge variant={srv.status === 'active' ? 'default' : 'secondary'}>{srv.status}</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="font-mono text-xs text-muted-foreground break-all">{srv.url}</p>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => toast.success('Opened in new tab (mock)')}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
