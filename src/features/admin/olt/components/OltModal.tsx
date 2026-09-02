'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { oltSchema, type OltFormValues } from '../schemas/olt.schema';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface OltModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: OltFormValues | null;
  onSuccess: (values: OltFormValues) => void;
}

export function OltModal({ open, onOpenChange, initialData, onSuccess }: OltModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OltFormValues>({
    resolver: zodResolver(oltSchema),
    values: initialData ?? {
      name: '',
      brand: 'Huawei',
      ip: '',
      port: 23,
      protocol: 'telnet',
      username: 'root',
      password: '',
      snmpOid: '1.3.6.1.2.1.1.1.0',
      area: 'Uttara',
      ponPortsCount: 8,
    },
  });

  const protocol = watch('protocol');
  const brand = watch('brand');

  const onSubmit = async (values: OltFormValues) => {
    await new Promise((res) => setTimeout(res, 400));
    toast.success(initialData ? 'OLT configuration updated' : 'OLT onboarded successfully');
    onSuccess(values);
    onOpenChange(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit OLT Node' : 'Onboard New OLT Node'}</DialogTitle>
          <DialogDescription>
            Register GPON / EPON OLT device for optical power telemetry and ONU auto-discovery.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">OLT Name *</Label>
              <Input id="name" placeholder="e.g. Uttara_GPON_01" {...register('name')} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="brand">Brand / Vendor *</Label>
              <Select
                value={brand}
                onValueChange={(val) => {
                  if (!val) return;
                  setValue('brand', val);
                }}
              >
                <SelectTrigger id="brand">
                  <SelectValue placeholder="Select Brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Huawei">Huawei</SelectItem>
                  <SelectItem value="ZTE">ZTE</SelectItem>
                  <SelectItem value="BDCOM">BDCOM</SelectItem>
                  <SelectItem value="V_sol">V-Sol</SelectItem>
                  <SelectItem value="C_data">C-Data</SelectItem>
                  <SelectItem value="Ecom">Ecom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="ip">IP Address *</Label>
              <Input id="ip" className="font-mono text-sm" placeholder="10.0.1.10" {...register('ip')} />
              {errors.ip && <p className="text-xs text-destructive">{errors.ip.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="port">Port *</Label>
              <Input id="port" type="number" className="font-mono text-sm" placeholder="23" {...register('port', { valueAsNumber: true })} />
              {errors.port && <p className="text-xs text-destructive">{errors.port.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="protocol">Protocol *</Label>
              <Select
                value={protocol}
                onValueChange={(val) => {
                  if (!val) return;
                  setValue('protocol', val);
                  if (val === 'snmp') setValue('port', 161);
                  else if (val === 'http') setValue('port', 80);
                  else if (val === 'https') setValue('port', 443);
                  else if (val === 'telnet') setValue('port', 23);
                }}
              >
                <SelectTrigger id="protocol">
                  <SelectValue placeholder="Protocol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="telnet">Telnet (CLI)</SelectItem>
                  <SelectItem value="http">HTTP (Web)</SelectItem>
                  <SelectItem value="https">HTTPS</SelectItem>
                  <SelectItem value="snmp">SNMP (UDP 161)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ponPortsCount">PON Ports Count *</Label>
              <Input id="ponPortsCount" type="number" placeholder="8" {...register('ponPortsCount', { valueAsNumber: true })} />
              {errors.ponPortsCount && <p className="text-xs text-destructive">{errors.ponPortsCount.message}</p>}
            </div>
          </div>

          {protocol === 'snmp' && (
            <div className="space-y-1.5">
              <Label htmlFor="snmpOid">SNMP SysDescr OID</Label>
              <Input id="snmpOid" className="font-mono text-xs" placeholder="1.3.6.1.2.1.1.1.0" {...register('snmpOid')} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="username">Login Username *</Label>
              <Input id="username" placeholder="root / admin" {...register('username')} />
              {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Login Password</Label>
              <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="area">Location / Coverage Area *</Label>
            <Input id="area" placeholder="e.g. Uttara Sector 3" {...register('area')} />
            {errors.area && <p className="text-xs text-destructive">{errors.area.message}</p>}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : initialData ? 'Update Node' : 'Save OLT Configuration'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
