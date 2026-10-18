import type { useTranslations } from '@/i18n/locale-context';
import type { Tone } from '@/components/shared/status-tones';

type Translate = ReturnType<typeof useTranslations>;

/** The status word (as the API and the shared tone map spell it) in the active language; unknown words stay as sent. */
export function statusLabel(t: Translate, status: string): string {
  switch (status) {
    case 'present':
      return t('employee.common.status.present', 'Present');
    case 'absent':
      return t('employee.common.status.absent', 'Absent');
    case 'late':
      return t('employee.common.status.late', 'Late');
    case 'pending':
      return t('employee.common.status.pending', 'Pending');
    case 'assigned':
      return t('employee.common.status.assigned', 'Assigned');
    case 'in_progress':
      return t('employee.common.status.inProgress', 'In progress');
    case 'completed':
      return t('employee.common.status.completed', 'Completed');
    case 'cancelled':
      return t('employee.common.status.cancelled', 'Cancelled');
    case 'open':
      return t('employee.common.status.open', 'Open');
    case 'closed':
      return t('employee.common.status.closed', 'Closed');
    case 'approved':
      return t('employee.common.status.approved', 'Approved');
    case 'rejected':
      return t('employee.common.status.rejected', 'Rejected');
    case 'deducted':
      return t('employee.common.status.deducted', 'Deducted');
    case 'paid':
      return t('employee.common.status.paid', 'Paid');
    case 'failed':
      return t('employee.common.status.failed', 'Failed');
    default:
      return status;
  }
}

/** Installation work-order statuses that are not in the shared tone map. */
export const INSTALLATION_TONE: Record<string, Tone> = { assigned: 'info' };
