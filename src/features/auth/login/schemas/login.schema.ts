import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  /** Authenticator code — only sent once the backend asks for it (2FA users). */
  otp: z.string().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
