import Link from 'next/link';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <div className="bg-background flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <div className="border-border/60 bg-muted text-muted-foreground mb-6 flex h-14 w-14 items-center justify-center rounded-lg border shadow-[var(--shadow-xs)]">
        <FileQuestion className="h-6 w-6" />
      </div>
      <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-muted-foreground mt-3 max-w-md text-sm leading-relaxed">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button variant="outline" render={<Link href="/" />}>
          <Home className="mr-2 h-4 w-4" />
          Home
        </Button>
        <Button render={<Link href="/login" />}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Sign in
        </Button>
      </div>
    </div>
  );
}
