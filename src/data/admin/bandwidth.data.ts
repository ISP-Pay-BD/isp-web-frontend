export interface BandwidthCategoryItem {
  id: string;
  name: string;
  parentId?: string;
  parentName?: string;
  priceBdt: number;
  area: string;
  subcategoriesCount: number;
  itemsCount: number;
}

export const bandwidthCategories: BandwidthCategoryItem[] = [
  { id: 'bwc_1', name: 'Dedicated Internet (DIA)', priceBdt: 350, area: 'All Zones', subcategoriesCount: 2, itemsCount: 4 },
  { id: 'bwc_2', name: 'Domestic Peering (BDIX)', priceBdt: 120, area: 'Dhaka Division', subcategoriesCount: 1, itemsCount: 2 },
  { id: 'bwc_3', name: 'International Internet Bandwidth (IIG)', priceBdt: 280, area: 'National', subcategoriesCount: 2, itemsCount: 3 },
  { id: 'bwc_4', name: 'Submarine Cable (SEA-ME-WE-4/5)', priceBdt: 420, area: 'Cox Bazar & Dhaka', subcategoriesCount: 1, itemsCount: 2 },
  { id: 'bwc_5', name: 'Content Cache (Google / FB / CDN)', priceBdt: 90, area: 'All Zones', subcategoriesCount: 1, itemsCount: 2 },
];

export interface BandwidthCatalogItem {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  unitPriceBdt: number;
  vatPercent: number;
  capacityMbps: number;
  type: 'upstream' | 'peering' | 'cache' | 'transit';
  description?: string;
}

export const bandwidthCatalogItems: BandwidthCatalogItem[] = [
  { id: 'bwi_1', name: '100 Mbps DIA Premium Full Duplex', categoryId: 'bwc_1', categoryName: 'Dedicated Internet (DIA)', unitPriceBdt: 32000, vatPercent: 5, capacityMbps: 100, type: 'upstream', description: 'SLA 99.9% redundant fiber delivery' },
  { id: 'bwi_2', name: '500 Mbps DIA Premium Full Duplex', categoryId: 'bwc_1', categoryName: 'Dedicated Internet (DIA)', unitPriceBdt: 150000, vatPercent: 5, capacityMbps: 500, type: 'upstream', description: '1+1 Protection over dual NTTN' },
  { id: 'bwi_3', name: '1 Gbps Wholesale Carrier DIA', categoryId: 'bwc_1', categoryName: 'Dedicated Internet (DIA)', unitPriceBdt: 280000, vatPercent: 5, capacityMbps: 1000, type: 'upstream', description: 'Direct 10G SFP+ port handover' },
  { id: 'bwi_4', name: '200 Mbps BDIX Local Peering', categoryId: 'bwc_2', categoryName: 'Domestic Peering (BDIX)', unitPriceBdt: 18000, vatPercent: 5, capacityMbps: 200, type: 'peering', description: 'Low latency to BD domestic content' },
  { id: 'bwi_5', name: '1 Gbps BDIX Gigabit Port', categoryId: 'bwc_2', categoryName: 'Domestic Peering (BDIX)', unitPriceBdt: 65000, vatPercent: 5, capacityMbps: 1000, type: 'peering', description: 'Ultra-low ping <5ms anywhere in Dhaka' },
  { id: 'bwi_6', name: '500 Mbps Google Global Cache (GGC)', categoryId: 'bwc_5', categoryName: 'Content Cache (Google / FB / CDN)', unitPriceBdt: 40000, vatPercent: 5, capacityMbps: 500, type: 'cache', description: 'YouTube / PlayStore high throughput' },
];

export interface BandwidthProviderItem {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  logoText: string;
  activeCircuits: number;
  totalCapacityMbps: number;
  monthlyBillBdt: number;
  status: 'active' | 'inactive';
}

