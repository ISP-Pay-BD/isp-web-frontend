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
import {
  EmployeePageShell,
  EmployeeLoadingSkeleton,
  EmployeeErrorState,
} from '@/features/employee/shared';
import { formatDay } from '@/features/employee/shared/lib/datetime';
import { useEmployeeProfile, useUpdateEmployeeProfile } from '../hooks/use-employee-profile';
import { profileUpdateSchema, type ProfileUpdateFormValues } from '../schemas/profile.schema';

export function EmployeeProfilePage() {
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
      <EmployeePageShell title="My Profile" subtitle="Loading profile...">
        <EmployeeLoadingSkeleton />
      </EmployeePageShell>
    );
  }

  if (isError || !profile) {
    return (
      <EmployeePageShell title="My Profile" subtitle="Manage your account details">
        <EmployeeErrorState message={error?.message} onRetry={() => refetch()} />
      </EmployeePageShell>
    );
  }

  const facts: [string, string][] = [
    ['Employer', profile.employerName || '—'],
    ['Service Areas', profile.areaNames.join(', ') || '—'],
    ['National ID', profile.nidNumber || '—'],
    [
      'Location Tracking',
      profile.locationRequired ? `Required${profile.locationInterval ? ` · every ${profile.locationInterval} min` : ''}` : 'Off',
    ],
  ];

  return (
    <EmployeePageShell
      title="My Profile"
      subtitle="View and update your personal information"
      breadcrumbs={[
        { label: 'Employee', href: '/employee/salaries' },
        { label: 'Profile' },
      ]}
    >
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Employment Details</CardTitle>
            <CardDescription>Read-only information from HR records</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-start gap-3">
              <User className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="text-muted-foreground">Designation</p>
                <p className="font-medium">{profile.designationLabel || '—'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building2 className="text-muted-foreground mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <p className="text-muted-foreground">Joined</p>
                <p className="font-medium">{formatDay(profile.joinedAt) || '—'}</p>
              </div>
            </div>
            {facts.map(([label, value]) => (
              <div key={label}>
                <p className="text-muted-foreground">{label}</p>
                <p className="font-medium">{value}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg">Personal Information</CardTitle>
            <CardDescription>Update your contact details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input id="name" className="pl-9" {...form.register('name')} disabled={updateMutation.isPending} />
                </div>
                {form.formState.errors.name ? (
                  <p className="text-destructive text-xs">{form.formState.errors.name.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Mobile Number</Label>
                <div className="relative">
                  <Phone className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    id="phone"
                    className="pl-9"
                    placeholder="01XXXXXXXXX"
                    {...form.register('phone')}
                    disabled={updateMutation.isPending}
                  />
                </div>
                {form.formState.errors.phone ? (
                  <p className="text-destructive text-xs">{form.formState.errors.phone.message}</p>
                ) : profile.mobile ? (
                  <p className="text-muted-foreground text-xs">Current: {formatBdPhone(profile.mobile)}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    id="email"
                    type="email"
                    className="pl-9"
                    {...form.register('email')}
                    disabled={updateMutation.isPending}
                  />
                </div>
                {form.formState.errors.email ? (
                  <p className="text-destructive text-xs">{form.formState.errors.email.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
                  <Textarea id="address" rows={2} className="pl-9" {...form.register('address')} disabled={updateMutation.isPending} />
                </div>
                {form.formState.errors.address ? (
                  <p className="text-destructive text-xs">{form.formState.errors.address.message}</p>
                ) : null}
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={updateMutation.isPending || !form.formState.isDirty}>
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </EmployeePageShell>
  );
}
