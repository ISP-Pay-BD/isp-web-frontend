import { z } from 'zod';

/** Mirrors EmployeePaymentServicePart01Segment::paymentErrors. */
export const salaryPaymentSchema = z
  .object({
    employeeId: z.string().min(1, 'Select employee'),
    month: z.string().min(1, 'Select payment month'),
    year: z.number().int().min(2000, 'Invalid year').max(2100, 'Invalid year'),
    amount: z.number({ message: 'Enter payment amount' }).positive('Enter payment amount'),
    status: z.enum(['successful', 'pending', 'failed']),
    paidVia: z.string(),
    methodTrx: z.string().max(100, 'Reference is too long'),
    deductAdvances: z.boolean(),
  })
  .refine((v) => v.status !== 'successful' || v.paidVia !== '', {
    path: ['paidVia'],
    message: 'Select payment method',
  });

export type SalaryPaymentFormValues = z.infer<typeof salaryPaymentSchema>;
