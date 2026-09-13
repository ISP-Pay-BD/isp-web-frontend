import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services/admin.service';

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
      try {
        const txs = await adminService.getTenantWallet();
        return {
          balanceBdt: 25000,
          currency: 'BDT',
          isPayg: true,
          estimatedMonthlyChargeBdt: 3500,
          minimumTopupBdt: 1000,
          runwayMonths: 7,
          totalSubscribersCount: 150,
          costPerSubscriberBdt: 25,
          nextBillingDate: '2026-10-01',
          subscriptionStatus: 'active',
          transactions: Array.isArray(txs) ? (txs as WalletTransaction[]) : [],
        };
      } catch {
        return {
          balanceBdt: 0,
          currency: 'BDT',
          isPayg: true,
          estimatedMonthlyChargeBdt: 0,
          minimumTopupBdt: 0,
          runwayMonths: 0,
          totalSubscribersCount: 0,
          costPerSubscriberBdt: 0,
          nextBillingDate: '',
          subscriptionStatus: 'inactive',
          transactions: [],
        };
      }
    },
  });

  return { ...query, wallet: query.data };
}

