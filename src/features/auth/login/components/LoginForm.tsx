'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Eye,
  EyeOff,
  Loader2,
  Zap,
  Crown,
  Shield,
  Users,
  UserCheck,
  User,
  ChevronRight,
} from 'lucide-react';
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
import { authService, type DebugAccountItem } from '@/lib/api/services/auth.service';
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
  const [debugAccounts, setDebugAccounts] = useState<DebugAccountItem[]>([]);
  const [quickLoginId, setQuickLoginId] = useState<number | null>(null);

  const isDebugMode =
    process.env.NEXT_PUBLIC_APP_ENV === 'debug' ||
    process.env.NODE_ENV === 'development';

  useEffect(() => {
    if (!isDebugMode) return;
    let cancelled = false;
    authService
      .getDebugAccounts()
      .then((data) => {
        if (!cancelled && Array.isArray(data)) {
          setDebugAccounts(data);
        }
      })
      .catch(() => {
        // Silently skip if debug accounts endpoint is unavailable
      });
    return () => {
      cancelled = true;
    };
  }, [isDebugMode]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setError(null);
    try {
      const password = values.password && values.password.trim().length > 0 ? values.password : 'debug';
      const user = await login(values.email, password, needsOtp ? values.otp?.trim() : undefined);
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

  const handleQuickLogin = async (acc: DebugAccountItem) => {
    setError(null);
    setQuickLoginId(acc.id);
    setValue('email', acc.email);
    setValue('password', 'debug');
    try {
      const user = await login(acc.email, 'debug');
      toast.success(t('auth.login.welcomeToast', 'Welcome back, {name}', { name: user.name }));
      const redirect = searchParams.get('redirect');
      const destination = getPostLoginRedirect(user.role, redirect);
      router.replace(destination);
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : 'Quick sign in failed');
      setQuickLoginId(null);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return {
          icon: Crown,
          label: 'Super Admin',
          color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
        };
      case 'admin':
        return {
          icon: Shield,
          label: 'ISP Admin',
          color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        };
      case 'resellerAdmin':
        return {
          icon: Users,
          label: 'Reseller Admin',
          color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        };
      case 'employee':
        return {
          icon: UserCheck,
          label: 'Employee / Staff',
          color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        };
      case 'user':
      default:
        return {
          icon: User,
          label: 'Customer / Subscriber',
          color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
        };
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
              <div className="flex items-center gap-1.5">
                <Label htmlFor="password" className="text-xs font-semibold">{t('auth.login.passwordLabel', 'Password')}</Label>
                {isDebugMode ? (
                  <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                    Optional (Debug)
                  </span>
                ) : null}
              </div>
              <Link href="/forgot-password" className="text-primary text-xs font-medium hover:underline">
                {t('auth.login.forgot', 'Forgot password?')}
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder={isDebugMode ? 'Password optional (Debug mode)' : t('auth.login.passwordPlaceholder', 'Enter your password')}
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

        {isDebugMode && debugAccounts.length > 0 ? (
          <div className="rounded-2xl border border-dashed border-amber-500/40 bg-amber-500/5 p-4 dark:bg-amber-950/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5" /> Quick Access (Debug Mode)
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono bg-muted/60 px-1.5 py-0.5 rounded">
                APP_ENV=debug
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Real database accounts per role. Click any card for instant 1-click access:
            </p>
            <div className="space-y-1.5">
              {debugAccounts.map((acc) => {
                const badge = getRoleBadge(acc.role);
                const Icon = badge.icon;
                const isLoggingIn = quickLoginId === acc.id;

                return (
                  <button
                    key={acc.id}
                    type="button"
                    disabled={isSubmitting || quickLoginId !== null}
                    onClick={() => handleQuickLogin(acc)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-background/90 hover:bg-accent/70 hover:border-primary/50 text-left transition-all group disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-1.5 rounded-lg border ${badge.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-foreground truncate max-w-[130px]">
                            {acc.name}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium border ${badge.color}`}>
                            {badge.label}
                          </span>
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono truncate max-w-[210px]">
                          {acc.email}
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center text-primary group-hover:translate-x-0.5 transition-transform pl-1">
                      {isLoggingIn ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
