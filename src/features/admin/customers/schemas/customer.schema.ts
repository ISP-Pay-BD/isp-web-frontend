import { z } from 'zod';

export const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  phone: z.string().min(11, 'Valid 11-digit BD mobile number is required'),
  email: z.string().optional(),
  packageId: z.string().min(1, 'Package is required'),
  packageName: z.string().optional(),
  areaId: z.string().min(1, 'Area is required'),
  areaName: z.string().optional(),
  connectionType: z.enum(['pppoe', 'hotspot', 'static']),
  password: z.string().optional(),
  macAddress: z.string().optional(),
  ipAddress: z.string().optional(),
  balanceBdt: z.coerce.number(),
  expiryDate: z.string().min(10, 'Expiry date is required'),
  status: z.enum(['active', 'expired', 'suspended']),
  notes: z.string().optional(),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;

