'use client';

import type { LucideIcon } from 'lucide-react';
import { ArrowDownCircle, ArrowUpCircle, Cable, Router } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCount } from '@/lib/format';
import { useTranslations } from '@/i18n/locale-context';
import type { UplinkStats } from '../types';

function Tile({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: string;
}) {
  return (
    <div className="border-border/60 bg-card/60 hover:border-primary/30 flex flex-col justify-between rounded-xl border p-4 shadow-sm backdrop-blur-sm transition-colors duration-200 ease-out">
      <div className="text-muted-foreground flex items-center justify-between text-xs font-medium">
        <span>{label}</span>
        <Icon className={cn('h-4 w-4', tone)} />
      </div>
      <div
        className={cn(
          'mt-2 text-2xl font-bold tabular-nums',
          tone === 'text-primary' ? 'text-foreground' : tone,
        )}
      >
        {formatCount(value)}
      </div>
    </div>
  );
}

export function UplinkStatsStrip({ stats }: { stats: UplinkStats }) {
  const t = useTranslations();
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <Tile
        label={t('admin.uplinks.stats.total', 'Monitored uplinks')}
        value={stats.total}
        icon={Cable}
        tone="text-primary"
      />
      <Tile
        label={t('admin.uplinks.stats.up', 'Up')}
        value={stats.up}
        icon={ArrowUpCircle}
        tone="text-emerald-600 dark:text-emerald-400"
      />
      <Tile
        label={t('admin.uplinks.stats.down', 'Down')}
        value={stats.down}
        icon={ArrowDownCircle}
        tone="text-red-600 dark:text-red-400"
      />
      <Tile
        label={t('admin.uplinks.stats.routers', 'Routers covered')}
        value={stats.routers}
        icon={Router}
        tone="text-blue-600 dark:text-blue-400"
      />
    </div>
  );
}
