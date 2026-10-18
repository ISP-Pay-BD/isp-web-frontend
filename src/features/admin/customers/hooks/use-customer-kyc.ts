'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslations } from '@/i18n/locale-context';
import { kycApi } from '../api/kyc-groups.api';
import type { KycDocument } from '../types';

const key = (customerId: string) => ['admin', 'customers', 'kyc', customerId] as const;

export function useCustomerKyc(customerId: string, page: number, perPage: number, status: string) {
  return useQuery({
    queryKey: [...key(customerId), page, perPage, status],
    queryFn: () => kycApi.list(customerId, page, perPage, status),
    enabled: Boolean(customerId),
    placeholderData: keepPreviousData,
  });
}

export function useKycMutations(customerId: string) {
  const t = useTranslations();
  const qc = useQueryClient();
  const refresh = (message: string) => () => {
    qc.invalidateQueries({ queryKey: key(customerId) });
    // nid_verified shows on the customer detail page.
    qc.invalidateQueries({ queryKey: ['admin', 'customers', 'detail', customerId] });
    toast.success(message);
  };
  return {
    upload: useMutation({
      mutationFn: (v: { docType: string; docNumber: string; file: File }) => kycApi.upload(customerId, v),
      meta: { silent: true },
      onSuccess: refresh(t('admin.customers.kyc.toast.uploaded', 'Document uploaded')),
    }),
    review: useMutation({
      mutationFn: (v: { docId: string; status: 'verified' | 'rejected'; note?: string }) => kycApi.review(v.docId, v.status, v.note),
      onSuccess: (_res, v) => refresh(v.status === 'verified' ? t('admin.customers.kyc.toast.verified', 'Document verified') : t('admin.customers.kyc.toast.rejected', 'Document rejected'))(),
    }),
    remove: useMutation({ mutationFn: (docId: string) => kycApi.remove(docId), onSuccess: refresh(t('admin.customers.kyc.toast.deleted', 'Document deleted')) }),
    download: useMutation({ mutationFn: (doc: KycDocument) => kycApi.download(doc) }),
  };
}
