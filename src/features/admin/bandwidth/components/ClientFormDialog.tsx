'use client';

import { useState } from 'react';
import { Plus, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslations } from '@/i18n/locale-context';
import { useCreateBandwidthClient, useUpdateBandwidthClient, type ClientInput } from '../hooks/useBandwidthSell';
import type { BandwidthSellClient } from '../types';
import { activeLabel, fieldErrorsOf, isoDay } from '../utils';
import { FieldError, OptionSelect } from './OptionSelect';

interface ClientFormDialogProps {
  open: boolean;
  /** null = create */
  client: BandwidthSellClient | null;
  onOpenChange: (open: boolean) => void;
}

/** Create / edit a bandwidth sell client (POST / PUT /v1/bandwidth/clients). */
export function ClientFormDialog({ open, client, onOpenChange }: ClientFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-6 border-border/80 shadow-[var(--shadow-md)]">
        {open ? <ClientForm key={client?.id ?? 'new'} client={client} onDone={() => onOpenChange(false)} /> : null}
      </DialogContent>
    </Dialog>
  );
}

type TextField = Exclude<keyof ClientInput, 'popStatus' | 'vlans'>;

function ClientForm({ client, onDone }: { client: BandwidthSellClient | null; onDone: () => void }) {
  const t = useTranslations();
  const create = useCreateBandwidthClient();
  const update = useUpdateBandwidthClient();
  const [form, setForm] = useState<ClientInput>({
    customerName: client?.customerName ?? '',
    customerCode: client?.customerCode ?? '',
    contactPerson: client?.contactPerson ?? '',
    email: client?.email ?? '',
    mobileNumber: client?.mobileNumber ?? '',
    phoneNumber: client?.phoneNumber ?? '',
    popStatus: client?.popStatus === 'inactive' ? 'Inactive' : 'Active',
    referenceBy: client?.referenceBy ?? '',
    address: client?.address ?? '',
    nttnInfo: client?.nttnInfo ?? '',
    scrId: client?.scrId ?? '',
    activationDate: client?.activationDate || isoDay(),
    popName: client?.popName ?? '',
    username: client?.username ?? '',
    password: '',
    confirmPassword: '',
    ips: client?.ips.join(', ') ?? '',
    vlans: client?.vlans.length ? client.vlans : [{ name: '', ip: '' }],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const pending = create.isPending || update.isPending;
  const set = (patch: Partial<ClientInput>) => setForm((f) => ({ ...f, ...patch }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      setErrors({ confirm_password: t('admin.bandwidth.clientForm.passwordMismatch', 'Password and Confirm Password do not match') });
      return;
    }
    setErrors({});
    const callbacks = {
      onSuccess: () => {
        toast.success(client ? t('admin.bandwidth.clientForm.updated', 'Client updated') : t('admin.bandwidth.clientForm.added', 'Client added'));
        onDone();
      },
      onError: (err: unknown) => setErrors(fieldErrorsOf(err)),
    };
    if (client) update.mutate({ ...form, id: client.id }, callbacks);
    else create.mutate(form, callbacks);
  };

  const field = (key: TextField, api: string, label: string, opts: { required?: boolean; type?: string; wide?: boolean; placeholder?: string } = {}) => (
    <div className={opts.wide ? 'col-span-2 space-y-1.5' : 'col-span-2 sm:col-span-1 space-y-1.5'}>
      <Label htmlFor={`cl-${key}`} className="text-xs font-semibold">
        {label}
        {opts.required ? ' *' : ''}
      </Label>
      <Input
        id={`cl-${key}`}
        type={opts.type ?? 'text'}
        value={form[key]}
        onChange={(e) => set({ [key]: e.target.value } as Partial<ClientInput>)}
        required={opts.required}
        placeholder={opts.placeholder}
        className="text-xs h-9"
        aria-invalid={Boolean(errors[api]) || undefined}
      />
      <FieldError message={errors[api]} />
    </div>
  );

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-base font-bold flex items-center gap-2">
          <Users className="h-4 w-4 text-primary" /> {client ? t('admin.bandwidth.clientForm.editTitle', 'Edit {name}', { name: client.customerName }) : t('admin.bandwidth.clientForm.newTitle', 'Add bandwidth client')}
        </DialogTitle>
        <DialogDescription className="text-xs">{t('admin.bandwidth.clientForm.desc', 'POP / corporate client that bandwidth sales invoices are issued to.')}</DialogDescription>
      </DialogHeader>

      <form onSubmit={submit} className="space-y-4 pt-2">
        <div className="grid grid-cols-2 gap-3">
          {field('customerName', 'customer_name', t('admin.bandwidth.clientForm.customerName', 'Customer name'), { required: true })}
          {field('customerCode', 'customer_code', t('admin.bandwidth.clientForm.customerCode', 'Customer code'))}
          {field('contactPerson', 'contact_person', t('admin.bandwidth.shared.contactPerson', 'Contact person'), { required: true })}
          {field('mobileNumber', 'mobile_number', t('admin.bandwidth.shared.mobileNumber', 'Mobile number'), { required: true })}
          {field('phoneNumber', 'phone_number', t('admin.bandwidth.shared.phoneNumber', 'Phone number'))}
          {field('email', 'email', t('admin.bandwidth.shared.email', 'Email'), { type: 'email' })}
          <div className="col-span-2 sm:col-span-1 space-y-1.5">
            <Label className="text-xs font-semibold">{t('admin.bandwidth.clientForm.popStatus', 'POP status *')}</Label>
            <OptionSelect
              value={form.popStatus}
              onChange={(v) => set({ popStatus: v === 'Inactive' ? 'Inactive' : 'Active' })}
              options={[
                { value: 'Active', label: activeLabel(t, true) },
                { value: 'Inactive', label: activeLabel(t, false) },
              ]}
            />
            <FieldError message={errors.pop_status} />
          </div>
          {field('activationDate', 'activation_date', t('admin.bandwidth.clientForm.activationDate', 'Activation date'), { required: !client, type: 'date' })}
          {field('popName', 'pop_name', t('admin.bandwidth.clientForm.popName', 'POP name'))}
          {field('referenceBy', 'reference_by', t('admin.bandwidth.clientForm.referenceBy', 'Reference by'))}
          {field('address', 'address', t('admin.bandwidth.shared.address', 'Address'), { wide: true })}
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-border/50 pt-3">
          {field('nttnInfo', 'nttn_info', t('admin.bandwidth.clientForm.nttnInfo', 'NTTN info'))}
          {field('scrId', 'scr_id', t('admin.bandwidth.clientForm.scrId', 'SCR ID'))}
          {field('ips', 'ip_address', t('admin.bandwidth.clientForm.ips', 'IP addresses'), { wide: true, placeholder: t('admin.bandwidth.clientForm.commaSeparated', 'Comma separated') })}
          <div className="col-span-2 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">{t('admin.bandwidth.clientForm.vlans', 'VLANs')}</Label>
              <Button type="button" variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => set({ vlans: [...form.vlans, { name: '', ip: '' }] })}>
                <Plus className="h-3.5 w-3.5" /> {t('admin.bandwidth.clientForm.addVlan', 'Add VLAN')}
              </Button>
            </div>
            {form.vlans.map((v, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input aria-label={t('admin.bandwidth.clientForm.vlanName', 'VLAN name')} placeholder={t('admin.bandwidth.clientForm.vlanName', 'VLAN name')} value={v.name} onChange={(e) => set({ vlans: form.vlans.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) })} className="h-9 text-xs" />
                <Input aria-label={t('admin.bandwidth.clientForm.vlanIp', 'VLAN IP')} placeholder={t('admin.bandwidth.clientForm.vlanIp', 'VLAN IP')} value={v.ip} onChange={(e) => set({ vlans: form.vlans.map((x, j) => (j === i ? { ...x, ip: e.target.value } : x)) })} className="h-9 text-xs font-mono" />
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive" aria-label={t('admin.bandwidth.clientForm.removeVlan', 'Remove VLAN')} onClick={() => set({ vlans: form.vlans.filter((_, j) => j !== i) })}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-border/50 pt-3">
          {field('username', 'username', t('admin.bandwidth.clientForm.username', 'Username'), { required: true })}
          <div className="hidden sm:block" />
          {field('password', 'password', client ? t('admin.bandwidth.clientForm.newPassword', 'New password') : t('admin.bandwidth.clientForm.password', 'Password'), { required: !client, type: 'password', placeholder: client ? t('admin.bandwidth.clientForm.leaveBlank', 'Leave blank to keep') : undefined })}
          {field('confirmPassword', 'confirm_password', t('admin.bandwidth.clientForm.confirmPassword', 'Confirm password'), { required: !client || Boolean(form.password), type: 'password' })}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" size="sm" onClick={onDone} className="text-xs">{t('common.cancel', 'Cancel')}</Button>
          <Button type="submit" size="sm" disabled={pending} className="text-xs font-semibold">
            {pending ? t('admin.bandwidth.shared.saving', 'Saving…') : client ? t('admin.bandwidth.clientForm.save', 'Save client') : t('admin.bandwidth.clientForm.add', 'Add client')}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
