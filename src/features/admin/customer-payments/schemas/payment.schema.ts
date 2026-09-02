import { z } from 'zod';

export const paymentSchema = z.object({
  customerId: z.string().min(1, 'Select a customer'),
  customerName: z.string().optional(),
  amountBdt: z.coerce.number().min(1, 'Amount must be at least ৳1'),
  method: z.enum(['bkash', 'nagad', 'cash', 'bank', 'sslcommerz']),
  status: z.enum(['completed', 'pending', 'failed']),
  note: z.string().optional(),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;
