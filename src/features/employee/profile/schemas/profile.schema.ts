import { z } from 'zod';
import { isValidBdPhone } from '@/lib/format';

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  phone: z.string().refine((v) => isValidBdPhone(v), 'Enter a valid Bangladesh mobile number'),
  email: z.string().trim().email('Enter a valid email address'),
  address: z.string().trim().max(500, 'Address is too long'),
});

export type ProfileUpdateFormValues = z.infer<typeof profileUpdateSchema>;
