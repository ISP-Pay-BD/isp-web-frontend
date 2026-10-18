'use client';

import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useRouterOptions } from '@/features/admin/routers/hooks/useRouters';
import { useSyncIpPools } from '../hooks/useIpPools';
import { useLocale } from '@/i18n/locale-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/** Pick a router → POST /v1/ip-pools/sync/{routerId} (imports its /ip/pool). */
export function SyncPoolsMenu() {
  const { t } = useLocale();
  const routersQuery = useRouterOptions();
  const routers = routersQuery.data ?? [];
  const sync = useSyncIpPools();

  const runSync = (routerId: string, routerName: string) => {
    sync.mutate(routerId, {
      onSuccess: ({ synced, found }) =>
        toast.success(t('admin.ipPools.sync.done', 'Synced {synced} of {found} pools from {router}', { synced, found, router: routerName })),
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" disabled={sync.isPending}>
            <RefreshCw className={`h-4 w-4 mr-1.5 ${sync.isPending ? 'animate-spin' : ''}`} />
            {t('admin.ipPools.sync.button', 'Sync Pools')}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs">{t('admin.ipPools.sync.label', 'Import /ip pool from router')}</DropdownMenuLabel>
          {routersQuery.isLoading ? (
            <DropdownMenuItem disabled className="text-xs">{t('admin.ipPools.modal.loadingRouters', 'Loading routers…')}</DropdownMenuItem>
          ) : routersQuery.isError ? (
            <DropdownMenuItem className="text-xs" onClick={() => routersQuery.refetch()}>
              {t('admin.ipPools.sync.retry', 'Could not load routers — retry')}
            </DropdownMenuItem>
          ) : routers.length === 0 ? (
            <DropdownMenuItem disabled className="text-xs">{t('admin.ipPools.sync.noRouters', 'No active routers')}</DropdownMenuItem>
          ) : (
            routers.map((r) => (
              <DropdownMenuItem key={r.id} className="text-xs cursor-pointer" onClick={() => runSync(r.id, r.name)}>
                {r.name}
                <span className="ml-auto font-mono text-muted-foreground">{r.host}</span>
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
