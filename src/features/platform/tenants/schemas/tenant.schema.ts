import { z } from 'zod';

const hex = /^#([0-9A-Fa-f]{3}){1,2}$/;

export const tenantFormSchema = z
  .object({
    mode: z.enum(['create', 'edit']),
    name: z.string().trim().min(2, 'Company name must be at least 2 characters').max(150),
    slug: z
      .string()
      .trim()
      .min(2, 'Subdomain must be at least 2 characters')
      .max(63, 'Subdomain cannot exceed 63 characters')
      .regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/, 'Lowercase letters, numbers and hyphens only'),
    plan: z.string().max(50).optional(),
    primaryColor: z.string().regex(hex, 'Enter a hex colour such as #2563eb'),
    secondaryColor: z.string().regex(hex, 'Enter a hex colour such as #10141a').or(z.literal('')),
    status: z.enum(['active', 'suspended']),
    notes: z.string().max(2000).optional(),
    ownerMode: z.enum(['new', 'existing']),
    ownerUserId: z.string().optional(),
    ownerName: z.string().trim().optional(),
    ownerEmail: z.string().trim().optional(),
    ownerPhone: z.string().trim().optional(),
    ownerPassword: z.string().optional(),
    packageId: z.string().optional(),
    address: z.string().max(255).optional(),
  })
  .superRefine((v, ctx) => {
    const needOwnerContact = v.mode === 'edit' || v.ownerMode === 'new';
    if (v.mode === 'create' && v.ownerMode === 'existing' && !v.ownerUserId) {
      ctx.addIssue({ code: 'custom', path: ['ownerUserId'], message: 'Select an existing Second Admin' });
    }
    if (needOwnerContact) {
      if (!v.ownerName || v.ownerName.length < 2) {
        ctx.addIssue({ code: 'custom', path: ['ownerName'], message: 'Owner name is required' });
      }
      if (!v.ownerEmail || !z.string().email().safeParse(v.ownerEmail).success) {
        ctx.addIssue({ code: 'custom', path: ['ownerEmail'], message: 'Enter a valid owner email' });
      }
      if (!v.ownerPhone || !/^\+?[0-9]{11,14}$/.test(v.ownerPhone)) {
        ctx.addIssue({ code: 'custom', path: ['ownerPhone'], message: 'Enter a valid mobile number (01XXXXXXXXX)' });
      }
    }
    if (v.mode === 'create' && v.ownerMode === 'new' && (!v.ownerPassword || v.ownerPassword.length < 6)) {
      ctx.addIssue({ code: 'custom', path: ['ownerPassword'], message: 'Password must be at least 6 characters' });
    }
  });

export type TenantFormValues = z.infer<typeof tenantFormSchema>;
