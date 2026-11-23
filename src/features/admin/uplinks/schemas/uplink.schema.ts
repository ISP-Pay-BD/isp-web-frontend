import { z } from 'zod';

/** Mirrors UplinkMonitoring::create/update validation (PHP rules). */
export const uplinkSchema = z.object({
  routerId: z.string().min(1, 'Select a router'),
  name: z
    .string()
    .trim()
    .min(2, 'Name needs at least 2 characters')
    .max(100, 'Keep the name under 100 characters'),
  uplinkType: z.enum(['interface', 'bgp', 'ping', 'netwatch']),
  target: z.string().trim().min(1, 'Choose or enter what to monitor').max(191),
  alertChannels: z.enum(['both', 'whatsapp', 'sms']),
  notifyMobile: z.string().trim().max(20),
  notifyWhatsapp: z.string().trim().max(20),
  failThreshold: z
    .number({ message: 'Enter a number' })
    .int()
    .min(1, 'At least 1')
    .max(20, 'At most 20'),
});

export type UplinkFormValues = z.infer<typeof uplinkSchema>;
