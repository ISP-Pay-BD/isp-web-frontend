'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { http } from '@/lib/api/client';
import { num, str } from '@/lib/api/case';
import { useTranslations } from '@/i18n/locale-context';

type Raw = Record<string, unknown>;

export interface Pop {
  id: string;
  name: string;
  status: string;
}

/** One entry of a POP's price list (all_reseller_packages JSON). */
export interface PopPackage {
  id: string;
  name: string;
  bandwidth: string;
  packageType: string;
  /** What the tenant charges the POP. */
  price: number;
  /** What the POP charges its customers. */
  sellingPrice: number | null;
  mikrotikProfile: string | null;
}

const mapPopPackage = (r: Raw): PopPackage => ({
  id: str(r.id),
  name: str(r.package_name),
  bandwidth: str(r.bandwidth),
  packageType: str(r.package_type),
  price: num(r.price),
  sellingPrice: r.selling_price === null || r.selling_price === undefined ? null : num(r.selling_price),
  mikrotikProfile: str(r.mikrotik_profile) || null,
});

export function usePops() {
  return useQuery({
    queryKey: ['admin', 'pops', 'options'],
    queryFn: async () => {
      const res = await http.getPage<Raw>('/v1/pops', { per_page: 100 });
      return res.items.map((p): Pop => ({ id: str(p.id), name: str(p.name) || `POP #${str(p.id)}`, status: str(p.status) }));
    },
    staleTime: 5 * 60_000,
  });
}

export function usePopPackages(popId: string | null, search: string) {
  return useQuery({
    queryKey: ['admin', 'pops', popId, 'packages', search],
    queryFn: async () => {
      const res = await http.getPage<Raw>(`/v1/pops/${popId}/packages`, { search: search || undefined });
      return res.items.map(mapPopPackage);
    },
    enabled: Boolean(popId),
    placeholderData: keepPreviousData,
  });
}

export function usePopPackageMutations(popId: string | null) {
  const qc = useQueryClient();
  const t = useTranslations();
  const refresh = () => qc.invalidateQueries({ queryKey: ['admin', 'pops', popId, 'packages'] });
  return {
    updatePrice: useMutation({
      mutationFn: (v: { packageId: string; price: string; sellingPrice: string }) =>
        http.put(`/v1/pops/${popId}/packages/${v.packageId}`, {
          price: v.price === '' ? undefined : v.price,
          selling_price: v.sellingPrice === '' ? undefined : v.sellingPrice,
        }),
      meta: { silent: true },
      onSuccess: () => {
        refresh();
        toast.success(t('admin.popPackages.packages.priceUpdated', 'Package price updated'));
      },
    }),
    sync: useMutation({
      mutationFn: () => http.post<Raw[]>(`/v1/pops/${popId}/packages/sync`),
      onSuccess: (res) => {
        refresh();
        toast.success(
          t('admin.popPackages.packages.synced', 'Synced {n} package(s) from the catalogue', { n: Array.isArray(res) ? res.length : 0 }),
        );
      },
    }),
  };
}
