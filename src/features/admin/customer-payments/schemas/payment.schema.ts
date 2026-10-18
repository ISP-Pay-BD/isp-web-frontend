import { z } from 'zod';

/** Form → POST /v1/reseller/customer-payments/{rid} {customer, amount, month, status, paid_via, method_trx, comment}. */
export const paymentSchema = z.object({
  customerId: z.string().min(1, 'Select a customer'),
  customerName: z.string().optional(),
  amountBdt: z.coerce.number().positive('Amount must be greater than 0'),
  billingMonth: z.string().min(1, 'Choose the billing month'),
  method: z.string().min(1, 'Choose how the money was received'),
  status: z.enum(['successful', 'pending', 'failed']),
  trxId: z.string().max(100, 'Too long').optional(),
  note: z.string().max(255, 'Too long').optional(),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;
