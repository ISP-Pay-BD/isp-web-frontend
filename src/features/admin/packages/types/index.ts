/** A tenant package (reseller_packages row, or the legacy packages row). */
export interface IspPackage {
  id: string;
  name: string;
  /** Bandwidth as stored (Mbps for reseller packages). */
  bandwidth: string;
  price: number;
  sellingPrice: number | null;
  pricingType: 'weekly' | 'monthly' | 'yearly';
  status: 'active' | 'inactive';
  mikrotikProfile: string | null;
  /** `reseller_packages.preview` days; null = none recorded (package period applies). */
  preview: number | null;
  subscriberCount: number;
  createdAt: string | null;
}

export interface PackageSummary {
  total: number;
  active: number;
  inactive: number;
  subscribers: number;
  avgPrice: number;
}
