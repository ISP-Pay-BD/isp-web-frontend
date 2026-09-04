'use client';
import { PageHero, PageContent } from '@/components/motion/PageHero';

import { useState, useMemo } from 'react';
import { motion, type Variants } from 'framer-motion';
import { useEmployees } from '../hooks/use-employees';
import type { EmployeeItem } from '../types';
import type { EmployeeFormValues } from '../schemas';
import { PageSkeleton, EmptyState, CurrencyDisplay, ConfirmDialog } from '@/components/shared';
import { EmployeeModal } from '../components/EmployeeModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
  ShieldCheck,
  Phone,
  MapPin,
  DollarSign,
  Briefcase,
  X,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

const hoverLift = { y: -2, transition: { duration: 0.15 } };

const statStyles: Record<string, { iconBg: string; iconText: string; border: string; valueText: string }> = {
  blue: { iconBg: 'bg-blue-500/10', iconText: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/20', valueText: 'text-blue-600 dark:text-blue-400' },
  emerald: { iconBg: 'bg-emerald-500/10', iconText: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20', valueText: 'text-emerald-600 dark:text-emerald-400' },
  amber: { iconBg: 'bg-amber-500/10', iconText: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/20', valueText: 'text-amber-600 dark:text-amber-400' },
  purple: { iconBg: 'bg-purple-500/10', iconText: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/20', valueText: 'text-purple-600 dark:text-purple-400' },
};

const avatarColors = [
  'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/25',
  'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25',
  'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25',
  'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/25',
  'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/25',
  'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border-cyan-500/25',
];

const roleColors: Record<string, string> = {
  'Support Agent': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
  'Field Technician': 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
  'Network Engineer': 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
  'Accountant': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  'Sales Executive': 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
  'Office Admin': 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
};

type SortField = 'name' | 'salary' | 'joinedAt';
type SortDir = 'asc' | 'desc';

export function EmployeesPage() {
  const { employees, isLoading, isError, refetch, createEmployee, updateEmployee, deleteEmployee } = useEmployees();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeItem | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeItem | null>(null);

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

  const stats = [
    { label: 'Total Staff', value: employees.length, description: 'Registered employees', icon: Users, color: 'blue' },
    { label: 'Active On-Duty', value: activeCount, description: 'Currently active', icon: ShieldCheck, color: 'emerald' },
    { label: 'Monthly Payroll', value: <CurrencyDisplay amount={totalPayroll} className="font-bold" />, description: 'Active staff salaries', icon: DollarSign, color: 'amber' },
    { label: 'Departments', value: departmentCount, description: 'Unique roles', icon: Briefcase, color: 'purple' },
  ];

  const roles = ['Support Agent', 'Field Technician', 'Network Engineer', 'Accountant', 'Sales Executive', 'Office Admin'];

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <PageHero className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Users className="h-6 w-6" />
            </div>
            Staff & Employees
          </h1>
          <p className="text-muted-foreground text-sm mt-1.5">
            Manage organization team members, field technicians, designations, and salary structures.
          </p>
        </div>
        <motion.div whileHover={hoverLift}>
          <Button onClick={handleOpenCreate} className="bg-primary hover:bg-primary/90 font-semibold shadow-sm gap-1.5">
            <UserPlus className="h-4 w-4" /> New Employee
          </Button>
        </motion.div>
      </PageHero>
      <PageContent className="space-y-6">

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => {
          const style = statStyles[stat.color];
          return (
            <motion.div key={stat.label} variants={itemVariants} custom={idx}>
              <Card className="border-border/60 bg-card shadow-sm ring-1 ring-foreground/5 hover:shadow-md hover:border-primary/20 transition-all duration-200 overflow-hidden group">
                <CardContent className="p-4 flex items-center gap-3.5">
                  <div className={cn('p-2.5 rounded-xl border group-hover:scale-110 transition-transform duration-200', style.iconBg, style.iconText, style.border)}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className={cn('text-2xl font-bold tracking-tight', style.valueText)}>{stat.value}</div>
                    <div className="text-xs text-muted-foreground font-medium">{stat.label}</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Toolbar + Table */}
      <motion.div variants={itemVariants}>
        <Card className="border-border/60 bg-card shadow-sm ring-1 ring-foreground/5 overflow-hidden">
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
                    <TableHead className="w-12 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">#</TableHead>
                    <TableHead>
                      <button type="button" onClick={() => toggleSort('name')} className="flex items-center gap-1.5 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                        Name & Role {sortIcon('name')}
                      </button>
                    </TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Contact</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Service Area</TableHead>
                    <TableHead>
                      <button type="button" onClick={() => toggleSort('salary')} className="flex items-center gap-1.5 font-semibold text-[11px] uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                        Salary {sortIcon('salary')}
                      </button>
                    </TableHead>
                    <TableHead className="hidden md:table-cell text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Joined At</TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Status</TableHead>
                    <TableHead className="text-right text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((emp, idx) => {
                    const colorIdx = idx % avatarColors.length;
                    const roleColor = roleColors[emp.role] || 'bg-muted text-muted-foreground border-border/50';
                    return (
                      <motion.tr
                        key={emp.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.02 }}
                        className="group border-border/40 hover:bg-muted/30 transition-colors"
                      >
                        <TableCell className="text-muted-foreground font-mono text-xs">{idx + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={cn('relative flex h-9 w-9 items-center justify-center rounded-xl font-bold text-xs border group-hover:scale-110 transition-transform duration-200', avatarColors[colorIdx])}>
                              {emp.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-sm group-hover:text-primary transition-colors">{emp.name}</div>
                              <Badge variant="secondary" className={cn('text-[10px] font-medium mt-0.5 border', roleColor)}>
                                {emp.role}
                              </Badge>
                            </div>
                          </div>
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
                            <motion.div whileHover={hoverLift}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 hover:bg-primary/10 hover:text-primary"
                                onClick={() => handleOpenEdit(emp)}
                                title="Edit employee"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </Button>
                            </motion.div>
                            <motion.div whileHover={hoverLift}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                onClick={() => handleOpenDelete(emp)}
                                title="Delete employee"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </motion.div>
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
    </motion.div>
  );
}
