/** TanStack Query keys for the HR module — invalidate by prefix. */
export const hrKeys = {
  root: ['admin', 'hr'] as const,
  meta: ['admin', 'hr', 'meta'] as const,
  employees: ['admin', 'hr', 'employees'] as const,
  employeeSummary: ['admin', 'hr', 'employees-summary'] as const,
  employee: (id: string) => ['admin', 'hr', 'employee', id] as const,
  attendance: ['admin', 'hr', 'attendance'] as const,
  advances: ['admin', 'hr', 'advance-salary'] as const,
  salaries: ['admin', 'hr', 'salaries'] as const,
  accounts: ['admin', 'hr', 'accounts'] as const,
  installations: ['admin', 'hr', 'installations'] as const,
};
