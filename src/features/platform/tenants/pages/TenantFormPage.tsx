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

interface TenantFormPageProps {
  tenantId?: string;
}

const selectClass = 'h-9 w-full rounded-md border border-input bg-background px-3 text-sm';

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-xs text-destructive">{message}</p> : null;
}

export function TenantFormPage({ tenantId }: TenantFormPageProps) {
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
      toast.success(isEdit ? 'Tenant portal updated' : 'Tenant portal created');
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
        title="Tenant not found"
        description={tenantQuery.error instanceof Error ? tenantQuery.error.message : 'The requested tenant portal does not exist.'}
        actionLabel="Back to Tenants"
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
        title={isEdit ? 'Edit Tenant Portal' : 'Create Tenant Portal'}
        subtitle="Provision a subdomain portal with branding and owner credentials"
        breadcrumb={[
          { label: 'Platform', href: '/platform/dashboard' },
          { label: 'Tenants', href: '/platform/tenants' },
          { label: isEdit ? 'Edit' : 'Create' },
        ]}
        actions={
          <Link href={isEdit ? `/platform/tenants/${tenantId}` : '/platform/tenants'}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
            </Button>
          </Link>
        }
      />

      <form onSubmit={form.handleSubmit((v) => saveMutation.mutate(v))} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-border/60" interactive={false}>
            <CardHeader>
              <CardTitle className="text-base">Portal & Branding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">ISP Company Name</Label>
                <Input id="name" {...form.register('name')} />
                <FieldError message={errors.name?.message} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Subdomain</Label>
                <div className="flex items-center gap-2">
                  <Input id="slug" {...form.register('slug')} className="font-mono" />
                  {baseDomain ? (
                    <span className="text-sm text-muted-foreground whitespace-nowrap">.{baseDomain}</span>
                  ) : null}
                </div>
                {slug && baseDomain ? (
                  <p className="text-[11px] text-muted-foreground font-mono">
                    {slug}.{baseDomain}
                  </p>
                ) : null}
                <FieldError message={errors.slug?.message} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="plan">Plan label</Label>
                  <select id="plan" {...form.register('plan')} className={selectClass}>
                    <option value="">No plan label</option>
                    {planOptions.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <FieldError message={errors.plan?.message} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select id="status" {...form.register('status')} className={selectClass}>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                  <FieldError message={errors.status?.message} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Brand Color</Label>
                  <div className="flex gap-2">
                    <Input id="primaryColor" type="color" {...form.register('primaryColor')} className="h-9 w-14 p-1" />
                    <Input {...form.register('primaryColor')} className="font-mono text-xs" />
                  </div>
                  <FieldError message={errors.primaryColor?.message} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Secondary Color (optional)</Label>
                  <Input id="secondaryColor" {...form.register('secondaryColor')} placeholder="#10141a" className="font-mono text-xs" />
                  <FieldError message={errors.secondaryColor?.message} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Internal Notes</Label>
                <Textarea id="notes" rows={3} {...form.register('notes')} />
                <FieldError message={errors.notes?.message} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60" interactive={false}>
            <CardHeader>
              <CardTitle className="text-base">Owner (Second Admin)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isEdit ? (
                <div className="flex gap-4 text-sm">
                  <label className="flex items-center gap-2">
                    <input type="radio" value="new" {...form.register('ownerMode')} /> Create a new admin
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="radio" value="existing" {...form.register('ownerMode')} /> Link an existing admin
                  </label>
                </div>
              ) : null}

              {!isEdit && ownerMode === 'existing' ? (
                <div className="space-y-2">
                  <Label htmlFor="ownerUserId">Existing Second Admin</Label>
                  {optionsQuery.isLoading ? (
                    <p className="text-xs text-muted-foreground">Loading admins…</p>
                  ) : owners.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Every admin already has a portal.</p>
                  ) : (
                    <select id="ownerUserId" {...form.register('ownerUserId')} className={selectClass}>
                      <option value="">Select an admin</option>
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
                    <Label htmlFor="ownerName">Owner Full Name</Label>
                    <Input id="ownerName" {...form.register('ownerName')} />
                    <FieldError message={errors.ownerName?.message} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerEmail">Owner Email</Label>
                    <Input id="ownerEmail" type="email" {...form.register('ownerEmail')} />
                    <FieldError message={errors.ownerEmail?.message} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerPhone">Owner Mobile</Label>
                    <Input id="ownerPhone" {...form.register('ownerPhone')} placeholder="01XXXXXXXXX" />
                    <FieldError message={errors.ownerPhone?.message} />
                  </div>
                  {!isEdit ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="ownerPassword">Login Password</Label>
                        <Input id="ownerPassword" type="password" autoComplete="new-password" {...form.register('ownerPassword')} />
                        <FieldError message={errors.ownerPassword?.message} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="packageId">Admin Package (optional)</Label>
                        <select id="packageId" {...form.register('packageId')} className={selectClass}>
                          <option value="">No package yet</option>
                          {packages.map((p) => (
                            <option key={p.id} value={String(p.id)}>
                              {p.name} — ৳{formatBdt(p.priceBdt)} ({p.planType})
                            </option>
                          ))}
                        </select>
                        <FieldError message={errors.packageId?.message} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Address (optional)</Label>
                        <Input id="address" {...form.register('address')} />
                      </div>
                    </>
                  ) : null}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">This portal has no linked owner account.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2">
          <Link href={isEdit ? `/platform/tenants/${tenantId}` : '/platform/tenants'}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={saveMutation.isPending} className="bg-primary hover:bg-primary/90">
            <Save className="mr-1.5 h-4 w-4" />
            {saveMutation.isPending ? 'Saving...' : isEdit ? 'Update Portal' : 'Create Portal'}
          </Button>
        </div>
      </form>
    </div>
  );
}
