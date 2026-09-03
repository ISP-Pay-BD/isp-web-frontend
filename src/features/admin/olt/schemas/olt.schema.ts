import { z } from 'zod';
import { isValidIpv4 } from '@/lib/format/network';

const oltBrandEnum = z.enum([
  'Huawei', 'ZTE', 'BDCOM', 'V_sol', 'C_data', 'Ecom',
  'ATOP', 'Airmedia', 'Avies', 'Corelink', 'DBC', 'Dn_optic',
  'Fucascom', 'Hsgq', 'Tbs_pothon',
]);

export const oltSchema = z.object({
  name: z.string().min(2, 'OLT name is required (e.g. Downtown_OLT_01)'),
  brand: oltBrandEnum,
  ip: z.string().refine(isValidIpv4, 'Valid IPv4 address required'),
  port: z.number().min(1).max(65535, 'Port must be between 1 and 65535'),
  protocol: z.enum(['telnet', 'http', 'https', 'snmp']),
  username: z.string().min(1, 'Username is required'),
  password: z.string().optional(),
  loginKey: z.string().optional(),
  snmpOid: z.string().optional(),
  area: z.string().min(1, 'Area / POP is required'),
  ponPortsCount: z.number().min(1).max(64),
});

export type OltFormValues = z.infer<typeof oltSchema>;
