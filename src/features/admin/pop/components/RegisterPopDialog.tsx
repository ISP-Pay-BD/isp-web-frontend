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
import { useLocale } from '@/i18n/locale-context';
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
  const { t } = useLocale();
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

  const divisionLabels: Record<string, string> = {
    Barishal: t('admin.pop.register.divBarishal', 'Barishal'),
    Chattogram: t('admin.pop.register.divChattogram', 'Chattogram'),
    Dhaka: t('admin.pop.register.divDhaka', 'Dhaka'),
    Khulna: t('admin.pop.register.divKhulna', 'Khulna'),
    Mymensingh: t('admin.pop.register.divMymensingh', 'Mymensingh'),
    Rajshahi: t('admin.pop.register.divRajshahi', 'Rajshahi'),
    Rangpur: t('admin.pop.register.divRangpur', 'Rangpur'),
    Sylhet: t('admin.pop.register.divSylhet', 'Sylhet'),
  };
  const customerTypeLabels: Record<string, string> = {
    PPPOE: 'PPPoE',
    Static: t('admin.pop.register.typeStatic', 'Static'),
    Hotspot: t('admin.pop.register.typeHotspot', 'Hotspot'),
  };

  const close = (next: boolean) => {
    if (!next) reset(EMPTY);
    onOpenChange(next);
  };

  const onSubmit = (values: RegisterPopForm) => {
    if (values.customer_type.length === 0) {
      setError('customer_type', { type: 'required', message: t('admin.pop.register.typeRequired', 'Select at least one customer type') });
      return;
    }
    createPop.mutate(values as unknown as Record<string, unknown>, {
      onSuccess: () => {
        toast.success(t('admin.pop.register.registered', 'POP "{name}" registered', { name: values.admin_name }));
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
        {...register(name, { required: t('admin.pop.register.fieldRequired', '{label} is required', { label }) })}
      />
      {errors[name] && <p className="text-xs text-destructive">{String(errors[name]?.message)}</p>}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-lg p-6 border-border/80 shadow-[var(--shadow-md)] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" /> {t('admin.pop.register.title', 'Register New POP Reseller')}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {t('admin.pop.register.desc', "Creates the POP's reseller-admin login and copies your package list to it.")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 pt-2">
          {field('admin_name', t('admin.pop.register.ownerName', 'POP / Owner Name'))}
          <div className="grid grid-cols-2 gap-3">
            {field('mobile', t('admin.pop.register.mobile', 'Mobile'), { inputMode: 'tel', className: 'text-xs h-9 font-mono' })}
            {field('email', t('admin.pop.register.email', 'Email'), { type: 'email' })}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {field('password', t('admin.pop.register.password', 'Password'), { type: 'password', autoComplete: 'new-password' })}
            {field('confirm_password', t('admin.pop.register.confirmPassword', 'Confirm Password'), { type: 'password', autoComplete: 'new-password' })}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="division" className="text-xs font-semibold">{t('admin.pop.register.division', 'Division')} *</Label>
              <Select
                value={division || null}
                onValueChange={(v) => v && setValue('division', String(v), { shouldValidate: true })}
              >
                <SelectTrigger id="division" className="text-xs h-9">
                  <SelectValue>{(v: string | null) => (v ? (divisionLabels[v] ?? v) : t('admin.pop.register.selectDivision', 'Select division'))}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {DIVISIONS.map((d) => (
                    <SelectItem key={d} value={d} className="text-xs">
                      {divisionLabels[d]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" {...register('division', { required: t('admin.pop.register.divisionRequired', 'Division is required') })} />
              {errors.division && <p className="text-xs text-destructive">{errors.division.message}</p>}
            </div>
            {field('district', t('admin.pop.register.district', 'District'))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {field('upazilla', t('admin.pop.register.upazilla', 'Upazilla / Thana'))}
            {field('nationalid', t('admin.pop.register.nationalId', 'National ID'), { className: 'text-xs h-9 font-mono' })}
          </div>
          {field('address', t('admin.pop.register.address', 'Address'))}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">{t('admin.pop.register.customerTypes', 'Customer Types *')}</Label>
              <div className="flex flex-wrap gap-3 pt-1">
                {CUSTOMER_TYPES.map((ct) => (
                  <label key={ct} className="flex items-center gap-1.5 text-xs cursor-pointer">
                    <Checkbox
                      checked={customerTypes.includes(ct)}
                      onCheckedChange={(checked) =>
                        setValue(
                          'customer_type',
                          checked ? [...customerTypes, ct] : customerTypes.filter((c) => c !== ct),
                          { shouldValidate: true },
                        )
                      }
                    />
                    {customerTypeLabels[ct]}
                  </label>
                ))}
              </div>
              {errors.customer_type && (
                <p className="text-xs text-destructive">{String(errors.customer_type.message)}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="billing-type" className="text-xs font-semibold">{t('admin.pop.register.billingType', 'Billing Type')}</Label>
              <Select
                value={billingType}
                onValueChange={(v) => v && setValue('billing_type', v === 'prepaid' ? 'prepaid' : 'postpaid')}
              >
                <SelectTrigger id="billing-type" className="text-xs h-9">
                  <SelectValue>
                    {(v: string | null) =>
                      v === 'prepaid' ? t('admin.pop.register.prepaid', 'Prepaid') : t('admin.pop.register.postpaid', 'Postpaid')
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="postpaid" className="text-xs">
                    {t('admin.pop.register.postpaid', 'Postpaid')}
                  </SelectItem>
                  <SelectItem value="prepaid" className="text-xs">
                    {t('admin.pop.register.prepaid', 'Prepaid')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button type="button" variant="outline" size="sm" onClick={() => close(false)} className="text-xs">
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button type="submit" size="sm" className="text-xs font-semibold" disabled={createPop.isPending}>
              {createPop.isPending ? t('admin.pop.register.registering', 'Registering…') : t('admin.pop.register.submit', 'Register POP')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
