'use client';

import { useForm } from 'react-hook-form';
import { Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { handleApiError } from '@/lib/api/utils/error-handler';
import { useCreatePop } from '../hooks/use-pop';

/** Same option sets as the web reseller/add form (PopController::create validates them). */
const DIVISIONS = ['Barishal', 'Chattogram', 'Dhaka', 'Khulna', 'Mymensingh', 'Rajshahi', 'Rangpur', 'Sylhet'];
const CUSTOMER_TYPES = ['PPPOE', 'Static', 'Hotspot'];

interface RegisterPopForm {
  admin_name: string;
  mobile: string;
  email: string;
  password: string;
  confirm_password: string;
  division: string;
  district: string;
  upazilla: string;
  address: string;
  nationalid: string;
  customer_type: string[];
  billing_type: 'prepaid' | 'postpaid';
}

const EMPTY: RegisterPopForm = {
  admin_name: '',
  mobile: '',
  email: '',
  password: '',
  confirm_password: '',
  division: '',
  district: '',
  upazilla: '',
  address: '',
  nationalid: '',
  customer_type: [],
  billing_type: 'postpaid',
};

export function RegisterPopDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const createPop = useCreatePop();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors },
  } = useForm<RegisterPopForm>({ defaultValues: EMPTY });

  const customerTypes = watch('customer_type');
  const division = watch('division');
  const billingType = watch('billing_type');

  const close = (next: boolean) => {
    if (!next) reset(EMPTY);
    onOpenChange(next);
  };

  const onSubmit = (values: RegisterPopForm) => {
    if (values.customer_type.length === 0) {
      setError('customer_type', { type: 'required', message: 'Select at least one customer type' });
      return;
    }
    createPop.mutate(values as unknown as Record<string, unknown>, {
      onSuccess: () => {
        toast.success(`POP "${values.admin_name}" registered`);
        close(false);
      },
      onError: (err) => handleApiError(err, setError),
    });
  };

  const field = (name: keyof RegisterPopForm, label: string, props: React.ComponentProps<typeof Input> = {}) => (
    <div className="space-y-1.5">
      <Label htmlFor={`pop-${name}`} className="text-xs font-semibold">
        {label} *
      </Label>
      <Input
        id={`pop-${name}`}
        className="text-xs h-9"
        aria-invalid={Boolean(errors[name])}
        {...props}
        {...register(name, { required: `${label} is required` })}
      />
      {errors[name] && <p className="text-[11px] text-destructive">{String(errors[name]?.message)}</p>}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-lg p-6 border-border/80 shadow-[var(--shadow-md)] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" /> Register New POP Reseller
          </DialogTitle>
          <DialogDescription className="text-xs">
            Creates the POP&apos;s reseller-admin login and copies your package list to it.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 pt-2">
          {field('admin_name', 'POP / Owner Name')}
          <div className="grid grid-cols-2 gap-3">
            {field('mobile', 'Mobile', { inputMode: 'tel', className: 'text-xs h-9 font-mono' })}
            {field('email', 'Email', { type: 'email' })}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {field('password', 'Password', { type: 'password', autoComplete: 'new-password' })}
            {field('confirm_password', 'Confirm Password', { type: 'password', autoComplete: 'new-password' })}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Division *</Label>
              <Select
                value={division || null}
                onValueChange={(v) => v && setValue('division', String(v), { shouldValidate: true })}
              >
                <SelectTrigger className="text-xs h-9">
                  <SelectValue>{(v: string | null) => v ?? 'Select division'}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {DIVISIONS.map((d) => (
                    <SelectItem key={d} value={d} className="text-xs">
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" {...register('division', { required: 'Division is required' })} />
              {errors.division && <p className="text-[11px] text-destructive">{errors.division.message}</p>}
            </div>
            {field('district', 'District')}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {field('upazilla', 'Upazilla / Thana')}
            {field('nationalid', 'National ID', { className: 'text-xs h-9 font-mono' })}
          </div>
          {field('address', 'Address')}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Customer Types *</Label>
              <div className="flex flex-wrap gap-3 pt-1">
                {CUSTOMER_TYPES.map((t) => (
                  <label key={t} className="flex items-center gap-1.5 text-xs cursor-pointer">
                    <Checkbox
                      checked={customerTypes.includes(t)}
                      onCheckedChange={(checked) =>
                        setValue(
                          'customer_type',
                          checked ? [...customerTypes, t] : customerTypes.filter((c) => c !== t),
                          { shouldValidate: true },
                        )
                      }
                    />
                    {t}
                  </label>
                ))}
              </div>
              {errors.customer_type && (
                <p className="text-[11px] text-destructive">{String(errors.customer_type.message)}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Billing Type</Label>
              <Select
                value={billingType}
                onValueChange={(v) => v && setValue('billing_type', v === 'prepaid' ? 'prepaid' : 'postpaid')}
              >
                <SelectTrigger className="text-xs h-9 capitalize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="postpaid" className="text-xs">
                    Postpaid
                  </SelectItem>
                  <SelectItem value="prepaid" className="text-xs">
                    Prepaid
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button type="button" variant="outline" size="sm" onClick={() => close(false)} className="text-xs">
              Cancel
            </Button>
            <Button type="submit" size="sm" className="text-xs font-semibold" disabled={createPop.isPending}>
              {createPop.isPending ? 'Registering…' : 'Register POP'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
