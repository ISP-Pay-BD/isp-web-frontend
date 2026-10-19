'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/features/admin/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { OpsSummaryStrip } from '@/components/shared/OpsSummaryStrip';
import { DataTable } from '@/features/shared/data-table';
import { toast } from 'sonner';
import { BellRing, Plus, CheckCircle2, Gauge, Sliders, Edit, Trash2, Play, History } from 'lucide-react';
import { http } from '@/lib/api/client';
import { str } from '@/lib/api/case';
import { getResellerId } from '@/lib/api/auth-utils';
import { formatDateTime } from '@/lib/format';
import { useTranslations } from '@/i18n/locale-context';
import {
  useDeleteUsageAlertRule,
  useRunUsageAlerts,
  useSaveUsageAlertRule,
  useUsageAlertLog,
  useUsageAlertRules,
} from '@/features/admin/sms/hooks/use-dunning';
import { useSmsTemplateOptions } from '@/features/admin/sms/hooks/use-sms';
import type { MessageChannel, UsageAlertInput, UsageAlertLogRow, UsageAlertRule } from '@/features/admin/sms/types';

const EMPTY_RULE: UsageAlertInput = {
  name: '',
  quotaGb: 100,
  thresholdPct: 80,
  packageId: '',
  channel: 'sms',
  templateId: '',
  message: 'Dear {name}, you have used {usage_gb}GB ({usage_pct}%) of your {quota_gb}GB monthly data.',
  active: true,
};

/** Tenant packages for the optional rule scope. */
function usePackageOptions() {
  return useQuery({
    queryKey: ['admin', 'usage-alerts', 'package-options'],
    queryFn: async () => {
      const res = await http.getPage<unknown>(`/v1/reseller/packages/${getResellerId()}`, { per_page: 100 });
      return res.items.map((raw) => {
        const r = (raw ?? {}) as Record<string, unknown>;
        return { id: str(r.id), name: str(r.package_name ?? r.name) };
      });
    },
    staleTime: 5 * 60_000,
  });
}

