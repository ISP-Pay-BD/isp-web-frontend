import { CustomerFeedbackPage } from '@/features/admin/support/pages/CustomerFeedbackPage';

export const metadata = { title: 'Customer Feedback', description: 'Customer ratings and comments' };

export default function AdminCustomerFeedbackRoute() {
  return <CustomerFeedbackPage />;
}
