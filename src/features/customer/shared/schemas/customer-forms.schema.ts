import { z } from 'zod';

/**
 * Form rules mirror the PHP validators (zapi/Modules/Customer/*) so the user
 * sees the same constraints before the request is sent.
 */

/** ProfileService::update — name/mobile/email/address; empty fields are left unchanged. */
export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  mobile: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{6,20}$/, 'Enter a valid mobile number'),
  email: z.union([z.literal(''), z.string().trim().email('Enter a valid email address')]),
  address: z.string().trim(),
});

/** ProfileService::changePassword — new password ≥ 6 chars. */
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

/** `tickets.category` / `tickets.priority` enums. */
export const TICKET_CATEGORIES = ['technical', 'noc', 'sales', 'marketing', 'general', 'none'] as const;
export const TICKET_PRIORITIES = ['low', 'medium', 'high'] as const;

export const createTicketSchema = z.object({
  category: z.enum(TICKET_CATEGORIES, { message: 'Please select an issue category' }),
  priority: z.enum(TICKET_PRIORITIES),
  subject: z.string().trim().min(5, 'Subject must be at least 5 characters').max(120, 'Subject can be at most 120 characters'),
  message: z.string().trim().min(10, 'Message body must be at least 10 characters'),
});

export const ticketReplySchema = z.object({
  message: z.string().trim().min(2, 'Reply message cannot be empty'),
});

/** RouterControlService::changeWifi — SSID 1–32 chars, password ≥ 8, band both|2g|5g. */
export const WIFI_BANDS = ['both', '2g', '5g'] as const;

export const updateWifiSchema = z.object({
  ssid: z.string().trim().min(1, 'Enter a network name').max(32, 'SSID can be at most 32 characters'),
  password: z.string().min(8, 'WiFi password must be at least 8 characters'),
  band: z.enum(WIFI_BANDS),
  targetId: z.string().optional(),
});

/** PaymentService::store — a manually paid amount awaiting staff verification. */
export const manualPaymentSchema = z.object({
  amount: z.number({ message: 'Enter the amount you paid' }).positive('Enter the amount you paid'),
  method: z.string().trim().min(2, 'Enter how you paid (e.g. the mobile wallet name)'),
  trxId: z.string().trim().min(4, 'Enter the transaction ID from your payment receipt'),
  accountNumber: z.string().trim().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type TicketReplyInput = z.infer<typeof ticketReplySchema>;
export type UpdateWifiInput = z.infer<typeof updateWifiSchema>;
export type ManualPaymentInput = z.infer<typeof manualPaymentSchema>;
