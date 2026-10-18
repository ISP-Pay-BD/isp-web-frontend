'use client';

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { makeOltSchema, OLT_FIELD_FROM_API, type OltFormValues } from '../schemas/olt.schema';
import { useSaveOlt } from '../hooks/useOltDevices';
import type { OltBrandOption, OltRow } from '../types';
import { ApiError } from '@/lib/api/client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface OltModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Row being edited; null = onboard a new OLT. */
  olt: OltRow | null;
  /** Brand options from GET /v1/olts (`brands`). */
  brands: OltBrandOption[];
}

const PROTOCOL_OPTIONS = [
  { value: 'telnet', label: 'Telnet (CLI)' },
  { value: 'http', label: 'HTTP (Web)' },
  { value: 'https', label: 'HTTPS' },
  { value: 'snmp', label: 'SNMP (UDP 161)' },
];

/** Standard service port per protocol (prefilled when the protocol changes). */
const DEFAULT_PORT: Record<string, number> = { telnet: 23, http: 80, https: 443, snmp: 161 };

function initialValues(olt: OltRow | null, brands: OltBrandOption[]): OltFormValues {
  if (!olt) {
    return { name: '', brand: '', ip: '', port: DEFAULT_PORT.telnet, protocol: 'telnet', username: '', password: '', loginKey: '', snmpOid: '' };
  }
  // Stored brands may differ in case from the catalogue ("bdcom" vs "BDCOM").
  const brand = brands.find((b) => b.value.toLowerCase() === olt.brand.toLowerCase())?.value ?? olt.brand;
  const protocol = PROTOCOL_OPTIONS.some((p) => p.value === olt.protocol) ? olt.protocol : 'telnet';
  return {
    name: olt.name,
    brand,
    ip: olt.ip,
    port: olt.port ?? DEFAULT_PORT[protocol],
    protocol,
    username: olt.username,
    password: '',
    loginKey: '',
    snmpOid: olt.snmpOid,
  };
}

export function OltModal({ open, onOpenChange, olt, brands }: OltModalProps) {
  const editing = olt !== null;
  const schema = useMemo(() => makeOltSchema(editing), [editing]);
  const save = useSaveOlt();
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OltFormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialValues(olt, brands),
  });

  const protocol = watch('protocol');
  const brand = watch('brand');
  const brandItems = brands.map((b) => ({ value: b.value, label: b.label }));
  if (brand && !brandItems.some((b) => b.value === brand)) {
    // Legacy brand outside the catalogue: show it, the backend will ask for a valid one.
    brandItems.push({ value: brand, label: brand });
  }

  const onSubmit = async (values: OltFormValues) => {
    const body: Record<string, unknown> = {
      olt_name: values.name.trim(),
      brand: values.brand,
      ip: values.ip.trim(),
      port: values.port,
      protocol: values.protocol,
      username: values.username.trim(),
    };
    // Blank password / login key on edit keep the stored credential.
    if (values.password !== '') body.password = values.password;
    if (values.loginKey.trim() !== '') body.login_key = values.loginKey.trim();
    if (values.snmpOid !== '') body.snmp_oid = values.snmpOid;

    try {
      await save.mutateAsync({ id: olt?.id, body });
    } catch (err) {
      // The backend message is already toasted globally; put field errors inline.
      if (err instanceof ApiError && err.details) {
        for (const [key, messages] of Object.entries(err.details)) {
          const field = OLT_FIELD_FROM_API[key];
          const message = Array.isArray(messages) ? messages[0] : messages;
          if (field && message) setError(field, { type: 'server', message: String(message) });
        }
      }
      return;
    }
    toast.success(editing ? `${values.name} updated` : `${values.name} onboarded`);
    reset(initialValues(null, brands));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit OLT Node' : 'Onboard New OLT Node'}</DialogTitle>
          <DialogDescription>
            Register a GPON / EPON OLT so its ONUs can be synchronized and diagnosed.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">OLT Name *</Label>
              <Input id="name" placeholder="e.g. Core_GPON_01" {...register('name')} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="brand">Brand / Vendor *</Label>
              <Select
                items={brandItems}
                value={brand}
                onValueChange={(val) => {
                  if (!val) return;
                  setValue('brand', String(val), { shouldValidate: true });
                }}
              >
                <SelectTrigger id="brand">
                  <SelectValue placeholder={brands.length ? 'Select brand' : 'No brands available'} />
                </SelectTrigger>
                <SelectContent>
                  {brandItems.map((b) => (
                    <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.brand && <p className="text-xs text-destructive">{errors.brand.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="ip">IP Address / Host *</Label>
              <Input id="ip" className="font-mono text-sm" placeholder="IPv4 address or host name" {...register('ip')} />
              {errors.ip && <p className="text-xs text-destructive">{errors.ip.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="port">Port *</Label>
              <Input id="port" type="number" className="font-mono text-sm" {...register('port', { valueAsNumber: true })} />
              {errors.port && <p className="text-xs text-destructive">{errors.port.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="protocol">Protocol *</Label>
            <Select
              items={PROTOCOL_OPTIONS}
              value={protocol}
              onValueChange={(val) => {
                if (!val) return;
                const next = String(val);
                setValue('protocol', next);
                if (DEFAULT_PORT[next]) setValue('port', DEFAULT_PORT[next]);
              }}
            >
              <SelectTrigger id="protocol">
                <SelectValue placeholder="Protocol" />
              </SelectTrigger>
              <SelectContent>
                {PROTOCOL_OPTIONS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {protocol === 'snmp' && (
            <div className="space-y-1.5">
              <Label htmlFor="snmpOid">SNMP SysDescr OID</Label>
              <Input id="snmpOid" className="font-mono text-xs" placeholder="1.3.6.1.2.1.1.1.0" {...register('snmpOid')} />
              {errors.snmpOid && <p className="text-xs text-destructive">{errors.snmpOid.message}</p>}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="username">
                {protocol === 'snmp' ? 'SNMP Community *' : 'Login Username *'}
              </Label>
              <Input
                id="username"
                autoComplete="off"
                placeholder={protocol === 'snmp' ? 'public' : 'admin'}
                {...register('username')}
              />
              {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Login Password{editing ? '' : ' *'}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder={editing ? 'Leave blank to keep current' : ''}
                {...register('password')}
              />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="loginKey">Login Key (optional)</Label>
            <Input
              id="loginKey"
              autoComplete="off"
              placeholder={editing && olt?.hasLoginKey ? 'Stored — leave blank to keep' : 'Optional auth key for the OLT session'}
              {...register('loginKey')}
            />
            {errors.loginKey && <p className="text-xs text-destructive">{errors.loginKey.message}</p>}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : editing ? 'Update Node' : 'Save OLT Configuration'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
