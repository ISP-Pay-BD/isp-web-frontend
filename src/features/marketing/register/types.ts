/** ISP self-registration (`/v1/public/registration/*`) + customer referral (`/common/*`). */

export interface RegistrationPlan {
  id: string;
  name: string;
  priceBdt: number;
  pricingType: string;
  trialDays: number;
  /** Free days a new signup gets: trialDays, or the plan's preview days when that is 0. */
  freeDays: number;
  features: string[];
}

export interface PaygAddon {
  key: string;
  name: string;
  price: number;
}

export interface PaygPlan {
  id: string;
  name: string;
  baseFee: number;
  perUserRate: number;
  minTopup: number;
  trialDays: number;
  addons: PaygAddon[];
}

export interface RegistrationPlans {
  plans: RegistrationPlan[];
  payg: PaygPlan | null;
  allowSelfRegistration: boolean;
}

export interface RegisterIspResult {
  message: string;
  planType: string;
  pending: boolean;
  trialDays: number;
  trialEndsAt: string | null;
}

export interface ReferralPackage {
  id: string;
  name: string;
  bandwidth: string;
  priceBdt: number;
}

export interface ReferralValidation {
  valid: boolean;
  code: string;
  referrerName: string;
  ispName: string;
  packages: ReferralPackage[];
}

export interface ReferralRegisterInput {
  name: string;
  mobile: string;
  email?: string;
  nidNumber?: string;
  ref: string;
  packageId?: string;
}
