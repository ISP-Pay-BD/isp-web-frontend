import { z } from 'zod';

export const tenantFormSchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  slug: z
    .string()
    .min(2, 'Subdomain slug must be at least 2 characters')
    .max(30, 'Subdomain slug cannot exceed 30 characters')
    .regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/, 'Slug must only contain lowercase letters, numbers, and hyphens'),
  plan: z.string().min(1, 'Please select a subscription plan'),
  primaryColor: z
    .string()
    .regex(/^#([0-9A-Fa-f]{3}){1,2}$/, 'Please enter a valid hex color code (e.g. #2563eb)'),
  secondaryColor: z
    .string()
    .regex(/^#([0-9A-Fa-f]{3}){1,2}$/, 'Please enter a valid hex color code')
    .optional(),
  status: z.enum(['active', 'trial', 'suspended']),
  notes: z.string().optional(),
  ownerName: z.string().min(2, 'Owner name is required'),
  ownerEmail: z.string().email('Please enter a valid owner email'),
  ownerPhone: z.string().min(11, 'Please enter a valid Bangladeshi phone number'),
  customers: z.number().min(0),
});

export type TenantFormValues = z.infer<typeof tenantFormSchema>;
