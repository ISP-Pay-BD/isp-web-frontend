'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { ChevronRight, Workflow } from 'lucide-react';
import { PageHeader } from '@/features/shared/page-header';
import { DataTable } from '@/features/shared/data-table';
import { useServerTable } from '@/features/admin/routers/hooks/useServerTable';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCount } from '@/lib/format';
import { useTranslations } from '@/i18n/locale-context';
import { useEngineCatalog } from '../hooks/use-engines';
import { enginePriceLabel, instanceStatusLabel } from '../lib/engine-format';
import type { EngineCatalogItem, EnginePortal } from '../types';

const ALL = '__all';
const PER_PAGE = 50;

type Props = { portal?: EnginePortal };

export function EnginesIndexPage({ portal = 'admin' }: Props) {
  const t = useTranslations();
  const table = useServerTable(PER_PAGE);
  const { search, resetPage } = table;
  const [category, setCategory] = useState(ALL);

  const { data, isLoading, isError, isFetching, refetch } = useEngineCatalog({
    search,
    category: category === ALL ? '' : category,
    page: table.page,
    perPage: table.pageSize,
  });

  const basePath = portal === 'platform' ? '/platform/engines' : '/admin/engines';
  const filtered = search !== '' || category !== ALL;

  const columns = useMemo<LegacyColumnDef<EngineCatalogItem, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('admin.engines.index.colEngine', 'Engine'),
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const item = row.original;
          return (
            <Link
              href={`${basePath}/${encodeURIComponent(item.slug)}`}
              className="group flex items-start gap-3 outline-none transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Workflow
                className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-colors duration-200 group-hover:text-foreground"
                aria-hidden
              />
              <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground transition-colors duration-200 group-hover:text-primary">
                  {item.name}
                </span>
                {item.description ? (
                  <span className="mt-0.5 block text-xs font-normal text-muted-foreground line-clamp-1">
                    {item.description}
                  </span>
                ) : null}
              </span>
            </Link>
          );
        },
      },
      {
        accessorKey: 'category',
        header: t('admin.engines.index.colCategory', 'Category'),
        enableSorting: false,
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.category}</span>,
      },
      {
        id: 'price',
        header: t('admin.engines.index.colPrice', 'Price'),
        cell: ({ row }) => <span className="tabular-nums text-muted-foreground">{enginePriceLabel(t, row.original)}</span>,
      },
      {
        id: 'status',
        header: t('common.status', 'Status'),
        cell: ({ row }) => <StatusCell item={row.original} portal={portal} />,
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">{t('admin.engines.index.open', 'Open')}</span>,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Link
              href={`${basePath}/${encodeURIComponent(row.original.slug)}`}
              className="inline-flex text-muted-foreground transition-transform duration-200 ease-out hover:translate-x-0.5 hover:text-foreground"
              aria-label={t('admin.engines.index.openEngine', 'Open {name}', { name: row.original.name })}
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        ),
      },
    ],
    [basePath, portal, t],
  );

  const header = (
    <PageHeader
      title={t('admin.engines.index.title', 'ISP Engines')}
      subtitle={
        portal === 'platform'
          ? t('admin.engines.index.subtitlePlatform', 'Engine catalog and tenant installs across the platform')
          : t('admin.engines.index.subtitleAdmin', 'Enable and configure engines for your ISP')
      }
      breadcrumb={[
        { label: t('common.crumb.dashboard', 'Dashboard'), url: portal === 'platform' ? '/platform/dashboard' : '/admin/dashboard' },
        { label: t('common.crumb.engines', 'Engines') },
      ]}
    />
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return (
      <div className="space-y-5">
        {header}
        <EmptyState variant="error" title={t('admin.engines.index.loadFailed', 'Failed to load engines')} actionLabel={t('admin.customers.list.retry', 'Retry')} onAction={() => refetch()} />
      </div>
    );
  }

  // Counts over the page are only complete when everything fits on one page.
  const complete = data.totalPages <= 1;
  const enabledCount = data.items.filter((i) => i.instance?.status === 'enabled').length;
  const publishedCount = data.items.filter((i) => i.published).length;

  return (
    <div className="space-y-5">
      {header}

      {/* Summary strip — customers-list pattern, not KPI tiles */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-border/60 bg-muted/20 px-4 py-2.5 text-xs text-muted-foreground">
        <span>
          <span className="font-semibold tabular-nums text-foreground">{formatCount(data.total)}</span>{' '}
          {filtered ? t('admin.engines.index.matchingEngines', 'matching engines') : t('admin.engines.index.engines', 'engines')}
        </span>
        <span className="text-border">·</span>
        <span>
          <span className="font-semibold tabular-nums text-foreground">{formatCount(data.categories.length)}</span>{' '}
          {t('admin.engines.index.categories', 'categories')}
        </span>
        {complete && portal === 'admin' ? (
          <>
            <span className="text-border">·</span>
            <span>
              <span className="font-semibold tabular-nums text-foreground">{formatCount(enabledCount)}</span> {t('admin.engines.index.enabled', 'enabled')}
            </span>
          </>
        ) : null}
        {complete && portal === 'platform' ? (
          <>
            <span className="text-border">·</span>
            <span>
              <span className="font-semibold tabular-nums text-foreground">{formatCount(publishedCount)}</span> {t('admin.engines.index.published', 'published')}
            </span>
          </>
        ) : null}
      </div>

      <DataTable
        urlState
        columns={columns}
        data={data.items}
        getRowId={(row) => row.id}
        searchPlaceholder={t('admin.engines.index.searchPlaceholder', 'Search engines…')}
        emptyTitle={filtered ? t('admin.engines.index.emptyFiltered', 'No engines match') : t('admin.engines.index.emptyNone', 'No engines available')}
        emptyDescription={
          filtered
            ? t('admin.engines.index.emptyFilteredHint', 'Try another keyword or category.')
            : portal === 'platform'
              ? t('admin.engines.index.emptyPlatformHint', 'Add plugins to the catalog to make engines available to tenants.')
              : t('admin.engines.index.emptyAdminHint', 'Engines published by the platform will appear here.')
        }
        server={table.server(data.total)}
        toolbarActions={
          <>
            <Select
              value={category}
              onValueChange={(v) => {
                setCategory(v || ALL);
                resetPage();
              }}
            >
              <SelectTrigger className="h-9 w-full text-xs sm:w-48" aria-label={t('admin.engines.index.filterCategory', 'Filter by category')}>
                <SelectValue>{(v: string) => (v === ALL || !v ? t('admin.engines.index.allCategories', 'All categories') : v)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>{t('admin.engines.index.allCategories', 'All categories')}</SelectItem>
                {data.categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isFetching ? <span className="text-xs text-muted-foreground">{t('admin.engines.index.updating', 'Updating…')}</span> : null}
          </>
        }
      />
    </div>
  );
}

function StatusCell({ item, portal }: { item: EngineCatalogItem; portal: EnginePortal }) {
  const t = useTranslations();
  if (portal === 'platform') {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={item.published ? 'default' : 'outline'}>
          {item.published ? t('admin.engines.index.statusPublished', 'Published') : t('admin.engines.index.statusUnpublished', 'Unpublished')}
        </Badge>
        {item.installs !== null ? (
          <span className="text-xs tabular-nums text-muted-foreground">
            {item.installs === 1
              ? t('admin.engines.index.installOne', '{n} install', { n: formatCount(item.installs) })
              : t('admin.engines.index.installMany', '{n} installs', { n: formatCount(item.installs) })}
          </span>
        ) : null}
      </div>
    );
  }
  const status = item.instance?.status;
  return (
    <Badge variant={status === 'enabled' ? 'default' : status === 'disabled' ? 'destructive' : 'outline'}>
      {instanceStatusLabel(t, item.instance)}
    </Badge>
  );
}
