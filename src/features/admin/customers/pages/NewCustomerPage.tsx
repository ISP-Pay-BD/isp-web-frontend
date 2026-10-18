'use client';
import { PageHero, PageContent } from '@/components/motion/PageHero';

import { FormProvider, useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import {
  compactPayload,
  customerCreateSchema,
  type CustomerCreateValues,
} from '../schemas/customer.schema';
import { useCreateCustomer } from '../hooks/use-customers';
import { ProfileSection, PppoeSection, ServiceSection } from '../components/CustomerFormSections';
import { handleApiError } from '@/lib/api/utils/error-handler';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/i18n/locale-context';

export function NewCustomerPage() {
  const t = useTranslations();
  const router = useRouter();
  const createMutation = useCreateCustomer();

  const form = useForm<CustomerCreateValues>({
    resolver: zodResolver(customerCreateSchema) as Resolver<CustomerCreateValues>,
    defaultValues: {
      name: '',
      mobile: '',
      email: '',
      address: '',
      nid_number: '',
      package_id: '',
      area_id: '',
      sub_area_id: '',
      router_id: '',
      status: 'active',
      connection_type: '',
      client_type: '',
      billing_status: '',
      pppoe_name: '',
      pppoe_password: '',
      pppoe_service: 'pppoe',
      pppoe_profile: '',
      will_expire: '',
    },
  });

  const onSubmit = async (values: CustomerCreateValues) => {
    try {
      const payload = compactPayload({
        ...values,
        will_expire: values.will_expire ? `${values.will_expire} 23:59:59` : '',
      });
      await createMutation.mutateAsync(payload);
      router.push('/admin/customers');
    } catch (err) {
      handleApiError(err, form.setError);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHero className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" aria-label={t('admin.customers.form.backToCustomers', 'Back to customers')} render={<Link href="/admin/customers" />}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t('admin.customers.form.addTitle', 'Add New Customer')}</h1>
            <p className="text-muted-foreground text-sm">
              {t('admin.customers.form.addSubtitle', 'Provision the internet line, PPPoE secret on the router, and package plan.')}
            </p>
          </div>
        </div>
      </PageHero>
      <PageContent className="space-y-6">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <ProfileSection />
            <ServiceSection />
            <PppoeSection mode="create" />

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" render={<Link href="/admin/customers" />}>
                  {t('admin.customers.form.cancel', 'Cancel')}
                </Button>
              <Button type="submit" disabled={form.formState.isSubmitting || createMutation.isPending} className="bg-primary hover:bg-primary/90">
                <Save className="mr-1.5 h-4 w-4" /> {createMutation.isPending ? t('admin.customers.form.saving', 'Saving…') : t('admin.customers.form.saveCustomer', 'Save Customer')}
              </Button>
            </div>
          </form>
        </FormProvider>
      </PageContent>
    </div>
  );
}
