'use client';

import { useState, useMemo } from 'react';
import {
  Clock,
  Phone,
  Send,
  Zap,
  Radio,
  Plus,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Volume2,
  Server,
  RefreshCw,
  Search,
  X,
  Play,
  Check,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useIspOps } from '../hooks/use-isp-ops';
import type { DunningStep } from '@/data/admin/isp-ops.data';

export function DunningPage() {
  const { data, isLoading, isError, refetch } = useIspOps();

  const [selectedStep, setSelectedStep] = useState<DunningStep | null>(null);

  const rawSteps = useMemo(() => data?.dunningSteps ?? [], [data?.dunningSteps]);
  const enabledCount = useMemo(() => rawSteps.filter((s) => s.enabled).length, [rawSteps]);

  const handleToggleStep = (step: DunningStep, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success(`${step.action}: Automation ${!step.enabled ? 'enabled' : 'disabled'}`);
  };

  const handleTestSend = (step: DunningStep) => {
    toast.success(`Sent test ${step.channel} message using template "${step.templateName ?? 'default'}" to admin phone.`);
  };

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (isError || !data) {
    return (
      <EmptyState
        title="Failed to load dunning schedule"
        description="Could not query automation triggers."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 w-full pb-20">
      {/* Header */}
      <PageHeader
        title="Dunning & Collection Timeline"
        subtitle="Automated payment reminders, SMS/WhatsApp escalation sequences, and automated RADIUS CoA suspension."
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
              onClick={() => {
                refetch();
                toast.success('Dunning cron tasks synced with messaging gateways');
              }}
              className="text-xs h-8 border-border/80 hover:bg-accent"
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> Sync Cron Tasks
            </Button>

            <Button
              size="sm"
              onClick={() => toast.info('New dunning rule wizard loaded')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-8 gap-1.5 shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" /> Add Escalation Step
            </Button>
          </div>
        }
      />

      {/* Visual Timeline Pipeline */}
      <Card className="border-border/80 bg-card/60 backdrop-blur-xs shadow-sm overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Automated Collection & Suspension Journey
              </h3>
            </div>
            <Badge variant="outline" className="text-[10px] px-2 py-0.5 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-semibold">
              84% Pre-Suspension Recovery Rate
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
            {rawSteps.map((step, idx) => {
              const isPastDue = step.dayOffset > 0;
              const isZero = step.dayOffset === 0;

              return (
                <div
                  key={step.id}
                  onClick={() => setSelectedStep(step)}
                  className={cn(
                    'p-3.5 rounded-lg border transition-all cursor-pointer relative group flex flex-col justify-between',
                    isPastDue
                      ? 'border-rose-500/30 bg-rose-500/5 hover:border-rose-500/60'
                      : isZero
                      ? 'border-amber-500/30 bg-amber-500/5 hover:border-amber-500/60'
                      : 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/60'
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold font-mono">
                      <span
                        className={cn(
                          isPastDue ? 'text-rose-500' : isZero ? 'text-amber-500' : 'text-emerald-500'
                        )}
                      >
                        {step.dayOffset === 0
                          ? 'Day 0 (Due Date)'
                          : step.dayOffset < 0
                          ? `Day ${step.dayOffset} (Advance)`
                          : `Day +${step.dayOffset} (Overdue)`}
                      </span>
                      <span className="text-[10px] text-muted-foreground">Step {idx + 1}</span>
                    </div>

                    <h4 className="text-xs font-bold text-foreground mt-1.5 leading-snug">
                      {step.action}
                    </h4>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[10px] pt-2 border-t border-border/60">
                    <Badge variant="secondary" className="px-1.5 py-0 text-[9px] font-semibold">
                      {step.channel}
                    </Badge>
                    <span className="text-muted-foreground group-hover:text-primary transition-colors">
                      Edit →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Dunning Steps Detailed Table */}
      <Card className="border-border/70 shadow-sm bg-card overflow-hidden">
        <div className="p-4 border-b border-border/80 flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Configured Escalation Rules & Templates
          </h4>
          <span className="text-xs text-muted-foreground">
            <strong className="text-foreground">{enabledCount}</strong> of <strong className="text-foreground">{rawSteps.length}</strong> rules enabled
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground font-semibold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-4">Timeline Offset</th>
                <th className="py-3 px-4">Escalation Action</th>
                <th className="py-3 px-3">Channel</th>
                <th className="py-3 px-4 min-w-[240px]">Message Template & Copy</th>
                <th className="py-3 px-3">Target Audience</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rawSteps.map((step) => {
                return (
                  <tr
                    key={step.id}
                    onClick={() => setSelectedStep(step)}
                    className="hover:bg-muted/30 cursor-pointer transition-colors group"
                  >
                    {/* Day Offset */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-xs text-foreground">
                        {step.dayOffset === 0
                          ? 'Day 0'
                          : step.dayOffset < 0
                          ? `${step.dayOffset} Days`
                          : `+${step.dayOffset} Days`}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-foreground text-sm">
                        {step.action}
                      </span>
                    </td>

                    {/* Channel */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[10px] font-semibold uppercase',
                          step.channel === 'WhatsApp' && 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
                          step.channel === 'SMS' && 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
                          step.channel === 'Voice' && 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
                          step.channel === 'System' && 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                        )}
                      >
                        {step.channel}
                      </Badge>
                    </td>

                    {/* Message Preview */}
                    <td className="py-3.5 px-4">
                      <p className="text-[11px] text-muted-foreground font-mono line-clamp-2 max-w-md">
                        {step.messagePreview ?? 'Automated system notification'}
                      </p>
                    </td>

                    {/* Target Audience */}
                    <td className="py-3.5 px-3 whitespace-nowrap text-muted-foreground text-[11px]">
                      {step.targetAudience ?? 'All Subscribers'}
                    </td>

                    {/* Enabled Toggle */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => handleToggleStep(step, e)}
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all',
                          step.enabled
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            : 'bg-muted/60 text-muted-foreground border-border/80'
                        )}
                      >
                        {step.enabled ? (
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

                    {/* Actions */}
                    <td className="py-3.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTestSend(step)}
                          className="h-8 px-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 gap-1"
                        >
                          <Play className="h-3.5 w-3.5" /> Test
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedStep(step)}
                          className="h-8 px-2 text-xs font-medium text-primary hover:bg-primary/10 gap-1"
                        >
                          <Sliders className="h-3.5 w-3.5" /> Edit
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Step Inspector / Edit Drawer */}
      <Sheet open={!!selectedStep} onOpenChange={(open) => !open && setSelectedStep(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto p-6 space-y-6">
          {selectedStep && (
            <>
              <SheetHeader>
                <Badge
                  variant="outline"
                  className="w-fit text-[10px] font-semibold uppercase px-2 py-0.5 border-primary/30 text-primary"
                >
                  Step Configuration
                </Badge>
                <SheetTitle className="text-xl font-bold text-foreground mt-2">
                  {selectedStep.action}
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground font-mono">
                  Offset: {selectedStep.dayOffset} Days · Channel: {selectedStep.channel}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Action Title</label>
                  <Input defaultValue={selectedStep.action} className="h-9 text-xs" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Day Offset</label>
                    <Input defaultValue={selectedStep.dayOffset} type="number" className="h-9 text-xs font-mono font-bold" />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">Channel</label>
                    <Select defaultValue={selectedStep.channel}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SMS">SMS Gateway</SelectItem>
                        <SelectItem value="WhatsApp">WhatsApp Business API</SelectItem>
                        <SelectItem value="Voice">Voice IVR Call</SelectItem>
                        <SelectItem value="System">System CoA Disconnect</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Message Body Template</label>
                  <textarea
                    defaultValue={selectedStep.messagePreview ?? ''}
                    rows={4}
                    className="w-full rounded-md border border-border/80 bg-background p-2.5 text-xs font-mono text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  />
                  <p className="text-[10px] text-muted-foreground">Available variables: <code>{'{name}'}</code>, <code>{'{package}'}</code>, <code>{'{amount}'}</code>, <code>{'{id}'}</code>, <code>{'{due_date}'}</code></p>
                </div>

                <div className="pt-4 space-y-2">
                  <Button
                    onClick={() => handleTestSend(selectedStep)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 font-semibold gap-1.5"
                  >
                    <Play className="h-3.5 w-3.5" /> Send Test Notification
                  </Button>
                  <Button
                    onClick={() => {
                      toast.success(`Dunning step "${selectedStep.action}" saved!`);
                      setSelectedStep(null);
                    }}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-9 font-semibold"
                  >
                    Save Step
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
