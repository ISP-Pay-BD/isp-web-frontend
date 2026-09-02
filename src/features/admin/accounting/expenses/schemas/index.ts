import { z } from 'zod';

export const expenseSchema = z.object({
  category: z.string().min(2, 'Please select or enter expense category'),
  amountBdt: z.number().min(1, 'Amount must be greater than 0'),
  vendor: z.string().min(2, 'Vendor or payee is required'),
  date: z.string().min(8, 'Date is required'),
  note: z.string().optional(),
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;
