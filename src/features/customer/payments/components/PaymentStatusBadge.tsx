'use client';

import { StatusBadge } from '@/components/shared/StatusBadge';
import { useTranslations } from '@/i18n/locale-context';
import type { CustomerPaymentStatus } from '@/lib/api/adapters/customer.adapter';

export function PaymentStatusBadge({ status }: { status: CustomerPaymentStatus }) {
  const t = useTranslations();
  const labels: Record<CustomerPaymentStatus, string> = {
    paid: t('customer.payments.status.paid', 'Paid'),
    pending: t('customer.payments.status.pending', 'Pending'),
    failed: t('customer.payments.status.failed', 'Failed'),
    unknown: t('customer.payments.status.unknown', 'Unknown'),
  };
  return <StatusBadge status={status} label={labels[status]} />;
}
