import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { siteConfig } from '@/config/site';

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-16">
      <div className="max-w-2xl space-y-4 text-center">
        <p className="text-primary text-sm font-semibold tracking-wide uppercase">
          Phase 0 — Foundation ready
        </p>
        <h1 className="text-4xl font-bold tracking-tight">{siteConfig.name}</h1>
        <p className="text-muted-foreground text-lg">
          Next.js frontend initialized with shadcn/ui, mock API layer, permissions, and clean
          architecture. Static UI build starts in Phase 1.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/login">
          <Button>Login (Phase 2)</Button>
        </Link>
        <a href="https://github.com/ISP-Pay-BD/isp-web-frontend/tree/main/docs">
          <Button variant="outline">View documentation</Button>
        </a>
      </div>
      <p className="text-muted-foreground max-w-lg text-center text-sm">
        Mock mode: {siteConfig.useMock ? 'ON' : 'OFF'} · See{' '}
        <code className="bg-muted rounded px-1.5 py-0.5 text-xs">docs/PROJECT-MEMORY.md</code>{' '}
        for AI context
      </p>
    </div>
  );
}
