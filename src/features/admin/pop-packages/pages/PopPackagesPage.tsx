'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Boxes,
  Eye,
  EyeOff,
  Package,
  Wifi,
  Building2,
  Zap,
  Filter,
  X,
} from 'lucide-react';
import { usePackages } from '@/features/admin/packages/hooks/use-packages';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { StatCard } from '@/components/shared/StatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { staggerContainer, fadeUp, hoverLift } from '@/lib/animations';

type TypeFilter = 'all' | 'home' | 'corporate';

export function PopPackagesPage() {
  const { data, isLoading, isError, refetch } = usePackages();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

  const items = data?.popPackages ?? [];

  const stats = useMemo(() => {
    const home = items.filter((p) => p.type === 'home').length;
    const corp = items.filter((p) => p.type === 'corporate').length;
    const avg = items.length ? Math.round(items.reduce((a, p) => a + p.priceBdt, 0) / items.length) : 0;
    return { home, corp, avg };
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((p) => {
      const matchSearch = search === '' || p.name.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'all' || p.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [items, search, typeFilter]);

  if (isLoading) return <PageSkeleton rows={6} />;
  if (isError) {
    return (
      <EmptyState
        title="Failed to load POP packages"
        description="Could not fetch reseller package catalog."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-6 max-w-7xl mx-auto pb-12"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Boxes className="h-6 w-6" />
            </div>
            POP Packages
          </h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            Internet plans available to POP resellers for their downstream customers.
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={fadeUp} className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total POP Packages"
          value={items.length}
          description="Available reseller plans"
          icon={Package}
        />
        <StatCard
          title="Home Plans"
          value={stats.home}
          description="Residential broadband"
          icon={Wifi}
        />
        <StatCard
          title="Avg. Reseller Price"
          value={<CurrencyDisplay amount={stats.avg} className="font-mono text-foreground font-bold" />}
          description="Monthly retail average"
          icon={Zap}
        />
      </motion.div>

      {/* Toolbar */}
      <motion.div variants={fadeUp}>
        <Card className="border-border/60 bg-card shadow-sm ring-1 ring-foreground/5 overflow-hidden">
          <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search POP packages..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-9 bg-background border-border/60 text-sm shadow-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/40 border border-border/60">
                {(['all', 'home', 'corporate'] as const).map((f) => (
                  <Button
                    key={f}
                    type="button"
                    size="sm"
                    variant={typeFilter === f ? 'default' : 'ghost'}
                    onClick={() => setTypeFilter(f)}
                    className="text-xs h-7 px-2.5 capitalize"
                  >
                    {f === 'all' ? `All (${items.length})` : `${f} (${f === 'home' ? stats.home : stats.corp})`}
                  </Button>
                ))}
              </div>
              <Badge variant="secondary" className="font-mono text-xs px-2.5 py-1 bg-muted/50">
                {filtered.length} result{filtered.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Table */}
      <motion.div variants={fadeUp}>
        <Card className="border-border/60 bg-card shadow-sm ring-1 ring-foreground/5 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16">
              <EmptyState
                title="No POP packages found"
                description="Configure packages in the main Packages module first."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="w-[40px]">
                      <span className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">#</span>
                    </TableHead>
                    <TableHead>
                      <span className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">POP Package</span>
                    </TableHead>
                    <TableHead>
                      <span className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Speed</span>
                    </TableHead>
                    <TableHead>
                      <span className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Reseller Price</span>
                    </TableHead>
                    <TableHead>
                      <span className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Type</span>
                    </TableHead>
                    <TableHead className="text-right">
                      <span className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Status</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((pkg, idx) => (
                    <motion.tr
                      key={pkg.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03, duration: 0.3 }}
                      className="group border-border/40 hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {idx + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className={`p-1.5 rounded-lg transition-all duration-200 ${
                            pkg.type === 'corporate'
                              ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                              : 'bg-primary/10 text-primary border border-primary/20'
                          } group-hover:scale-110 transition-transform`}>
                            <Boxes className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                              {pkg.name}
                            </div>
                            <div className="text-[10px] text-muted-foreground font-mono">{pkg.id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-bold font-mono">{pkg.speedMbps}</span>
                          <span className="text-[10px] text-muted-foreground">Mbps</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-bold font-mono text-primary">
                          <CurrencyDisplay amount={pkg.priceBdt} />
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-semibold capitalize ${
                            pkg.type === 'corporate'
                              ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
                              : 'bg-primary/10 text-primary border-primary/20'
                          }`}
                        >
                          {pkg.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {pkg.visible ? (
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] font-medium gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-slate-500/10 text-muted-foreground border-slate-500/20 text-[10px] font-medium gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400 inline-block" />
                            Hidden
                          </Badge>
                        )}
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
}
