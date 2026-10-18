import { z } from 'zod';

const bdMobile = z
  .string()
  .trim()
  .refine((v) => /^(?:\+?88)?01[3-9]\d{8}$/.test(v.replace(/[\s-]/g, '')), 'Enter a valid Bangladeshi mobile (01XXXXXXXXX)');

const base = {
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  mobile: bdMobile,
  email: z.string().trim().email('Enter a valid email address'),
  designation: z.string().min(1, 'Select a designation'),
  salary: z
    .string()
    .trim()
    .refine((v) => v === '' || (Number.isFinite(Number(v)) && Number(v) >= 0), 'Enter a valid monthly salary'),
  areaIds: z.array(z.string()).min(1, "Select the employee's service area"),
  address: z.string().trim().min(2, 'Address is required'),
  nidNumber: z
    .string()
    .trim()
    .refine((v) => v === '' || /^(\d{10}|\d{13}|\d{17})$/.test(v), 'NID must be 10, 13 or 17 digits'),
  status: z.enum(['active', 'inactive']),
  password: z.string(),
  rePassword: z.string(),
};

/** Same rules as the backend (EmployeeServicePart01Segment create/update). */
export function employeeSchema(isEdit: boolean) {
  return z.object(base).superRefine((v, ctx) => {
    if (!isEdit && v.password.length < 6) {
      ctx.addIssue({ code: 'custom', path: ['password'], message: 'Password must be at least 6 characters' });
    }
    if (isEdit && v.password !== '' && v.password.length < 6) {
      ctx.addIssue({ code: 'custom', path: ['password'], message: 'Password must be at least 6 characters' });
    }
    if (v.password !== v.rePassword) {
      ctx.addIssue({ code: 'custom', path: ['rePassword'], message: 'Passwords do not match' });
    }
  });
}

export type EmployeeFormValues = z.infer<ReturnType<typeof employeeSchema>>;
