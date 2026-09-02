'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/features/admin/shared';
import { useHotspotData } from '../hooks/useHotspotData';
import type { HotspotProfileItem } from '@/data/admin/network-ops.data';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatBdtWithSymbol } from '@/lib/format';
import { Plus, Package } from 'lucide-react';
import { toast } from 'sonner';

export function HotspotPackagesPage() {
  const { data, isLoading } = useHotspotData();
  const [search, setSearch] = useState('');
  const [profiles, setProfiles] = useState<HotspotProfileItem[]>([]);

  const initial = data?.profiles ?? [];
  if (profiles.length === 0 && initial.length > 0) {
    setProfiles(initial);
  }

  const list = profiles.length > 0 ? profiles : initial;
  const filtered = list.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.rateLimit.includes(search),
  );

  const handleToggle = (id: string) => {
    setProfiles((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' }
          : p,
      ),
    );
    toast.success('Profile status updated.');
  };

  if (isLoading && list.length === 0) return <PageSkeleton rows={5} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hotspot Packages"
        subtitle="User profiles, rate limits, validity, and selling price"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Hotspot', url: '/admin/hotspot' },
          { label: 'Packages' },
        ]}
        actions={
          <Button size="sm" onClick={() => toast.info('Create profile modal — mock phase')}>
            <Plus className="mr-2 h-4 w-4" />
            Add profile
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total profiles" value={String(list.length)} icon={Package} />
        <StatCard title="Active profiles" value={String(list.filter((p) => p.status === 'active').length)} />
        <StatCard title="Active users" value={String(list.reduce((s, p) => s + p.activeUsers, 0))} />
      </div>

      <Input
        placeholder="Search profiles…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />

      {filtered.length === 0 ? (
        <EmptyState title="No profiles found" description="Try a different search term." />
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Profile</TableHead>
                <TableHead>Speed</TableHead>
                <TableHead>Validity</TableHead>
                <TableHead>Cost / Sell</TableHead>
                <TableHead>Pool</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell className="font-medium">{profile.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{profile.rateLimit}</Badge>
                  </TableCell>
                  <TableCell>{profile.validityFormatted}</TableCell>
                  <TableCell>
                    {formatBdtWithSymbol(profile.priceBdt)} / {formatBdtWithSymbol(profile.sellingPriceBdt)}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{profile.addressPool}</TableCell>
                  <TableCell>{profile.activeUsers}</TableCell>
                  <TableCell>
                    <StatusBadge status={profile.status === 'active' ? 'online' : 'offline'} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleToggle(profile.id)}>
                      Toggle
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Button variant="link" className="px-0" render={<Link href="/admin/hotspot" />}>
        ← Back to hotspot hub
      </Button>
    </div>
  );
}
