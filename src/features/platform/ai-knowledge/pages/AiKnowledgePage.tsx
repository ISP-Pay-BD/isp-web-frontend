'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { BookOpenCheck, Bot, Plus, RefreshCw, ShieldOff, Sparkles, Target } from 'lucide-react';
import { PlatformPageHeader } from '@/features/platform/shared';
import { DataTable } from '@/features/shared/data-table';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatCount } from '@/lib/format';
import { useAuthStore } from '@/stores/auth-store';
import { useTranslations } from '@/i18n/locale-context';
import {
  useDeleteKnowledge,
  useKnowledgeList,
  useKnowledgeStats,
  useToggleKnowledge,
} from '../hooks/useAiKnowledge';
import { buildKnowledgeColumns } from '../components/knowledge-columns';
import { KnowledgeFormDialog } from '../components/KnowledgeFormDialog';
import { KnowledgeViewDialog } from '../components/KnowledgeViewDialog';
import { KnowledgeTestPanel } from '../components/KnowledgeTestPanel';
import { categoryLabel } from '../components/labels';
import { KB_CATEGORIES, type KnowledgeEntry } from '../types';

const selectCls = 'h-8 rounded-md border border-input bg-transparent px-2 text-sm';

export function AiKnowledgePage() {
  const t = useTranslations();
  const user = useAuthStore((s) => s.user);
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const list = useKnowledgeList(category, status, search);
  const statsQuery = useKnowledgeStats();
  const toggle = useToggleKnowledge();
  const remove = useDeleteKnowledge();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<KnowledgeEntry | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<KnowledgeEntry | null>(null);

  const columns = useMemo(
    () =>
      buildKnowledgeColumns(t, {
        togglingId: toggle.isPending ? (toggle.variables ?? null) : null,
        onView: (e) => setViewId(e.id),
        onEdit: (e) => {
          setEditing(e);
          setFormOpen(true);
        },
        onToggle: (e) =>
          toggle.mutate(e.id, {
            onSuccess: () =>
              toast.success(
                e.status === 'active'
                  ? t('platform.aiKnowledge.toast.deactivated', 'Entry deactivated')
                  : t('platform.aiKnowledge.toast.activated', 'Entry activated'),
              ),
          }),
        onDelete: setDeleteTarget,
      }),
    [t, toggle],
  );

  // Whole-base numbers come from the server (`/stats`), not from counting the filtered list in the browser.
  const stats = statsQuery.data;
  const pageRows = useMemo(
    () => (list.data ?? []).slice((page - 1) * pageSize, page * pageSize),
    [list.data, page, pageSize],
  );

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  if ((user && user.role !== 'super_admin') || list.error?.status === 403) {
    return (
      <EmptyState
        icon={<ShieldOff className="h-5 w-5" />}
        title={t('platform.aiKnowledge.denied', 'Super admin only')}
        description={t(
          'platform.aiKnowledge.deniedDesc',
          'The AI knowledge base is managed by the platform owner.',
        )}
      />
    );
  }
  if (list.isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (list.isError) {
    return (
      <EmptyState
        variant="error"
        title={t('platform.aiKnowledge.loadFailed', 'Failed to load the knowledge base')}
        description={list.error?.message}
        actionLabel={t('common.retry', 'Retry')}
        onAction={() => list.refetch()}
      />
    );
  }

  const filtered = category !== 'all' || status !== 'all' || search !== '';
  const kpi = (v: number | undefined) =>
    statsQuery.isLoading ? '…' : v === undefined ? '—' : formatCount(v);
  const kpis = [
    {
      label: t('platform.aiKnowledge.kpi.total', 'Entries'),
      value: kpi(stats?.total),
      icon: BookOpenCheck,
      cls: 'text-primary',
    },
    {
      label: t('platform.aiKnowledge.kpi.active', 'Active'),
      value: kpi(stats?.active),
      icon: Sparkles,
      cls: 'text-emerald-500',
    },
    {
      label: t('platform.aiKnowledge.kpi.hits', 'Answers served'),
      value: kpi(stats?.hits),
      icon: Target,
      cls: 'text-blue-500',
    },
    {
      label: t('platform.aiKnowledge.kpi.categories', 'Categories'),
      value: kpi(stats?.categories.length),
      icon: Bot,
      cls: 'text-amber-500',
    },
  ];
  const resetPage = () => setPage(1);

  return (
    <div className="space-y-6">
      <PlatformPageHeader
        title={t('platform.aiKnowledge.title', 'AI Knowledge Base')}
        subtitle={t(
          'platform.aiKnowledge.subtitle',
          'Verified Q&A the support chatbot answers instantly, plus official facts it feeds to the AI engine.',
        )}
        breadcrumb={[
          { label: t('common.crumb.platform', 'Platform'), href: '/platform/dashboard' },
          { label: t('nav.platform-ai-knowledge', 'AI Knowledge Base') },
        ]}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => list.refetch()}
              disabled={list.isFetching}
            >
              <RefreshCw className={cn('mr-1.5 h-4 w-4', list.isFetching && 'animate-spin')} />
              {t('admin.dashboard.refresh', 'Refresh')}
            </Button>
            <Button size="sm" onClick={openCreate}>
              <Plus className="mr-1.5 h-4 w-4" />
              {t('platform.aiKnowledge.add', 'New entry')}
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map(({ label, value, icon: Icon, cls }) => (
          <div
            key={label}
            className="border-border/60 bg-card/60 hover:border-primary/30 rounded-xl border p-4 shadow-sm backdrop-blur-sm transition-colors duration-200 ease-out"
          >
            <div className="text-muted-foreground flex items-center justify-between text-xs font-medium">
              <span>{label}</span>
              <Icon className={cn('h-4 w-4', cls)} />
            </div>
            <div className="text-foreground mt-2 text-2xl font-bold tabular-nums">{value}</div>
          </div>
        ))}
      </div>
      {statsQuery.isError ? (
        <p className="text-muted-foreground -mt-3 text-xs">
          {t('platform.aiKnowledge.statsFailed', 'Totals could not be loaded.')}{' '}
          <button
            type="button"
            className="text-primary underline-offset-2 hover:underline"
            onClick={() => statsQuery.refetch()}
          >
            {t('common.retry', 'Retry')}
          </button>
        </p>
      ) : null}

      <KnowledgeTestPanel />

      {stats?.total === 0 && !filtered ? (
        <EmptyState
          icon={<Bot className="h-5 w-5" />}
          title={t('platform.aiKnowledge.empty', 'The knowledge base is empty')}
          description={t(
            'platform.aiKnowledge.emptyDesc',
            'Add billing, package and hotline answers so the chatbot replies instantly and correctly.',
          )}
          actionLabel={t('platform.aiKnowledge.add', 'New entry')}
          onAction={openCreate}
        />
      ) : (
        <DataTable
          columns={columns}
          data={pageRows}
          getRowId={(row) => row.id}
          searchPlaceholder={t(
            'platform.aiKnowledge.search',
            'Search question, answer or keyword...',
          )}
          server={{
            page,
            pageSize,
            total: list.data?.length ?? 0,
            onPageChange: setPage,
            onPageSizeChange: (size) => {
              setPageSize(size);
              resetPage();
            },
            search,
            onSearchChange: (q) => {
              setSearch(q);
              resetPage();
            },
          }}
          emptyTitle={t('platform.aiKnowledge.noMatch', 'No entry matches')}
          emptyDescription={t('platform.aiKnowledge.noMatchDesc', 'Change the search or filters.')}
          toolbarActions={
            <div className="flex flex-wrap gap-2">
              <select
                aria-label={t('platform.aiKnowledge.filterCategory', 'Category')}
                className={selectCls}
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  resetPage();
                }}
              >
                <option value="all">
                  {t('platform.aiKnowledge.allCategories', 'All categories')}
                </option>
                {KB_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {categoryLabel(t, c)}
                  </option>
                ))}
              </select>
              <select
                aria-label={t('platform.aiKnowledge.filterStatus', 'Status')}
                className={selectCls}
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  resetPage();
                }}
              >
                <option value="all">{t('platform.aiKnowledge.allStatus', 'All status')}</option>
                <option value="active">{t('status.active', 'Active')}</option>
                <option value="inactive">{t('status.inactive', 'Inactive')}</option>
              </select>
            </div>
          }
        />
      )}

      <KnowledgeFormDialog
        key={editing?.id ?? 'new'}
        open={formOpen}
        onOpenChange={setFormOpen}
        entry={editing}
      />
      <KnowledgeViewDialog id={viewId} onClose={() => setViewId(null)} />
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t('platform.aiKnowledge.deleteTitle', 'Delete this entry?')}
        description={
          deleteTarget
            ? t(
                'platform.aiKnowledge.deleteDesc',
                '"{q}" will no longer answer chatbot questions.',
                { q: deleteTarget.question },
              )
            : undefined
        }
        confirmLabel={t('common.delete', 'Delete')}
        destructive
        onConfirm={() => {
          const target = deleteTarget;
          if (!target) return;
          remove.mutate(target.id, {
            onSuccess: () =>
              toast.success(t('platform.aiKnowledge.toast.deleted', 'Entry deleted')),
            onSettled: () => setDeleteTarget(null),
          });
        }}
      />
    </div>
  );
}
