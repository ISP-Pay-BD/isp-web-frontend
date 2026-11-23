'use client';

import { History } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { toneOfStatus } from '@/components/shared/status-tones';
import { useTranslations } from '@/i18n/locale-context';
import { useUplinkLogs } from '../hooks/useUplinks';
import type { UplinkRow } from '../types';

interface Props {
  uplink: UplinkRow | null;
  onClose: () => void;
}

export function UplinkLogsSheet({ uplink, onClose }: Props) {
  const t = useTranslations();
  const logs = useUplinkLogs(uplink?.id ?? null);

  return (
    <Sheet open={!!uplink} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{t('admin.uplinks.logs.title', 'Incident & alert log')}</SheetTitle>
          <SheetDescription>
            {uplink
              ? `${uplink.name} · ${uplink.routerName || uplink.routerId} · ${uplink.target}`
              : ''}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-3 px-4 pb-6">
          {logs.isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))
          ) : logs.isError ? (
            <EmptyState
              variant="error"
              title={t('admin.uplinks.logs.loadFailed', 'Could not load the log')}
              description={logs.error?.message}
              actionLabel={t('common.retry', 'Retry')}
              onAction={() => logs.refetch()}
            />
          ) : !logs.data?.length ? (
            <EmptyState
              icon={<History className="h-5 w-5" />}
              title={t('admin.uplinks.logs.empty', 'No incidents yet')}
              description={t(
                'admin.uplinks.logs.emptyDesc',
                'Status changes and alert dispatches appear here.',
              )}
            />
          ) : (
            logs.data.map((l, i) => (
              <div
                key={l.id || i}
                className="border-border/60 bg-card/60 rounded-lg border p-3 text-sm shadow-[var(--shadow-xs)]"
              >
                <div className="flex flex-wrap items-center gap-2">
                  {l.eventType && (
                    <Badge variant="outline" className="capitalize">
                      {l.eventType.replace(/_/g, ' ')}
                    </Badge>
                  )}
                  {l.status && (
                    <Badge variant="outline" tone={toneOfStatus(l.status)} className="capitalize">
                      {l.status}
                    </Badge>
                  )}
                  <span className="text-muted-foreground ml-auto text-xs tabular-nums">
                    {l.createdAt}
                  </span>
                </div>
                {l.message && (
                  <p className="text-foreground mt-2 break-words whitespace-pre-line">
                    {l.message}
                  </p>
                )}
                {(l.channels || l.recipient) && (
                  <p className="text-muted-foreground mt-1 text-xs">
                    {[l.channels, l.recipient].filter(Boolean).join(' → ')}
                  </p>
                )}
                {l.responseDetails && (
                  <p className="text-muted-foreground mt-1 font-mono text-xs break-all">
                    {l.responseDetails}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
