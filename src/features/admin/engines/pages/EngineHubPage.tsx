'use client';

import { useMemo, useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/features/shared/page-header';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatCard } from '@/components/shared/StatCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, CheckCircle2, Layers, ListTree } from 'lucide-react';
import { getEngineGroup } from '@/data/admin/engines.catalog';
import type { EngineLog, EngineRecord, EnginesData } from '@/data/admin/engines.data';
import { useEngines } from '../hooks/use-engines';

type Props = {
  groupId: string;
  portal?: 'admin' | 'platform';
};

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'failed' || status === 'disabled') return 'destructive';
  if (status === 'success' || status === 'enabled' || status === 'active') return 'default';
  if (status === 'running' || status === 'queued') return 'secondary';
  return 'outline';
}

function nextStamp(seq: number) {
  return `local-${seq}`;
}

export function EngineHubPage({ groupId, portal = 'admin' }: Props) {
  const { data, isLoading, isError, refetch } = useEngines(portal);
  const group = getEngineGroup(groupId);

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data || !group) {
    return <EmptyState title="Failed to load engines" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return <EngineHubInner data={data} groupId={groupId} portal={portal} />;
}

function EngineHubInner({
  data,
  groupId,
  portal,
}: {
  data: EnginesData;
  groupId: string;
  portal: 'admin' | 'platform';
}) {
  const group = getEngineGroup(groupId)!;
  const [activeFeature, setActiveFeature] = useState(group.features[0]?.id ?? '');
  const [records, setRecords] = useState<EngineRecord[]>(() =>
    data.records.filter((r) => group.features.some((f) => f.id === r.featureId)),
  );
  const [logs, setLogs] = useState<EngineLog[]>(() =>
    data.logs.filter((l) => group.features.some((f) => f.id === l.featureId)),
  );
  const [query, setQuery] = useState('');
  const seqRef = useRef(0);
  const [, startTransition] = useTransition();

  const feature = group.features.find((f) => f.id === activeFeature) ?? group.features[0]!;

  const featureRecords = useMemo(() => {
    const rows = records.filter((r) => r.featureId === feature.id);
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.meta.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q),
    );
  }, [records, feature.id, query]);

  const featureLogs = useMemo(
    () => logs.filter((l) => l.featureId === feature.id).slice(0, 20),
    [logs, feature.id],
  );

  const featureMetrics = useMemo(
    () => data.metrics.filter((m) => m.featureId === feature.id),
    [data.metrics, feature.id],
  );

  const pushLog = (message: string, level: EngineLog['level'] = 'info') => {
    seqRef.current += 1;
    const seq = seqRef.current;
    const entry: EngineLog = {
      id: `${feature.id}-${seq}`,
      featureId: feature.id,
      at: nextStamp(seq),
      level,
      message,
    };
    setLogs((prev) => [entry, ...prev]);
  };

  const runAction = (action: string) => {
    startTransition(() => {
      const label = action.replaceAll('_', ' ');
      if (action === 'enable' || action === 'disable') {
        const enabled = action === 'enable';
        setRecords((prev) =>
          prev.map((r) =>
            r.featureId === feature.id
              ? { ...r, enabled, status: enabled ? 'enabled' : 'disabled' }
              : r,
          ),
        );
        pushLog(`${feature.name}: ${label}`, 'success');
        toast.success(`${feature.name} ${label}`);
        return;
      }
      if (action === 'ack' || action === 'unack') {
        setRecords((prev) =>
          prev.map((r) =>
            r.featureId === feature.id && r.id === featureRecords[0]?.id
              ? { ...r, status: action === 'ack' ? 'acked' : 'active' }
              : r,
          ),
        );
        pushLog(`${feature.name}: ${label}`, 'info');
        toast.message(`${feature.name}: ${label}`);
        return;
      }
      if (
        action === 'retry' ||
        action === 'retry_all' ||
        action === 'run' ||
        action === 'run_now' ||
        action === 'simulate' ||
        action === 'test'
      ) {
        seqRef.current += 1;
        const stamp = nextStamp(seqRef.current);
        setRecords((prev) =>
          prev.map((r, idx) =>
            r.featureId === feature.id && idx === 0
              ? { ...r, status: 'running', updatedAt: stamp }
              : r,
          ),
        );
        pushLog(`${feature.name}: ${label} started (static)`, 'info');
        queueMicrotask(() => {
          seqRef.current += 1;
          const done = nextStamp(seqRef.current);
          setRecords((prev) =>
            prev.map((r, idx) =>
              r.featureId === feature.id && idx === 0
                ? { ...r, status: 'success', updatedAt: done }
                : r,
            ),
          );
          pushLog(`${feature.name}: ${label} completed (static)`, 'success');
          toast.success(`${feature.name}: ${label} OK`);
        });
        return;
      }
      if (action === 'create' || action === 'add' || action === 'log' || action === 'open') {
        const n = records.filter((r) => r.featureId === feature.id).length + 1;
        seqRef.current += 1;
        const stamp = nextStamp(seqRef.current);
        const row: EngineRecord = {
          id: `${feature.id}-new-${seqRef.current}`,
          featureId: feature.id,
          title: `${feature.name} · new ${n}`,
          status: 'draft',
          meta: `Created locally · ${stamp}`,
          updatedAt: stamp,
          enabled: true,
        };
        setRecords((prev) => [row, ...prev]);
        pushLog(`${feature.name}: created local record`, 'success');
        toast.success('Created (static)');
        return;
      }
      pushLog(`${feature.name}: action “${label}” applied locally`, 'info');
      toast.message(`${feature.name}: ${label} (static)`);
    });
  };

  const toggleRecord = (id: string, enabled: boolean) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, enabled, status: enabled ? 'enabled' : 'disabled' } : r,
      ),
    );
    pushLog(`Record ${id} ${enabled ? 'enabled' : 'disabled'}`, 'info');
  };

  const basePath = portal === 'platform' ? '/platform/dashboard' : '/admin/dashboard';

  return (
    <div className="space-y-6">
      <PageHeader
        title={group.title}
        subtitle={group.subtitle}
        breadcrumb={[
          { label: 'Dashboard', url: basePath },
          { label: 'Engines' },
          { label: group.title },
        ]}
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Features" value={group.features.length} icon={Layers} />
        <StatCard title="Records" value={records.length} icon={ListTree} />
        <StatCard
          title="Enabled"
          value={records.filter((r) => r.enabled).length}
          icon={CheckCircle2}
        />
        <StatCard title="Priority" value={group.priority} icon={Activity} description="Roadmap weight" />
      </div>

      <Tabs value={activeFeature} onValueChange={setActiveFeature} className="gap-4">
        <ScrollArea className="w-full whitespace-nowrap pb-2">
          <TabsList variant="line" className="h-auto min-w-full justify-start gap-1">
            {group.features.map((f) => (
              <TabsTrigger key={f.id} value={f.id} className="shrink-0 text-xs sm:text-sm">
                {f.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </ScrollArea>

        {group.features.map((f) => (
          <TabsContent key={f.id} value={f.id} className="space-y-4">
            {f.id === feature.id ? (
              <Card className="border-border/60 bg-card/80">
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-lg">{feature.name}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {feature.kind}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {feature.actions.map((action) => (
                      <Button
                        key={action}
                        size="sm"
                        variant={
                          action.includes('delete') || action === 'reject' ? 'destructive' : 'secondary'
                        }
                        onClick={() => runAction(action)}
                      >
                        {action.replaceAll('_', ' ')}
                      </Button>
                    ))}
                  </div>

                  {(feature.kind === 'analytics' || feature.kind === 'dashboard') &&
                  featureMetrics.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-3">
                      {featureMetrics.map((m) => (
                        <div
                          key={`${m.featureId}-${m.label}`}
                          className="rounded-lg border border-border/50 bg-muted/30 p-3"
                        >
                          <p className="text-xs text-muted-foreground">{m.label}</p>
                          <p className="text-xl font-semibold tabular-nums">
                            {m.value}
                            {m.unit ? (
                              <span className="ml-1 text-sm font-normal text-muted-foreground">
                                {m.unit}
                              </span>
                            ) : null}
                          </p>
                          {typeof m.delta === 'number' ? (
                            <p className="text-xs text-muted-foreground tabular-nums">
                              {m.delta > 0 ? '+' : ''}
                              {m.delta}% vs prior
                            </p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {(feature.kind === 'builder' ||
                    feature.kind === 'workflow' ||
                    feature.kind === 'policy') && (
                    <div className="space-y-3 rounded-lg border border-dashed border-border/60 bg-muted/20 p-4">
                      <p className="text-sm font-medium">Static builder / policy panel</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <Input placeholder="Name / rule title" defaultValue={`${feature.name} rule`} />
                        <Input
                          placeholder="Condition / cron / scope"
                          defaultValue="status=active AND balance>0"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" onClick={() => runAction('save')}>
                          Save draft
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => runAction('validate')}>
                          Validate
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => runAction('publish')}>
                          Publish
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Filter records…"
                      className="max-w-sm"
                    />
                    <Badge variant="secondary" className="tabular-nums">
                      {featureRecords.length}
                    </Badge>
                  </div>

                  <div className="overflow-hidden rounded-lg border border-border/60">
                    {featureRecords.length === 0 ? (
                      <div className="p-4">
                        <EmptyState
                          title="No records match"
                          description="Clear the filter or create a new local record"
                          actionLabel="Clear filter"
                          onAction={() => setQuery('')}
                        />
                      </div>
                    ) : (
                      <table className="w-full text-sm">
                        <thead className="bg-muted/40 text-left text-muted-foreground">
                          <tr>
                            <th className="px-3 py-2 font-medium">Record</th>
                            <th className="px-3 py-2 font-medium">Status</th>
                            <th className="px-3 py-2 font-medium">Meta</th>
                            <th className="px-3 py-2 font-medium">Enabled</th>
                          </tr>
                        </thead>
                        <tbody>
                          {featureRecords.map((row) => (
                            <tr
                              key={row.id}
                              className="border-t border-border/40 transition-colors duration-200 ease-out hover:bg-muted/20"
                            >
                              <td className="px-3 py-2">
                                <div className="font-medium">{row.title}</div>
                                <div className="text-xs text-muted-foreground tabular-nums">{row.id}</div>
                              </td>
                              <td className="px-3 py-2">
                                <Badge variant={statusVariant(row.status)} className="capitalize">
                                  {row.status}
                                </Badge>
                              </td>
                              <td className="px-3 py-2 text-muted-foreground">{row.meta}</td>
                              <td className="px-3 py-2">
                                <Switch
                                  checked={row.enabled}
                                  onCheckedChange={(v) => toggleRecord(row.id, Boolean(v))}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Execution / event log</p>
                    <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-border/60 bg-muted/10 p-3 font-mono text-xs">
                      {featureLogs.map((l) => (
                        <div key={l.id} className="flex flex-wrap gap-2">
                          <span className="text-muted-foreground tabular-nums">{l.at}</span>
                          <Badge variant="outline" className="capitalize">
                            {l.level}
                          </Badge>
                          <span>{l.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
