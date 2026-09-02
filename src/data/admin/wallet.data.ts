export interface WalletTransaction {
  id: string;
  trxId: string;
  type: 'topup' | 'subscription_charge' | 'refund' | 'sms_charge' | 'adjustment';
  amountBdt: number;
  balanceAfterBdt: number;
  description: string;
  date: string;
  paymentMethod?: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface TenantWallet {
  balanceBdt: number;
  currency: 'BDT';
  isPayg: boolean;
  estimatedMonthlyChargeBdt: number;
  minimumTopupBdt: number;
  runwayMonths: number;
  totalSubscribersCount: number;
  costPerSubscriberBdt: number;
  nextBillingDate: string;
  graceUntil?: string;
  subscriptionStatus: 'active' | 'grace' | 'suspended';
  transactions: WalletTransaction[];
}

export const tenantWallet: TenantWallet = {
  balanceBdt: 18500,
  currency: 'BDT',
  isPayg: true,
  estimatedMonthlyChargeBdt: 4500,
  minimumTopupBdt: 1000,
  runwayMonths: 4,
  totalSubscribersCount: 450,
  costPerSubscriberBdt: 10,
  nextBillingDate: '2026-10-01',
  subscriptionStatus: 'active',
  transactions: [
    {
      id: 'wtx_001',
      trxId: 'TRX98273612',
      type: 'topup',
      amountBdt: 10000,
      balanceAfterBdt: 18500,
      description: 'Wallet top-up via bKash Merchant',
      date: '2026-09-01 14:32',
      paymentMethod: 'bKash',
      status: 'completed',
    },
    {
      id: 'wtx_002',
      trxId: 'SYS20260901',
      type: 'subscription_charge',
      amountBdt: 4500,
      balanceAfterBdt: 8500,
      description: 'Monthly platform fee for 450 active subscribers',
      date: '2026-09-01 00:01',
      status: 'completed',
    },
    {
      id: 'wtx_003',
      trxId: 'TRX82716301',
      type: 'topup',
      amountBdt: 5000,
      balanceAfterBdt: 13000,
      description: 'Wallet recharge via Nagad',
      date: '2026-08-25 11:15',
      paymentMethod: 'Nagad',
      status: 'completed',
    },
    {
      id: 'wtx_004',
      trxId: 'SMS88273912',
      type: 'sms_charge',
      amountBdt: 500,
      balanceAfterBdt: 8000,
      description: '1,500 Bulk SMS bundle recharge',
      date: '2026-08-15 16:45',
      status: 'completed',
    },
  ],
};
