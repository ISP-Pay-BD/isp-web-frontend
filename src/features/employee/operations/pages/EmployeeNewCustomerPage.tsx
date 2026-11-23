'use client';

import { useTranslations } from '@/i18n/locale-context';
import { NewCustomerPage } from '@/features/admin/customers/pages/NewCustomerPage';
import { EmployeeAccessGate } from '../components/EmployeeAccessGate';

/**
 * Employee quick action "Add customer": the admin Add Customer form (`POST /v1/reseller/customers/create/{rid}` →
 * Rust `create_customer`), which the API opens to an employee with `customer.create` (lane W2-R13).
 */
export function EmployeeNewCustomerPage() {
  const t = useTranslations();
  const title = t('employee.quick.addCustomer', 'Add customer');
  return (
    <EmployeeAccessGate
      title={title}
      breadcrumbs={[
        { label: t('employee.common.breadcrumb', 'Employee'), href: '/employee/dashboard' },
        { label: title },
      ]}
      allowed={(p) => p.createCustomer}
    >
      <NewCustomerPage listHref="/employee/dashboard" />
    </EmployeeAccessGate>
  );
}
