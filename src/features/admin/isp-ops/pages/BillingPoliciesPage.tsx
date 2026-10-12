'use client';

import { useState } from 'react';
import {
  ShieldCheck,
  Sliders,
  Clock,
  Zap,
  Users,
  AlertCircle,
  Check,
  X,
  CalendarDays,
  Receipt,
  Plug,
  Search,
  FlaskConical,
} from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { TablePagination } from '@/components/shared/TablePagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatBdtWithSymbol } from '@/lib/format';
import { errorMessage } from '@/lib/api/utils/error-handler';
import {
  fmtDay,
  fmtStamp,
  useBillingPolicy,
  useBillingPolicyPreview,
  useDebouncedValue,
  usePolicyCharges,
  useSaveBillingPolicy,
  useWaivePolicyCharge,
  useMarkPolicyChargePaid,
  type BillingPolicy,
  type BillingPolicyInput,
  type PolicyCharge,
  type PolicyPreviewSection,
} from '../hooks/use-billing-config';

const KIND_LABEL: Record<PolicyCharge['kind'], string> = {
  late_fee: 'Late fee',
  reconnection_fee: 'Reconnection fee',
};

const STATUS_TONE: Record<PolicyCharge['status'], string> = {
  pending: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
  waived: 'bg-muted/60 text-muted-foreground border-border/80',
  paid: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
};

