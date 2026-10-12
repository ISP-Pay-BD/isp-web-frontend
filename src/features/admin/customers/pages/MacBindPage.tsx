'use client';

import Link from 'next/link';
import { useCustomer, useCustomerActions, useMacStatus } from '@/features/admin/customers/hooks/use-customers';
import { PageHeader } from '@/features/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { errorMessage } from '@/lib/api/utils/error-handler';

/**
 * Router MAC binding (web customers/mac_ajax): binding locks the PPPoE secret
 * to the caller MAC the router currently sees for this customer.
 */
export function MacBindPage({ customerId }: { customerId: string }) {
  const customerQuery = useCustomer(customerId, { compact: true });
  const statusQuery = useMacStatus(customerId);
  const { macBind, macUnbind } = useCustomerActions();

  if (customerQuery.isLoading || statusQuery.isLoading) return <PageSkeleton variant="form" />;
  const customer = customerQuery.data;
  if (customerQuery.isError || statusQuery.isError || !customer) {
    return (
      <EmptyState
        title="Could not load MAC binding"
        description={errorMessage(customerQuery.error ?? statusQuery.error)}
        actionLabel="Retry"
        onAction={() => {
          customerQuery.refetch();
          statusQuery.refetch();
        }}
      />
    );
  }

  const binding = statusQuery.data ?? { isBound: false, mac: '' };
  const busy = macBind.isPending || macUnbind.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title="MAC Bind / Unbind"
        subtitle={`${customer.name}${customer.username ? ` · ${customer.username}` : ''}`}
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
            <Badge variant={binding.isBound ? 'default' : 'secondary'}>{binding.isBound ? 'Bound' : 'Not bound'}</Badge>
          </CardTitle>
          <CardDescription>
            Binding locks this customer&apos;s PPPoE secret on the router to the device MAC it is currently connected from.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-sm">
            <span className="text-muted-foreground text-xs block">Bound MAC address</span>
            <span className="font-mono font-semibold">{binding.mac || '—'}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button disabled={busy || binding.isBound} onClick={() => macBind.mutate(customerId)}>
              {macBind.isPending ? 'Binding…' : 'Bind current MAC'}
            </Button>
            <Button variant="outline" disabled={busy || !binding.isBound} onClick={() => macUnbind.mutate(customerId)}>
              {macUnbind.isPending ? 'Unbinding…' : 'Unbind'}
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
