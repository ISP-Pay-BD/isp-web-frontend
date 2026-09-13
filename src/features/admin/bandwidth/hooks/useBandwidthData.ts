import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services/admin.service';
import { mockFetch } from '@/lib/mock-api/client';
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
      try {
        const bandwidthRes = await adminService.getReportBandwidth();
        const data = (bandwidthRes && typeof bandwidthRes === 'object' ? bandwidthRes : await mockFetch('admin.domain', 'bandwidth')) as {
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
            totalPurchasedMbps: 2500,
            totalSoldMbps: 630,
            utilizationPercent: 82,
            monthlyCostBdt: 605000,
            monthlyRevenueBdt: 227000,
          },
        };
      } catch {
        const data = (await mockFetch('admin.domain', 'bandwidth')) as {
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
            totalPurchasedMbps: 2500,
            totalSoldMbps: 630,
            utilizationPercent: 82,
            monthlyCostBdt: 605000,
            monthlyRevenueBdt: 227000,
          },
        };
      }
    },
  });
}

