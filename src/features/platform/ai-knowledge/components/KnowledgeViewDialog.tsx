'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { useTranslations } from '@/i18n/locale-context';
import { useKnowledgeEntry } from '../hooks/useAiKnowledge';
import { categoryLabel, matchTypeLabel } from './labels';

interface Props {
  id: string | null;
  onClose: () => void;
}

/** Reads the entry fresh from GET /v1/admin/ai-knowledge/get/{id}. */
export function KnowledgeViewDialog({ id, onClose }: Props) {
  const t = useTranslations();
  const entry = useKnowledgeEntry(id);
  const e = entry.data;

  return (
    <Dialog open={!!id} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-[620px]">
        <DialogHeader>
          <DialogTitle>{t('platform.aiKnowledge.view.title', 'Knowledge entry')}</DialogTitle>
        </DialogHeader>
        {entry.isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : entry.isError || !e ? (
          <EmptyState
            variant="error"
            title={t('platform.aiKnowledge.view.loadFailed', 'Could not load this entry')}
            description={entry.error?.message}
            actionLabel={t('common.retry', 'Retry')}
            onAction={() => entry.refetch()}
          />
        ) : (
          <div className="space-y-4 text-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{categoryLabel(t, e.category)}</Badge>
              <Badge variant="outline" tone="info">
                {matchTypeLabel(t, e.matchType)}
              </Badge>
              <StatusBadge status={e.status} />
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium">
                {t('platform.aiKnowledge.view.question', 'Question')}
              </p>
              <p className="text-foreground mt-1 font-semibold">{e.question}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-medium">
                {t('platform.aiKnowledge.view.answer', 'Answer')}
              </p>
              <p className="border-border/60 bg-muted/30 text-foreground mt-1 rounded-lg border p-3 break-words whitespace-pre-line">
                {e.answer}
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                [t('platform.aiKnowledge.view.keywords', 'Keywords'), e.keywords || '—'],
                [t('platform.aiKnowledge.view.priority', 'Priority'), String(e.priority)],
                [t('platform.aiKnowledge.view.hits', 'Hits'), String(e.hitCount)],
                [
                  t('platform.aiKnowledge.view.updated', 'Updated'),
                  e.updatedAt || e.createdAt || '—',
                ],
              ].map(([label, value]) => (
                <div key={label} className="min-w-0">
                  <dt className="text-muted-foreground text-xs">{label}</dt>
                  <dd className="font-medium break-words">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
