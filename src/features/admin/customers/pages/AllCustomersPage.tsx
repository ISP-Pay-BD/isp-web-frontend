'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  FileSpreadsheet,
  Trash2,
  Edit,
  Eye,
  MoreHorizontal,
  Phone,
  Wifi,
  WifiOff,
  Users,
  AlertCircle,
  Wallet,
  Download,
  Copy,
  Receipt,
  MessageSquare,
  Link2,
  Bolt,
  UserCheck,
} from 'lucide-react';
import { useCustomers, useDeleteCustomer } from '../hooks/use-customers';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { StatCard } from '@/components/shared/StatCard';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Can } from '@/components/shared/Can';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Customer } from '../types';

export function AllCustomersPage() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useCustomers();
  const deleteMutation = useDeleteCustomer();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [connFilter, setConnFilter] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const rawList = data?.items ?? [];

  const onlineCount = useMemo(() => rawList.filter((c) => c.online).length, [rawList]);
  const expiredCount = useMemo(() => rawList.filter((c) => c.status === 'expired').length, [rawList]);
  const totalDueBdt = useMemo(
    () => rawList.filter((c) => c.balanceBdt > 0).reduce((acc, c) => acc + c.balanceBdt, 0),
    [rawList]
  );

  const filteredData = useMemo(() => {
    return rawList.filter((c) => {
      const matchesSearch =
        search === '' ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.username.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search) ||
        (c.ipAddress && c.ipAddress.includes(search));

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'online' && c.online) ||
        (statusFilter === 'offline' && !c.online) ||
        c.status === statusFilter;

      const matchesConn = connFilter === 'all' || c.connectionType === connFilter;

      return matchesSearch && matchesStatus && matchesConn;
    });
  }, [rawList, search, statusFilter, connFilter]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const handleCopySubscriptionLink = (customerId: string) => {
    const url = `${window.location.origin}/customer/subscription?ref=${customerId}`;
    navigator.clipboard.writeText(url);
    toast.success('Subscription link copied to clipboard');
  };

  const handleExportCsv = () => {
    const headers = ['Name', 'Username', 'Phone', 'Package', 'Area', 'Connection', 'Status', 'Expiry', 'Balance BDT'];
    const rows = filteredData.map((c) => [
      c.name,
      c.username,
      c.phone,
      c.packageName,
      c.areaName,
      c.connectionType,
      c.status,
      c.expiryDate,
      c.balanceBdt,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `isppaybd_customers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Customer directory exported to CSV');
  };

  if (isLoading) return <PageSkeleton variant="table" rows={8} />;
  if (isError) {
    return (
      <EmptyState
        title="Failed to load customers"
        description="Could not fetch subscriber directory from mock backend."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <PageHeader
        title="Customer Directory"
        subtitle="Manage broadband subscribers, PPPoE credentials, bandwidth tiers, and payment statuses"
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Customers' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="text-xs border-border/80 hover:bg-accent transition-all duration-150"
            >
              <Download className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> Export CSV
            </Button>
            <Can menu="customer" action="create">
              <Link href="/admin/customers/import">
                <Button variant="outline" size="sm" className="text-xs border-border/80 hover:bg-accent transition-all duration-150">
                  <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5 text-emerald-500" /> Import Excel
                </Button>
              </Link>
              <Link href="/admin/customers/new">
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-2xs transition-all duration-150">
                  <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Customer
                </Button>
              </Link>
            </Can>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Subscribers"
          value={rawList.length}
          description="Registered tenant customer records"
          trend={{ value: '+12 new this month', positive: true }}
          icon={Users}
        />
        <StatCard
          title="Online PPPoE Sessions"
          value={
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <span>{onlineCount}</span>
              <span className="text-xs font-normal text-muted-foreground">({Math.round((onlineCount / (rawList.length || 1)) * 100)}%)</span>
            </div>
          }
          description="Active MikroTik authenticated sessions"
          trend={{ value: 'Live Telemetry', positive: true }}
          icon={Wifi}
        />
        <StatCard
          title="Expired / Due"
          value={
            <div className="flex items-baseline gap-1 text-rose-600 dark:text-rose-400">
              <span>{expiredCount}</span>
              <span className="text-xs font-normal text-muted-foreground">accounts</span>
            </div>
          }
          description="Require recharge or renewal"
          trend={{ value: 'SMS reminders pending', positive: false }}
          icon={AlertCircle}
        />
        <StatCard
          title="Outstanding Due"
          value={<CurrencyDisplay amount={totalDueBdt} className="font-mono text-amber-600 dark:text-amber-400 font-bold" />}
          description="Total unpaid customer balances"
          trend={{ value: 'Collectible receivables', positive: false }}
          icon={Wallet}
        />
      </div>

      {/* Toolbar */}
      <Card className="border-border/70 shadow-2xs bg-card animate-in fade-in slide-in-from-bottom-2 duration-400 fill-mode-both" style={{ animationDelay: '200ms' }}>
        <CardContent className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by subscriber name, username, phone, or IP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-xs bg-background/50 rounded-lg transition-shadow duration-200 focus:shadow-[0_0_0_2px] focus:shadow-primary/20"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/40 border border-border/60">
              <Button
                type="button"
                size="sm"
                variant={statusFilter === 'all' ? 'default' : 'ghost'}
                onClick={() => setStatusFilter('all')}
                className="text-xs h-7 px-2.5 transition-all duration-150"
              >
                All ({rawList.length})
              </Button>
              <Button
                type="button"
                size="sm"
                variant={statusFilter === 'online' ? 'default' : 'ghost'}
                onClick={() => setStatusFilter('online')}
                className="text-xs h-7 px-2.5 transition-all duration-150"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
                Online ({onlineCount})
              </Button>
              <Button
                type="button"
                size="sm"
                variant={statusFilter === 'expired' ? 'default' : 'ghost'}
                onClick={() => setStatusFilter('expired')}
                className="text-xs h-7 px-2.5 transition-all duration-150"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mr-1" />
                Expired ({expiredCount})
              </Button>
            </div>

            <Select value={connFilter} onValueChange={(v) => v && setConnFilter(v)}>
              <SelectTrigger className="w-[125px] h-9 text-xs">
                <SelectValue placeholder="Protocol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Protocols</SelectItem>
                <SelectItem value="pppoe">PPPoE</SelectItem>
                <SelectItem value="static">Static IP</SelectItem>
                <SelectItem value="hotspot">Hotspot</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card className="border-border/70 shadow-2xs bg-card overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-400 fill-mode-both" style={{ animationDelay: '280ms' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Subscriber</th>
                <th className="py-3.5 px-4">Package & POP Area</th>
                <th className="py-3.5 px-4">Connection & IP</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Expiry Date</th>
                <th className="py-3.5 px-4">Balance Due</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-muted-foreground">
                    No matching subscribers found in current directory view.
                  </td>
                </tr>
              ) : (
                filteredData.map((c, index) => {
                  const isExpired = c.status === 'expired';
                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-muted/30 transition-colors group animate-in fade-in slide-in-from-bottom-1 duration-300 fill-mode-both"
                      style={{ animationDelay: `${320 + index * 30}ms` }}
                    >
                      {/* Subscriber */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="relative">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-xs border border-primary/20 transition-transform duration-200 group-hover:scale-110">
                              {c.name.slice(0, 2).toUpperCase()}
                            </div>
                            <span
                              className={cn(
                                'absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-background',
                                c.online ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                              )}
                              title={c.online ? 'Online' : 'Offline'}
                            />
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={() => router.push(`/admin/customers/${c.id}`)}
                              className="font-bold text-foreground hover:text-primary hover:underline transition-colors text-sm text-left"
                            >
                              {c.name}
                            </button>
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono mt-0.5">
                              <span>{c.username}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3 text-muted-foreground" /> {c.phone}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Package */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-foreground">{c.packageName}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">{c.areaName}</div>
                      </td>

                      {/* Connection */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <Badge variant="outline" className="text-[10px] font-mono uppercase px-1.5 py-0">
                            {c.connectionType}
                          </Badge>
                          {c.online ? (
                            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <Wifi className="h-3 w-3" /> Online
                            </span>
                          ) : (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <WifiOff className="h-3 w-3" /> Offline
                            </span>
                          )}
                        </div>
                        {c.ipAddress && (
                          <div className="font-mono text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                            <span>{c.ipAddress}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(c.ipAddress!, 'IP Address')}
                              className="hover:text-primary transition-colors"
                              title="Copy IP"
                            >
                              <Copy className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <StatusBadge status={c.status} />
                      </td>

                      {/* Expiry */}
                      <td className="py-3.5 px-4">
                        <div
                          className={cn(
                            'font-mono text-xs font-semibold',
                            isExpired ? 'text-destructive flex items-center gap-1' : 'text-foreground'
                          )}
                        >
                          {isExpired && <AlertCircle className="h-3 w-3 text-destructive shrink-0" />}
                          <span>{c.expiryDate}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {isExpired ? 'Account Expired' : 'Active Cycle'}
                        </div>
                      </td>

                      {/* Balance */}
                      <td className="py-3.5 px-4">
                        <div
                          className={cn(
                            'font-mono font-bold text-xs',
                            c.balanceBdt > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'
                          )}
                        >
                          <CurrencyDisplay amount={c.balanceBdt} />
                        </div>
                        {c.balanceBdt > 0 && (
                          <span className="text-[10px] text-rose-500 font-semibold">Payment Due</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            type="button"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/80 hover:bg-muted/60 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52 p-1">
                            <div className="px-2 py-1.5 text-[11px] font-medium text-muted-foreground">Subscriber Actions</div>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="gap-2 cursor-pointer"
                              onClick={() => router.push(`/admin/customers/${c.id}`)}
                            >
                              <Eye className="h-3.5 w-3.5 text-primary" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2 cursor-pointer"
                              onClick={() => handleCopySubscriptionLink(c.id)}
                            >
                              <Link2 className="h-3.5 w-3.5 text-violet-500" /> Copy Subscription Link
                            </DropdownMenuItem>
                            <Can menu="customer" action="update">
                              <DropdownMenuItem
                                className="gap-2 cursor-pointer"
                                onClick={() => router.push(`/admin/customers/${c.id}/edit`)}
                              >
                                <Edit className="h-3.5 w-3.5" /> Edit Profile
                              </DropdownMenuItem>
                            </Can>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="gap-2 cursor-pointer"
                              onClick={() => router.push(`/admin/customer-payments/new?customerId=${c.id}`)}
                            >
                              <Receipt className="h-3.5 w-3.5 text-emerald-500" /> Collect Payment
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="gap-2 cursor-pointer"
                              onClick={() => toast.success(`SMS reminder sent to ${c.phone}`)}
                            >
                              <MessageSquare className="h-3.5 w-3.5 text-amber-500" /> Send SMS Alert
                            </DropdownMenuItem>
                            <Can menu="customer" action="delete">
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  variant="destructive"
                                  className="gap-2 cursor-pointer"
                                  onClick={() => setDeleteId(c.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" /> Delete Account
                                </DropdownMenuItem>
                              </>
                            </Can>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Customer Account"
        description="Are you sure you want to remove this subscriber? This will terminate their active MikroTik PPPoE secret and revoke billing access."
        confirmLabel="Confirm Delete"
        destructive
        onConfirm={async () => {
          if (deleteId) {
            await deleteMutation.mutateAsync(deleteId);
            setDeleteId(null);
          }
        }}
      />
    </div>
  );
}
