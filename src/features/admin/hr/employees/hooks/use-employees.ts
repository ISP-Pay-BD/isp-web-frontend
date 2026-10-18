'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { hrService } from '@/lib/api/services/employee.service';
import { hrKeys } from '../../shared/keys';
import { toBdMobile880 } from '../../shared/format';
import type { EmployeeFormValues } from '../schemas';
import type { EmployeeListParams } from '../types';
import { mapEmployee, mapEmployeeSummary } from './mappers';

export function useEmployees(params: EmployeeListParams) {
  return useQuery({
    queryKey: [...hrKeys.employees, params],
    queryFn: async () => {
      const res = await hrService.listEmployees({
        page: params.page,
        per_page: params.perPage,
        search: params.search || undefined,
        designation: params.designation !== 'all' ? params.designation : undefined,
        status: params.status !== 'all' ? params.status : undefined,
        sort: params.sort,
        dir: params.dir,
      });
      return { items: res.items.map(mapEmployee), meta: res.meta };
    },
    placeholderData: keepPreviousData,
  });
}

export function useEmployeeSummary() {
  return useQuery({
    queryKey: hrKeys.employeeSummary,
    queryFn: async () => mapEmployeeSummary(await hrService.employeeSummary()),
  });
}

/** Backend body for create/update (web employee/new.php + edit.php field names). */
export function toEmployeeBody(values: EmployeeFormValues): Record<string, unknown> {
  const body: Record<string, unknown> = {
    name: values.name.trim(),
    mobile: toBdMobile880(values.mobile),
    email: values.email.trim(),
    designation: values.designation,
    salary: values.salary.trim(),
    area_id: values.areaIds,
    address: values.address.trim(),
    nid_number: values.nidNumber.trim(),
    status: values.status,
  };
  if (values.password) {
    body.password = values.password;
    body.re_password = values.rePassword;
  }
  return body;
}

/** Create / update / delete — each invalidates the list, summary and pickers. */
export function useEmployeeMutations() {
  const qc = useQueryClient();
  const refresh = (id?: string) => {
    qc.invalidateQueries({ queryKey: hrKeys.employees });
    qc.invalidateQueries({ queryKey: hrKeys.employeeSummary });
    qc.invalidateQueries({ queryKey: hrKeys.meta });
    if (id) qc.invalidateQueries({ queryKey: hrKeys.employee(id) });
  };

  const create = useMutation({
    mutationFn: (values: EmployeeFormValues) => hrService.createEmployee(toEmployeeBody(values)),
    // The form maps field errors itself (handleApiError), so no global toast.
    meta: { silent: true },
    onSuccess: () => refresh(),
  });

  const update = useMutation({
    mutationFn: ({ id, values }: { id: string; values: EmployeeFormValues }) =>
      hrService.updateEmployee(id, toEmployeeBody(values)),
    meta: { silent: true },
    onSuccess: (_d, v) => refresh(v.id),
  });

  const remove = useMutation({
    mutationFn: (id: string) => hrService.deleteEmployee(id),
    onSuccess: (_d, id) => refresh(id),
  });

  return { create, update, remove };
}
