import type { Package } from '../shared/types';

export const packages: Package[] = [
  { id: 'pkg_5', name: 'Home 5 Mbps', speedMbps: 5, priceBdt: 500, validityDays: 30, type: 'home', visible: true },
  { id: 'pkg_8', name: 'Home 8 Mbps', speedMbps: 8, priceBdt: 650, validityDays: 30, type: 'home', visible: true },
  { id: 'pkg_10', name: 'Home 10 Mbps', speedMbps: 10, priceBdt: 800, validityDays: 30, type: 'home', visible: true },
  { id: 'pkg_15', name: 'Home 15 Mbps', speedMbps: 15, priceBdt: 1000, validityDays: 30, type: 'home', visible: true },
  { id: 'pkg_20', name: 'Home 20 Mbps', speedMbps: 20, priceBdt: 1200, validityDays: 30, type: 'home', visible: true },
  { id: 'pkg_30', name: 'Home 30 Mbps', speedMbps: 30, priceBdt: 1500, validityDays: 30, type: 'home', visible: true },
  { id: 'pkg_50', name: 'Home 50 Mbps', speedMbps: 50, priceBdt: 2200, validityDays: 30, type: 'home', visible: true },
  { id: 'pkg_100', name: 'Home 100 Mbps', speedMbps: 100, priceBdt: 3500, validityDays: 30, type: 'home', visible: true },
  { id: 'pkg_corp_30', name: 'Corporate 30 Mbps', speedMbps: 30, priceBdt: 4000, validityDays: 30, type: 'corporate', visible: true },
  { id: 'pkg_corp_50', name: 'Corporate 50 Mbps', speedMbps: 50, priceBdt: 5000, validityDays: 30, type: 'corporate', visible: true },
  { id: 'pkg_corp_100', name: 'Corporate 100 Mbps', speedMbps: 100, priceBdt: 9000, validityDays: 30, type: 'corporate', visible: true },
  { id: 'pkg_hot_2', name: 'Hotspot 2 Mbps', speedMbps: 2, priceBdt: 20, validityDays: 1, type: 'hotspot', visible: true },
  { id: 'pkg_hot_5', name: 'Hotspot 5 Mbps', speedMbps: 5, priceBdt: 50, validityDays: 7, type: 'hotspot', visible: true },
  { id: 'pkg_pop_10', name: 'POP Reseller 10 Mbps', speedMbps: 10, priceBdt: 700, validityDays: 30, type: 'home', visible: true },
];

export const popPackages = packages.filter((p) => p.id.startsWith('pkg_pop') || p.type === 'home').slice(0, 8);

export function getPackageById(id: string): Package | undefined {
  return packages.find((p) => p.id === id);
}
