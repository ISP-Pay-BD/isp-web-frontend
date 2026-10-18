'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Building2,
  Receipt,
  CreditCard,
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
import { DataTable } from '@/features/shared/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
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
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useUrlParam } from '@/hooks/use-url-state';
import { useCustomers } from '@/features/admin/customers/hooks/use-customers';
import {
  useCustomerGroupMutations,
  useCustomerGroupSummary,
  useCustomerGroups,
  useGroupMembers,
} from '@/features/admin/customers/hooks/use-customer-groups';
import type { CustomerGroup } from '@/features/admin/customers/types';
import { useLocale, useTranslations } from '@/i18n/locale-context';
import { useServerTable } from '../hooks/use-server-table';

const groupSchema = z.object({
  name: z.string().trim().min(2, 'Enter a group name').max(150, 'Too long'),
  parent_name: z.string().trim().max(150, 'Too long').optional(),
  billing_mode: z.enum(['consolidated', 'individual']),
  note: z.string().trim().max(255, 'Too long').optional(),
});
type GroupForm = z.infer<typeof groupSchema>;

type Translate = ReturnType<typeof useTranslations>;

function billingLabel(t: Translate, mode: GroupForm['billing_mode'], long = false): string {
  if (mode === 'consolidated') {
    return long
      ? t('admin.ops.groups.billing.consolidatedLong', 'Consolidated (one invoice)')
      : t('admin.ops.groups.billing.consolidated', 'Consolidated');
  }
  return long
    ? t('admin.ops.groups.billing.individualLong', 'Individual (per member)')
    : t('admin.ops.groups.billing.individual', 'Individual');
}

