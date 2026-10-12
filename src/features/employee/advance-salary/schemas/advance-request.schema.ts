import { z } from 'zod';

/** Backend (AdvanceSalaryService::apply) requires amount > 0 and ≤ 10,000,000. */
export const advanceRequestSchema = z.object({
  amount: z
    .number({ message: 'Amount is required' })
    .positive('Enter a valid amount')
    .max(10_000_000, 'Amount is too large'),
  reason: z.string().trim().min(3, 'Please describe the reason').max(500, 'Reason is too long'),
});

export type AdvanceRequestFormValues = z.infer<typeof advanceRequestSchema>;
