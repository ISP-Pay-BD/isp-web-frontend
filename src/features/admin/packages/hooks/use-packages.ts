'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslations } from '@/i18n/locale-context';
import { packagesApi } from '../api/packages.api';
import type { PackageFormValues } from '../schemas/package.schema';

const PACKAGES = ['admin', 'packages'] as const;

export function usePackages(params: { page: number; perPage: number; search?: string; status?: string }) {
  return useQuery({
    queryKey: [...PACKAGES, 'list', params],
    queryFn: () => packagesApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function usePackageSummary() {
  return useQuery({ queryKey: [...PACKAGES, 'summary'], queryFn: packagesApi.summary });
}

/** Package writes; the form maps validation errors itself (meta.silent). */
export function usePackageMutations() {
  const qc = useQueryClient();
  const t = useTranslations();
  const refresh = (message: string) => () => {
    qc.invalidateQueries({ queryKey: PACKAGES });
    qc.invalidateQueries({ queryKey: ['admin', 'options', 'packages'] });
    toast.success(message);
  };
  return {
    create: useMutation({ mutationFn: (v: PackageFormValues) => packagesApi.create(v), meta: { silent: true }, onSuccess: refresh(t('admin.packages.toast.created', 'Package created')) }),
    update: useMutation({
      mutationFn: (v: { id: string; values: PackageFormValues }) => packagesApi.update(v.id, v.values),
      meta: { silent: true },
      onSuccess: refresh(t('admin.packages.toast.updated', 'Package updated')),
    }),
    remove: useMutation({ mutationFn: (id: string) => packagesApi.remove(id), onSuccess: refresh(t('admin.packages.toast.deleted', 'Package deleted')) }),
  };
}
