import { z } from 'zod';
import { isValidIpv4 } from '@/lib/format/network';
import { OLT_PROTOCOLS } from '../types';

/** Host name rule of OltApiController::validatedOltInput (it also accepts IPs). */
const HOSTNAME_RE = /^(?=.{1,253}$)[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?)*$/;
const OID_RE = /^\.?\d+(\.\d+)*$/;

/**
 * Mirrors the backend form validation (POST/PUT /v1/olts). The brand list
 * comes from the API, so only "non-empty" is checked here; the password is
 * required on create and optional on edit (blank keeps the stored one).
 */
export function makeOltSchema(editing: boolean) {
  return z
    .object({
      name: z.string().trim().min(1, 'OLT name is required').max(100, 'At most 100 characters'),
      brand: z.string().min(1, 'Brand is required'),
      ip: z
        .string()
        .trim()
        .min(1, 'IP address is required')
        .refine((v) => isValidIpv4(v) || HOSTNAME_RE.test(v), 'Enter a valid IP address or host name'),
      port: z.number({ message: 'Port is required' }).int().min(1, 'Port must be between 1 and 65535').max(65535, 'Port must be between 1 and 65535'),
      protocol: z.enum(OLT_PROTOCOLS as [string, ...string[]]),
      username: z.string().trim().min(1, 'Username is required').max(100, 'At most 100 characters'),
      password: z.string(),
      loginKey: z.string().max(255, 'At most 255 characters'),
      snmpOid: z.string().trim(),
    })
    .superRefine((v, ctx) => {
      if (!editing && v.password === '') {
        ctx.addIssue({ code: 'custom', path: ['password'], message: 'Password is required' });
      }
      if (v.snmpOid !== '' && !OID_RE.test(v.snmpOid)) {
        ctx.addIssue({ code: 'custom', path: ['snmpOid'], message: 'SNMP OID must look like 1.3.6.1.2.1.1.1.0' });
      }
    });
}

export type OltFormValues = z.infer<ReturnType<typeof makeOltSchema>>;

/** Backend validation keys → form fields (422 `details`). */
export const OLT_FIELD_FROM_API: Record<string, keyof OltFormValues> = {
  olt_name: 'name',
  brand: 'brand',
  ip: 'ip',
  port: 'port',
  protocol: 'protocol',
  username: 'username',
  password: 'password',
  login_key: 'loginKey',
  snmp_oid: 'snmpOid',
};
