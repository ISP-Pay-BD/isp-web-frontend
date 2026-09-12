import { useQuery } from '@tanstack/react-query';
import { adminService } from '@/lib/api/services/admin.service';

export interface JournalEntryItem {
  id: string;
  date: string;
  description: string;
  debitBdt: number;
  creditBdt: number;
  status: string;
}

export function useJournalEntries() {
  const query = useQuery({
    queryKey: ['admin', 'accounting', 'journal'],
    queryFn: async () => {
      const data = await adminService.getAccountingDomain('journal-entries');
      if (data && typeof data === 'object' && 'journalEntries' in data) {
        return (data as { journalEntries: JournalEntryItem[] }).journalEntries ?? [];
      }
      if (Array.isArray(data)) {
        return data as JournalEntryItem[];
      }
      return [];
    },
  });

  return { ...query, entries: query.data ?? [] };
}
