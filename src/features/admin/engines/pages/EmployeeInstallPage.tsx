'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/features/shared/page-header';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getEngineGroup } from '@/data/admin/engines.catalog';
import { useEngines } from '../hooks/use-engines';

/** Employee portal — installation assignments + checklist actions */
export function EmployeeInstallPage() {
  const { data, isLoading, isError, refetch } = useEngines('admin');
  const group = getEngineGroup('installation');
  const [done, setDone] = useState<Record<string, boolean>>({});

  const jobs = useMemo(
    () => data?.records.filter((r) => r.featureId === 'installer-assign' || r.featureId === 'install-checklist').slice(0, 10) ?? [],
    [data],
  );

  if (isLoading) return <PageSkeleton variant="table" />;
  if (isError || !data || !group) {
    return <EmptyState title="Failed to load installs" actionLabel="Retry" onAction={() => refetch()} />;
  }

  return (
    <div className="ui-page-enter space-y-6">
      <PageHeader
        title="My Installations"
        subtitle="Assigned install jobs, checklist, GPS & completion (static)"
        breadcrumb={[
          { label: 'Profile', url: '/employee/profile' },
          { label: 'Installations' },
        ]}
      />

      <div className="overflow-hidden rounded-lg border border-border/60">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Job</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.id} className="border-t border-border/40">
                <td className="px-3 py-2">
                  <div className="font-medium">{j.title}</div>
                  <div className="text-xs text-muted-foreground">{j.meta}</div>
                </td>
                <td className="px-3 py-2">
                  <Badge variant="outline" className="capitalize">
                    {done[j.id] ? 'completed' : j.status}
                  </Badge>
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => toast.message('GPS verified (static)')}
                    >
                      GPS
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setDone((d) => ({ ...d, [j.id]: true }));
                        toast.success('Install marked complete (static)');
                      }}
                    >
                      Complete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
