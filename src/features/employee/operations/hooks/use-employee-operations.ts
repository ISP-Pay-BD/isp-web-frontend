'use client';

import { useQuery } from '@tanstack/react-query';
import { http } from '@/lib/api/client';
import { mapOperations } from '../lib/map-operations';

export const operationsKey = ['employee', 'operations'] as const;

/** My operations dashboard: area paid/due this month, my collections, my open tickets. */
export function useEmployeeOperations() {
  return useQuery({
    queryKey: operationsKey,
    queryFn: async () =>
      mapOperations(await http.get<Record<string, unknown>>('/v1/employee-portal/operations')),
    refetchInterval: 120_000,
    refetchIntervalInBackground: false,
  });
}
