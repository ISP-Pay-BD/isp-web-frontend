'use client';
import { PageHero, PageContent } from '@/components/motion/PageHero';

import { useState, useEffect } from 'react';
import { useEmployees, useEmployeeMutations, useEmployeeSummary } from '../hooks/use-employees';
import type { EmployeeItem, EmployeeListParams } from '../types';
import type { EmployeeFormValues } from '../schemas';
import { useHrMeta } from '../../shared/use-hr-meta';
import { useDebouncedValue } from '../../shared/use-debounced-value';
import { datePart, initials } from '../../shared/format';
import { PageSkeleton, EmptyState, CurrencyDisplay, ConfirmDialog, TablePagination } from '@/components/shared';
import { DEFAULT_PAGE_SIZE } from '@/lib/constants/status';
import { useThemeCustomizerStore } from '@/stores/theme-store';
import { OpsSummaryStrip } from '@/components/shared/OpsSummaryStrip';
import { cn } from '@/lib/utils';
import { EmployeeModal } from '../components/EmployeeModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  UserPlus,
  Search,
  Edit2,
  Trash2,
  Phone,
  MapPin,
  X,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Eye,
  AlignJustify,
  AlignCenter,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

type SortField = EmployeeListParams['sort'];
type SortDir = EmployeeListParams['dir'];

