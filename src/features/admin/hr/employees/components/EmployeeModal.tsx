'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { employeeSchema, type EmployeeFormValues } from '../schemas';
import type { EmployeeItem } from '../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface EmployeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: EmployeeItem | null;
  onSave: (data: EmployeeFormValues) => Promise<void>;
}

export function EmployeeModal({ open, onOpenChange, employee, onSave }: EmployeeModalProps) {
  const isEdit = !!employee;
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: employee?.name ?? '',
      phone: employee?.phone ?? '',
      email: employee?.email ?? '',
      role: employee?.role ?? 'Field Technician',
      salaryBdt: employee?.salaryBdt ?? 20000,
      area: employee?.area ?? 'Uttara Sector 3',
      nid: employee?.nid ?? '',
      status: employee?.status ?? 'active',
    },
  });

  const selectedRole = watch('role');
  const selectedStatus = watch('status');

  const onSubmit = async (values: EmployeeFormValues) => {
    try {
      await onSave(values);
      toast.success(isEdit ? 'Employee updated successfully' : 'Employee registered successfully');
      reset();
      onOpenChange(false);
    } catch {
      toast.error('Failed to save employee details');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Employee Profile' : 'Register New Employee'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update staff information, payroll amount, and assigned area.'
              : 'Add new staff member to ISP Pay BD payroll and operational team.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" placeholder="e.g. Tanvir Hasan" {...register('name')} />
              {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Mobile (01XXXXXXXXX) *</Label>
              <Input id="phone" placeholder="01712345678" {...register('phone')} />
              {errors.phone && <p className="text-destructive text-xs">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="role">Designation / Role *</Label>
              <Select value={selectedRole} onValueChange={(val) => val && setValue('role', val, { shouldValidate: true })}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select designation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Support Agent">Support Agent</SelectItem>
                  <SelectItem value="Field Technician">Field Technician</SelectItem>
                  <SelectItem value="Network Engineer">Network Engineer</SelectItem>
                  <SelectItem value="Accountant">Accountant</SelectItem>
                  <SelectItem value="Sales Executive">Sales Executive</SelectItem>
                  <SelectItem value="Office Admin">Office Admin</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && <p className="text-destructive text-xs">{errors.role.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="salaryBdt">Monthly Salary (৳) *</Label>
              <Input id="salaryBdt" type="number" step="500" {...register('salaryBdt')} />
              {errors.salaryBdt && <p className="text-destructive text-xs">{errors.salaryBdt.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="area">Service Area *</Label>
              <Input id="area" placeholder="e.g. Uttara Sector 3" {...register('area')} />
              {errors.area && <p className="text-destructive text-xs">{errors.area.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <Select value={selectedStatus} onValueChange={(val) => setValue('status', val as 'active' | 'inactive')}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="staff@isppaybd.com" {...register('email')} />
              {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nid">National ID (NID)</Label>
              <Input id="nid" placeholder="10 or 17 digit NID" {...register('nid')} />
              {errors.nid && <p className="text-destructive text-xs">{errors.nid.message}</p>}
            </div>
          </div>

          <DialogFooter className="pt-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Register Staff'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
