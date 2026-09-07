'use client';

import { HelpPage } from '@/features/marketing/help/pages/HelpPage';
import { PageHeader } from '@/features/shared/page-header';

export function CustomerHelpPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Help"
        subtitle="Guides for payments and reconnect"
        breadcrumb={[{ label: 'Dashboard', url: '/customer/dashboard' }, { label: 'Help' }]}
      />
      <HelpPage portal />
    </div>
  );
}
