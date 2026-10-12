/** Query keys for the employee self-service portal. */
export const employeeKeys = {
  root: ['employee'] as const,
  summary: ['employee', 'summary'] as const,
  profile: ['employee', 'profile'] as const,
  salaries: ['employee', 'salaries'] as const,
  advances: ['employee', 'advances'] as const,
  attendance: ['employee', 'attendance'] as const,
  jobs: ['employee', 'jobs'] as const,
  installations: ['employee', 'installations'] as const,
};
