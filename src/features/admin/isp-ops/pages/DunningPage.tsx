'use client';

import { useState } from 'react';
import { Clock, Plus, Sliders, Play, Check, X, Trash2, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { toneClasses } from '@/components/shared/status-tones';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/format';
import { useTranslations } from '@/i18n/locale-context';
import {
  useDeleteDunningRule,
  useDunningRules,
  useRunDunning,
  useSaveDunningRule,
} from '@/features/admin/sms/hooks/use-dunning';
import { useSmsOverview, useSmsTemplateOptions, useTestSms } from '@/features/admin/sms/hooks/use-sms';
import type { DunningRule, DunningRuleInput, MessageChannel } from '@/features/admin/sms/types';

type Translate = ReturnType<typeof useTranslations>;

const offsetLabel = (t: Translate, d: number) =>
  d === 0
    ? t('admin.ops.dunning.offsetZero', 'Day 0 (Expiry)')
    : d < 0
      ? t('admin.ops.dunning.offsetBefore', 'Day {d} (Before)', { d })
      : t('admin.ops.dunning.offsetAfter', 'Day +{d} (Overdue)', { d });
const offsetShort = (t: Translate, d: number) =>
  d === 0
    ? t('admin.ops.dunning.offsetShortZero', 'Day 0')
    : d < 0
      ? t('admin.ops.dunning.offsetShortBefore', '{d} Days', { d })
      : t('admin.ops.dunning.offsetShortAfter', '+{d} Days', { d });

const EMPTY_FORM: DunningRuleInput = { name: '', daysOffset: -3, channel: 'sms', templateId: '', message: '', active: true };

export function DunningPage() {
  const t = useTranslations();
  const rules = useDunningRules();
  const templates = useSmsTemplateOptions();
  const overview = useSmsOverview();
  const saveRule = useSaveDunningRule();
  const deleteRule = useDeleteDunningRule();
  const runDunning = useRunDunning();
  const testSms = useTestSms();

  const [editing, setEditing] = useState<DunningRule | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState<DunningRuleInput>(EMPTY_FORM);
  const [testPhone, setTestPhone] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const steps = rules.data?.items ?? [];
  const enabledCount = steps.filter((s) => s.active).length;
  const templateBody = (id: string) => (templates.data ?? []).find((tpl) => tpl.id === id)?.messageBody ?? '';

  const openEditor = (rule: DunningRule | null) => {
    setEditing(rule);
    setForm(
      rule
        ? { name: rule.name, daysOffset: rule.daysOffset, channel: rule.channel, templateId: rule.templateId, message: rule.message, active: rule.active }
        : EMPTY_FORM,
    );
    setSheetOpen(true);
  };

  const handleToggle = (step: DunningRule, e?: React.MouseEvent) => {
    e?.stopPropagation();
    saveRule.mutate(
      {
        id: step.id,
        input: { name: step.name, daysOffset: step.daysOffset, channel: step.channel, templateId: step.templateId, message: step.message, active: !step.active },
      },
      {
        onSuccess: () =>
          toast.success(
            !step.active
              ? t('admin.ops.dunning.toggledOn', '{name}: automation enabled', { name: step.name })
              : t('admin.ops.dunning.toggledOff', '{name}: automation disabled', { name: step.name }),
          ),
      },
    );
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error(t('admin.ops.dunning.errName', 'Enter a step name'));
      return;
    }
    if (!form.templateId && !form.message.trim()) {
      toast.error(t('admin.ops.dunning.errTemplate', 'Choose a template or write a message'));
      return;
    }
    saveRule.mutate(
      { id: editing?.id, input: { ...form, name: form.name.trim() } },
      {
        onSuccess: () => {
          toast.success(t('admin.ops.dunning.saved', 'Dunning step "{name}" saved', { name: form.name.trim() }));
          setSheetOpen(false);
        },
      },
    );
  };

  const handleTestSend = () => {
    const content = form.templateId ? templateBody(form.templateId) : form.message;
    if (!content.trim()) {
      toast.error(t('admin.ops.dunning.errNothing', 'Nothing to send — choose a template or write a message'));
      return;
    }
    if (!testPhone.trim()) {
      toast.error(t('admin.ops.dunning.errPhone', 'Enter a phone number for the test'));
      return;
    }
    testSms.mutate(
      { mobile: testPhone.trim(), content },
      { onSuccess: () => toast.success(t('admin.ops.dunning.testSent', 'Test SMS sent to {phone}', { phone: testPhone.trim() })) },
    );
  };

  if (rules.isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (rules.isError && !rules.data) {
    return (
      <EmptyState variant="error"
        title={t('admin.ops.dunning.loadFailed', 'Failed to load dunning schedule')}
        description={t('admin.ops.dunning.loadFailedHint', 'Could not load the escalation rules.')}
        actionLabel={t('common.retry', 'Retry')}
        onAction={() => rules.refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 w-full pb-20">
      <PageHeader
        title={t('admin.ops.dunning.title', 'Dunning & Collection Timeline')}
        subtitle={t(
          'admin.ops.dunning.subtitle',
          "Automated SMS / WhatsApp reminders relative to each customer's expiry date — queued by the daily dunning job and delivered by the message queue.",
        )}
        breadcrumb={[
          { label: t('admin.customers.list.breadcrumbAdmin', 'Admin'), url: '/admin/dashboard' },
          { label: t('common.crumb.billing', 'Billing') },
          { label: t('admin.ops.dunning.crumb', 'Dunning Schedule') },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={runDunning.isPending || enabledCount === 0}
              onClick={() =>
                runDunning.mutate(undefined, {
                  onSuccess: (res) =>
                    toast.success(t('admin.ops.dunning.runDone', '{queued} reminder(s) queued from {rules} active rule(s)', { queued: res.queued, rules: res.rules })),
                })
              }
              className="text-xs h-8 border-border/80 hover:bg-accent"
            >
              <RefreshCw className={cn('mr-1.5 h-3.5 w-3.5 text-muted-foreground', runDunning.isPending && 'animate-spin')} />
              {t('admin.ops.dunning.runToday', "Run Today's Reminders")}
            </Button>
            <Button
              size="sm"
              onClick={() => openEditor(null)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-8 gap-1.5 shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" /> {t('admin.ops.dunning.addStep', 'Add Escalation Step')}
            </Button>
          </div>
        }
      />

      {steps.length === 0 ? (
        <EmptyState
          title={t('admin.ops.dunning.emptyTitle', 'No dunning steps yet')}
          description={t('admin.ops.dunning.emptyHint', 'Add a step such as “3 days before expiry, SMS reminder” — it runs automatically every day.')}
          actionLabel={t('admin.ops.dunning.addStep', 'Add Escalation Step')}
          onAction={() => openEditor(null)}
        />
      ) : (
        <>
          <Card className="border-border/80 bg-card/60 backdrop-blur-xs shadow-sm overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">{t('admin.ops.dunning.journey', 'Automated Collection Journey')}</h3>
                </div>
                <Badge variant="outline" className="text-xs px-2 py-0.5 font-semibold">
                  {t('admin.ops.dunning.stepsActive', '{a} of {b} steps active', { a: enabledCount, b: steps.length })}
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
                {steps.map((step, idx) => {
                  const isPastDue = step.daysOffset > 0;
                  const isZero = step.daysOffset === 0;
                  return (
                    <div
                      key={step.id}
                      onClick={() => openEditor(step)}
                      className={cn(
                        'p-3.5 rounded-lg border transition cursor-pointer relative group flex flex-col justify-between',
                        !step.active && 'opacity-60',
                        isPastDue
                          ? 'border-rose-500/30 bg-rose-500/5 hover:border-rose-500/60'
                          : isZero
                            ? 'border-amber-500/30 bg-amber-500/5 hover:border-amber-500/60'
                            : 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/60',
                      )}
                    >
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-x-2 text-xs font-bold font-mono">
                          <span className={cn(isPastDue ? 'text-rose-500' : isZero ? 'text-amber-500' : 'text-emerald-500')}>
                            {offsetLabel(t, step.daysOffset)}
                          </span>
                          <span className="text-xs text-muted-foreground">{t('admin.ops.dunning.stepN', 'Step {n}', { n: idx + 1 })}</span>
                        </div>
                        <h4 className="text-xs font-bold text-foreground mt-1.5 leading-snug">{step.name}</h4>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-border/60">
                        <Badge variant="secondary" className="px-1.5 py-0 text-xs font-semibold uppercase">
                          {step.channel}
                        </Badge>
                        <span className="text-muted-foreground group-hover:text-primary transition-colors">{t('admin.ops.dunning.editArrow', 'Edit →')}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm bg-card overflow-hidden">
            <div className="p-4 border-b border-border/80 flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('admin.ops.dunning.rulesTitle', 'Configured Escalation Rules & Templates')}</h4>
              <span className="text-xs text-muted-foreground">
                {t('admin.ops.dunning.rulesEnabled', '{a} of {b} rules enabled', { a: enabledCount, b: steps.length })}
              </span>
            </div>

            <ul className="divide-y divide-border/60 md:hidden">
              {steps.map((step) => (
                <li key={step.id} onClick={() => openEditor(step)} className="cursor-pointer space-y-2.5 p-4 transition-colors hover:bg-muted/30">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="font-mono text-xs font-bold text-foreground">{offsetShort(t, step.daysOffset)}</span>
                      <p className="mt-0.5 text-sm font-bold text-foreground">{step.name}</p>
                    </div>
                    <Badge
                      variant="outline"
                      tone={step.channel === 'whatsapp' ? 'success' : step.channel === 'sms' ? 'info' : undefined}
                      className="shrink-0 text-xs font-semibold uppercase"
                    >
                      {step.channel}
                    </Badge>
                  </div>
                  <div className="min-w-0">
                    {step.templateName && <div className="text-xs font-semibold text-foreground">{step.templateName}</div>}
                    <p className="line-clamp-3 break-words font-mono text-xs text-muted-foreground">{step.message || templateBody(step.templateId) || '—'}</p>
                  </div>
                  <p className="font-mono text-xs text-muted-foreground">
                    {t('admin.ops.dunning.lastRun', 'Last run: {when}', { when: step.lastRunAt ? formatDateTime(step.lastRunAt) : t('admin.ops.dunning.never', 'Never') })}
                  </p>
                  <div className="flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                    <StepToggle step={step} pending={saveRule.isPending} onToggle={handleToggle} />
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEditor(step)} className="h-8 gap-1 px-2 text-xs font-medium text-primary hover:bg-primary/10">
                        <Sliders className="h-3.5 w-3.5" /> {t('common.edit', 'Edit')}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(step.id)}
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        title={t('admin.ops.dunning.deleteStep', 'Delete step')}
                        aria-label={t('admin.ops.dunning.deleteStep', 'Delete step')}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground font-semibold text-xs uppercase tracking-wider">
                    <th className="py-3 px-4">{t('admin.ops.dunning.thOffset', 'Timeline Offset')}</th>
                    <th className="py-3 px-4">{t('admin.ops.dunning.thStep', 'Escalation Step')}</th>
                    <th className="py-3 px-3">{t('admin.ops.dunning.thChannel', 'Channel')}</th>
                    <th className="py-3 px-4 min-w-[240px]">{t('admin.ops.dunning.thMessage', 'Message Template & Copy')}</th>
                    <th className="py-3 px-3">{t('admin.ops.dunning.thLastRun', 'Last Run')}</th>
                    <th className="py-3 px-3">{t('admin.ops.dunning.thStatus', 'Status')}</th>
                    <th className="py-3 px-3 text-right">{t('admin.customers.list.colActions', 'Actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {steps.map((step) => (
                    <tr key={step.id} onClick={() => openEditor(step)} className="hover:bg-muted/30 cursor-pointer transition-colors group">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-xs text-foreground">{offsetShort(t, step.daysOffset)}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-foreground text-sm">{step.name}</span>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <Badge
                          variant="outline"
                          tone={step.channel === 'whatsapp' ? 'success' : step.channel === 'sms' ? 'info' : undefined} className="text-xs font-semibold uppercase"
                        >
                          {step.channel}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        {step.templateName && <div className="text-xs font-semibold text-foreground">{step.templateName}</div>}
                        <p className="text-xs text-muted-foreground font-mono line-clamp-2 max-w-md">
                          {step.message || templateBody(step.templateId) || '—'}
                        </p>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap text-muted-foreground text-xs font-mono">
                        {step.lastRunAt ? formatDateTime(step.lastRunAt) : t('admin.ops.dunning.never', 'Never')}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <StepToggle step={step} pending={saveRule.isPending} onToggle={handleToggle} />
                      </td>
                      <td className="py-3.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditor(step)}
                            className="h-8 px-2 text-xs font-medium text-primary hover:bg-primary/10 gap-1"
                          >
                            <Sliders className="h-3.5 w-3.5" /> {t('common.edit', 'Edit')}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(step.id)}
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            title={t('admin.ops.dunning.deleteStep', 'Delete step')}
                            aria-label={t('admin.ops.dunning.deleteStep', 'Delete step')}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* Step editor */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto p-6 space-y-6">
          <SheetHeader>
            <Badge variant="outline" className="w-fit text-xs font-semibold uppercase px-2 py-0.5 border-primary/30 text-primary">
              {editing ? t('admin.ops.dunning.editStep', 'Edit Step') : t('admin.ops.dunning.newStep', 'New Step')}
            </Badge>
            <SheetTitle className="text-xl font-bold text-foreground mt-2">{editing ? editing.name : t('admin.ops.dunning.addStep', 'Add Escalation Step')}</SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground font-mono">
              {t('admin.ops.dunning.sheetMeta', '{offset} · Channel: {channel}', { offset: offsetLabel(t, form.daysOffset), channel: form.channel.toUpperCase() })}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-foreground">{t('admin.ops.dunning.fieldName', 'Step Name')}</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-9 text-xs" placeholder={t('admin.ops.dunning.fieldNameHint', 'e.g. Friendly reminder')} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">{t('admin.ops.dunning.fieldOffset', 'Day Offset')}</label>
                <Input
                  value={form.daysOffset}
                  onChange={(e) => setForm({ ...form, daysOffset: Number(e.target.value) || 0 })}
                  type="number"
                  min={-60}
                  max={90}
                  className="h-9 text-xs font-mono font-bold"
                />
                <p className="text-xs text-muted-foreground">{t('admin.ops.dunning.fieldOffsetHint', 'Negative = before expiry, 0 = expiry day')}</p>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-foreground">{t('admin.ops.dunning.thChannel', 'Channel')}</label>
                <Select value={form.channel} onValueChange={(v) => v && setForm({ ...form, channel: v as MessageChannel })}>
                  <SelectTrigger aria-label={t('admin.ops.dunning.thChannel', 'Channel')} className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sms">SMS Gateway</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">{t('admin.ops.dunning.fieldTemplate', 'SMS Template')}</label>
              <Select value={form.templateId || 'custom'} onValueChange={(v) => setForm({ ...form, templateId: v && v !== 'custom' ? v : '' })}>
                <SelectTrigger aria-label={t('admin.ops.dunning.templateAria', 'Template')} className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">{t('admin.ops.dunning.customMessage', 'Custom message below')}</SelectItem>
                  {(templates.data ?? []).map((tpl) => (
                    <SelectItem key={tpl.id} value={tpl.id}>
                      {tpl.templateName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.templateId && (
                <p className="text-xs text-muted-foreground font-mono bg-muted/30 rounded p-2">{templateBody(form.templateId)}</p>
              )}
            </div>

            {!form.templateId && (
              <div className="space-y-1">
                <label className="font-semibold text-foreground">{t('admin.ops.dunning.fieldBody', 'Message Body')}</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={4}
                  className="w-full rounded-md border border-border/80 bg-background p-2.5 text-xs font-mono text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                />
                {(overview.data?.variables ?? []).length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {t('admin.ops.dunning.variables', 'Available variables: {list}', { list: (overview.data?.variables ?? []).map((v) => v.tag).join(', ') })}
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
              <span className="font-semibold">{t('admin.ops.dunning.stepActive', 'Step active')}</span>
              <Switch aria-label={t('admin.ops.dunning.stepActive', 'Step active')} checked={form.active} onCheckedChange={(c) => setForm({ ...form, active: c })} />
            </div>

            {form.channel === 'sms' && (
              <div className="space-y-1.5 rounded-lg border border-border/60 p-3">
                <label className="font-semibold text-foreground">{t('admin.ops.dunning.testSms', 'Send a test SMS')}</label>
                <div className="flex gap-2">
                  <Input value={testPhone} onChange={(e) => setTestPhone(e.target.value)} placeholder="017xxxxxxxx" className="h-9 text-xs font-mono" />
                  <Button
                    type="button"
                    onClick={handleTestSend}
                    disabled={testSms.isPending}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs h-9 font-semibold gap-1.5"
                  >
                    <Play className="h-3.5 w-3.5" /> {t('admin.ops.dunning.test', 'Test')}
                  </Button>
                </div>
              </div>
            )}

            <Button
              onClick={handleSave}
              disabled={saveRule.isPending}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-9 font-semibold"
            >
              {saveRule.isPending ? t('admin.ops.dunning.saving', 'Saving…') : t('admin.ops.dunning.saveStep', 'Save Step')}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title={t('admin.ops.dunning.deleteTitle', 'Delete dunning step')}
        description={t('admin.ops.dunning.deleteDesc', 'Reminders already sent stay in the reminder log; this step will no longer run.')}
        confirmLabel={t('common.delete', 'Delete')}
        destructive
        onConfirm={() => {
          if (!deleteId) return;
          deleteRule.mutate(deleteId, {
            onSuccess: () => {
              toast.success(t('admin.ops.dunning.deleted', 'Dunning step deleted'));
              setDeleteId(null);
            },
          });
        }}
      />
    </div>
  );
}

function StepToggle({
  step,
  pending,
  onToggle,
}: {
  step: DunningRule;
  pending: boolean;
  onToggle: (step: DunningRule, e?: React.MouseEvent) => void;
}) {
  const t = useTranslations();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={(e) => onToggle(step, e)}
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold transition-colors',
        step.active ? toneClasses.success : 'border-border/80 bg-muted/60 text-muted-foreground',
      )}
    >
      {step.active ? (
        <>
          <Check className="h-3 w-3" /> {t('status.enabled', 'Enabled')}
        </>
      ) : (
        <>
          <X className="h-3 w-3" /> {t('status.disabled', 'Disabled')}
        </>
      )}
    </button>
  );
}
