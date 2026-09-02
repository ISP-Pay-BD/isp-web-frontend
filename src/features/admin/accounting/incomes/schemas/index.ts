import { z } from 'zod';

export const incomeSchema = z.object({
  category: z.string().min(2, 'Please select or enter an income category'),
  amountBdt: z.number().min(1, 'Amount must be greater than 0'),
  date: z.string().min(8, 'Date is required'),
  method: z.string().min(2, 'Select payment method / channel'),
  bankAccount: z.string().optional(),
  note: z.string().optional(),
});

export type IncomeFormValues = z.infer<typeof incomeSchema>;
