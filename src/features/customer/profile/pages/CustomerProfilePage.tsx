'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  User,
  KeyRound,
  CheckCircle2,
  Save,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CustomerPageShell, CustomerLoadingSkeleton, CustomerErrorState } from '@/features/customer/shared';
import { useCustomerProfile } from '../hooks/use-customer-profile';
import { updateProfileSchema, type UpdateProfileInput } from '@/features/customer/shared';
import { formatDate } from '@/lib/format';
import { toast } from 'sonner';

export function CustomerProfilePage() {
  const { data, isLoading, isError, refetch, updateProfileMutation } = useCustomerProfile();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    values: data
      ? {
          name: data.profile.name,
          phone: data.profile.phone,
          email: data.profile.email,
          address: data.profile.address,
        }
      : undefined,
  });

  if (isLoading) {
    return (
      <CustomerPageShell title="My Profile" subtitle="Loading customer account details...">
        <CustomerLoadingSkeleton />
      </CustomerPageShell>
    );
  }

  if (isError || !data) {
    return (
      <CustomerPageShell title="My Profile" subtitle="Subscriber Information">
        <CustomerErrorState onRetry={() => refetch()} />
      </CustomerPageShell>
    );
  }

  const { profile } = data;

  const onSubmit = async (values: UpdateProfileInput) => {
    try {
      await updateProfileMutation.mutateAsync(values);
      toast.success('Profile details updated successfully!');
    } catch {
      toast.error('Failed to update profile. Please verify your fields.');
    }
  };

  return (
    <CustomerPageShell
      title="Subscriber Profile"
      subtitle="View your customer ID, registered NID identity, network configuration, and update contact records."
      breadcrumbs={[
        { label: 'Customer', href: '/customer/dashboard' },
        { label: 'Profile' },
      ]}
      actions={
        <Link href="/customer/change-password">
          <Button variant="outline" size="sm" className="gap-2">
            <KeyRound className="h-4 w-4" />
            Change Password
          </Button>
        </Link>
      }
    >
      <div className="space-y-6">
        {/* Customer Identity Banner */}
        <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-2xl border border-primary/20">
                {profile.avatarInitials}
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-bold">{profile.name}</h2>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {profile.customerId}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Subscriber since {formatDate(profile.createdAt)} · POP Area:{' '}
                  <strong>{profile.areaName}</strong>
                </p>
              </div>
            </div>

            <Badge variant="outline" className="text-xs gap-1.5 self-start sm:self-auto py-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              NID Verified Account
            </Badge>
          </div>

          {/* Network & Identity Specs */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mt-6 text-xs">
            <div className="rounded-xl border p-3.5 bg-muted/20 space-y-1">
              <span className="text-muted-foreground font-medium">National ID / Smart NID</span>
              <div className="font-mono font-bold text-sm text-foreground">{profile.nid}</div>
              <span className="text-muted-foreground text-[11px]">BTRC Verified Document</span>
            </div>

            <div className="rounded-xl border p-3.5 bg-muted/20 space-y-1">
              <span className="text-muted-foreground font-medium">PPPoE Username</span>
              <div className="font-mono font-bold text-sm text-foreground">{profile.username}</div>
              <span className="text-muted-foreground text-[11px]">Assigned Dial-up ID</span>
            </div>

            <div className="rounded-xl border p-3.5 bg-muted/20 space-y-1">
              <span className="text-muted-foreground font-medium">Hardware MAC Address</span>
              <div className="font-mono font-bold text-sm text-foreground">{profile.macAddress}</div>
              <span className="text-muted-foreground text-[11px]">Bound to Port</span>
            </div>

            <div className="rounded-xl border p-3.5 bg-muted/20 space-y-1">
              <span className="text-muted-foreground font-medium">Connection Type</span>
              <div className="font-bold text-sm text-foreground uppercase">{profile.connectionType}</div>
              <span className="text-muted-foreground text-[11px]">Fiber to the Home (FTTH)</span>
            </div>
          </div>
        </div>

        {/* Editable Contact Information Form */}
        <div className="max-w-2xl">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Contact Details
                </CardTitle>
                <CardDescription className="text-xs">
                  Ensure your phone number and email are up to date for payment SMS receipts and service outage notifications.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" {...register('name')} />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Mobile Phone (SMS Alerts)</Label>
                    <Input id="phone" {...register('phone')} />
                    {errors.phone && (
                      <p className="text-xs text-destructive">{errors.phone.message}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" {...register('email')} />
                    {errors.email && (
                      <p className="text-xs text-destructive">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="address">Installation Physical Address</Label>
                  <Input id="address" {...register('address')} />
                  {errors.address && (
                    <p className="text-xs text-destructive">{errors.address.message}</p>
                  )}
                </div>

                <div className="pt-3 border-t flex justify-end">
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="font-bold gap-2 shadow-sm"
                  >
                    <Save className="h-4 w-4" />
                    {updateProfileMutation.isPending ? 'Saving...' : 'Update Profile Information'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </CustomerPageShell>
  );
}
