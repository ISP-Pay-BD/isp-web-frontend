'use client';

import { Router } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocale } from '@/i18n/locale-context';
import type { HotspotRouterState } from '../hooks/useHotspotRouter';

/** Router picker for the hotspot page headers (hidden until the tenant has a router). */
export function HotspotRouterSelect({ state }: { state: HotspotRouterState }) {
  const { t } = useLocale();
  const { routers, routerId, selectRouter } = state;
  if (routers.length === 0) return null;
  return (
    <Select
      value={routerId}
      onValueChange={(v) => {
        if (v) selectRouter(String(v));
      }}
      items={routers.map((r) => ({ value: r.id, label: r.name || r.host }))}
    >
      <SelectTrigger className="h-9 min-w-44" aria-label={t('admin.hotspot.router.label', 'Router')}>
        <Router className="h-4 w-4 text-muted-foreground" />
        <SelectValue placeholder={t('admin.hotspot.router.select', 'Select router')} />
      </SelectTrigger>
      <SelectContent>
        {routers.map((r) => (
          <SelectItem key={r.id} value={r.id}>
            {r.name || r.host}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
