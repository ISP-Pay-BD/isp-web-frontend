'use client';

import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, KeyRound, CheckCircle2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  CustomerPageShell,
  CustomerLoadingSkeleton,
  CustomerErrorState,
  updateProfileSchema,
  type UpdateProfileInput,
} from '@/features/customer/shared';
import { useCustomerProfile, useUpdateProfile } from '../hooks/use-customer-profile';
import { handleApiError } from '@/lib/api/utils/error-handler';
import { formatDate } from '@/lib/format';
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
      <CustomerPageShell title="My Profile" subtitle="Loading customer account details...">
        <CustomerLoadingSkeleton variant="profile" />
      </CustomerPageShell>
    );
  }

  if (isError || !data || !account) {
    return (
      <CustomerPageShell title="My Profile" subtitle="Subscriber Information">
        <CustomerErrorState message={error?.message || undefined} onRetry={() => refetch()} />
      </CustomerPageShell>
    );
  }

  const onSubmit = async (values: UpdateProfileInput) => {
    try {
      await updateProfileMutation.mutateAsync(values);
      toast.success('Profile details updated.');
    } catch (err) {
      handleApiError(err, setError);
    }
  };

  return (
    <CustomerPageShell
      title="Subscriber Profile"
      subtitle="Your account details and contact information."
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
        <div className="rounded-2xl border bg-card p-6 md:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl border border-primary/20">
                {initials(account.name)}
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-xl font-bold">{account.name || '—'}</h2>
                  <Badge variant="secondary" className="font-mono text-xs">
                    ID {account.id}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Subscriber since {formatDate(account.createdAt)}
                </p>
              </div>
            </div>

            {account.nidVerified && (
              <Badge variant="outline" className="text-xs gap-1.5 self-start sm:self-auto py-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                NID Verified
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3 border-t border-border/60 mt-6 pt-4 text-xs">
            <div>
              <span className="text-muted-foreground font-medium">NID</span>
              <div className="font-mono font-semibold text-sm text-foreground mt-0.5">{account.nidNumber || '—'}</div>
            </div>
            <div>
              <span className="text-muted-foreground font-medium">Package</span>
              <div className="font-semibold text-sm text-foreground mt-0.5">{data.currentPackage?.name || '—'}</div>
            </div>
            <div>
              <span className="text-muted-foreground font-medium">Subscription</span>
              <div className="font-semibold text-sm text-foreground capitalize mt-0.5">
                {data.subscriptionStatus || '—'}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground font-medium">Valid until</span>
              <div className="font-mono font-semibold text-sm text-foreground mt-0.5">{formatDate(data.willExpire)}</div>
            </div>
          </div>
        </div>

        <div className="max-w-2xl">
          <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Contact Details
                </CardTitle>
                <CardDescription className="text-xs">
                  Keep your mobile number and email up to date for payment receipts and service notifications.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" {...register('name')} />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="mobile">Mobile Phone</Label>
                    <Input id="mobile" {...register('mobile')} />
                    {errors.mobile && <p className="text-xs text-destructive">{errors.mobile.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" {...register('email')} />
                    {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="address">Installation Address</Label>
                  <Input id="address" {...register('address')} />
                  {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
                </div>

                <div className="pt-3 border-t flex justify-end">
                  <Button type="submit" disabled={updateProfileMutation.isPending} className="font-bold gap-2 shadow-sm">
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
