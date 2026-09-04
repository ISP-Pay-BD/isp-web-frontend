import { z } from 'zod';

export const contactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^(\+?88)?01[3-9]\d{8}$/, 'Enter a valid Bangladesh mobile number (e.g. 017XXXXXXXX)'),
  email: z.string().email('Enter a valid email address'),
  inquiryType: z.enum(['Demo Request', 'Feature Update Request', 'Enterprise / Other']),
  message: z.string().min(5, 'Message must be at least 5 characters'),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
