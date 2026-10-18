'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { platformService } from '@/lib/api/services/platform.service';
import { handleApiError } from '@/lib/api/utils/error-handler';
import { tenantFormSchema, type TenantFormValues } from '../schemas/tenant.schema';
import { PlatformPageHeader } from '@/features/platform/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatBdt } from '@/lib/format';
import { toast } from 'sonner';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from '@/i18n/locale-context';

interface TenantFormPageProps {
  tenantId?: string;
}

const selectClass = 'h-9 w-full rounded-md border border-input bg-background px-3 text-sm';

function FieldError({ message }: { message?: string }) {
  const { te } = useLocale();
  return message ? <p className="text-xs text-destructive">{te(message)}</p> : null;
}

export function TenantFormPage({ tenantId }: TenantFormPageProps) {
  const { t } = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = Boolean(tenantId);

  const tenantQuery = useQuery({
    queryKey: ['platform', 'tenants', tenantId],
    queryFn: () => platformService.getTenantById(tenantId!),
    enabled: isEdit,
  });

  const optionsQuery = useQuery({
    queryKey: ['platform', 'tenant-options'],
    queryFn: () => platformService.getTenantFormOptions(),
  });

  const form = useForm<TenantFormValues>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: {
      mode: isEdit ? 'edit' : 'create',
      name: '',
      slug: '',
      plan: '',
      primaryColor: '#2563eb',
      secondaryColor: '',
      status: 'active',
      notes: '',
      ownerMode: 'new',
      ownerUserId: '',
      ownerName: '',
      ownerEmail: '',
      ownerPhone: '',
      ownerPassword: '',
      packageId: '',
      address: '',
    },
  });

  const tenant = tenantQuery.data?.tenant;
  useEffect(() => {
    if (!tenant) return;
    form.reset({
      mode: 'edit',
      name: tenant.name,
      slug: tenant.slug,
      plan: tenant.plan ?? '',
      primaryColor: tenant.primaryColor ?? '#2563eb',
      secondaryColor: tenant.secondaryColor ?? '',
      status: tenant.status,
      notes: tenant.notes ?? '',
      ownerMode: 'existing',
      ownerUserId: tenant.ownerUserId ? String(tenant.ownerUserId) : '',
      ownerName: tenant.ownerName ?? '',
      ownerEmail: tenant.ownerEmail ?? '',
      ownerPhone: tenant.ownerPhone ?? '',
      ownerPassword: '',
      packageId: '',
      address: '',
    });
  }, [tenant, form]);

  const ownerMode = form.watch('ownerMode');
  const slug = form.watch('slug');
  const baseDomain = optionsQuery.data?.baseDomain ?? '';

  const saveMutation = useMutation({
    mutationFn: (v: TenantFormValues) => {
      const portal = {
        name: v.name,
        slug: v.slug,
        plan: v.plan ?? '',
        primary_color: v.primaryColor,
        secondary_color: v.secondaryColor ?? '',
        status: v.status,
        notes: v.notes ?? '',
      };
      if (isEdit) {
        const ownerFields = tenant?.ownerUserId
          ? { owner_name: v.ownerName, owner_email: v.ownerEmail, owner_mobile: v.ownerPhone }
          : {};
        return platformService.updateTenant(tenantId!, { ...portal, ...ownerFields });
      }
      return platformService.createTenant(
        v.ownerMode === 'existing'
          ? { ...portal, owner_mode: 'existing', owner_user_id: Number(v.ownerUserId) }
          : {
              ...portal,
              owner_mode: 'new',
              owner_name: v.ownerName,
              owner_email: v.ownerEmail,
              owner_mobile: v.ownerPhone,
              owner_password: v.ownerPassword,
              package_id: v.packageId ? Number(v.packageId) : undefined,
              address: v.address ?? '',
            },
      );
    },
    onSuccess: (result) => {
      toast.success(isEdit ? t('platform.tenants.form.toast.updated', 'Tenant portal updated') : t('platform.tenants.form.toast.created', 'Tenant portal created'));
      void queryClient.invalidateQueries({ queryKey: ['platform', 'tenants'] });
      void queryClient.invalidateQueries({ queryKey: ['platform', 'tenant-options'] });
      void queryClient.invalidateQueries({ queryKey: ['platform', 'dashboard'] });
      const id = result?.id ?? tenantId;
      router.push(id ? `/platform/tenants/${id}` : '/platform/tenants');
    },
    onError: (err) => {
      handleApiError(err, (field, error) => {
        const map: Record<string, keyof TenantFormValues> = {
          primary_color: 'primaryColor',
          secondary_color: 'secondaryColor',
          owner_user_id: 'ownerUserId',
          owner_name: 'ownerName',
          owner_email: 'ownerEmail',
          owner_mobile: 'ownerPhone',
          owner_password: 'ownerPassword',
          package_id: 'packageId',
        };
        const key = (map[String(field)] ?? field) as keyof TenantFormValues;
        form.setError(key, error);
      });
    },
  });

  if (isEdit && tenantQuery.isLoading) return <PageSkeleton variant="form" rows={6} />;
  if (isEdit && (tenantQuery.error || !tenant)) {
    return (
      <EmptyState
        title={t('platform.tenants.detail.notFound', 'Tenant not found')}
        description={tenantQuery.error instanceof Error ? tenantQuery.error.message : t('platform.tenants.form.notFoundHint', 'The requested tenant portal does not exist.')}
        actionLabel={t('platform.tenants.form.backToTenants', 'Back to Tenants')}
        onAction={() => router.push('/platform/tenants')}
      />
    );
  }

  const errors = form.formState.errors;
  const packages = optionsQuery.data?.packages ?? [];
  const owners = optionsQuery.data?.owners ?? [];
  const planOptions = Array.from(new Set([...packages.map((p) => p.name), ...(tenant?.plan ? [tenant.plan] : [])]));

  return (
    <div className="space-y-6">
      <PlatformPageHeader
        title={isEdit ? t('platform.tenants.form.editTitle', 'Edit Tenant Portal') : t('platform.tenants.form.createTitle', 'Create Tenant Portal')}
        subtitle={t('platform.tenants.form.subtitle', 'Provision a subdomain portal with branding and owner credentials')}
        breadcrumb={[
          { label: t('common.crumb.platform', 'Platform'), href: '/platform/dashboard' },
          { label: t('common.crumb.tenants', 'Tenants'), href: '/platform/tenants' },
          { label: isEdit ? t('platform.tenants.detail.edit', 'Edit') : t('platform.tenants.form.crumbCreate', 'Create') },
        ]}
        actions={
          <Button variant="outline" size="sm" render={<Link href={isEdit ? `/platform/tenants/${tenantId}` : '/platform/tenants'} />}>
              <ArrowLeft className="mr-1.5 h-4 w-4" /> {t('platform.tenants.form.back', 'Back')}
            </Button>
        }
      />

      <form onSubmit={form.handleSubmit((v) => saveMutation.mutate(v))} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border/60" interactive={false}>
            <CardHeader>
              <CardTitle className="text-base">{t('platform.tenants.form.portalBranding', 'Portal & Branding')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('platform.tenants.form.companyName', 'ISP Company Name')}</Label>
                <Input id="name" {...form.register('name')} />
                <FieldError message={errors.name?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">{t('platform.tenants.form.subdomain', 'Subdomain')}</Label>
                <div className="flex items-center gap-2">
                  <Input id="slug" {...form.register('slug')} className="font-mono" />
                  {baseDomain ? (
                    <span className="text-sm text-muted-foreground whitespace-nowrap">.{baseDomain}</span>
                  ) : null}
                </div>
                {slug && baseDomain ? (
                  <p className="text-xs text-muted-foreground font-mono">
                    {slug}.{baseDomain}
                  </p>
                ) : null}
                <FieldError message={errors.slug?.message} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="plan">{t('platform.tenants.form.planLabel', 'Plan label')}</Label>
                  <select id="plan" {...form.register('plan')} className={selectClass}>
                    <option value="">{t('platform.tenants.form.noPlanLabel', 'No plan label')}</option>
                    {planOptions.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <FieldError message={errors.plan?.message} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">{t('admin.customers.list.statusLabel', 'Status')}</Label>
                  <select id="status" {...form.register('status')} className={selectClass}>
                    <option value="active">{t('status.active', 'Active')}</option>
                    <option value="suspended">{t('status.suspended', 'Suspended')}</option>
                  </select>
                  <FieldError message={errors.status?.message} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">{t('platform.tenants.form.primaryColor', 'Primary Brand Color')}</Label>
                  <div className="flex gap-2">
                    <Input id="primaryColor" type="color" {...form.register('primaryColor')} className="h-9 w-14 p-1" />
                    <Input {...form.register('primaryColor')} aria-label={t('platform.tenants.form.primaryColor', 'Primary Brand Color')} className="font-mono text-xs" />
                  </div>
                  <FieldError message={errors.primaryColor?.message} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">{t('platform.tenants.form.secondaryColor', 'Secondary Color (optional)')}</Label>
                  <Input id="secondaryColor" {...form.register('secondaryColor')} placeholder="#10141a" className="font-mono text-xs" />
                  <FieldError message={errors.secondaryColor?.message} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">{t('platform.tenants.form.notes', 'Internal Notes')}</Label>
                <Textarea id="notes" rows={3} {...form.register('notes')} />
                <FieldError message={errors.notes?.message} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60" interactive={false}>
            <CardHeader>
              <CardTitle className="text-base">{t('platform.tenants.form.ownerTitle', 'Owner (Second Admin)')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isEdit ? (
                <div className="flex gap-4 text-sm">
                  <label className="flex items-center gap-2">
                    <input type="radio" value="new" {...form.register('ownerMode')} /> {t('platform.tenants.form.ownerNew', 'Create a new admin')}
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" value="existing" {...form.register('ownerMode')} /> {t('platform.tenants.form.ownerExisting', 'Link an existing admin')}
                  </label>
                </div>
              ) : null}

              {!isEdit && ownerMode === 'existing' ? (
                <div className="space-y-2">
                  <Label htmlFor="ownerUserId">{t('platform.tenants.form.existingAdmin', 'Existing Second Admin')}</Label>
                  {optionsQuery.isLoading ? (
                    <p className="text-xs text-muted-foreground">{t('platform.tenants.form.loadingAdmins', 'Loading admins…')}</p>
                  ) : owners.length === 0 ? (
                    <p className="text-xs text-muted-foreground">{t('platform.tenants.form.allAdminsLinked', 'Every admin already has a portal.')}</p>
                  ) : (
                    <select id="ownerUserId" {...form.register('ownerUserId')} className={selectClass}>
                      <option value="">{t('platform.tenants.form.selectAdmin', 'Select an admin')}</option>
                      {owners.map((o) => (
                        <option key={o.id} value={String(o.id)}>
                          {o.name} — {o.email || o.mobile}
                        </option>
                      ))}
                    </select>
                  )}
                  <FieldError message={errors.ownerUserId?.message} />
                </div>
              ) : !isEdit || tenant?.ownerUserId ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="ownerName">{t('platform.tenants.form.ownerName', 'Owner Full Name')}</Label>
                    <Input id="ownerName" {...form.register('ownerName')} />
                    <FieldError message={errors.ownerName?.message} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerEmail">{t('platform.tenants.form.ownerEmail', 'Owner Email')}</Label>
                    <Input id="ownerEmail" type="email" {...form.register('ownerEmail')} />
                    <FieldError message={errors.ownerEmail?.message} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerPhone">{t('platform.tenants.form.ownerMobile', 'Owner Mobile')}</Label>
                    <Input id="ownerPhone" {...form.register('ownerPhone')} placeholder="01XXXXXXXXX" />
                    <FieldError message={errors.ownerPhone?.message} />
                  </div>
                  {!isEdit ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="ownerPassword">{t('platform.tenants.form.loginPassword', 'Login Password')}</Label>
                        <Input id="ownerPassword" type="password" autoComplete="new-password" {...form.register('ownerPassword')} />
                        <FieldError message={errors.ownerPassword?.message} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="packageId">{t('platform.tenants.form.adminPackage', 'Admin Package (optional)')}</Label>
                        <select id="packageId" {...form.register('packageId')} className={selectClass}>
                          <option value="">{t('platform.tenants.form.noPackage', 'No package yet')}</option>
                          {packages.map((p) => (
                            <option key={p.id} value={String(p.id)}>
                              {p.name} — ৳{formatBdt(p.priceBdt)} ({p.planType})
                            </option>
                          ))}
                        </select>
                        <FieldError message={errors.packageId?.message} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">{t('platform.tenants.form.address', 'Address (optional)')}</Label>
                        <Input id="address" {...form.register('address')} />
                      </div>
                    </>
                  ) : null}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">{t('platform.tenants.form.noOwnerLinked', 'This portal has no linked owner account.')}</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" render={<Link href={isEdit ? `/platform/tenants/${tenantId}` : '/platform/tenants'} />}>
              {t('common.cancel', 'Cancel')}
            </Button>
          <Button type="submit" disabled={saveMutation.isPending} className="bg-primary hover:bg-primary/90">
            <Save className="mr-1.5 h-4 w-4" />
            {saveMutation.isPending
              ? t('platform.tenants.form.saving', 'Saving...')
              : isEdit
                ? t('platform.tenants.form.update', 'Update Portal')
                : t('platform.tenants.list.create', 'Create Portal')}
          </Button>
        </div>
      </form>
    </div>
  );
}
