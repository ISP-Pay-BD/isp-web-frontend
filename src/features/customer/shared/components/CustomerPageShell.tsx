import type { ReactNode } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface CustomerPageShellProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: ReactNode;
  children: ReactNode;
}

export function CustomerPageShell({
  title,
  subtitle,
  breadcrumbs = [{ label: 'Customer', href: '/customer/dashboard' }],
  actions,
  children,
}: CustomerPageShellProps) {
  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-16 md:pb-8">
      {/* Page Header matching PHP /components/page-header.php */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          {breadcrumbs.length > 0 && (
            <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              {breadcrumbs.map((bc, idx) => (
                <span key={idx} className="flex items-center gap-1.5">
                  {idx > 0 && <ChevronRight className="h-3 w-3 opacity-60" />}
                  {bc.href ? (
                    <Link href={bc.href} className="hover:text-foreground transition-colors">
                      {bc.label}
                    </Link>
                  ) : (
                    <span className="font-medium text-foreground">{bc.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>

        {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
      </div>

      {/* Main Content Area */}
      <div>{children}</div>
    </div>
  );
}
