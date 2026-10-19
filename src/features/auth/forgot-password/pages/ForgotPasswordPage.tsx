'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Key, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AxiosError } from 'axios';
import { http } from '@/lib/api/client';
import { brandAssets } from '@/config/assets';
import { siteConfig } from '@/config/site';
import { AuthBrandPanel } from '@/features/auth/login/components/AuthBrandPanel';
import { useLocale } from '@/i18n/locale-context';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '../schemas/forgot-password.schema';

export function ForgotPasswordPage() {
  const { t, te } = useLocale();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setError(null);
    try {
      await http.post('/common/forgot-password', { email: values.email });
      setSuccessMessage(
        t('auth.forgot.sent', 'If that email address is registered, a password reset link has been sent to it.'),
      );
      toast.success(t('auth.forgot.sentToast', 'Reset link sent'));
    } catch (err) {
      const apiMessage =
        err instanceof AxiosError
          ? (err.response?.data as { error?: { message?: string } } | undefined)?.error?.message
          : undefined;
      setError(apiMessage ?? t('auth.forgot.failed', 'Could not send reset link. Try again.'));
    }
  };

  return (
    <div className="bg-background flex min-h-dvh">
      <AuthBrandPanel variant="forgot" />

      <div className="flex w-full flex-col justify-center px-6 py-10 sm:px-10 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-md space-y-8">
          <Link
            href="/login"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('auth.forgot.back', 'Back to sign in')}
          </Link>

          <div className="lg:hidden">
            <div className="mb-6 flex items-center gap-3">
              <Image src={brandAssets.logo} alt={t('common.sidebar.logoAlt', '{name} logo', { name: siteConfig.name })} width={36} height={36} />
              <span className="text-lg font-semibold">{siteConfig.name}</span>
            </div>
          </div>

          {successMessage ? (
            <div className="space-y-6 text-center">
              <div className="bg-primary/10 text-primary mx-auto flex h-12 w-12 items-center justify-center rounded-lg">
                <Send className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight">{t('auth.forgot.checkEmail', 'Check your email')}</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">{successMessage}</p>
              </div>
              <Button render={<Link href="/login" />} className="w-full">
                {t('auth.forgot.back', 'Back to sign in')}
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-lg">
                  <Key className="text-primary h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold tracking-tight">{t('auth.forgot.title', 'Reset your password')}</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {t('auth.forgot.intro', "Enter your account email and we'll send you a secure reset link.")}
                  </p>
                </div>
              </div>

              {error ? (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : null}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">{t('auth.forgot.emailLabel', 'Email address')}</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    {...register('email')}
                  />
                  {errors.email ? (
                    <p className="text-destructive text-sm">{te(errors.email.message ?? '')}</p>
                  ) : null}
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('auth.forgot.sending', 'Sending…')}
                    </>
                  ) : (
                    t('auth.forgot.submit', 'Send reset link')
                  )}
                </Button>
              </form>

              <p className="text-muted-foreground text-center text-sm">
                {t('auth.forgot.remember', 'Remember your password?')}{' '}
                <Link href="/login" className="text-primary font-medium hover:underline">
                  {t('auth.forgot.signIn', 'Sign in')}
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
