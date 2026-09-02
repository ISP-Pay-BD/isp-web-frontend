'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Smartphone,
  Laptop,
  Tv,
  ArrowLeft,
  Search,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CustomerPageShell, CustomerLoadingSkeleton, CustomerErrorState, CustomerEmptyState } from '@/features/customer/shared';
import { useCustomerRouter } from '../hooks/use-customer-router';
import { formatDate } from '@/lib/format';
import { toast } from 'sonner';

export function CustomerDevicesPage() {
  const { data, isLoading, isError, refetch } = useCustomerRouter();
  const [search, setSearch] = useState('');
  const [blockedDevices, setBlockedDevices] = useState<string[]>([]);

  if (isLoading) {
    return (
      <CustomerPageShell title="Connected Devices" subtitle="Scanning local network ARP table...">
        <CustomerLoadingSkeleton />
      </CustomerPageShell>
    );
  }

  if (isError || !data) {
    return (
      <CustomerPageShell title="Connected Devices" subtitle="Active DHCP Clients">
        <CustomerErrorState onRetry={() => refetch()} />
      </CustomerPageShell>
    );
  }

  const { connectedDevices } = data;

  const filtered = connectedDevices.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.ip.toLowerCase().includes(search.toLowerCase()) ||
      d.mac.toLowerCase().includes(search.toLowerCase()),
  );

  const toggleBlock = (id: string, name: string) => {
    if (blockedDevices.includes(id)) {
      setBlockedDevices((prev) => prev.filter((d) => d !== id));
      toast.success(`${name} unblocked. Access restored.`);
    } else {
      setBlockedDevices((prev) => [...prev, id]);
      toast.error(`${name} blocked from accessing broadband.`);
    }
  };

  const getDeviceIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('laptop') || lower.includes('pc') || lower.includes('dell')) {
      return <Laptop className="h-4 w-4" />;
    }
    if (lower.includes('tv') || lower.includes('smart')) {
      return <Tv className="h-4 w-4" />;
    }
    return <Smartphone className="h-4 w-4" />;
  };

  return (
    <CustomerPageShell
      title="Connected Devices"
      subtitle="Inspect all active smartphones, laptops, smart TVs, and IoT hardware assigned an IP address by your router."
      breadcrumbs={[
        { label: 'Customer', href: '/customer/dashboard' },
        { label: 'Router', href: '/customer/router' },
        { label: 'Connected Devices' },
      ]}
      actions={
        <div className="flex gap-2">
          <Link href="/customer/router">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Router
            </Button>
          </Link>
          <Button size="sm" variant="outline" onClick={() => refetch()} className="gap-2 text-xs">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh List
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Search */}
        <div className="flex items-center gap-3 p-4 rounded-xl border bg-card max-w-md">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search device name, IP address, MAC..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 p-0 focus-visible:ring-0 shadow-none text-xs"
          />
        </div>

        {/* Devices Table / Cards */}
        {filtered.length === 0 ? (
          <CustomerEmptyState
            icon={<Smartphone className="h-10 w-10 text-muted-foreground/60" />}
            title="No devices found"
            description="No active clients matching your search criteria."
          />
        ) : (
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b font-semibold">
                  <tr>
                    <th className="px-4 py-3">Device Name</th>
                    <th className="px-4 py-3">IP Address</th>
                    <th className="px-4 py-3">Physical MAC</th>
                    <th className="px-4 py-3">Connected Since</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Access Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((dev) => {
                    const isBlocked = blockedDevices.includes(dev.id);
                    return (
                      <tr key={dev.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="rounded-lg bg-primary/10 p-2 text-primary">
                              {getDeviceIcon(dev.name)}
                            </div>
                            <span className="font-bold text-foreground">{dev.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-xs">{dev.ip}</td>
                        <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground">
                          {dev.mac}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-muted-foreground">
                          {formatDate(dev.connectedAt)}
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge
                            variant={isBlocked ? 'destructive' : 'default'}
                            className="text-[11px]"
                          >
                            {isBlocked ? 'Blocked' : 'Online'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <Button
                            size="sm"
                            variant={isBlocked ? 'outline' : 'destructive'}
                            onClick={() => toggleBlock(dev.id, dev.name)}
                            className="h-8 text-xs font-semibold"
                          >
                            {isBlocked ? 'Restore Access' : 'Block Device'}
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </CustomerPageShell>
  );
}
