'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Search, Workflow } from 'lucide-react';
import { PageHeader } from '@/features/shared/page-header';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEngineCatalog } from '../hooks/use-engines';
import { enginePriceLabel, instanceStatusLabel } from '../lib/engine-format';
import type { EngineCatalogItem, EnginePortal } from '../types';

const ALL = '__all';
const PER_PAGE = 50;

type Props = { portal?: EnginePortal };

export function EnginesIndexPage({ portal = 'admin' }: Props) {
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(ALL);
  const [page, setPage] = useState(1);

  // Debounce the server search.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading, isError, isFetching, refetch } = useEngineCatalog({
    search,
    category: category === ALL ? '' : category,
    page,
    perPage: PER_PAGE,
  });

  const basePath = portal === 'platform' ? '/platform/engines' : '/admin/engines';
  const filtered = search !== '' || category !== ALL;

  const header = (
    <PageHeader
      title="ISP Engines"
      subtitle={
        portal === 'platform'
          ? 'Engine catalog and tenant installs across the platform'
          : 'Enable and configure engines for your ISP'
      }
      breadcrumb={[
        { label: 'Dashboard', url: portal === 'platform' ? '/platform/dashboard' : '/admin/dashboard' },
        { label: 'Engines' },
      ]}
    />
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return (
      <div className="space-y-5">
        {header}
        <EmptyState title="Failed to load engines" actionLabel="Retry" onAction={() => refetch()} />
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
          <span className="font-semibold tabular-nums text-foreground">{data.total}</span>{' '}
          {filtered ? 'matching engines' : 'engines'}
        </span>
        <span className="text-border">·</span>
        <span>
          <span className="font-semibold tabular-nums text-foreground">{data.categories.length}</span>{' '}
          categories
        </span>
        {complete && portal === 'admin' ? (
          <>
            <span className="text-border">·</span>
            <span>
              <span className="font-semibold tabular-nums text-foreground">{enabledCount}</span> enabled
            </span>
          </>
        ) : null}
        {complete && portal === 'platform' ? (
          <>
            <span className="text-border">·</span>
            <span>
              <span className="font-semibold tabular-nums text-foreground">{publishedCount}</span> published
            </span>
          </>
        ) : null}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative sm:max-w-xs sm:flex-1">
          <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search engines…"
            aria-label="Search engines"
            className="h-8 pl-8 text-xs"
          />
        </div>
        <Select
          value={category}
          onValueChange={(v) => {
            setCategory(v || ALL);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-8 w-full text-xs sm:w-48">
            <SelectValue>{(v: string) => (v === ALL || !v ? 'All categories' : v)}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All categories</SelectItem>
            {data.categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isFetching ? <span className="text-xs text-muted-foreground">Updating…</span> : null}
      </div>

      {data.items.length === 0 ? (
        <EmptyState
          title={filtered ? 'No engines match' : 'No engines available'}
          description={
            filtered
              ? 'Try another keyword or category.'
              : portal === 'platform'
                ? 'Add plugins to the catalog to make engines available to tenants.'
                : 'Engines published by the platform will appear here.'
          }
          actionLabel={filtered ? 'Clear filters' : 'Retry'}
          onAction={() => {
            if (filtered) {
              setSearchInput('');
              setSearch('');
              setCategory(ALL);
              setPage(1);
            } else {
              refetch();
            }
          }}
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border/60">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-[11px] tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-2.5 font-medium">Engine</th>
                <th className="hidden px-4 py-2.5 font-medium sm:table-cell">Category</th>
                <th className="hidden px-4 py-2.5 font-medium md:table-cell">Price</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="w-10 px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {data.items.map((item) => {
                const href = `${basePath}/${encodeURIComponent(item.slug)}`;
                return (
                  <tr key={item.id} className="border-t border-border/40">
                    <td className="px-4 py-3">
                      <Link
                        href={href}
                        className="group flex items-start gap-3 outline-none transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Workflow
                          className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-colors duration-200 group-hover:text-foreground"
                          aria-hidden
                        />
                        <span>
                          <span className="block font-medium text-foreground transition-colors duration-200 group-hover:text-primary">
                            {item.name}
                          </span>
                          {item.description ? (
                            <span className="mt-0.5 block text-xs text-muted-foreground line-clamp-1">
                              {item.description}
                            </span>
                          ) : null}
                        </span>
                      </Link>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{item.category}</td>
                    <td className="hidden px-4 py-3 tabular-nums text-muted-foreground md:table-cell">
                      {enginePriceLabel(item)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusCell item={item} portal={portal} />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={href}
                        className="inline-flex text-muted-foreground transition-transform duration-200 ease-out hover:translate-x-0.5 hover:text-foreground"
                        aria-label={`Open ${item.name}`}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {data.totalPages > 1 ? (
        <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
          <span className="tabular-nums">
            Page {data.page} of {data.totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1 || isFetching}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= data.totalPages || isFetching}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function StatusCell({ item, portal }: { item: EngineCatalogItem; portal: EnginePortal }) {
  if (portal === 'platform') {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={item.published ? 'default' : 'outline'}>
          {item.published ? 'Published' : 'Unpublished'}
        </Badge>
        {item.installs !== null ? (
          <span className="text-xs tabular-nums text-muted-foreground">
            {item.installs} {item.installs === 1 ? 'install' : 'installs'}
          </span>
        ) : null}
      </div>
    );
  }
  const status = item.instance?.status;
  return (
    <Badge variant={status === 'enabled' ? 'default' : status === 'disabled' ? 'destructive' : 'outline'}>
      {instanceStatusLabel(item.instance)}
    </Badge>
  );
}
