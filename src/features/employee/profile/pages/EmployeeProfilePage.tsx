'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Mail, MapPin, Phone, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatBdPhone, normalizeBdPhone } from '@/lib/format';
import { useLocale } from '@/i18n/locale-context';
import { LocaleToggle } from '@/components/shared/LocaleToggle';
import {
  EmployeePageShell,
  EmployeeLoadingSkeleton,
  EmployeeErrorState,
} from '@/features/employee/shared';
import { formatDay } from '@/features/employee/shared/lib/datetime';
import { useEmployeeProfile, useUpdateEmployeeProfile } from '../hooks/use-employee-profile';
import { profileUpdateSchema, type ProfileUpdateFormValues } from '../schemas/profile.schema';

export function EmployeeProfilePage() {
  const { t, te } = useLocale();
  const { data: profile, isLoading, isError, error, refetch } = useEmployeeProfile();
  const updateMutation = useUpdateEmployeeProfile(profile);

  const form = useForm<ProfileUpdateFormValues>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: { name: '', phone: '', email: '', address: '' },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name,
        phone: normalizeBdPhone(profile.mobile),
        email: profile.email,
        address: profile.address,
      });
    }
  }, [profile, form]);

  const onSubmit = form.handleSubmit((values) => updateMutation.mutate(values));

  if (isLoading) {
    return (
      <EmployeePageShell
        title={t('employee.profile.title', 'My Profile')}
        subtitle={t('employee.profile.loadingSubtitle', 'Loading profile...')}
      >
        <EmployeeLoadingSkeleton />
      </EmployeePageShell>
    );
  }

  if (isError || !profile) {
    return (
      <EmployeePageShell
        title={t('employee.profile.title', 'My Profile')}
        subtitle={t('employee.profile.errorSubtitle', 'Manage your account details')}
      >
        <EmployeeErrorState message={error?.message} onRetry={() => refetch()} />
      </EmployeePageShell>
    );
  }

  const facts: [string, string][] = [
    [t('employee.profile.employer', 'Employer'), profile.employerName || '—'],
    [t('employee.profile.serviceAreas', 'Service Areas'), profile.areaNames.join(', ') || '—'],
    [t('employee.profile.nationalId', 'National ID'), profile.nidNumber || '—'],
    [
      t('employee.profile.locationTracking', 'Location Tracking'),
      profile.locationRequired
        ? profile.locationInterval
          ? t('employee.profile.trackingRequiredEvery', 'Required · every {min} min', { min: profile.locationInterval })
          : t('employee.profile.trackingRequired', 'Required')
        : t('employee.profile.trackingOff', 'Off'),
    ],
  ];

  return (
    <EmployeePageShell
      title={t('employee.profile.title', 'My Profile')}
      subtitle={t('employee.profile.subtitle', 'View and update your personal information')}
      breadcrumbs={[
        { label: t('employee.common.breadcrumb', 'Employee'), href: '/employee/salaries' },
        { label: t('employee.profile.breadcrumb', 'Profile') },
      ]}
    >
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">{t('employee.profile.employmentTitle', 'Employment Details')}</CardTitle>
            <CardDescription>{t('employee.profile.employmentHint', 'Read-only information from HR records')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <User className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <div>
                <p className="text-muted-foreground">{t('employee.profile.designation', 'Designation')}</p>
                <p className="font-medium">{profile.designationLabel || '—'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building2 className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <div>
                <p className="text-muted-foreground">{t('employee.profile.joined', 'Joined')}</p>
                <p className="font-medium">{formatDay(profile.joinedAt) || '—'}</p>
              </div>
            </div>
            {facts.map(([label, value]) => (
              <div key={label}>
                <p className="text-muted-foreground">{label}</p>
                <p className="font-medium break-words">{value}</p>
              </div>
            ))}
            <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-4">
              <p className="text-muted-foreground">{t('employee.profile.language', 'Language')}</p>
              <LocaleToggle variant="portal" />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg">{t('employee.profile.personalTitle', 'Personal Information')}</CardTitle>
            <CardDescription>{t('employee.profile.personalHint', 'Update your contact details')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('employee.profile.fullName', 'Full Name')}</Label>
                <div className="relative">
                  <User className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input id="name" className="h-11 pl-9" {...form.register('name')} disabled={updateMutation.isPending} />
                </div>
                {form.formState.errors.name ? (
                  <p className="text-destructive text-xs">{te(form.formState.errors.name.message ?? '')}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t('employee.profile.mobile', 'Mobile Number')}</Label>
                <div className="relative">
                  <Phone className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="tel"
                    className="h-11 pl-9"
                    placeholder="01XXXXXXXXX"
                    {...form.register('phone')}
                    disabled={updateMutation.isPending}
                  />
                </div>
                {form.formState.errors.phone ? (
                  <p className="text-destructive text-xs">{te(form.formState.errors.phone.message ?? '')}</p>
                ) : profile.mobile ? (
                  <p className="text-muted-foreground text-xs">
                    {t('employee.profile.currentMobile', 'Current: {phone}', { phone: formatBdPhone(profile.mobile) })}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t('employee.profile.email', 'Email Address')}</Label>
                <div className="relative">
                  <Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    id="email"
                    type="email"
                    className="h-11 pl-9"
                    {...form.register('email')}
                    disabled={updateMutation.isPending}
                  />
                </div>
                {form.formState.errors.email ? (
                  <p className="text-destructive text-xs">{te(form.formState.errors.email.message ?? '')}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">{t('employee.profile.address', 'Address')}</Label>
                <div className="relative">
                  <MapPin className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                  <Textarea id="address" rows={2} className="pl-9" {...form.register('address')} disabled={updateMutation.isPending} />
                </div>
                {form.formState.errors.address ? (
                  <p className="text-destructive text-xs">{te(form.formState.errors.address.message ?? '')}</p>
                ) : null}
              </div>

              <div className="flex pt-2 sm:justify-end">
                <Button type="submit" className="h-11 w-full sm:w-auto" disabled={updateMutation.isPending || !form.formState.isDirty}>
                  {updateMutation.isPending ? t('employee.common.saving', 'Saving…') : t('employee.profile.save', 'Save Changes')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </EmployeePageShell>
  );
}
