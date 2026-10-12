'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  ipPoolFormDefaults,
  ipPoolSchema,
  toIpPoolPayload,
  type IpPoolFormValues,
} from '../schemas/ip-pool.schema';
import { useSaveIpPool } from '../hooks/useIpPools';
import type { IpPool } from '../types';
import { useRouterOptions } from '@/features/admin/routers/hooks/useRouters';
import { handleApiError } from '@/lib/api/utils/error-handler';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface IpPoolModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pool to edit; omit/null to create. */
  pool?: IpPool | null;
}

export function IpPoolModal({ open, onOpenChange, pool }: IpPoolModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>{pool ? `Edit IP Pool — ${pool.name}` : 'Add Corporate / Static IP Pool'}</DialogTitle>
          <DialogDescription>
            Define IP pool range or CIDR block to be assigned to PPPoE, static customers, or hotspot.
          </DialogDescription>
        </DialogHeader>
        {/* Popup unmounts on close, so each open starts from fresh defaults. */}
        <IpPoolForm key={pool?.id ?? 'new'} pool={pool ?? null} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function IpPoolForm({ pool, onDone }: { pool: IpPool | null; onDone: () => void }) {
  const routersQuery = useRouterOptions();
  const routers = routersQuery.data ?? [];
  const save = useSaveIpPool();
  const editing = Boolean(pool);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<IpPoolFormValues>({
    resolver: zodResolver(ipPoolSchema),
    defaultValues: ipPoolFormDefaults(pool),
  });

  const defineBy = watch('define_by');
  const type = watch('pool_type');
  const routerId = watch('router_id');
  const status = watch('status');

  const onSubmit = async (values: IpPoolFormValues) => {
    try {
      const res = await save.mutateAsync({ id: pool?.id, body: toIpPoolPayload(values, editing) });
      if (editing) {
        toast.success(`IP pool ${values.name} updated`);
      } else if (res.routerSynced) {
        toast.success(`IP pool ${values.name} created and provisioned on MikroTik`);
      } else {
        toast.warning(`IP pool ${values.name} saved, but the router could not be reached to provision it`);
      }
      onDone();
    } catch (err) {
      handleApiError(err, setError);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Pool Name *</Label>
          <Input id="name" placeholder="e.g. uttara-static" {...register('name')} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="router_id">Router *</Label>
          <Select
            value={routerId || null}
            onValueChange={(val) => val && setValue('router_id', String(val), { shouldValidate: true })}
            disabled={routersQuery.isLoading}
          >
            <SelectTrigger id="router_id">
              <SelectValue>
                {(value: string | null) =>
                  value
                    ? (routers.find((r) => r.id === value)?.name ?? (pool?.routerName || value))
                    : routersQuery.isLoading
                      ? 'Loading routers…'
                      : 'Select Router'
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {routers.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.name} ({r.host})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {routersQuery.isError ? (
            <p className="text-xs text-destructive">
              Could not load routers.{' '}
              <button type="button" className="underline" onClick={() => routersQuery.refetch()}>
                Retry
              </button>
            </p>
          ) : !routersQuery.isLoading && routers.length === 0 ? (
            <p className="text-xs text-muted-foreground">No active routers — add a router first.</p>
          ) : null}
          {errors.router_id && <p className="text-xs text-destructive">{errors.router_id.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="define_by">Define Pool By *</Label>
          <Select value={defineBy} onValueChange={(val) => val && setValue('define_by', val)}>
            <SelectTrigger id="define_by">
              <SelectValue placeholder="Define By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="range">IP Range (Start - End)</SelectItem>
              <SelectItem value="cidr">CIDR Block (/24, /26...)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="pool_type">Pool Type *</Label>
          <Select value={type} onValueChange={(val) => val && setValue('pool_type', val)}>
            <SelectTrigger id="pool_type">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Public (Real IP)</SelectItem>
              <SelectItem value="private">Private (NAT / RFC 1918)</SelectItem>
            </SelectContent>
          </Select>
          {errors.pool_type && <p className="text-xs text-destructive">{errors.pool_type.message}</p>}
        </div>
      </div>

      {defineBy === 'cidr' ? (
        <div className="space-y-1.5">
          <Label htmlFor="cidr">CIDR Block *</Label>
          <Input id="cidr" className="font-mono text-sm" placeholder="network/prefix, e.g. x.x.x.0/24" {...register('cidr')} />
          {errors.cidr && <p className="text-xs text-destructive">{errors.cidr.message}</p>}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="start_ip">Start IP *</Label>
            <Input id="start_ip" className="font-mono text-sm" placeholder="First address" {...register('start_ip')} />
            {errors.start_ip && <p className="text-xs text-destructive">{errors.start_ip.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="end_ip">End IP *</Label>
            <Input id="end_ip" className="font-mono text-sm" placeholder="Last address" {...register('end_ip')} />
            {errors.end_ip && <p className="text-xs text-destructive">{errors.end_ip.message}</p>}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="gateway">Gateway IP</Label>
          <Input id="gateway" className="font-mono text-sm" placeholder="Optional" {...register('gateway')} />
          {errors.gateway && <p className="text-xs text-destructive">{errors.gateway.message}</p>}
        </div>

        {editing ? (
          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(val) => val && setValue('status', val)}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && <p className="text-xs text-destructive">{errors.status.message}</p>}
          </div>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" rows={2} placeholder="Optional" {...register('notes')} />
        {errors.notes && <p className="text-xs text-destructive">{errors.notes.message}</p>}
      </div>

      <DialogFooter className="pt-2">
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : editing ? 'Save Changes' : 'Add Pool to Router'}
        </Button>
      </DialogFooter>
    </form>
  );
}
