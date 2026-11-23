import { Suspense } from 'react';
import type { Metadata } from 'next';
import { EmployeeCollectPaymentPage } from '@/features/employee/operations/pages/EmployeeCollectPaymentPage';

export const metadata: Metadata = {
  title: 'Collect Payment',
  description: 'Record a payment received from a customer',
};

export default function Page() {
  return (
    <Suspense>
      <EmployeeCollectPaymentPage />
    </Suspense>
  );
}
