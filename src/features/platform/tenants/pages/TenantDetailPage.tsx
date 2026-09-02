'use client';

import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import { PlatformPageHeader } from '@/features/platform/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Edit2, Globe, Ticket } from 'lucide-react';
import Link from 'next/link';

interface TenantDetailPageProps {
  tenantId: string;
}

export function TenantDetailPage({ tenantId }: TenantDetailPageProps) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['platform', 'tenants', tenantId],
    queryFn: () => mockFetch('platform.tenants.get', tenantId),
  });

  if (isLoading) return <PageSkeleton rows={5} />;
  if (error || !data) {
    return (
      <EmptyState
        title="Tenant not found"
        description="Could not load tenant portal details."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  const { tenant, tickets } = data;

  return (
    <div className="space-y-6">
      <PlatformPageHeader
        title={tenant.name}
        subtitle={`${tenant.slug}.isppaybd.com — ${tenant.plan} tier`}
        breadcrumb={[
          { label: 'Platform', href: '/platform/dashboard' },
          { label: 'Tenants', href: '/platform/tenants' },
          { label: tenant.name },
        ]}
        actions={
          <div className="flex gap-2">
            <a href={`https://${tenant.domain}`} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <ExternalLink className="mr-1.5 h-4 w-4" /> Open Portal
              </Button>
            </a>
            <Link href={`/platform/tenants/${tenant.id}/edit`}>
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                <Edit2 className="mr-1.5 h-4 w-4" /> Edit
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border/60 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4" /> Portal Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl text-xl font-bold text-white"
              style={{ backgroundColor: tenant.primaryColor }}
            >
              {tenant.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex justify-between border-b border-border/40 py-2">
              <span className="text-muted-foreground">Status</span>
              <Badge variant="outline" className="capitalize">
                {tenant.status}
              </Badge>
            </div>
            <div className="flex justify-between border-b border-border/40 py-2">
              <span className="text-muted-foreground">Subscribers</span>
              <span className="font-semibold">{tenant.customers.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-border/40 py-2">
              <span className="text-muted-foreground">Created</span>
              <span>{tenant.createdAt}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Last Updated</span>
              <span>{tenant.updatedAt}</span>
            </div>
            {tenant.notes ? (
              <p className="mt-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">{tenant.notes}</p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-border/60 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Owner Contact</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-3 sm:grid-cols-2 text-sm">
              <div>
                <dt className="text-muted-foreground text-xs">Name</dt>
                <dd className="font-medium">{tenant.ownerName}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs">Email</dt>
                <dd className="font-mono text-xs">{tenant.ownerEmail}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs">Phone</dt>
                <dd className="font-mono">{tenant.ownerPhone}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs">Admin ID</dt>
                <dd className="font-mono text-xs">{tenant.ownerAdminId ?? '—'}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Ticket className="h-4 w-4" /> Support Tickets
          </CardTitle>
          <Link href="/platform/support-tickets">
            <Button variant="ghost" size="sm" className="text-xs">
              View all tickets
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <p className="text-sm text-muted-foreground">No support tickets for this tenant.</p>
          ) : (
            <div className="space-y-2">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between rounded-lg border border-border/40 p-3 text-sm"
                >
                  <div>
                    <div className="font-medium">{t.subject}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.category} · {t.createdAt}
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize text-xs">
                    {t.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
