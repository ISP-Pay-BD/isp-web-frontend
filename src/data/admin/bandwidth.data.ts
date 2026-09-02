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

export const dailyBills = Array.from({ length: 7 }, (_, i) => ({
  date: `2026-${String(8 + (i > 4 ? 1 : 0)).padStart(2, '0')}-${String(26 + i).padStart(2, '0')}`,
  usageGb: 1200 + i * 45,
  ratePerGb: 2.5,
  amountBdt: Math.round((1200 + i * 45) * 2.5),
  vendor: 'Summit Communications',
}));

export const bandwidthSummary = {
  totalPurchasedMbps: 1500,
  totalSoldMbps: 350,
  utilizationPercent: 78,
  monthlyCostBdt: 430000,
  monthlyRevenueBdt: 155000,
};
