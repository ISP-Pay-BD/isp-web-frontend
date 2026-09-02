import { z } from 'zod';

export const employeeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^01[3-9]\d{8}$/, 'Enter valid Bangladeshi mobile number (e.g. 01712345678)'),
  email: z.string().email('Invalid email address').or(z.literal('')),
  role: z.string().min(2, 'Select or enter employee designation'),
  salaryBdt: z.number().min(0, 'Salary must be a positive amount'),
  area: z.string().min(2, 'Service area is required'),
  nid: z.string().min(10, 'Valid NID is required (min 10 digits)').or(z.literal('')),
  status: z.enum(['active', 'inactive']),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;
