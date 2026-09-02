export interface PurchaseVendor {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  status: 'active' | 'inactive';
  balanceBdt: number;
}

export interface PurchaseRequisitionItem {
  id: string;
  itemName: string;
  quantity: number;
  unit: string;
  estimatedPriceBdt: number;
}

export interface PurchaseRequisition {
  id: string;
  requisitionId: string;
  title: string;
  itemCount: number;
  items: PurchaseRequisitionItem[];
  vendorSuggestions: string[];
  totalAmountBdt: number;
  requisitionDate: string;
  requisitionBy: string;
  deadline: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  approvedBy?: string;
  approvedDate?: string;
}

export interface PurchaseBill {
  id: string;
  billNumber: string;
  vendorId: string;
  vendorName: string;
  amountBdt: number;
  paidAmountBdt: number;
  dueAmountBdt: number;
  billDate: string;
  dueDate: string;
  status: 'paid' | 'partial' | 'due';
  itemsCount: number;
}

export const purchaseVendors: PurchaseVendor[] = [
  {
    id: 'ven_001',
    name: 'Summit Communications Ltd.',
    contactPerson: 'Arif Chowdhury',
    phone: '01711000001',
    email: 'sales@summit.com.bd',
    address: 'Kawran Bazar, Dhaka',
    status: 'active',
    balanceBdt: 45000,
  },
  {
    id: 'ven_002',
    name: 'Fiber@Home Limited',
    contactPerson: 'Nasir Ahmed',
    phone: '01811000002',
    email: 'billing@fiberathome.net',
    address: 'Gulshan-1, Dhaka',
    status: 'active',
    balanceBdt: 120000,
  },
  {
    id: 'ven_003',
    name: 'BDCOM Optical Fiber & Network',
    contactPerson: 'Tanvir Hossain',
    phone: '01911000003',
    email: 'tanvir@bdcom.com',
    address: 'Dhanmondi, Dhaka',
    status: 'active',
    balanceBdt: 0,
  },
  {
    id: 'ven_004',
    name: 'Tech Distribution BD',
    contactPerson: 'Mahmudul Hasan',
    phone: '01611000004',
    email: 'info@techdistbd.com',
    address: 'IDB Bhaban, Agargaon, Dhaka',
    status: 'active',
    balanceBdt: 25000,
  },
];

export const purchaseRequisitions: PurchaseRequisition[] = [
  {
    id: 'req_001',
    requisitionId: 'REQ-2026-001',
    title: 'ONU and Patch Cords for Mirpur POP Expansion',
    itemCount: 45,
    items: [
      { id: 'ri_1', itemName: 'XPON ONU Dual Band Gigabit', quantity: 30, unit: 'Pcs', estimatedPriceBdt: 1450 },
      { id: 'ri_2', itemName: 'Patch Cord SC-SC 3M', quantity: 50, unit: 'Pcs', estimatedPriceBdt: 120 },
      { id: 'ri_3', itemName: 'Fiber Drop Cable 2-Core', quantity: 2, unit: 'Drum (1000m)', estimatedPriceBdt: 8500 },
    ],
    vendorSuggestions: ['Tech Distribution BD', 'BDCOM Optical Fiber & Network'],
    totalAmountBdt: 66500,
    requisitionDate: '2026-08-28',
    requisitionBy: 'Kamal Hossain (Field Supervisor)',
    deadline: '2026-09-05',
    status: 'approved',
    approvedBy: 'Admin (Main Office)',
    approvedDate: '2026-08-30',
  },
  {
    id: 'req_002',
    requisitionId: 'REQ-2026-002',
    title: 'SFP+ 10G Modules and Fusion Splice Sleeves',
    itemCount: 20,
    items: [
      { id: 'ri_4', itemName: '10G SFP+ BIDI 20KM 1270/1330', quantity: 4, unit: 'Pairs', estimatedPriceBdt: 7500 },
      { id: 'ri_5', itemName: 'Splice Protection Sleeves 60mm', quantity: 500, unit: 'Pcs', estimatedPriceBdt: 2 },
    ],
    vendorSuggestions: ['BDCOM Optical Fiber & Network'],
    totalAmountBdt: 31000,
    requisitionDate: '2026-09-01',
    requisitionBy: 'Tanveer Alam (Network Engineer)',
    deadline: '2026-09-08',
    status: 'pending',
  },
  {
    id: 'req_003',
    requisitionId: 'REQ-2026-003',
    title: 'Backup UPS Batteries for Central NOC',
    itemCount: 4,
    items: [
      { id: 'ri_6', itemName: '12V 100Ah Deep Cycle AGM Battery', quantity: 4, unit: 'Pcs', estimatedPriceBdt: 18000 },
    ],
    vendorSuggestions: ['Rahimafrooz Distribution'],
    totalAmountBdt: 72000,
    requisitionDate: '2026-08-20',
    requisitionBy: 'Admin',
    deadline: '2026-08-25',
    status: 'completed',
    approvedBy: 'Admin',
    approvedDate: '2026-08-21',
  },
];

export const purchaseBills: PurchaseBill[] = [
  {
    id: 'pb_001',
    billNumber: 'PB-2026-0801',
    vendorId: 'ven_001',
    vendorName: 'Summit Communications Ltd.',
    amountBdt: 300000,
    paidAmountBdt: 300000,
    dueAmountBdt: 0,
    billDate: '2026-08-01',
    dueDate: '2026-08-15',
    status: 'paid',
    itemsCount: 1,
  },
  {
    id: 'pb_002',
    billNumber: 'PB-2026-0818',
    vendorId: 'ven_004',
    vendorName: 'Tech Distribution BD',
    amountBdt: 85000,
    paidAmountBdt: 60000,
    dueAmountBdt: 25000,
    billDate: '2026-08-18',
    dueDate: '2026-09-05',
    status: 'partial',
    itemsCount: 3,
  },
  {
    id: 'pb_003',
    billNumber: 'PB-2026-0901',
    vendorId: 'ven_002',
    vendorName: 'Fiber@Home Limited',
    amountBdt: 120000,
    paidAmountBdt: 0,
    dueAmountBdt: 120000,
    billDate: '2026-09-01',
    dueDate: '2026-09-15',
    status: 'due',
    itemsCount: 2,
  },
];