export const bandwidthProviders: BandwidthProviderItem[] = [
  {
    id: 'bwp_1',
    name: 'Summit Communications Ltd.',
    contactPerson: 'Khandaker Tanvir',
    phone: '01713000101',
    email: 'noc@summitcommunications.net',
    address: 'Summit Centre, 18 Kawran Bazar C/A, Dhaka',
    logoText: 'SUMMIT',
    activeCircuits: 3,
    totalCapacityMbps: 1200,
    monthlyBillBdt: 320000,
    status: 'active',
  },
  {
    id: 'bwp_2',
    name: 'Fiber@Home Limited',
    contactPerson: 'Farhan Masud',
    phone: '01713000202',
    email: 'carrier@fiberathome.net',
    address: 'Uday Tower, 57 Gulshan Avenue, Dhaka',
    logoText: 'F@H',
    activeCircuits: 2,
    totalCapacityMbps: 800,
    monthlyBillBdt: 210000,
    status: 'active',
  },
  {
    id: 'bwp_3',
    name: 'Link3 Technologies Ltd.',
    contactPerson: 'Sajjad Hossain',
    phone: '01713000303',
    email: 'sales.carrier@link3.net',
    address: 'House 11, Road 4, Dhanmondi, Dhaka',
    logoText: 'LINK3',
    activeCircuits: 1,
    totalCapacityMbps: 200,
    monthlyBillBdt: 65000,
    status: 'active',
  },
  {
    id: 'bwp_4',
    name: 'ADN Telecom Ltd.',
    contactPerson: 'Kamrul Hassan',
    phone: '01713000404',
    email: 'info@adntel.net',
    address: 'Red Crescent Concord Tower, 17 Mohakhali C/A, Dhaka',
    logoText: 'ADN',
    activeCircuits: 1,
    totalCapacityMbps: 300,
    monthlyBillBdt: 85000,
    status: 'active',
  },
];

export interface BandwidthPurchaseBillItem {
  id: string;
  billNumber: string;
  providerId: string;
  providerName: string;
  month: string;
  billingDate: string;
  dueDate: string;
  capacityMbps: number;
  amountBdt: number;
  vatBdt: number;
  totalBdt: number;
  status: 'paid' | 'pending' | 'overdue';
  paymentMethod?: string;
  paidAt?: string;
}

export const bandwidthPurchaseBills: BandwidthPurchaseBillItem[] = [
  {
    id: 'bpb_1',
    billNumber: 'BILL-SCL-2026-0901',
    providerId: 'bwp_1',
    providerName: 'Summit Communications Ltd.',
    month: 'September 2026',
    billingDate: '2026-09-01',
    dueDate: '2026-09-15',
    capacityMbps: 1200,
    amountBdt: 320000,
    vatBdt: 16000,
    totalBdt: 336000,
    status: 'paid',
    paymentMethod: 'Bank Transfer (EFT)',
    paidAt: '2026-09-02',
  },
  {
    id: 'bpb_2',
    billNumber: 'BILL-FAH-2026-0902',
    providerId: 'bwp_2',
    providerName: 'Fiber@Home Limited',
    month: 'September 2026',
    billingDate: '2026-09-01',
    dueDate: '2026-09-15',
    capacityMbps: 800,
    amountBdt: 210000,
    vatBdt: 10500,
    totalBdt: 220500,
    status: 'pending',
  },
  {
    id: 'bpb_3',
    billNumber: 'BILL-L3-2026-0801',
    providerId: 'bwp_3',
    providerName: 'Link3 Technologies Ltd.',
    month: 'August 2026',
    billingDate: '2026-08-01',
    dueDate: '2026-08-15',
    capacityMbps: 200,
    amountBdt: 65000,
    vatBdt: 3250,
    totalBdt: 68250,
    status: 'paid',
    paymentMethod: 'Bank Cheque',
    paidAt: '2026-08-10',
  },
  {
    id: 'bpb_4',
    billNumber: 'BILL-ADN-2026-0802',
    providerId: 'bwp_4',
    providerName: 'ADN Telecom Ltd.',
    month: 'August 2026',
    billingDate: '2026-08-01',
    dueDate: '2026-08-15',
    capacityMbps: 300,
    amountBdt: 85000,
    vatBdt: 4250,
    totalBdt: 89250,
    status: 'paid',
    paymentMethod: 'Bank Transfer (RTGS)',
    paidAt: '2026-08-12',
  },
];

export interface BandwidthSellClientItem {
  id: string;
  clientName: string;
  contactPerson: string;
  email: string;
  mobile: string;
  address: string;
  allocatedMbps: number;
  monthlyRateBdt: number;
  balanceDueBdt: number;
  status: 'active' | 'suspended';
  popZone: string;
}

