import { http } from '@/lib/api/client';
import { getResellerId } from '@/lib/api/auth-utils';
import { num, str } from '@/lib/api/case';
import type { IspPackage, PackageSummary } from '../types';
import type { PackageFormValues } from '../schemas/package.schema';

type Raw = Record<string, unknown>;

const numeric = (v: unknown): number | null => {
  const s = str(v).trim();
  return s !== '' && Number.isFinite(Number(s)) ? Number(s) : null;
};

export function mapPackage(r: Raw): IspPackage {
  const pricing = str(r.pricing_type);
  return {
    id: str(r.id),
    name: str(r.package_name) || str(r.name),
    bandwidth: str(r.bandwidth),
    price: num(r.price),
    sellingPrice: numeric(r.selling_price),
    pricingType: pricing === 'weekly' || pricing === 'yearly' ? pricing : 'monthly',
    status: str(r.status) === 'inactive' ? 'inactive' : 'active',
    mikrotikProfile: str(r.mikrotik_profile) || null,
    subscriberCount: num(r.subscriber_count),
    createdAt: str(r.created_at) || null,
  };
}

const base = () => `/v1/reseller/packages/${getResellerId()}`;

/** Drop empty optional fields; the backend validates the rest. */
const body = (v: PackageFormValues) =>
  Object.fromEntries(Object.entries(v).filter(([, value]) => value !== undefined && value !== ''));

export const packagesApi = {
  list: async (params: { page: number; perPage: number; search?: string; status?: string }) => {
    const res = await http.getPage<Raw>(base(), {
      page: params.page,
      per_page: params.perPage,
      search: params.search || undefined,
      status: params.status && params.status !== 'all' ? params.status : undefined,
    });
    return { items: res.items.map(mapPackage), meta: res.meta };
  },
  summary: async (): Promise<PackageSummary> => {
    const r = await http.get<Raw>(`${base()}/summary`);
    return { total: num(r.total), active: num(r.active), inactive: num(r.inactive), subscribers: num(r.subscribers), avgPrice: num(r.avg_price) };
  },
  create: (v: PackageFormValues) => http.post(base(), body(v)),
  update: (id: string, v: PackageFormValues) => http.put(`${base()}/${id}`, body(v)),
  remove: (id: string) => http.delete(`${base()}/${id}`),
};
