import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services/admin.service';
import type {
  BandwidthCategoryItem,
  BandwidthCatalogItem,
  BandwidthProviderItem,
  BandwidthPurchaseBillItem,
  BandwidthSellClientItem,
  BandwidthInvoiceItem,
  DailyBillItem,
} from '@/data/admin/bandwidth.data';

export function useBandwidthData() {
  return useQuery({
    queryKey: ['admin', 'bandwidth'],
    queryFn: async () => {
      const bandwidthRes = await adminService.getReportBandwidth();
      const data = (bandwidthRes && typeof bandwidthRes === 'object' ? bandwidthRes : {}) as {
        bandwidthCategories?: BandwidthCategoryItem[];
        bandwidthCatalogItems?: BandwidthCatalogItem[];
        bandwidthProviders?: BandwidthProviderItem[];
        bandwidthPurchaseBills?: BandwidthPurchaseBillItem[];
        bandwidthSellClients?: BandwidthSellClientItem[];
        bandwidthInvoices?: BandwidthInvoiceItem[];
        dailyBills?: DailyBillItem[];
        bandwidthSummary?: {
          totalPurchasedMbps: number;
          totalSoldMbps: number;
          utilizationPercent: number;
          monthlyCostBdt: number;
          monthlyRevenueBdt: number;
        };
      };
      return {
        categories: data?.bandwidthCategories ?? [],
        catalogItems: data?.bandwidthCatalogItems ?? [],
        providers: data?.bandwidthProviders ?? [],
        purchaseBills: data?.bandwidthPurchaseBills ?? [],
        sellClients: data?.bandwidthSellClients ?? [],
        invoices: data?.bandwidthInvoices ?? [],
        dailyBills: data?.dailyBills ?? [],
        summary: data?.bandwidthSummary ?? {
          totalPurchasedMbps: 0,
          totalSoldMbps: 0,
          utilizationPercent: 0,
          monthlyCostBdt: 0,
          monthlyRevenueBdt: 0,
        },
      };
    },
  });
}
