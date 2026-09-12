'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import {
  KeyRound,
  Shield,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CustomerPageShell, changePasswordSchema, type ChangePasswordInput } from '@/features/customer/shared';
import { customerService } from '@/lib/api/services/customer.service';
import { toast } from 'sonner';

export function CustomerChangePasswordPage() {
  const router = useRouter();

  const changePasswordMutation = useMutation({
    mutationFn: (values: ChangePasswordInput) => customerService.changePassword(values),
  });

  const {
    register,
    handleSubmit,
    reset,
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
      toast.success('Password changed successfully!');
      reset();
      router.push('/customer/profile');
    } catch {
      toast.error('Failed to change password. Please verify current password.');
    }
  };

  return (
    <CustomerPageShell
      title="Change Password"
      subtitle="Update your customer portal access credentials."
      breadcrumbs={[
        { label: 'Customer', href: '/customer/dashboard' },
        { label: 'Profile', href: '/customer/profile' },
        { label: 'Change Password' },
      ]}
      actions={
        <Link href="/customer/profile">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Profile
          </Button>
        </Link>
      }
    >
      <div className="max-w-md mx-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-primary" />
                Security Credentials
              </CardTitle>
              <CardDescription className="text-xs">
                Enter your existing password followed by your new password.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="Enter current password"
                  {...register('currentPassword')}
                />
                {errors.currentPassword && (
                  <p className="text-xs text-destructive">{errors.currentPassword.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Minimum 6 characters"
                  {...register('newPassword')}
                />
                {errors.newPassword && (
                  <p className="text-xs text-destructive">{errors.newPassword.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repeat new password"
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="p-3 rounded-lg border bg-muted/30 text-xs text-muted-foreground space-y-1">
                <span className="font-semibold text-foreground flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5 text-primary" />
                  Password Requirements:
                </span>
                <p>• At least 6 characters in length</p>
                <p>• Recommended: combine letters, numbers, and symbols</p>
              </div>

              <div className="pt-3 border-t flex justify-end gap-3">
                <Link href="/customer/profile">
                  <Button variant="ghost" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="font-bold gap-2 shadow-sm"
                >
                  <KeyRound className="h-4 w-4" />
                  {changePasswordMutation.isPending ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </CustomerPageShell>
  );
}
