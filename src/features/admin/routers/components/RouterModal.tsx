'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { routerSchema, type RouterFormValues } from '../schemas/router.schema';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface RouterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: RouterFormValues | null;
  onSuccess: (values: RouterFormValues) => void;
}

export function RouterModal({ open, onOpenChange, initialData, onSuccess }: RouterModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RouterFormValues>({
    resolver: zodResolver(routerSchema),
    values: initialData ?? {
      name: '',
      ip: '',
      port: 8728,
      username: 'admin',
      password: '',
      model: 'CCR2004',
      area: 'Uttara',
    },
  });

  const onSubmit = async (values: RouterFormValues) => {
    // Simulate api update
    await new Promise((res) => setTimeout(res, 400));
    toast.success(initialData ? 'Router updated successfully' : 'Router connected successfully');
    onSuccess(values);
    onOpenChange(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit MikroTik Router' : 'Connect New MikroTik Router'}</DialogTitle>
          <DialogDescription>
            Configure RouterOS API connection to push PPPoE users, queue rules, and monitor interfaces.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Router Name *</Label>
              <Input id="name" placeholder="e.g. Uttara Core CCR" {...register('name')} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="model">Model / Board *</Label>
              <Input id="model" placeholder="e.g. CCR1036-8G-2S+" {...register('model')} />
              {errors.model && <p className="text-xs text-destructive">{errors.model.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="ip">IP Address (Host) *</Label>
              <Input id="ip" className="font-mono text-sm" placeholder="103.15.20.1" {...register('ip')} />
              {errors.ip && <p className="text-xs text-destructive">{errors.ip.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="port">API Port *</Label>
              <Input id="port" type="number" className="font-mono text-sm" placeholder="8728" {...register('port', { valueAsNumber: true })} />
              {errors.port && <p className="text-xs text-destructive">{errors.port.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="username">API Username *</Label>
              <Input id="username" placeholder="admin" {...register('username')} />
              {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">API Password</Label>
              <Input id="password" type="password" placeholder="Leave blank to keep" {...register('password')} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="area">Coverage Area / POP *</Label>
            <Input id="area" placeholder="e.g. Uttara / Mirpur / Dhanmondi" {...register('area')} />
            {errors.area && <p className="text-xs text-destructive">{errors.area.message}</p>}
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : initialData ? 'Save Changes' : 'Connect Router'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
