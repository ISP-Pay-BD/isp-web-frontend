'use client';

import { useState, useMemo } from 'react';
import { motion, type Variants } from 'framer-motion';
import { PageHeader } from '@/features/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { toast } from 'sonner';
import {
  RotateCcw,
  Trash2,
  Search,
  Users,
  Package,
  FileText,
  LifeBuoy,
  UserCog,
  Clock,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import type { RecycleBinItem } from '@/data/admin/recycle-bin.data';
import { useRecycleBin } from '../hooks/use-recycle-bin';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const entityConfig: Record<string, { icon: typeof Users; color: string; bg: string }> = {
  customer: { icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' },
  package: { icon: Package, color: 'text-violet-500', bg: 'bg-violet-500/10 border-violet-500/20' },
  invoice: { icon: FileText, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20' },
  ticket: { icon: LifeBuoy, color: 'text-rose-500', bg: 'bg-rose-500/10 border-rose-500/20' },
  employee: { icon: UserCog, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20' },
};

export function RecycleBinPage() {
  const { data, isLoading, isError, refetch } = useRecycleBin();
  const [typeFilter, setTypeFilter] = useState('all');
  const [items, setItems] = useState<RecycleBinItem[]>([]);
  const [confirmAction, setConfirmAction] = useState<{ type: 'restore' | 'delete'; item: RecycleBinItem } | null>(null);

  const list = items.length > 0 ? items : data?.items ?? [];
  const filtered = typeFilter === 'all' ? list : list.filter((i) => i.entityType === typeFilter);

  const stats = useMemo(() => {
    const counts: Record<string, number> = { customer: 0, package: 0, invoice: 0, ticket: 0, employee: 0 };
    for (const item of list) {
      if (counts[item.entityType] !== undefined) counts[item.entityType]++;
    }
    return [
      { label: 'Customers', count: counts.customer, icon: Users, color: 'blue' },
      { label: 'Packages', count: counts.package, icon: Package, color: 'violet' },
      { label: 'Invoices', count: counts.invoice, icon: FileText, color: 'amber' },
      { label: 'Tickets', count: counts.ticket, icon: LifeBuoy, color: 'rose' },
      { label: 'Employees', count: counts.employee, icon: UserCog, color: 'emerald' },
    ];
  }, [list]);

  const statColors: Record<string, string> = {
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
    violet: 'bg-violet-500/10 border-violet-500/20 text-violet-500',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
    rose: 'bg-rose-500/10 border-rose-500/20 text-rose-500',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
  };

  if (isLoading) return <PageSkeleton rows={8} />;
  if (isError || !data) {
    return (
      <div className="p-6">
        <EmptyState title="Failed to load recycle bin" description="There was an error loading deleted items." actionLabel="Retry" onAction={() => refetch()} />
      </div>
    );
  }

  const handleRestore = (item: RecycleBinItem) => {
    setItems(list.filter((i) => i.id !== item.id));
    toast.success(`${item.title} restored successfully`);
    setConfirmAction(null);
  };

  const handleDeleteForever = (item: RecycleBinItem) => {
    setItems(list.filter((i) => i.id !== item.id));
    toast.success(`${item.title} permanently deleted`);
    setConfirmAction(null);
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={itemVariants}>
        <PageHeader
          title="Recycle Bin"
          subtitle="Restore or permanently delete soft-deleted records"
          breadcrumb={[{ label: 'Dashboard', url: '/admin/dashboard' }, { label: 'Recycle Bin' }]}
        />
      </motion.div>

      {/* Stat Cards */}
      <motion.div variants={itemVariants} className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((stat) => {
          const style = statColors[stat.color];
          return (
            <Card key={stat.label} className="border-border/60 bg-card shadow-sm ring-1 ring-foreground/5 hover:shadow-md hover:border-primary/20 transition-all duration-200 overflow-hidden group cursor-pointer" onClick={() => setTypeFilter(stat.label.toLowerCase().slice(0, -1))}>
              <CardContent className="p-3.5 flex items-center gap-3">
                <div className={`p-2 rounded-xl border group-hover:scale-110 transition-transform duration-200 ${style}`}>
                  <stat.icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xl font-bold tracking-tight">{stat.count}</div>
                  <div className="text-[11px] text-muted-foreground font-medium">{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Table Card */}
      <motion.div variants={itemVariants}>
        <Card className="border-border/60 bg-card shadow-sm ring-1 ring-foreground/5">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-bold tracking-tight">Deleted Items</h3>
              <Badge variant="secondary" className="text-xs font-mono px-2 py-0.5">{filtered.length}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="h-8 pl-8 pr-3 text-xs bg-background/50 border border-border/80 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/40 w-40"
                  onChange={() => {}}
                />
              </div>
              <Select value={typeFilter} onValueChange={(v) => v && setTypeFilter(v)}>
                <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="customer">Customers</SelectItem>
                  <SelectItem value="package">Packages</SelectItem>
                  <SelectItem value="invoice">Invoices</SelectItem>
                  <SelectItem value="ticket">Tickets</SelectItem>
                  <SelectItem value="employee">Employees</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="py-16">
              <EmptyState
                title="Recycle bin is empty"
                description="No deleted items to restore. Deleted records will appear here."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground w-10">#</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Type</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Title</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Identifier</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground hidden md:table-cell">Details</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground hidden lg:table-cell">Deleted</TableHead>
                    <TableHead className="text-right text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((item, idx) => {
                    const cfg = entityConfig[item.entityType] ?? entityConfig.customer;
                    const EntityIcon = cfg.icon;
                    return (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.03 }}
                        className="group border-border/40 hover:bg-muted/30 transition-colors"
                      >
                        <TableCell className="text-muted-foreground font-mono text-xs">{idx + 1}</TableCell>
                        <TableCell>
                          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-medium ${cfg.bg}`}>
                            <EntityIcon className={`h-3 w-3 ${cfg.color}`} />
                            <span className="capitalize">{item.entityType}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-sm group-hover:text-primary transition-colors">{item.title}</div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-xs bg-muted/60 px-1.5 py-0.5 rounded border border-border/50">{item.identifier}</span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-xs text-muted-foreground max-w-[200px] truncate block">{item.details}</span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span className="font-mono">{item.deletedAt}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-0.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 hover:bg-emerald-500/10 hover:text-emerald-600"
                              onClick={() => setConfirmAction({ type: 'restore', item })}
                              title="Restore item"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:bg-destructive/10"
                              onClick={() => setConfirmAction({ type: 'delete', item })}
                              title="Delete forever"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Warning Banner */}
      {list.length > 0 && (
        <motion.div variants={itemVariants}>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <p className="text-xs font-medium">
              Items in the recycle bin are automatically permanently deleted after 30 days.
            </p>
          </div>
        </motion.div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={Boolean(confirmAction)}
        onOpenChange={() => setConfirmAction(null)}
        title={confirmAction?.type === 'restore' ? 'Restore item?' : 'Delete permanently?'}
        description={
          confirmAction?.type === 'restore'
            ? `Restore "${confirmAction.item.title}" to the system?`
            : `Permanently delete "${confirmAction?.item.title}"? This cannot be undone.`
        }
        confirmLabel={confirmAction?.type === 'restore' ? 'Restore' : 'Delete Forever'}
        destructive={confirmAction?.type === 'delete'}
        onConfirm={() => {
          if (!confirmAction) return;
          if (confirmAction.type === 'restore') handleRestore(confirmAction.item);
          else handleDeleteForever(confirmAction.item);
        }}
      />
    </motion.div>
  );
}
