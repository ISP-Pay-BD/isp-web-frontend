'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ipPoolSchema, type IpPoolFormValues } from '../schemas/ip-pool.schema';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import type { RouterItem } from '@/data/admin/network-ops.data';

interface IpPoolModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  routers: RouterItem[];
  onSuccess: (values: IpPoolFormValues & { routerName: string }) => void;
}

export function IpPoolModal({ open, onOpenChange, routers, onSuccess }: IpPoolModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<IpPoolFormValues>({
    resolver: zodResolver(ipPoolSchema),
    values: {
      name: '',
      routerId: routers[0]?.id ?? 'rtr_1',
      defineBy: 'range',
      startIp: '103.15.30.2',
      endIp: '103.15.30.254',
      cidr: '103.15.30.0/24',
      gateway: '103.15.30.1',
      type: 'public',
      total: 253,
    },
  });

  const defineBy = watch('defineBy');
  const type = watch('type');
  const routerId = watch('routerId');

  const onSubmit = async (values: IpPoolFormValues) => {
    await new Promise((res) => setTimeout(res, 400));
    const rtr = routers.find((r) => r.id === values.routerId);
    toast.success('IP Pool created and provisioned on MikroTik');
    onSuccess({
      ...values,
      routerName: rtr ? rtr.name : 'MikroTik Gateway',
    });
    onOpenChange(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>Add Corporate / Static IP Pool</DialogTitle>
          <DialogDescription>
            Define IP pool range or CIDR block to be assigned to PPPoE, static customers, or hotspot.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Pool Name *</Label>
              <Input id="name" placeholder="e.g. Uttara Static Real IP" {...register('name')} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="routerId">Router *</Label>
              <Select
                value={routerId}
                onValueChange={(val) => val && setValue('routerId', val)}
              >
                <SelectTrigger id="routerId">
                  <SelectValue placeholder="Select Router" />
                </SelectTrigger>
                <SelectContent>
                  {routers.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name} ({r.ip})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="defineBy">Define Pool By *</Label>
              <Select
                value={defineBy}
                onValueChange={(val) => val && setValue('defineBy', val)}
              >
                <SelectTrigger id="defineBy">
                  <SelectValue placeholder="Define By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="range">IP Range (Start - End)</SelectItem>
                  <SelectItem value="cidr">CIDR Block (/24, /26...)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="type">Pool Type *</Label>
              <Select
                value={type}
                onValueChange={(val) => val && setValue('type', val)}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public (Real IP)</SelectItem>
                  <SelectItem value="private">Private (NAT / RFC 1918)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {defineBy === 'cidr' ? (
            <div className="space-y-1.5">
              <Label htmlFor="cidr">CIDR Block *</Label>
              <Input id="cidr" className="font-mono text-sm" placeholder="103.15.30.0/24" {...register('cidr')} />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="startIp">Start IP *</Label>
                <Input id="startIp" className="font-mono text-sm" placeholder="103.15.30.2" {...register('startIp')} />
                {errors.startIp && <p className="text-xs text-destructive">{errors.startIp.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="endIp">End IP *</Label>
                <Input id="endIp" className="font-mono text-sm" placeholder="103.15.30.254" {...register('endIp')} />
                {errors.endIp && <p className="text-xs text-destructive">{errors.endIp.message}</p>}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="gateway">Gateway IP *</Label>
              <Input id="gateway" className="font-mono text-sm" placeholder="103.15.30.1" {...register('gateway')} />
              {errors.gateway && <p className="text-xs text-destructive">{errors.gateway.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="total">Total Usable IPs *</Label>
              <Input id="total" type="number" placeholder="253" {...register('total', { valueAsNumber: true })} />
              {errors.total && <p className="text-xs text-destructive">{errors.total.message}</p>}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Provisioning...' : 'Add Pool to Router'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
