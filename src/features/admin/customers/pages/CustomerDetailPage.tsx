'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Edit,
  Zap,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Wifi,
  WifiOff,
  Receipt,
  Server,
  Activity,
  CreditCard,
} from 'lucide-react';
import { useCustomer } from '../hooks/use-customers';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { Can } from '@/components/shared/Can';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function CustomerDetailPage({ id }: { id: string }) {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useCustomer(id);

  if (isLoading) return <PageSkeleton rows={7} />;
  if (isError || !data?.customer) {
    return (
      <EmptyState
        title="Customer not found"
        description="Could not locate customer with the requested ID."
        actionLabel="Back to Customers"
        onAction={() => router.push('/admin/customers')}
      />
    );
  }

  const { customer, payments } = data;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/customers">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{customer.name}</h1>
              <StatusBadge status={customer.status} />
              {customer.online ? (
                <span className="flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <Wifi className="h-3 w-3" /> Online
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded bg-slate-500/10 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  <WifiOff className="h-3 w-3" /> Offline
                </span>
              )}
            </div>
            <p className="text-muted-foreground text-sm font-mono">
              Username: {customer.username} • ID: {customer.id}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/admin/customer-payments/new?customerId=${customer.id}`}>
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              <Zap className="mr-1.5 h-4 w-4" /> Recharge Line
            </Button>
          </Link>
          <Can menu="customer" action="update">
            <Link href={`/admin/customers/${customer.id}/edit`}>
              <Button size="sm" variant="outline">
                <Edit className="mr-1.5 h-4 w-4" /> Edit Profile
              </Button>
            </Link>
          </Can>
        </div>
      </div>

      {/* Customer Quick Summary Cards (mirroring details.php hero bar) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Active Package</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{customer.packageName}</div>
            <p className="text-xs text-muted-foreground mt-0.5">{customer.connectionType.toUpperCase()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Cycle Expiry</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-xl font-bold font-mono ${customer.status === 'expired' ? 'text-destructive' : ''}`}>
              {customer.expiryDate}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">30-day renewal cycle</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Current Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              <CurrencyDisplay amount={customer.balanceBdt} />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Outstanding due balance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Coverage Area</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{customer.areaName}</div>
            <p className="text-xs text-muted-foreground mt-0.5">POP / Zone allocation</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Layout */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview & Info</TabsTrigger>
          <TabsTrigger value="network">Network & NAS</TabsTrigger>
          <TabsTrigger value="payments">Payments ({payments.length})</TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Subscriber Information</CardTitle>
                <CardDescription>Primary account & contact record</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" /> Mobile Phone
                  </span>
                  <span className="font-mono font-medium">{customer.phone}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" /> Email
                  </span>
                  <span>{customer.email || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> Service Area
                  </span>
                  <span className="font-medium">{customer.areaName}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> Joining Date
                  </span>
                  <span className="font-mono">{customer.createdAt}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Subscription Plan</CardTitle>
                <CardDescription>Plan validity and quota specifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Plan Name</span>
                  <span className="font-semibold">{customer.packageName}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Account Status</span>
                  <StatusBadge status={customer.status} />
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Next Expiry</span>
                  <span className="font-mono font-medium">{customer.expiryDate}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Auto-Disconnect</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">Enabled</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 2: Network & NAS */}
        <TabsContent value="network" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Server className="h-4 w-4 text-primary" /> PPPoE / Router Parameters
              </CardTitle>
              <CardDescription>MikroTik NAS authentication parameters</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 text-sm">
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">PPPoE User</div>
                <div className="font-mono font-semibold text-base mt-1">{customer.username}</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">Framed IP Address</div>
                <div className="font-mono font-semibold text-base mt-1">{customer.ipAddress || 'Dynamic Pool'}</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">Caller MAC Address</div>
                <div className="font-mono font-semibold text-base mt-1">{customer.macAddress || 'Not Locked'}</div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-muted-foreground">Session Status</div>
                <div className="font-semibold text-base mt-1">
                  {customer.online ? (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Activity className="h-4 w-4" /> Active Connection
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Offline</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Payments */}
        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Payment History</CardTitle>
                <CardDescription>All invoices and renewal collections for this customer</CardDescription>
              </div>
              <Link href={`/admin/customer-payments/new?customerId=${customer.id}`}>
                <Button size="sm">
                  <CreditCard className="mr-1.5 h-4 w-4" /> Record Payment
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <EmptyState title="No payment records" description="No previous receipts recorded yet." />
              ) : (
                <div className="divide-y text-sm">
                  {payments.map((p) => (
                    <div key={p.id} className="flex items-center justify-between py-3">
                      <div>
                        <div className="font-medium font-mono">{p.invoiceNo}</div>
                        <div className="text-xs text-muted-foreground">
                          {p.paidAt.slice(0, 10)} • Method: <span className="uppercase font-mono">{p.method}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">
                          <CurrencyDisplay amount={p.amountBdt} />
                        </div>
                        <StatusBadge status={p.status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