export function UsageAlertsPage() {
  const t = useTranslations();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [logPage, setLogPage] = useState(1);
  const [logPageSize, setLogPageSize] = useState(10);
  const [logSearch, setLogSearch] = useState('');

  const rulesQuery = useUsageAlertRules({ page, pageSize, search });
  const logQuery = useUsageAlertLog({ page: logPage, pageSize: logPageSize, search: logSearch });
  const templates = useSmsTemplateOptions();
  const packages = usePackageOptions();
  const saveRule = useSaveUsageAlertRule();
  const deleteRule = useDeleteUsageAlertRule();
  const runAlerts = useRunUsageAlerts();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<UsageAlertRule | null>(null);
  const [form, setForm] = useState<UsageAlertInput>(EMPTY_RULE);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openEditor = (rule: UsageAlertRule | null) => {
    setEditing(rule);
    setForm(
      rule
        ? {
            name: rule.name,
            quotaGb: rule.quotaGb,
            thresholdPct: rule.thresholdPct,
            packageId: rule.packageId,
            channel: rule.channel,
            templateId: rule.templateId,
            message: rule.message,
            active: rule.active,
          }
        : EMPTY_RULE,
    );
    setModalOpen(true);
  };

  const toggleRule = (rule: UsageAlertRule) =>
    saveRule.mutate(
      {
        id: rule.id,
        input: {
          name: rule.name,
          quotaGb: rule.quotaGb,
          thresholdPct: rule.thresholdPct,
          packageId: rule.packageId,
          channel: rule.channel,
          templateId: rule.templateId,
          message: rule.message,
          active: !rule.active,
        },
      },
      {
        onSuccess: () =>
          toast.success(
            !rule.active
              ? t('admin.ops.usageAlerts.ruleActivated', 'Rule "{name}" activated', { name: rule.name })
              : t('admin.ops.usageAlerts.ruleDisabled', 'Rule "{name}" disabled', { name: rule.name }),
          ),
      },
    );

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error(t('admin.ops.usageAlerts.nameRequired', 'Rule name is required'));
      return;
    }
    if (!form.templateId && !form.message.trim()) {
      toast.error(t('admin.ops.usageAlerts.messageRequired', 'Choose a template or write a message'));
      return;
    }
    saveRule.mutate(
      { id: editing?.id, input: { ...form, name: form.name.trim() } },
      {
        onSuccess: () => {
          toast.success(
            editing
              ? t('admin.ops.usageAlerts.ruleUpdated', 'Usage alert rule updated')
              : t('admin.ops.usageAlerts.ruleCreated', 'Usage alert rule "{name}" created', { name: form.name.trim() }),
          );
          setModalOpen(false);
        },
      },
    );
  };

  const columns = useMemo<LegacyColumnDef<UsageAlertRule, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('admin.ops.usageAlerts.colRule', 'Rule Title & Policy'),
        size: 220,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
              <Gauge className="h-4 w-4" />
            </div>
            <div>
              <span className="font-semibold text-xs text-foreground block">{row.original.name}</span>
              <span className="text-xs text-muted-foreground">
                {t('admin.ops.usageAlerts.quotaLine', '{gb} GB monthly quota · {pkg}', {
                  gb: row.original.quotaGb,
                  pkg: row.original.packageName || t('admin.ops.usageAlerts.allPackages', 'All packages'),
                })}
              </span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'thresholdPct',
        header: t('admin.ops.usageAlerts.colThreshold', 'Quota Threshold'),
        size: 180,
        cell: ({ row }) => {
          const pct = row.original.thresholdPct;
          return (
            <div className="space-y-1 w-full max-w-[140px]">
              <div className="flex justify-between text-xs font-mono">
                <span className="font-semibold text-foreground">{t('admin.ops.usageAlerts.quotaReached', '{pct}% Quota Reached', { pct })}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full ${pct >= 100 ? 'bg-destructive' : pct >= 80 ? 'bg-amber-500' : 'bg-primary'}`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'channel',
        header: t('admin.ops.usageAlerts.colChannel', 'Dispatch Channel'),
        size: 140,
        cell: ({ row }) => (
          <Badge variant="outline" className="text-xs font-mono uppercase">
            {row.original.channel}
          </Badge>
        ),
      },
      {
        accessorKey: 'active',
        header: t('admin.ops.usageAlerts.colTrigger', 'Trigger Status'),
        size: 140,
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <Switch aria-label={t('admin.ops.usageAlerts.ruleActive', 'Rule active')} checked={row.original.active} onCheckedChange={() => toggleRule(row.original)} />
            <Badge
              variant={row.original.active ? 'default' : 'secondary'}
              tone={row.original.active ? 'success' : undefined} className="text-xs font-mono"
            >
              {row.original.active ? t('status.active', 'Active') : t('status.disabled', 'Disabled')}
            </Badge>
          </div>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">{t('admin.customers.list.colActions', 'Actions')}</span>,
        size: 100,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditor(row.original)} title={t('admin.ops.usageAlerts.editRule', 'Edit rule')} aria-label={t('admin.ops.usageAlerts.editRule', 'Edit rule')}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:bg-destructive/10"
              onClick={() => setDeleteId(row.original.id)}
              title={t('admin.ops.usageAlerts.deleteRule', 'Delete rule')}
              aria-label={t('admin.ops.usageAlerts.deleteRule', 'Delete rule')}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t],
  );

  const logColumns = useMemo<LegacyColumnDef<UsageAlertLogRow, unknown>[]>(
    () => [
      {
        accessorKey: 'customerName',
        header: t('admin.ops.usageAlerts.colCustomer', 'Customer'),
        size: 180,
        cell: ({ row }) => (
          <div>
            <span className="font-semibold text-xs block">{row.original.customerName || '—'}</span>
            <span className="text-xs text-muted-foreground font-mono">{row.original.mobile}</span>
          </div>
        ),
      },
      { accessorKey: 'ruleName', header: t('admin.ops.usageAlerts.logRule', 'Rule'), size: 160, cell: ({ row }) => <span className="text-xs">{row.original.ruleName || '—'}</span> },
      {
        accessorKey: 'usageGb',
        header: t('admin.ops.usageAlerts.colUsage', 'Usage'),
        size: 140,
        cell: ({ row }) => (
          <span className="text-xs font-mono">
            {row.original.usageGb} / {row.original.quotaGb} GB
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: t('admin.ops.usageAlerts.colDelivery', 'Delivery'),
        size: 100,
        cell: ({ row }) => (
          <Badge variant={row.original.status === 'failed' ? 'destructive' : row.original.status === 'sent' ? 'default' : 'secondary'} className="text-xs capitalize">
            {t(`status.${row.original.status}`, row.original.status)}
          </Badge>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: t('admin.ops.usageAlerts.colAlerted', 'Alerted'),
        size: 150,
        cell: ({ row }) => (
          <span className="text-xs font-mono text-muted-foreground">{row.original.createdAt ? formatDateTime(row.original.createdAt) : '—'}</span>
        ),
      },
    ],
    [t],
  );

  if (rulesQuery.isLoading) return <PageSkeleton variant="table" />;
  if (rulesQuery.isError && !rulesQuery.data) {
    return <EmptyState variant="error" title={t('admin.ops.usageAlerts.loadFailed', 'Failed to load usage alert rules')} actionLabel={t('admin.customers.list.retry', 'Retry')} onAction={() => rulesQuery.refetch()} />;
  }

  const stats = rulesQuery.data?.stats;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('admin.ops.usageAlerts.title', 'Usage Alert & FUP Rules')}
        subtitle={t('admin.ops.usageAlerts.subtitle', 'Notify subscribers automatically when their monthly data usage crosses a quota threshold')}
        breadcrumb={[
          { label: t('common.crumb.dashboard', 'Dashboard'), url: '/admin/dashboard' },
          { label: t('common.crumb.engagement', 'Engagement') },
          { label: t('admin.ops.usageAlerts.crumb', 'Usage Alerts') },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              disabled={runAlerts.isPending || !stats?.activeRules}
              onClick={() => runAlerts.mutate(undefined, { onSuccess: (r) => toast.success(t('admin.ops.usageAlerts.alertsQueued', '{n} usage alert(s) queued', { n: r.alerted })) })}
            >
              <Play className="h-4 w-4" />
              {t('admin.ops.usageAlerts.evaluateNow', 'Evaluate Now')}
            </Button>
            <Button className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => openEditor(null)}>
              <Plus className="h-4 w-4" />
              {t('admin.ops.usageAlerts.createRule', 'Create Alert Rule')}
            </Button>
          </div>
        }
      />

      <OpsSummaryStrip
        items={[
          { label: t('admin.ops.usageAlerts.kpiTotal', 'Total FUP Rules'), value: stats?.totalRules ?? 0 },
          { label: t('admin.ops.usageAlerts.kpiActive', 'Active Warning Rules'), value: t('admin.ops.usageAlerts.enabledCount', '{n} Enabled', { n: stats?.activeRules ?? 0 }) },
          { label: t('admin.ops.usageAlerts.kpiToday', 'Alerts Today'), value: stats?.alertsToday ?? 0 },
          { label: t('admin.ops.usageAlerts.kpiMonth', 'Alerts This Month'), value: stats?.alertsThisMonth ?? 0 },
          { label: t('admin.ops.usageAlerts.kpiUsageData', 'Usage Data'), value: stats?.usageDataAvailable ? t('admin.ops.usageAlerts.collected', 'Collected') : t('admin.ops.usageAlerts.notCollected', 'Not collected yet') },
        ]}
      />

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BellRing className="h-4 w-4 text-primary" />
            {t('admin.ops.usageAlerts.rulesCardTitle', 'Data Consumption Notification Rules')}
          </CardTitle>
          <CardDescription>
            {t('admin.ops.usageAlerts.rulesCardDesc', "Evaluated by the scheduled usage-alert job against each customer's usage since the 1st of the month; one alert per rule per customer per month")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={rulesQuery.data?.items ?? []}
            getRowId={(row) => row.id}
            searchKey="name"
            searchPlaceholder={t('admin.ops.usageAlerts.searchRules', 'Search rules by name...')}
            emptyTitle={t('admin.ops.usageAlerts.emptyRules', 'No usage alert rules')}
            emptyDescription={t('admin.ops.usageAlerts.emptyRulesHint', 'Create a rule such as “80% of 100 GB” to start alerting subscribers.')}
            enableColumnVisibility={false}
            server={{
              page,
              pageSize,
              total: rulesQuery.data?.meta.total ?? 0,
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
              <Button size="sm" onClick={() => openEditor(null)} className="gap-1.5">
                <Plus className="h-4 w-4" />
                {t('admin.ops.usageAlerts.newRule', 'New Rule')}
              </Button>
            }
          />
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            {t('admin.ops.usageAlerts.logTitle', 'Alerts Sent')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logQuery.isError ? (
            <EmptyState variant="error" title={t('admin.ops.usageAlerts.logLoadFailed', 'Could not load alert history')} actionLabel={t('admin.customers.list.retry', 'Retry')} onAction={() => logQuery.refetch()} />
          ) : (
            <DataTable
              columns={logColumns}
              data={logQuery.data?.items ?? []}
              isLoading={logQuery.isLoading}
              getRowId={(row) => row.id}
              searchKey="customerName"
              searchPlaceholder={t('admin.ops.usageAlerts.searchLog', 'Search by customer or phone...')}
              emptyTitle={t('admin.ops.usageAlerts.emptyLog', 'No alerts sent yet')}
              enableColumnVisibility={false}
              server={{
                page: logPage,
                pageSize: logPageSize,
                total: logQuery.data?.meta.total ?? 0,
                onPageChange: setLogPage,
                onPageSizeChange: (size) => {
                  setLogPageSize(size);
                  setLogPage(1);
                },
                search: logSearch,
                onSearchChange: (q) => {
                  setLogSearch(q);
                  setLogPage(1);
                },
              }}
            />
          )}
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sliders className="h-5 w-5 text-primary" />
              {editing ? t('admin.ops.usageAlerts.editTitle', 'Edit Usage Alert Rule') : t('admin.ops.usageAlerts.newTitle', 'Configure Usage Alert Rule')}
            </DialogTitle>
            <DialogDescription>{t('admin.ops.usageAlerts.dialogDesc', 'Set the monthly data quota, threshold and delivery channel.')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-2">
              <Label htmlFor="rule-title" className="text-xs font-semibold">{t('admin.ops.usageAlerts.fieldTitle', 'Rule Title')}</Label>
              <Input id="rule-title" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t('admin.ops.usageAlerts.fieldTitlePh', 'e.g. 90% Data Cap Warning')} className="text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="monthly-quota-gb" className="text-xs font-semibold">{t('admin.ops.usageAlerts.fieldQuota', 'Monthly Quota (GB)')}</Label>
                <Input id="monthly-quota-gb"
                  type="number"
                  min="1"
                  value={form.quotaGb}
                  onChange={(e) => setForm({ ...form, quotaGb: Number(e.target.value) })}
                  className="font-mono text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="threshold" className="text-xs font-semibold">{t('admin.ops.usageAlerts.fieldThreshold', 'Threshold (%)')}</Label>
                <Input id="threshold"
                  type="number"
                  min="1"
                  max="100"
                  value={form.thresholdPct}
                  onChange={(e) => setForm({ ...form, thresholdPct: Number(e.target.value) })}
                  className="font-mono text-xs"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="applies-to" className="text-xs font-semibold">{t('admin.ops.usageAlerts.fieldAppliesTo', 'Applies To')}</Label>
                <Select
                  value={form.packageId || 'all'}
                  onValueChange={(v) => setForm({ ...form, packageId: v && v !== 'all' ? v : '' })}
                  items={{ all: t('admin.ops.usageAlerts.allPackages', 'All packages'), ...Object.fromEntries((packages.data ?? []).map((p) => [p.id, p.name])) }}
                >
                  <SelectTrigger id="applies-to" className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('admin.ops.usageAlerts.allPackages', 'All packages')}</SelectItem>
                    {(packages.data ?? []).map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="channel" className="text-xs font-semibold">{t('admin.ops.usageAlerts.fieldChannel', 'Channel')}</Label>
                <Select value={form.channel} onValueChange={(v) => v && setForm({ ...form, channel: v as MessageChannel })} items={{ sms: 'SMS', whatsapp: 'WhatsApp' }}>
                  <SelectTrigger id="channel" className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="template" className="text-xs font-semibold">{t('admin.ops.usageAlerts.fieldTemplate', 'Template')}</Label>
              <Select
                value={form.templateId || 'custom'}
                onValueChange={(v) => setForm({ ...form, templateId: v && v !== 'custom' ? v : '' })}
                items={{ custom: t('admin.ops.usageAlerts.customMessage', 'Custom message'), ...Object.fromEntries((templates.data ?? []).map((tpl) => [tpl.id, tpl.templateName])) }}
              >
                <SelectTrigger id="template" className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">{t('admin.ops.usageAlerts.customMessage', 'Custom message')}</SelectItem>
                  {(templates.data ?? []).map((tpl) => (
                    <SelectItem key={tpl.id} value={tpl.id}>
                      {tpl.templateName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!form.templateId && (
              <div className="space-y-2">
                <Label htmlFor="message" className="text-xs font-semibold">{t('admin.ops.usageAlerts.fieldMessage', 'Message')}</Label>
                <Textarea id="message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="h-20 text-xs font-mono" />
                <p className="text-xs text-muted-foreground">{t('admin.ops.usageAlerts.extraVars', 'Extra variables:')} {'{usage_gb}'}, {'{quota_gb}'}, {'{usage_pct}'}</p>
              </div>
            )}
            <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
              <span className="font-semibold">{t('admin.ops.usageAlerts.ruleActive', 'Rule active')}</span>
              <Switch aria-label={t('admin.ops.usageAlerts.ruleActive', 'Rule active')} checked={form.active} onCheckedChange={(c) => setForm({ ...form, active: c })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button onClick={handleSave} disabled={saveRule.isPending} className="gap-1.5 bg-primary text-primary-foreground">
              <CheckCircle2 className="h-4 w-4" />
              {saveRule.isPending ? t('admin.ops.usageAlerts.saving', 'Saving…') : t('admin.ops.usageAlerts.saveRule', 'Save Rule')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t('admin.ops.usageAlerts.deleteTitle', 'Delete usage alert rule')}
        description={t('admin.ops.usageAlerts.deleteDesc', 'Alerts already sent stay in the history; the rule stops running.')}
        confirmLabel={t('common.delete', 'Delete')}
        destructive
        onConfirm={() => {
          if (!deleteId) return;
          deleteRule.mutate(deleteId, {
            onSuccess: () => {
              toast.success(t('admin.ops.usageAlerts.ruleDeleted', 'Usage alert rule deleted'));
              setDeleteId(null);
            },
          });
        }}
      />
    </div>
  );
}
