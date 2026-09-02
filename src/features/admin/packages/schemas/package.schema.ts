import { z } from 'zod';

export const packageSchema = z.object({
  name: z.string().min(2, 'Package name required'),
  speedMbps: z.coerce.number().min(1),
  priceBdt: z.coerce.number().min(1),
  validityDays: z.coerce.number().min(1),
  type: z.enum(['home', 'corporate', 'hotspot']),
  visible: z.boolean(),
});

export type PackageFormValues = z.infer<typeof packageSchema>;
