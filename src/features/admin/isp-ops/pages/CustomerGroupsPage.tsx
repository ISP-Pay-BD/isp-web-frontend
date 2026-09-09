'use client';

import { useMemo, useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Layers,
  Edit,
  Trash2,
  Building2,
  Receipt,
  Download,
  CheckCircle2,
  CreditCard,
  X,
  ArrowRight,
} from 'lucide-react';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useIspOps } from '../hooks/use-isp-ops';
import type { IspOpsData } from '@/data/admin/isp-ops.data';

type GroupRow = IspOpsData['customerGroups'][number];

export function CustomerGroupsPage() {
  const { data, isLoading, isError, refetch } = useIspOps();
  const [search, setSearch] = useState('');
  const [billingFilter, setBillingFilter] = useState('all'); // all | consolidated | individual
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editGroup, setEditGroup] = useState<GroupRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form State
  const [groupName, setGroupName] = useState('');
  const [parentName, setParentName] = useState('');
  const [billingMode, setBillingMode] = useState<'consolidated' | 'individual'>('consolidated');

  const rows: GroupRow[] = useMemo(() => data?.customerGroups ?? [], [data?.customerGroups]);

  const totalMembers = useMemo(() => rows.reduce((s, r) => s + r.members, 0), [rows]);
  const consolidatedCount = useMemo(
    () => rows.filter((r) => r.billingMode === 'consolidated').length,
    [rows]
  );

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (search) {
        const q = search.toLowerCase().trim();
        const matches =
          r.name.toLowerCase().includes(q) ||
          r.parentName.toLowerCase().includes(q) ||
          String(r.members).includes(q) ||
          r.billingMode.toLowerCase().includes(q);
        if (!matches) return false;
      }

      if (billingFilter !== 'all' && r.billingMode !== billingFilter) {
        return false;
      }

      return true;
    });
  }, [rows, search, billingFilter]);

  const openCreate = () => {
    setEditGroup(null);
    setGroupName('');
    setParentName('');
    setBillingMode('consolidated');
    setCreateModalOpen(true);
  };

  const openEdit = (group: GroupRow) => {
    setEditGroup(group);
    setGroupName(group.name);
    setParentName(group.parentName);
    setBillingMode(group.billingMode);
    setCreateModalOpen(true);
  };

  const handleSaveGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }
    if (editGroup) {
      toast.success(`Group "${groupName}" updated`);
    } else {
      toast.success(`New group "${groupName}" created`);
    }
    setCreateModalOpen(false);
  };

  const handleExportCsv = () => {
    const headers = ['Group Name', 'Parent Organization', 'Member Count', 'Billing Mode'];
    const dataRows = filtered.map((r) => [r.name, r.parentName, r.members, r.billingMode]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...dataRows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `customer_groups_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Exported customer groups report to CSV');
  };

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (isError || !data) {
    return (
      <EmptyState
        title="Failed to load customer groups"
        description="Could not query corporate and parent-child billing groups."
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Header */}
      <PageHeader
        title="Customer Groups"
        subtitle="Corporate parent-child billing groups, multi-branch franchises, and consolidated payment accounts."
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Customers', url: '/admin/customers' },
          { label: 'Customer Groups' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              className="text-xs h-8 border-border/80 hover:bg-accent"
            >
              <Download className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" /> Export
            </Button>
            <Button
              size="sm"
              onClick={openCreate}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-8 gap-1.5 shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" /> Create Group
            </Button>
          </div>
        }
      />

      {/* KPI Metric Strips */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Groups
            </span>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
              {rows.length}
            </span>
            <span className="text-xs text-muted-foreground">organizations</span>
          </div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Members
            </span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400 tabular-nums">
              {totalMembers}
            </span>
            <span className="text-xs text-muted-foreground">subscribers</span>
          </div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Consolidated Invoicing
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
              {consolidatedCount}
            </span>
            <span className="text-xs text-muted-foreground">single-bill</span>
          </div>
        </Card>

        <Card className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Individual Split
            </span>
            <div className="p-2 rounded-lg bg-muted text-muted-foreground">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-muted-foreground tabular-nums">
              {rows.length - consolidatedCount}
            </span>
            <span className="text-xs text-muted-foreground">per-branch pay</span>
          </div>
        </Card>
      </div>

      {/* Toolbar & Filters */}
      <Card className="border-border/70 shadow-2xs bg-card">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by group name or parent..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-8 h-9 text-xs bg-background border-border/60 shadow-inner"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Select value={billingFilter} onValueChange={(v) => setBillingFilter(v || 'all')}>
              <SelectTrigger className="h-9 text-xs w-[160px] bg-background border-border/60">
                <Receipt className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                <SelectValue placeholder="All Billing Modes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Billing Modes</SelectItem>
                <SelectItem value="consolidated">Consolidated</SelectItem>
                <SelectItem value="individual">Individual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-border/70 shadow-2xs bg-card overflow-hidden ring-1 ring-border/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/80 bg-muted/40 text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
                <th className="py-3.5 px-4">Group Name</th>
                <th className="py-3.5 px-4">Parent Entity</th>
                <th className="py-3.5 px-4">Subscribers</th>
                <th className="py-3.5 px-4">Billing Mode</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-muted-foreground">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Building2 className="h-8 w-8 mx-auto text-muted-foreground/60" />
                      <p className="font-semibold text-foreground">No matching customer groups</p>
                      <p className="text-xs text-muted-foreground">
                        Try resetting your search query or creating a new corporate group.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((r, i) => (
                  <tr key={r.id || i} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs border border-primary/20">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="font-bold text-foreground text-sm">{r.name}</span>
                          <div className="text-[10px] text-muted-foreground font-mono">
                            ID: {r.id || `grp_${i + 1}`}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-foreground">
                      {r.parentName || '—'}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant="secondary" className="font-mono text-xs px-2.5 py-0.5 bg-muted">
                        <Users className="h-3 w-3 mr-1 text-muted-foreground" />
                        {r.members} lines
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge
                        variant="outline"
                        className={cn(
                          'capitalize text-[11px] font-medium',
                          r.billingMode === 'consolidated'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                        )}
                      >
                        {r.billingMode}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 hover:bg-primary/10 hover:text-primary"
                          onClick={() => openEdit(r)}
                          title="Edit group"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteId(r.id || `grp_${i + 1}`)}
                          title="Delete group"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create / Edit Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              {editGroup ? 'Edit Customer Group' : 'New Customer Group'}
            </DialogTitle>
            <DialogDescription>
              {editGroup
                ? 'Update corporate entity details and billing rules.'
                : 'Define a consolidated billing account or multi-branch customer group.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveGroup} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Group / Organization Name *</Label>
              <Input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g. Acme Corporation Branch Network"
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Parent Holding Company</Label>
              <Input
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="e.g. Acme Group Holdings Ltd."
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Billing Mode</Label>
              <Select
                value={billingMode}
                onValueChange={(v) => setBillingMode(v as 'consolidated' | 'individual')}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consolidated">Consolidated (One master monthly invoice)</SelectItem>
                  <SelectItem value="individual">Individual (Separate invoices per member line)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground">
                {editGroup ? 'Save Changes' : 'Create Group'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Customer Group"
        description="Are you sure you want to delete this customer group? Member lines will revert to standalone unlinked accounts."
        confirmLabel="Delete Group"
        destructive
        onConfirm={() => {
          toast.success('Customer group deleted');
          setDeleteId(null);
        }}
      />
    </div>
  );
}
