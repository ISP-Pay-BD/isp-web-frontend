'use client';

import { useState } from 'react';
import Link from 'next/link';
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

const schema = z
  .object({
    password: z.string().min(8, 'At least 8 characters'),
    confirm: z.string().min(8),
  })
  .refine((v) => v.password === v.confirm, { message: 'Passwords must match', path: ['confirm'] });

type Values = z.infer<typeof schema>;

export function ResetPasswordPage() {
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 600));
    setDone(true);
    toast.success('Password updated');
  };

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

          {done ? (
            <Alert>
              <AlertDescription>
                Password updated.{' '}
                <Link href="/login" className="text-primary font-medium underline underline-offset-2">
                  Sign in
                </Link>
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <Input id="password" type="password" autoComplete="new-password" {...register('password')} />
                {errors.password ? (
                  <p className="text-destructive text-sm">{errors.password.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm password</Label>
                <Input id="confirm" type="password" autoComplete="new-password" {...register('confirm')} />
                {errors.confirm ? (
                  <p className="text-destructive text-sm">{errors.confirm.message}</p>
                ) : null}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Update password
              </Button>
            </form>
          )}

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