export function EmployeesPage() {
  const globalTableLayout = useThemeCustomizerStore((s) => s.tableLayout);
  const setGlobalTableLayout = useThemeCustomizerStore((s) => s.setTableLayout);
  const [layoutMode, setLayoutMode] = useState<'full' | 'centered'>(globalTableLayout ?? 'full');

  useEffect(() => {
    if (globalTableLayout) {
      setLayoutMode(globalTableLayout);
    }
  }, [globalTableLayout]);

  const toggleLayoutMode = (mode: 'full' | 'centered') => {
    setLayoutMode(mode);
    setGlobalTableLayout(mode);
  };

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim());
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeItem | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);

  // Any filter change goes back to page 1.
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, roleFilter, statusFilter, sortField, sortDir, pageSize]);

  const list = useEmployees({
    page: currentPage,
    perPage: pageSize,
    search: debouncedSearch,
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
  const designationItems = Object.fromEntries([['all', 'All Roles'], ...designations.map((d) => [d.value, d.label])]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((p) => (p === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
  };

  const sortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 opacity-40" />;
    return sortDir === 'asc' ? <ChevronUp className="h-3 w-3 text-primary" /> : <ChevronDown className="h-3 w-3 text-primary" />;
  };

  const handleOpenCreate = () => { setSelectedEmployee(null); setModalOpen(true); };
  const handleOpenEdit = (emp: EmployeeItem) => { setSelectedEmployee(emp); setModalOpen(true); };
  const handleOpenDelete = (emp: EmployeeItem) => { setEmployeeToDelete(emp); setDeleteConfirmOpen(true); };

  const handleConfirmDelete = () => {
    if (!employeeToDelete) return;
    // Failures are toasted by the global mutation handler.
    remove.mutate(employeeToDelete.id, {
      onSuccess: () => {
        toast.success(`Employee ${employeeToDelete.name} deleted`);
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
        <EmptyState title="Failed to load staff list" description={list.error?.message ?? 'There was an error communicating with the staff registry.'} actionLabel="Retry" onAction={() => list.refetch()} />
      </div>
    );
  }

  const hasFilters = !!debouncedSearch || roleFilter !== 'all' || statusFilter !== 'all';
  const safeCurrentPage = list.data?.meta.page ?? currentPage;

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHero className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Staff & Employees</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Manage organization team members, field technicians, designations, and salary structures.
          </p>
        </div>
        <div>
          <Button onClick={handleOpenCreate} disabled={!meta.data} className="gap-1.5 bg-primary font-semibold shadow-sm hover:bg-primary/90">
            <UserPlus className="h-4 w-4" /> New Employee
          </Button>
        </div>
      </PageHero>
      <PageContent
        className={cn(
          'space-y-6 pb-16 transition-all duration-200',
          layoutMode === 'centered' ? 'max-w-6xl mx-auto' : 'w-full'
        )}
      >

      <OpsSummaryStrip
        items={[
          { value: summary.data?.total ?? '—', label: 'staff' },
          { value: summary.data?.active ?? '—', label: 'active' },
          { value: summary.data?.designationCount ?? '—', label: 'roles' },
          {
            value: summary.data ? <CurrencyDisplay amount={summary.data.activePayroll} className="inline font-semibold" /> : '—',
            label: 'payroll',
          },
        ]}
      />

      {/* Toolbar + Table */}
      <div>
        <Card className="border-border/60 bg-card shadow-sm ring-1 ring-border/60 overflow-hidden">
          <div className="p-4 border-b border-border/50">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 min-w-[200px] sm:min-w-[300px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, mobile, or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 h-9 bg-background border-border/60 text-sm shadow-sm"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Select items={designationItems} value={roleFilter} onValueChange={(v) => setRoleFilter(v ?? 'all')}>
                  <SelectTrigger className="w-[160px] h-9 text-xs border-border/60">
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {designations.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select items={{ all: 'All Status', active: 'Active', inactive: 'Inactive' }} value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'all')}>
                  <SelectTrigger className="w-[130px] h-9 text-xs border-border/60">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                {/* Table Layout Toggle */}
                <div className="flex items-center rounded-lg border border-border/70 bg-muted/40 p-0.5">
                  <button
                    type="button"
                    onClick={() => toggleLayoutMode('full')}
                    className={cn(
                      'flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition duration-150',
                      layoutMode === 'full'
                        ? 'bg-background text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                    title="Full width layout"
                  >
                    <AlignJustify className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Full</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleLayoutMode('centered')}
                    className={cn(
                      'flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition duration-150',
                      layoutMode === 'centered'
                        ? 'bg-background text-foreground shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                    title="Centered container layout"
                  >
                    <AlignCenter className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Center</span>
                  </button>
                </div>

                <Badge variant="secondary" className="font-mono text-xs px-2.5 py-1">
                  {total} result{total !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>
          </div>

          {employees.length === 0 ? (
            <div className="py-16">
              <EmptyState
                icon={<Users className="h-10 w-10" />}
                title={hasFilters ? 'No employees found' : 'No employees yet'}
                description={hasFilters ? 'Try adjusting your search or filters.' : 'Add your first employee to get started.'}
                actionLabel={meta.data ? 'New Employee' : undefined}
                onAction={meta.data ? handleOpenCreate : undefined}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/50">
                    <TableHead className="w-12 text-[11px] font-medium tracking-wide text-muted-foreground">#</TableHead>
                    <TableHead>
                      <button type="button" onClick={() => toggleSort('name')} className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-muted-foreground hover:text-foreground transition-colors">
                        Name & Designation {sortIcon('name')}
                      </button>
                    </TableHead>
                    <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground">Contact</TableHead>
                    <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground">Service Area</TableHead>
                    <TableHead>
                      <button type="button" onClick={() => toggleSort('salary')} className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-muted-foreground hover:text-foreground transition-colors">
                        Salary {sortIcon('salary')}
                      </button>
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      <button type="button" onClick={() => toggleSort('created_at')} className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-muted-foreground hover:text-foreground transition-colors">
                        Joined At {sortIcon('created_at')}
                      </button>
                    </TableHead>
                    <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground">Status</TableHead>
                    <TableHead className="text-right text-[11px] font-medium tracking-wide text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((emp, idx) => {
                    const globalIdx = (safeCurrentPage - 1) * pageSize + idx + 1;
                    return (
                      <tr
                        key={emp.id}
                        className="group border-border/40 hover:bg-muted/30 transition-colors"
                      >
                        <TableCell className="text-muted-foreground font-mono text-xs">{globalIdx}</TableCell>
                        <TableCell>
                          <Link href={`/admin/hr/employees/${emp.id}`} className="flex items-center gap-3 group/item">
                            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl font-semibold text-xs border border-border/60 bg-muted/50 text-muted-foreground group-hover/item:border-primary/50 group-hover/item:text-primary transition-colors">
                              {initials(emp.name)}
                            </div>
                            <div>
                              <div className="font-semibold text-sm group-hover/item:text-primary transition-colors">{emp.name}</div>
                              {emp.designationLabel ? (
                                <Badge variant="secondary" className="text-[10px] font-medium mt-0.5 border border-border/50 bg-muted/40 text-muted-foreground">
                                  {emp.designationLabel}
                                </Badge>
                              ) : null}
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Phone className="h-3.5 w-3.5" />
                            <span className="font-mono text-xs">{emp.mobile || '—'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="text-xs">{emp.areaLabel || '—'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono font-bold text-sm">
                            {emp.salary !== null ? <CurrencyDisplay amount={emp.salary} /> : '—'}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground text-xs font-mono">{datePart(emp.joinedAt) || '—'}</TableCell>
                        <TableCell>
                          {emp.status === 'active' ? (
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs font-medium gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20 text-xs font-medium gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-500 inline-block" />
                              Inactive
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-0.5">
                            <Link href={`/admin/hr/employees/${emp.id}`}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 hover:bg-primary/10 hover:text-primary"
                                title="View activity & profile"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                            </Link>
                            <div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 hover:bg-primary/10 hover:text-primary"
                                onClick={() => handleOpenEdit(emp)}
                                title="Edit employee"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                            <div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                onClick={() => handleOpenDelete(emp)}
                                title="Delete employee"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                      </tr>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Global Pagination Controls */}
          <TablePagination
            currentPage={safeCurrentPage}
            pageSize={pageSize}
            totalItems={total}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[10, 20, 50, 100]}
          />
        </Card>
      </div>

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
        title="Delete Employee Record"
        description={`Are you sure you want to delete ${employeeToDelete?.name}? This action cannot be undone.`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
