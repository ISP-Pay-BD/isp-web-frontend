import { z } from 'zod';

/** Mirrors RouterAdminService::save validation (POST/PUT /v1/routers). */
export const routerSchema = z.object({
  name: z.string().trim().max(100, 'Keep the name under 100 characters'),
  host: z.string().trim().min(1, 'Enter MikroTik host name or IP address').max(255),
  port: z
    .number({ message: 'Enter a valid MikroTik API port number' })
    .int()
    .min(1, 'Enter a valid MikroTik API port number')
    .max(65535, 'Enter a valid MikroTik API port number'),
  username: z.string().trim().min(1, 'Enter MikroTik username'),
  /** Blank on edit keeps the stored password; required on create (checked in the modal). */
  password: z.string(),
  status: z.enum(['active', 'inactive']),
  hotspotName: z.string().trim().max(40),
  dnsName: z.string().trim().max(30),
});

export type RouterFormValues = z.infer<typeof routerSchema>;
