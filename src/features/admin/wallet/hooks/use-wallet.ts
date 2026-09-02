import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';

export interface WalletTransaction {
  id: string;
  trxId: string;
  type: string;
  amountBdt: number;
  balanceAfterBdt: number;
  description: string;
  date: string;
  paymentMethod?: string;
  status: string;
}

export interface TenantWalletData {
  balanceBdt: number;
  currency: string;
  isPayg: boolean;
  estimatedMonthlyChargeBdt: number;
  minimumTopupBdt: number;
  runwayMonths: number;
  totalSubscribersCount: number;
  costPerSubscriberBdt: number;
  nextBillingDate: string;
  subscriptionStatus: string;
  transactions: WalletTransaction[];
}

export function useWallet() {
  const query = useQuery({
    queryKey: ['admin', 'wallet'],
    queryFn: async () => {
      const data = await mockFetch('admin.domain', 'wallet');
      return (data as { tenantWallet: TenantWalletData }).tenantWallet;
    },
  });

  return { ...query, wallet: query.data };
}
