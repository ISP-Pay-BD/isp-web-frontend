export interface RecycleBinItem {
  id: string;
  entityType: 'customer' | 'package' | 'invoice' | 'ticket' | 'employee';
  title: string;
  identifier: string;
  deletedAt: string;
  deletedBy: string;
  details: string;
}

export const recycleBinItemsData: RecycleBinItem[] = [
  {
    id: 'rb_001',
    entityType: 'customer',
    title: 'Mahmudul Hasan',
    identifier: 'CUST-089',
    deletedAt: '2026-08-28 14:15:00',
    deletedBy: 'Admin (admin@demo.isppaybd.com)',
    details: 'Package: Starter 10 Mbps · Area: Uttara Sector 7',
  },
  {
    id: 'rb_002',
    entityType: 'customer',
    title: 'Fariha Yasmin',
    identifier: 'CUST-094',
    deletedAt: '2026-08-25 09:20:00',
    deletedBy: 'Admin (admin@demo.isppaybd.com)',
    details: 'Package: Home 20 Mbps · Area: Mirpur 10',
  },
  {
    id: 'rb_003',
    entityType: 'package',
    title: 'Legacy Student 5 Mbps',
    identifier: 'PKG-LEGACY-05',
    deletedAt: '2026-08-20 18:00:00',
    deletedBy: 'Super Admin',
    details: 'Price: ৳500/mo · Deprecated in favor of 10 Mbps Starter',
  },
  {
    id: 'rb_004',
    entityType: 'invoice',
    title: 'Draft Invoice #INV-2026-042',
    identifier: 'INV-2026-042',
    deletedAt: '2026-08-19 11:45:00',
    deletedBy: 'Accountant (billing@demo.isppaybd.com)',
    details: 'Customer: Rahim Uddin · Amount: ৳1,200',
  },
  {
    id: 'rb_005',
    entityType: 'ticket',
    title: 'Spam duplicate ticket: WiFi connection issues',
    identifier: 'TKT-077',
    deletedAt: '2026-08-15 16:30:00',
    deletedBy: 'Support (support@demo.isppaybd.com)',
    details: 'Opened by 01711223344 · Marked duplicate of TKT-076',
  },
  {
    id: 'rb_006',
    entityType: 'employee',
    title: 'Riaz Ahmed (Junior Lineman)',
    identifier: 'EMP-014',
    deletedAt: '2026-08-10 12:00:00',
    deletedBy: 'HR Manager',
    details: 'Resigned July 2026 · Uttara Area Operations',
  },
];
