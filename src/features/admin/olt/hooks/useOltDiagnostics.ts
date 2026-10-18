import { useQuery } from '@tanstack/react-query';
import { mapDiagnostics } from '../types';
import { devicePost, oltKeys } from './useOltDevices';

/**
 * POST /v1/olts/{id}/diagnostics — reads the ONU table live from the device
 * (falls back to the synced cache server-side). Slow, so it runs only while
 * the dialog is open and is never retried automatically.
 */
export function useOltDiagnostics(oltId: string, enabled: boolean) {
  return useQuery({
    queryKey: oltKeys.diagnostics(oltId),
    queryFn: async () => mapDiagnostics(await devicePost<unknown>(`/v1/olts/${encodeURIComponent(oltId)}/diagnostics`)),
    enabled: enabled && Boolean(oltId),
    retry: false,
    staleTime: 0,
    gcTime: 0,
  });
}
