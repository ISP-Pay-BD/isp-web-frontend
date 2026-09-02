import type { ReactNode } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumb?: BreadcrumbItem[];
  actions?: ReactNode;
}

export function PlatformPageHeader({
  title,
  subtitle,
  breadcrumb = [{ label: 'Platform', href: '/platform/dashboard' }],
  actions,
}: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        {breadcrumb.length > 0 ? (
          <nav className="text-muted-foreground flex items-center gap-1.5 text-xs">
            {breadcrumb.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                {idx > 0 ? <ChevronRight className="h-3 w-3" /> : null}
                {item.href ? (
                  <Link href={item.href} className="hover:text-foreground transition-colors">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-foreground font-medium">{item.label}</span>
                )}
              </div>
            ))}
          </nav>
        ) : null}
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
          {title}
        </h1>
        {subtitle ? <p className="text-muted-foreground text-sm">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
