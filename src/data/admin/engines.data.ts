import { engineGroups, type EngineFeatureDef } from './engines.catalog';

export type EngineRecordStatus = 'active' | 'idle' | 'running' | 'success' | 'failed' | 'queued' | 'acked' | 'suppressed' | 'draft' | 'enabled' | 'disabled';

export type EngineRecord = {
  id: string;
  featureId: string;
  title: string;
  status: EngineRecordStatus;
  meta: string;
  updatedAt: string;
  enabled: boolean;
  metric?: number;
};

export type EngineLog = {
  id: string;
  featureId: string;
  at: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
};

export type EngineMetric = {
  featureId: string;
  label: string;
  value: number;
  unit?: string;
  delta?: number;
};

const statuses: EngineRecordStatus[] = [
  'active',
  'idle',
  'running',
  'success',
  'failed',
  'queued',
  'enabled',
  'disabled',
];

function seedRecords(feature: EngineFeatureDef, groupId: string): EngineRecord[] {
  const count = feature.kind === 'analytics' || feature.kind === 'dashboard' ? 3 : 5;
  return Array.from({ length: count }, (_, i) => {
    const n = i + 1;
    const status = statuses[(i + feature.id.length) % statuses.length]!;
    return {
      id: `${feature.id}-r${n}`,
      featureId: feature.id,
      title: `${feature.name} · item ${n}`,
      status,
      meta: `${groupId} · ${feature.kind} · BD sample #${n}`,
      updatedAt: `2026-09-0${(n % 7) + 1}T1${n}:2${n}:00+06:00`,
      enabled: status !== 'disabled' && status !== 'failed',
      metric: feature.kind === 'analytics' ? 1200 + n * 137 : undefined,
    };
  });
}

function seedLogs(feature: EngineFeatureDef): EngineLog[] {
  return [
    {
      id: `${feature.id}-l1`,
      featureId: feature.id,
      at: '2026-09-08T09:12:00+06:00',
      level: 'info',
      message: `${feature.name}: static run started`,
    },
    {
      id: `${feature.id}-l2`,
      featureId: feature.id,
      at: '2026-09-08T09:12:04+06:00',
      level: 'success',
      message: `${feature.name}: completed with mock result`,
    },
    {
      id: `${feature.id}-l3`,
      featureId: feature.id,
      at: '2026-09-08T08:01:00+06:00',
      level: 'warn',
      message: `${feature.name}: retry scheduled (mock)`,
    },
  ];
}

function seedMetrics(feature: EngineFeatureDef): EngineMetric[] {
  if (feature.kind !== 'analytics' && feature.kind !== 'dashboard') return [];
  return [
    { featureId: feature.id, label: 'Volume', value: 1280 + feature.id.length * 3, unit: 'ops', delta: 4.2 },
    { featureId: feature.id, label: 'Success rate', value: 96.4, unit: '%', delta: 0.8 },
    { featureId: feature.id, label: 'Failures', value: 12, unit: 'count', delta: -2 },
  ];
}

const records: EngineRecord[] = [];
const logs: EngineLog[] = [];
const metrics: EngineMetric[] = [];

for (const group of engineGroups) {
  for (const feature of group.features) {
    records.push(...seedRecords(feature, group.id));
    logs.push(...seedLogs(feature));
    metrics.push(...seedMetrics(feature));
  }
}

export const enginesData = {
  groups: engineGroups,
  records,
  logs,
  metrics,
  summary: {
    groups: engineGroups.length,
    features: engineGroups.reduce((s, g) => s + g.features.length, 0),
    records: records.length,
    logs: logs.length,
    enabledFeatures: records.filter((r) => r.enabled).length,
  },
};

export type EnginesData = typeof enginesData;
