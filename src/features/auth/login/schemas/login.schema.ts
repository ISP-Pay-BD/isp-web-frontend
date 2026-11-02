import { z } from 'zod';

const isDebug =
  process.env.NEXT_PUBLIC_APP_ENV === 'debug' ||
  process.env.NODE_ENV === 'development';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: isDebug
    ? z.string().optional()
    : z.string().min(1, 'Password is required'),
  /** Authenticator code — only sent once the backend asks for it (2FA users). */
  otp: z.string().optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
