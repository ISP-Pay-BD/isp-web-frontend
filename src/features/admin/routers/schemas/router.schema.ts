import { z } from 'zod';
import { isValidIpv4 } from '@/lib/format/network';

export const routerSchema = z.object({
  name: z.string().min(2, 'Router name must be at least 2 characters'),
  ip: z.string().refine(isValidIpv4, 'Must be a valid IPv4 address (e.g. 103.15.20.1)'),
  port: z.number().min(1).max(65535, 'Port must be between 1 and 65535'),
  username: z.string().min(1, 'API username is required'),
  password: z.string().optional(),
  model: z.string().min(1, 'Model description is required'),
  area: z.string().min(1, 'Service area is required'),
});

export type RouterFormValues = z.infer<typeof routerSchema>;