/** One dry-run block: headline count + up to five sample customers. */
function PreviewBlock({
  title,
  icon,
  section,
  off,
  summary,
}: {
  title: string;
  icon: React.ReactNode;
  section: PolicyPreviewSection;
  off: string;
  summary: string;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-3.5 space-y-2.5 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          {icon}
          {title}
        </span>
        <span className="text-lg font-bold tabular-nums text-foreground">{section.enabled ? section.count.toLocaleString() : '—'}</span>
      </div>
      <p className="text-[11px] text-muted-foreground">{section.enabled ? summary : off}</p>
      {section.enabled && section.sample.length > 0 && (
        <ul className="divide-y divide-border/40 text-[11px]">
          {section.sample.slice(0, 5).map((c) => (
            <li key={`${c.userId}-${c.period ?? ''}`} className="flex items-center justify-between gap-2 py-1.5">
              <span className="min-w-0 truncate">
                <span className="font-medium text-foreground">{c.name || `Customer #${c.userId}`}</span>
                {c.mobile && <span className="ml-1.5 font-mono text-muted-foreground">{c.mobile}</span>}
              </span>
              <span className="shrink-0 font-mono text-muted-foreground tabular-nums">
                {c.amount != null
                  ? formatBdtWithSymbol(c.amount)
                  : c.daysOverdue != null
                    ? `${c.daysOverdue}d overdue`
                    : fmtDay(c.willExpire)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

type FormState = Record<Exclude<keyof BillingPolicyInput, 'autoSuspend'>, string> & { autoSuspendOn: boolean };

function toForm(p: BillingPolicy): FormState {
  return {
    billingCycleDay: String(p.billingCycleDay),
    graceDays: String(p.graceDays),
    autoSuspendOn: p.autoSuspend,
    autoSuspendDays: String(p.autoSuspendDays),
    lateFeeAmount: String(p.lateFeeAmount),
    lateFeePercent: String(p.lateFeePercent),
    reconnectionFee: String(p.reconnectionFee),
  };
}

export function BillingPoliciesPage() {
  const { data: policy, isLoading, isError, error, refetch } = useBillingPolicy();
  const save = useSaveBillingPolicy();
  const [form, setForm] = useState<FormState | null>(null);

  const preview = useBillingPolicyPreview();
  const [chargeStatus, setChargeStatus] = useState('pending');
  const [chargeKind, setChargeKind] = useState('all');
  const [chargeSearch, setChargeSearch] = useState('');
  const debouncedSearch = useDebouncedValue(chargeSearch.trim(), 350);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const charges = usePolicyCharges({ page, perPage, search: debouncedSearch, status: chargeStatus, kind: chargeKind });
  const waive = useWaivePolicyCharge();
  const [toWaive, setToWaive] = useState<PolicyCharge | null>(null);
  const markPaid = useMarkPolicyChargePaid();
  const [toCollect, setToCollect] = useState<PolicyCharge | null>(null);
  const [collectPaymentId, setCollectPaymentId] = useState('');
  const [collectNote, setCollectNote] = useState('');

  const confirmCollect = () => {
    if (!toCollect) return;
    const target = toCollect;
    markPaid.mutate(
      { id: target.id, paymentId: Number(collectPaymentId) || undefined, note: collectNote.trim() || undefined },
      {
        onSuccess: () => {
          toast.success(`${KIND_LABEL[target.kind]} of ${formatBdtWithSymbol(target.amount)} marked as collected`);
          setToCollect(null);
          setCollectPaymentId('');
          setCollectNote('');
        },
      },
    );
  };
  const chargeTotal = charges.data?.meta.total ?? 0;

  const confirmWaive = () => {
    if (!toWaive) return;
    const target = toWaive;
    waive.mutate(target.id, {
      onSuccess: () => {
        toast.success(`${KIND_LABEL[target.kind]} of ${formatBdtWithSymbol(target.amount)} waived`);
        setToWaive(null);
      },
    });
  };

  const toggleAutoSuspend = () => {
    if (!policy) return;
    const next = !policy.autoSuspend;
    save.mutate(
      { autoSuspend: next },
      { onSuccess: () => toast.success(`Auto-suspend ${next ? 'enabled' : 'disabled'}`) },
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    save.mutate(
      {
        billingCycleDay: Number(form.billingCycleDay),
        graceDays: Number(form.graceDays),
        autoSuspend: form.autoSuspendOn,
        autoSuspendDays: Number(form.autoSuspendDays),
        lateFeeAmount: Number(form.lateFeeAmount || 0),
        lateFeePercent: Number(form.lateFeePercent || 0),
        reconnectionFee: Number(form.reconnectionFee || 0),
      },
      {
        onSuccess: () => {
          toast.success('Billing policy saved');
          setForm(null);
        },
      },
    );
  };

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (isError || !policy) {
    return (
      <EmptyState
        title="Failed to load the billing policy"
        description={errorMessage(error, 'Could not load the billing policy.')}
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  const rules: { label: string; hint: string; value: React.ReactNode; icon: React.ReactNode }[] = [
    {
      label: 'Billing cycle day',
      hint: "Reference day for your billing calendar — renewals follow each customer's own expiry date",
      value: `Day ${policy.billingCycleDay}`,
      icon: <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />,
    },
    {
      label: 'Grace period',
      hint: 'Days an expired line stays connected before the expiry cut and late fee apply',
      value: policy.graceDays === 0 ? 'No grace' : `${policy.graceDays} days`,
      icon: <Clock className="h-3.5 w-3.5 text-muted-foreground" />,
    },
    {
      label: 'Auto-suspend',
      hint: 'Disconnects lines still online this many days after expiry (audit-logged)',
      value: policy.autoSuspend ? `${policy.autoSuspendDays} days after expiry` : 'Off',
      icon: <Zap className="h-3.5 w-3.5 text-muted-foreground" />,
    },
    {
      label: 'Late fee (fixed)',
      hint: 'Raised once per overdue cycle when grace ends unpaid',
      value: formatBdtWithSymbol(policy.lateFeeAmount),
      icon: <Receipt className="h-3.5 w-3.5 text-muted-foreground" />,
    },
    {
      label: 'Late fee (percent)',
      hint: 'Share of the package price — used when no fixed late fee is set',
      value: `${policy.lateFeePercent}%`,
      icon: <Receipt className="h-3.5 w-3.5 text-muted-foreground" />,
    },
    {
      label: 'Reconnection fee',
      hint: 'Raised once when a disconnected line renews and is back online',
      value: formatBdtWithSymbol(policy.reconnectionFee),
      icon: <Plug className="h-3.5 w-3.5 text-muted-foreground" />,
    },
  ];

  const set = (k: keyof FormState, v: string | boolean) => setForm((f) => (f ? { ...f, [k]: v } : f));

  return (
    <div className="space-y-6 w-full pb-20">
      {/* Header */}
      <PageHeader
        title="Billing Policy"
        subtitle="Billing cycle, grace period, automatic suspension and fee rules for your customers."
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Billing' },
          { label: 'Policies' },
        ]}
        actions={
          <Button
            size="sm"
            onClick={() => setForm(toForm(policy))}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-8 gap-1.5 shadow-sm"
          >
            <Sliders className="h-3.5 w-3.5" /> Edit Policy
          </Button>
        }
      />

      {!policy.configured && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-700 dark:text-amber-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          No billing policy saved yet — the values below are the defaults. Edit and save to set your own.
        </div>
      )}

      {/* KPI ribbon — live counts from the customer table */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm relative overflow-hidden group hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customers</span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
              {policy.stats.customersTotal.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">covered</span>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">
            {policy.stats.expired.toLocaleString()} currently expired
          </div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm relative overflow-hidden group hover:border-sky-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">In Grace</span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-sky-600 dark:text-sky-400 tabular-nums">
              {policy.stats.inGrace.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">customers</span>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">
            Expired within the last {policy.graceDays} days
          </div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm relative overflow-hidden group hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Past Grace</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-amber-500 tabular-nums">
              {policy.stats.pastGrace.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">customers</span>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">
            {policy.stats.asOf ? `As of ${fmtStamp(policy.stats.asOf)}` : 'Overdue beyond grace'}
          </div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Auto-Suspend</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span
              className={cn(
                'text-2xl font-bold tracking-tight',
                policy.autoSuspend ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground',
              )}
            >
              {policy.autoSuspend ? 'On' : 'Off'}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">
            {policy.autoSuspend ? `${policy.autoSuspendDays} days after expiry` : 'Expired lines are still cut after grace'}
          </div>
        </Card>
      </div>

      {/* Policy rules */}
      <Card className="border-border/70 shadow-sm bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Rule</th>
                <th className="py-3 px-3">Setting</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rules.map((rule) => (
                <tr key={rule.label} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5">{rule.icon}</span>
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground text-sm">{rule.label}</span>
                        <span className="text-[11px] text-muted-foreground mt-0.5">{rule.hint}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 whitespace-nowrap font-mono font-semibold text-foreground tabular-nums">
                    {rule.label === 'Auto-suspend' ? (
                      <button
                        type="button"
                        onClick={toggleAutoSuspend}
                        disabled={save.isPending}
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border transition font-sans',
                          policy.autoSuspend
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-muted/60 text-muted-foreground border-border/80 hover:bg-muted',
                        )}
                      >
                        {policy.autoSuspend ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                        {rule.value}
                      </button>
                    ) : (
                      rule.value
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setForm(toForm(policy))}
                      className="h-8 px-2 text-xs font-medium text-primary hover:bg-primary/10 gap-1"
                    >
                      <Sliders className="h-3.5 w-3.5" /> Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {policy.updatedAt && (
          <div className="border-t border-border/60 px-4 py-2.5 text-[11px] text-muted-foreground">
            Last saved {fmtStamp(policy.updatedAt)}
            {policy.updatedByName ? ` by ${policy.updatedByName}` : ''}
          </div>
        )}
      </Card>

      {/* Dry-run preview: what the saved policy does on its next run */}
      <Card className="border-border/70 shadow-sm bg-card p-4 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
              <FlaskConical className="h-4 w-4 text-primary" /> Policy preview
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              What the saved policy would do on its next run — a dry run, nothing is changed.
              {preview.data?.windowDays ? ` Fees only cover cycles overdue in the last ${preview.data.windowDays} days.` : ''}
            </p>
          </div>
          {preview.data?.asOf && (
            <span className="text-[11px] text-muted-foreground">As of {fmtStamp(preview.data.asOf)}</span>
          )}
        </div>
        {preview.isLoading ? (
          <PageSkeleton variant="cards" rows={4} />
        ) : preview.isError || !preview.data ? (
          <EmptyState
            title="Failed to load the policy preview"
            description={errorMessage(preview.error, 'Could not run the policy preview.')}
            actionLabel="Retry"
            onAction={() => preview.refetch()}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            <PreviewBlock
              title="Held by grace"
              icon={<Clock className="h-3.5 w-3.5 text-sky-500" />}
              section={preview.data.grace}
              off="No grace — expired lines are cut at expiry"
              summary={`Expired lines kept connected for up to ${preview.data.grace.days} days`}
            />
            <PreviewBlock
              title="Would be suspended"
              icon={<Zap className="h-3.5 w-3.5 text-amber-500" />}
              section={preview.data.autoSuspend}
              off="Auto-suspend is off"
              summary={`Still online ${preview.data.autoSuspend.days}+ days after expiry`}
            />
            <PreviewBlock
              title="Late fees to raise"
              icon={<Receipt className="h-3.5 w-3.5 text-rose-500" />}
              section={preview.data.lateFee}
              off="No late fee set"
              summary={`${formatBdtWithSymbol(preview.data.lateFee.amount)} for unpaid cycles past grace`}
            />
            <PreviewBlock
              title="Reconnection fees to raise"
              icon={<Plug className="h-3.5 w-3.5 text-emerald-500" />}
              section={preview.data.reconnectionFee}
              off="No reconnection fee set"
              summary={`${formatBdtWithSymbol(preview.data.reconnectionFee.amount)} now · ${preview.data.reconnectionFee.awaiting.toLocaleString()} cut lines owe it on renewal`}
            />
          </div>
        )}
      </Card>

      {/* Charges raised by the policy */}
      <Card className="border-border/70 shadow-sm bg-card overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 border-b border-border/60">
          <div>
            <p className="text-sm font-bold text-foreground">Policy charges</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {preview.data
                ? `${preview.data.charges.pendingCount.toLocaleString()} pending (${formatBdtWithSymbol(preview.data.charges.pendingAmount)}) · ${preview.data.charges.waivedCount.toLocaleString()} waived`
                : 'Late and reconnection fees raised by the policy'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Customer, mobile or charge #…"
                value={chargeSearch}
                onChange={(e) => {
                  setChargeSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-8 h-8 text-xs"
              />
            </div>
            {[
              { value: chargeStatus, set: setChargeStatus, options: ['pending', 'waived', 'paid', 'all'] },
              { value: chargeKind, set: setChargeKind, options: ['all', 'late_fee', 'reconnection_fee'] },
            ].map((group, i) => (
              <div key={i} className="flex items-center gap-1 p-1 rounded-lg bg-muted/40 border border-border/60">
                {group.options.map((o) => (
                  <Button
                    key={o}
                    type="button"
                    size="sm"
                    variant={group.value === o ? 'default' : 'ghost'}
                    onClick={() => {
                      group.set(o);
                      setPage(1);
                    }}
                    className={cn(
                      'text-[11px] h-6 px-2 font-medium capitalize',
                      group.value === o ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {o === 'late_fee' || o === 'reconnection_fee' ? KIND_LABEL[o] : o}
                  </Button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {charges.isLoading && !charges.data ? (
          <PageSkeleton variant="table" rows={4} />
        ) : charges.isError ? (
          <EmptyState
            title="Failed to load policy charges"
            description={errorMessage(charges.error)}
            actionLabel="Retry"
            onAction={() => charges.refetch()}
          />
        ) : chargeTotal === 0 ? (
          <EmptyState
            title="No policy charges"
            description={debouncedSearch ? 'No charges match your search.' : 'Charges appear here once the policy raises a late or reconnection fee.'}
          />
        ) : (
          <div className={cn(charges.isFetching && 'opacity-80')}>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 text-muted-foreground font-medium border-b border-border/60">
                  <tr>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Fee</th>
                    <th className="py-3 px-4">Overdue cycle</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Raised</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {(charges.data?.items ?? []).map((c) => (
                    <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-medium text-foreground">{c.customerName ?? `Customer #${c.customerId}`}</div>
                        {c.customerMobile && <div className="text-[11px] text-muted-foreground font-mono">{c.customerMobile}</div>}
                      </td>
                      <td className="py-3 px-4">{KIND_LABEL[c.kind]}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground">Expired {fmtDay(c.period)}</td>
                      <td className="py-3 px-4 font-mono font-bold text-foreground">{formatBdtWithSymbol(c.amount)}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className={cn('text-[10px] capitalize', STATUS_TONE[c.status])}>
                          {c.status}
                        </Badge>
                        {c.status === 'waived' && c.waivedByName && (
                          <div className="text-[10px] text-muted-foreground mt-0.5">by {c.waivedByName}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground">{fmtDay(c.createdAt)}</td>
                      <td className="py-3 px-4 text-right">
                        {c.status === 'pending' && (
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={markPaid.isPending}
                              onClick={() => setToCollect(c)}
                              className="h-7 text-xs text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
                            >
                              Mark collected
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={waive.isPending}
                              onClick={() => setToWaive(c)}
                              className="h-7 text-xs text-primary hover:bg-primary/10"
                            >
                              Waive
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-border/60 px-4 py-2">
              <TablePagination
                currentPage={page}
                pageSize={perPage}
                totalItems={chargeTotal}
                onPageChange={setPage}
                onPageSizeChange={(n) => {
                  setPerPage(n);
                  setPage(1);
                }}
              />
            </div>
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={toWaive !== null}
        onOpenChange={(open) => !open && setToWaive(null)}
        title="Waive this charge?"
        description={
          toWaive
            ? `${KIND_LABEL[toWaive.kind]} of ${formatBdtWithSymbol(toWaive.amount)} for ${toWaive.customerName ?? `customer #${toWaive.customerId}`} will no longer be owed.`
            : undefined
        }
        confirmLabel={waive.isPending ? 'Waiving…' : 'Waive charge'}
        onConfirm={confirmWaive}
      />

      <Dialog open={toCollect !== null} onOpenChange={(open) => !open && setToCollect(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Mark charge as collected</DialogTitle>
            <DialogDescription>
              {toCollect
                ? `${KIND_LABEL[toCollect.kind]} of ${formatBdtWithSymbol(toCollect.amount)} for ${toCollect.customerName ?? `customer #${toCollect.customerId}`}.`
                : null}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-1">
            <div className="space-y-1.5">
              <Label htmlFor="collect-payment">Payment ID (optional)</Label>
              <Input
                id="collect-payment"
                inputMode="numeric"
                placeholder="Successful payment that included this fee"
                value={collectPaymentId}
                onChange={(e) => setCollectPaymentId(e.target.value.replace(/[^0-9]/g, ''))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="collect-note">Note (optional)</Label>
              <Input id="collect-note" value={collectNote} onChange={(e) => setCollectNote(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setToCollect(null)}>
              Cancel
            </Button>
            <Button onClick={confirmCollect} disabled={markPaid.isPending}>
              {markPaid.isPending ? 'Saving…' : 'Mark collected'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit drawer */}
      <Sheet open={form !== null} onOpenChange={(open) => !open && setForm(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto p-6 space-y-6">
          {form && (
            <>
              <SheetHeader>
                <Badge
                  variant="outline"
                  className="w-fit text-[10px] font-semibold uppercase px-2 py-0.5 border-primary/30 text-primary"
                >
                  Policy Configuration
                </Badge>
                <SheetTitle className="text-xl font-bold text-foreground mt-2">Billing Policy</SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  Applies to every customer of your account.
                </SheetDescription>
              </SheetHeader>

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="bp-cycle" className="font-semibold text-foreground">Billing Cycle Day</label>
                    <Input
                      id="bp-cycle"
                      type="number"
                      min={1}
                      max={28}
                      required
                      value={form.billingCycleDay}
                      onChange={(e) => set('billingCycleDay', e.target.value)}
                      className="h-9 text-xs font-mono"
                    />
                    <p className="text-[10px] text-muted-foreground">1–28</p>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="bp-grace" className="font-semibold text-foreground">Grace Period (Days)</label>
                    <Input
                      id="bp-grace"
                      type="number"
                      min={0}
                      max={60}
                      required
                      value={form.graceDays}
                      onChange={(e) => set('graceDays', e.target.value)}
                      className="h-9 text-xs font-mono"
                    />
                  </div>
                </div>

                <Card className="p-4 border-border/80 bg-muted/20 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">Automatic Line Suspension</p>
                      <p className="text-[11px] text-muted-foreground">Disconnect lines still online after this many days</p>
                    </div>
                    <Switch checked={form.autoSuspendOn} onCheckedChange={(v) => set('autoSuspendOn', Boolean(v))} />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="bp-suspend" className="font-semibold text-foreground">Suspend After (Days)</label>
                    <Input
                      id="bp-suspend"
                      type="number"
                      min={0}
                      max={90}
                      required
                      disabled={!form.autoSuspendOn}
                      value={form.autoSuspendDays}
                      onChange={(e) => set('autoSuspendDays', e.target.value)}
                      className="h-9 text-xs font-mono"
                    />
                    <p className="text-[10px] text-muted-foreground">Must not be shorter than the grace period.</p>
                  </div>
                </Card>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="bp-late-amt" className="font-semibold text-foreground">Late Fee (৳)</label>
                    <Input
                      id="bp-late-amt"
                      type="number"
                      min={0}
                      step="0.01"
                      value={form.lateFeeAmount}
                      onChange={(e) => set('lateFeeAmount', e.target.value)}
                      className="h-9 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="bp-late-pct" className="font-semibold text-foreground">Late Fee (%)</label>
                    <Input
                      id="bp-late-pct"
                      type="number"
                      min={0}
                      max={100}
                      step="0.01"
                      value={form.lateFeePercent}
                      onChange={(e) => set('lateFeePercent', e.target.value)}
                      className="h-9 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="bp-reconnect" className="font-semibold text-foreground">Reconnection Fee (৳)</label>
                  <Input
                    id="bp-reconnect"
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.reconnectionFee}
                    onChange={(e) => set('reconnectionFee', e.target.value)}
                    className="h-9 text-xs font-mono"
                  />
                </div>

                <div className="pt-4 space-y-2">
                  <Button
                    type="submit"
                    disabled={save.isPending}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-9 font-semibold"
                  >
                    {save.isPending ? 'Saving…' : 'Save Policy'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setForm(null)}
                    className="w-full text-xs h-9 border-border/80 hover:bg-accent"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
