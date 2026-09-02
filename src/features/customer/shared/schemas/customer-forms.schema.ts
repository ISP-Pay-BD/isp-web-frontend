import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^(?:\+?88)?01[3-9]\d{8}$/, 'Must be a valid Bangladeshi mobile number'),
  email: z.string().email('Please enter a valid email address'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm password is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const createTicketSchema = z.object({
  category: z.string().min(1, 'Please select an issue category'),
  priority: z.enum(['low', 'medium', 'high']),
  subject: z.string().min(5, 'Subject must be at least 5 characters').max(120),
  message: z.string().min(10, 'Message body must be at least 10 characters'),
});

export const ticketReplySchema = z.object({
  message: z.string().min(2, 'Reply message cannot be empty'),
});

export const updateWifiSchema = z.object({
  ssid: z.string().min(2, 'SSID must be at least 2 characters').max(32),
  password: z.string().min(8, 'WiFi password must be at least 8 characters'),
  securityMode: z.string().optional(),
  hideSsid: z.boolean().optional(),
});

export const payInvoiceSchema = z.object({
  amount: z.number().min(10, 'Minimum payment is ৳10'),
  method: z.enum(['bkash', 'nagad', 'rocket', 'upay', 'card', 'bank']),
  accountNumber: z.string().optional(),
  trxId: z.string().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type TicketReplyInput = z.infer<typeof ticketReplySchema>;
export type UpdateWifiInput = z.infer<typeof updateWifiSchema>;
export type PayInvoiceInput = z.infer<typeof payInvoiceSchema>;
