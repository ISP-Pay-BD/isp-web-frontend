'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { http } from '@/lib/api/client';
import { num, str } from '@/lib/api/case';

/**
 * ACS / TR-069 CPE registry + queued config jobs (/v1/network-ops/acs/*).
 * `lastInformAt` stays null until a real CWMP inform arrives; jobs stay
 * `queued` until a worker processes them — nothing here fakes success.
 */

export const ACS_JOB_ACTIONS = ['push_config', 'reboot', 'factory_reset', 'firmware_upgrade'] as const;
export type AcsJobAction = (typeof ACS_JOB_ACTIONS)[number];

export interface AcsDevice {
  id: string;
  serial: string;
  manufacturer: string | null;
  model: string | null;
  firmware: string | null;
  macAddress: string | null;
  userId: string | null;
  customerName: string | null;
  lastInformAt: string | null;
  notes: string | null;
  queuedJobs: number;
}

export interface AcsJob {
  id: string;
  deviceId: string;
  serial: string | null;
  action: string;
  parameters: Record<string, string>;
  status: string;
  result: string | null;
  processedAt: string | null;
  createdAt: string | null;
}

type Raw = Record<string, unknown>;
const obj = (v: unknown): Raw => (v && typeof v === 'object' ? (v as Raw) : {});
const opt = (v: unknown) => str(v) || null;

function mapDevice(raw: unknown): AcsDevice {
  const r = obj(raw);
  return {
    id: str(r.id),
    serial: str(r.serial),
    manufacturer: opt(r.manufacturer),
    model: opt(r.model),
    firmware: opt(r.firmware),
    macAddress: opt(r.mac_address),
    userId: opt(r.user_id),
    customerName: opt(r.customer_name),
    lastInformAt: opt(r.last_inform_at),
    notes: opt(r.notes),
    queuedJobs: num(r.queued_jobs),
  };
}

function mapJob(raw: unknown): AcsJob {
  const r = obj(raw);
  return {
    id: str(r.id),
    deviceId: str(r.device_id),
    serial: opt(r.serial),
    action: str(r.action),
    parameters: Object.fromEntries(Object.entries(obj(r.parameters)).map(([k, v]) => [k, str(v)])),
    status: str(r.status),
    result: opt(r.result),
    processedAt: opt(r.processed_at),
    createdAt: opt(r.created_at),
  };
}

const acsKeys = {
  all: ['admin', 'acs'] as const,
  devices: (params: Record<string, unknown>) => ['admin', 'acs', 'devices', params] as const,
  jobs: (params: Record<string, unknown>) => ['admin', 'acs', 'jobs', params] as const,
};

export function useAcsDevices({ page, pageSize, search }: { page: number; pageSize: number; search?: string }) {
  const params = { page, limit: pageSize, search: search || undefined };
  return useQuery({
    queryKey: acsKeys.devices(params),
    queryFn: async ({ signal }) => {
      const res = await http.getPage<unknown>('/v1/network-ops/acs/devices', params, { signal });
      const s = obj(res.raw.summary);
      return {
        items: res.items.map(mapDevice),
        meta: res.meta,
        summary: { total: num(s.total), informed24h: num(s.informed_24h), neverInformed: num(s.never_informed), queuedJobs: num(s.queued_jobs) },
      };
    },
    placeholderData: keepPreviousData,
  });
}

export function useAcsJobs(deviceId: string | null) {
  const params = { device_id: deviceId || undefined, limit: 20 };
  return useQuery({
    queryKey: acsKeys.jobs(params),
    queryFn: async ({ signal }) => {
      const res = await http.getPage<unknown>('/v1/network-ops/acs/jobs', params, { signal });
      return { items: res.items.map(mapJob), meta: res.meta };
    },
    enabled: Boolean(deviceId),
  });
}

export function useSaveAcsDevice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id?: string; body: Record<string, unknown> }) =>
      mapDevice(id ? await http.put<unknown>(`/v1/network-ops/acs/devices/${id}`, body) : await http.post<unknown>('/v1/network-ops/acs/devices', body)),
    onSuccess: (_d, { id }) => {
      toast.success(id ? 'CPE updated' : 'CPE registered');
      qc.invalidateQueries({ queryKey: acsKeys.all });
    },
  });
}

export function useDeleteAcsDevice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => http.delete<unknown>(`/v1/network-ops/acs/devices/${id}`),
    onSuccess: () => {
      toast.success('CPE removed');
      qc.invalidateQueries({ queryKey: acsKeys.all });
    },
  });
}

export function useQueueAcsJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ deviceId, action, parameters }: { deviceId: string; action: AcsJobAction; parameters?: Record<string, string> }) =>
      http.post<unknown>(`/v1/network-ops/acs/devices/${deviceId}/jobs`, { action, parameters }),
    onSuccess: () => {
      toast.success('Job queued — it runs when the ACS worker picks it up');
      qc.invalidateQueries({ queryKey: acsKeys.all });
    },
  });
}

export function useCancelAcsJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => http.post<unknown>(`/v1/network-ops/acs/jobs/${id}/cancel`),
    onSuccess: () => {
      toast.success('Job cancelled');
      qc.invalidateQueries({ queryKey: acsKeys.all });
    },
  });
}
