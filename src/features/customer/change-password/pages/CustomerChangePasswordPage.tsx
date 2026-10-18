'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { KeyRound, Shield, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CustomerPageShell, changePasswordSchema, type ChangePasswordInput } from '@/features/customer/shared';
import { customerService } from '@/lib/api/services/customer.service';
import { ApiError } from '@/lib/api/client';
import { useLocale } from '@/i18n/locale-context';
import { toast } from 'sonner';

/** ProfileService::changePassword field keys → form fields. */
const FIELD_MAP: Record<string, keyof ChangePasswordInput> = {
  current_password: 'currentPassword',
  new_password: 'newPassword',
};

export function CustomerChangePasswordPage() {
  const { t, te } = useLocale();
  const router = useRouter();

  /** POST /v1/customer/profile/change-password — user resolved from the JWT. */
  const changePasswordMutation = useMutation({
    meta: { silent: true },
    mutationFn: (values: ChangePasswordInput) =>
      customerService.changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword }),
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ChangePasswordInput) => {
    try {
      await changePasswordMutation.mutateAsync(data);
      toast.success(t('customer.changePassword.success', 'Password changed successfully.'));
      reset();
      router.push('/customer/profile');
    } catch (err) {
      if (err instanceof ApiError && err.details) {
        for (const [key, messages] of Object.entries(err.details)) {
          const field = FIELD_MAP[key];
          const message = Array.isArray(messages) ? messages[0] : messages;
          if (field && message) setError(field, { type: 'server', message: String(message) });
        }
      }
      toast.error(
        err instanceof Error && err.message ? err.message : t('customer.changePassword.failed', 'Could not change your password.'),
      );
    }
  };

  return (
    <CustomerPageShell
      title={t('customer.changePassword.title', 'Change Password')}
      subtitle={t('customer.changePassword.subtitle', 'Update your customer portal access credentials.')}
      breadcrumbs={[
        { label: t('customer.common.crumb', 'Customer'), href: '/customer/dashboard' },
        { label: t('customer.changePassword.profileCrumb', 'Profile'), href: '/customer/profile' },
        { label: t('customer.changePassword.crumb', 'Change password') },
      ]}
      actions={
        <Button variant="outline" className="h-11 w-full gap-2 sm:w-auto" render={<Link href="/customer/profile" />}>
          <ArrowLeft className="h-4 w-4" />
          {t('customer.changePassword.back', 'Back to profile')}
        </Button>
      }
    >
      <div className="mx-auto max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <KeyRound className="text-primary h-5 w-5" />
                {t('customer.changePassword.cardTitle', 'Security credentials')}
              </CardTitle>
              <CardDescription className="text-sm">
                {t('customer.changePassword.cardHint', 'Enter your existing password followed by your new password.')}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword" className="text-sm">
                  {t('customer.changePassword.current', 'Current password')}
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  className="h-11"
                  placeholder={t('customer.changePassword.currentPlaceholder', 'Enter current password')}
                  {...register('currentPassword')}
                />
                {errors.currentPassword && <p className="text-destructive text-sm">{te(errors.currentPassword.message ?? '')}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="newPassword" className="text-sm">
                  {t('customer.changePassword.new', 'New password')}
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  autoComplete="new-password"
                  className="h-11"
                  placeholder={t('customer.changePassword.newPlaceholder', 'Minimum 6 characters')}
                  {...register('newPassword')}
                />
                {errors.newPassword && <p className="text-destructive text-sm">{te(errors.newPassword.message ?? '')}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-sm">
                  {t('customer.changePassword.confirm', 'Confirm new password')}
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  className="h-11"
                  placeholder={t('customer.changePassword.confirmPlaceholder', 'Repeat new password')}
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && <p className="text-destructive text-sm">{te(errors.confirmPassword.message ?? '')}</p>}
              </div>

              <div className="bg-muted/30 text-muted-foreground space-y-1 rounded-lg border p-3 text-sm">
                <span className="text-foreground flex items-center gap-1.5 font-semibold">
                  <Shield className="text-primary h-4 w-4" />
                  {t('customer.changePassword.requirements', 'Password requirements:')}
                </span>
                <p>• {t('customer.changePassword.ruleLength', 'At least 6 characters in length')}</p>
                <p>• {t('customer.changePassword.ruleMix', 'Recommended: combine letters, numbers, and symbols')}</p>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row sm:justify-end">
                <Button variant="ghost" type="button" className="h-11 w-full sm:w-auto" render={<Link href="/customer/profile" />}>
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button type="submit" disabled={changePasswordMutation.isPending} className="h-11 w-full gap-2 font-bold sm:w-auto">
                  <KeyRound className="h-4 w-4" />
                  {changePasswordMutation.isPending
                    ? t('customer.changePassword.updating', 'Updating…')
                    : t('customer.changePassword.update', 'Update password')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </CustomerPageShell>
  );
}
