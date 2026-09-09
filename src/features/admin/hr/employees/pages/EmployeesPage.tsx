'use client';
import { PageHero, PageContent } from '@/components/motion/PageHero';

import { useState, useMemo, useEffect } from 'react';
import { useEmployees } from '../hooks/use-employees';
import type { EmployeeItem } from '../types';
import type { EmployeeFormValues } from '../schemas';
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

type SortField = 'name' | 'salary' | 'joinedAt';
type SortDir = 'asc' | 'desc';

export function EmployeesPage() {
  const { employees, isLoading, isError, refetch, createEmployee, updateEmployee, deleteEmployee } = useEmployees();
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

  const filteredEmployees = useMemo(() => {
    let result = employees.filter((emp) => {
      const matchesSearch =
        emp.name.toLowerCase().includes(search.toLowerCase()) ||
        emp.phone.includes(search) ||
        (emp.role && emp.role.toLowerCase().includes(search.toLowerCase()));
      const matchesRole = roleFilter === 'all' || emp.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });

    result = [...result].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') comparison = a.name.localeCompare(b.name);
      else if (sortField === 'salary') comparison = (a.salaryBdt || 0) - (b.salaryBdt || 0);
      else if (sortField === 'joinedAt') comparison = a.joinedAt.localeCompare(b.joinedAt);
      return sortDir === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [employees, search, roleFilter, statusFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / pageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedEmployees = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredEmployees.slice(start, start + pageSize);
  }, [filteredEmployees, safeCurrentPage, pageSize]);

  const totalPayroll = useMemo(
    () => employees.filter((e) => e.status === 'active').reduce((sum, e) => sum + (e.salaryBdt || 0), 0),
    [employees]
  );

  const activeCount = useMemo(() => employees.filter((e) => e.status === 'active').length, [employees]);
  const departmentCount = useMemo(() => new Set(employees.map((e) => e.role)).size, [employees]);

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

  const handleConfirmDelete = async () => {
    if (!employeeToDelete) return;
    try {
      await deleteEmployee(employeeToDelete.id);
      toast.success(`Employee ${employeeToDelete.name} deleted`);
      setDeleteConfirmOpen(false);
    } catch { toast.error('Failed to delete employee'); }
  };

  const handleSaveEmployee = async (values: EmployeeFormValues) => {
    if (selectedEmployee) await updateEmployee({ id: selectedEmployee.id, data: values });
    else await createEmployee(values);
  };

  if (isLoading) return <PageSkeleton variant="table" rows={8} />;
  if (isError) {
    return (
      <div className="p-6">
        <EmptyState title="Failed to load staff list" description="There was an error communicating with the staff registry." actionLabel="Retry" onAction={() => refetch()} />
      </div>
    );
  }

  const roles = ['Support Agent', 'Field Technician', 'Network Engineer', 'Accountant', 'Sales Executive', 'Office Admin'];

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
          <Button onClick={handleOpenCreate} className="gap-1.5 bg-primary font-semibold shadow-sm hover:bg-primary/90">
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
          { value: employees.length, label: 'staff' },
          { value: activeCount, label: 'active' },
          { value: departmentCount, label: 'roles' },
          {
            value: <CurrencyDisplay amount={totalPayroll} className="inline font-semibold" />,
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
                  placeholder="Search by name, phone, or role..."
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
                <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v ?? 'all')}>
                  <SelectTrigger className="w-[160px] h-9 text-xs border-border/60">
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {roles.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'all')}>
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
                      'flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-all duration-150',
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
                      'flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-all duration-150',
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
                  {filteredEmployees.length} result{filteredEmployees.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>
          </div>

          {filteredEmployees.length === 0 ? (
            <div className="py-16">
              <EmptyState
                icon={<Users className="h-10 w-10" />}
                title={search || roleFilter !== 'all' || statusFilter !== 'all' ? 'No employees found' : 'No employees yet'}
                description={search || roleFilter !== 'all' || statusFilter !== 'all' ? 'Try adjusting your search or filters.' : 'Add your first employee to get started.'}
                actionLabel="New Employee"
                onAction={handleOpenCreate}
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
                        Name & Role {sortIcon('name')}
                      </button>
                    </TableHead>
                    <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground">Contact</TableHead>
                    <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground">Service Area</TableHead>
                    <TableHead>
                      <button type="button" onClick={() => toggleSort('salary')} className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-muted-foreground hover:text-foreground transition-colors">
                        Salary {sortIcon('salary')}
                      </button>
                    </TableHead>
                    <TableHead className="hidden md:table-cell text-[11px] font-medium tracking-wide text-muted-foreground">Joined At</TableHead>
                    <TableHead className="text-[11px] font-medium tracking-wide text-muted-foreground">Status</TableHead>
                    <TableHead className="text-right text-[11px] font-medium tracking-wide text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedEmployees.map((emp, idx) => {
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
                              {emp.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-sm group-hover/item:text-primary transition-colors">{emp.name}</div>
                              <Badge variant="secondary" className="text-[10px] font-medium mt-0.5 border border-border/50 bg-muted/40 text-muted-foreground">
                                {emp.role}
                              </Badge>
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Phone className="h-3.5 w-3.5" />
                            <span className="font-mono text-xs">{emp.phone}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="text-xs">{emp.area ?? 'Central'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono font-bold text-sm">
                            <CurrencyDisplay amount={emp.salaryBdt} />
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground text-xs font-mono">{emp.joinedAt}</TableCell>
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
            totalItems={filteredEmployees.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[10, 20, 50, 100]}
          />
        </Card>
      </div>

      </PageContent>

      {modalOpen && (
        <EmployeeModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          employee={selectedEmployee}
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
