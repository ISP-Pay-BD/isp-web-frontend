import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services/admin.service';

export function usePurchase() {
  const query = useQuery({
    queryKey: ['admin', 'purchase'],
    queryFn: async () => {
      try {
        const suppliers = await adminService.getInventorySuppliers();
        return {
          purchaseVendors: Array.isArray(suppliers) ? suppliers : [],
          purchaseRequisitions: [],
          purchaseBills: [],
        };
      } catch {
        return {
          purchaseVendors: [],
          purchaseRequisitions: [],
          purchaseBills: [],
        };
      }
    },
  });

  const data = query.data as {
    purchaseVendors?: PurchaseVendor[];
    purchaseRequisitions?: PurchaseRequisition[];
    purchaseBills?: PurchaseBill[];
  } | undefined;

  return {
    ...query,
    vendors: data?.purchaseVendors ?? [],
    requisitions: data?.purchaseRequisitions ?? [],
    bills: data?.purchaseBills ?? [],
  };
}


export interface PurchaseVendor {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  status: string;
  balanceBdt: number;
}

export interface PurchaseRequisition {
  id: string;
  requisitionId: string;
  title: string;
  itemCount: number;
  totalAmountBdt: number;
  requisitionDate: string;
  requisitionBy: string;
  deadline: string;
  status: string;
}

export interface PurchaseBill {
  id: string;
  billNumber: string;
  vendorName: string;
  amountBdt: number;
  paidAmountBdt: number;
  dueAmountBdt: number;
  billDate: string;
  dueDate: string;
  status: string;
  itemsCount: number;
}
