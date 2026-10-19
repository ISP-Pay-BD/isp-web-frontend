'use client';
import { PageHero, PageContent } from '@/components/motion/PageHero';

import { useCallback, useMemo, useState } from 'react';
import type { LegacyColumnDef } from '@tanstack/react-table/legacy';
import { useEmployees, useEmployeeMutations, useEmployeeSummary } from '../hooks/use-employees';
import type { EmployeeItem, EmployeeListParams } from '../types';
import type { EmployeeFormValues } from '../schemas';
import { useHrMeta } from '../../shared/use-hr-meta';
import { datePart, initials } from '../../shared/format';
import { PageSkeleton, EmptyState, CurrencyDisplay, ConfirmDialog, StatusBadge } from '@/components/shared';
import { DataTable } from '@/features/shared/data-table';
import { useServerTable } from '@/features/admin/routers/hooks/useServerTable';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants/status';
import { OpsSummaryStrip } from '@/components/shared/OpsSummaryStrip';
import { EmployeeModal } from '../components/EmployeeModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslations } from '@/i18n/locale-context';
import { UserPlus, Edit2, Trash2, Phone, MapPin, Eye } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

type SortField = EmployeeListParams['sort'];
type SortDir = EmployeeListParams['dir'];

export function EmployeesPage() {
  const t = useTranslations();
  const table = useServerTable(DEFAULT_PAGE_SIZE);
  const SORT_OPTIONS: Record<string, string> = {
    'name:asc': t('admin.hr.employees.sortNameAsc', 'Name A–Z'),
    'name:desc': t('admin.hr.employees.sortNameDesc', 'Name Z–A'),
    'salary:desc': t('admin.hr.employees.sortSalaryDesc', 'Salary: high to low'),
    'salary:asc': t('admin.hr.employees.sortSalaryAsc', 'Salary: low to high'),
    'created_at:desc': t('admin.hr.employees.sortNewest', 'Newest joined'),
    'created_at:asc': t('admin.hr.employees.sortOldest', 'Oldest joined'),
  };
  const STATUS_ITEMS = {
    all: t('admin.hr.employees.allStatus', 'All Status'),
    active: t('status.active', 'Active'),
    inactive: t('status.inactive', 'Inactive'),
  };
  const { search, resetPage } = table;
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeItem | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeItem | null>(null);

  const list = useEmployees({
    page: table.page,
    perPage: table.pageSize,
    search,
    designation: roleFilter,
    status: statusFilter,
    sort: sortField,
    dir: sortDir,
  });
  const summary = useEmployeeSummary();
  const meta = useHrMeta();
  const { create, update, remove } = useEmployeeMutations();

  const employees = list.data?.items ?? [];
  const total = list.data?.meta.total ?? 0;
  const designations = meta.data?.designations ?? [];
  const designationItems = Object.fromEntries([['all', t('admin.hr.employees.allRoles', 'All Roles')], ...designations.map((d) => [d.value, d.label])]);

  const handleOpenCreate = () => { setSelectedEmployee(null); setModalOpen(true); };
  const handleOpenEdit = useCallback((emp: EmployeeItem) => { setSelectedEmployee(emp); setModalOpen(true); }, []);
  const handleOpenDelete = useCallback((emp: EmployeeItem) => { setEmployeeToDelete(emp); setDeleteConfirmOpen(true); }, []);

  const columns = useMemo<LegacyColumnDef<EmployeeItem, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: t('admin.hr.employees.colName', 'Name & Designation'),
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const emp = row.original;
          return (
            <Link href={`/admin/hr/employees/${emp.id}`} className="flex items-center gap-3 group/item">
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-semibold text-xs border border-border/60 bg-muted/50 text-muted-foreground group-hover/item:border-primary/50 group-hover/item:text-primary transition-colors">
                {initials(emp.name)}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm group-hover/item:text-primary transition-colors">{emp.name}</div>
                {emp.designationLabel ? (
                  <Badge variant="secondary" className="text-xs font-medium mt-0.5 border border-border/50 bg-muted/40 text-muted-foreground">
                    {emp.designationLabel}
                  </Badge>
                ) : null}
              </div>
            </Link>
          );
        },
      },
      {
        accessorKey: 'mobile',
        header: t('admin.hr.employees.colContact', 'Contact'),
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="font-mono text-xs">{row.original.mobile || '—'}</span>
          </div>
        ),
      },
      {
        accessorKey: 'areaLabel',
        header: t('admin.hr.employees.colArea', 'Service Area'),
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span className="text-xs">{row.original.areaLabel || '—'}</span>
          </div>
        ),
      },
      {
        accessorKey: 'salary',
        header: t('admin.hr.employees.colSalary', 'Salary'),
        enableSorting: false,
        cell: ({ row }) => (
          <span className="font-mono font-bold text-sm">
            {row.original.salary !== null ? <CurrencyDisplay amount={row.original.salary} /> : '—'}
          </span>
        ),
      },
      {
        accessorKey: 'joinedAt',
        header: t('admin.hr.employees.colJoined', 'Joined At'),
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-muted-foreground text-xs font-mono">{datePart(row.original.joinedAt) || '—'}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: t('common.status', 'Status'),
        enableSorting: false,
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: 'actions',
        header: () => <span className="sr-only">{t('common.actions', 'Actions')}</span>,
        enableHiding: false,
        cell: ({ row }) => {
          const emp = row.original;
          return (
            <div className="flex items-center justify-end gap-0.5">
              <Button variant="ghost" size="icon" title={t('admin.hr.employees.viewActivity', 'View activity & profile')} aria-label={t('admin.hr.employees.viewEmployee', 'View {name}', { name: emp.name })} className="hover:bg-primary/10 hover:text-primary" render={<Link href={`/admin/hr/employees/${emp.id}`} />}>
                <Eye className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-primary/10 hover:text-primary"
                onClick={() => handleOpenEdit(emp)}
                title={t('admin.hr.employees.editEmployee', 'Edit employee')}
                aria-label={t('admin.hr.employees.editNamed', 'Edit {name}', { name: emp.name })}
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => handleOpenDelete(emp)}
                title={t('admin.hr.employees.deleteEmployee', 'Delete employee')}
                aria-label={t('admin.hr.employees.deleteNamed', 'Delete {name}', { name: emp.name })}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          );
        },
      },
    ],
    [handleOpenEdit, handleOpenDelete, t],
  );

  const handleConfirmDelete = () => {
    if (!employeeToDelete) return;
    // Failures are toasted by the global mutation handler.
    remove.mutate(employeeToDelete.id, {
      onSuccess: () => {
        toast.success(t('admin.hr.employees.deleted', 'Employee {name} deleted', { name: employeeToDelete.name }));
        setDeleteConfirmOpen(false);
      },
    });
  };

  const handleSaveEmployee = (values: EmployeeFormValues) =>
    selectedEmployee ? update.mutateAsync({ id: selectedEmployee.id, values }) : create.mutateAsync(values);

  if (list.isLoading) return <PageSkeleton variant="table" rows={8} />;
  if (list.isError) {
    return (
      <div className="p-6">
        <EmptyState variant="error" title={t('admin.hr.employees.loadFailed', 'Failed to load staff list')} description={list.error?.message ?? t('admin.hr.employees.loadFailedHint', 'There was an error communicating with the staff registry.')} actionLabel={t('common.retry', 'Retry')} onAction={() => list.refetch()} />
      </div>
    );
  }

  const hasFilters = !!search || roleFilter !== 'all' || statusFilter !== 'all';

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHero className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{t('admin.hr.employees.title', 'Staff & Employees')}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {t('admin.hr.employees.subtitle', 'Manage organization team members, field technicians, designations, and salary structures.')}
          </p>
        </div>
        <div>
          <Button onClick={handleOpenCreate} disabled={!meta.data} className="gap-1.5 bg-primary font-semibold shadow-sm hover:bg-primary/90">
            <UserPlus className="h-4 w-4" /> {t('admin.hr.employees.newEmployee', 'New Employee')}
          </Button>
        </div>
      </PageHero>
      <PageContent className="space-y-6 pb-16">

      <OpsSummaryStrip
        items={[
          { value: summary.data?.total ?? '—', label: t('admin.hr.employees.kpiStaff', 'staff') },
          { value: summary.data?.active ?? '—', label: t('admin.hr.employees.kpiActive', 'active') },
          { value: summary.data?.designationCount ?? '—', label: t('admin.hr.employees.kpiRoles', 'roles') },
          {
            value: summary.data ? <CurrencyDisplay amount={summary.data.activePayroll} className="inline font-semibold" /> : '—',
            label: t('admin.hr.employees.kpiPayroll', 'payroll'),
          },
        ]}
      />

      <DataTable
        urlState
        columns={columns}
        data={employees}
        getRowId={(row) => row.id}
        searchPlaceholder={t('admin.hr.employees.searchPlaceholder', 'Search by name, mobile, or email...')}
        emptyTitle={hasFilters ? t('admin.hr.employees.emptyFiltered', 'No employees found') : t('admin.hr.employees.emptyNone', 'No employees yet')}
        emptyDescription={hasFilters ? t('admin.hr.employees.emptyFilteredHint', 'Try adjusting your search or filters.') : t('admin.hr.employees.emptyNoneHint', 'Add your first employee to get started.')}
        server={table.server(total)}
        toolbarActions={
          <>
            <Select
              items={designationItems}
              value={roleFilter}
              onValueChange={(v) => {
                setRoleFilter(v ?? 'all');
                resetPage();
              }}
            >
              <SelectTrigger className="w-[180px] h-9 text-xs border-border/60" aria-label={t('admin.hr.employees.filterRole', 'Filter by role')}>
                <SelectValue placeholder={t('admin.hr.employees.allRoles', 'All Roles')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.hr.employees.allRoles', 'All Roles')}</SelectItem>
                {designations.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select
              items={STATUS_ITEMS}
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v ?? 'all');
                resetPage();
              }}
            >
              <SelectTrigger className="w-[150px] h-9 text-xs border-border/60" aria-label={t('admin.hr.employees.filterStatus', 'Filter by status')}>
                <SelectValue placeholder={t('admin.hr.employees.allStatus', 'All Status')} />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_ITEMS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select
              items={SORT_OPTIONS}
              value={`${sortField}:${sortDir}`}
              onValueChange={(v) => {
                const [field, dir] = String(v).split(':');
                setSortField(field as SortField);
                setSortDir(dir as SortDir);
                resetPage();
              }}
            >
              <SelectTrigger className="w-[200px] h-9 text-xs border-border/60" aria-label={t('admin.hr.employees.sortLabel', 'Sort employees')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SORT_OPTIONS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
              </SelectContent>
            </Select>
          </>
        }
      />

      </PageContent>

      {modalOpen && meta.data && (
        <EmployeeModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          employee={selectedEmployee}
          meta={meta.data}
          onSave={handleSaveEmployee}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title={t('admin.hr.employees.deleteTitle', 'Delete Employee Record')}
        description={t('admin.hr.employees.deleteDesc', 'Are you sure you want to delete {name}? This action cannot be undone.', { name: employeeToDelete?.name ?? '' })}
        confirmLabel={t('common.delete', 'Delete')}
        destructive
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
