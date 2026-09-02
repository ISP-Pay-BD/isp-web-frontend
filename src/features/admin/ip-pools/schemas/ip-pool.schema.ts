import { z } from 'zod';
import { isValidIpv4 } from '@/lib/format/network';

export const ipPoolSchema = z.object({
  name: z.string().min(2, 'Pool name is required'),
  routerId: z.string().min(1, 'Select a router'),
  defineBy: z.enum(['range', 'cidr']),
  startIp: z.string().refine(isValidIpv4, 'Valid IPv4 start address required'),
  endIp: z.string().refine(isValidIpv4, 'Valid IPv4 end address required'),
  cidr: z.string().optional(),
  gateway: z.string().refine(isValidIpv4, 'Valid IPv4 gateway required'),
  type: z.enum(['public', 'private']),
  total: z.number().min(1, 'Total IP count must be positive'),
});

export type IpPoolFormValues = z.infer<typeof ipPoolSchema>;
