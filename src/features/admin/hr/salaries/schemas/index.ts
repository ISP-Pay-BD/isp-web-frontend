import { z } from 'zod';

export const salaryPaymentSchema = z.object({
  employeeId: z.string().min(1, 'Please select an employee'),
  month: z.string().min(4, 'Select salary month (e.g. 2026-09)'),
  amountBdt: z.number().min(100, 'Amount must be greater than ৳100'),
  paidVia: z.string().min(2, 'Select payment method / bank account'),
  notes: z.string().optional(),
});

export type SalaryPaymentFormValues = z.infer<typeof salaryPaymentSchema>;
