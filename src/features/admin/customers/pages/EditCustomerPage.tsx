'use client';
import { PageHero, PageContent } from '@/components/motion/PageHero';

import { useEffect } from 'react';
import { FormProvider, useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import { customerEditSchema, type CustomerEditValues } from '../schemas/customer.schema';
import { useCustomer, useUpdateCustomer } from '../hooks/use-customers';
import { ProfileSection, PppoeSection, ServiceSection } from '../components/CustomerFormSections';
import type { CustomerDetail } from '../types';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { handleApiError, errorMessage } from '@/lib/api/utils/error-handler';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/i18n/locale-context';

function toFormValues(c: CustomerDetail): CustomerEditValues {
  return {
    name: c.name,
    mobile: c.phone,
    email: c.email ?? '',
    address: c.address ?? '',
    nid_number: c.nidNumber ?? '',
    package_id: c.packageId,
    area_id: c.areaId,
    sub_area_id: c.subAreaId ?? '',
    router_id: c.routerId ?? '',
    status: c.accountStatus,
    connection_type: c.lineType ?? '',
    client_type: c.clientType ?? '',
    billing_status: c.billingStatus ?? '',
    will_expire: c.expiryDate ? c.expiryDate.slice(0, 10) : '',
    pppoe_profile: '',
  };
}

export function EditCustomerPage({ id }: { id: string }) {
  const t = useTranslations();
  const router = useRouter();
  // Compact detail: DB fields only, no live router/OLT lookups.
  const { data: customer, isLoading, isError, error, refetch } = useCustomer(id, { compact: true });
  const updateMutation = useUpdateCustomer(id);

  const form = useForm<CustomerEditValues>({
    resolver: zodResolver(customerEditSchema) as Resolver<CustomerEditValues>,
  });

  useEffect(() => {
    if (customer) form.reset(toFormValues(customer));
  }, [customer, form]);

  if (isLoading) return <PageSkeleton variant="form" rows={6} />;
  if (isError || !customer) {
    return (
      <EmptyState variant="error"
        title={t('admin.customers.form.loadFailed', 'Could not load this customer')}
        description={errorMessage(error, t('admin.customers.form.notFound', 'The customer was not found.'))}
        actionLabel={t('admin.customers.form.retry', 'Retry')}
        onAction={() => refetch()}
      />
    );
  }

  const onSubmit = async (values: CustomerEditValues) => {
    // Only what changed: unchanged PPPoE/status values never trigger router writes.
    const dirty = form.formState.dirtyFields as Partial<Record<keyof CustomerEditValues, boolean>>;
    const payload: Record<string, unknown> = {};
    for (const key of Object.keys(dirty) as (keyof CustomerEditValues)[]) {
      if (!dirty[key]) continue;
      const v = values[key];
      if (key === 'will_expire') {
        if (v) payload.will_expire = `${v} 23:59:59`;
      } else if (key === 'pppoe_profile') {
        if (v) payload.pppoe_profile = v;
      } else {
        payload[key] = v ?? '';
      }
    }
    if (Object.keys(payload).length === 0) {
      toast.info(t('admin.customers.form.nothingChanged', 'Nothing changed'));
      return;
    }
    try {
      await updateMutation.mutateAsync(payload);
      router.push(`/admin/customers/${id}`);
    } catch (err) {
      handleApiError(err, form.setError);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHero className="flex items-center gap-3">
        <Button variant="ghost" size="icon" aria-label={t('admin.customers.form.backToCustomer', 'Back to customer')} render={<Link href={`/admin/customers/${id}`} />}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('admin.customers.form.editTitle', 'Edit Customer: {name}', { name: customer.name })}</h1>
          <p className="text-muted-foreground text-sm font-mono">
            {customer.username || '—'} • {t('admin.customers.form.id', 'ID')}: {customer.id}
          </p>
        </div>
      </PageHero>
      <PageContent className="space-y-6">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <ProfileSection />
            <ServiceSection />
            <PppoeSection mode="edit" />

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" render={<Link href={`/admin/customers/${id}`} />}>
                  {t('admin.customers.form.cancel', 'Cancel')}
                </Button>
              <Button type="submit" disabled={form.formState.isSubmitting || updateMutation.isPending} className="bg-primary hover:bg-primary/90">
                <Save className="mr-1.5 h-4 w-4" /> {updateMutation.isPending ? t('admin.customers.form.saving', 'Saving…') : t('admin.customers.form.updateCustomer', 'Update Customer')}
              </Button>
            </div>
          </form>
        </FormProvider>
      </PageContent>
    </div>
  );
}
