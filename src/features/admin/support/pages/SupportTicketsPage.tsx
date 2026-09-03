'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PageHeader } from '@/features/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Can } from '@/components/shared/Can';
import { Search, Eye, LifeBuoy } from 'lucide-react';
import { formatDate } from '@/lib/format';
import { useSupportTickets } from '../hooks/use-support';
import { staggerContainer, fadeUp, hoverLift } from '@/lib/animations';

const statusVariant = (status: string) => {
  if (status === 'open') return 'default';
  if (status === 'pending') return 'secondary';
  return 'outline';
};

const priorityVariant = (priority: string) => {
  if (priority === 'high') return 'destructive';
  if (priority === 'medium') return 'default';
  return 'secondary';
};

export function SupportTicketsPage() {
  const { data, isLoading, isError, refetch } = useSupportTickets();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    const tickets = data?.tickets ?? [];
    return tickets.filter((t) => {
      const matchSearch =
        search === '' ||
        t.subject.toLowerCase().includes(search.toLowerCase()) ||
        t.customerName.toLowerCase().includes(search.toLowerCase()) ||
        t.id.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === 'all' || t.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [data?.tickets, search, statusFilter]);

  if (isLoading) return <PageSkeleton />;
  if (isError || !data) {
    return (
      <EmptyState title="Failed to load tickets" description="Could not fetch support tickets." actionLabel="Retry" onAction={() => refetch()} />
    );
  }

  return (
    <motion.div
      className="space-y-6"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
    >
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
          { label: 'Avg Response', value: `${data.stats.avgResponseHours}h`, color: 'text-emerald-600' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 + index * 0.06 }}
            whileHover={hoverLift}
          >
            <Card>
              <CardHeader className="pb-1"><CardTitle className="text-xs text-muted-foreground font-normal">{stat.label}</CardTitle></CardHeader>
              <CardContent><p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p></CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div variants={fadeUp}>
        <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            <LifeBuoy className="h-4 w-4 text-primary" />
            All Tickets ({filtered.length})
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <div className="relative w-56">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search tickets..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-9" />
            </div>
            <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
              <SelectTrigger className="w-36 h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <EmptyState title="No tickets found" description="Try adjusting your search or filters." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-mono text-xs">{t.id}</TableCell>
                    <TableCell className="font-medium max-w-xs truncate">{t.subject}</TableCell>
                    <TableCell>{t.customerName}</TableCell>
                    <TableCell><Badge variant={priorityVariant(t.priority)}>{t.priority}</Badge></TableCell>
                    <TableCell><Badge variant={statusVariant(t.status)}>{t.status}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{formatDate(t.updatedAt)}</TableCell>
                    <TableCell className="text-right">
                      <Can menu="support" action="read">
                        <Link
                          href={`/admin/support/${t.id}`}
                          className={buttonVariants({ variant: 'ghost', size: 'sm' })}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Can>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      </motion.div>
    </motion.div>
  );
}
