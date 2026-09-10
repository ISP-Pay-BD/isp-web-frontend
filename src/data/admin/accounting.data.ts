export const chartOfAccounts = [
  { id: 'coa_1000', code: '1000', name: 'Assets', type: 'asset', balanceBdt: 4850000 },
  { id: 'coa_1100', code: '1100', name: 'Cash & Liquid Bank Accounts', type: 'asset', balanceBdt: 1850000, parentId: 'coa_1000' },
  { id: 'coa_1110', code: '1110', name: 'bKash Merchant Settlement Acct', type: 'asset', balanceBdt: 420000, parentId: 'coa_1100' },
  { id: 'coa_1120', code: '1120', name: 'Nagad Corporate Wallet', type: 'asset', balanceBdt: 280000, parentId: 'coa_1100' },
  { id: 'coa_1130', code: '1130', name: 'City Bank Escrow Account', type: 'asset', balanceBdt: 1150000, parentId: 'coa_1100' },
  { id: 'coa_1200', code: '1200', name: 'Subscriber Accounts Receivable (A/R)', type: 'asset', balanceBdt: 820000, parentId: 'coa_1000' },
  { id: 'coa_1300', code: '1300', name: 'Network Hardware & Optical Inventory', type: 'asset', balanceBdt: 680000, parentId: 'coa_1000' },
  { id: 'coa_1400', code: '1400', name: 'Core Infrastructure (OLT, Routers, Servers)', type: 'asset', balanceBdt: 1500000, parentId: 'coa_1000' },
  { id: 'coa_2000', code: '2000', name: 'Liabilities', type: 'liability', balanceBdt: 1280000 },
  { id: 'coa_2100', code: '2100', name: 'Upstream Bandwidth Payables (IIG/NTTN)', type: 'liability', balanceBdt: 620000, parentId: 'coa_2000' },
  { id: 'coa_2200', code: '2200', name: 'POP Security & OTC Advances', type: 'liability', balanceBdt: 460000, parentId: 'coa_2000' },
  { id: 'coa_2300', code: '2300', name: 'NBR Mushak 6.3 VAT Withheld Payable', type: 'liability', balanceBdt: 200000, parentId: 'coa_2000' },
  { id: 'coa_3000', code: '3000', name: 'Equity & Retained Earnings', type: 'equity', balanceBdt: 3570000 },
  { id: 'coa_4000', code: '4000', name: 'Operating Revenue', type: 'income', balanceBdt: 2845000 },
  { id: 'coa_4100', code: '4100', name: 'Retail FTTH Subscription Revenue', type: 'income', balanceBdt: 2150000, parentId: 'coa_4000' },
  { id: 'coa_4200', code: '4200', name: 'Corporate Dedicated Leased Line Billing', type: 'income', balanceBdt: 420000, parentId: 'coa_4000' },
  { id: 'coa_4300', code: '4300', name: 'OTT & IPTV Value Added Services (VAS)', type: 'income', balanceBdt: 145000, parentId: 'coa_4000' },
  { id: 'coa_4400', code: '4400', name: 'One-Time Connection & Fiber Installation Fee', type: 'income', balanceBdt: 130000, parentId: 'coa_4000' },
  { id: 'coa_5000', code: '5000', name: 'Operational & Direct Expenses', type: 'expense', balanceBdt: 1120000 },
  { id: 'coa_5100', code: '5100', name: 'Upstream IIG Bandwidth Transit Cost', type: 'expense', balanceBdt: 550000, parentId: 'coa_5000' },
  { id: 'coa_5200', code: '5200', name: 'NTTN Dark Fiber Core Transmission Lease', type: 'expense', balanceBdt: 220000, parentId: 'coa_5000' },
  { id: 'coa_5300', code: '5300', name: 'NOC & Field Engineering Staff Payroll', type: 'expense', balanceBdt: 195000, parentId: 'coa_5000' },
  { id: 'coa_5400', code: '5400', name: 'POP Electricity & Backup Generator Diesel', type: 'expense', balanceBdt: 85000, parentId: 'coa_5000' },
  { id: 'coa_5500', code: '5500', name: 'Bulk SMS Gateway & WhatsApp API Charges', type: 'expense', balanceBdt: 70000, parentId: 'coa_5000' },
];

