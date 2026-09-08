'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mockFetch } from '@/lib/mock-api/client';
import { tenantFormSchema, type TenantFormValues } from '../schemas/tenant.schema';
import { PlatformPageHeader } from '@/features/platform/shared';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const PLANS = ['Starter', 'Growth', 'Scale', 'Enterprise'];

interface TenantFormPageProps {
  tenantId?: string;
}

export function TenantFormPage({ tenantId }: TenantFormPageProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = Boolean(tenantId);

  const { data, isLoading, error } = useQuery({
    queryKey: ['platform', 'tenants', tenantId],
    queryFn: () => mockFetch('platform.tenants.get', tenantId!),
    enabled: isEdit,
  });

  const form = useForm<TenantFormValues>({
    resolver: zodResolver(tenantFormSchema),
    defaultValues: {
      name: '',
      slug: '',
      plan: 'Starter',
      primaryColor: '#e85a1a',
      secondaryColor: '#10141a',
      status: 'trial',
      notes: '',
      ownerName: '',
      ownerEmail: '',
      ownerPhone: '',
      customers: 0,
    },
  });

  useEffect(() => {
    if (data?.tenant) {
      const t = data.tenant;
      form.reset({
        name: t.name,
        slug: t.slug,
        plan: t.plan,
        primaryColor: t.primaryColor,
        secondaryColor: t.secondaryColor ?? '#10141a',
        status: t.status,
        notes: t.notes ?? '',
        ownerName: t.ownerName,
        ownerEmail: t.ownerEmail,
        ownerPhone: t.ownerPhone,
        customers: t.customers,
      });
    }
  }, [data, form]);

  const saveMutation = useMutation({
    mutationFn: (values: TenantFormValues) => {
      const payload = {
        ...values,
        domain: `${values.slug}.isppaybd.com`,
        logoUrl: '/images/brand/logo.svg',
      };
      return isEdit
        ? mockFetch('platform.tenants.update', tenantId!, payload)
        : mockFetch('platform.tenants.create', payload);
    },
    onSuccess: (result) => {
      toast.success(isEdit ? 'Tenant portal updated' : 'Tenant portal created');
      queryClient.invalidateQueries({ queryKey: ['platform', 'tenants'] });
      router.push(`/platform/tenants/${result.id}`);
    },
    onError: (err: Error) => toast.error(err.message || 'Failed to save tenant'),
  });

  if (isEdit && isLoading) return <PageSkeleton variant="form" rows={6} />;
  if (isEdit && (error || !data)) {
    return (
      <EmptyState
        title="Tenant not found"
        description="The requested tenant portal does not exist."
        actionLabel="Back to Tenants"
        onAction={() => router.push('/platform/tenants')}
      />
    );
  }

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
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Subdomain Slug</Label>
                <div className="flex items-center gap-2">
                  <Input id="slug" {...form.register('slug')} className="font-mono" />
                  <span className="text-sm text-muted-foreground whitespace-nowrap">.isppaybd.com</span>
                </div>
                {form.formState.errors.slug && (
                  <p className="text-xs text-destructive">{form.formState.errors.slug.message}</p>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="plan">Subscription Plan</Label>
                  <select
                    id="plan"
                    {...form.register('plan')}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {PLANS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    {...form.register('status')}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="trial">Trial</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Brand Color</Label>
                  <div className="flex gap-2">
                    <Input id="primaryColor" type="color" {...form.register('primaryColor')} className="h-9 w-14 p-1" />
                    <Input {...form.register('primaryColor')} className="font-mono text-xs" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input id="secondaryColor" type="color" {...form.register('secondaryColor')} className="h-9 w-14 p-1" />
                    <Input {...form.register('secondaryColor')} className="font-mono text-xs" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Internal Notes</Label>
                <Textarea id="notes" rows={3} {...form.register('notes')} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60" interactive={false}>
            <CardHeader>
              <CardTitle className="text-base">Owner (Second Admin)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ownerName">Owner Full Name</Label>
                <Input id="ownerName" {...form.register('ownerName')} />
                {form.formState.errors.ownerName && (
                  <p className="text-xs text-destructive">{form.formState.errors.ownerName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerEmail">Owner Email</Label>
                <Input id="ownerEmail" type="email" {...form.register('ownerEmail')} />
                {form.formState.errors.ownerEmail && (
                  <p className="text-xs text-destructive">{form.formState.errors.ownerEmail.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerPhone">Owner Phone</Label>
                <Input id="ownerPhone" {...form.register('ownerPhone')} placeholder="01XXXXXXXXX" />
                {form.formState.errors.ownerPhone && (
                  <p className="text-xs text-destructive">{form.formState.errors.ownerPhone.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="customers">Initial Subscriber Count</Label>
                <Input
                  id="customers"
                  type="number"
                  min={0}
                  {...form.register('customers', { valueAsNumber: true })}
                />
              </div>
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
