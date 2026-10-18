'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { groupsApi } from '../api/kyc-groups.api';

const GROUPS = ['admin', 'customer-groups'] as const;

export function useCustomerGroups(params: { page: number; perPage: number; search?: string; billingMode?: string }) {
  return useQuery({
    queryKey: [...GROUPS, 'list', params],
    queryFn: () => groupsApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useCustomerGroupSummary() {
  return useQuery({ queryKey: [...GROUPS, 'summary'], queryFn: groupsApi.summary });
}

export function useGroupMembers(groupId: string | null, page: number, perPage: number, search: string) {
  return useQuery({
    queryKey: [...GROUPS, 'members', groupId, page, perPage, search],
    queryFn: () => groupsApi.members(groupId as string, page, perPage, search),
    enabled: Boolean(groupId),
    placeholderData: keepPreviousData,
  });
}

export function useCustomerGroupMutations() {
  const qc = useQueryClient();
  const refresh = (message: string) => () => {
    qc.invalidateQueries({ queryKey: GROUPS });
    toast.success(message);
  };
  return {
    create: useMutation({ mutationFn: (body: Record<string, unknown>) => groupsApi.create(body), meta: { silent: true }, onSuccess: refresh('Customer group created') }),
    update: useMutation({
      mutationFn: (v: { id: string; body: Record<string, unknown> }) => groupsApi.update(v.id, v.body),
      meta: { silent: true },
      onSuccess: refresh('Customer group updated'),
    }),
    remove: useMutation({ mutationFn: (id: string) => groupsApi.remove(id), onSuccess: refresh('Customer group deleted') }),
    addMembers: useMutation({
      mutationFn: (v: { groupId: string; ids: string[] }) => groupsApi.addMembers(v.groupId, v.ids),
      onSuccess: (res) => {
        qc.invalidateQueries({ queryKey: GROUPS });
        const r = res as { added?: number; already_members?: number };
        toast.success(`${r?.added ?? 0} customer(s) added${r?.already_members ? `, ${r.already_members} already in the group` : ''}`);
      },
    }),
    removeMembers: useMutation({
      mutationFn: (v: { groupId: string; ids: string[] }) => groupsApi.removeMembers(v.groupId, v.ids),
      onSuccess: refresh('Member removed'),
    }),
  };
}
