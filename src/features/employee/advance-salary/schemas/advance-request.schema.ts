import { z } from 'zod';

export const advanceRequestSchema = z.object({
  amountBdt: z
    .number({ message: 'Amount is required' })
    .min(500, 'Minimum advance is ৳500')
    .max(50000, 'Maximum advance is ৳50,000'),
  reason: z
    .string()
    .min(10, 'Please describe the reason (at least 10 characters)')
    .max(500, 'Reason is too long'),
});

export type AdvanceRequestFormValues = z.infer<typeof advanceRequestSchema>;
