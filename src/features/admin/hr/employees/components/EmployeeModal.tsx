'use client';

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { employeeSchema, type EmployeeFormValues } from '../schemas';
import type { EmployeeItem } from '../types';
import type { HrMeta } from '../../shared/types';
import { applyServerErrors } from '../../shared/form-errors';
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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EmployeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: EmployeeItem | null;
  meta: HrMeta;
  onSave: (data: EmployeeFormValues) => Promise<unknown>;
}

/** Backend field → form field for server-side validation errors. */
const SERVER_KEYS: Record<string, string> = {
  area_id: 'areaIds',
  nid_number: 'nidNumber',
  re_password: 'rePassword',
};

export function EmployeeModal({ open, onOpenChange, employee, meta, onSave }: EmployeeModalProps) {
  const isEdit = !!employee;
  const schema = useMemo(() => employeeSchema(isEdit), [isEdit]);
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: employee?.name ?? '',
      mobile: employee?.mobile ?? '',
      email: employee?.email ?? '',
      designation: employee?.designation ?? '',
      salary: employee?.salary !== null && employee?.salary !== undefined ? String(employee.salary) : '',
      areaIds: employee?.areaIds ?? [],
      address: employee?.address ?? '',
      nidNumber: employee?.nidNumber ?? '',
      status: employee?.status ?? 'active',
      password: '',
      rePassword: '',
    },
  });

  const selectedDesignation = watch('designation');
  const selectedStatus = watch('status');
  const selectedAreas = watch('areaIds');
  const designationItems = useMemo(
    () => Object.fromEntries(meta.designations.map((d) => [d.value, d.label])),
    [meta.designations],
  );

  const toggleArea = (id: string, checked: boolean) => {
    const next = checked ? [...selectedAreas, id] : selectedAreas.filter((a) => a !== id);
    setValue('areaIds', next, { shouldValidate: true });
  };

  const onSubmit = async (values: EmployeeFormValues) => {
    try {
      await onSave(values);
      toast.success(isEdit ? 'Employee updated successfully' : 'Employee registered successfully');
      reset();
      onOpenChange(false);
    } catch (err) {
      applyServerErrors(err, setError, SERVER_KEYS);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Employee Profile' : 'Register New Employee'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update staff information, payroll amount, and assigned areas.'
              : 'Add a new staff member with login access to the employee portal.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name *</Label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="mobile">Mobile *</Label>
              <Input id="mobile" inputMode="tel" placeholder="01XXXXXXXXX" {...register('mobile')} />
              {errors.mobile && <p className="text-destructive text-xs">{errors.mobile.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="designation">Designation *</Label>
              <Select
                items={designationItems}
                value={selectedDesignation || null}
                onValueChange={(val) => val && setValue('designation', String(val), { shouldValidate: true })}
              >
                <SelectTrigger id="designation" className="w-full">
                  <SelectValue placeholder="Select designation" />
                </SelectTrigger>
                <SelectContent>
                  {meta.designations.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.designation && <p className="text-destructive text-xs">{errors.designation.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="salary">Monthly Salary (৳)</Label>
              <Input id="salary" type="number" min={0} step="any" {...register('salary')} />
              {errors.salary && <p className="text-destructive text-xs">{errors.salary.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Service Areas *</Label>
            {meta.areas.length === 0 ? (
              <p className="text-muted-foreground rounded-lg border border-dashed border-border/60 px-3 py-2 text-xs">
                No service areas yet — create one under Areas first.
              </p>
            ) : (
              <div className="grid max-h-36 grid-cols-1 gap-1.5 overflow-y-auto rounded-lg border border-border/60 p-2.5 sm:grid-cols-2">
                {meta.areas.map((a) => (
                  <label key={a.id} className="flex cursor-pointer items-center gap-2 text-sm">
                    <Checkbox
                      checked={selectedAreas.includes(a.id)}
                      onCheckedChange={(checked) => toggleArea(a.id, checked === true)}
                    />
                    <span className="truncate">{a.name}</span>
                  </label>
                ))}
              </div>
            )}
            {errors.areaIds && <p className="text-destructive text-xs">{errors.areaIds.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address">Address *</Label>
            <Textarea id="address" rows={2} {...register('address')} />
            {errors.address && <p className="text-destructive text-xs">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address *</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nidNumber">National ID (NID)</Label>
              <Input id="nidNumber" inputMode="numeric" placeholder="10, 13 or 17 digits" {...register('nidNumber')} />
              {errors.nidNumber && <p className="text-destructive text-xs">{errors.nidNumber.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="password">{isEdit ? 'New Password' : 'Password *'}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder={isEdit ? 'Leave blank to keep' : ''}
                {...register('password')}
              />
              {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="rePassword">{isEdit ? 'Confirm New Password' : 'Confirm Password *'}</Label>
              <Input id="rePassword" type="password" autoComplete="new-password" {...register('rePassword')} />
              {errors.rePassword && <p className="text-destructive text-xs">{errors.rePassword.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5 sm:w-1/2 sm:pr-2">
            <Label htmlFor="status">Status</Label>
            <Select
              items={{ active: 'Active', inactive: 'Inactive' }}
              value={selectedStatus}
              onValueChange={(val) => val && setValue('status', val as 'active' | 'inactive')}
            >
              <SelectTrigger id="status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
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
