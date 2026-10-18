'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, KeyRound, CheckCircle2, Save, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LocaleToggle } from '@/components/shared/LocaleToggle';
import {
  CustomerPageShell,
  CustomerLoadingSkeleton,
  CustomerErrorState,
  updateProfileSchema,
  statusLabel,
  type UpdateProfileInput,
} from '@/features/customer/shared';
import { useCustomerProfile, useUpdateProfile } from '../hooks/use-customer-profile';
import { handleApiError } from '@/lib/api/utils/error-handler';
import { formatDate } from '@/lib/format';
import { useLocale } from '@/i18n/locale-context';
import { toast } from 'sonner';

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase() || '—';

export function CustomerProfilePage() {
  const { t, te } = useLocale();
  const { data, isLoading, isError, error, refetch } = useCustomerProfile();
  const updateProfileMutation = useUpdateProfile();
  const account = data?.account;

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    values: account
      ? { name: account.name, mobile: account.mobile, email: account.email, address: account.address }
      : undefined,
  });

  if (isLoading) {
    return (
      <CustomerPageShell
        title={t('customer.profile.title', 'My Profile')}
        subtitle={t('customer.profile.loading', 'Loading your account details…')}
      >
        <CustomerLoadingSkeleton variant="profile" />
      </CustomerPageShell>
    );
  }

  if (isError || !data || !account) {
    return (
      <CustomerPageShell
        title={t('customer.profile.title', 'My Profile')}
        subtitle={t('customer.profile.errorSubtitle', 'Subscriber information')}
      >
        <CustomerErrorState message={error?.message || undefined} onRetry={() => refetch()} />
      </CustomerPageShell>
    );
  }

  const onSubmit = async (values: UpdateProfileInput) => {
    try {
      await updateProfileMutation.mutateAsync(values);
      toast.success(t('customer.profile.saved', 'Profile details updated.'));
    } catch (err) {
      handleApiError(err, setError);
    }
  };

  const details = [
    { label: t('customer.profile.nid', 'NID'), value: account.nidNumber || '—', mono: true },
    { label: t('customer.profile.package', 'Package'), value: data.currentPackage?.name || '—' },
    {
      label: t('customer.profile.subscription', 'Subscription'),
      value: data.subscriptionStatus ? statusLabel(t, data.subscriptionStatus) : '—',
    },
    { label: t('customer.profile.validUntil', 'Valid until'), value: formatDate(data.willExpire), mono: true },
  ];

  return (
    <CustomerPageShell
      title={t('customer.profile.heading', 'Subscriber Profile')}
      subtitle={t('customer.profile.subtitle', 'Your account details and contact information.')}
      breadcrumbs={[
        { label: t('customer.common.crumb', 'Customer'), href: '/customer/dashboard' },
        { label: t('customer.profile.crumb', 'Profile') },
      ]}
      actions={
        <Button variant="outline" className="h-11 w-full gap-2 sm:w-auto" render={<Link href="/customer/change-password" />}>
          <KeyRound className="h-4 w-4" />
          {t('customer.profile.changePassword', 'Change password')}
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="bg-card rounded-2xl border p-5 shadow-sm md:p-8">
          <div className="flex flex-col justify-between gap-4 border-b pb-6 sm:flex-row sm:items-center">
            <div className="flex min-w-0 items-center gap-4">
              <div className="bg-primary/10 text-primary border-primary/20 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border text-2xl font-bold">
                {initials(account.name)}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-xl font-bold break-words">{account.name || '—'}</h2>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {t('customer.profile.idBadge', 'ID {id}', { id: account.id })}
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-1 text-sm">
                  {t('customer.profile.since', 'Subscriber since {date}', { date: formatDate(account.createdAt) })}
                </p>
              </div>
            </div>

            {account.nidVerified && (
              <Badge variant="outline" tone="success" className="gap-1.5 self-start py-1 text-xs sm:self-auto">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {t('customer.profile.nidVerified', 'NID verified')}
              </Badge>
            )}
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
            {details.map((item) => (
              <div key={item.label} className="min-w-0">
                <dt className="text-muted-foreground text-sm font-medium">{item.label}</dt>
                <dd className={`text-foreground mt-0.5 text-base font-semibold break-words ${item.mono ? 'font-mono' : ''}`}>
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="max-w-2xl space-y-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                  <User className="text-primary h-5 w-5" />
                  {t('customer.profile.contact', 'Contact details')}
                </CardTitle>
                <CardDescription className="text-sm">
                  {t(
                    'customer.profile.contactHint',
                    'Keep your mobile number and email up to date for payment receipts and service notifications.',
                  )}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm">
                    {t('customer.profile.fullName', 'Full name')}
                  </Label>
                  <Input id="name" autoComplete="name" className="h-11" {...register('name')} />
                  {errors.name && <p className="text-destructive text-sm">{te(errors.name.message ?? '')}</p>}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="mobile" className="text-sm">
                      {t('customer.profile.mobile', 'Mobile phone')}
                    </Label>
                    <Input id="mobile" type="tel" inputMode="tel" autoComplete="tel" className="h-11" {...register('mobile')} />
                    {errors.mobile && <p className="text-destructive text-sm">{te(errors.mobile.message ?? '')}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-sm">
                      {t('customer.profile.email', 'Email address')}
                    </Label>
                    <Input id="email" type="email" autoComplete="email" className="h-11" {...register('email')} />
                    {errors.email && <p className="text-destructive text-sm">{te(errors.email.message ?? '')}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="address" className="text-sm">
                    {t('customer.profile.address', 'Installation address')}
                  </Label>
                  <Input id="address" autoComplete="street-address" className="h-11" {...register('address')} />
                  {errors.address && <p className="text-destructive text-sm">{te(errors.address.message ?? '')}</p>}
                </div>

                <div className="flex justify-end border-t pt-4">
                  <Button type="submit" disabled={updateProfileMutation.isPending} className="h-11 w-full gap-2 font-bold sm:w-auto">
                    <Save className="h-4 w-4" />
                    {updateProfileMutation.isPending
                      ? t('customer.profile.saving', 'Saving…')
                      : t('customer.profile.save', 'Update profile information')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>

          <Card>
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-start gap-3">
                <Languages className="text-primary mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="text-base font-semibold">{t('customer.profile.language', 'Language')}</p>
                  <p className="text-muted-foreground text-sm">
                    {t('customer.profile.languageHint', 'Choose English or Bangla for this portal.')}
                  </p>
                </div>
              </div>
              <LocaleToggle variant="portal" className="self-start [&_button]:min-h-11 [&_button]:min-w-14 [&_button]:text-sm" />
            </CardContent>
          </Card>
        </div>
      </div>
    </CustomerPageShell>
  );
}
