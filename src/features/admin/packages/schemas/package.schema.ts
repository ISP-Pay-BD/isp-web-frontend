import { z } from 'zod';

export const packageSchema = z.object({
  name: z.string().min(2, 'Package name required'),
  speedMbps: z.coerce.number().min(1, 'Speed must be at least 1 Mbps'),
  burstSpeedMbps: z.coerce.number().optional(),
  priceBdt: z.coerce.number().min(1, 'Price must be greater than 0'),
  validityDays: z.coerce.number().min(1, 'Validity must be at least 1 day'),
  type: z.enum(['home', 'corporate', 'hotspot']),
  visible: z.boolean(),
  mikrotikProfile: z.string().optional(),
  poolName: z.string().optional(),
  fupQuotaGb: z.coerce.number().optional(),
  fupThrottleMbps: z.coerce.number().optional(),
  staticIpIncluded: z.boolean().optional(),
  slaUptime: z.string().optional(),
});

export type PackageFormValues = z.infer<typeof packageSchema>;
