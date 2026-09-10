'use client';

import { useMemo, useState } from 'react';
import type { LegacyColumnDef, LegacyRow } from '@tanstack/react-table/legacy';
import { PageHeader } from '@/features/admin/shared';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
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
import { OpsSummaryStrip } from '@/components/shared/OpsSummaryStrip';
import { DataTable } from '@/features/shared/data-table';
import { toast } from 'sonner';
import {
  BellRing,
  Plus,
  Zap,
  Send,
  CheckCircle2,
  Gauge,
  Sliders,
} from 'lucide-react';
import { useIspOps } from '../hooks/use-isp-ops';
import type { IspOpsData } from '@/data/admin/isp-ops.data';

type Row = IspOpsData['usageAlertRules'][number];

const searchFilter = (row: LegacyRow<Row>, _columnId: string, filterValue: unknown) => {
  const q = String(filterValue ?? '').toLowerCase().trim();
  if (!q) return true;
  const r = row.original;
  return (
    String(r.name).toLowerCase().includes(q) ||
    String(r.thresholdPct).toLowerCase().includes(q) ||
    String(r.channel).toLowerCase().includes(q) ||
    String(r.enabled).toLowerCase().includes(q)
  );
};

export function UsageAlertsPage() {
  const { data, isLoading, isError, refetch } = useIspOps();
  const [rules, setRules] = useState<Row[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '',
    thresholdPct: 80,
    channel: 'SMS + WhatsApp',
  });

  useMemo(() => {
    if (data?.usageAlertRules && rules.length === 0) {
      setRules(data.usageAlertRules);
    }
  }, [data?.usageAlertRules, rules.length]);

  const rows = rules.length > 0 ? rules : (data?.usageAlertRules ?? []);

  const handleToggleRule = (index: number) => {
    setRules((prev) =>
      prev.map((r, i) => (i === index ? { ...r, enabled: !r.enabled } : r))
    );
    toast.success('Usage alert rule updated');
  };

  const handleCreateRule = () => {
    if (!newRule.name.trim()) {
      toast.error('Rule name is required');
      return;
    }
    const created: Row = {
      id: `ua_${Date.now()}`,
      name: newRule.name.trim(),
      thresholdPct: newRule.thresholdPct,
      channel: newRule.channel,
      enabled: true,
    };
    setRules((prev) => [created, ...prev]);
    toast.success(`FUP Alert rule "${created.name}" activated!`);
    setCreateModalOpen(false);
    setNewRule({ name: '', thresholdPct: 80, channel: 'SMS + WhatsApp' });
  };

  const columns = useMemo<LegacyColumnDef<Row, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Rule Title & Policy',
        size: 220,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0">
              <Gauge className="h-4 w-4" />
            </div>
            <div>
              <span className="font-semibold text-xs text-foreground block">{String(row.original.name)}</span>
              <span className="text-[10px] text-muted-foreground">Fair Usage Policy Threshold</span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'thresholdPct',
        header: 'Quota Threshold',
        size: 180,
        cell: ({ row }) => {
          const pct = Number(row.original.thresholdPct);
          return (
            <div className="space-y-1 w-full max-w-[140px]">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="font-semibold text-foreground">{pct}% Quota Reached</span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    pct >= 100
                      ? 'bg-destructive'
                      : pct >= 80
                        ? 'bg-amber-500'
                        : 'bg-primary'
                  }`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'channel',
        header: 'Dispatch Channel',
        size: 160,
        cell: ({ row }) => (
          <Badge variant="outline" className="text-[10px] font-mono">
            {String(row.original.channel)}
          </Badge>
        ),
      },
      {
        accessorKey: 'enabled',
        header: 'Trigger Status',
        size: 140,
        cell: ({ row }) => {
          const isEnabled = Boolean(row.original.enabled);
          return (
            <div className="flex items-center gap-2.5">
              <Switch
                checked={isEnabled}
                onCheckedChange={() => handleToggleRule(row.index)}
              />
              <Badge
                variant={isEnabled ? 'default' : 'secondary'}
                className={`text-[10px] font-mono ${
                  isEnabled ? 'bg-emerald-600 hover:bg-emerald-600 text-white' : ''
                }`}
              >
                {isEnabled ? 'Active' : 'Disabled'}
              </Badge>
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">Actions</span>,
        size: 100,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1 text-primary hover:bg-primary/10"
            onClick={() => {
              toast.success(`Dispatched simulated FUP threshold test alert for "${row.original.name}"`);
            }}
          >
            <Send className="h-3 w-3" />
            Test
          </Button>
        ),
      },
    ],
    [rules],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load" actionLabel="Retry" onAction={() => refetch()} />;
  }

  const enabledCount = rows.filter((r) => r.enabled).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usage Alert & FUP Rules"
        subtitle="Configure Fair Usage Policy (FUP) data bandwidth threshold notifications and warning triggers"
        breadcrumb={[
          { label: 'Dashboard', url: '/admin/dashboard' },
          { label: 'Engagement' },
          { label: 'Usage Alerts' },
        ]}
        actions={
          <Button
            className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => setCreateModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Create Alert Rule
          </Button>
        }
      />

      <OpsSummaryStrip
        items={[
          { label: 'Total FUP Rules', value: rows.length },
          { label: 'Active Warning Rules', value: `${enabledCount} Enabled` },
          { label: 'Daily Dispatched Alerts', value: '84 Notifications' },
          { label: 'Notification Channels', value: 'SMS + WhatsApp + App Push' },
          { label: 'Automated Throttle Engine', value: 'RADIUS CoA Active' },
        ]}
      />

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <BellRing className="h-4 w-4 text-primary" />
                Data Consumption Notification Rules
              </CardTitle>
              <CardDescription>
                Automated threshold alerts dispatched to subscribers as volume quotas deplete
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={rows}
            searchKey="name"
            searchFilterFn={searchFilter}
            searchPlaceholder="Search rules by name or channel..."
            toolbarActions={
              <Button size="sm" onClick={() => setCreateModalOpen(true)} className="gap-1.5">
                <Plus className="h-4 w-4" />
                New Rule
              </Button>
            }
          />
        </CardContent>
      </Card>

      {/* Create Rule Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sliders className="h-5 w-5 text-primary" />
              Configure Usage Alert Rule
            </DialogTitle>
            <DialogDescription>
              Set bandwidth quota consumption threshold and delivery channels.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-xs">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Rule Title</Label>
              <Input
                value={newRule.name}
                onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                placeholder="e.g. 90% Data Cap Warning"
                className="text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Consumption Threshold (%)</Label>
              <Input
                type="number"
                min="10"
                max="100"
                value={newRule.thresholdPct}
                onChange={(e) => setNewRule({ ...newRule, thresholdPct: Number(e.target.value) })}
                className="font-mono text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Dispatch Channels</Label>
              <Select
                value={newRule.channel}
                onValueChange={(v) => { if (v) setNewRule({ ...newRule, channel: v }); }}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SMS + WhatsApp">SMS + WhatsApp</SelectItem>
                  <SelectItem value="WhatsApp Only">WhatsApp Business Only</SelectItem>
                  <SelectItem value="SMS Only">SMS Masking Only</SelectItem>
                  <SelectItem value="In-App Toast">Customer Portal Notification</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRule} className="gap-1.5 bg-primary text-primary-foreground">
              <CheckCircle2 className="h-4 w-4" />
              Save Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
