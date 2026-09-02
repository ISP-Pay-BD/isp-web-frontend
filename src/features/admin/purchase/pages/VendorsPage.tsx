'use client';

import { useState, useMemo } from 'react';
import { usePurchase } from '../hooks/use-purchase';
import { PageSkeleton, EmptyState, StatCard, CurrencyDisplay, StatusBadge } from '@/components/shared';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building2, Search, Phone } from 'lucide-react';

export function VendorsPage() {
  const { vendors, isLoading, isError, refetch } = usePurchase();
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () =>
      vendors.filter(
        (v) =>
          v.name.toLowerCase().includes(search.toLowerCase()) ||
          v.contactPerson.toLowerCase().includes(search.toLowerCase()),
      ),
    [vendors, search],
  );

  if (isLoading) return <PageSkeleton rows={8} />;
  if (isError) {
    return <EmptyState title="Failed to load vendors" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Purchase Vendors</h1>
        <p className="text-muted-foreground text-sm">Bandwidth providers, equipment distributors, and supplier payables.</p>
      </div>
      <StatCard title="Active Vendors" value={vendors.filter((v) => v.status === 'active').length} icon={Building2} />
      <div className="relative max-w-md">
        <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
        <Input placeholder="Search vendor..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
      </div>
      <div className="bg-card rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Balance Due</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((v) => (
              <TableRow key={v.id}>
                <TableCell>
                  <div className="font-medium">{v.name}</div>
                  <div className="text-muted-foreground text-xs">{v.address}</div>
                </TableCell>
                <TableCell>{v.contactPerson}</TableCell>
                <TableCell className="font-mono text-xs"><Phone className="mr-1 inline h-3 w-3" />{v.phone}</TableCell>
                <TableCell><CurrencyDisplay amount={v.balanceBdt} /></TableCell>
                <TableCell><StatusBadge status={v.status === 'active' ? 'active' : 'inactive'} label={v.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
