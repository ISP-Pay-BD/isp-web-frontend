'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/shared/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { DataTable } from '@/features/shared/data-table';
import { toast } from 'sonner';
import { Pin, Plus } from 'lucide-react';
import { useAdminNews } from '../hooks/use-admin-news';
import type { AdminNewsItem } from '@/data/admin/extras.data';

const searchFilter = (
  row: LegacyRow<AdminNewsItem>,
  _columnId: string,
  filterValue: unknown,
) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const n = row.original;
  return n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q);
};

export function AdminNewsPage() {
  const { data, isLoading, isError, refetch } = useAdminNews();
  const [items, setItems] = useState<AdminNewsItem[] | null>(null);

  const list = items ?? data?.items ?? [];

  const columns = useMemo<LegacyColumnDef<AdminNewsItem, unknown>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'Title',
        enableHiding: false,
        cell: ({ row }) => (
          <div className="max-w-md">
            <div className="flex items-center gap-2 font-medium">
              {row.original.pinned && <Pin className="h-3.5 w-3.5 text-primary" />}
              {row.original.title}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">{row.original.body}</p>
          </div>
        ),
      },
      {
        accessorKey: 'audience',
        header: 'Audience',
        cell: ({ row }) => <Badge variant="outline">{row.original.audience}</Badge>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={row.original.status === 'published' ? 'default' : 'secondary'}>
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: 'publishedAt',
        header: 'Published',
        cell: ({ row }) => (
          <span className="font-mono text-xs">
            {new Date(row.original.publishedAt).toLocaleDateString()}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setItems(
                list.map((n) =>
                  n.id === row.original.id ? { ...n, pinned: !n.pinned } : n,
                ),
              );
              toast.success(row.original.pinned ? 'Unpinned' : 'Pinned to portal');
            }}
          >
            {row.original.pinned ? 'Unpin' : 'Pin'}
          </Button>
        ),
      },
    ],
    [list],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load news" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="News & Notices"
        subtitle="Publish maintenance, offers, and portal announcements"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'News' }]}
        actions={
          <Button
            onClick={() =>
              toast.message('Create notice', {
                description: 'Mock UI — wire to API in Phase 8',
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            New notice
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={list}
        searchKey="title"
        searchFilterFn={searchFilter}
        searchPlaceholder="Search notices…"
      />
    </div>
  );
}
