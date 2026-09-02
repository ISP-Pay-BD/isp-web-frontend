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
  categoryId: string;
  categoryName: string;
  unitId: string;
  unitName: string;
  unitPriceBdt: number;
  vatPercent: number;
  minStockAlert: number;
  status: 'active' | 'discontinued';
}

export interface InventoryStock {
  id: string;
  itemId: string;
  itemName: string;
  itemCode: string;
  categoryName: string;
  locationId: string;
  locationName: string;
  quantity: number;
  unitName: string;
  avgUnitCostBdt: number;
  totalValueBdt: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export const inventoryUnits: InventoryUnit[] = [
  { id: 'unit_1', name: 'Pieces', shortCode: 'Pcs', description: 'Single physical unit' },
  { id: 'unit_2', name: 'Meter', shortCode: 'Mtr', description: 'Length of cable or wire' },
  { id: 'unit_3', name: 'Drum', shortCode: 'Drm', description: '1000 meters cable drum' },
  { id: 'unit_4', name: 'Box', shortCode: 'Box', description: 'Packaging box of connectors/accessories' },
  { id: 'unit_5', name: 'Pair', shortCode: 'Pair', description: 'Optical transceivers pair' },
];

export const inventoryLocations: InventoryLocation[] = [
  { id: 'loc_1', name: 'Central Warehouse NOC', code: 'LOC-CENTRAL', address: 'Plot 12, Road 4, Sector 7, Uttara, Dhaka', managerName: 'Habibur Rahman', phone: '01710111222' },
  { id: 'loc_2', name: 'Mirpur Sub-Store', code: 'LOC-MIRPUR', address: 'Mirpur 10 Roundabout, Dhaka', managerName: 'Sultan Mahmud', phone: '01810111333' },
  { id: 'loc_3', name: 'Mohakhali POP Store', code: 'LOC-MOHAKHALI', address: 'Wireless Gate, Mohakhali, Dhaka', managerName: 'Rafiqul Islam', phone: '01910111444' },
];

export const inventoryCategories: InventoryCategory[] = [
  { id: 'cat_1', name: 'Active Network Gear', code: 'CAT-ACT', itemCount: 12 },
  { id: 'cat_2', name: 'Fiber Optics & Cable', code: 'CAT-FBR', itemCount: 8 },
  { id: 'cat_3', name: 'Passive Accessories & Splicing', code: 'CAT-PAS', itemCount: 15 },
  { id: 'cat_4', name: 'Power & UPS Backup', code: 'CAT-PWR', itemCount: 5 },
  { id: 'cat_5', name: 'Subscriber CPE / ONU', code: 'CAT-ONU', itemCount: 6 },
];

export const inventoryItems: InventoryItem[] = [
  { id: 'itm_001', code: 'ITM-ONU-01', name: 'XPON Dual Band Gigabit ONU (V2804AX)', categoryId: 'cat_5', categoryName: 'Subscriber CPE / ONU', unitId: 'unit_1', unitName: 'Pcs', unitPriceBdt: 1850, vatPercent: 5, minStockAlert: 20, status: 'active' },
  { id: 'itm_002', code: 'ITM-ONU-02', name: 'EPON 1GE Fiber Router ONU', categoryId: 'cat_5', categoryName: 'Subscriber CPE / ONU', unitId: 'unit_1', unitName: 'Pcs', unitPriceBdt: 950, vatPercent: 5, minStockAlert: 30, status: 'active' },
  { id: 'itm_003', code: 'ITM-CBL-01', name: '2-Core FTTH Drop Cable FRP', categoryId: 'cat_2', categoryName: 'Fiber Optics & Cable', unitId: 'unit_3', unitName: 'Drum', unitPriceBdt: 7800, vatPercent: 5, minStockAlert: 5, status: 'active' },
  { id: 'itm_004', code: 'ITM-CBL-02', name: 'Patch Cord SC/UPC-SC/APC 3M', categoryId: 'cat_2', categoryName: 'Fiber Optics & Cable', unitId: 'unit_1', unitName: 'Pcs', unitPriceBdt: 90, vatPercent: 0, minStockAlert: 50, status: 'active' },
  { id: 'itm_005', code: 'ITM-SFP-01', name: '1.25G SFP Transceiver 20KM 1310/1550', categoryId: 'cat_1', categoryName: 'Active Network Gear', unitId: 'unit_5', unitName: 'Pair', unitPriceBdt: 1600, vatPercent: 5, minStockAlert: 10, status: 'active' },
  { id: 'itm_006', code: 'ITM-SPL-01', name: '1:8 PLC Optical Fiber Splitter Mini Type', categoryId: 'cat_3', categoryName: 'Passive Accessories & Splicing', unitId: 'unit_1', unitName: 'Pcs', unitPriceBdt: 240, vatPercent: 0, minStockAlert: 25, status: 'active' },
  { id: 'itm_007', code: 'ITM-TJB-01', name: 'Optical Distribution Box (ODB) 16 Port IP65', categoryId: 'cat_3', categoryName: 'Passive Accessories & Splicing', unitId: 'unit_1', unitName: 'Pcs', unitPriceBdt: 650, vatPercent: 0, minStockAlert: 15, status: 'active' },
  { id: 'itm_008', code: 'ITM-BAT-01', name: '12V 100Ah Deep Cycle Gel Battery', categoryId: 'cat_4', categoryName: 'Power & UPS Backup', unitId: 'unit_1', unitName: 'Pcs', unitPriceBdt: 19500, vatPercent: 10, minStockAlert: 4, status: 'active' },
];

export const inventoryStock: InventoryStock[] = [
  { id: 'stk_1', itemId: 'itm_001', itemName: 'XPON Dual Band Gigabit ONU (V2804AX)', itemCode: 'ITM-ONU-01', categoryName: 'Subscriber CPE / ONU', locationId: 'loc_1', locationName: 'Central Warehouse NOC', quantity: 68, unitName: 'Pcs', avgUnitCostBdt: 1750, totalValueBdt: 119000, status: 'in_stock' },
  { id: 'stk_2', itemId: 'itm_002', itemName: 'EPON 1GE Fiber Router ONU', itemCode: 'ITM-ONU-02', categoryName: 'Subscriber CPE / ONU', locationId: 'loc_2', locationName: 'Mirpur Sub-Store', quantity: 12, unitName: 'Pcs', avgUnitCostBdt: 900, totalValueBdt: 10800, status: 'low_stock' },
  { id: 'stk_3', itemId: 'itm_003', itemName: '2-Core FTTH Drop Cable FRP', itemCode: 'ITM-CBL-01', categoryName: 'Fiber Optics & Cable', locationId: 'loc_1', locationName: 'Central Warehouse NOC', quantity: 14, unitName: 'Drum', avgUnitCostBdt: 7500, totalValueBdt: 105000, status: 'in_stock' },
  { id: 'stk_4', itemId: 'itm_004', itemName: 'Patch Cord SC/UPC-SC/APC 3M', itemCode: 'ITM-CBL-02', categoryName: 'Fiber Optics & Cable', locationId: 'loc_1', locationName: 'Central Warehouse NOC', quantity: 340, unitName: 'Pcs', avgUnitCostBdt: 85, totalValueBdt: 28900, status: 'in_stock' },
  { id: 'stk_5', itemId: 'itm_005', itemName: '1.25G SFP Transceiver 20KM 1310/1550', itemCode: 'ITM-SFP-01', categoryName: 'Active Network Gear', locationId: 'loc_3', locationName: 'Mohakhali POP Store', quantity: 3, unitName: 'Pair', avgUnitCostBdt: 1550, totalValueBdt: 4650, status: 'low_stock' },
  { id: 'stk_6', itemId: 'itm_006', itemName: '1:8 PLC Optical Fiber Splitter Mini Type', itemCode: 'ITM-SPL-01', categoryName: 'Passive Accessories & Splicing', locationId: 'loc_2', locationName: 'Mirpur Sub-Store', quantity: 45, unitName: 'Pcs', avgUnitCostBdt: 230, totalValueBdt: 10350, status: 'in_stock' },
  { id: 'stk_7', itemId: 'itm_007', itemName: 'Optical Distribution Box (ODB) 16 Port IP65', itemCode: 'ITM-TJB-01', categoryName: 'Passive Accessories & Splicing', locationId: 'loc_1', locationName: 'Central Warehouse NOC', quantity: 22, unitName: 'Pcs', avgUnitCostBdt: 620, totalValueBdt: 13640, status: 'in_stock' },
  { id: 'stk_8', itemId: 'itm_008', itemName: '12V 100Ah Deep Cycle Gel Battery', itemCode: 'ITM-BAT-01', categoryName: 'Power & UPS Backup', locationId: 'loc_1', locationName: 'Central Warehouse NOC', quantity: 0, unitName: 'Pcs', avgUnitCostBdt: 19000, totalValueBdt: 0, status: 'out_of_stock' },
];
