'use client';

import { Suspense } from 'react';
import { AuthBrandPanel } from '../components/AuthBrandPanel';
import { LoginForm } from '../components/LoginForm';

function LoginFormFallback() {
  return (
    <div className="flex w-full items-center justify-center lg:w-1/2">
      <p className="text-muted-foreground text-sm">Loading sign in…</p>
    </div>
  );
}

export function LoginPage() {
  return (
    <div className="bg-background flex min-h-screen">
      <AuthBrandPanel variant="login" />
      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
