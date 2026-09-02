import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import type { RouterItem } from '@/data/admin/network-ops.data';

export function useRouters() {
  return useQuery({
    queryKey: ['admin', 'routers'],
    queryFn: async () => {
      const data = await mockFetch('admin.domain', 'network') as { routers?: RouterItem[] };
      return data?.routers ?? [];
    },
  });
}
