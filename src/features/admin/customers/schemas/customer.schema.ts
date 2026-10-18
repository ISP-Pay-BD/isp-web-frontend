import { z } from 'zod';

/**
 * Field names are the backend's own (snake_case) so server validation errors
 * (`ApiError.details`) map straight onto the form with handleApiError.
 */
const base = {
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  mobile: z.string().trim().regex(/^\+?\d{11,15}$/, 'Enter a valid mobile number (11–15 digits)'),
  email: z.union([z.literal(''), z.string().trim().email('Enter a valid email')]),
  address: z.string().trim().min(2, 'Address is required'),
  nid_number: z.string().trim().regex(/^\d*$/, 'Digits only').optional(),
  package_id: z.string().min(1, 'Package is required'),
  area_id: z.string().min(1, 'Area is required'),
  sub_area_id: z.string().optional(),
  router_id: z.string().min(1, 'Router is required'),
  status: z.enum(['active', 'inactive']),
  connection_type: z.string().optional(),
  client_type: z.string().optional(),
  billing_status: z.string().optional(),
};

export const customerEditSchema = z.object({
  ...base,
  will_expire: z.string().optional(),
  pppoe_profile: z.string().optional(),
});

export const customerCreateSchema = z.object({
  ...base,
  pppoe_name: z.string().trim().min(3, 'PPPoE username must be at least 3 characters').max(64),
  pppoe_password: z.string().min(4, 'PPPoE password must be at least 4 characters').max(128),
  pppoe_service: z.string().min(1, 'PPPoE service is required'),
  pppoe_profile: z.string().min(1, 'PPPoE profile is required'),
  will_expire: z.string().optional(),
});

export type CustomerEditValues = z.infer<typeof customerEditSchema>;
export type CustomerCreateValues = z.infer<typeof customerCreateSchema>;

/** Drop empty optional values so the backend keeps what it has. */
export function compactPayload(values: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(values).filter(([, v]) => v !== undefined && v !== ''));
}

export const LINE_TYPES = [
  { value: 'utp', label: 'UTP' },
  { value: 'fiber', label: 'Fiber' },
  { value: 'radio', label: 'Radio' },
] as const;

export const CLIENT_TYPES = [
  { value: 'home', label: 'Home' },
  { value: 'office', label: 'Office' },
  { value: 'corporate', label: 'Corporate' },
] as const;

export const BILLING_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'personal', label: 'Personal' },
  { value: 'free', label: 'Free' },
] as const;

/** RouterOS PPP service names (web new-customer form). */
export const PPPOE_SERVICES = ['pppoe', 'any', 'async', 'l2tp', 'ovpn', 'pptp', 'sstp'] as const;
