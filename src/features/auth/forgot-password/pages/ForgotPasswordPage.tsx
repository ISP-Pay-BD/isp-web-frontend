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
import { mockFetch } from '@/lib/mock-api/client';
import { MockApiError } from '@/lib/mock-api/errors';
import { brandAssets } from '@/config/assets';
import { siteConfig } from '@/config/site';
import { AuthBrandPanel } from '@/features/auth/login/components/AuthBrandPanel';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from '../schemas/forgot-password.schema';

export function ForgotPasswordPage() {
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
      const result = await mockFetch('auth.forgotPassword', { email: values.email });
      setSuccessMessage(result.message);
      toast.success('Reset link dispatched');
    } catch (err) {
      const message =
        err instanceof MockApiError ? err.message : 'Something went wrong. Please try again.';
      setError(message);
    }
  };

  return (
    <div className="bg-background flex min-h-screen">
      <AuthBrandPanel variant="forgot" />

      <div className="flex w-full flex-col justify-center px-6 py-10 sm:px-10 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-md space-y-8">
          <Link
            href="/login"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>

          <div className="lg:hidden">
            <div className="mb-6 flex items-center gap-3">
              <Image src={brandAssets.logo} alt="" width={36} height={36} />
              <span className="text-lg font-semibold">{siteConfig.name}</span>
            </div>
          </div>

          {successMessage ? (
            <div className="space-y-6 text-center">
              <div className="bg-primary/10 text-primary mx-auto flex h-14 w-14 items-center justify-center rounded-full">
                <Send className="h-7 w-7" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">Check your email</h2>
                <p className="text-muted-foreground text-sm">{successMessage}</p>
              </div>
              <Button render={<Link href="/login" />} className="w-full">
                Back to sign in
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-xl">
                  <Key className="text-primary h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold tracking-tight">Reset your password</h2>
                  <p className="text-muted-foreground text-sm">
                    Enter your account email and we&apos;ll send you a secure reset link.
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
                  <Label htmlFor="forgot-email">Email address</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    {...register('email')}
                  />
                  {errors.email ? (
                    <p className="text-destructive text-sm">{errors.email.message}</p>
                  ) : null}
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    'Send reset link'
                  )}
                </Button>
              </form>

              <p className="text-muted-foreground text-center text-sm">
                Remember your password?{' '}
                <Link href="/login" className="text-primary font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