export const bandwidthSellClients: BandwidthSellClientItem[] = [
  {
    id: 'bwc_client_1',
    clientName: 'Grameen IT Solution',
    contactPerson: 'Mr. Shamsul Huda',
    email: 'billing@grameen-it.com',
    mobile: '01819234567',
    address: 'Level 6, Navana Tower, Gulshan 1, Dhaka',
    allocatedMbps: 150,
    monthlyRateBdt: 55000,
    balanceDueBdt: 0,
    status: 'active',
    popZone: 'Gulshan NOC',
  },
  {
    id: 'bwc_client_2',
    clientName: 'POP Mirpur Wholesale Sub-ISP',
    contactPerson: 'Mahfuzur Rahman',
    email: 'admin@mirpurisp.net',
    mobile: '01712987654',
    address: 'Plot 14, Section 10, Mirpur, Dhaka',
    allocatedMbps: 300,
    monthlyRateBdt: 95000,
    balanceDueBdt: 12500,
    status: 'active',
    popZone: 'Mirpur POP',
  },
  {
    id: 'bwc_client_3',
    clientName: 'Hotel Radisson Blue Water Garden',
    contactPerson: 'IT Operations Desk',
    email: 'it.ops@radissonbd.com',
    mobile: '01911445566',
    address: 'Airport Road, Nikunja 2, Dhaka',
    allocatedMbps: 100,
    monthlyRateBdt: 45000,
    balanceDueBdt: 0,
    status: 'active',
    popZone: 'Uttara NOC',
  },
  {
    id: 'bwc_client_4',
    clientName: 'Dhanmondi Media Center',
    contactPerson: 'Arifuzzaman Khan',
    email: 'studio@dhanmondimedia.tv',
    mobile: '01678112233',
    address: 'Road 27, Dhanmondi R/A, Dhaka',
    allocatedMbps: 80,
    monthlyRateBdt: 32000,
    balanceDueBdt: 32000,
    status: 'active',
    popZone: 'Dhanmondi Edge',
  },
];

export interface BandwidthInvoiceItem {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  contactPerson: string;
  billingMonth: string;
  invoiceDate: string;
  dueDate: string;
  capacityMbps: number;
  ratePerMbpsBdt: number;
  subTotalBdt: number;
  vatAmountBdt: number;
  totalBdt: number;
  paidAmountBdt: number;
  dueAmountBdt: number;
  status: 'paid' | 'unpaid' | 'partial';
}

export const bandwidthInvoices: BandwidthInvoiceItem[] = [
  {
    id: 'bwi_inv_101',
    invoiceNumber: 'INV-BW-2026-0901',
    clientId: 'bwc_client_1',
    clientName: 'Grameen IT Solution',
    contactPerson: 'Mr. Shamsul Huda',
    billingMonth: 'September 2026',
    invoiceDate: '2026-09-01',
    dueDate: '2026-09-10',
    capacityMbps: 150,
    ratePerMbpsBdt: 366.67,
    subTotalBdt: 55000,
    vatAmountBdt: 2750,
    totalBdt: 57750,
    paidAmountBdt: 57750,
    dueAmountBdt: 0,
    status: 'paid',
  },
  {
    id: 'bwi_inv_102',
    invoiceNumber: 'INV-BW-2026-0902',
    clientId: 'bwc_client_2',
    clientName: 'POP Mirpur Wholesale Sub-ISP',
    contactPerson: 'Mahfuzur Rahman',
    billingMonth: 'September 2026',
    invoiceDate: '2026-09-01',
    dueDate: '2026-09-10',
    capacityMbps: 300,
    ratePerMbpsBdt: 316.67,
    subTotalBdt: 95000,
    vatAmountBdt: 4750,
    totalBdt: 99750,
    paidAmountBdt: 87250,
    dueAmountBdt: 12500,
    status: 'partial',
  },
  {
    id: 'bwi_inv_103',
    invoiceNumber: 'INV-BW-2026-0903',
    clientId: 'bwc_client_3',
    clientName: 'Hotel Radisson Blue Water Garden',
    contactPerson: 'IT Operations Desk',
    billingMonth: 'September 2026',
    invoiceDate: '2026-09-01',
    dueDate: '2026-09-10',
    capacityMbps: 100,
    ratePerMbpsBdt: 450.00,
    subTotalBdt: 45000,
    vatAmountBdt: 2250,
    totalBdt: 47250,
    paidAmountBdt: 47250,
    dueAmountBdt: 0,
    status: 'paid',
  },
  {
    id: 'bwi_inv_104',
    invoiceNumber: 'INV-BW-2026-0904',
    clientId: 'bwc_client_4',
    clientName: 'Dhanmondi Media Center',
    contactPerson: 'Arifuzzaman Khan',
    billingMonth: 'September 2026',
    invoiceDate: '2026-09-01',
    dueDate: '2026-09-10',
    capacityMbps: 80,
    ratePerMbpsBdt: 400.00,
    subTotalBdt: 32000,
    vatAmountBdt: 1600,
    totalBdt: 33600,
    paidAmountBdt: 0,
    dueAmountBdt: 33600,
    status: 'unpaid',
  },
];

