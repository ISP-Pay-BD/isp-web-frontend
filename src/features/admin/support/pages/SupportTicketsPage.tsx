'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import {
  Eye,
  LifeBuoy,
  Plus,
  AlertCircle,
  Clock,
  CheckCircle2,
  Phone,
  User,
  Zap,
} from 'lucide-react';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useSupportTickets } from '../hooks/use-support';
import type { SupportTicket } from '@/data/shared/types';

const statusVariant = (status: string) => {
  if (status === 'open') return 'default' as const;
  if (status === 'pending') return 'secondary' as const;
  return 'outline' as const;
};

const priorityVariant = (priority: string) => {
  if (priority === 'high' || priority === 'urgent') return 'destructive' as const;
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
    t.id.toLowerCase().includes(q) ||
    t.priority.toLowerCase().includes(q) ||
    t.status.toLowerCase().includes(q)
  );
};

export function SupportTicketsPage() {
  const { data, isLoading, isError, refetch } = useSupportTickets();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({
    customerName: '',
    subject: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    description: '',
  });

  useMemo(() => {
    if (data?.tickets && tickets.length === 0) {
      setTickets(data.tickets);
    }
  }, [data?.tickets, tickets.length]);

  const list = tickets.length > 0 ? tickets : (data?.tickets ?? []);

  const handleCreateTicket = () => {
    if (!newTicket.customerName.trim() || !newTicket.subject.trim()) {
      toast.error('Customer name and subject are required');
      return;
    }
    const created: SupportTicket = {
      id: `TICK-${Date.now().toString().slice(-4)}`,
      customerId: 'cust_new',
      customerName: newTicket.customerName.trim(),
      subject: newTicket.subject.trim(),
      priority: newTicket.priority,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: `msg_${Date.now()}`,
          sender: 'customer',
          senderName: newTicket.customerName.trim(),
          body: newTicket.description || 'Support assistance requested',
          sentAt: new Date().toISOString(),
        },
      ],
    };

    setTickets((prev) => [created, ...prev]);
    toast.success(`Support Ticket #${created.id} created successfully!`);
    setCreateModalOpen(false);
    setNewTicket({
      customerName: '',
      subject: '',
      priority: 'medium',
      description: '',
    });
  };

  const columns = useMemo<LegacyColumnDef<SupportTicket, unknown>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'Ticket ID',
        size: 110,
        enableHiding: false,
        cell: ({ row }) => (
          <Badge variant="outline" className="font-mono text-xs font-semibold">
            {row.original.id}
          </Badge>
        ),
      },
      {
        accessorKey: 'subject',
        header: 'Subject & Description',
        size: 260,
        enableHiding: false,
        cell: ({ row }) => (
          <div>
            <span className="font-semibold text-xs text-foreground block truncate max-w-sm">
              {row.original.subject}
            </span>
            <span className="text-[10px] text-muted-foreground line-clamp-1 font-sans">
              {row.original.messages?.[0]?.body ?? 'No description'}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'customerName',
        header: 'Subscriber Customer',
        size: 170,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-[10px]">
              {row.original.customerName.charAt(0)}
            </div>
            <span className="font-medium text-xs text-foreground">{row.original.customerName}</span>
          </div>
        ),
      },
      {
        accessorKey: 'priority',
        header: 'Priority',
        size: 110,
        cell: ({ row }) => {
          const p = row.original.priority;
          return (
            <Badge
              variant={priorityVariant(p)}
              className={`text-[10px] font-mono capitalize ${
                p === 'high' ? 'bg-destructive text-destructive-foreground animate-pulse' : ''
              }`}
            >
              {p}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 110,
        cell: ({ row }) => {
          const s = row.original.status;
          return (
            <Badge
              variant={statusVariant(s)}
              className={`text-[10px] font-mono capitalize ${
                s === 'open' ? 'bg-emerald-600 hover:bg-emerald-600 text-white' : ''
              }`}
            >
              {s}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'updatedAt',
        header: 'Last Updated',
        size: 130,
        cell: ({ row }) => (
          <span className="text-xs font-mono text-muted-foreground">{formatDate(row.original.updatedAt)}</span>
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
                Inspect
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

  const openTickets = list.filter((t) => t.status === 'open').length;
  const pendingTickets = list.filter((t) => t.status === 'pending').length;
  const closedTickets = list.filter((t) => t.status === 'closed').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support Tickets Desk"
        subtitle="Manage customer support inquiries, fiber fault dispatches, and SLA response tracking"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Engagement' },
          { label: 'Support Tickets' },
        ]}
        actions={
          <Button
            className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setCreateModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Create Ticket
          </Button>
        }
      />

      <OpsSummaryStrip
        items={[
          { label: 'Open Inquiries', value: `${openTickets} Active` },
          { label: 'Pending Lineman Review', value: `${pendingTickets} Tickets` },
          { label: 'Resolved Tickets', value: `${closedTickets} Closed` },
          { label: 'Average Response Time', value: `${data.stats.avgResponseHours}h (< 45m SLA)` },
          { label: 'SLA Compliance', value: '98.4% On-Time' },
        ]}
      />

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <LifeBuoy className="h-4 w-4 text-primary" />
                Customer Support Inquiries
              </CardTitle>
              <CardDescription>
                Live ticket pipeline tracked by priority, department, and resolution deadline
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={list}
            getRowId={(row) => row.id}
            searchKey="subject"
            searchPlaceholder="Search tickets by subject, customer or ID..."
            searchFilterFn={ticketSearchFilter}
            facetFilters={[
              { columnId: 'status', title: 'Status' },
              { columnId: 'priority', title: 'Priority' },
            ]}
            emptyTitle="No tickets found"
            emptyDescription="Try adjusting your search or filters."
            toolbarActions={
              <Button size="sm" onClick={() => setCreateModalOpen(true)} className="gap-1.5">
                <Plus className="h-4 w-4" />
                New Ticket
              </Button>
            }
          />
        </CardContent>
      </Card>

      {/* Create Support Ticket Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LifeBuoy className="h-5 w-5 text-primary" />
              Open Support Ticket
            </DialogTitle>
            <DialogDescription>
              Create a new customer inquiry or field dispatch job ticket.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Subscriber Name / Username</Label>
              <Input
                value={newTicket.customerName}
                onChange={(e) => setNewTicket({ ...newTicket, customerName: e.target.value })}
                placeholder="e.g. Rahim Uddin (017xxxxxxxx)"
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Priority Level</Label>
                <Select
                  value={newTicket.priority}
                  onValueChange={(v) => { if (v) setNewTicket({ ...newTicket, priority: v as any }); }}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low (General Query)</SelectItem>
                    <SelectItem value="medium">Medium (Speed / Billing)</SelectItem>
                    <SelectItem value="high">High / Urgent (Red LOS / Outage)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Category</Label>
                <Select defaultValue="optical">
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="optical">Optical Fiber Fault</SelectItem>
                    <SelectItem value="billing">Billing & Recharge</SelectItem>
                    <SelectItem value="router">Router / Wi-Fi Config</SelectItem>
                    <SelectItem value="speed">Speed Degradation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Issue Subject</Label>
              <Input
                value={newTicket.subject}
                onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                placeholder="e.g. Red light blinking on ONU after power storm"
                className="text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Detailed Description</Label>
              <Textarea
                value={newTicket.description}
                onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                placeholder="Enter customer problem description, fiber link status or error message..."
                className="h-20 text-xs font-mono resize-y"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTicket} className="gap-1.5 bg-primary text-primary-foreground">
              <CheckCircle2 className="h-4 w-4" />
              Open Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
