'use client';

import { useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
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
  FlaskConical,
} from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { DataTable } from '@/features/shared/data-table';
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
import { formatBdtWithSymbol, formatCount } from '@/lib/format';
import { errorMessage } from '@/lib/api/utils/error-handler';
import { useTranslations } from '@/i18n/locale-context';
import {
  fmtDay,
  fmtStamp,
  useBillingPolicy,
  useBillingPolicyPreview,
  usePolicyCharges,
  useSaveBillingPolicy,
  useWaivePolicyCharge,
  useMarkPolicyChargePaid,
  type BillingPolicy,
  type BillingPolicyInput,
  type PolicyCharge,
  type PolicyPreviewSection,
} from '../hooks/use-billing-config';

type Translate = ReturnType<typeof useTranslations>;

function kindLabel(t: Translate, kind: PolicyCharge['kind']): string {
  return kind === 'late_fee'
    ? t('admin.ops.billingPolicies.kindLate', 'Late fee')
    : t('admin.ops.billingPolicies.kindReconnection', 'Reconnection fee');
}

function customerName(t: Translate, name: string | null | undefined, id: number | string): string {
  return name || t('admin.ops.billingPolicies.customerNo', 'Customer #{id}', { id });
}

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
  const t = useTranslations();
  return (
    <div className="rounded-lg border border-border/60 bg-muted/20 p-3.5 space-y-2.5 min-w-0">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          {icon}
          {title}
        </span>
        <span className="text-lg font-bold tabular-nums text-foreground">{section.enabled ? formatCount(section.count) : '—'}</span>
      </div>
      <p className="text-xs text-muted-foreground">{section.enabled ? summary : off}</p>
      {section.enabled && section.sample.length > 0 && (
        <ul className="divide-y divide-border/40 text-xs">
          {section.sample.slice(0, 5).map((c) => (
            <li key={`${c.userId}-${c.period ?? ''}`} className="flex items-center justify-between gap-2 py-1.5">
              <span className="min-w-0 truncate">
                <span className="font-medium text-foreground">{customerName(t, c.name, c.userId)}</span>
                {c.mobile && <span className="ml-1.5 font-mono text-muted-foreground">{c.mobile}</span>}
              </span>
              <span className="shrink-0 font-mono text-muted-foreground tabular-nums">
                {c.amount != null
                  ? formatBdtWithSymbol(c.amount)
                  : c.daysOverdue != null
                    ? t('admin.ops.billingPolicies.daysOverdue', '{n}d overdue', { n: c.daysOverdue })
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
  const t = useTranslations();
  const { data: policy, isLoading, isError, error, refetch } = useBillingPolicy();
  const save = useSaveBillingPolicy();
  const [form, setForm] = useState<FormState | null>(null);

  const preview = useBillingPolicyPreview();
  const [chargeStatus, setChargeStatus] = useState('pending');
  const [chargeKind, setChargeKind] = useState('all');
  const [chargeSearch, setChargeSearch] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const charges = usePolicyCharges({ page, perPage, search: chargeSearch, status: chargeStatus, kind: chargeKind });
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
          toast.success(
            t('admin.ops.billingPolicies.collectedToast', '{kind} of {amount} marked as collected', {
              kind: kindLabel(t, target.kind),
              amount: formatBdtWithSymbol(target.amount),
            }),
          );
          setToCollect(null);
          setCollectPaymentId('');
          setCollectNote('');
        },
      },
    );
  };
  const chargeTotal = charges.data?.meta.total ?? 0;
  const optionLabel = (o: string) => {
    if (o === 'all') return t('admin.ops.billingPolicies.filterAll', 'All');
    if (o === 'pending') return t('status.pending', 'Pending');
    if (o === 'waived') return t('status.waived', 'Waived');
    if (o === 'paid') return t('status.paid', 'Paid');
    return o;
  };

  const confirmWaive = () => {
    if (!toWaive) return;
    const target = toWaive;
    waive.mutate(target.id, {
      onSuccess: () => {
        toast.success(
          t('admin.ops.billingPolicies.waivedToast', '{kind} of {amount} waived', {
            kind: kindLabel(t, target.kind),
            amount: formatBdtWithSymbol(target.amount),
          }),
        );
        setToWaive(null);
      },
    });
  };

  const toggleAutoSuspend = () => {
    if (!policy) return;
    const next = !policy.autoSuspend;
    save.mutate(
      { autoSuspend: next },
      {
        onSuccess: () =>
          toast.success(
            next
              ? t('admin.ops.billingPolicies.autoSuspendEnabled', 'Auto-suspend enabled')
              : t('admin.ops.billingPolicies.autoSuspendDisabled', 'Auto-suspend disabled'),
          ),
      },
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
          toast.success(t('admin.ops.billingPolicies.saved', 'Billing policy saved'));
          setForm(null);
        },
      },
    );
  };

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (isError || !policy) {
    return (
      <EmptyState variant="error"
        title={t('admin.ops.billingPolicies.loadFailed', 'Failed to load the billing policy')}
        description={errorMessage(error, t('admin.ops.billingPolicies.loadFailedHint', 'Could not load the billing policy.'))}
        actionLabel={t('common.retry', 'Retry')}
        onAction={() => refetch()}
      />
    );
  }

  const rules: { id: string; label: string; hint: string; value: React.ReactNode; icon: React.ReactNode }[] = [
    {
      id: 'cycleDay',
      label: t('admin.ops.billingPolicies.ruleCycleDay', 'Billing cycle day'),
      hint: t('admin.ops.billingPolicies.ruleCycleDayHint', "Reference day for your billing calendar — renewals follow each customer's own expiry date"),
      value: t('admin.ops.billingPolicies.dayN', 'Day {n}', { n: policy.billingCycleDay }),
      icon: <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />,
    },
    {
      id: 'grace',
      label: t('admin.ops.billingPolicies.ruleGrace', 'Grace period'),
      hint: t('admin.ops.billingPolicies.ruleGraceHint', 'Days an expired line stays connected before the expiry cut and late fee apply'),
      value: policy.graceDays === 0 ? t('admin.ops.billingPolicies.noGrace', 'No grace') : t('admin.ops.billingPolicies.nDays', '{n} days', { n: policy.graceDays }),
      icon: <Clock className="h-3.5 w-3.5 text-muted-foreground" />,
    },
    {
      id: 'autoSuspend',
      label: t('admin.ops.billingPolicies.ruleAutoSuspend', 'Auto-suspend'),
      hint: t('admin.ops.billingPolicies.ruleAutoSuspendHint', 'Disconnects lines still online this many days after expiry (audit-logged)'),
      value: policy.autoSuspend ? t('admin.ops.billingPolicies.daysAfterExpiry', '{n} days after expiry', { n: policy.autoSuspendDays }) : t('admin.ops.billingPolicies.off', 'Off'),
      icon: <Zap className="h-3.5 w-3.5 text-muted-foreground" />,
    },
    {
      id: 'lateFixed',
      label: t('admin.ops.billingPolicies.ruleLateFixed', 'Late fee (fixed)'),
      hint: t('admin.ops.billingPolicies.ruleLateFixedHint', 'Raised once per overdue cycle when grace ends unpaid'),
      value: formatBdtWithSymbol(policy.lateFeeAmount),
      icon: <Receipt className="h-3.5 w-3.5 text-muted-foreground" />,
    },
    {
      id: 'latePercent',
      label: t('admin.ops.billingPolicies.ruleLatePercent', 'Late fee (percent)'),
      hint: t('admin.ops.billingPolicies.ruleLatePercentHint', 'Share of the package price — used when no fixed late fee is set'),
      value: `${policy.lateFeePercent}%`,
      icon: <Receipt className="h-3.5 w-3.5 text-muted-foreground" />,
    },
    {
      id: 'reconnection',
      label: t('admin.ops.billingPolicies.ruleReconnection', 'Reconnection fee'),
      hint: t('admin.ops.billingPolicies.ruleReconnectionHint', 'Raised once when a disconnected line renews and is back online'),
      value: formatBdtWithSymbol(policy.reconnectionFee),
      icon: <Plug className="h-3.5 w-3.5 text-muted-foreground" />,
    },
  ];

  const chargeColumns: LegacyColumnDef<PolicyCharge, unknown>[] = [
    {
      id: 'customer',
      header: t('admin.ops.billingPolicies.colCustomer', 'Customer'),
      enableSorting: false,
      meta: { mobile: 'title' },
      cell: ({ row: { original: c } }) => (
        <div>
          <div className="font-medium text-foreground">{customerName(t, c.customerName, c.customerId)}</div>
          {c.customerMobile && <div className="text-xs text-muted-foreground font-mono">{c.customerMobile}</div>}
        </div>
      ),
    },
    {
      id: 'fee',
      header: t('admin.ops.billingPolicies.colFee', 'Fee'),
      enableSorting: false,
      cell: ({ row }) => kindLabel(t, row.original.kind),
    },
    {
      id: 'cycle',
      header: t('admin.ops.billingPolicies.colCycle', 'Overdue cycle'),
      enableSorting: false,
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{t('admin.ops.billingPolicies.expiredOn', 'Expired {date}', { date: fmtDay(row.original.period) })}</span>,
    },
    {
      id: 'amount',
      header: t('admin.ops.billingPolicies.colAmount', 'Amount'),
      enableSorting: false,
      cell: ({ row }) => <span className="font-mono font-bold text-foreground">{formatBdtWithSymbol(row.original.amount)}</span>,
    },
    {
      id: 'status',
      header: t('admin.ops.billingPolicies.colStatus', 'Status'),
      enableSorting: false,
      cell: ({ row: { original: c } }) => (
        <div>
          <StatusBadge status={c.status} />
          {c.status === 'waived' && c.waivedByName && <div className="text-xs text-muted-foreground mt-0.5">{t('admin.ops.billingPolicies.byName', 'by {name}', { name: c.waivedByName })}</div>}
        </div>
      ),
    },
    {
      id: 'raised',
      header: t('admin.ops.billingPolicies.colRaised', 'Raised'),
      enableSorting: false,
      cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{fmtDay(row.original.createdAt)}</span>,
    },
    {
      id: 'actions',
      header: () => <div className="text-right">{t('admin.ops.billingPolicies.colAction', 'Action')}</div>,
      enableSorting: false,
      enableHiding: false,
      cell: ({ row: { original: c } }) =>
        c.status === 'pending' ? (
          <div className="flex justify-end gap-1">
            <Button
              size="sm"
              variant="ghost"
              disabled={markPaid.isPending}
              onClick={() => setToCollect(c)}
              className="h-7 text-xs text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
            >
              {t('admin.ops.billingPolicies.markCollected', 'Mark collected')}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={waive.isPending}
              onClick={() => setToWaive(c)}
              className="h-7 text-xs text-primary hover:bg-primary/10"
            >
              {t('admin.ops.billingPolicies.waive', 'Waive')}
            </Button>
          </div>
        ) : null,
    },
  ];

  const set = (k: keyof FormState, v: string | boolean) => setForm((f) => (f ? { ...f, [k]: v } : f));

  return (
    <div className="space-y-6 w-full pb-20">
      {/* Header */}
      <PageHeader
        title={t('admin.ops.billingPolicies.title', 'Billing Policy')}
        subtitle={t('admin.ops.billingPolicies.subtitle', 'Billing cycle, grace period, automatic suspension and fee rules for your customers.')}
        breadcrumb={[
          { label: t('admin.customers.list.breadcrumbAdmin', 'Admin'), url: '/admin/dashboard' },
          { label: t('common.crumb.billing', 'Billing') },
          { label: t('admin.ops.billingPolicies.crumb', 'Policies') },
        ]}
        actions={
          <Button
            size="sm"
            onClick={() => setForm(toForm(policy))}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-8 gap-1.5 shadow-sm"
          >
            <Sliders className="h-3.5 w-3.5" /> {t('admin.ops.billingPolicies.editPolicy', 'Edit Policy')}
          </Button>
        }
      />

      {!policy.configured && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-700 dark:text-amber-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {t('admin.ops.billingPolicies.notConfigured', 'No billing policy saved yet — the values below are the defaults. Edit and save to set your own.')}
        </div>
      )}

      {/* KPI ribbon — live counts from the customer table */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm relative overflow-hidden group hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.ops.billingPolicies.kpiCustomers', 'Customers')}</span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
              {formatCount(policy.stats.customersTotal)}
            </span>
            <span className="text-xs text-muted-foreground">{t('admin.ops.billingPolicies.covered', 'covered')}</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {t('admin.ops.billingPolicies.currentlyExpired', '{n} currently expired', { n: formatCount(policy.stats.expired) })}
          </div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm relative overflow-hidden group hover:border-sky-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.ops.billingPolicies.kpiInGrace', 'In Grace')}</span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-sky-600 dark:text-sky-400 tabular-nums">
              {formatCount(policy.stats.inGrace)}
            </span>
            <span className="text-xs text-muted-foreground">{t('admin.ops.billingPolicies.customersUnit', 'customers')}</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {t('admin.ops.billingPolicies.expiredWithin', 'Expired within the last {n} days', { n: policy.graceDays })}
          </div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm relative overflow-hidden group hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.ops.billingPolicies.kpiPastGrace', 'Past Grace')}</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-amber-500 tabular-nums">
              {formatCount(policy.stats.pastGrace)}
            </span>
            <span className="text-xs text-muted-foreground">{t('admin.ops.billingPolicies.customersUnit', 'customers')}</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {policy.stats.asOf ? t('admin.ops.billingPolicies.asOf', 'As of {stamp}', { stamp: fmtStamp(policy.stats.asOf) }) : t('admin.ops.billingPolicies.overdueBeyond', 'Overdue beyond grace')}
          </div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('admin.ops.billingPolicies.kpiAutoSuspend', 'Auto-Suspend')}</span>
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
              {policy.autoSuspend ? t('admin.ops.billingPolicies.on', 'On') : t('admin.ops.billingPolicies.off', 'Off')}
            </span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {policy.autoSuspend ? t('admin.ops.billingPolicies.daysAfterExpiry', '{n} days after expiry', { n: policy.autoSuspendDays }) : t('admin.ops.billingPolicies.stillCut', 'Expired lines are still cut after grace')}
          </div>
        </Card>
      </div>

      {/* Policy rules */}
      <Card className="border-border/70 shadow-sm bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="block w-full text-left text-xs border-collapse md:table">
            <thead className="hidden md:table-header-group">
              <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground font-semibold text-xs uppercase tracking-wider">
                <th className="py-3 px-4">{t('admin.ops.billingPolicies.thRule', 'Rule')}</th>
                <th className="py-3 px-3">{t('admin.ops.billingPolicies.thSetting', 'Setting')}</th>
                <th className="py-3 px-3 text-right">{t('admin.customers.list.colActions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="block divide-y divide-border/60 md:table-row-group">
              {rules.map((rule) => (
                <tr key={rule.id} className="flex flex-wrap items-center justify-between gap-x-3 px-1 hover:bg-muted/30 transition-colors md:table-row md:px-0">
                  <td className="w-full py-3.5 px-3 pb-1 md:table-cell md:w-auto md:px-4 md:pb-3.5">
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5">{rule.icon}</span>
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground text-sm">{rule.label}</span>
                        <span className="text-xs text-muted-foreground mt-0.5">{rule.hint}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap font-mono font-semibold text-foreground tabular-nums md:table-cell md:py-3.5">
                    {rule.id === 'autoSuspend' ? (
                      <button
                        type="button"
                        onClick={toggleAutoSuspend}
                        disabled={save.isPending}
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border transition font-sans',
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
                  <td className="py-2 px-3 text-right md:table-cell md:py-3.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setForm(toForm(policy))}
                      className="h-8 px-2 text-xs font-medium text-primary hover:bg-primary/10 gap-1"
                    >
                      <Sliders className="h-3.5 w-3.5" /> {t('common.edit', 'Edit')}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {policy.updatedAt && (
          <div className="border-t border-border/60 px-4 py-2.5 text-xs text-muted-foreground">
            {policy.updatedByName
              ? t('admin.ops.billingPolicies.lastSavedBy', 'Last saved {stamp} by {name}', { stamp: fmtStamp(policy.updatedAt), name: policy.updatedByName })
              : t('admin.ops.billingPolicies.lastSaved', 'Last saved {stamp}', { stamp: fmtStamp(policy.updatedAt) })}
          </div>
        )}
      </Card>

      {/* Dry-run preview: what the saved policy does on its next run */}
      <Card className="border-border/70 shadow-sm bg-card p-4 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
              <FlaskConical className="h-4 w-4 text-primary" /> {t('admin.ops.billingPolicies.previewTitle', 'Policy preview')}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t('admin.ops.billingPolicies.previewHint', 'What the saved policy would do on its next run — a dry run, nothing is changed.')}
              {preview.data?.windowDays
                ? ` ${t('admin.ops.billingPolicies.previewWindow', 'Fees only cover cycles overdue in the last {n} days.', { n: preview.data.windowDays })}`
                : ''}
            </p>
          </div>
          {preview.data?.asOf && (
            <span className="text-xs text-muted-foreground">{t('admin.ops.billingPolicies.asOf', 'As of {stamp}', { stamp: fmtStamp(preview.data.asOf) })}</span>
          )}
        </div>
        {preview.isLoading ? (
          <PageSkeleton variant="cards" rows={4} />
        ) : preview.isError || !preview.data ? (
          <EmptyState variant="error"
            title={t('admin.ops.billingPolicies.previewFailed', 'Failed to load the policy preview')}
            description={errorMessage(preview.error, t('admin.ops.billingPolicies.previewFailedHint', 'Could not run the policy preview.'))}
            actionLabel={t('common.retry', 'Retry')}
            onAction={() => preview.refetch()}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            <PreviewBlock
              title={t('admin.ops.billingPolicies.blockGrace', 'Held by grace')}
              icon={<Clock className="h-3.5 w-3.5 text-sky-500" />}
              section={preview.data.grace}
              off={t('admin.ops.billingPolicies.blockGraceOff', 'No grace — expired lines are cut at expiry')}
              summary={t('admin.ops.billingPolicies.blockGraceSummary', 'Expired lines kept connected for up to {n} days', { n: preview.data.grace.days })}
            />
            <PreviewBlock
              title={t('admin.ops.billingPolicies.blockSuspend', 'Would be suspended')}
              icon={<Zap className="h-3.5 w-3.5 text-amber-500" />}
              section={preview.data.autoSuspend}
              off={t('admin.ops.billingPolicies.blockSuspendOff', 'Auto-suspend is off')}
              summary={t('admin.ops.billingPolicies.blockSuspendSummary', 'Still online {n}+ days after expiry', { n: preview.data.autoSuspend.days })}
            />
            <PreviewBlock
              title={t('admin.ops.billingPolicies.blockLate', 'Late fees to raise')}
              icon={<Receipt className="h-3.5 w-3.5 text-rose-500" />}
              section={preview.data.lateFee}
              off={t('admin.ops.billingPolicies.blockLateOff', 'No late fee set')}
              summary={t('admin.ops.billingPolicies.blockLateSummary', '{amount} for unpaid cycles past grace', { amount: formatBdtWithSymbol(preview.data.lateFee.amount) })}
            />
            <PreviewBlock
              title={t('admin.ops.billingPolicies.blockReconnect', 'Reconnection fees to raise')}
              icon={<Plug className="h-3.5 w-3.5 text-emerald-500" />}
              section={preview.data.reconnectionFee}
              off={t('admin.ops.billingPolicies.blockReconnectOff', 'No reconnection fee set')}
              summary={t('admin.ops.billingPolicies.blockReconnectSummary', '{amount} now · {count} cut lines owe it on renewal', {
                amount: formatBdtWithSymbol(preview.data.reconnectionFee.amount),
                count: formatCount(preview.data.reconnectionFee.awaiting),
              })}
            />
          </div>
        )}
      </Card>

      {/* Charges raised by the policy */}
      <div className="space-y-3">
        <div>
          <p className="text-sm font-bold text-foreground">{t('admin.ops.billingPolicies.chargesTitle', 'Policy charges')}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {preview.data
              ? t('admin.ops.billingPolicies.chargesSummary', '{pending} pending ({amount}) · {waived} waived', {
                  pending: formatCount(preview.data.charges.pendingCount),
                  amount: formatBdtWithSymbol(preview.data.charges.pendingAmount),
                  waived: formatCount(preview.data.charges.waivedCount),
                })
              : t('admin.ops.billingPolicies.chargesHint', 'Late and reconnection fees raised by the policy')}
          </p>
        </div>

        {charges.isError ? (
          <EmptyState variant="error"
            title={t('admin.ops.billingPolicies.chargesFailed', 'Failed to load policy charges')}
            description={errorMessage(charges.error)}
            actionLabel={t('common.retry', 'Retry')}
            onAction={() => charges.refetch()}
          />
        ) : (
          <DataTable
            urlState
            className={cn(charges.isFetching && 'opacity-80')}
            columns={chargeColumns}
            data={charges.data?.items ?? []}
            isLoading={charges.isLoading && !charges.data}
            getRowId={(c) => String(c.id)}
            enableColumnVisibility={false}
            searchPlaceholder={t('admin.ops.billingPolicies.searchPlaceholder', 'Customer, mobile or charge #…')}
            emptyTitle={t('admin.ops.billingPolicies.emptyTitle', 'No policy charges')}
            emptyDescription={
              chargeSearch
                ? t('admin.ops.billingPolicies.emptySearch', 'No charges match your search.')
                : t('admin.ops.billingPolicies.emptyHint', 'Charges appear here once the policy raises a late or reconnection fee.')
            }
            toolbarActions={
              <>
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
                          'text-xs h-6 px-2 font-medium capitalize',
                          group.value === o ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
                        )}
                      >
                        {o === 'late_fee' || o === 'reconnection_fee' ? kindLabel(t, o) : optionLabel(o)}
                      </Button>
                    ))}
                  </div>
                ))}
              </>
            }
            server={{
              page,
              pageSize: perPage,
              total: chargeTotal,
              onPageChange: setPage,
              onPageSizeChange: (n) => {
                setPerPage(n);
                setPage(1);
              },
              search: chargeSearch,
              onSearchChange: (value) => {
                setChargeSearch(value);
                setPage(1);
              },
            }}
          />
        )}
      </div>

      <ConfirmDialog
        open={toWaive !== null}
        onOpenChange={(open) => !open && setToWaive(null)}
        title={t('admin.ops.billingPolicies.waiveTitle', 'Waive this charge?')}
        description={
          toWaive
            ? t('admin.ops.billingPolicies.waiveDesc', '{kind} of {amount} for {name} will no longer be owed.', {
                kind: kindLabel(t, toWaive.kind),
                amount: formatBdtWithSymbol(toWaive.amount),
                name: customerName(t, toWaive.customerName, toWaive.customerId),
              })
            : undefined
        }
        confirmLabel={waive.isPending ? t('admin.ops.billingPolicies.waiving', 'Waiving…') : t('admin.ops.billingPolicies.waiveCharge', 'Waive charge')}
        onConfirm={confirmWaive}
      />

      <Dialog open={toCollect !== null} onOpenChange={(open) => !open && setToCollect(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('admin.ops.billingPolicies.collectTitle', 'Mark charge as collected')}</DialogTitle>
            <DialogDescription>
              {toCollect
                ? t('admin.ops.billingPolicies.collectDesc', '{kind} of {amount} for {name}.', {
                    kind: kindLabel(t, toCollect.kind),
                    amount: formatBdtWithSymbol(toCollect.amount),
                    name: customerName(t, toCollect.customerName, toCollect.customerId),
                  })
                : null}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-1">
            <div className="space-y-1.5">
              <Label htmlFor="collect-payment">{t('admin.ops.billingPolicies.paymentId', 'Payment ID (optional)')}</Label>
              <Input
                id="collect-payment"
                inputMode="numeric"
                placeholder={t('admin.ops.billingPolicies.paymentIdHint', 'Successful payment that included this fee')}
                value={collectPaymentId}
                onChange={(e) => setCollectPaymentId(e.target.value.replace(/[^0-9]/g, ''))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="collect-note">{t('admin.ops.billingPolicies.noteOptional', 'Note (optional)')}</Label>
              <Input id="collect-note" value={collectNote} onChange={(e) => setCollectNote(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setToCollect(null)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button onClick={confirmCollect} disabled={markPaid.isPending}>
              {markPaid.isPending ? t('admin.ops.billingPolicies.saving', 'Saving…') : t('admin.ops.billingPolicies.markCollected', 'Mark collected')}
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
                  className="w-fit text-xs font-semibold uppercase px-2 py-0.5 border-primary/30 text-primary"
                >
                  {t('admin.ops.billingPolicies.sheetBadge', 'Policy Configuration')}
                </Badge>
                <SheetTitle className="text-xl font-bold text-foreground mt-2">{t('admin.ops.billingPolicies.title', 'Billing Policy')}</SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  {t('admin.ops.billingPolicies.sheetDesc', 'Applies to every customer of your account.')}
                </SheetDescription>
              </SheetHeader>

              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="bp-cycle" className="font-semibold text-foreground">{t('admin.ops.billingPolicies.fieldCycleDay', 'Billing Cycle Day')}</label>
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
                    <p className="text-xs text-muted-foreground">1–28</p>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="bp-grace" className="font-semibold text-foreground">{t('admin.ops.billingPolicies.fieldGrace', 'Grace Period (Days)')}</label>
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
                      <p className="font-semibold text-foreground">{t('admin.ops.billingPolicies.fieldAutoSuspend', 'Automatic Line Suspension')}</p>
                      <p className="text-xs text-muted-foreground">{t('admin.ops.billingPolicies.fieldAutoSuspendHint', 'Disconnect lines still online after this many days')}</p>
                    </div>
                    <Switch aria-label={t('admin.ops.billingPolicies.fieldAutoSuspend', 'Automatic Line Suspension')} checked={form.autoSuspendOn} onCheckedChange={(v) => set('autoSuspendOn', Boolean(v))} />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="bp-suspend" className="font-semibold text-foreground">{t('admin.ops.billingPolicies.fieldSuspendAfter', 'Suspend After (Days)')}</label>
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
                    <p className="text-xs text-muted-foreground">{t('admin.ops.billingPolicies.fieldSuspendHint', 'Must not be shorter than the grace period.')}</p>
                  </div>
                </Card>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="bp-late-amt" className="font-semibold text-foreground">{t('admin.ops.billingPolicies.fieldLateAmount', 'Late Fee (৳)')}</label>
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
                    <label htmlFor="bp-late-pct" className="font-semibold text-foreground">{t('admin.ops.billingPolicies.fieldLatePercent', 'Late Fee (%)')}</label>
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
                  <label htmlFor="bp-reconnect" className="font-semibold text-foreground">{t('admin.ops.billingPolicies.fieldReconnection', 'Reconnection Fee (৳)')}</label>
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
                    {save.isPending ? t('admin.ops.billingPolicies.saving', 'Saving…') : t('admin.ops.billingPolicies.savePolicy', 'Save Policy')}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setForm(null)}
                    className="w-full text-xs h-9 border-border/80 hover:bg-accent"
                  >
                    {t('common.cancel', 'Cancel')}
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
