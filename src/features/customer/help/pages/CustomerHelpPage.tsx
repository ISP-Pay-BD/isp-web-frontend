'use client';

import { HelpPage } from '@/features/marketing/help/pages/HelpPage';
import { PageHeader } from '@/features/shared/page-header';
import { useTranslations } from '@/i18n/locale-context';

export function CustomerHelpPage() {
  const t = useTranslations();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('customer.help.title', 'Help')}
        subtitle={t('customer.help.subtitle', 'Guides for payments and reconnect')}
        breadcrumb={[
          { label: t('customer.help.dashboard', 'Dashboard'), url: '/customer/dashboard' },
          { label: t('customer.help.title', 'Help') },
        ]}
      />
      <HelpPage portal />
    </div>
  );
}