export const journalEntries = [
  { id: 'je_001', date: '2026-09-08', description: 'Daily bKash PGW settlement transfer to Bank', debitBdt: 145200, creditBdt: 145200, status: 'posted' },
  { id: 'je_002', date: '2026-09-07', description: 'Summit Communications IIG 10Gbps transit invoice', debitBdt: 550000, creditBdt: 550000, status: 'posted' },
  { id: 'je_003', date: '2026-09-05', description: 'Fiber@Home NTTN metro fiber monthly lease', debitBdt: 220000, creditBdt: 220000, status: 'posted' },
  { id: 'je_004', date: '2026-09-02', description: 'Staff payroll disbursement for August 2026', debitBdt: 195000, creditBdt: 195000, status: 'posted' },
  { id: 'je_005', date: '2026-09-01', description: 'Procurement of 100x XPON ONUs + SFP Modules', debitBdt: 185000, creditBdt: 185000, status: 'posted' },
  { id: 'je_006', date: '2026-08-30', description: 'POP Dhanmondi UPS battery bank replacement', debitBdt: 68000, creditBdt: 68000, status: 'posted' },
  { id: 'je_007', date: '2026-08-28', description: 'Customer deposit release for cancelled line', debitBdt: 3000, creditBdt: 3000, status: 'draft' },
  { id: 'je_008', date: '2026-08-25', description: 'Bongo & Chorki OTT rev-share billing August', debitBdt: 42500, creditBdt: 42500, status: 'posted' },
];

export const incomes = [
  { id: 'inc_101', date: '2026-09-08', category: 'Retail Collections', amountBdt: 145200, method: 'bKash PGW', note: 'Automated portal subscriber renewals', invoiceNo: 'INV-2026-09-1082', bankAccount: 'City Bank Escrow #4102' },
  { id: 'inc_102', date: '2026-09-07', category: 'Corporate Billing', amountBdt: 120000, method: 'Bank Transfer', note: 'Apex Footwear Ltd 100Mbps dedicated DIA', invoiceNo: 'INV-CORP-9021', bankAccount: 'City Bank Corporate #9001' },
  { id: 'inc_103', date: '2026-09-06', category: 'Installation Fees', amountBdt: 22500, method: 'Cash', note: '15 new residential connections in Mirpur DOHS', invoiceNo: 'INV-OTC-3310', bankAccount: 'Cash Counter Gulshan' },
  { id: 'inc_104', date: '2026-09-05', category: 'OTT / IPTV Addons', amountBdt: 18400, method: 'Nagad PGW', note: 'Chorki & Bongo 1-month passes bundled', invoiceNo: 'INV-VAS-4421', bankAccount: 'Nagad Corporate Wallet' },
  { id: 'inc_105', date: '2026-09-04', category: 'Public Static IP', amountBdt: 12000, method: 'bKash PGW', note: '24 Static /32 allocations renewed', invoiceNo: 'INV-IP-1120', bankAccount: 'City Bank Escrow #4102' },
  { id: 'inc_106', date: '2026-09-03', category: 'Sub-ISP Transit Share', amountBdt: 95000, method: 'Bank Transfer', note: 'FastNet Uttara POP 2Gbps transit share', invoiceNo: 'INV-POP-8821', bankAccount: 'City Bank Corporate #9001' },
  { id: 'inc_107', date: '2026-09-02', category: 'Retail Collections', amountBdt: 88400, method: 'Cash', note: 'Field collection Rafiq Desk Gulshan-1', invoiceNo: 'INV-REC-5512', bankAccount: 'Cash Counter Gulshan' },
];

