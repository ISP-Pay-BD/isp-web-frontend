'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Home, RefreshCw, ServerCrash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslations } from '@/i18n/locale-context';

interface PortalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  homeHref: string;
}

/** Error boundary body for a portal route group: it renders inside the shell, so the sidebar stays usable. */
export function PortalError({ error, reset, homeHref }: PortalErrorProps) {
  const t = useTranslations();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div role="alert" className="mx-auto flex max-w-md flex-col items-center px-6 py-20 text-center">
      <div className="bg-destructive/10 text-destructive mb-5 flex h-14 w-14 items-center justify-center rounded-2xl">
        <ServerCrash className="h-7 w-7" />
      </div>
      <h1 className="text-xl font-semibold tracking-tight">{t('shared.portalError.title', 'Something went wrong on this page')}</h1>
      <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
        {t('shared.portalError.description', 'The rest of the app still works. Try again, or go back to your dashboard.')}
      </p>
      {error.digest ? (
        <p className="text-muted-foreground mt-3 font-mono text-xs">{t('shared.portalError.reference', 'Reference: {ref}', { ref: error.digest })}</p>
      ) : null}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button variant="outline" onClick={reset} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          {t('shared.portalError.tryAgain', 'Try again')}
        </Button>
        <Button render={<Link href={homeHref} />} className="gap-2">
          <Home className="h-4 w-4" />
          {t('nav.dashboard', 'Dashboard')}
        </Button>
      </div>
    </div>
  );
}
