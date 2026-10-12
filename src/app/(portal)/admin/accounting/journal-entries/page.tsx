import type { Metadata } from 'next';
import { JournalEntriesPage } from '@/features/admin/accounting/journal-entries';

export const metadata: Metadata = {
  title: 'Journal Entries',
  description: 'Journal vouchers with debit and credit lines.',
};

export default function Page() {
  return <JournalEntriesPage />;
}
