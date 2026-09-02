'use client';

'use client';

import { useState, useMemo } from 'react';
import { useBtrcReport } from '../hooks/use-btrc-report';
import { PageSkeleton, EmptyState, StatCard, CurrencyDisplay, StatusBadge } from '@/components/shared';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileBarChart, Users, Wifi, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function BtrcReportPage() {
  const { summary, subscribers, isLoading, isError, refetch } = useBtrcReport();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return subscribers.filter(
      (s) =>
        s.clientName.toLowerCase().includes(search.toLowerCase()) ||
        s.mobile.includes(search) ||
        s.area.toLowerCase().includes(search.toLowerCase()),
    );
  }, [subscribers, search]);

  if (isLoading) return <PageSkeleton rows={10} />;

  if (isError || !summary) {
    return (
      <EmptyState
        title="Failed to load BTRC report"
        description="Could not load regulatory subscriber data."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">BTRC Subscriber Report</h1>
          <p className="text-muted-foreground text-sm">Export-ready subscriber demographics for Bangladesh Telecommunication Regulatory Commission filing.</p>
        </div>
        <Button variant="outline" onClick={() => toast.success('CSV export will be available in Phase 8')}>
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Subscribers" value={summary.totalSubscribers} description="Active + inactive" icon={Users} />
        <StatCard title="Total Bandwidth" value={`${summary.totalBandwidthGbps} Gbps`} description="Provisioned capacity" icon={Wifi} />
        <StatCard title="Monthly Revenue" value={<CurrencyDisplay amount={summary.totalRevenueBdt} />} description="Gross billing" icon={FileBarChart} />
        <StatCard title="Home / Corporate" value={`${summary.homeSubscribers} / ${summary.corporateSubscribers}`} description="Client type split" icon={Users} />
      </div>

      <div className="relative max-w-md">
        <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
        <Input placeholder="Search name, mobile, area..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No subscribers match" description="Adjust your search filters." />
      ) : (
        <div className="bg-card overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SL</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Package</TableHead>
                <TableHead>Bandwidth</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Area</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((sub) => (
                <TableRow key={sub.sl}>
                  <TableCell>{sub.sl}</TableCell>
                  <TableCell className="font-medium">{sub.clientName}</TableCell>
                  <TableCell className="font-mono text-xs">{sub.mobile}</TableCell>
                  <TableCell className="text-sm">{sub.packageName}</TableCell>
                  <TableCell>{sub.bandwidthMbps} Mbps</TableCell>
                  <TableCell><CurrencyDisplay amount={sub.priceBdt} /></TableCell>
                  <TableCell className="text-sm">{sub.area}</TableCell>
                  <TableCell>{sub.clientType}</TableCell>
                  <TableCell>
                    <StatusBadge status={sub.status === 'active' ? 'active' : 'expired'} label={sub.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
