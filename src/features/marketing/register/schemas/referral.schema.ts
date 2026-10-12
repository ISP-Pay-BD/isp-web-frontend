import { z } from 'zod';

/** Customer referral lead — POST /common/register. */
export const referralRegistrationSchema = z.object({
  ref: z.string().trim().min(1, 'A referral code is required'),
  name: z.string().trim().min(2, 'Name is required'),
  mobile: z.string().trim().regex(/^(\+?88)?01[3-9]\d{8}$/, 'Enter valid BD mobile number (e.g. 017XXXXXXXX)'),
  email: z.union([z.literal(''), z.string().trim().email('Enter a valid email address')]).optional(),
  nid_number: z.string().trim().optional(),
  package_id: z.string().optional(),
});

export type ReferralRegistrationFormData = z.infer<typeof referralRegistrationSchema>;
