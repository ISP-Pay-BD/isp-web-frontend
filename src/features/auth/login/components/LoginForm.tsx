'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuthStore } from '@/stores/auth-store';
import { getPostLoginRedirect } from '@/lib/auth/route-access';
import { brandAssets } from '@/config/assets';
import { siteConfig } from '@/config/site';
import { ApiError } from '@/lib/api/client';
import { useLocale } from '@/i18n/locale-context';
import { loginSchema, type LoginFormValues } from '../schemas/login.schema';

export function LoginForm() {
  const { t, te } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsOtp, setNeedsOtp] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setError(null);
    try {
      const user = await login(values.email, values.password, needsOtp ? values.otp?.trim() : undefined);
      toast.success(t('auth.login.welcomeToast', 'Welcome back, {name}', { name: user.name }));
      const redirect = searchParams.get('redirect');
      const destination = getPostLoginRedirect(user.role, redirect);
      router.replace(destination);
    } catch (err) {
      if (err instanceof ApiError && (err.code === 'TWO_FACTOR_REQUIRED' || err.code === 'TWO_FACTOR_INVALID')) {
        setNeedsOtp(true);
      }
      setError(err instanceof Error && err.message ? err.message : t('auth.login.failed', 'Sign in failed. Please try again.'));
    }
  };

  return (
    <div className="flex w-full flex-col justify-center px-6 py-10 sm:px-10 lg:w-1/2 lg:px-16">
      <div className="mx-auto w-full max-w-md space-y-8">
        <div className="space-y-4 lg:hidden">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <Image src={brandAssets.logo} alt={t('common.sidebar.logoAlt', '{name} logo', { name: siteConfig.name })} width={36} height={36} />
            <span className="text-lg font-semibold group-hover:text-primary transition-colors">{siteConfig.name}</span>
          </Link>
        </div>

        <div className="space-y-2">
          <h2 className="font-landing-display text-2xl font-bold tracking-tight text-foreground">{t('auth.login.title', 'Welcome back')}</h2>
          <p className="text-muted-foreground text-sm">{t('auth.login.subtitle', 'Sign in to your ISP Pay BD operations dashboard')}</p>
        </div>

        {!error && searchParams.get('expired') ? (
          <Alert className="rounded-xl text-xs">
            <AlertDescription className="text-xs font-medium">{t('auth.login.sessionExpired', 'Your session expired. Please sign in again.')}</AlertDescription>
          </Alert>
        ) : null}

        {error ? (
          <Alert variant="destructive" className="rounded-xl border-destructive/20 bg-destructive/10 text-destructive">
            <AlertDescription className="text-xs font-medium">{error}</AlertDescription>
          </Alert>
        ) : null}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-semibold">{t('auth.login.emailLabel', 'Email or Operator ID')}</Label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              placeholder="operator@company.com"
              className="h-11 rounded-xl bg-background/80 focus-visible:ring-primary/40 focus-visible:border-primary text-sm"
              {...register('email')}
            />
            {errors.email ? (
              <p className="text-destructive text-xs mt-1">{te(errors.email.message ?? '')}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-semibold">{t('auth.login.passwordLabel', 'Password')}</Label>
              <Link href="/forgot-password" className="text-primary text-xs font-medium hover:underline">
                {t('auth.login.forgot', 'Forgot password?')}
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder={t('auth.login.passwordPlaceholder', 'Enter your password')}
                className="h-11 rounded-xl bg-background/80 pr-10 focus-visible:ring-primary/40 focus-visible:border-primary text-sm font-mono"
                {...register('password')}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute top-0 right-0 h-full px-3 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? t('auth.login.hidePassword', 'Hide password') : t('auth.login.showPassword', 'Show password')}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            {errors.password ? (
              <p className="text-destructive text-xs mt-1">{te(errors.password.message ?? '')}</p>
            ) : null}
          </div>

          {needsOtp ? (
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-xs font-semibold">{t('auth.login.otpLabel', 'Authentication code')}</Label>
              <Input
                id="otp"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                autoFocus
                placeholder={t('auth.login.otpPlaceholder', '6-digit code from your authenticator app')}
                className="h-11 rounded-xl bg-background/80 font-mono tracking-widest text-sm"
                {...register('otp')}
              />
            </div>
          ) : null}

          <Button
            type="submit"
            className="w-full h-11 rounded-xl bg-landing-cta text-white font-semibold text-sm shadow-[0_4px_14px_rgba(247,88,3,0.3)] hover:bg-landing-cta-hover hover:shadow-[0_6px_20px_rgba(247,88,3,0.4)] transition active:scale-[0.99] mt-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('auth.login.submitting', 'Signing in…')}
              </>
            ) : (
              t('auth.login.submit', 'Sign in to Dashboard')
            )}
          </Button>
        </form>

        <p className="text-muted-foreground text-center text-xs pt-2">
          {t('auth.login.noAccount', "Don't have an account?")}{' '}
          <Link href="/register" className="text-primary font-semibold hover:underline">
            {t('auth.login.createTrial', 'Create free trial')}
          </Link>
        </p>
      </div>
    </div>
  );
}
