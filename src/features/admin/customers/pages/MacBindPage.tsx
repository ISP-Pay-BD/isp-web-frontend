'use client';

import { useState } from 'react';
import { useCustomer } from '@/features/admin/customers/hooks/use-customers';
import { PageHeader } from '@/features/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { toast } from 'sonner';
import Link from 'next/link';

export function MacBindPage({ customerId }: { customerId: string }) {
  const { data, isLoading, isError, refetch } = useCustomer(customerId);
  const customer = data?.customer;
  const [mac, setMac] = useState('');

  if (isLoading) return <PageSkeleton variant="form" />;
  if (isError || !customer) {
    return <EmptyState title="Customer not found" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const currentMac = mac || customer.macAddress || '';

  return (
    <div className="space-y-6">
      <PageHeader
        title="MAC Bind / Unbind"
        subtitle={`${customer.name} · ${customer.username}`}
        breadcrumb={[
          { label: 'Customers', url: '/admin/customers' },
          { label: customer.name, url: `/admin/customers/${customerId}` },
          { label: 'MAC Bind' },
        ]}
      />

      <Card className="border-border/60 max-w-lg">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            Device MAC
            <Badge variant={customer.macAddress ? 'default' : 'secondary'}>
              {customer.macAddress ? 'Bound' : 'Unbound'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mac">MAC address</Label>
            <Input
              id="mac"
              className="font-mono"
              placeholder="AA:BB:CC:DD:EE:FF"
              value={currentMac}
              onChange={(e) => setMac(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => toast.success('MAC bound on router (mock)')}
            >
              Bind MAC
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setMac('');
                toast.success('MAC unbound (mock)');
              }}
            >
              Unbind
            </Button>
            <Link href={`/admin/customers/${customerId}`} className={buttonVariants({ variant: 'ghost' })}>
              Back to customer
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
