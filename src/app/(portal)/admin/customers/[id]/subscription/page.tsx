import type { Metadata } from 'next';
import { PermissionGuard } from '@/features/shared/permission';
import { CustomerSubscriptionPage } from '@/features/admin/customer-billing/pages/CustomerSubscriptionPage';

interface Props {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: 'Customer Subscription | Admin',
  description: 'Recharge, daily bill and multi-month billing for a customer',
};

export default async function CustomerSubscriptionRoute({ params }: Props) {
  const { id } = await params;
  return (
    <PermissionGuard menu="customer" action="update_subscription">
      <CustomerSubscriptionPage id={id} />
    </PermissionGuard>
  );
}