export interface DailyBillItem {
  id: string;
  date: string;
  popName: string;
  usageGb: number;
  ratePerGb: number;
  amountBdt: number;
  receivedBy: string;
  createdBy: string;
  vendor: string;
  status: 'received' | 'pending';
}

export const dailyBills: DailyBillItem[] = [
  { id: 'db_1', date: '2026-09-02', popName: 'Demo POP Uttara', usageGb: 1450, ratePerGb: 2.5, amountBdt: 3625, receivedBy: 'Sabbir Hossain', createdBy: 'Admin NOC', vendor: 'Summit Communications Ltd.', status: 'received' },
  { id: 'db_2', date: '2026-09-02', popName: 'Demo POP Mirpur', usageGb: 1120, ratePerGb: 2.5, amountBdt: 2800, receivedBy: 'Sabbir Hossain', createdBy: 'Admin NOC', vendor: 'Fiber@Home Limited', status: 'received' },
  { id: 'db_3', date: '2026-09-01', popName: 'Demo POP Uttara', usageGb: 1380, ratePerGb: 2.5, amountBdt: 3450, receivedBy: 'Accounts Team', createdBy: 'Admin NOC', vendor: 'Summit Communications Ltd.', status: 'received' },
  { id: 'db_4', date: '2026-09-01', popName: 'Demo POP Mirpur', usageGb: 1090, ratePerGb: 2.5, amountBdt: 2725, receivedBy: 'Accounts Team', createdBy: 'Admin NOC', vendor: 'Fiber@Home Limited', status: 'received' },
  { id: 'db_5', date: '2026-08-31', popName: 'Demo POP Dhanmondi', usageGb: 820, ratePerGb: 2.5, amountBdt: 2050, receivedBy: 'Admin', createdBy: 'Billing Officer', vendor: 'Link3 Technologies Ltd.', status: 'received' },
  { id: 'db_6', date: '2026-08-31', popName: 'Demo POP Chittagong', usageGb: 1650, ratePerGb: 2.5, amountBdt: 4125, receivedBy: 'Admin', createdBy: 'Billing Officer', vendor: 'Summit Communications Ltd.', status: 'received' },
];

export const bandwidthPurchases = [
  { id: 'bw_buy_1', vendor: 'Summit Communications', capacityMbps: 1000, priceBdt: 280000, period: '2026-09', status: 'active', startDate: '2026-09-01', endDate: '2026-09-30' },
  { id: 'bw_buy_2', vendor: 'Fiber@Home', capacityMbps: 500, priceBdt: 150000, period: '2026-09', status: 'active', startDate: '2026-09-01', endDate: '2026-09-30' },
  { id: 'bw_buy_3', vendor: 'Link3 Technologies', capacityMbps: 200, priceBdt: 65000, period: '2026-08', status: 'expired', startDate: '2026-08-01', endDate: '2026-08-31' },
];

export const bandwidthSales = [
  { id: 'bw_sell_1', customer: 'Corporate Client — Grameen IT', capacityMbps: 100, priceBdt: 45000, period: '2026-09', status: 'active' },
  { id: 'bw_sell_2', customer: 'POP Mirpur wholesale', capacityMbps: 200, priceBdt: 85000, period: '2026-09', status: 'active' },
  { id: 'bw_sell_3', customer: 'Hotel Radisson backup', capacityMbps: 50, priceBdt: 25000, period: '2026-09', status: 'pending' },
];

export const bandwidthSummary = {
  totalPurchasedMbps: 2500,
  totalSoldMbps: 630,
  utilizationPercent: 82,
  monthlyCostBdt: 605000,
  monthlyRevenueBdt: 227000,
};
