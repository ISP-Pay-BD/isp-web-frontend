'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Key, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { brandAssets } from '@/config/assets';
import { siteConfig } from '@/config/site';
import { AuthBrandPanel } from '@/features/auth/login/components/AuthBrandPanel';
import { authService } from '@/lib/api/services/auth.service';
import { handleApiError } from '@/lib/api/utils/error-handler';

const schema = z
  .object({
    email: z.string().email('Enter a valid email address'),
    code: z.string().trim().min(1, 'Enter the reset code from your email'),
    password: z.string().min(8, 'At least 8 characters'),
    confirm: z.string().min(8, 'At least 8 characters'),
  })
  .refine((v) => v.password === v.confirm, { message: 'Passwords must match', path: ['confirm'] });

type Values = z.infer<typeof schema>;

function ResetPasswordForm() {
  const params = useSearchParams();
  const linkEmail = params.get('email') ?? '';
  const linkCode = params.get('code') ?? '';
  const fromLink = Boolean(linkEmail && linkCode);
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: linkEmail, code: linkCode, password: '', confirm: '' },
  });

  const onSubmit = async (values: Values) => {
    try {
      await authService.resetPassword({ email: values.email, code: values.code, newPassword: values.password });
      setDone(true);
      toast.success('Password updated');
    } catch (err) {
      handleApiError(err, (field, error) =>
        setError(field === 'new_password' ? 'password' : (field as keyof Values), error),
      );
    }
  };

  if (done) {
    return (
      <Alert>
        <AlertDescription>
          Password updated.{' '}
          <Link href="/login" className="text-primary font-medium underline underline-offset-2">
            Sign in
          </Link>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className={fromLink ? 'hidden' : 'space-y-4'}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" {...register('email')} />
          {errors.email ? <p className="text-destructive text-sm">{errors.email.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="code">Reset code</Label>
          <Input id="code" autoComplete="one-time-code" {...register('code')} />
          {errors.code ? <p className="text-destructive text-sm">{errors.code.message}</p> : null}
        </div>
      </div>
      {fromLink ? (
        <p className="text-muted-foreground text-sm">
          Resetting the password for <span className="text-foreground font-medium">{linkEmail}</span>
        </p>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <Input id="password" type="password" autoComplete="new-password" {...register('password')} />
        {errors.password ? <p className="text-destructive text-sm">{errors.password.message}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm">Confirm password</Label>
        <Input id="confirm" type="password" autoComplete="new-password" {...register('confirm')} />
        {errors.confirm ? <p className="text-destructive text-sm">{errors.confirm.message}</p> : null}
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Update password
      </Button>
    </form>
  );
}

export function ResetPasswordPage() {
  return (
    <div className="bg-background grid min-h-dvh lg:grid-cols-2">
      <AuthBrandPanel variant="forgot" />
      <div className="flex flex-col justify-center px-6 py-12 sm:px-10">
        <div className="mx-auto w-full max-w-md space-y-6">
          <div className="flex items-center gap-3 lg:hidden">
            <Image src={brandAssets.logo} alt={`${siteConfig.name} logo`} width={36} height={36} />
            <span className="font-semibold">{siteConfig.name}</span>
          </div>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <Key className="text-primary h-5 w-5" />
              Reset password
            </h1>
            <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
              Choose a new password for your account
            </p>
          </div>

          <Suspense fallback={null}>
            <ResetPasswordForm />
          </Suspense>

          <Link
            href="/login"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
