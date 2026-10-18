'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { OpsSummaryStrip } from '@/components/shared/OpsSummaryStrip';
import { DataTable } from '@/features/shared/data-table';
import { saveBlob } from '@/lib/api/client';
import { cn } from '@/lib/utils';
import { formatBdtWithSymbol } from '@/lib/format';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { toast } from 'sonner';
import {
  FileText,
  Plus,
  Eye,
  CheckCircle2,
  Clock,
  Download,
  ShieldCheck,
  Pencil,
  Trash2,
  Paperclip,
  XCircle,
} from 'lucide-react';
import { BillingCustomerPicker } from '../components/BillingCustomerPicker';
import {
  fmtDay,
  todayYmd,
  useContractMutations,
  useContracts,
  useContractSummary,
  type BillingCustomerOption,
  type Contract,
  type ContractStatus,
} from '../hooks/use-billing-config';

const STATUS_LABEL: Record<ContractStatus, string> = {
  active: 'Active',
  expired: 'Expired',
  terminated: 'Terminated',
};
const ALL = '__all__';
const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
const ATTACHMENT_ACCEPT = '.pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg';

export function ContractsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [expiringOnly, setExpiringOnly] = useState(false);

  const summary = useContractSummary();
  const expiringWithin = summary.data?.expiringWithin ?? 0;
  const list = useContracts({ page, perPage: pageSize, search, status, expiringOnly, expiringWithin: expiringOnly ? expiringWithin : 0 });
  const { remove, download } = useContractMutations();

  const [formTarget, setFormTarget] = useState<Contract | 'new' | null>(null);
  const [viewContract, setViewContract] = useState<Contract | null>(null);
  const [deleting, setDeleting] = useState<Contract | null>(null);

  const statuses = useMemo(() => summary.data?.statuses ?? [], [summary.data?.statuses]);
  const statusItems = useMemo(
    () => ({ [ALL]: 'All statuses', ...Object.fromEntries(statuses.map((s) => [s, STATUS_LABEL[s] ?? s])) }),
    [statuses],
  );

  const handleDownload = (c: Contract) =>
    download.mutate(c.id, {
      onSuccess: ({ blob, filename }) => saveBlob(blob, filename ?? c.attachmentName ?? `contract-${c.id}`),
    });

  const columns = useMemo<LegacyColumnDef<Contract, unknown>[]>(
    () => [
      {
        accessorKey: 'customerName',
        header: 'Customer',
        size: 200,
        enableHiding: false,
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <span className="font-semibold text-xs text-foreground block">{row.original.customerName ?? `Customer #${row.original.customerId}`}</span>
              <span className="text-[10px] text-muted-foreground font-mono">Contract #{row.original.id}</span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'title',
        header: 'Agreement & SLA',
        size: 240,
        enableSorting: false,
        cell: ({ row }) => (
          <div>
            <span className="font-medium text-xs text-foreground block">{row.original.title}</span>
            {row.original.slaNotes && (
              <span className="text-[10px] text-muted-foreground line-clamp-1">{row.original.slaNotes}</span>
            )}
          </div>
        ),
      },
      {
        id: 'period',
        header: 'Term',
        size: 170,
        enableSorting: false,
        cell: ({ row }) => {
          const c = row.original;
          const soon = c.status === 'active' && c.daysToEnd !== null && c.daysToEnd >= 0 && c.daysToEnd <= expiringWithin;
          return (
            <div className="font-mono text-xs text-muted-foreground">
              <span>{fmtDay(c.startDate)}</span>
              <span> → </span>
              <span className={cn(soon && 'text-amber-600 dark:text-amber-400 font-semibold')}>{c.endDate ? fmtDay(c.endDate) : 'Open-ended'}</span>
              {soon && <span className="block text-[10px] text-amber-600 dark:text-amber-400">Ends in {c.daysToEnd} days</span>}
            </div>
          );
        },
      },
      {
        accessorKey: 'monthlyValue',
        header: 'Monthly Value',
        size: 120,
        enableSorting: false,
        cell: ({ row }) => <span className="font-mono text-xs font-semibold tabular-nums">{formatBdtWithSymbol(row.original.monthlyValue)}</span>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 120,
        enableSorting: false,
        cell: ({ row }) => {
          const s = row.original.status;
          return (
            <Badge
              variant={s === 'active' ? 'default' : 'secondary'}
              className={cn('capitalize text-[10px] font-mono gap-1', s === 'active' && 'bg-emerald-600 hover:bg-emerald-600 text-white')}
            >
              {s === 'active' ? <CheckCircle2 className="h-3 w-3" /> : s === 'expired' ? <Clock className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
              {STATUS_LABEL[s]}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        size: 150,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-primary hover:bg-primary/10" onClick={() => setViewContract(row.original)}>
              <Eye className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">View</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" aria-label="Edit contract" onClick={() => setFormTarget(row.original)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" aria-label="Delete contract" onClick={() => setDeleting(row.original)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [expiringWithin],
  );

  if (summary.isLoading) return <PageSkeleton variant="table" />;
  if (summary.isError || list.isError) {
    return (
      <EmptyState
        title="Failed to load contracts"
        description={errorMessage(summary.error ?? list.error)}
        actionLabel="Retry"
        onAction={() => {
          summary.refetch();
          list.refetch();
        }}
      />
    );
  }

  const s = summary.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contracts & SLAs"
        subtitle="Customer service agreements: term, monthly value, SLA terms and the signed document."
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Engagement' },
          { label: 'Contracts' },
        ]}
        actions={
          <Button className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setFormTarget('new')}>
            <Plus className="h-4 w-4" />
            Create Contract
          </Button>
        }
      />

      {s && (
        <OpsSummaryStrip
          items={[
            { label: 'contracts', value: s.total },
            { label: 'active', value: s.active },
            { label: `ending within ${s.expiringWithin} days`, value: s.expiringSoon },
            ...(s.pastEndDate > 0 ? [{ label: 'active past end date', value: s.pastEndDate }] : []),
            { label: 'expired', value: s.expired },
            { label: 'terminated', value: s.terminated },
            { label: 'active monthly value', value: formatBdtWithSymbol(s.activeMonthlyValue) },
          ]}
        />
      )}

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Customer Agreements
          </CardTitle>
          <CardDescription>Search by customer, mobile or agreement title</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={list.data?.items ?? []}
            isLoading={list.isLoading && !list.data}
            emptyTitle="No contracts found"
            emptyDescription={search || status !== 'all' || expiringOnly ? 'Try clearing the filters.' : 'Create the first contract.'}
            searchPlaceholder="Search agreements by customer or title…"
            getRowId={(r) => String(r.id)}
            server={{
              page,
              pageSize,
              total: list.data?.meta.total ?? 0,
              onPageChange: setPage,
              onPageSizeChange: (n) => {
                setPageSize(n);
                setPage(1);
              },
              search,
              onSearchChange: (v) => {
                setSearch(v);
                setPage(1);
              },
            }}
            toolbarActions={
              <div className="flex items-center gap-2">
                <Select
                  items={statusItems}
                  value={status === 'all' ? ALL : status}
                  onValueChange={(v) => {
                    setStatus(!v || v === ALL ? 'all' : String(v));
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="h-8 w-[140px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>All statuses</SelectItem>
                    {statuses.map((st) => (
                      <SelectItem key={st} value={st}>
                        {STATUS_LABEL[st] ?? st}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  variant={expiringOnly ? 'default' : 'outline'}
                  className="h-8 text-xs gap-1"
                  onClick={() => {
                    setExpiringOnly((v) => !v);
                    setPage(1);
                  }}
                >
                  <Clock className="h-3.5 w-3.5" />
                  Expiring soon
                </Button>
              </div>
            }
          />
        </CardContent>
      </Card>

      {/* Create / edit */}
      <Dialog open={formTarget !== null} onOpenChange={(open) => !open && setFormTarget(null)}>
        <DialogContent className="sm:max-w-lg">
          {formTarget !== null && (
            <ContractForm
              key={formTarget === 'new' ? 'new' : formTarget.id}
              target={formTarget}
              statuses={statuses}
              onDone={() => setFormTarget(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View */}
      <Dialog open={!!viewContract} onOpenChange={(open) => !open && setViewContract(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Contract #{viewContract?.id}
            </DialogTitle>
            <DialogDescription>{viewContract?.title}</DialogDescription>
          </DialogHeader>
          {viewContract && (
            <div className="space-y-3 py-2 text-xs">
              <div className="p-4 bg-muted/20 border border-border/50 rounded-lg space-y-2">
                {(
                  [
                    ['Customer', viewContract.customerName ?? `#${viewContract.customerId}`],
                    ['Mobile', viewContract.customerMobile ?? '—'],
                    ['Term', `${fmtDay(viewContract.startDate)} → ${viewContract.endDate ? fmtDay(viewContract.endDate) : 'Open-ended'}`],
                    ['Monthly value', formatBdtWithSymbol(viewContract.monthlyValue)],
                    ['Status', STATUS_LABEL[viewContract.status]],
                    ['Created by', viewContract.createdByName ?? '—'],
                  ] as const
                ).map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-3 border-b border-border/40 pb-2 last:border-0 last:pb-0">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-semibold text-foreground text-right">{value}</span>
                  </div>
                ))}
              </div>
              {viewContract.slaNotes && (
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold text-muted-foreground">SLA notes</p>
                  <p className="whitespace-pre-wrap text-foreground leading-relaxed">{viewContract.slaNotes}</p>
                </div>
              )}
              <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Paperclip className="h-3.5 w-3.5" />
                {viewContract.hasAttachment ? viewContract.attachmentName ?? 'Attachment' : 'No document attached'}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewContract(null)}>
              Close
            </Button>
            {viewContract?.hasAttachment && (
              <Button className="gap-1.5 bg-primary text-primary-foreground" disabled={download.isPending} onClick={() => handleDownload(viewContract)}>
                <Download className="h-4 w-4" />
                {download.isPending ? 'Downloading…' : 'Download Document'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete this contract?"
        description={deleting ? `Contract #${deleting.id} "${deleting.title}" and its attached document are removed.` : undefined}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (!deleting) return;
          const target = deleting;
          remove.mutate(target.id, {
            onSuccess: () => {
              toast.success(`Contract #${target.id} deleted`);
              setDeleting(null);
            },
          });
        }}
      />
    </div>
  );
}

function ContractForm({
  target,
  statuses,
  onDone,
}: {
  target: Contract | 'new';
  statuses: ContractStatus[];
  onDone: () => void;
}) {
  const isNew = target === 'new';
  const { create, update } = useContractMutations();
  const [customer, setCustomer] = useState<BillingCustomerOption | null>(null);
  const [title, setTitle] = useState(isNew ? '' : target.title);
  const [startDate, setStartDate] = useState(isNew ? todayYmd() : target.startDate);
  const [endDate, setEndDate] = useState(isNew ? '' : (target.endDate ?? ''));
  const [monthlyValue, setMonthlyValue] = useState(isNew ? '' : String(target.monthlyValue));
  const [status, setStatus] = useState<ContractStatus>(isNew ? 'active' : target.status);
  const [slaNotes, setSlaNotes] = useState(isNew ? '' : (target.slaNotes ?? ''));
  const [file, setFile] = useState<File | null>(null);
  const pending = create.isPending || update.isPending;
  const statusItems = useMemo(() => Object.fromEntries(statuses.map((s) => [s, STATUS_LABEL[s] ?? s])), [statuses]);

  const pickFile = (f: File | null) => {
    if (f && f.size > MAX_ATTACHMENT_BYTES) {
      toast.error('The attachment must be at most 5 MB');
      return;
    }
    if (f && !/\.(pdf|png|jpe?g)$/i.test(f.name)) {
      toast.error('Attach a PDF, PNG or JPG file');
      return;
    }
    setFile(f);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const values = { title, startDate, endDate, monthlyValue: Number(monthlyValue || 0), slaNotes, status, file };
    if (isNew) {
      if (!customer) {
        toast.error('Choose a customer');
        return;
      }
      create.mutate(
        { ...values, customerId: customer.id },
        {
          onSuccess: (c) => {
            toast.success(`Contract #${c.id} created`);
            onDone();
          },
        },
      );
      return;
    }
    update.mutate(
      { ...values, id: target.id },
      {
        onSuccess: (c) => {
          toast.success(`Contract #${c.id} updated`);
          onDone();
        },
      },
    );
  };

  return (
    <form onSubmit={submit}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          {isNew ? 'New Contract' : `Edit Contract #${target.id}`}
        </DialogTitle>
        <DialogDescription>{isNew ? 'Record a service agreement with a customer.' : (target.customerName ?? '')}</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4 text-xs">
        {isNew && (
          <div className="space-y-2">
            <Label htmlFor="ct-customer" className="text-xs font-semibold">Customer *</Label>
            <BillingCustomerPicker id="ct-customer" value={customer} onChange={setCustomer} />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="ct-title" className="text-xs font-semibold">Title *</Label>
          <Input id="ct-title" required maxLength={150} value={title} onChange={(e) => setTitle(e.target.value)} className="text-xs" placeholder="e.g. Dedicated line SLA" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="ct-start" className="text-xs font-semibold">Start Date *</Label>
            <Input id="ct-start" type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className="text-xs font-mono" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ct-end" className="text-xs font-semibold">End Date</Label>
            <Input id="ct-end" type="date" min={startDate || undefined} value={endDate} onChange={(e) => setEndDate(e.target.value)} className="text-xs font-mono" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="ct-value" className="text-xs font-semibold">Monthly Value (৳)</Label>
            <Input
              id="ct-value"
              type="number"
              min={0}
              step="0.01"
              value={monthlyValue}
              onChange={(e) => setMonthlyValue(e.target.value)}
              className="text-xs font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ct-status" className="text-xs font-semibold">Status</Label>
            <Select items={statusItems} value={status} onValueChange={(v) => v && setStatus(v as ContractStatus)}>
              <SelectTrigger id="ct-status" className="text-xs w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((st) => (
                  <SelectItem key={st} value={st}>
                    {STATUS_LABEL[st] ?? st}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ct-sla" className="text-xs font-semibold">SLA Notes</Label>
          <Textarea id="ct-sla" maxLength={2000} value={slaNotes} onChange={(e) => setSlaNotes(e.target.value)} className="text-xs min-h-16" placeholder="Uptime, response time, penalties…" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ct-file" className="text-xs font-semibold">
            {!isNew && target.hasAttachment ? 'Replace Document' : 'Document'} (PDF, PNG or JPG, max 5 MB)
          </Label>
          <Input
            id="ct-file"
            type="file"
            accept={ATTACHMENT_ACCEPT}
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
            className="text-xs"
          />
          {!isNew && target.hasAttachment && !file && (
            <p className="text-[11px] text-muted-foreground">Current: {target.attachmentName ?? 'attached document'}</p>
          )}
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={pending} className="gap-1.5 bg-primary text-primary-foreground">
          <CheckCircle2 className="h-4 w-4" />
          {pending ? 'Saving…' : isNew ? 'Create Contract' : 'Save Changes'}
        </Button>
      </DialogFooter>
    </form>
  );
}
