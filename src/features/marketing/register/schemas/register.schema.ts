import { z } from 'zod';

export const registrationSchema = z
  .object({
    organization_name: z.string().min(2, 'Organization name must be at least 2 characters'),
    admin_name: z.string().min(2, 'Admin name must be at least 2 characters'),
    mobile: z.string().regex(/^(\+?88)?01[3-9]\d{8}$/, 'Enter valid BD mobile number (e.g. 017XXXXXXXX)'),
    nationalid: z.string().min(10, 'National ID must be at least 10 digits'),
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(4, 'Password must be at least 4 characters'),
    confirm_password: z.string().min(4, 'Confirm password must be at least 4 characters'),
    division: z.string().min(1, 'Please select a division'),
    district: z.string().min(1, 'Please select a district'),
    upazilla: z.string().min(1, 'Upazilla/Thana is required'),
    address: z.string().min(3, 'Address is required'),
    package: z.string().min(1, 'Please select a package plan'),
    customer_type: z.array(z.string()).min(1, 'Select at least one customer type'),
    reference_name: z.string().optional(),
    reference_mobile: z.string().optional(),
    referral_code: z.string().optional(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'],
  });

export type RegistrationFormData = z.infer<typeof registrationSchema>;
