import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services/admin.service';

export function useInventory() {
  const query = useQuery({
    queryKey: ['admin', 'inventory'],
    queryFn: async () => {
      try {
        const [itemsRes, catRes, supRes] = await Promise.allSettled([
          adminService.getInventoryItems(),
          adminService.getInventoryCategories(),
          adminService.getInventorySuppliers(),
        ]);

        return {
          inventoryItems: itemsRes.status === 'fulfilled' && Array.isArray(itemsRes.value) ? itemsRes.value : [],
          inventoryCategories: catRes.status === 'fulfilled' && Array.isArray(catRes.value) ? catRes.value : [],
          inventorySuppliers: supRes.status === 'fulfilled' && Array.isArray(supRes.value) ? supRes.value : [],
          inventoryUnits: [],
          inventoryLocations: [],
          inventoryStock: [],
        };
      } catch {
        return {
          inventoryItems: [],
          inventoryCategories: [],
          inventorySuppliers: [],
          inventoryUnits: [],
          inventoryLocations: [],
          inventoryStock: [],
        };
      }
    },
  });

  const data = query.data as {
    inventoryUnits?: InventoryUnit[];
    inventoryLocations?: InventoryLocation[];
    inventoryCategories?: InventoryCategory[];
    inventoryItems?: InventoryItem[];
    inventoryStock?: InventoryStock[];
  } | undefined;

  return {
    ...query,
    units: data?.inventoryUnits ?? [],
    locations: data?.inventoryLocations ?? [],
    categories: data?.inventoryCategories ?? [],
    items: data?.inventoryItems ?? [],
    stock: data?.inventoryStock ?? [],
  };
}


export interface InventoryUnit {
  id: string;
  name: string;
  shortCode: string;
  description?: string;
}

export interface InventoryLocation {
  id: string;
  name: string;
  code: string;
  address: string;
  managerName: string;
  phone: string;
}

export interface InventoryCategory {
  id: string;
  name: string;
  code: string;
  itemCount: number;
}

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  categoryName: string;
  unitName: string;
  unitPriceBdt: number;
  minStockAlert: number;
  status: string;
}

export interface InventoryStock {
  id: string;
  itemName: string;
  itemCode: string;
  categoryName: string;
  locationName: string;
  quantity: number;
  unitName: string;
  totalValueBdt: number;
  status: string;
}
