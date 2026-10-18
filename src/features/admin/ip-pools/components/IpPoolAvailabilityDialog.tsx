'use client';

import { useIpPoolAvailability } from '../hooks/useIpPools';
import type { IpPool } from '../types';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useLocale } from '@/i18n/locale-context';

interface IpPoolAvailabilityDialogProps {
  pool: IpPool | null;
  onOpenChange: (open: boolean) => void;
}

/** Free addresses of one pool (GET /v1/ip-pools/{id}/available), loaded when opened. */
export function IpPoolAvailabilityDialog({ pool, onOpenChange }: IpPoolAvailabilityDialogProps) {
  const { t } = useLocale();
  const { data, isLoading, isError, error, refetch } = useIpPoolAvailability(pool?.id ?? null);

  return (
    <Dialog open={Boolean(pool)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{t('admin.ipPools.free.title', 'Free addresses — {name}', { name: pool?.name ?? '' })}</DialogTitle>
          <DialogDescription className="font-mono text-xs">
            {pool?.cidr || `${pool?.startIp ?? ''} → ${pool?.endIp ?? ''}`}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3" aria-busy="true">
            {Array.from({ length: 9 }, (_, i) => (
              <Skeleton key={i} className="h-6" />
            ))}
          </div>
        ) : isError ? (
          <EmptyState variant="error"
            title={t('admin.ipPools.free.loadFailed', 'Could not load free addresses')}
            description={errorMessage(error)}
            actionLabel={t('admin.customers.list.retry', 'Retry')}
            onAction={() => refetch()}
          />
        ) : data && data.available.length > 0 ? (
          <div className="space-y-3">
            {data.nextIp ? (
              <p className="text-sm">
                {t('admin.ipPools.free.next', 'Next to assign:')} <code className="font-mono font-semibold text-primary">{data.nextIp}</code>
              </p>
            ) : null}
            <p className="text-xs text-muted-foreground">
              {t('admin.ipPools.free.first', 'First {n} free addresses in this pool', { n: data.available.length })}
            </p>
            <div className="grid max-h-72 grid-cols-2 gap-1.5 overflow-y-auto sm:grid-cols-3">
              {data.available.map((ip) => (
                <code key={ip} className="rounded-md border border-border/60 bg-muted/40 px-2 py-1 font-mono text-xs">
                  {ip}
                </code>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState title={t('admin.ipPools.free.none', 'No free addresses')} description={t('admin.ipPools.free.noneHint', 'Every address in this pool is assigned or reserved.')} />
        )}
      </DialogContent>
    </Dialog>
  );
}
