import { z } from 'zod';

/** Backend field names (PackageService create/update) so server errors map onto the inputs. */
export const packageSchema = z.object({
  package_name: z.string().trim().min(2, 'Package name required'),
  bandwidth: z.string().trim().min(1, 'Bandwidth is required'),
  price: z.string().trim().regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid price'),
  selling_price: z.union([z.literal(''), z.string().trim().regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid price')]),
  pricing_type: z.enum(['weekly', 'monthly', 'yearly']),
  status: z.enum(['active', 'inactive']),
  mikrotik_profile: z.string().trim().max(255, 'Too long').optional(),
});

export type PackageFormValues = z.infer<typeof packageSchema>;
