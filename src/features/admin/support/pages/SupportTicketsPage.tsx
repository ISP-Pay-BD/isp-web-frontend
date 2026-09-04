'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Can } from '@/components/shared/Can';
import { DataTable } from '@/features/shared/data-table';
import { Eye, LifeBuoy } from 'lucide-react';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useSupportTickets } from '../hooks/use-support';
import { staggerContainer, fadeUp, hoverLift } from '@/lib/animations';
import type { SupportTicket } from '@/data/shared/types';

const statusVariant = (status: string) => {
  if (status === 'open') return 'default' as const;
  if (status === 'pending') return 'secondary' as const;
  return 'outline' as const;
};

const priorityVariant = (priority: string) => {
  if (priority === 'high') return 'destructive' as const;
  if (priority === 'medium') return 'default' as const;
  return 'secondary' as const;
};

const ticketSearchFilter = (
  row: LegacyRow<SupportTicket>,
  _columnId: string,
  filterValue: unknown,
) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const t = row.original;
  return (
    t.subject.toLowerCase().includes(q) ||
    t.customerName.toLowerCase().includes(q) ||
    t.id.toLowerCase().includes(q)
  );
};

export function SupportTicketsPage() {
  const { data, isLoading, isError, refetch } = useSupportTickets();
  const tickets = data?.tickets ?? [];

  const columns = useMemo<LegacyColumnDef<SupportTicket, unknown>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        size: 100,
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.id}</span>
        ),
      },
      {
        accessorKey: 'subject',
        header: 'Subject',
        size: 240,
        enableHiding: false,
        cell: ({ row }) => (
          <span className="font-medium max-w-xs truncate block">{row.original.subject}</span>
        ),
      },
      {
        accessorKey: 'customerName',
        header: 'Customer',
        size: 160,
      },
      {
        accessorKey: 'priority',
        header: 'Priority',
        size: 100,
        cell: ({ row }) => (
          <Badge variant={priorityVariant(row.original.priority)}>{row.original.priority}</Badge>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 100,
        cell: ({ row }) => (
          <Badge variant={statusVariant(row.original.status)}>{row.original.status}</Badge>
        ),
      },
      {
        accessorKey: 'updatedAt',
        header: 'Updated',
        size: 120,
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">{formatDate(row.original.updatedAt)}</span>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Action</span>,
        size: 90,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Can menu="support" action="read">
              <Link
                href={`/admin/support/${row.original.id}`}
                className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Link>
            </Can>
          </div>
        ),
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return (
      <EmptyState
        title="Failed to load tickets"
        description="Could not fetch support tickets."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <motion.div className="space-y-6" variants={staggerContainer} initial={false} animate="show">
      <motion.div variants={fadeUp}>
        <PageHeader
          title="Support Tickets"
          subtitle="Manage customer support requests and response SLA"
          breadcrumb={[
            { label: 'Dashboard', url: '/admin/dashboard' },
            { label: 'Support Tickets' },
          ]}
        />
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Open', value: data.stats.open, color: 'text-primary' },
          { label: 'Pending', value: data.stats.pending, color: 'text-amber-600' },
          { label: 'Closed', value: data.stats.closed, color: 'text-muted-foreground' },
          {
            label: 'Avg Response',
            value: `${data.stats.avgResponseHours}h`,
            color: 'text-emerald-600',
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 + index * 0.06 }}
            whileHover={hoverLift}
          >
            <Card>
              <CardHeader className="pb-1">
                <CardTitle className="text-xs text-muted-foreground font-normal">
                  {stat.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={fadeUp} className="space-y-3">
        <div className="flex items-center gap-2 text-base font-medium">
          <LifeBuoy className="h-4 w-4 text-primary" />
          All Tickets
        </div>
        <DataTable
          columns={columns}
          data={tickets}
          getRowId={(row) => row.id}
          searchKey="subject"
          searchPlaceholder="Search tickets..."
          searchFilterFn={ticketSearchFilter}
          facetFilters={[
            { columnId: 'status', title: 'Status' },
            { columnId: 'priority', title: 'Priority' },
          ]}
          emptyTitle="No tickets found"
          emptyDescription="Try adjusting your search or filters."
        />
      </motion.div>
    </motion.div>
  );
}
