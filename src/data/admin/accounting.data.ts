export const chartOfAccounts = [
  { id: 'coa_1000', code: '1000', name: 'Assets', type: 'asset', balanceBdt: 2450000 },
  { id: 'coa_1100', code: '1100', name: 'Cash & Bank', type: 'asset', balanceBdt: 850000, parentId: 'coa_1000' },
  { id: 'coa_1200', code: '1200', name: 'Accounts Receivable', type: 'asset', balanceBdt: 420000, parentId: 'coa_1000' },
  { id: 'coa_2000', code: '2000', name: 'Liabilities', type: 'liability', balanceBdt: 680000 },
  { id: 'coa_3000', code: '3000', name: 'Equity', type: 'equity', balanceBdt: 1200000 },
  { id: 'coa_4000', code: '4000', name: 'Revenue', type: 'income', balanceBdt: 1285000 },
  { id: 'coa_4100', code: '4100', name: 'Subscription Revenue', type: 'income', balanceBdt: 1150000, parentId: 'coa_4000' },
  { id: 'coa_5000', code: '5000', name: 'Expenses', type: 'expense', balanceBdt: 420000 },
  { id: 'coa_5100', code: '5100', name: 'Bandwidth Cost', type: 'expense', balanceBdt: 300000, parentId: 'coa_5000' },
];

export const journalEntries = [
  { id: 'je_001', date: '2026-09-01', description: 'Daily collection deposit', debitBdt: 45200, creditBdt: 45200, status: 'posted' },
  { id: 'je_002', date: '2026-09-01', description: 'Bandwidth purchase — Sept', debitBdt: 300000, creditBdt: 300000, status: 'posted' },
  { id: 'je_003', date: '2026-08-30', description: 'Salary payment — Aug', debitBdt: 55000, creditBdt: 55000, status: 'posted' },
  { id: 'je_004', date: '2026-08-28', description: 'ONU inventory purchase', debitBdt: 85000, creditBdt: 85000, status: 'draft' },
];

export const incomes = [
  { id: 'inc_1', date: '2026-09-01', category: 'Customer collections', amountBdt: 45200, method: 'mixed', note: 'Daily total' },
  { id: 'inc_2', date: '2026-08-31', category: 'Installation charges', amountBdt: 15000, method: 'cash', note: '5 new connections' },
  { id: 'inc_3', date: '2026-08-30', category: 'Customer collections', amountBdt: 47000, method: 'mixed' },
  { id: 'inc_4', date: '2026-08-29', category: 'POP funding', amountBdt: 50000, method: 'bank', note: 'POP Uttara' },
];

export const expenses = [
  { id: 'exp_1', date: '2026-09-01', category: 'Bandwidth purchase', amountBdt: 300000, vendor: 'Summit Communications' },
  { id: 'exp_2', date: '2026-08-30', category: 'Staff salaries', amountBdt: 55000, vendor: 'Internal' },
  { id: 'exp_3', date: '2026-08-28', category: 'ONU equipment', amountBdt: 85000, vendor: 'Tech Distribution BD' },
  { id: 'exp_4', date: '2026-08-25', category: 'Office rent', amountBdt: 35000, vendor: 'Landlord' },
  { id: 'exp_5', date: '2026-08-20', category: 'SMS credits', amountBdt: 5000, vendor: 'Bulk SMS Gateway' },
];

export const balanceSheet = {
  asOf: '2026-09-01',
  assets: { totalBdt: 2450000, items: [{ name: 'Cash & Bank', amountBdt: 850000 }, { name: 'Receivables', amountBdt: 420000 }, { name: 'Inventory', amountBdt: 180000 }] },
  liabilities: { totalBdt: 680000, items: [{ name: 'Accounts Payable', amountBdt: 320000 }, { name: 'Advance from POPs', amountBdt: 360000 }] },
  equity: { totalBdt: 1770000 },
};

export const otcReport = [
  { date: '2026-09-01', openingBdt: 805000, collectionsBdt: 45200, expensesBdt: 12000, closingBdt: 838200 },
  { date: '2026-08-31', openingBdt: 768000, collectionsBdt: 47000, expensesBdt: 10000, closingBdt: 805000 },
];

export const accountingReports = [
  { id: 'rpt_pl', name: 'Profit & Loss', period: 'Aug 2026', netBdt: 865000 },
  { id: 'rpt_cf', name: 'Cash Flow', period: 'Aug 2026', netBdt: 125000 },
  { id: 'rpt_ar', name: 'Accounts Receivable Aging', period: 'Sep 2026', netBdt: 420000 },
];
