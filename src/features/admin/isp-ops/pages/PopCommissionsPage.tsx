'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Building2, Calendar, Download, Percent, Pencil, Trash2, Receipt } from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { DataTable } from '@/features/shared/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { handleApiError } from '@/lib/api/utils/error-handler';
import { downloadCsv } from '@/features/admin/accounting/shared/table-utils';
import { useDeleteCommissionRule, usePopCommissionStatement, useSaveCommissionRule } from '../hooks/use-catalog';
import type { CommissionRule, CommissionType, PopCommissionRow } from '../catalog.types';

const currentPeriod = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const ruleLabel = (rule: CommissionRule | null) =>
  !rule ? 'No rule' : rule.type === 'percent' ? `${rule.value}% of collections` : `৳${rule.value.toLocaleString()} / paying customer`;

interface RuleForm {
  commission_type: CommissionType;
  commission_value: string;
  notes: string;
}

function RuleDialog({ row, onClose }: { row: PopCommissionRow | null; onClose: () => void }) {
  const save = useSaveCommissionRule();
  const { register, handleSubmit, setValue, watch, reset, setError, formState: { errors } } = useForm<RuleForm>({
    defaultValues: { commission_type: 'percent', commission_value: '', notes: '' },
  });
  useEffect(() => {
    if (row)
      reset({
        commission_type: row.rule?.type ?? 'percent',
        commission_value: row.rule ? String(row.rule.value) : '',
        notes: row.rule?.notes ?? '',
      });
  }, [row, reset]);
  const type = watch('commission_type');

  const onSubmit = (v: RuleForm) =>
    row &&
    save.mutate(
      { popId: row.popId, body: { commission_type: v.commission_type, commission_value: Number(v.commission_value), notes: v.notes } },
      {
        onSuccess: () => {
          toast.success(`Commission rule saved for ${row.name}`);
          onClose();
        },
        onError: (err) => handleApiError(err, setError),
      },
    );

  return (
    <Dialog open={!!row} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Percent className="h-4 w-4 text-primary" /> Commission Rule · {row?.name}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Applied to the POP&apos;s customers&apos; successful payments in each statement period.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Rule Type *</Label>
              <Select value={type} onValueChange={(v) => setValue('commission_type', v === 'fixed' ? 'fixed' : 'percent')}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue>{(v: string | null) => (v === 'fixed' ? 'Fixed per paying customer' : 'Percent of collections')}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent" className="text-xs">Percent of collections</SelectItem>
                  <SelectItem value="fixed" className="text-xs">Fixed per paying customer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rule-value" className="text-xs font-semibold">{type === 'fixed' ? 'Amount (BDT) *' : 'Rate (%) *'}</Label>
              <Input
                id="rule-value"
                type="number"
                min={0}
                max={type === 'percent' ? 100 : undefined}
                step="0.01"
                className="h-9 text-xs font-mono"
                {...register('commission_value', { required: 'Value is required' })}
              />
              {errors.commission_value && <p className="text-[11px] text-destructive">{errors.commission_value.message}</p>}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="rule-notes" className="text-xs font-semibold">Notes</Label>
            <Input id="rule-notes" className="h-9 text-xs" {...register('notes')} />
            {errors.notes && <p className="text-[11px] text-destructive">{errors.notes.message}</p>}
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button type="button" variant="outline" size="sm" className="text-xs" onClick={onClose}>Cancel</Button>
            <Button type="submit" size="sm" className="text-xs font-semibold" disabled={save.isPending}>Save Rule</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function PopCommissionsPage() {
  const [period, setPeriod] = useState(currentPeriod);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const { data, isLoading, isError, error, refetch } = usePopCommissionStatement({ page, pageSize, search, period });
  const removeRule = useDeleteCommissionRule();
  const [editing, setEditing] = useState<PopCommissionRow | null>(null);
  const [removing, setRemoving] = useState<PopCommissionRow | null>(null);

  const onSearchChange = useCallback((v: string) => {
    setSearch(v);
    setPage(1);
  }, []);

  const rows = useMemo(() => data?.items ?? [], [data?.items]);
  const summary = data?.summary;

  const handleExportCsv = () =>
    downloadCsv(
      `pop_commissions_${period}.csv`,
      ['POP ID', 'POP', 'Period', 'Collections (BDT)', 'Payments', 'Paying Customers', 'Rule', 'Commission (BDT)'],
      rows.map((r) => [r.popId, r.name, r.period, r.collected, r.payments, r.payingCustomers, ruleLabel(r.rule), r.commission]),
    );

  const columns = useMemo<LegacyColumnDef<PopCommissionRow, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'POP Reseller Hub',
        enableHiding: false,
        size: 220,
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <div className="font-bold text-sm text-foreground">{row.original.name}</div>
              <div className="text-[10px] text-muted-foreground font-mono">{row.original.mobile || `#${row.original.popId}`}</div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'period',
        header: 'Billing Cycle',
        size: 110,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 font-mono text-xs text-foreground">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{row.original.period}</span>
          </div>
        ),
      },
      {
        accessorKey: 'collected',
        header: 'Subscriber Collection',
        size: 160,
        cell: ({ row }) => (
          <div>
            <div className="font-mono text-xs font-semibold text-foreground">
              <CurrencyDisplay amount={row.original.collected} />
            </div>
            <div className="text-[10px] text-muted-foreground">
              {row.original.payments} payments · {row.original.payingCustomers} customers
            </div>
          </div>
        ),
      },
      {
        id: 'rule',
        header: 'Rule',
        size: 170,
        cell: ({ row }) =>
          row.original.rule ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-secondary/80 border border-border/50 text-[11px] font-mono font-bold text-foreground">
              {ruleLabel(row.original.rule)}
            </span>
          ) : (
            <Badge variant="outline" className="text-[10px] text-muted-foreground">No rule</Badge>
          ),
      },
      {
        accessorKey: 'commission',
        header: 'Commission',
        size: 130,
        cell: ({ row }) => (
          <div className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
            <CurrencyDisplay amount={row.original.commission} />
          </div>
        ),
      },
      {
        id: 'actions',
        header: '',
        size: 130,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button size="sm" variant="ghost" onClick={() => setEditing(row.original)} className="h-7 text-xs gap-1 text-primary hover:bg-primary/10">
              <Pencil className="h-3 w-3" /> {row.original.rule ? 'Edit rule' : 'Set rule'}
            </Button>
            {row.original.rule && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setRemoving(row.original)}
                className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
                aria-label={`Remove rule for ${row.original.name}`}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        ),
      },
    ],
    [],
  );

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (isError) {
    return (
      <EmptyState
        title="Failed to load POP commissions"
        description={error?.message ?? 'Could not compute the commission statement.'}
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 w-full pb-12">
      <PageHeader
        title="POP Commissions"
        subtitle="Commission rules per POP and a read-only statement computed from each POP's customer collections"
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'POP Suite' },
          { label: 'Commissions' },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Label htmlFor="commission-period" className="text-xs text-muted-foreground">Period</Label>
              <Input
                id="commission-period"
                type="month"
                value={period}
                onChange={(e) => {
                  if (e.target.value) {
                    setPeriod(e.target.value);
                    setPage(1);
                  }
                }}
                className="h-8 w-[150px] text-xs"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              disabled={rows.length === 0}
              className="text-xs border-border/80 hover:bg-accent"
            >
              <Download className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> Export Statement
            </Button>
          </div>
        }
      />

      {summary && (
        <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
          <p>
            <span className="font-semibold tabular-nums text-foreground">
              <CurrencyDisplay amount={summary.collected} className="inline font-semibold" />
            </span>{' '}
            <span className="text-muted-foreground">collected in {summary.period} ({summary.payments} payments)</span>
          </p>
          <p>
            <span className="font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
              <CurrencyDisplay amount={summary.commission} className="inline font-semibold" />
            </span>{' '}
            <span className="text-muted-foreground">commission due</span>
          </p>
          <p>
            <span className="font-semibold tabular-nums text-primary">
              {summary.popsWithRule} / {summary.pops}
            </span>{' '}
            <span className="text-muted-foreground">POPs with a commission rule</span>
          </p>
          <p className="flex items-center gap-1 text-muted-foreground">
            <Receipt className="h-3.5 w-3.5" /> Statement only — payouts are not recorded here
          </p>
        </div>
      )}

      <DataTable
        columns={columns}
        data={rows}
        getRowId={(row) => row.popId}
        searchPlaceholder="Search POP name or mobile..."
        emptyTitle={search ? 'No POPs match your search' : 'No POP resellers yet'}
        emptyDescription="Commission statements are computed for every POP under your ISP."
        server={{
          page,
          pageSize,
          total: data?.meta.total ?? 0,
          onPageChange: setPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setPage(1);
          },
          search,
          onSearchChange,
        }}
      />

      <RuleDialog row={editing} onClose={() => setEditing(null)} />
      <ConfirmDialog
        open={!!removing}
        onOpenChange={(o) => !o && setRemoving(null)}
        title={`Remove the commission rule for ${removing?.name ?? 'this POP'}?`}
        description="Its statement commission becomes zero until a new rule is set."
        confirmLabel="Remove"
        destructive
        onConfirm={() =>
          removing &&
          removeRule.mutate(removing.popId, {
            onSuccess: () => {
              toast.success('Commission rule removed');
              setRemoving(null);
            },
          })
        }
      />
    </div>
  );
}
