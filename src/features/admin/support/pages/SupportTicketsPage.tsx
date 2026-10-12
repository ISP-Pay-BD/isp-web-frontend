'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Can } from '@/components/shared/Can';
import { OpsSummaryStrip } from '@/components/shared/OpsSummaryStrip';
import { DataTable } from '@/features/shared/data-table';
import { toast } from 'sonner';
import { Eye, LifeBuoy, Plus, CheckCircle2 } from 'lucide-react';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { useSmsRecipients } from '@/features/admin/sms/hooks/use-sms';
import { useDebouncedValue } from '@/features/admin/sms/hooks/use-debounced-value';
import type { SmsRecipient } from '@/features/admin/sms/types';
import { useCreateTicket, useSupportTickets } from '../hooks/use-support';
import { TICKET_CATEGORIES, TICKET_STATUS_LABEL, type StaffTicket, type TicketPriority } from '../types';

const statusVariant = (status: string) => {
  if (status === 'opened') return 'default' as const;
  if (status === 'processing') return 'secondary' as const;
  return 'outline' as const;
};

const priorityVariant = (priority: string) => {
  if (priority === 'high') return 'destructive' as const;
  if (priority === 'medium') return 'default' as const;
  return 'secondary' as const;
};

const EMPTY_TICKET = { subject: '', category: 'technical', priority: 'medium' as TicketPriority, description: '' };