export const expenses = [
  { id: 'exp_201', date: '2026-09-07', category: 'IIG Bandwidth Transit', amountBdt: 550000, vendor: 'Summit Communications Ltd', note: '10Gbps primary transit invoice Sept' },
  { id: 'exp_202', date: '2026-09-05', category: 'NTTN Transmission Lease', amountBdt: 220000, vendor: 'Fiber@Home Limited', note: 'Dhanmondi to Uttara metro fiber core' },
  { id: 'exp_203', date: '2026-09-02', category: 'Staff Payroll & NOC', amountBdt: 195000, vendor: 'Internal Staff Bank Disbursement', note: 'Salary for 14 staff members Aug 2026' },
  { id: 'exp_204', date: '2026-09-01', category: 'Hardware & Equipment', amountBdt: 185000, vendor: 'Tech Distribution BD', note: '100x Dual-Band GPON ONUs + Patch cords' },
  { id: 'exp_205', date: '2026-08-30', category: 'POP Rent & Electricity', amountBdt: 85000, vendor: 'Landlord Gulshan POP Hub', note: 'Monthly rent & DESCO utility bill' },
  { id: 'exp_206', date: '2026-08-28', category: 'Bulk SMS & Notification API', amountBdt: 15000, vendor: 'Onnorokom SMS Gateway', note: '50,000 Masking SMS credits' },
  { id: 'exp_207', date: '2026-08-25', category: 'BTRC License & NBR Mushak', amountBdt: 45000, vendor: 'National Board of Revenue (NBR)', note: '5% VAT settlement deposit' },
];

export const balanceSheet = {
  asOf: '2026-09-08',
  assets: {
    totalBdt: 4850000,
    items: [
      { name: 'Cash & Liquid Bank Accounts', amountBdt: 1850000 },
      { name: 'Subscriber Accounts Receivable (A/R)', amountBdt: 820000 },
      { name: 'Network Hardware & Optical Stock', amountBdt: 680000 },
      { name: 'Core Infrastructure (OLT, Routers, Servers)', amountBdt: 1500000 },
    ],
  },
  liabilities: {
    totalBdt: 1280000,
    items: [
      { name: 'Upstream Bandwidth Payables (IIG/NTTN)', amountBdt: 620000 },
      { name: 'POP Security & OTC Advances', amountBdt: 460000 },
      { name: 'NBR Mushak 6.3 VAT Withheld Payable', amountBdt: 200000 },
    ],
  },
  equity: {
    totalBdt: 3570000,
  },
};

export const otcReport = [
  { date: '2026-09-08', openingBdt: 1720000, collectionsBdt: 145200, expensesBdt: 15000, closingBdt: 1850200 },
  { date: '2026-09-07', openingBdt: 2150000, collectionsBdt: 120000, expensesBdt: 550000, closingBdt: 1720000 },
  { date: '2026-09-06', openingBdt: 2127500, collectionsBdt: 22500, expensesBdt: 0, closingBdt: 2150000 },
];

export const accountingReports = [
  { id: 'rpt_pl', name: 'Comprehensive Profit & Loss (P&L)', period: 'Aug 2026', netBdt: 1725000, grossRevenueBdt: 2845000, totalExpensesBdt: 1120000, marginPct: 60.6, type: 'Income Statement' },
  { id: 'rpt_cf', name: 'Cash Flow & Merchant Liquidity Statement', period: 'Aug 2026', netBdt: 385000, operatingCashflowBdt: 620000, capexBdt: 235000, type: 'Cash Flow' },
  { id: 'rpt_ar', name: 'Subscriber Accounts Receivable (A/R) Aging', period: 'Sep 2026', netBdt: 820000, currentBdt: 580000, overdue30Bdt: 180000, overdue60Bdt: 60000, type: 'Receivables' },
  { id: 'rpt_vat', name: 'NBR Mushak 6.3 Tax & VAT Compliance Summary', period: 'Aug 2026', netBdt: 142250, taxableAmountBdt: 2845000, vatRatePct: 5.0, type: 'Tax & Compliance' },
  { id: 'rpt_pop', name: 'POP & Reseller Revenue Share Breakdown', period: 'Aug 2026', netBdt: 460000, activePops: 12, topPerformer: 'Uttara Hub POP', type: 'Branch Report' },
];
