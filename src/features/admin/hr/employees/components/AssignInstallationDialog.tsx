'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Search, UserRound, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { applyServerErrors } from '../../shared/form-errors';
import { fromLocalInput } from '../../shared/format';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useLocale } from '@/i18n/locale-context';
import { useInstallationCustomers, useInstallationMutations } from '../hooks/use-installations';
import type { CustomerOption } from '../types';

const coordinate = (min: number, max: number) =>
  z
    .string()
    .trim()
    .refine((v) => v === '' || (Number.isFinite(Number(v)) && Number(v) >= min && Number(v) <= max), 'Invalid coordinate');

const schema = z
  .object({
    title: z.string().trim().min(2, 'Enter a job title').max(191, 'Title is too long'),
    address: z.string().trim().min(2, 'Enter the installation address').max(500, 'Address is too long'),
    scheduledAt: z.string(),
    latitude: coordinate(-90, 90),
    longitude: coordinate(-180, 180),
    notes: z.string().max(1000, 'Notes are too long'),
  })
  .refine((v) => (v.latitude === '') === (v.longitude === ''), {
    path: ['longitude'],
    message: 'Enter both latitude and longitude',
  });

type FormValues = z.infer<typeof schema>;

interface AssignInstallationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employeeId: string;
  employeeName: string;
}

/** Create an installation work order already assigned to this employee. */
export function AssignInstallationDialog({ open, onOpenChange, employeeId, employeeName }: AssignInstallationDialogProps) {
  const { t, te } = useLocale();
  const { create } = useInstallationMutations();
  const [customer, setCustomer] = useState<CustomerOption | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const debouncedSearch = useDebouncedValue(customerSearch.trim());
  const customers = useInstallationCustomers(debouncedSearch, open && !customer && debouncedSearch.length >= 2);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', address: '', scheduledAt: '', latitude: '', longitude: '', notes: '' },
  });

  const pickCustomer = (c: CustomerOption) => {
    setCustomer(c);
    setCustomerSearch('');
    if (c.address) setValue('address', c.address, { shouldValidate: true });
  };

  const onSubmit = async (values: FormValues) => {
    try {
      await create.mutateAsync({
        title: values.title,
        address: values.address,
        notes: values.notes,
        scheduledAt: values.scheduledAt ? fromLocalInput(values.scheduledAt) : undefined,
        latitude: values.latitude,
        longitude: values.longitude,
        customerId: customer?.id,
        assignedEmployeeId: employeeId,
      });
      toast.success(t('admin.hr.assignInstall.assigned', 'Installation assigned to {name}', { name: employeeName }));
      reset();
      setCustomer(null);
      onOpenChange(false);
    } catch (err) {
      applyServerErrors(
        err,
        setError,
        { scheduled_at: 'scheduledAt', customer_id: 'title', assigned_employee_id: 'title' },
        t('admin.hr.common.wentWrong', 'Something went wrong. Please try again.'),
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('admin.hr.assignInstall.title', 'Assign Installation')}</DialogTitle>
          <DialogDescription>
            {t('admin.hr.assignInstall.desc', 'Create a field work order for {name}. They start and complete it with GPS from the employee portal.', { name: employeeName })}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="inst-title">{t('admin.hr.assignInstall.jobTitle', 'Job Title *')}</Label>
            <Input id="inst-title" {...register('title')} />
            {errors.title && <p className="text-destructive text-xs">{te(errors.title.message ?? '')}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="inst-customer">{t('admin.hr.assignInstall.customer', 'Customer')}</Label>
            {customer ? (
              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm">
                <span className="flex items-center gap-2">
                  <UserRound className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{customer.name || `#${customer.id}`}</span>
                  {customer.mobile ? <span className="font-mono text-xs text-muted-foreground">{customer.mobile}</span> : null}
                </span>
                <button type="button" onClick={() => setCustomer(null)} aria-label={t('admin.hr.assignInstall.removeCustomer', 'Remove customer')} className="text-muted-foreground hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="inst-customer"
                    className="pl-9"
                    placeholder={t('admin.hr.assignInstall.searchCustomer', 'Search customer by name, mobile or ID (optional)')}
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                  />
                </div>
                {debouncedSearch.length >= 2 ? (
                  <div className="max-h-40 overflow-y-auto rounded-lg border border-border/60">
                    {customers.isFetching && !customers.data ? (
                      <p className="px-3 py-2 text-xs text-muted-foreground">{t('admin.hr.assignInstall.searching', 'Searching…')}</p>
                    ) : customers.isError ? (
                      <p className="px-3 py-2 text-xs text-destructive">{customers.error.message}</p>
                    ) : (customers.data ?? []).length === 0 ? (
                      <p className="px-3 py-2 text-xs text-muted-foreground">{t('admin.hr.assignInstall.noCustomers', 'No matching customers.')}</p>
                    ) : (
                      (customers.data ?? []).map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => pickCustomer(c)}
                          className={cn('flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted/50')}
                        >
                          <span className="font-medium">{c.name || `#${c.id}`}</span>
                          <span className="font-mono text-xs text-muted-foreground">{c.mobile}</span>
                        </button>
                      ))
                    )}
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="inst-address">{t('admin.hr.assignInstall.address', 'Address *')}</Label>
            <Textarea id="inst-address" rows={2} {...register('address')} />
            {errors.address && <p className="text-destructive text-xs">{te(errors.address.message ?? '')}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-1.5 sm:col-span-1">
              <Label htmlFor="inst-when">{t('admin.hr.assignInstall.scheduled', 'Scheduled')}</Label>
              <Input id="inst-when" type="datetime-local" {...register('scheduledAt')} />
              {errors.scheduledAt && <p className="text-destructive text-xs">{te(errors.scheduledAt.message ?? '')}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inst-lat">{t('admin.hr.assignInstall.latitude', 'Latitude')}</Label>
              <Input id="inst-lat" inputMode="decimal" {...register('latitude')} />
              {errors.latitude && <p className="text-destructive text-xs">{te(errors.latitude.message ?? '')}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inst-lng">{t('admin.hr.assignInstall.longitude', 'Longitude')}</Label>
              <Input id="inst-lng" inputMode="decimal" {...register('longitude')} />
              {errors.longitude && <p className="text-destructive text-xs">{te(errors.longitude.message ?? '')}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="inst-notes">{t('admin.hr.assignInstall.notes', 'Notes')}</Label>
            <Textarea id="inst-notes" rows={2} {...register('notes')} />
            {errors.notes && <p className="text-destructive text-xs">{te(errors.notes.message ?? '')}</p>}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('admin.hr.assignInstall.assigning', 'Assigning...') : t('admin.hr.assignInstall.assignJob', 'Assign Job')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
