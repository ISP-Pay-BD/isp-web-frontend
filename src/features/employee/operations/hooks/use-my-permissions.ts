'use client';

import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { allowsAction, mapPermissionCodes } from '../lib/permission-codes';

/** The signed-in employee's effective permission codes (`GET /v1/permissions/me`). */
export function useMyPermissions() {
  const query = useQuery({
    queryKey: ['employee', 'permissions-me'],
    queryFn: async () => mapPermissionCodes(await http.get<unknown>('/v1/permissions/me')),
    staleTime: 60_000,
  });
  const codes = query.data;
  const allows = useCallback(
    (menu: string, action: string) => (codes ? allowsAction(codes, menu, action) : false),
    [codes],
  );
  return { ...query, allows };
}
