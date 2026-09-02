'use client';

import { useMemo } from 'react';
import { UserCheck, CheckCircle2, Clock, ThumbsUp } from 'lucide-react';
import { useFreeRequests } from '../hooks/use-customers';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';

interface FreeRequestItem {
  id: string;
  name: string;
  phone: string;
  area: string;
  requestedAt: string;
  status: 'pending' | 'approved';
}

export function FreeRequestsPage() {
  const { data, isLoading, isError, refetch } = useFreeRequests();

  const requests = (data as FreeRequestItem[]) || [];

  const columns: LegacyColumnDef<FreeRequestItem, unknown>[] = [
    {
      accessorKey: 'name',
      header: 'Applicant Lead',
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-sm">{row.original.name}</div>
          <div className="text-xs text-muted-foreground font-mono">{row.original.phone}</div>
        </div>
      ),
    },
    {
      accessorKey: 'area',
      header: 'Coverage Area',
      cell: ({ row }) => <span className="text-sm">{row.original.area}</span>,
    },
    {
      accessorKey: 'requestedAt',
      header: 'Request Date',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {new Date(row.original.requestedAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'actions',
      header: 'Action',
      cell: ({ row }) => {
        if (row.original.status === 'approved') {
          return (
            <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" /> Approved
            </span>
          );
        }
        return (
          <Button
            size="sm"
            className="h-8 text-xs bg-primary hover:bg-primary/90"
            onClick={() => toast.success(`Lead ${row.original.name} approved as free trial customer!`)}
          >
            <ThumbsUp className="mr-1 h-3 w-3" /> Approve Trial
          </Button>
        );
      },
    },
  ];

  if (isLoading) return <PageSkeleton rows={5} />;
  if (isError) {
    return (
      <EmptyState
        title="Error loading free user requests"
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-2">
          <UserCheck className="h-6 w-6 text-primary" /> Free User Requests
        </h1>
        <p className="text-muted-foreground text-sm">
          Prospective leads and trial broadband requests pending verification and line commissioning.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={requests}
        emptyTitle="No free requests pending"
        emptyDescription="All incoming promotional trial requests have been processed."
      />
    </div>
  );
}
