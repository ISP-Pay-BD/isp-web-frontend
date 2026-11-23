import { z } from 'zod';

/** Form → `POST /v1/payments` (Rust `CreatePaymentRequest`: customer_id, amount_cents, method, gateway_trx, note). */
export const collectPaymentSchema = z.object({
  customerId: z.string().min(1, 'Select a customer'),
  amountBdt: z.coerce.number().positive('Amount must be greater than 0'),
  method: z.string().min(1, 'Choose how the money was received'),
  trxId: z.string().max(128, 'Too long').optional(),
  note: z.string().max(512, 'Too long').optional(),
});

export type CollectPaymentValues = z.infer<typeof collectPaymentSchema>;

export function toPaymentBody(v: CollectPaymentValues) {
  return {
    customer_id: Number(v.customerId),
    amount_cents: Math.round(v.amountBdt * 100),
    method: v.method,
    ...(v.trxId?.trim() ? { gateway_trx: v.trxId.trim() } : {}),
    ...(v.note?.trim() ? { note: v.note.trim() } : {}),
  };
}
