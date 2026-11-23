import { z } from 'zod';

/** `PUT /v1/customers/{id}/subscription` full recharge (Rust `UpdateCustomerSubscriptionRequest`). */
export const renewSchema = z
  .object({
    package_id: z.string().optional(),
    will_expire: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Select expire date'),
    month: z.string().min(1, 'Please select a payment month.'),
    status: z.enum(['successful', 'pending']),
    paid_via: z.string().optional(),
    method_trx: z.string().trim().max(128).optional(),
    note: z.string().trim().max(512).optional(),
    daily_bill: z.boolean(),
  })
  .refine((v) => v.status !== 'successful' || Boolean(v.paid_via), {
    path: ['paid_via'],
    message: 'Please select a payment method.',
  });

export type RenewValues = z.infer<typeof renewSchema>;
