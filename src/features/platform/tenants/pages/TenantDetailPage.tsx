'use client';

import { useQuery } from '@tanstack/react-query';
import { platformService } from '@/lib/api/services/platform.service';
import { PlatformPageHeader, platformDate, platformDateTime } from '@/features/platform/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatBdt, formatCount } from '@/lib/format';
import { ExternalLink, Edit2, Globe, Ticket, HeartPulse, Wallet } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from '@/i18n/locale-context';

interface TenantDetailPageProps {
  tenantId: string;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 border-b border-border/40 py-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{children}</span>
    </div>
  );
}

export function TenantDetailPage({ tenantId }: TenantDetailPageProps) {
  const t = useTranslations();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['platform', 'tenants', tenantId],
    queryFn: () => platformService.getTenantById(tenantId),
  });

  if (isLoading) return <PageSkeleton variant="detail" rows={5} />;
  if (error || !data) {
    return (
      <EmptyState
        title={t('platform.tenants.detail.notFound', 'Tenant not found')}
        description={error instanceof Error ? error.message : t('platform.tenants.detail.notFoundHint', 'Could not load tenant portal details.')}
        actionLabel={t('admin.customers.list.retry', 'Retry')}
        onAction={() => refetch()}
      />
    );
  }

  const { tenant, tickets } = data;

  return (
    <div className="space-y-6">
      <PlatformPageHeader
        title={tenant.name}
        subtitle={`${tenant.domain}${tenant.plan ? ` — ${tenant.plan}` : ''}`}
        breadcrumb={[
          { label: t('common.crumb.platform', 'Platform'), href: '/platform/dashboard' },
          { label: t('common.crumb.tenants', 'Tenants'), href: '/platform/tenants' },
          { label: tenant.name },
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <a href={tenant.portalUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">
                <ExternalLink className="mr-1.5 h-4 w-4" /> {t('platform.tenants.detail.openPortal', 'Open Portal')}
              </Button>
            </a>
            <Button variant="outline" size="sm" render={<Link href={`/platform/tenants/${tenant.id}/health`} />}>
                <HeartPulse className="mr-1.5 h-4 w-4" /> {t('platform.tenants.detail.health', 'Health')}
              </Button>
            {tenant.ownerUserId ? (
              <Button variant="outline" size="sm" render={<Link href={`/platform/admins/${tenant.ownerUserId}/billing`} />}>
                  <Wallet className="mr-1.5 h-4 w-4" /> {t('platform.tenants.detail.billing', 'Billing')}
                </Button>
            ) : null}
            <Button size="sm" className="bg-primary hover:bg-primary/90" render={<Link href={`/platform/tenants/${tenant.id}/edit`} />}>
                <Edit2 className="mr-1.5 h-4 w-4" /> {t('platform.tenants.detail.edit', 'Edit')}
              </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border/60 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4" /> {t('platform.tenants.detail.overview', 'Portal Overview')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {tenant.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={tenant.logoUrl} alt={t('platform.tenants.detail.logoAlt', '{name} logo', { name: tenant.name })} className="mx-auto mb-4 h-16 w-16 rounded-xl object-contain" />
            ) : (
              <div
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-primary text-xl font-bold text-primary-foreground"
                style={tenant.primaryColor ? { backgroundColor: tenant.primaryColor } : undefined}
              >
                {tenant.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <Row label={t('admin.customers.list.statusLabel', 'Status')}>
              <Badge variant="outline" className="capitalize">
                {t(`status.${tenant.status}`, tenant.status)}
              </Badge>
            </Row>
            <Row label={t('platform.tenants.detail.subscribers', 'Subscribers')}>
              <span className="font-semibold tabular-nums">{formatCount(tenant.customers)}</span>
            </Row>
            <Row label={t('platform.tenants.detail.resellers', 'Resellers')}>{formatCount(tenant.resellers)}</Row>
            <Row label={t('platform.tenants.detail.employees', 'Employees')}>{formatCount(tenant.employees)}</Row>
            <Row label={t('platform.tenants.detail.paidThisMonth', 'Paid this month')}>৳{formatBdt(tenant.monthRevenue)}</Row>
            <Row label={t('platform.tenants.detail.created', 'Created')}>{platformDate(tenant.createdAt)}</Row>
            <Row label={t('platform.tenants.detail.updated', 'Last Updated')}>{platformDate(tenant.updatedAt)}</Row>
            {tenant.notes ? (
              <p className="mt-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">{tenant.notes}</p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-border/60 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">{t('platform.tenants.detail.ownerContact', 'Owner Contact')}</CardTitle>
          </CardHeader>
          <CardContent>
            {tenant.ownerUserId ? (
              <dl className="grid gap-3 sm:grid-cols-2 text-sm">
                <div>
                  <dt className="text-muted-foreground text-xs">{t('platform.tenants.detail.ownerName', 'Name')}</dt>
                  <dd className="font-medium">{tenant.ownerName ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">{t('platform.tenants.detail.organization', 'Organization')}</dt>
                  <dd className="font-medium">{tenant.organizationName ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">{t('platform.tenants.detail.email', 'Email')}</dt>
                  <dd className="font-mono text-xs">{tenant.ownerEmail ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">{t('platform.tenants.detail.phone', 'Phone')}</dt>
                  <dd className="font-mono">{tenant.ownerPhone ?? '—'}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">{t('platform.tenants.detail.adminId', 'Admin ID')}</dt>
                  <dd className="font-mono text-xs">{tenant.ownerUserId}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground text-xs">{t('platform.tenants.detail.platformSubscription', 'Platform subscription')}</dt>
                  <dd className="capitalize">
                    {tenant.ownerSubscriptionStatus ? t(`status.${tenant.ownerSubscriptionStatus}`, tenant.ownerSubscriptionStatus) : '—'}
                    {tenant.ownerWillExpire ? (
                      <span className="ml-1 text-xs text-muted-foreground">
                        {t('platform.tenants.detail.until', 'until {date}', { date: platformDate(tenant.ownerWillExpire) })}
                      </span>
                    ) : null}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-muted-foreground">{t('platform.tenants.detail.noOwner', 'No owner account is linked to this portal.')}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Ticket className="h-4 w-4" /> {t('platform.tenants.detail.ticketsTitle', 'Support Tickets raised by the owner')}
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-xs" render={<Link href="/platform/support-tickets" />}>
              {t('platform.tenants.detail.viewAllTickets', 'View all tickets')}
            </Button>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('platform.tenants.detail.noTickets', 'No support tickets for this tenant.')}</p>
          ) : (
            <div className="space-y-2">
              {tickets.map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/platform/support-tickets?ticket=${ticket.id}`}
                  className="flex items-center justify-between rounded-lg border border-border/40 p-3 text-sm hover:bg-muted/30"
                >
                  <div>
                    <div className="font-medium">{ticket.subject}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {t(`admin.support.category.${ticket.category}`, ticket.category)} · {t(`admin.support.priority.${ticket.priority}`, ticket.priority)} · {platformDateTime(ticket.createdAt)}
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize text-xs">
                    {t(`admin.support.status.${ticket.status}`, ticket.status)}
                  </Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
