'use client';

import { Badge } from '@/components/ui/badge';
import { useTranslations } from '@/i18n/locale-context';

/** Purchase-bill payment status: paid | partial | unpaid. */
export function PaymentStatusBadge({ status }: { status: string }) {
  const t = useTranslations();
  if (status === 'paid') {
    return (
      <Badge variant="outline" tone="success">
        {t('admin.purchase.status.paid', 'Paid in Full')}
      </Badge>
    );
  }
  if (status === 'partial') {
    return (
      <Badge variant="outline" tone="warning">
        {t('admin.purchase.status.partial', 'Partially Paid')}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" tone="danger">
      {t('admin.purchase.status.unpaid', 'Unpaid / Due')}
    </Badge>
  );
}
