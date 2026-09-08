'use client';

import Link from 'next/link';
import { ShieldOff, ArrowLeft, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store';
import { ROLE_HOME } from '@/lib/auth/route-access';

export function ForbiddenPage() {
  const user = useAuthStore((s) => s.user);
  const home = user ? (ROLE_HOME[user.role] ?? '/login') : '/login';

  return (
    <div className="bg-background flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <div className="border-destructive/20 bg-destructive/5 text-destructive mb-6 flex h-14 w-14 items-center justify-center rounded-lg border shadow-[var(--shadow-xs)]">
        <ShieldOff className="h-6 w-6" />
      </div>
      <h1 className="text-3xl font-semibold tracking-tight">Access denied</h1>
      <p className="text-muted-foreground mt-3 max-w-md text-sm leading-relaxed">
        You don&apos;t have permission to view this page. Contact your administrator if you
        believe this is a mistake.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button variant="outline" render={<Link href={home} />}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {user ? 'Go to dashboard' : 'Back home'}
        </Button>
        {!user ? (
          <Button render={<Link href="/login" />}>
            <LogIn className="mr-2 h-4 w-4" />
            Sign in
          </Button>
        ) : null}
      </div>
    </div>
  );
}
