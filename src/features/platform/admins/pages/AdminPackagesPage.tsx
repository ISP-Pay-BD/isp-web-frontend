'use client';

import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import { PlatformPageHeader } from '@/features/platform/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatBdt } from '@/lib/format';
import { Package, Check } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function AdminPackagesPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['platform', 'admins', 'packages'],
    queryFn: () => mockFetch('platform.admins.packages'),
  });

  if (isLoading) return <PageSkeleton rows={4} />;
  if (error || !data) {
    return (
      <EmptyState
        title="Failed to load packages"
        description="Could not retrieve admin package tiers."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PlatformPageHeader
        title="Admin Packages"
        subtitle="Subscription tiers for ISP tenant portals — pricing and feature limits"
        breadcrumb={[
          { label: 'Platform', href: '/platform/dashboard' },
          { label: 'Admins', href: '/platform/admins' },
          { label: 'Packages' },
        ]}
        actions={
          <Link href="/platform/admins">
            <Button variant="outline" size="sm">
              Back to Admins
            </Button>
          </Link>
        }
      />

      <Card className="border-border/60 bg-primary/5">
        <CardContent className="p-4 text-sm">
          <span className="font-semibold">Yearly discount:</span> Pay for {12 - data.yearlyDiscountMonths} months, get{' '}
          {data.yearlyDiscountMonths} months free ({data.yearlyDiscountPercent}% savings)
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.items.map((pkg) => (
          <Card key={pkg.id} className="border-border/60 flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="h-4 w-4 text-primary" />
                  {pkg.name}
                </CardTitle>
                <Badge variant={pkg.isActive ? 'default' : 'secondary'} className="text-xs">
                  {pkg.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="text-2xl font-bold text-primary">
                ৳{formatBdt(pkg.priceBdt)}
                <span className="text-sm font-normal text-muted-foreground">/{pkg.durationDays}d</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-3">
              <div className="text-xs text-muted-foreground">
                Max {pkg.maxCustomers.toLocaleString()} subscribers · {pkg.packageType}
              </div>
              <div className="text-xs font-medium">{pkg.tenantCount} tenants on this tier</div>
              <ul className="space-y-1.5 text-xs">
                {pkg.features.map((f) => (
                  <li key={f} className="flex items-start gap-1.5">
                    <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
