'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  Building2,
  Receipt,
  CreditCard,
  X,
  UserPlus,
  UserMinus,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PageHeader } from '@/features/admin/shared/components/PageHeader';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { TablePagination } from '@/components/shared/TablePagination';
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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Can } from '@/components/shared/Can';
import { cn } from '@/lib/utils';
import { errorMessage, handleApiError } from '@/lib/api/utils/error-handler';
import { useDebouncedValue } from '@/features/admin/customers/hooks/use-debounced-value';
import { useCustomers } from '@/features/admin/customers/hooks/use-customers';
import {
  useCustomerGroupMutations,
  useCustomerGroupSummary,
  useCustomerGroups,
  useGroupMembers,
} from '@/features/admin/customers/hooks/use-customer-groups';
import type { CustomerGroup } from '@/features/admin/customers/types';

const groupSchema = z.object({
  name: z.string().trim().min(2, 'Enter a group name').max(150),
  parent_name: z.string().trim().max(150).optional(),
  billing_mode: z.enum(['consolidated', 'individual']),
  note: z.string().trim().max(255).optional(),
});
type GroupForm = z.infer<typeof groupSchema>;

const BILLING_LABEL = { consolidated: 'Consolidated (one invoice)', individual: 'Individual (per member)' };

export function CustomerGroupsPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim());
  const [billingFilter, setBillingFilter] = useState('all');
  const [pageSize, setPageSize] = useState(20);
  const pageKey = `${debouncedSearch}|${billingFilter}|${pageSize}`;
  const [pageState, setPageState] = useState({ key: pageKey, page: 1 });
  const page = pageState.key === pageKey ? pageState.page : 1;

  const { data, isLoading, isError, error, isFetching, refetch } = useCustomerGroups({
    page,
    perPage: pageSize,
    search: debouncedSearch,
    billingMode: billingFilter,
  });
  const summaryQuery = useCustomerGroupSummary();
  const m = useCustomerGroupMutations();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editGroup, setEditGroup] = useState<CustomerGroup | null>(null);
  const [deleteGroup, setDeleteGroup] = useState<CustomerGroup | null>(null);
  const [membersOf, setMembersOf] = useState<CustomerGroup | null>(null);

  const form = useForm<GroupForm>({
    resolver: zodResolver(groupSchema),
    defaultValues: { name: '', parent_name: '', billing_mode: 'consolidated', note: '' },
  });

  const rows = data?.items ?? [];
  const summary = summaryQuery.data;
  const kpi = (n: number | undefined) => (summary ? n ?? 0 : '…');

  const openCreate = () => {
    setEditGroup(null);
    form.reset({ name: '', parent_name: '', billing_mode: 'consolidated', note: '' });
    setDialogOpen(true);
  };

  const openEdit = (group: CustomerGroup) => {
    setEditGroup(group);
    form.reset({ name: group.name, parent_name: group.parentName ?? '', billing_mode: group.billingMode, note: group.note ?? '' });
    setDialogOpen(true);
  };

  const onSubmit = async (values: GroupForm) => {
    try {
      if (editGroup) await m.update.mutateAsync({ id: editGroup.id, body: values });
      else await m.create.mutateAsync(values);
      setDialogOpen(false);
    } catch (err) {
      handleApiError(err, form.setError);
    }
  };

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (isError) {
    return (
      <EmptyState
        title="Failed to load customer groups"
        description={errorMessage(error)}
        actionLabel="Retry"
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 w-full pb-16">
      <PageHeader
        title="Customer Groups"
        subtitle="Corporate and multi-branch accounts: group customer lines under one organization."
        breadcrumb={[
          { label: 'Admin', url: '/admin/dashboard' },
          { label: 'Customers', url: '/admin/customers' },
          { label: 'Customer Groups' },
        ]}
        actions={
          <Can menu="customer" action="create">
            <Button
              size="sm"
              onClick={openCreate}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-8 gap-1.5 shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" /> Create Group
            </Button>
          </Can>
        }
      />

      {/* KPI Metric Strips (backend summary) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(
          [
            { label: 'Total Groups', value: kpi(summary?.totalGroups), unit: 'organizations', icon: Building2, tone: 'bg-primary/10 text-primary', valueTone: 'text-foreground' },
            { label: 'Total Members', value: kpi(summary?.totalMembers), unit: 'subscribers', icon: Users, tone: 'bg-blue-500/10 text-blue-500', valueTone: 'text-blue-600 dark:text-blue-400' },
            { label: 'Consolidated', value: kpi(summary?.consolidated), unit: 'single-bill', icon: Receipt, tone: 'bg-emerald-500/10 text-emerald-500', valueTone: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Individual', value: kpi(summary?.individual), unit: 'per-member bill', icon: CreditCard, tone: 'bg-muted text-muted-foreground', valueTone: 'text-muted-foreground' },
          ] as const
        ).map((k) => (
          <Card key={k.label} className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{k.label}</span>
              <div className={cn('p-2 rounded-lg', k.tone)}>
                <k.icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className={cn('text-2xl font-bold tracking-tight tabular-nums', k.valueTone)}>{k.value}</span>
              <span className="text-xs text-muted-foreground">{k.unit}</span>
            </div>
          </Card>
        ))}
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

          <Select
            value={billingFilter}
            onValueChange={(v) => setBillingFilter(v || 'all')}
            items={{ all: 'All Billing Modes', consolidated: 'Consolidated', individual: 'Individual' }}
          >
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
        </CardContent>
      </Card>

      {/* Table */}
      <Card className={cn('border-border/70 shadow-2xs bg-card overflow-hidden ring-1 ring-border/50', isFetching && 'opacity-80')}>
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
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-muted-foreground">
                    <div className="max-w-xs mx-auto space-y-2">
                      <Building2 className="h-8 w-8 mx-auto text-muted-foreground/60" />
                      <p className="font-semibold text-foreground">
                        {debouncedSearch || billingFilter !== 'all' ? 'No matching customer groups' : 'No customer groups yet'}
                      </p>
                      <p className="text-xs text-muted-foreground">Create a group to bundle a corporate client&apos;s lines.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-xs border border-primary/20">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="font-bold text-foreground text-sm">{r.name}</span>
                          {r.note && <div className="text-[10px] text-muted-foreground truncate max-w-[220px]">{r.note}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-foreground">{r.parentName || '—'}</td>
                    <td className="py-3.5 px-4">
                      <button type="button" onClick={() => setMembersOf(r)}>
                        <Badge variant="secondary" className="font-mono text-xs px-2.5 py-0.5 bg-muted hover:bg-muted/70 cursor-pointer">
                          <Users className="h-3 w-3 mr-1 text-muted-foreground" />
                          {r.memberCount} lines
                        </Badge>
                      </button>
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
                        <Button size="icon" variant="ghost" className="h-7 w-7 hover:bg-primary/10 hover:text-primary" onClick={() => setMembersOf(r)} title="Members">
                          <Users className="h-3.5 w-3.5" />
                        </Button>
                        <Can menu="customer" action="update">
                          <Button size="icon" variant="ghost" className="h-7 w-7 hover:bg-primary/10 hover:text-primary" onClick={() => openEdit(r)} title="Edit group">
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        </Can>
                        <Can menu="customer" action="delete">
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => setDeleteGroup(r)} title="Delete group">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </Can>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {(data?.meta.total ?? 0) > 0 && (
          <TablePagination
            currentPage={page}
            pageSize={pageSize}
            totalItems={data?.meta.total ?? 0}
            onPageChange={(p) => setPageState({ key: pageKey, page: p })}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[10, 20, 50, 100]}
          />
        )}
      </Card>

      {/* Create / Edit Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              {editGroup ? 'Edit Customer Group' : 'New Customer Group'}
            </DialogTitle>
            <DialogDescription>
              {editGroup ? 'Update the organization details and billing mode.' : 'Define a corporate or multi-branch customer group.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2" noValidate>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Group / Organization Name *</Label>
              <Input {...form.register('name')} className="h-9 text-xs" />
              {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Parent Company</Label>
              <Input {...form.register('parent_name')} className="h-9 text-xs" />
              {form.formState.errors.parent_name && <p className="text-xs text-destructive">{form.formState.errors.parent_name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Billing Mode</Label>
              <Select
                value={form.watch('billing_mode')}
                onValueChange={(v) => form.setValue('billing_mode', v === 'individual' ? 'individual' : 'consolidated')}
                items={BILLING_LABEL}
              >
                <SelectTrigger className="h-9 text-xs w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consolidated">{BILLING_LABEL.consolidated}</SelectItem>
                  <SelectItem value="individual">{BILLING_LABEL.individual}</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.billing_mode && <p className="text-xs text-destructive">{form.formState.errors.billing_mode.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Note</Label>
              <Input {...form.register('note')} className="h-9 text-xs" />
              {form.formState.errors.note && <p className="text-xs text-destructive">{form.formState.errors.note.message}</p>}
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={form.formState.isSubmitting} className="bg-primary text-primary-foreground">
                {form.formState.isSubmitting ? 'Saving…' : editGroup ? 'Save Changes' : 'Create Group'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteGroup !== null}
        onOpenChange={(open) => !open && setDeleteGroup(null)}
        title="Delete Customer Group"
        description="The group is removed; its member customers stay as standalone accounts."
        confirmLabel="Delete Group"
        destructive
        onConfirm={async () => {
          if (deleteGroup) {
            await m.remove.mutateAsync(deleteGroup.id);
            setDeleteGroup(null);
          }
        }}
      />

      {membersOf && <MembersSheet group={membersOf} onClose={() => setMembersOf(null)} />}
    </div>
  );
}

/** Members of one group + add customers (server search). */
function MembersSheet({ group, onClose }: { group: CustomerGroup | null; onClose: () => void }) {
  const [page, setPage] = useState(1);
  const [memberSearch, setMemberSearch] = useState('');
  const debouncedMembers = useDebouncedValue(memberSearch.trim());
  const [customerSearch, setCustomerSearch] = useState('');
  const debouncedCustomers = useDebouncedValue(customerSearch.trim());
  const members = useGroupMembers(group?.id ?? null, page, 10, debouncedMembers);
  const candidates = useCustomers({ search: debouncedCustomers, perPage: 8 }, { enabled: debouncedCustomers !== '' });
  const m = useCustomerGroupMutations();

  const memberIds = new Set((members.data?.items ?? []).map((x) => x.id));

  return (
    <Sheet
      open={group !== null}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          setPage(1);
          setMemberSearch('');
          setCustomerSearch('');
        }
      }}
    >
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-6 space-y-5">
        <SheetHeader>
          <SheetTitle>{group?.name}</SheetTitle>
          <SheetDescription>{members.data?.meta.total ?? group?.memberCount ?? 0} member lines</SheetDescription>
        </SheetHeader>

        <Can menu="customer" action="update">
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Add customers</Label>
            <Input placeholder="Search customers by name, mobile or PPPoE..." value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} className="h-9 text-xs" />
            {debouncedCustomers && (
              <div className="rounded-lg border divide-y">
                {candidates.isLoading ? (
                  <p className="p-3 text-xs text-muted-foreground">Searching…</p>
                ) : (candidates.data?.items.length ?? 0) === 0 ? (
                  <p className="p-3 text-xs text-muted-foreground">No customers found.</p>
                ) : (
                  candidates.data?.items.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-2.5 text-xs">
                      <div>
                        <div className="font-medium">{c.name}</div>
                        <div className="text-muted-foreground font-mono">{c.phone || c.username || `#${c.id}`}</div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 gap-1"
                        disabled={!group || memberIds.has(c.id) || m.addMembers.isPending}
                        onClick={() => group && m.addMembers.mutate({ groupId: group.id, ids: [c.id] })}
                      >
                        <UserPlus className="h-3 w-3" /> {memberIds.has(c.id) ? 'Added' : 'Add'}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </Can>

        <div className="space-y-2">
          <Label className="text-xs font-semibold">Members</Label>
          <Input placeholder="Filter members..." value={memberSearch} onChange={(e) => { setMemberSearch(e.target.value); setPage(1); }} className="h-9 text-xs" />
          {members.isLoading ? (
            <PageSkeleton variant="table" rows={3} />
          ) : members.isError ? (
            <EmptyState title="Could not load members" description={errorMessage(members.error)} actionLabel="Retry" onAction={() => members.refetch()} />
          ) : (members.data?.items.length ?? 0) === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">No members yet.</p>
          ) : (
            <div className="rounded-lg border divide-y">
              {members.data?.items.map((mem) => (
                <div key={mem.id} className="flex items-center justify-between p-2.5 text-xs">
                  <div>
                    <Link href={`/admin/customers/${mem.id}`} className="font-medium hover:text-primary hover:underline">
                      {mem.name || `#${mem.id}`}
                    </Link>
                    <div className="text-muted-foreground font-mono">
                      {mem.mobile || '—'}
                      {mem.willExpire ? ` · expires ${mem.willExpire.slice(0, 10)}` : ''}
                    </div>
                  </div>
                  <Can menu="customer" action="update">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-destructive gap-1"
                      disabled={m.removeMembers.isPending}
                      onClick={() => group && m.removeMembers.mutate({ groupId: group.id, ids: [mem.id] })}
                    >
                      <UserMinus className="h-3 w-3" /> Remove
                    </Button>
                  </Can>
                </div>
              ))}
            </div>
          )}
          {(members.data?.meta.totalPages ?? 1) > 1 && (
            <TablePagination
              currentPage={page}
              pageSize={10}
              totalItems={members.data?.meta.total ?? 0}
              onPageChange={setPage}
              onPageSizeChange={() => undefined}
              pageSizeOptions={[10]}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
