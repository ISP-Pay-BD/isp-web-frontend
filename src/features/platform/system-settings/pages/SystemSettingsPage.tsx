'use client';

import { Clock, LogIn, MessageSquare, ShoppingBag, Smartphone, Wifi } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlatformPageHeader } from '@/features/platform/shared';
import { useTranslations } from '@/i18n/locale-context';
import { AppVersionSection } from '../components/AppVersionSection';
import { LoginPortalSection } from '../components/LoginPortalSection';
import { CaptivePortalSection } from '../components/CaptivePortalSection';
import { CronjobSection } from '../components/CronjobSection';
import { ShopSettingsSection } from '../components/ShopSettingsSection';
import { SmsBalanceSection } from '../components/SmsBalanceSection';

const TABS = [
  {
    value: 'app_version',
    icon: Smartphone,
    label: 'App version',
    render: () => <AppVersionSection />,
  },
  {
    value: 'login_portal',
    icon: LogIn,
    label: 'Login portal',
    render: () => <LoginPortalSection />,
  },
  {
    value: 'captive_portal',
    icon: Wifi,
    label: 'Captive portal',
    render: () => <CaptivePortalSection />,
  },
  { value: 'cronjob', icon: Clock, label: 'Cron jobs', render: () => <CronjobSection /> },
  {
    value: 'shop_settings',
    icon: ShoppingBag,
    label: 'Shop',
    render: () => <ShopSettingsSection />,
  },
  { value: 'sms', icon: MessageSquare, label: 'SMS balance', render: () => <SmsBalanceSection /> },
] as const;

export function SystemSettingsPage() {
  const t = useTranslations();
  return (
    <div className="space-y-6">
      <PlatformPageHeader
        title={t('platform.systemSettings.title', 'System Settings')}
        subtitle={t(
          'platform.systemSettings.subtitle',
          'Mobile app version, login and captive portals, cron schedule, shop and SMS gateway checks',
        )}
        breadcrumb={[
          { label: t('common.crumb.platform', 'Platform'), href: '/platform/dashboard' },
          { label: t('common.crumb.settings', 'Settings'), href: '/platform/settings' },
          { label: t('platform.systemSettings.crumb', 'System') },
        ]}
      />

      <Tabs defaultValue="app_version" className="space-y-4">
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <TabsList className="border-border/70 bg-card/60 h-auto w-max gap-1 rounded-xl border p-1.5">
            {TABS.map(({ value, icon: Icon, label }) => (
              <TabsTrigger key={value} value={value} className="gap-1.5 text-xs">
                <Icon className="h-3.5 w-3.5" />
                {t(`platform.systemSettings.tab.${value}`, label)}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {TABS.map(({ value, render }) => (
          <TabsContent key={value} value={value}>
            {render()}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
