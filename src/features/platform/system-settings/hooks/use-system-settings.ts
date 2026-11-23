import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslations } from '@/i18n/locale-context';
import { systemSettingsApi, type SettingsSection } from '../api/system-settings.api';

/** One GET serves every tab. */
const KEY = ['platform', 'system-settings'] as const;

export function useSettingsSection(section: SettingsSection) {
  return useQuery({
    queryKey: KEY,
    queryFn: systemSettingsApi.getAll,
    select: (all) => all[section],
  });
}

/** Errors are left to the caller so it can map field errors onto its form. */
export function useSaveSettingsSection(section: SettingsSection) {
  const t = useTranslations();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: Record<string, unknown>) => systemSettingsApi.save(section, values),
    onSuccess: (saved) => {
      queryClient.setQueryData(KEY, saved);
      toast.success(t('platform.systemSettings.toast.saved', 'Settings saved'));
    },
  });
}
