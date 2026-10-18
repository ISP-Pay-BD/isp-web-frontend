/** Captive paywall (`/v1/public/captive/*`). */

export interface CaptiveLocator {
  rid: string;
  ip: string;
  mac: string;
}

export interface CaptiveCustomer {
  id: string;
  /** Masked by the backend */
  name: string;
  username: string;
  packageName: string;
  bandwidth: string;
  priceBdt: number;
  expiresAt: string | null;
  expired: boolean;
  subscriptionStatus: string;
  connStatus: string;
  dueBdt: number;
}

export interface CaptiveSession {
  found: boolean;
  customer: CaptiveCustomer | null;
  isp: { name: string; phone: string } | null;
  payment: { id: string; invoice: string; amountBdt: number; payUrl: string } | null;
  canReconnect: boolean;
}

export interface CaptivePayResult {
  paymentId: string;
  invoice: string;
  amountBdt: number;
  payUrl: string;
}

export interface CaptiveReconnectResult {
  status: 'success' | 'pending';
  message: string;
}
