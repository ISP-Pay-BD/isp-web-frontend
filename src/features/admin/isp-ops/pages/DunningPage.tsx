'use client';

import { useState } from 'react';
import { Clock, Plus, Sliders, Play, Check, X, Trash2, RefreshCw } from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
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
import {
  useDeleteDunningRule,
  useDunningRules,
  useRunDunning,
  useSaveDunningRule,
} from '@/features/admin/sms/hooks/use-dunning';
import { useSmsOverview, useSmsTemplateOptions, useTestSms } from '@/features/admin/sms/hooks/use-sms';
import type { DunningRule, DunningRuleInput, MessageChannel } from '@/features/admin/sms/types';

const offsetLabel = (d: number) => (d === 0 ? 'Day 0 (Expiry)' : d < 0 ? `Day ${d} (Before)` : `Day +${d} (Overdue)`);
const offsetShort = (d: number) => (d === 0 ? 'Day 0' : d < 0 ? `${d} Days` : `+${d} Days`);

const EMPTY_FORM: DunningRuleInput = { name: '', daysOffset: -3, channel: 'sms', templateId: '', message: '', active: true };

export function DunningPage() {
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
  const templateBody = (id: string) => (templates.data ?? []).find((t) => t.id === id)?.messageBody ?? '';

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
      { onSuccess: () => toast.success(`${step.name}: automation ${!step.active ? 'enabled' : 'disabled'}`) },
    );
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error('Enter a step name');
      return;
    }
    if (!form.templateId && !form.message.trim()) {
      toast.error('Choose a template or write a message');
      return;
    }
    saveRule.mutate(
      { id: editing?.id, input: { ...form, name: form.name.trim() } },
      {
        onSuccess: () => {
          toast.success(`Dunning step "${form.name.trim()}" saved`);
          setSheetOpen(false);
        },
      },
    );
  };

  const handleTestSend = () => {
    const content = form.templateId ? templateBody(form.templateId) : form.message;
    if (!content.trim()) {
      toast.error('Nothing to send — choose a template or write a message');
      return;
    }
    if (!testPhone.trim()) {
      toast.error('Enter a phone number for the test');
      return;
    }
    testSms.mutate(
      { mobile: testPhone.trim(), content },
      { onSuccess: () => toast.success(`Test SMS sent to ${testPhone.trim()}`) },
    );
  };

  if (rules.isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (rules.isError && !rules.data) {
    return (
      <EmptyState
        title="Failed to load dunning schedule"
        description="Could not load the escalation rules."
        actionLabel="Retry"
        onAction={() => rules.refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 w-full pb-20">
      <PageHeader
        title="Dunning & Collection Timeline"
        subtitle="Automated SMS / WhatsApp reminders relative to each customer's expiry date — queued by the daily dunning job and delivered by the message queue."
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Billing' },
          { label: 'Dunning Schedule' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={runDunning.isPending || enabledCount === 0}
              onClick={() =>
                runDunning.mutate(undefined, {
                  onSuccess: (res) => toast.success(`${res.queued} reminder(s) queued from ${res.rules} active rule(s)`),
                })
              }
              className="text-xs h-8 border-border/80 hover:bg-accent"
            >
              <RefreshCw className={cn('mr-1.5 h-3.5 w-3.5 text-muted-foreground', runDunning.isPending && 'animate-spin')} />
              Run Today&apos;s Reminders
            </Button>
            <Button
              size="sm"
              onClick={() => openEditor(null)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-8 gap-1.5 shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" /> Add Escalation Step
            </Button>
          </div>
        }
      />

      {steps.length === 0 ? (
        <EmptyState
          title="No dunning steps yet"
          description="Add a step such as “3 days before expiry, SMS reminder” — it runs automatically every day."
          actionLabel="Add Escalation Step"
          onAction={() => openEditor(null)}
        />
      ) : (
        <>
          <Card className="border-border/80 bg-card/60 backdrop-blur-xs shadow-sm overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Automated Collection Journey</h3>
                </div>
                <Badge variant="outline" className="text-[10px] px-2 py-0.5 font-semibold">
                  {enabledCount} of {steps.length} steps active
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
                        <div className="flex items-center justify-between text-[11px] font-bold font-mono">
                          <span className={cn(isPastDue ? 'text-rose-500' : isZero ? 'text-amber-500' : 'text-emerald-500')}>
                            {offsetLabel(step.daysOffset)}
                          </span>
                          <span className="text-[10px] text-muted-foreground">Step {idx + 1}</span>
                        </div>
                        <h4 className="text-xs font-bold text-foreground mt-1.5 leading-snug">{step.name}</h4>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-[10px] pt-2 border-t border-border/60">
                        <Badge variant="secondary" className="px-1.5 py-0 text-[9px] font-semibold uppercase">
                          {step.channel}
                        </Badge>
                        <span className="text-muted-foreground group-hover:text-primary transition-colors">Edit →</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/70 shadow-sm bg-card overflow-hidden">
            <div className="p-4 border-b border-border/80 flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Configured Escalation Rules & Templates</h4>
              <span className="text-xs text-muted-foreground">
                <strong className="text-foreground">{enabledCount}</strong> of <strong className="text-foreground">{steps.length}</strong> rules enabled
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4">Timeline Offset</th>
                    <th className="py-3 px-4">Escalation Step</th>
                    <th className="py-3 px-3">Channel</th>
                    <th className="py-3 px-4 min-w-[240px]">Message Template & Copy</th>
                    <th className="py-3 px-3">Last Run</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {steps.map((step) => (
                    <tr key={step.id} onClick={() => openEditor(step)} className="hover:bg-muted/30 cursor-pointer transition-colors group">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-xs text-foreground">{offsetShort(step.daysOffset)}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-foreground text-sm">{step.name}</span>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] font-semibold uppercase',
                            step.channel === 'whatsapp' && 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
                            step.channel === 'sms' && 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
                          )}
                        >
                          {step.channel}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        {step.templateName && <div className="text-[11px] font-semibold text-foreground">{step.templateName}</div>}
                        <p className="text-[11px] text-muted-foreground font-mono line-clamp-2 max-w-md">
                          {step.message || templateBody(step.templateId) || '—'}
                        </p>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap text-muted-foreground text-[11px] font-mono">
                        {step.lastRunAt ? formatDateTime(step.lastRunAt) : 'Never'}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <button
                          type="button"
                          disabled={saveRule.isPending}
                          onClick={(e) => handleToggle(step, e)}
                          className={cn(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border transition',
                            step.active
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                              : 'bg-muted/60 text-muted-foreground border-border/80',
                          )}
                        >
                          {step.active ? (
                            <>
                              <Check className="h-3 w-3" /> Enabled
                            </>
                          ) : (
                            <>
                              <X className="h-3 w-3" /> Disabled
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditor(step)}
                            className="h-8 px-2 text-xs font-medium text-primary hover:bg-primary/10 gap-1"
                          >
                            <Sliders className="h-3.5 w-3.5" /> Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(step.id)}
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            title="Delete step"
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
            <Badge variant="outline" className="w-fit text-[10px] font-semibold uppercase px-2 py-0.5 border-primary/30 text-primary">
              {editing ? 'Edit Step' : 'New Step'}
            </Badge>
            <SheetTitle className="text-xl font-bold text-foreground mt-2">{editing ? editing.name : 'Add Escalation Step'}</SheetTitle>
            <SheetDescription className="text-xs text-muted-foreground font-mono">
              {offsetLabel(form.daysOffset)} · Channel: {form.channel.toUpperCase()}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Step Name</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-9 text-xs" placeholder="e.g. Friendly reminder" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Day Offset</label>
                <Input
                  value={form.daysOffset}
                  onChange={(e) => setForm({ ...form, daysOffset: Number(e.target.value) || 0 })}
                  type="number"
                  min={-60}
                  max={90}
                  className="h-9 text-xs font-mono font-bold"
                />
                <p className="text-[10px] text-muted-foreground">Negative = before expiry, 0 = expiry day</p>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Channel</label>
                <Select value={form.channel} onValueChange={(v) => v && setForm({ ...form, channel: v as MessageChannel })}>
                  <SelectTrigger className="h-9 text-xs">
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
              <label className="font-semibold text-foreground">SMS Template</label>
              <Select value={form.templateId || 'custom'} onValueChange={(v) => setForm({ ...form, templateId: v && v !== 'custom' ? v : '' })}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom message below</SelectItem>
                  {(templates.data ?? []).map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.templateName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.templateId && (
                <p className="text-[11px] text-muted-foreground font-mono bg-muted/30 rounded p-2">{templateBody(form.templateId)}</p>
              )}
            </div>

            {!form.templateId && (
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Message Body</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={4}
                  className="w-full rounded-md border border-border/80 bg-background p-2.5 text-xs font-mono text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                />
                {(overview.data?.variables ?? []).length > 0 && (
                  <p className="text-[10px] text-muted-foreground">
                    Available variables: {(overview.data?.variables ?? []).map((v) => v.tag).join(', ')}
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
              <span className="font-semibold">Step active</span>
              <Switch checked={form.active} onCheckedChange={(c) => setForm({ ...form, active: c })} />
            </div>

            {form.channel === 'sms' && (
              <div className="space-y-1.5 rounded-lg border border-border/60 p-3">
                <label className="font-semibold text-foreground">Send a test SMS</label>
                <div className="flex gap-2">
                  <Input value={testPhone} onChange={(e) => setTestPhone(e.target.value)} placeholder="017xxxxxxxx" className="h-9 text-xs font-mono" />
                  <Button
                    type="button"
                    onClick={handleTestSend}
                    disabled={testSms.isPending}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 font-semibold gap-1.5"
                  >
                    <Play className="h-3.5 w-3.5" /> Test
                  </Button>
                </div>
              </div>
            )}

            <Button
              onClick={handleSave}
              disabled={saveRule.isPending}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-9 font-semibold"
            >
              {saveRule.isPending ? 'Saving…' : 'Save Step'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete dunning step"
        description="Reminders already sent stay in the reminder log; this step will no longer run."
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (!deleteId) return;
          deleteRule.mutate(deleteId, {
            onSuccess: () => {
              toast.success('Dunning step deleted');
              setDeleteId(null);
            },
          });
        }}
      />
    </div>
  );
}