export function CustomerGroupsPage() {
  const { t, te } = useLocale();
  const table = useServerTable();
  const { search } = table;
  const [billingParam, setBillingParam] = useUrlParam('billing');
  const billingFilter = billingParam === 'consolidated' || billingParam === 'individual' ? billingParam : 'all';

  const { data, isLoading, isError, error, isFetching, refetch } = useCustomerGroups({
    page: table.page,
    perPage: table.pageSize,
    search,
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

  const rows = useMemo(() => data?.items ?? [], [data?.items]);
  const summary = summaryQuery.data;
  const kpi = (n: number | undefined) => (summary ? n ?? 0 : '…');

  const openCreate = () => {
    setEditGroup(null);
    form.reset({ name: '', parent_name: '', billing_mode: 'consolidated', note: '' });
    setDialogOpen(true);
  };

  const openEdit = useCallback(
    (group: CustomerGroup) => {
      setEditGroup(group);
      form.reset({ name: group.name, parent_name: group.parentName ?? '', billing_mode: group.billingMode, note: group.note ?? '' });
      setDialogOpen(true);
    },
    [form],
  );

  const onSubmit = async (values: GroupForm) => {
    try {
      if (editGroup) await m.update.mutateAsync({ id: editGroup.id, body: values });
      else await m.create.mutateAsync(values);
      setDialogOpen(false);
    } catch (err) {
      handleApiError(err, form.setError);
    }
  };

  const columns = useMemo<LegacyColumnDef<CustomerGroup, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('admin.ops.groups.colName', 'Group Name'),
        enableHiding: false,
        meta: { mobile: 'title' },
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
              <Building2 className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="text-sm font-bold text-foreground">{row.original.name}</span>
              {row.original.note && <div className="max-w-[220px] truncate text-xs font-normal text-muted-foreground">{row.original.note}</div>}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'parentName',
        header: t('admin.ops.groups.colParent', 'Parent Entity'),
        cell: ({ row }) => <span className="font-medium text-foreground">{row.original.parentName || '—'}</span>,
      },
      {
        accessorKey: 'memberCount',
        header: t('admin.ops.groups.colSubscribers', 'Subscribers'),
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => setMembersOf(row.original)}
            aria-label={t('admin.ops.groups.viewMembers', 'View {n} member lines', { n: row.original.memberCount })}
          >
            <Badge variant="secondary" className="cursor-pointer bg-muted px-2.5 py-0.5 font-mono text-xs hover:bg-muted/70">
              <Users className="mr-1 h-3 w-3 text-muted-foreground" />
              {t('admin.ops.groups.lines', '{n} lines', { n: row.original.memberCount })}
            </Badge>
          </button>
        ),
      },
      {
        accessorKey: 'billingMode',
        header: t('admin.ops.groups.colBilling', 'Billing Mode'),
        cell: ({ row }) => (
          <Badge variant="outline" tone={row.original.billingMode === 'consolidated' ? 'success' : 'info'} className="font-medium capitalize">
            {billingLabel(t, row.original.billingMode)}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">{t('admin.customers.list.colActions', 'Actions')}</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1">
            <Button size="icon" variant="ghost" className="h-7 w-7 hover:bg-primary/10 hover:text-primary" onClick={() => setMembersOf(row.original)} title={t('admin.ops.groups.members', 'Members')} aria-label={t('admin.ops.groups.members', 'Members')}>
              <Users className="h-3.5 w-3.5" />
            </Button>
            <Can menu="customer" action="update">
              <Button size="icon" variant="ghost" className="h-7 w-7 hover:bg-primary/10 hover:text-primary" onClick={() => openEdit(row.original)} title={t('admin.ops.groups.editGroup', 'Edit group')} aria-label={t('admin.ops.groups.editGroup', 'Edit group')}>
                <Edit className="h-3.5 w-3.5" />
              </Button>
            </Can>
            <Can menu="customer" action="delete">
              <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => setDeleteGroup(row.original)} title={t('admin.ops.groups.deleteGroup', 'Delete group')} aria-label={t('admin.ops.groups.deleteGroup', 'Delete group')}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </Can>
          </div>
        ),
      },
    ],
    [openEdit, t],
  );

  if (isLoading) return <PageSkeleton variant="table" rows={6} />;
  if (isError) {
    return (
      <EmptyState variant="error"
        title={t('admin.ops.groups.loadFailed', 'Failed to load customer groups')}
        description={errorMessage(error)}
        actionLabel={t('admin.customers.list.retry', 'Retry')}
        onAction={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-6 w-full pb-16">
      <PageHeader
        title={t('admin.ops.groups.title', 'Customer Groups')}
        subtitle={t('admin.ops.groups.subtitle', 'Corporate and multi-branch accounts: group customer lines under one organization.')}
        breadcrumb={[
          { label: t('admin.customers.list.breadcrumbAdmin', 'Admin'), url: '/admin/dashboard' },
          { label: t('admin.customers.list.breadcrumbCustomers', 'Customers'), url: '/admin/customers' },
          { label: t('admin.ops.groups.title', 'Customer Groups') },
        ]}
        actions={
          <Can menu="customer" action="create">
            <Button
              size="sm"
              onClick={openCreate}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs h-8 gap-1.5 shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" /> {t('admin.ops.groups.create', 'Create Group')}
            </Button>
          </Can>
        }
      />

      {/* KPI Metric Strips (backend summary) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(
          [
            { key: 'groups', label: t('admin.ops.groups.kpiGroups', 'Total Groups'), value: kpi(summary?.totalGroups), unit: t('admin.ops.groups.unitOrgs', 'organizations'), icon: Building2, tone: 'bg-primary/10 text-primary', valueTone: 'text-foreground' },
            { key: 'members', label: t('admin.ops.groups.kpiMembers', 'Total Members'), value: kpi(summary?.totalMembers), unit: t('admin.customers.expiredPage.unitSubscribers', 'subscribers'), icon: Users, tone: 'bg-blue-500/10 text-blue-500', valueTone: 'text-blue-600 dark:text-blue-400' },
            { key: 'consolidated', label: billingLabel(t, 'consolidated'), value: kpi(summary?.consolidated), unit: t('admin.ops.groups.unitSingle', 'single-bill'), icon: Receipt, tone: 'bg-emerald-500/10 text-emerald-500', valueTone: 'text-emerald-600 dark:text-emerald-400' },
            { key: 'individual', label: billingLabel(t, 'individual'), value: kpi(summary?.individual), unit: t('admin.ops.groups.unitPerMember', 'per-member bill'), icon: CreditCard, tone: 'bg-muted text-muted-foreground', valueTone: 'text-muted-foreground' },
          ] as const
        ).map((k) => (
          <Card key={k.key} className="p-4 border-border/60 bg-card/80 backdrop-blur-sm shadow-sm">
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

      <DataTable
        urlState
        className={cn(isFetching && 'opacity-80')}
        columns={columns}
        data={rows}
        getRowId={(r) => r.id}
        searchPlaceholder={t('admin.ops.groups.searchPlaceholder', 'Search by group name or parent...')}
        emptyTitle={
          search || billingFilter !== 'all'
            ? t('admin.ops.groups.emptyFiltered', 'No matching customer groups')
            : t('admin.ops.groups.emptyNone', 'No customer groups yet')
        }
        emptyDescription={t('admin.ops.groups.emptyHint', "Create a group to bundle a corporate client's lines.")}
        server={table.server(data?.meta.total ?? 0)}
        toolbarActions={
          <Select
            value={billingFilter}
            onValueChange={(v) => {
              setBillingParam(!v || v === 'all' ? '' : v);
              table.setPage(1);
            }}
            items={{
              all: t('admin.ops.groups.allBilling', 'All Billing Modes'),
              consolidated: billingLabel(t, 'consolidated'),
              individual: billingLabel(t, 'individual'),
            }}
          >
            <SelectTrigger
              className="h-9 w-[160px] border-border/60 bg-background text-xs"
              aria-label={t('admin.ops.groups.filterBilling', 'Filter by billing mode')}
            >
              <Receipt className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue placeholder={t('admin.ops.groups.allBilling', 'All Billing Modes')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('admin.ops.groups.allBilling', 'All Billing Modes')}</SelectItem>
              <SelectItem value="consolidated">{billingLabel(t, 'consolidated')}</SelectItem>
              <SelectItem value="individual">{billingLabel(t, 'individual')}</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      {/* Create / Edit Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              {editGroup ? t('admin.ops.groups.editTitle', 'Edit Customer Group') : t('admin.ops.groups.newTitle', 'New Customer Group')}
            </DialogTitle>
            <DialogDescription>
              {editGroup
                ? t('admin.ops.groups.editDesc', 'Update the organization details and billing mode.')
                : t('admin.ops.groups.newDesc', 'Define a corporate or multi-branch customer group.')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold">{t('admin.ops.groups.fieldName', 'Group / Organization Name *')}</Label>
              <Input id="name" {...form.register('name')} className="h-9 text-xs" />
              {form.formState.errors.name && <p className="text-xs text-destructive">{te(form.formState.errors.name.message ?? '')}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="parent_name" className="text-xs font-semibold">{t('admin.ops.groups.fieldParent', 'Parent Company')}</Label>
              <Input id="parent_name" {...form.register('parent_name')} className="h-9 text-xs" />
              {form.formState.errors.parent_name && <p className="text-xs text-destructive">{te(form.formState.errors.parent_name.message ?? '')}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="colBilling" className="text-xs font-semibold">{t('admin.ops.groups.colBilling', 'Billing Mode')}</Label>
              <Select
                value={form.watch('billing_mode')}
                onValueChange={(v) => form.setValue('billing_mode', v === 'individual' ? 'individual' : 'consolidated')}
                items={{ consolidated: billingLabel(t, 'consolidated', true), individual: billingLabel(t, 'individual', true) }}
              >
                <SelectTrigger id="colBilling" className="h-9 text-xs w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="consolidated">{billingLabel(t, 'consolidated', true)}</SelectItem>
                  <SelectItem value="individual">{billingLabel(t, 'individual', true)}</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.billing_mode && <p className="text-xs text-destructive">{te(form.formState.errors.billing_mode.message ?? '')}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="note" className="text-xs font-semibold">{t('admin.ops.groups.fieldNote', 'Note')}</Label>
              <Input id="note" {...form.register('note')} className="h-9 text-xs" />
              {form.formState.errors.note && <p className="text-xs text-destructive">{te(form.formState.errors.note.message ?? '')}</p>}
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setDialogOpen(false)}>
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button type="submit" size="sm" disabled={form.formState.isSubmitting} className="bg-primary text-primary-foreground">
                {form.formState.isSubmitting
                  ? t('admin.ops.groups.saving', 'Saving…')
                  : editGroup
                    ? t('admin.ops.groups.saveChanges', 'Save Changes')
                    : t('admin.ops.groups.create', 'Create Group')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteGroup !== null}
        onOpenChange={(open) => !open && setDeleteGroup(null)}
        title={t('admin.ops.groups.deleteTitle', 'Delete Customer Group')}
        description={t('admin.ops.groups.deleteDesc', 'The group is removed; its member customers stay as standalone accounts.')}
        confirmLabel={t('admin.ops.groups.deleteConfirm', 'Delete Group')}
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
  const t = useTranslations();
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
          <SheetDescription>
            {t('admin.ops.groups.memberLines', '{n} member lines', { n: members.data?.meta.total ?? group?.memberCount ?? 0 })}
          </SheetDescription>
        </SheetHeader>

        <Can menu="customer" action="update">
          <div className="space-y-2">
            <Label htmlFor="addCustomers" className="text-xs font-semibold">{t('admin.ops.groups.addCustomers', 'Add customers')}</Label>
            <Input id="addCustomers" placeholder={t('admin.ops.groups.searchCustomers', 'Search customers by name, mobile or PPPoE...')} value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} className="h-9 text-xs" />
            {debouncedCustomers && (
              <div className="rounded-lg border divide-y">
                {candidates.isLoading ? (
                  <p className="p-3 text-xs text-muted-foreground">{t('admin.ops.groups.searching', 'Searching…')}</p>
                ) : (candidates.data?.items.length ?? 0) === 0 ? (
                  <p className="p-3 text-xs text-muted-foreground">{t('admin.ops.groups.noCustomers', 'No customers found.')}</p>
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
                        <UserPlus className="h-3 w-3" /> {memberIds.has(c.id) ? t('admin.ops.groups.added', 'Added') : t('admin.ops.groups.add', 'Add')}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </Can>

        <div className="space-y-2">
          <Label htmlFor="members" className="text-xs font-semibold">{t('admin.ops.groups.members', 'Members')}</Label>
          <Input id="members" placeholder={t('admin.ops.groups.filterMembers', 'Filter members...')} value={memberSearch} onChange={(e) => { setMemberSearch(e.target.value); setPage(1); }} className="h-9 text-xs" />
          {members.isLoading ? (
            <PageSkeleton variant="table" rows={3} />
          ) : members.isError ? (
            <EmptyState
              variant="error"
              title={t('admin.ops.groups.membersLoadFailed', 'Could not load members')}
              description={errorMessage(members.error)}
              actionLabel={t('admin.customers.list.retry', 'Retry')}
              onAction={() => members.refetch()}
            />
          ) : (members.data?.items.length ?? 0) === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">{t('admin.ops.groups.noMembers', 'No members yet.')}</p>
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
                      {mem.willExpire ? ` · ${t('admin.ops.groups.expires', 'expires {date}', { date: mem.willExpire.slice(0, 10) })}` : ''}
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
                      <UserMinus className="h-3 w-3" /> {t('admin.ops.groups.remove', 'Remove')}
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
