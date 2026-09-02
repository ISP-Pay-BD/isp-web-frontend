import { z } from 'zod';
import { isValidBdPhone } from '@/lib/format';

export const profileUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z
    .string()
    .refine((v) => isValidBdPhone(v), 'Enter a valid Bangladesh mobile number'),
  email: z.string().email('Enter a valid email address'),
});

export type ProfileUpdateFormValues = z.infer<typeof profileUpdateSchema>;
