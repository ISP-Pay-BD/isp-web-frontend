'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ServerCrash, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <div className="bg-destructive/10 text-destructive mb-6 flex h-16 w-16 items-center justify-center rounded-2xl">
        <ServerCrash className="h-8 w-8" />
      </div>
      <h1 className="text-3xl font-semibold tracking-tight">500 — Something went wrong</h1>
      <p className="text-muted-foreground mt-3 max-w-md text-sm leading-relaxed">
        An unexpected error occurred. Please try again or return to the home page.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button variant="outline" onClick={reset} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
        <Button render={<Link href="/" />}>
          <Home className="mr-2 h-4 w-4" />
          Home
        </Button>
      </div>
    </div>
  );
}
