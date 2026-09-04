'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import { PlatformPageHeader } from '@/features/platform/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Folder, File, ChevronRight } from 'lucide-react';

function formatSize(bytes: number | null): string {
  if (bytes === null) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileManagerPage() {
  const [currentPath, setCurrentPath] = useState('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['platform', 'file-manager', currentPath],
    queryFn: () => mockFetch('platform.file-manager', currentPath),
  });

  if (isLoading) return <PageSkeleton variant="cards" rows={4} />;
  if (error || !data) {
    return (
      <EmptyState
        title="Failed to load files"
        description="Could not retrieve file manager contents."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  const breadcrumbs = currentPath ? currentPath.split('/').filter(Boolean) : [];

  return (
    <div className="space-y-6">
      <PlatformPageHeader
        title="File Manager"
        subtitle="Platform assets — tenant logos, backups, and system documents"
      />

      <Card className="border-border/60">
        <CardContent className="p-4">
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
            <button
              type="button"
              onClick={() => setCurrentPath('')}
              className="hover:text-foreground font-mono text-xs"
            >
              {data.root}
            </button>
            {breadcrumbs.map((part, i) => (
              <span key={i} className="flex items-center gap-1">
                <ChevronRight className="h-3 w-3" />
                <button
                  type="button"
                  onClick={() => setCurrentPath(breadcrumbs.slice(0, i + 1).join('/'))}
                  className="hover:text-foreground font-mono text-xs"
                >
                  {part}
                </button>
              </span>
            ))}
          </div>

          <div className="divide-y divide-border/40">
            {data.items.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">This folder is empty.</p>
            ) : (
              data.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => item.type === 'folder' && setCurrentPath(item.path)}
                  className="flex w-full items-center justify-between py-3 px-2 hover:bg-muted/50 rounded-md text-left text-sm transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {item.type === 'folder' ? (
                      <Folder className="h-5 w-5 text-amber-500" />
                    ) : (
                      <File className="h-5 w-5 text-blue-500" />
                    )}
                    <div>
                      <div className="font-medium">{item.name}</div>
                      {item.ext ? (
                        <div className="text-xs text-muted-foreground uppercase">{item.ext}</div>
                      ) : null}
                    </div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <div>{formatSize(item.size)}</div>
                    <div>{item.modifiedAt}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
