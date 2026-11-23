'use client';

import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { Edit, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import type { useTranslations } from '@/i18n/locale-context';
import type { KnowledgeEntry } from '../types';
import { categoryLabel, matchTypeLabel } from './labels';

type Translate = ReturnType<typeof useTranslations>;

export interface KnowledgeRowActions {
  togglingId: string | null;
  onView: (e: KnowledgeEntry) => void;
  onEdit: (e: KnowledgeEntry) => void;
  onToggle: (e: KnowledgeEntry) => void;
  onDelete: (e: KnowledgeEntry) => void;
}

export function buildKnowledgeColumns(
  t: Translate,
  a: KnowledgeRowActions,
): LegacyColumnDef<KnowledgeEntry, unknown>[] {
  return [
    {
      accessorKey: 'question',
      header: t('platform.aiKnowledge.col.question', 'Question & answer'),
      enableHiding: false,
      size: 360,
      cell: ({ row }) => (
        <button
          type="button"
          className="block max-w-[420px] text-left"
          onClick={() => a.onView(row.original)}
        >
          <p className="text-foreground hover:text-primary line-clamp-2 font-semibold">
            {row.original.question}
          </p>
          <p className="text-muted-foreground line-clamp-2 text-xs">{row.original.answer}</p>
        </button>
      ),
    },
    {
      accessorKey: 'category',
      header: t('platform.aiKnowledge.col.category', 'Category'),
      cell: ({ row }) => (
        <Badge variant="outline" className="whitespace-nowrap">
          {categoryLabel(t, row.original.category)}
        </Badge>
      ),
    },
    {
      accessorKey: 'matchType',
      header: t('platform.aiKnowledge.col.mode', 'Mode'),
      cell: ({ row }) => (
        <div>
          <Badge
            variant="outline"
            tone={row.original.matchType === 'ai_context' ? 'info' : 'success'}
            className="whitespace-nowrap"
          >
            {matchTypeLabel(t, row.original.matchType)}
          </Badge>
          {row.original.keywords && (
            <p
              className="text-muted-foreground mt-1 max-w-[200px] truncate text-xs"
              title={row.original.keywords}
            >
              {row.original.keywords}
            </p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'priority',
      header: t('platform.aiKnowledge.col.priority', 'Priority'),
      cell: ({ row }) => <span className="font-medium tabular-nums">{row.original.priority}</span>,
    },
    {
      accessorKey: 'hitCount',
      header: t('platform.aiKnowledge.col.hits', 'Hits'),
      cell: ({ row }) => (
        <span className="text-primary font-semibold tabular-nums">{row.original.hitCount}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: t('platform.aiKnowledge.col.active', 'Active'),
      enableSorting: false,
      cell: ({ row }) => (
        <Switch
          checked={row.original.status === 'active'}
          disabled={a.togglingId === row.original.id}
          onCheckedChange={() => a.onToggle(row.original)}
          aria-label={t('platform.aiKnowledge.col.toggle', 'Activate or deactivate')}
        />
      ),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">{t('common.actions', 'Actions')}</span>,
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            title={t('platform.aiKnowledge.action.view', 'View')}
            aria-label={t('platform.aiKnowledge.action.view', 'View')}
            onClick={() => a.onView(row.original)}
          >
            <Eye className="text-muted-foreground h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title={t('common.edit', 'Edit')}
            aria-label={t('common.edit', 'Edit')}
            onClick={() => a.onEdit(row.original)}
          >
            <Edit className="text-muted-foreground h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title={t('common.delete', 'Delete')}
            aria-label={t('common.delete', 'Delete')}
            onClick={() => a.onDelete(row.original)}
          >
            <Trash2 className="text-destructive h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
}
