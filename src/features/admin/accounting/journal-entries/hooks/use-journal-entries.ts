import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';

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
      const data = await mockFetch('admin.domain', 'accounting');
      return (data as { journalEntries: JournalEntryItem[] }).journalEntries ?? [];
    },
  });

  return { ...query, entries: query.data ?? [] };
}
