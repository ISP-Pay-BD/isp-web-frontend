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
import { useTranslations } from '@/i18n/locale-context';

/**
 * Router MAC binding (web customers/mac_ajax): binding locks the PPPoE secret
 * to the caller MAC the router currently sees for this customer.
 */
export function MacBindPage({ customerId }: { customerId: string }) {
  const t = useTranslations();
  const customerQuery = useCustomer(customerId, { compact: true });
  const statusQuery = useMacStatus(customerId);
  const { macBind, macUnbind } = useCustomerActions();

  if (customerQuery.isLoading || statusQuery.isLoading) return <PageSkeleton variant="form" />;
  const customer = customerQuery.data;
  if (customerQuery.isError || statusQuery.isError || !customer) {
    return (
      <EmptyState variant="error"
        title={t('admin.customers.mac.loadFailed', 'Could not load MAC binding')}
        description={errorMessage(customerQuery.error ?? statusQuery.error)}
        actionLabel={t('admin.customers.mac.retry', 'Retry')}
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
        title={t('admin.customers.mac.title', 'MAC Bind / Unbind')}
        subtitle={`${customer.name}${customer.username ? ` · ${customer.username}` : ''}`}
        breadcrumb={[
          { label: t('admin.customers.mac.breadcrumbCustomers', 'Customers'), url: '/admin/customers' },
          { label: customer.name, url: `/admin/customers/${customerId}` },
          { label: t('admin.customers.mac.breadcrumb', 'MAC Bind') },
        ]}
      />

      <Card className="border-border/60 max-w-lg">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            {t('admin.customers.mac.deviceMac', 'Device MAC')}
            <Badge variant={binding.isBound ? 'default' : 'secondary'}>
              {binding.isBound ? t('admin.customers.mac.bound', 'Bound') : t('admin.customers.mac.notBound', 'Not bound')}
            </Badge>
          </CardTitle>
          <CardDescription>
            {t('admin.customers.mac.hint', "Binding locks this customer's PPPoE secret on the router to the device MAC it is currently connected from.")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-sm">
            <span className="text-muted-foreground text-xs block">{t('admin.customers.mac.boundAddress', 'Bound MAC address')}</span>
            <span className="font-mono font-semibold">{binding.mac || '—'}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button disabled={busy || binding.isBound} onClick={() => macBind.mutate(customerId)}>
              {macBind.isPending ? t('admin.customers.mac.binding', 'Binding…') : t('admin.customers.mac.bind', 'Bind current MAC')}
            </Button>
            <Button variant="outline" disabled={busy || !binding.isBound} onClick={() => macUnbind.mutate(customerId)}>
              {macUnbind.isPending ? t('admin.customers.mac.unbinding', 'Unbinding…') : t('admin.customers.mac.unbind', 'Unbind')}
            </Button>
            <Link href={`/admin/customers/${customerId}`} className={buttonVariants({ variant: 'ghost' })}>
              {t('admin.customers.mac.backToCustomer', 'Back to customer')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
