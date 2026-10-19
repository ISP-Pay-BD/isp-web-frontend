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
import { formatBdtWithSymbol, formatCount } from '@/lib/format';
import { useTranslations } from '@/i18n/locale-context';
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

type Translate = ReturnType<typeof useTranslations>;

function statusLabel(t: Translate, status: ContractStatus): string {
  if (status === 'active') return t('status.active', 'Active');
  if (status === 'expired') return t('status.expired', 'Expired');
  if (status === 'terminated') return t('admin.ops.contracts.statusTerminated', 'Terminated');
  return status;
}

const ALL = '__all__';
const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;
const ATTACHMENT_ACCEPT = '.pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg';

export function ContractsPage() {
  const t = useTranslations();
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
    () => ({ [ALL]: t('admin.ops.contracts.allStatuses', 'All statuses'), ...Object.fromEntries(statuses.map((s) => [s, statusLabel(t, s)])) }),
    [statuses, t],
  );

  const handleDownload = (c: Contract) =>
    download.mutate(c.id, {
      onSuccess: ({ blob, filename }) => saveBlob(blob, filename ?? c.attachmentName ?? `contract-${c.id}`),
    });

  const columns = useMemo<LegacyColumnDef<Contract, unknown>[]>(
    () => [
      {
        accessorKey: 'customerName',
        header: t('admin.ops.contracts.colCustomer', 'Customer'),
        size: 200,
        enableHiding: false,
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <span className="font-semibold text-xs text-foreground block">{row.original.customerName ?? t('admin.ops.contracts.customerN', 'Customer #{id}', { id: row.original.customerId })}</span>
              <span className="text-xs text-muted-foreground font-mono">{t('admin.ops.contracts.contractN', 'Contract #{id}', { id: row.original.id })}</span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'title',
        header: t('admin.ops.contracts.colAgreement', 'Agreement & SLA'),
        size: 240,
        enableSorting: false,
        cell: ({ row }) => (
          <div>
            <span className="font-medium text-xs text-foreground block">{row.original.title}</span>
            {row.original.slaNotes && (
              <span className="text-xs text-muted-foreground line-clamp-1">{row.original.slaNotes}</span>
            )}
          </div>
        ),
      },
      {
        id: 'period',
        header: t('admin.ops.contracts.colTerm', 'Term'),
        size: 170,
        enableSorting: false,
        cell: ({ row }) => {
          const c = row.original;
          const soon = c.status === 'active' && c.daysToEnd !== null && c.daysToEnd >= 0 && c.daysToEnd <= expiringWithin;
          return (
            <div className="font-mono text-xs text-muted-foreground">
              <span>{fmtDay(c.startDate)}</span>
              <span> → </span>
              <span className={cn(soon && 'text-amber-600 dark:text-amber-400 font-semibold')}>{c.endDate ? fmtDay(c.endDate) : t('admin.ops.contracts.openEnded', 'Open-ended')}</span>
              {soon && <span className="block text-xs text-amber-600 dark:text-amber-400">{t('admin.ops.contracts.endsIn', 'Ends in {days} days', { days: c.daysToEnd ?? 0 })}</span>}
            </div>
          );
        },
      },
      {
        accessorKey: 'monthlyValue',
        header: t('admin.ops.contracts.colMonthly', 'Monthly Value'),
        size: 120,
        enableSorting: false,
        cell: ({ row }) => <span className="font-mono text-xs font-semibold tabular-nums">{formatBdtWithSymbol(row.original.monthlyValue)}</span>,
      },
      {
        accessorKey: 'status',
        header: t('admin.ops.contracts.colStatus', 'Status'),
        size: 120,
        enableSorting: false,
        cell: ({ row }) => {
          const s = row.original.status;
          return (
            <Badge
              variant={s === 'active' ? 'default' : 'secondary'}
              tone={s === 'active' ? 'success' : undefined} className="capitalize text-xs font-mono gap-1"
            >
              {s === 'active' ? <CheckCircle2 className="h-3 w-3" /> : s === 'expired' ? <Clock className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
              {statusLabel(t, s)}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">{t('common.actions', 'Actions')}</span>,
        size: 150,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 text-primary hover:bg-primary/10" onClick={() => setViewContract(row.original)}>
              <Eye className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t('admin.ops.contracts.view', 'View')}</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" aria-label={t('admin.ops.contracts.editAria', 'Edit contract')} onClick={() => setFormTarget(row.original)}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" aria-label={t('admin.ops.contracts.deleteAria', 'Delete contract')} onClick={() => setDeleting(row.original)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [expiringWithin, t],
  );

  if (summary.isLoading) return <PageSkeleton variant="table" />;
  if (summary.isError || list.isError) {
    return (
      <EmptyState variant="error"
        title={t('admin.ops.contracts.loadFailed', 'Failed to load contracts')}
        description={errorMessage(summary.error ?? list.error)}
        actionLabel={t('common.retry', 'Retry')}
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
        title={t('admin.ops.contracts.title', 'Contracts & SLAs')}
        subtitle={t('admin.ops.contracts.subtitle', 'Customer service agreements: term, monthly value, SLA terms and the signed document.')}
        breadcrumb={[
          { label: t('common.crumb.dashboard', 'Dashboard'), url: '/admin/dashboard' },
          { label: t('common.crumb.engagement', 'Engagement') },
          { label: t('admin.ops.contracts.crumb', 'Contracts') },
        ]}
        actions={
          <Button className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setFormTarget('new')}>
            <Plus className="h-4 w-4" />
            {t('admin.ops.contracts.create', 'Create Contract')}
          </Button>
        }
      />

      {s && (
        <OpsSummaryStrip
          items={[
            { label: t('admin.ops.contracts.sumContracts', 'contracts'), value: formatCount(s.total) },
            { label: t('admin.ops.contracts.sumActive', 'active'), value: formatCount(s.active) },
            { label: t('admin.ops.contracts.sumEnding', 'ending within {days} days', { days: s.expiringWithin }), value: formatCount(s.expiringSoon) },
            ...(s.pastEndDate > 0 ? [{ label: t('admin.ops.contracts.sumPastEnd', 'active past end date'), value: formatCount(s.pastEndDate) }] : []),
            { label: t('admin.ops.contracts.sumExpired', 'expired'), value: formatCount(s.expired) },
            { label: t('admin.ops.contracts.sumTerminated', 'terminated'), value: formatCount(s.terminated) },
            { label: t('admin.ops.contracts.sumMonthly', 'active monthly value'), value: formatBdtWithSymbol(s.activeMonthlyValue) },
          ]}
        />
      )}

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            {t('admin.ops.contracts.cardTitle', 'Customer Agreements')}
          </CardTitle>
          <CardDescription>{t('admin.ops.contracts.cardDesc', 'Search by customer, mobile or agreement title')}</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable urlState
            columns={columns}
            data={list.data?.items ?? []}
            isLoading={list.isLoading && !list.data}
            emptyTitle={t('admin.ops.contracts.emptyTitle', 'No contracts found')}
            emptyDescription={
              search || status !== 'all' || expiringOnly
                ? t('admin.ops.contracts.emptyFiltered', 'Try clearing the filters.')
                : t('admin.ops.contracts.emptyNone', 'Create the first contract.')
            }
            searchPlaceholder={t('admin.ops.contracts.searchPlaceholder', 'Search agreements by customer or title…')}
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
                  <SelectTrigger aria-label={t('admin.ops.contracts.filterStatus', 'Filter by status')} className="h-8 min-w-[140px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>{t('admin.ops.contracts.allStatuses', 'All statuses')}</SelectItem>
                    {statuses.map((st) => (
                      <SelectItem key={st} value={st}>
                        {statusLabel(t, st)}
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
                  {t('admin.ops.contracts.expiringSoon', 'Expiring soon')}
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
              {t('admin.ops.contracts.contractN', 'Contract #{id}', { id: viewContract?.id ?? '' })}
            </DialogTitle>
            <DialogDescription>{viewContract?.title}</DialogDescription>
          </DialogHeader>
          {viewContract && (
            <div className="space-y-3 py-2 text-xs">
              <div className="p-4 bg-muted/20 border border-border/50 rounded-lg space-y-2">
                {(
                  [
                    [t('admin.ops.contracts.colCustomer', 'Customer'), viewContract.customerName ?? `#${viewContract.customerId}`],
                    [t('admin.ops.contracts.mobile', 'Mobile'), viewContract.customerMobile ?? '—'],
                    [t('admin.ops.contracts.colTerm', 'Term'), `${fmtDay(viewContract.startDate)} → ${viewContract.endDate ? fmtDay(viewContract.endDate) : t('admin.ops.contracts.openEnded', 'Open-ended')}`],
                    [t('admin.ops.contracts.monthlyValue', 'Monthly value'), formatBdtWithSymbol(viewContract.monthlyValue)],
                    [t('admin.ops.contracts.colStatus', 'Status'), statusLabel(t, viewContract.status)],
                    [t('admin.ops.contracts.createdBy', 'Created by'), viewContract.createdByName ?? '—'],
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
                  <p className="text-xs font-semibold text-muted-foreground">{t('admin.ops.contracts.slaNotesView', 'SLA notes')}</p>
                  <p className="whitespace-pre-wrap text-foreground leading-relaxed">{viewContract.slaNotes}</p>
                </div>
              )}
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Paperclip className="h-3.5 w-3.5" />
                {viewContract.hasAttachment ? viewContract.attachmentName ?? t('admin.ops.contracts.attachment', 'Attachment') : t('admin.ops.contracts.noDocument', 'No document attached')}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewContract(null)}>
              {t('common.close', 'Close')}
            </Button>
            {viewContract?.hasAttachment && (
              <Button className="gap-1.5 bg-primary text-primary-foreground" disabled={download.isPending} onClick={() => handleDownload(viewContract)}>
                <Download className="h-4 w-4" />
                {download.isPending ? t('admin.ops.contracts.downloading', 'Downloading…') : t('admin.ops.contracts.download', 'Download Document')}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={t('admin.ops.contracts.deleteTitle', 'Delete this contract?')}
        description={
          deleting
            ? t('admin.ops.contracts.deleteDesc', 'Contract #{id} "{title}" and its attached document are removed.', { id: deleting.id, title: deleting.title })
            : undefined
        }
        confirmLabel={t('common.delete', 'Delete')}
        destructive
        onConfirm={() => {
          if (!deleting) return;
          const target = deleting;
          remove.mutate(target.id, {
            onSuccess: () => {
              toast.success(t('admin.ops.contracts.deleted', 'Contract #{id} deleted', { id: target.id }));
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
  const t = useTranslations();
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
  const statusItems = useMemo(() => Object.fromEntries(statuses.map((s) => [s, statusLabel(t, s)])), [statuses, t]);

  const pickFile = (f: File | null) => {
    if (f && f.size > MAX_ATTACHMENT_BYTES) {
      toast.error(t('admin.ops.contracts.errSize', 'The attachment must be at most 5 MB'));
      return;
    }
    if (f && !/\.(pdf|png|jpe?g)$/i.test(f.name)) {
      toast.error(t('admin.ops.contracts.errType', 'Attach a PDF, PNG or JPG file'));
      return;
    }
    setFile(f);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const values = { title, startDate, endDate, monthlyValue: Number(monthlyValue || 0), slaNotes, status, file };
    if (isNew) {
      if (!customer) {
        toast.error(t('admin.ops.contracts.chooseCustomer', 'Choose a customer'));
        return;
      }
      create.mutate(
        { ...values, customerId: customer.id },
        {
          onSuccess: (c) => {
            toast.success(t('admin.ops.contracts.created', 'Contract #{id} created', { id: c.id }));
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
          toast.success(t('admin.ops.contracts.updated', 'Contract #{id} updated', { id: c.id }));
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
          {isNew ? t('admin.ops.contracts.newContract', 'New Contract') : t('admin.ops.contracts.editContract', 'Edit Contract #{id}', { id: target.id })}
        </DialogTitle>
        <DialogDescription>{isNew ? t('admin.ops.contracts.newDesc', 'Record a service agreement with a customer.') : (target.customerName ?? '')}</DialogDescription>
      </DialogHeader>
      <div className="space-y-4 py-4 text-xs">
        {isNew && (
          <div className="space-y-2">
            <Label htmlFor="ct-customer" className="text-xs font-semibold">{t('admin.ops.contracts.colCustomer', 'Customer')} *</Label>
            <BillingCustomerPicker id="ct-customer" value={customer} onChange={setCustomer} />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="ct-title" className="text-xs font-semibold">{t('admin.ops.contracts.fieldTitle', 'Title')} *</Label>
          <Input id="ct-title" required maxLength={150} value={title} onChange={(e) => setTitle(e.target.value)} className="text-xs" placeholder={t('admin.ops.contracts.titlePlaceholder', 'e.g. Dedicated line SLA')} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="ct-start" className="text-xs font-semibold">{t('admin.ops.contracts.startDate', 'Start Date')} *</Label>
            <Input id="ct-start" type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className="text-xs font-mono" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ct-end" className="text-xs font-semibold">{t('admin.ops.contracts.endDate', 'End Date')}</Label>
            <Input id="ct-end" type="date" min={startDate || undefined} value={endDate} onChange={(e) => setEndDate(e.target.value)} className="text-xs font-mono" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="ct-value" className="text-xs font-semibold">{t('admin.ops.contracts.monthlyValueTaka', 'Monthly Value (৳)')}</Label>
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
            <Label htmlFor="ct-status" className="text-xs font-semibold">{t('admin.ops.contracts.colStatus', 'Status')}</Label>
            <Select items={statusItems} value={status} onValueChange={(v) => v && setStatus(v as ContractStatus)}>
              <SelectTrigger id="ct-status" className="text-xs w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((st) => (
                  <SelectItem key={st} value={st}>
                    {statusLabel(t, st)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ct-sla" className="text-xs font-semibold">{t('admin.ops.contracts.slaNotes', 'SLA Notes')}</Label>
          <Textarea id="ct-sla" maxLength={2000} value={slaNotes} onChange={(e) => setSlaNotes(e.target.value)} className="text-xs min-h-16" placeholder={t('admin.ops.contracts.slaPlaceholder', 'Uptime, response time, penalties…')} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ct-file" className="text-xs font-semibold">
            {!isNew && target.hasAttachment
              ? t('admin.ops.contracts.replaceDoc', 'Replace Document (PDF, PNG or JPG, max 5 MB)')
              : t('admin.ops.contracts.document', 'Document (PDF, PNG or JPG, max 5 MB)')}
          </Label>
          <Input
            id="ct-file"
            type="file"
            accept={ATTACHMENT_ACCEPT}
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
            className="text-xs"
          />
          {!isNew && target.hasAttachment && !file && (
            <p className="text-xs text-muted-foreground">
              {t('admin.ops.contracts.currentDoc', 'Current: {name}', { name: target.attachmentName ?? t('admin.ops.contracts.attachedDoc', 'attached document') })}
            </p>
          )}
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onDone}>
          {t('common.cancel', 'Cancel')}
        </Button>
        <Button type="submit" disabled={pending} className="gap-1.5 bg-primary text-primary-foreground">
          <CheckCircle2 className="h-4 w-4" />
          {pending ? t('admin.ops.contracts.saving', 'Saving…') : isNew ? t('admin.ops.contracts.create', 'Create Contract') : t('admin.ops.contracts.saveChanges', 'Save Changes')}
        </Button>
      </DialogFooter>
    </form>
  );
}
