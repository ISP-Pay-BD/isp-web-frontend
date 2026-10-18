'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { routerSchema, type RouterFormValues } from '../schemas/router.schema';
import { useSaveRouter, useTestRouterConnection } from '../hooks/useRouterMutations';
import type { RouterRow } from '../types';
import { handleApiError } from '@/lib/api/utils/error-handler';
import { useLocale } from '@/i18n/locale-context';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface RouterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Router being edited; null/undefined = connect a new one. */
  router?: RouterRow | null;
}

const EMPTY: RouterFormValues = {
  name: '',
  host: '',
  port: 8728,
  username: '',
  password: '',
  status: 'active',
  hotspotName: '',
  dnsName: '',
};

function toForm(router: RouterRow): RouterFormValues {
  return {
    name: router.name,
    host: router.host,
    port: router.port || 8728,
    username: router.username,
    password: '',
    status: router.status,
    hotspotName: router.hotspotName,
    dnsName: router.dnsName,
  };
}

export function RouterModal({ open, onOpenChange, router }: RouterModalProps) {
  const { t, te } = useLocale();
  const save = useSaveRouter();
  const test = useTestRouterConnection();
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setError,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<RouterFormValues>({
    resolver: zodResolver(routerSchema),
    values: router ? toForm(router) : EMPTY,
  });

  const onSubmit = async (values: RouterFormValues) => {
    if (!router && !values.password) {
      setError('password', { type: 'required', message: 'Enter MikroTik password' });
      return;
    }
    try {
      await save.mutateAsync({ id: router?.id, values });
      toast.success(router ? t('admin.routers.modal.updated', 'Router updated') : t('admin.routers.modal.connected', 'Router connected'));
      onOpenChange(false);
      reset(EMPTY);
    } catch (err) {
      handleApiError(err, setError);
    }
  };

  const onTest = async () => {
    if (!(await trigger(['host', 'port', 'username']))) return;
    const v = getValues();
    if (!router && !v.password) {
      setError('password', { type: 'required', message: 'Enter MikroTik password' });
      return;
    }
    try {
      const res = await test.mutateAsync({ id: router?.id, host: v.host, port: v.port, username: v.username, password: v.password });
      const identity = typeof res?.info?.identity === 'string' ? res.info.identity : '';
      toast.success(identity ? t('admin.routers.modal.connectedTo', 'Connected to {identity}', { identity }) : t('admin.routers.modal.connectionOk', 'Connection successful'));
    } catch {
      // the mutation cache already toasted the router's answer
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>{router ? t('admin.routers.modal.editTitle', 'Edit MikroTik Router') : t('admin.routers.modal.newTitle', 'Connect New MikroTik Router')}</DialogTitle>
          <DialogDescription>
            {t('admin.routers.modal.desc', 'The RouterOS API connection is tested before it is saved. The API password is never shown again.')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">{t('admin.routers.modal.name', 'Router Name')}</Label>
              <Input id="name" placeholder={t('admin.routers.modal.namePlaceholder', 'Defaults to the router identity')} {...register('name')} />
              {errors.name && <p className="text-xs text-destructive">{te(errors.name.message ?? '')}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status">{t('admin.routers.modal.status', 'Status')}</Label>
              <select
                id="status"
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                {...register('status')}
              >
                <option value="active">{t('status.active', 'Active')}</option>
                <option value="inactive">{t('status.inactive', 'Inactive')}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="host">{t('admin.routers.modal.host', 'Host / IP Address *')}</Label>
              <Input id="host" className="font-mono text-sm" {...register('host')} />
              {errors.host && <p className="text-xs text-destructive">{te(errors.host.message ?? '')}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="port">{t('admin.routers.modal.port', 'API Port *')}</Label>
              <Input id="port" type="number" className="font-mono text-sm" {...register('port', { valueAsNumber: true })} />
              {errors.port && <p className="text-xs text-destructive">{te(errors.port.message ?? '')}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="username">{t('admin.routers.modal.username', 'API Username *')}</Label>
              <Input id="username" autoComplete="off" {...register('username')} />
              {errors.username && <p className="text-xs text-destructive">{te(errors.username.message ?? '')}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">{router ? t('admin.routers.modal.password', 'API Password') : t('admin.routers.modal.passwordRequired', 'API Password *')}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder={router ? t('admin.routers.modal.passwordKeep', 'Leave blank to keep') : ''}
                {...register('password')}
              />
              {errors.password && <p className="text-xs text-destructive">{te(errors.password.message ?? '')}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="hotspotName">{t('admin.routers.modal.hotspotName', 'Hotspot Name')}</Label>
              <Input id="hotspotName" {...register('hotspotName')} />
              {errors.hotspotName && <p className="text-xs text-destructive">{te(errors.hotspotName.message ?? '')}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dnsName">{t('admin.routers.modal.dnsName', 'Hotspot DNS Name')}</Label>
              <Input id="dnsName" {...register('dnsName')} />
              {errors.dnsName && <p className="text-xs text-destructive">{te(errors.dnsName.message ?? '')}</p>}
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onTest} disabled={test.isPending || isSubmitting}>
              {test.isPending ? t('admin.routers.modal.testing', 'Testing...') : t('admin.routers.modal.test', 'Test Connection')}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('admin.routers.modal.connecting', 'Connecting...') : router ? t('admin.routers.modal.save', 'Save Changes') : t('admin.routers.modal.connect', 'Connect Router')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
