'use client';

import { useState, useMemo } from 'react';
import { useEmployees } from '../hooks/use-employees';
import type { EmployeeItem } from '../types';
import type { EmployeeFormValues } from '../schemas';
import { PageSkeleton, EmptyState, StatCard, StatusBadge, CurrencyDisplay, ConfirmDialog, Can } from '@/components/shared';
import { EmployeeModal } from '../components/EmployeeModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Users, UserPlus, Search, Edit2, Trash2, ShieldCheck, Phone, MapPin, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export function EmployeesPage() {
  const { employees, isLoading, isError, refetch, createEmployee, updateEmployee, deleteEmployee } = useEmployees();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeItem | null>(null);

  // Delete confirm states
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeItem | null>(null);

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        emp.name.toLowerCase().includes(search.toLowerCase()) ||
        emp.phone.includes(search) ||
        (emp.role && emp.role.toLowerCase().includes(search.toLowerCase()));
      const matchesRole = roleFilter === 'all' || emp.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [employees, search, roleFilter, statusFilter]);

  const totalPayroll = useMemo(() => {
    return employees
      .filter((e) => e.status === 'active')
      .reduce((sum, e) => sum + (e.salaryBdt || 0), 0);
  }, [employees]);

  const handleOpenCreate = () => {
    setSelectedEmployee(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (emp: EmployeeItem) => {
    setSelectedEmployee(emp);
    setModalOpen(true);
  };

  const handleOpenDelete = (emp: EmployeeItem) => {
    setEmployeeToDelete(emp);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!employeeToDelete) return;
    try {
      await deleteEmployee(employeeToDelete.id);
      toast.success(`Employee ${employeeToDelete.name} deleted`);
      setDeleteConfirmOpen(false);
    } catch {
      toast.error('Failed to delete employee');
    }
  };

  const handleSaveEmployee = async (values: EmployeeFormValues) => {
    if (selectedEmployee) {
      await updateEmployee({ id: selectedEmployee.id, data: values });
    } else {
      await createEmployee(values);
    }
  };

  if (isLoading) {
    return <PageSkeleton rows={8} />;
  }

  if (isError) {
    return (
      <div className="p-6">
        <EmptyState
          title="Failed to load staff list"
          description="There was an error communicating with the staff registry."
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Staff & Employees</h1>
          <p className="text-muted-foreground text-sm">
            Manage organization team members, field technicians, designations, and salary structures.
          </p>
        </div>
        <Can menu="employee" action="create">
          <Button onClick={handleOpenCreate} className="bg-primary hover:bg-primary/90">
            <UserPlus className="mr-2 h-4 w-4" />
            New Employee
          </Button>
        </Can>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Staff"
          value={employees.length}
          description="Registered employees"
          icon={Users}
        />
        <StatCard
          title="Active On-Duty"
          value={employees.filter((e) => e.status === 'active').length}
          description="Currently active"
          icon={ShieldCheck}
        />
        <StatCard
          title="Monthly Payroll"
          value={<CurrencyDisplay amount={totalPayroll} />}
          description="Active staff salaries"
          icon={DollarSign}
        />
        <StatCard
          title="Departments"
          value={new Set(employees.map((e) => e.role)).size}
          description="Unique roles"
          icon={Users}
        />
      </div>

      {/* Filter Toolbar */}
      <div className="bg-card flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            placeholder="Search by name, phone, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v ?? 'all')}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="Support Agent">Support Agent</SelectItem>
              <SelectItem value="Field Technician">Field Technician</SelectItem>
              <SelectItem value="Network Engineer">Network Engineer</SelectItem>
              <SelectItem value="Accountant">Accountant</SelectItem>
              <SelectItem value="Sales Executive">Sales Executive</SelectItem>
              <SelectItem value="Office Admin">Office Admin</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? 'all')}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table & Content */}
      {filteredEmployees.length === 0 ? (
        <EmptyState
          icon={<Users className="h-10 w-10" />}
          title="No employees found"
          description={
            search || roleFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your search criteria or filter conditions.'
              : 'Add your first employee to get started with team management.'
          }
          actionLabel="Register Employee"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="bg-card rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Name & Role</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Service Area</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Joined At</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((emp, idx) => (
                <TableRow key={emp.id}>
                  <TableCell className="text-muted-foreground font-mono text-xs">{idx + 1}</TableCell>
                  <TableCell>
                    <div className="font-medium">{emp.name}</div>
                    <div className="text-muted-foreground text-xs">{emp.role}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-sm">
                      <Phone className="text-muted-foreground h-3.5 w-3.5" />
                      <span>{emp.phone}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="text-muted-foreground h-3.5 w-3.5" />
                      <span>{emp.area ?? 'Central'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <CurrencyDisplay amount={emp.salaryBdt} className="font-semibold" />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">{emp.joinedAt}</TableCell>
                  <TableCell>
                    <StatusBadge status={emp.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Can menu="employee" action="update">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(emp)}
                          title="Edit employee"
                        >
                          <Edit2 className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                      </Can>
                      <Can menu="employee" action="delete">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleOpenDelete(emp)}
                          title="Delete employee"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </Can>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Employee Create / Edit Modal */}
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
