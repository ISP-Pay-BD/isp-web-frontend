'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import { PageHeader } from '@/features/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { toast } from 'sonner';
import { GripVertical, Pin, Trash2 } from 'lucide-react';
import type { SidebarPin } from '@/data/admin/extras.data';

export function SidebarPinsPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'domain', 'sidebarPins'],
    queryFn: async () => {
      const res = await mockFetch('admin.domain', 'sidebarPins');
      return res as { items: SidebarPin[] };
    },
  });
  const [pins, setPins] = useState<SidebarPin[] | null>(null);
  const list = pins ?? data?.items ?? [];

  if (isLoading) return <PageSkeleton variant="cards" />;
  if (isError || !data) {
    return <EmptyState title="Failed to load pins" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sidebar Pins"
        subtitle="Quick-access shortcuts for your admin sidebar"
        breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Sidebar Pins' }]}
        actions={
          <Button onClick={() => toast.message('Add pin (mock)')}>
            <Pin className="mr-2 h-4 w-4" />
            Add pin
          </Button>
        }
      />

      <Card className="border-border/60">
        <CardContent className="divide-y p-0">
          {list.map((pin) => (
            <div key={pin.id} className="flex items-center gap-3 px-4 py-3">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm">{pin.label}</p>
                <p className="font-mono text-xs text-muted-foreground truncate">{pin.href}</p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                aria-label={`Remove ${pin.label}`}
                onClick={() => {
                  setPins(list.filter((p) => p.id !== pin.id));
                  toast.success('Pin removed');
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