export function SupportTicketsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [priority, setPriority] = useState('all');
  const tickets = useSupportTickets({ page, pageSize, search, status, priority });
  const createTicket = useCreateTicket();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTicket, setNewTicket] = useState(EMPTY_TICKET);
  const [customer, setCustomer] = useState<SmsRecipient | null>(null);
  const [customerQuery, setCustomerQuery] = useState('');
  const debouncedCustomerQuery = useDebouncedValue(customerQuery);
  const customerResults = useSmsRecipients(
    { page: 1, pageSize: 8, search: debouncedCustomerQuery },
    createModalOpen && debouncedCustomerQuery.trim().length > 1,
  );

  const closeCreate = () => {
    setCreateModalOpen(false);
    setNewTicket(EMPTY_TICKET);
    setCustomer(null);
    setCustomerQuery('');
  };

  const handleCreateTicket = () => {
    if (!newTicket.subject.trim() || !newTicket.description.trim()) {
      toast.error('Subject and description are required');
      return;
    }
    createTicket.mutate(
      {
        subject: newTicket.subject.trim(),
        category: newTicket.category,
        priority: newTicket.priority,
        message: newTicket.description.trim(),
        customerId: customer?.id,
      },
      {
        onSuccess: (t) => {
          toast.success(`Support ticket #${t.id} created`);
          closeCreate();
        },
      },
    );
  };

  const columns = useMemo<LegacyColumnDef<StaffTicket, unknown>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'Ticket ID',
        size: 100,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="font-mono text-xs font-semibold">
              #{row.original.id}
            </Badge>
            {!row.original.viewed && <span className="h-2 w-2 rounded-full bg-primary" title="Unread" />}
          </div>
        ),
      },
      {
        accessorKey: 'subject',
        header: 'Subject & Description',
        size: 260,
        enableHiding: false,
        cell: ({ row }) => (
          <div>
            <span className="font-semibold text-xs text-foreground block truncate max-w-sm">{row.original.subject}</span>
            <span className="text-[10px] text-muted-foreground line-clamp-1 font-sans">{row.original.preview || 'No description'}</span>
          </div>
        ),
      },
      {
        accessorKey: 'customerName',
        header: 'Opened By',
        size: 170,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-[10px]">
              {row.original.customerName.charAt(0)}
            </div>
            <div>
              <span className="font-medium text-xs text-foreground block">{row.original.customerName}</span>
              {row.original.customerMobile && <span className="text-[10px] font-mono text-muted-foreground">{row.original.customerMobile}</span>}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'priority',
        header: 'Priority',
        size: 100,
        cell: ({ row }) => (
          <Badge variant={priorityVariant(row.original.priority)} className="text-[10px] font-mono capitalize">
            {row.original.priority}
          </Badge>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 110,
        cell: ({ row }) => {
          const s = row.original.status;
          return (
            <Badge variant={statusVariant(s)} className={`text-[10px] font-mono ${s === 'opened' ? 'bg-emerald-600 hover:bg-emerald-600 text-white' : ''}`}>
              {TICKET_STATUS_LABEL[s]}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'lastActivityAt',
        header: 'Last Activity',
        size: 130,
        cell: ({ row }) => (
          <span className="text-xs font-mono text-muted-foreground">{row.original.lastActivityAt ? formatDate(row.original.lastActivityAt) : '—'}</span>
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
                className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'h-8 text-xs gap-1 text-primary hover:bg-primary/10')}
              >
                <Eye className="h-3.5 w-3.5" />
                Open
              </Link>
            </Can>
          </div>
        ),
      },
    ],
    [],
  );

  if (tickets.isLoading) return <PageSkeleton variant="table" />;
  if (tickets.isError && !tickets.data) {
    return (
      <EmptyState
        title="Failed to load tickets"
        description={errorMessage(tickets.error, 'Could not fetch support tickets.')}
        actionLabel="Retry"
        onAction={() => tickets.refetch()}
      />
    );
  }

  const stats = tickets.data?.stats;
  const avg = stats?.avgFirstResponseHours;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support Tickets Desk"
        subtitle="Customer support inquiries assigned to your team, with response-time tracking"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Engagement' },
          { label: 'Support Tickets' },
        ]}
        actions={
          <Button className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setCreateModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Create Ticket
          </Button>
        }
      />

      <OpsSummaryStrip
        items={[
          { label: 'Open', value: `${stats?.opened ?? 0} Active` },
          { label: 'In Progress', value: `${stats?.processing ?? 0} Tickets` },
          { label: 'Resolved', value: `${stats?.closed ?? 0} Closed` },
          { label: 'Unread', value: stats?.unread ?? 0 },
          {
            label: 'Avg First Response',
            value: avg === null || avg === undefined ? '—' : `${avg}h (last ${stats?.respondedSample ?? 0} answered)`,
          },
        ]}
      />

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <LifeBuoy className="h-4 w-4 text-primary" />
                Customer Support Inquiries
              </CardTitle>
              <CardDescription>Tickets you opened or that are assigned to you</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={status} onValueChange={(v) => { if (v) { setStatus(v); setPage(1); } }}>
                <SelectTrigger className="h-9 w-[130px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="opened">Open</SelectItem>
                  <SelectItem value="processing">In progress</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priority} onValueChange={(v) => { if (v) { setPriority(v); setPage(1); } }}>
                <SelectTrigger className="h-9 w-[130px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={tickets.data?.items ?? []}
            getRowId={(row) => row.id}
            searchKey="subject"
            searchPlaceholder="Search by subject, customer, phone or #ID..."
            emptyTitle="No tickets found"
            emptyDescription="Try adjusting your search or filters."
            server={{
              page,
              pageSize,
              total: tickets.data?.meta.total ?? 0,
              onPageChange: setPage,
              onPageSizeChange: (size) => {
                setPageSize(size);
                setPage(1);
              },
              search,
              onSearchChange: (q) => {
                setSearch(q);
                setPage(1);
              },
            }}
            toolbarActions={
              <Button size="sm" onClick={() => setCreateModalOpen(true)} className="gap-1.5">
                <Plus className="h-4 w-4" />
                New Ticket
              </Button>
            }
          />
        </CardContent>
      </Card>

      <Dialog open={createModalOpen} onOpenChange={(open) => (open ? setCreateModalOpen(true) : closeCreate())}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LifeBuoy className="h-5 w-5 text-primary" />
              Open Support Ticket
            </DialogTitle>
            <DialogDescription>Open a ticket on a customer&apos;s behalf, or an internal ticket for your team.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Customer (optional)</Label>
              {customer ? (
                <div className="flex items-center justify-between rounded-md border border-border/70 px-3 py-2">
                  <span>
                    <span className="font-semibold">{customer.name}</span>{' '}
                    <span className="font-mono text-muted-foreground">({customer.mobile || 'no mobile'})</span>
                  </span>
                  <Button type="button" variant="ghost" size="sm" className="h-6 text-[11px]" onClick={() => setCustomer(null)}>
                    Change
                  </Button>
                </div>
              ) : (
                <>
                  <Input
                    value={customerQuery}
                    onChange={(e) => setCustomerQuery(e.target.value)}
                    placeholder="Search customer by name or phone (leave empty for internal)"
                    className="text-xs"
                  />
                  {debouncedCustomerQuery.trim().length > 1 && (
                    <div className="max-h-40 overflow-y-auto rounded-md border border-border/60 divide-y divide-border/40">
                      {customerResults.isFetching && !customerResults.data ? (
                        <p className="p-2 text-[11px] text-muted-foreground">Searching…</p>
                      ) : (customerResults.data?.items ?? []).length === 0 ? (
                        <p className="p-2 text-[11px] text-muted-foreground">No customers found.</p>
                      ) : (
                        (customerResults.data?.items ?? []).map((c) => (
                          <button key={c.id} type="button" onClick={() => setCustomer(c)} className="w-full text-left px-3 py-2 hover:bg-muted/50">
                            <span className="font-semibold">{c.name}</span> <span className="font-mono text-muted-foreground">({c.mobile || 'no mobile'})</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Priority Level</Label>
                <Select value={newTicket.priority} onValueChange={(v) => { if (v) setNewTicket({ ...newTicket, priority: v as TicketPriority }); }}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Category</Label>
                <Select value={newTicket.category} onValueChange={(v) => { if (v) setNewTicket({ ...newTicket, category: v }); }}>
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TICKET_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Issue Subject</Label>
              <Input value={newTicket.subject} maxLength={190} onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })} placeholder="Short summary of the problem" className="text-xs" />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Detailed Description</Label>
              <Textarea
                value={newTicket.description}
                onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                placeholder="Describe the problem, link status or error message..."
                className="h-20 text-xs font-mono resize-y"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeCreate}>
              Cancel
            </Button>
            <Button onClick={handleCreateTicket} disabled={createTicket.isPending} className="gap-1.5 bg-primary text-primary-foreground">
              <CheckCircle2 className="h-4 w-4" />
              {createTicket.isPending ? 'Opening…' : 'Open Ticket'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
