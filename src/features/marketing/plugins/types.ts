/** Public plugin marketplace (`/v1/public/plugins*`). */

export interface PublicPlugin {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string | null;
  priceBdt: number;
  priceType: string | null;
  billingCycle: string | null;
}

export interface PublicPluginsParams {
  search: string;
  category: string;
  page: number;
}

export interface PublicPluginsResult {
  items: PublicPlugin[];
  total: number;
  page: number;
  totalPages: number;
  categories: string[];
}

export interface PluginRequestInput {
  name: string;
  phone: string;
  email?: string;
  company?: string;
  message?: string;
}
