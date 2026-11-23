'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { BellRing, Edit, History, RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Can } from '@/components/shared/Can';
import { cn } from '@/lib/utils';
import type { useTranslations } from '@/i18n/locale-context';
import type { UplinkRow } from '../types';

type Translate = ReturnType<typeof useTranslations>;

export interface UplinkRowActions {
  checkingId: string | null;
  alertingId: string | null;
  togglingId: string | null;
  onCheck: (u: UplinkRow) => void;
  onTestAlert: (u: UplinkRow) => void;
  onToggle: (u: UplinkRow) => void;
  onLogs: (u: UplinkRow) => void;
  onEdit: (u: UplinkRow) => void;
  onDelete: (u: UplinkRow) => void;
}

export function typeLabel(t: Translate, type: UplinkRow['uplinkType']) {
  if (type === 'interface') return t('admin.uplinks.type.interface', 'Interface');
  if (type === 'bgp') return t('admin.uplinks.type.bgp', 'BGP peer');
  if (type === 'ping') return t('admin.uplinks.type.ping', 'Ping');
  return t('admin.uplinks.type.netwatch', 'Netwatch');
}

function channelLabel(t: Translate, c: UplinkRow['alertChannels']) {
  if (c === 'whatsapp') return t('admin.uplinks.channel.whatsapp', 'WhatsApp only');
  if (c === 'sms') return t('admin.uplinks.channel.sms', 'SMS only');
  return t('admin.uplinks.channel.both', 'WhatsApp & SMS');
}

export function buildUplinkColumns(
  t: Translate,
  a: UplinkRowActions,
): LegacyColumnDef<UplinkRow, unknown>[] {
  return [
    {
      accessorKey: 'name',
      header: t('admin.uplinks.col.uplink', 'Uplink'),
      enableHiding: false,
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="text-foreground font-semibold">{row.original.name}</p>
          <p className="text-muted-foreground truncate font-mono text-xs">
            {typeLabel(t, row.original.uplinkType)} · {row.original.target}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'routerName',
      header: t('admin.uplinks.col.router', 'Router'),
      cell: ({ row }) => (
        <div>
          <Link
            href={`/admin/routers/${row.original.routerId}`}
            className="hover:text-primary font-medium hover:underline"
          >
            {row.original.routerName || `#${row.original.routerId}`}
          </Link>
          {row.original.routerHost && (
            <p className="text-muted-foreground font-mono text-xs">{row.original.routerHost}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: t('admin.uplinks.col.status', 'Status'),
      cell: ({ row }) => {
        const u = row.original;
        return (
          <div className="flex flex-col items-start gap-1">
            <StatusBadge
              status={u.status}
              tone={u.status === 'up' ? 'success' : u.status === 'down' ? 'danger' : 'neutral'}
              label={
                u.status === 'up'
                  ? t('admin.uplinks.status.up', 'Up')
                  : u.status === 'down'
                    ? t('admin.uplinks.status.down', 'Down')
                    : t('admin.uplinks.status.unknown', 'Unknown')
              }
            />
            {u.lastResponse && (
              <span
                className="text-muted-foreground max-w-[220px] truncate text-xs"
                title={u.lastResponse}
              >
                {u.lastResponse}
              </span>
            )}
            {u.failCount > 0 && (
              <span className="text-xs text-amber-600 dark:text-amber-400">
                {t('admin.uplinks.col.fails', '{n}/{max} failed checks', {
                  n: u.failCount,
                  max: u.failThreshold,
                })}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'lastCheckedAt',
      header: t('admin.uplinks.col.lastCheck', 'Last check'),
      cell: ({ row }) => (
        <div className="text-xs">
          <p className="tabular-nums">
            {row.original.lastCheckedAt || t('admin.uplinks.col.never', 'Never')}
          </p>
          {row.original.lastNotifiedAt && (
            <p className="text-muted-foreground">
              {t('admin.uplinks.col.alerted', 'Alerted {time}', {
                time: row.original.lastNotifiedAt,
              })}
            </p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'alertChannels',
      header: t('admin.uplinks.col.alerts', 'Alerts'),
      enableSorting: false,
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs">
          {channelLabel(t, row.original.alertChannels)}
        </Badge>
      ),
    },
    {
      accessorKey: 'isEnabled',
      header: t('admin.uplinks.col.monitoring', 'Monitoring'),
      enableSorting: false,
      cell: ({ row }) => (
        <Can
          menu="routers"
          action="update"
          fallback={
            <span className="text-muted-foreground text-xs">
              {row.original.isEnabled
                ? t('admin.uplinks.col.on', 'On')
                : t('admin.uplinks.col.paused', 'Paused')}
            </span>
          }
        >
          <Switch
            checked={row.original.isEnabled}
            disabled={a.togglingId === row.original.id}
            onCheckedChange={() => a.onToggle(row.original)}
            aria-label={t('admin.uplinks.col.toggle', 'Pause or resume monitoring')}
          />
        </Can>
      ),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">{t('common.actions', 'Actions')}</span>,
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const u = row.original;
        const icon = (label: string, onClick: () => void, node: ReactNode, disabled = false) => (
          <Button
            variant="ghost"
            size="icon"
            title={label}
            aria-label={label}
            disabled={disabled}
            onClick={onClick}
          >
            {node}
          </Button>
        );
        return (
          <div className="flex items-center justify-end gap-0.5">
            {icon(
              t('admin.uplinks.action.check', 'Check now'),
              () => a.onCheck(u),
              <RefreshCw
                className={cn('text-primary h-4 w-4', a.checkingId === u.id && 'animate-spin')}
              />,
              a.checkingId === u.id,
            )}
            {icon(
              t('admin.uplinks.action.testAlert', 'Send test alert'),
              () => a.onTestAlert(u),
              <BellRing
                className={cn('h-4 w-4 text-amber-500', a.alertingId === u.id && 'animate-pulse')}
              />,
              a.alertingId === u.id,
            )}
            {icon(
              t('admin.uplinks.action.logs', 'Incident log'),
              () => a.onLogs(u),
              <History className="text-muted-foreground h-4 w-4" />,
            )}
            <Can menu="routers" action="update">
              {icon(
                t('admin.uplinks.action.edit', 'Edit'),
                () => a.onEdit(u),
                <Edit className="text-muted-foreground h-4 w-4" />,
              )}
            </Can>
            <Can menu="routers" action="delete">
              {icon(
                t('admin.uplinks.action.delete', 'Delete'),
                () => a.onDelete(u),
                <Trash2 className="text-destructive h-4 w-4" />,
              )}
            </Can>
          </div>
        );
      },
    },
  ];
}
