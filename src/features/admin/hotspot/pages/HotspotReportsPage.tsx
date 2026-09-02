'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/features/admin/shared';
import { useHotspotData } from '../hooks/useHotspotData';
import { StatCard } from '@/components/shared/StatCard';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatBdtWithSymbol } from '@/lib/format';
import { BarChart3 } from 'lucide-react';

export function HotspotReportsPage() {
  const { data, isLoading } = useHotspotData();
  const [search, setSearch] = useState('');

  if (isLoading) return <PageSkeleton rows={5} />;

  const reports = data?.reports ?? [];
  const filtered = reports.filter(
    (r) =>
      r.username.toLowerCase().includes(search.toLowerCase()) ||
      r.soldBy.toLowerCase().includes(search.toLowerCase()) ||
      r.routerName.toLowerCase().includes(search.toLowerCase()),
  );

  const totalRevenue = reports.reduce((s, r) => s + r.priceBdt, 0);
  const cashSales = reports.filter((r) => r.paymentMethod === 'Cash').length;
  const mobileSales = reports.filter((r) => r.paymentMethod !== 'Cash').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hotspot Sales Report"
        subtitle="Voucher sales by date, router, and payment method"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Hotspot', url: '/admin/hotspot' },
          { label: 'Reports' },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total sales" value={formatBdtWithSymbol(totalRevenue)} icon={BarChart3} />
        <StatCard title="Cash transactions" value={String(cashSales)} />
        <StatCard title="Mobile wallet" value={String(mobileSales)} />
      </div>

      <Input
        placeholder="Filter by user, cashier, or router…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-md"
      />

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Profile</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Sold by</TableHead>
              <TableHead>Router</TableHead>
              <TableHead>Payment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.date}</TableCell>
                <TableCell className="font-medium">{row.username}</TableCell>
                <TableCell>{row.profileName}</TableCell>
                <TableCell>{formatBdtWithSymbol(row.priceBdt)}</TableCell>
                <TableCell>{row.soldBy}</TableCell>
                <TableCell>{row.routerName}</TableCell>
                <TableCell>
                  <Badge variant="outline">{row.paymentMethod}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Link href="/admin/hotspot" className="text-primary text-sm hover:underline">
        ← Back to hotspot hub
      </Link>
    </div>
  );
}
