import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { handleApiError } from '@/lib/api/utils/error-handler';
import { useTranslations } from '@/i18n/locale-context';
import { cronApi } from '../api/cron.api';

const KEY = ['platform', 'cron', 'status'] as const;

export function useCronStatus() {
  return useQuery({
    queryKey: KEY,
    queryFn: cronApi.status,
    // A manual run continues in the background; poll faster while anything is running.
    refetchInterval: (q) => (q.state.data?.jobs.some((j) => j.running) ? 5_000 : 30_000),
  });
}

export function useCronActions() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: KEY });

  const reset = useMutation({
    mutationFn: cronApi.reset,
    onSuccess: (r) => {
      toast.success(
        r.message ??
          t('platform.cron.toast.reset', 'Cleared {count} stuck lock(s)', { count: r.cleared }),
      );
      if (r.skippedLive.length) {
        toast.warning(
          t('platform.cron.toast.skipped', 'Still running, lock kept: {jobs}', {
            jobs: r.skippedLive.join(', '),
          }),
        );
      }
      void refresh();
    },
    onError: (err) => handleApiError(err),
  });

  const run = useMutation({
    mutationFn: cronApi.run,
    onSuccess: (_, job) => {
      toast.success(t('platform.cron.toast.started', '{job} started', { job }));
      void refresh();
    },
    onError: (err) => {
      handleApiError(err);
      void refresh();
    },
  });

  return { reset, run };
}
