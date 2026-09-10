'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import { PlatformPageHeader } from '@/features/platform/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Puzzle, Search } from 'lucide-react';
import { formatBdt } from '@/lib/format';

export function PluginsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['platform', 'plugins'],
    queryFn: () => mockFetch('platform.plugins'),
  });

  if (isLoading) return <PageSkeleton variant="cards" rows={4} />;
  if (error || !data) {
    return (
      <EmptyState
        title="Failed to load plugins"
        description="Could not retrieve marketplace plugins."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  const filteredItems = data.items.filter((p) => {
    const matchCategory = selectedCategory === 'all' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.desc.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const activeCount = data.items.filter((p) => p.installed).length;
  const totalInstalls = data.items.reduce((s, p) => s + p.installs, 0);

  return (
    <div className="space-y-6">
      <PlatformPageHeader
        title="Plugins & Marketplace Addons"
        subtitle="Manage official integration packages, payment drivers, OLT connectors, and add-on extensions"
        breadcrumb={[
          { label: 'Platform', href: '/platform/dashboard' },
          { label: 'Plugins & Addons' },
        ]}
      />

      {/* KPI Stats Ribbon */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border/60 py-3 text-sm">
        <p>
          <span className="font-semibold tabular-nums text-foreground">{data.items.length}</span>{' '}
          <span className="text-muted-foreground">available plugins</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-emerald-500">{activeCount}</span>{' '}
          <span className="text-muted-foreground">active core modules</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-primary">{totalInstalls.toLocaleString()}</span>{' '}
          <span className="text-muted-foreground">tenant installations</span>
        </p>
        <p>
          <span className="font-semibold tabular-nums text-blue-500">v2.4 LTS</span>{' '}
          <span className="text-muted-foreground">runtime engine</span>
        </p>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {['all', 'Payment', 'Network', 'Messaging', 'Security'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? 'bg-primary text-primary-foreground shadow-2xs'
                  : 'bg-card border border-border/70 hover:bg-muted text-muted-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="max-w-xs w-full">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search plugins & extensions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-8 pl-8 pr-3 rounded-lg border border-border/70 bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredItems.map((plugin) => (
          <Card key={plugin.id} className="border-border/60 bg-card hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                    <Puzzle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">{plugin.name}</h3>
                    <Badge variant="outline" className="text-[10px] font-mono mt-0.5">
                      {plugin.category}
                    </Badge>
                  </div>
                </div>
                <Badge
                  variant={plugin.installed ? 'default' : 'secondary'}
                  className={`text-[10px] font-semibold ${
                    plugin.installed
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                      : ''
                  }`}
                >
                  {plugin.installed ? 'Active' : 'Available'}
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{plugin.desc}</p>

              <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs">
                <span className="font-bold font-mono text-primary text-sm">
                  {plugin.priceBdt === 0 ? 'Free' : `৳${formatBdt(plugin.priceBdt)}/mo`}
                </span>
                <span className="text-[11px] text-muted-foreground font-mono">{plugin.installs} active installs</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
