import { z } from 'zod';

/** Income / expense entry form. Snake_case keys match the backend's 422 `details`. */
export const ledgerEntrySchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  category: z.string().min(1, 'Select a category'),
  employee: z.string().min(1, 'Select an employee'),
  date: z.string().min(1, 'Date is required'),
  amount: z.number({ error: 'Enter an amount' }).positive('Amount must be greater than 0'),
  bank_account: z.string().min(1, 'Select a bank account'),
  invoice_no: z.string().optional(),
  description: z.string().optional(),
});

export type LedgerEntryFormValues = z.infer<typeof ledgerEntrySchema>;
