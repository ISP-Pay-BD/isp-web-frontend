import { AuditLogsPage } from '@/features/admin/audit-logs';

export const metadata = { title: 'Audit Logs', description: 'System activity audit trail' };

export default function AdminAuditLogsRoute() {
  return <AuditLogsPage />;
}
