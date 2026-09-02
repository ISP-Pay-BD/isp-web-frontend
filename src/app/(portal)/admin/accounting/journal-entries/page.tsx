import type { Metadata } from 'next';
import { JournalEntriesPage } from '@/features/admin/accounting/journal-entries';

export const metadata: Metadata = {
  title: 'Journal Entries',
  description: 'Posted and draft journal vouchers.',
};

export default function Page() {
  return <JournalEntriesPage />;
}
