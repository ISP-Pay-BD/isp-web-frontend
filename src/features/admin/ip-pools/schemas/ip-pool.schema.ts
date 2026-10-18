import { z } from 'zod';
import { isValidIpv4 } from '@/lib/format/network';
import type { IpPool } from '../types';

function isValidCidr(value: string): boolean {
  const [ip, mask, ...rest] = value.trim().split('/');
  return rest.length === 0 && isValidIpv4(ip ?? '') && /^\d{1,2}$/.test(mask ?? '') && Number(mask) <= 32;
}

function ipToNumber(ip: string): number {
  return ip.split('.').reduce((acc, part) => acc * 256 + Number(part), 0);
}

/**
 * Field names mirror IpPoolService::validatedPool keys so backend 422
 * `details` map straight onto the form via handleApiError(err, setError).
 * `define_by` is UI-only (range vs CIDR).
 */
export const ipPoolSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'Pool name is required')
      .max(64, 'Max 64 characters')
      .regex(/^[\w.-]+$/, 'Letters, digits, . _ - only (no spaces)'),
    router_id: z.string().min(1, 'Select a router'),
    define_by: z.enum(['range', 'cidr']),
    cidr: z.string().trim(),
    start_ip: z.string().trim(),
    end_ip: z.string().trim(),
    gateway: z
      .string()
      .trim()
      .refine((v) => v === '' || isValidIpv4(v), 'Gateway must be a valid IPv4 address'),
    pool_type: z.enum(['public', 'private']),
    status: z.enum(['active', 'inactive']),
    notes: z.string().trim().max(500, 'Max 500 characters'),
  })
  .superRefine((v, ctx) => {
    if (v.define_by === 'cidr') {
      if (!isValidCidr(v.cidr)) {
        ctx.addIssue({ code: 'custom', path: ['cidr'], message: 'Enter a valid CIDR block (address/prefix, e.g. x.x.x.0/24)' });
      }
      return;
    }
    const startOk = isValidIpv4(v.start_ip);
    const endOk = isValidIpv4(v.end_ip);
    if (!startOk) ctx.addIssue({ code: 'custom', path: ['start_ip'], message: 'Valid IPv4 start address required' });
    if (!endOk) ctx.addIssue({ code: 'custom', path: ['end_ip'], message: 'Valid IPv4 end address required' });
    if (startOk && endOk && ipToNumber(v.end_ip) < ipToNumber(v.start_ip)) {
      ctx.addIssue({ code: 'custom', path: ['end_ip'], message: 'End IP must not be lower than start IP' });
    }
  });

export type IpPoolFormValues = z.infer<typeof ipPoolSchema>;

export function ipPoolFormDefaults(pool?: IpPool | null): IpPoolFormValues {
  return {
    name: pool?.name ?? '',
    router_id: pool?.routerId ?? '',
    define_by: pool?.cidr ? 'cidr' : 'range',
    cidr: pool?.cidr ?? '',
    start_ip: pool?.startIp ?? '',
    end_ip: pool?.endIp ?? '',
    gateway: pool?.gateway ?? '',
    pool_type: pool?.type ?? 'public',
    status: pool?.status ?? 'active',
    notes: pool?.notes ?? '',
  };
}

/** Request body for POST/PUT /v1/ip-pools (an empty `cidr` switches the pool to start/end). */
export function toIpPoolPayload(v: IpPoolFormValues, editing: boolean): Record<string, unknown> {
  const body: Record<string, unknown> = {
    name: v.name,
    router_id: Number(v.router_id),
    gateway: v.gateway,
    pool_type: v.pool_type,
    notes: v.notes,
  };
  if (v.define_by === 'cidr') {
    body.cidr = v.cidr;
  } else {
    body.cidr = '';
    body.start_ip = v.start_ip;
    body.end_ip = v.end_ip;
  }
  if (editing) body.status = v.status;
  return body;
}
