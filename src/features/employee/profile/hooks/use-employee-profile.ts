'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslations } from '@/i18n/locale-context';
import { employeeService } from '@/lib/api/services/employee.service';
import { normalizeBdPhone } from '@/lib/format';
import { employeeKeys } from '@/features/employee/shared/keys';
import { mapProfile } from '@/features/employee/shared/lib/mappers';
import type { EmployeeProfile } from '@/features/employee/shared';
import type { ProfileUpdateFormValues } from '../schemas/profile.schema';

/** My HR record (`/v1/employee-portal/profile`). */
export function useEmployeeProfile() {
  return useQuery({
    queryKey: employeeKeys.profile,
    queryFn: async () => mapProfile(await employeeService.profile()),
  });
}

/**
 * Self update via PATCH /v1/users/me. The mobile is a login identifier, so it
 * is only sent when it actually changed, in the stored `8801XXXXXXXXX` form.
 */
export function useUpdateEmployeeProfile(current: EmployeeProfile | undefined) {
  const queryClient = useQueryClient();
  const t = useTranslations();

  return useMutation({
    mutationFn: (values: ProfileUpdateFormValues) => {
      const body: Record<string, unknown> = {
        name: values.name.trim(),
        email: values.email.trim(),
        address: values.address.trim(),
      };
      const next = normalizeBdPhone(values.phone);
      if (!current || next !== normalizeBdPhone(current.mobile)) {
        body.mobile = `88${next}`;
      }
      return employeeService.updateProfile(body);
    },
    onSuccess: () => {
      toast.success(t('employee.profile.updated', 'Profile updated successfully'));
      queryClient.invalidateQueries({ queryKey: employeeKeys.profile });
    },
  });
}
