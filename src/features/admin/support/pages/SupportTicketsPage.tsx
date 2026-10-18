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
import { useTranslations } from '@/i18n/locale-context';
import { useSmsRecipients } from '@/features/admin/sms/hooks/use-sms';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
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
  const t = useTranslations();
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
      toast.error(t('admin.support.toast.required', 'Subject and description are required'));
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
        onSuccess: (created) => {
          toast.success(t('admin.support.toast.created', 'Support ticket #{id} created', { id: created.id }));
          closeCreate();
        },
      },
    );
  };

  const columns = useMemo<LegacyColumnDef<StaffTicket, unknown>[]>(
    () => [
      {
        accessorKey: 'id',
        header: t('admin.support.col.id', 'Ticket ID'),
        size: 100,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="font-mono text-xs font-semibold">
              #{row.original.id}
            </Badge>
            {!row.original.viewed && <span className="h-2 w-2 rounded-full bg-primary" title={t('admin.support.col.unread', 'Unread')} />}
          </div>
        ),
      },
      {
        accessorKey: 'subject',
        header: t('admin.support.col.subject', 'Subject & Description'),
        size: 260,
        enableHiding: false,
        cell: ({ row }) => (
          <div>
            <span className="font-semibold text-xs text-foreground block truncate max-w-sm">{row.original.subject}</span>
            <span className="text-xs text-muted-foreground line-clamp-1 font-sans">{row.original.preview || t('admin.support.col.noDescription', 'No description')}</span>
          </div>
        ),
      },
      {
        accessorKey: 'customerName',
        header: t('admin.support.col.openedBy', 'Opened By'),
        size: 170,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs">
              {row.original.customerName.charAt(0)}
            </div>
            <div>
              <span className="font-medium text-xs text-foreground block">{row.original.customerName}</span>
              {row.original.customerMobile && <span className="text-xs font-mono text-muted-foreground">{row.original.customerMobile}</span>}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'priority',
        header: t('admin.support.col.priority', 'Priority'),
        size: 100,
        cell: ({ row }) => (
          <Badge variant={priorityVariant(row.original.priority)} className="text-xs font-mono capitalize">
            {t(`admin.support.priority.${row.original.priority}`, row.original.priority)}
          </Badge>
        ),
      },
      {
        accessorKey: 'status',
        header: t('admin.support.col.status', 'Status'),
        size: 110,
        cell: ({ row }) => {
          const s = row.original.status;
          return (
            <Badge variant={statusVariant(s)} tone={s === 'opened' ? 'success' : undefined} className="text-xs font-mono">
              {t(`admin.support.status.${s}`, TICKET_STATUS_LABEL[s])}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'lastActivityAt',
        header: t('admin.support.col.lastActivity', 'Last Activity'),
        size: 130,
        cell: ({ row }) => (
          <span className="text-xs font-mono text-muted-foreground">{row.original.lastActivityAt ? formatDate(row.original.lastActivityAt) : '—'}</span>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">{t('admin.support.col.action', 'Action')}</span>,
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
                {t('admin.support.col.open', 'Open')}
              </Link>
            </Can>
          </div>
        ),
      },
    ],
    [t],
  );

  const statusItems = {
    all: t('admin.support.filter.allStatuses', 'All statuses'),
    opened: t('admin.support.status.opened', 'Open'),
    processing: t('admin.support.status.processing', 'In progress'),
    closed: t('admin.support.status.closed', 'Closed'),
  };
  const priorityItems = {
    all: t('admin.support.filter.allPriorities', 'All priorities'),
    high: t('admin.support.priority.high', 'High'),
    medium: t('admin.support.priority.medium', 'Medium'),
    low: t('admin.support.priority.low', 'Low'),
  };
  const ticketPriorityItems = {
    low: priorityItems.low,
    medium: priorityItems.medium,
    high: priorityItems.high,
  };
  const categoryItems = Object.fromEntries(
    TICKET_CATEGORIES.map((c) => [c.value, t(`admin.support.category.${c.value}`, c.label)]),
  );

  if (tickets.isLoading) return <PageSkeleton variant="table" />;
  if (tickets.isError && !tickets.data) {
    return (
      <EmptyState variant="error"
        title={t('admin.support.error.title', 'Failed to load tickets')}
        description={errorMessage(tickets.error, t('admin.support.error.fallback', 'Could not fetch support tickets.'))}
        actionLabel={t('common.retry', 'Retry')}
        onAction={() => tickets.refetch()}
      />
    );
  }

  const stats = tickets.data?.stats;
  const avg = stats?.avgFirstResponseHours;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.support.title', 'Support Tickets Desk')}
        subtitle={t('admin.support.subtitle', 'Customer support inquiries assigned to your team, with response-time tracking')}
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Engagement' },
          { label: 'Support Tickets' },
        ]}
        actions={
          <Button className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setCreateModalOpen(true)}>
            <Plus className="h-4 w-4" />
            {t('admin.support.create', 'Create Ticket')}
          </Button>
        }
      />

      <OpsSummaryStrip
        items={[
          { label: t('admin.support.summary.open', 'Open'), value: t('admin.support.summary.active', '{n} Active', { n: stats?.opened ?? 0 }) },
          {
            label: t('admin.support.summary.inProgress', 'In Progress'),
            value: t('admin.support.summary.tickets', '{n} Tickets', { n: stats?.processing ?? 0 }),
          },
          {
            label: t('admin.support.summary.resolved', 'Resolved'),
            value: t('admin.support.summary.closedCount', '{n} Closed', { n: stats?.closed ?? 0 }),
          },
          { label: t('admin.support.summary.unread', 'Unread'), value: stats?.unread ?? 0 },
          {
            label: t('admin.support.summary.avgFirstResponse', 'Avg First Response'),
            value:
              avg === null || avg === undefined
                ? '—'
                : t('admin.support.summary.avgValue', '{hours}h (last {n} answered)', { hours: avg, n: stats?.respondedSample ?? 0 }),
          },
        ]}
      />

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <LifeBuoy className="h-4 w-4 text-primary" />
                {t('admin.support.list.title', 'Customer Support Inquiries')}
              </CardTitle>
              <CardDescription>{t('admin.support.list.subtitle', 'Tickets you opened or that are assigned to you')}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={status} items={statusItems} onValueChange={(v) => { if (v) { setStatus(v); setPage(1); } }}>
                <SelectTrigger aria-label="Filter by status" className="h-9 w-[130px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusItems).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={priority} items={priorityItems} onValueChange={(v) => { if (v) { setPriority(v); setPage(1); } }}>
                <SelectTrigger aria-label="Filter by priority" className="h-9 w-[130px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(priorityItems).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable urlState
            columns={columns}
            data={tickets.data?.items ?? []}
            getRowId={(row) => row.id}
            searchKey="subject"
            searchPlaceholder={t('admin.support.list.search', 'Search by subject, customer, phone or #ID...')}
            emptyTitle={t('admin.support.list.emptyTitle', 'No tickets found')}
            emptyDescription={t('admin.support.list.emptyDescription', 'Try adjusting your search or filters.')}
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
                {t('admin.support.new', 'New Ticket')}
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
              {t('admin.support.dialog.title', 'Open Support Ticket')}
            </DialogTitle>
            <DialogDescription>
              {t('admin.support.dialog.description', "Open a ticket on a customer's behalf, or an internal ticket for your team.")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">{t('admin.support.dialog.customer', 'Customer (optional)')}</Label>
              {customer ? (
                <div className="flex items-center justify-between rounded-md border border-border/70 px-3 py-2">
                  <span>
                    <span className="font-semibold">{customer.name}</span>{' '}
                    <span className="font-mono text-muted-foreground">({customer.mobile || t('admin.support.dialog.noMobile', 'no mobile')})</span>
                  </span>
                  <Button type="button" variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setCustomer(null)}>
                    {t('admin.support.dialog.change', 'Change')}
                  </Button>
                </div>
              ) : (
                <>
                  <Input
                    value={customerQuery}
                    onChange={(e) => setCustomerQuery(e.target.value)}
                    placeholder={t('admin.support.dialog.customerSearch', 'Search customer by name or phone (leave empty for internal)')}
                    className="text-xs"
                  />
                  {debouncedCustomerQuery.trim().length > 1 && (
                    <div className="max-h-40 overflow-y-auto rounded-md border border-border/60 divide-y divide-border/40">
                      {customerResults.isFetching && !customerResults.data ? (
                        <p className="p-2 text-xs text-muted-foreground">{t('admin.support.dialog.searching', 'Searching…')}</p>
                      ) : (customerResults.data?.items ?? []).length === 0 ? (
                        <p className="p-2 text-xs text-muted-foreground">{t('admin.support.dialog.noCustomers', 'No customers found.')}</p>
                      ) : (
                        (customerResults.data?.items ?? []).map((c) => (
                          <button key={c.id} type="button" onClick={() => setCustomer(c)} className="w-full text-left px-3 py-2 hover:bg-muted/50">
                            <span className="font-semibold">{c.name}</span> <span className="font-mono text-muted-foreground">({c.mobile || t('admin.support.dialog.noMobile', 'no mobile')})</span>
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
                <Label htmlFor="priority" className="text-xs font-semibold">{t('admin.support.dialog.priority', 'Priority Level')}</Label>
                <Select value={newTicket.priority} items={ticketPriorityItems} onValueChange={(v) => { if (v) setNewTicket({ ...newTicket, priority: v as TicketPriority }); }}>
                  <SelectTrigger id="priority" className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ticketPriorityItems).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-xs font-semibold">{t('admin.support.dialog.category', 'Category')}</Label>
                <Select value={newTicket.category} items={categoryItems} onValueChange={(v) => { if (v) setNewTicket({ ...newTicket, category: v }); }}>
                  <SelectTrigger id="category" className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TICKET_CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {categoryItems[c.value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject" className="text-xs font-semibold">{t('admin.support.dialog.subject', 'Issue Subject')}</Label>
              <Input id="subject" value={newTicket.subject} maxLength={190} onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })} placeholder={t('admin.support.dialog.subjectPlaceholder', 'Short summary of the problem')} className="text-xs" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="body" className="text-xs font-semibold">{t('admin.support.dialog.body', 'Detailed Description')}</Label>
              <Textarea id="body"
                value={newTicket.description}
                onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                placeholder={t('admin.support.dialog.bodyPlaceholder', 'Describe the problem, link status or error message...')}
                className="h-20 text-xs font-mono resize-y"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeCreate}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button onClick={handleCreateTicket} disabled={createTicket.isPending} className="gap-1.5 bg-primary text-primary-foreground">
              <CheckCircle2 className="h-4 w-4" />
              {createTicket.isPending ? t('admin.support.dialog.opening', 'Opening…') : t('admin.support.dialog.submit', 'Open Ticket')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
