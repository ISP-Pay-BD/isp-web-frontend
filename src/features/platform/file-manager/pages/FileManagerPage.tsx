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

  const totalFolders = data.items.filter((i) => i.type === 'folder').length;
  const totalFiles = data.items.filter((i) => i.type === 'file').length;

  return (
    <div className="space-y-6">
      <PlatformPageHeader
        title="Platform File Manager"
        subtitle="Tenant static assets, branding logos, firmware bin files, automated database backups, and invoice PDFs"
        breadcrumb={[
          { label: 'Platform', href: '/platform/dashboard' },
          { label: 'File Manager' },
        ]}
      />

      {/* KPI Stats Ribbon */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums text-foreground">{data.items.length}</span>{' '}
          <span className="text-muted-foreground">total objects</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-amber-500">{totalFolders}</span>{' '}
          <span className="text-muted-foreground">directories</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-blue-500">{totalFiles}</span>{' '}
          <span className="text-muted-foreground">files</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-emerald-500">S3 / MinIO</span>{' '}
          <span className="text-muted-foreground">storage backend</span>
        </p>
      </div>

      <Card className="border-border/60 bg-card shadow-xs">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-muted/40 border border-border/40 text-xs text-muted-foreground">
            <button
              type="button"
              onClick={() => setCurrentPath('')}
              className="hover:text-foreground font-mono font-semibold px-1.5 py-0.5 rounded hover:bg-background transition-colors text-primary"
            >
              {data.root}
            </button>
            {breadcrumbs.map((part, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                <button
                  type="button"
                  onClick={() => setCurrentPath(breadcrumbs.slice(0, i + 1).join('/'))}
                  className="hover:text-foreground font-mono px-1.5 py-0.5 rounded hover:bg-background transition-colors font-medium text-foreground"
                >
                  {part}
                </button>
              </span>
            ))}
          </div>

          <div className="divide-y divide-border/40">
            {data.items.length === 0 ? (
              <p className="py-12 text-center text-xs text-muted-foreground">This storage folder is currently empty.</p>
            ) : (
              data.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => item.type === 'folder' && setCurrentPath(item.path)}
                  className="flex w-full items-center justify-between py-3 px-3 hover:bg-muted/50 rounded-lg text-left text-sm transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted/60 text-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      {item.type === 'folder' ? (
                        <Folder className="h-4 w-4 text-amber-500 fill-amber-500/20" />
                      ) : (
                        <File className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">{item.name}</div>
                      {item.ext ? (
                        <div className="text-[10px] text-muted-foreground font-mono uppercase">{item.ext} file</div>
                      ) : null}
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-muted-foreground">
                    <div className="font-mono font-medium">{formatSize(item.size)}</div>
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
