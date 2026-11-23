'use client';

import { useMemo } from 'react';
import { useTranslations } from '@/i18n/locale-context';
import { SettingsSectionForm, type FieldGroup } from './SettingsSectionForm';

export function CaptivePortalSection() {
  const t = useTranslations();
  const groups = useMemo<FieldGroup[]>(
    () => [
      {
        title: t('platform.systemSettings.captive.title', 'Captive portal (expired PPPoE)'),
        description: t(
          'platform.systemSettings.captive.hint',
          'Global default for tenants: send expired PPPoE customers to a payment portal instead of cutting them off.',
        ),
        fields: [
          {
            key: 'enable_captive_portal',
            label: t('platform.systemSettings.captive.enable', 'Captive portal on expiry'),
            type: 'select',
            fallback: 'no',
            wide: true,
            options: {
              yes: t(
                'platform.systemSettings.captive.enableYes',
                'Yes — redirect expired PPPoE to the portal',
              ),
              no: t(
                'platform.systemSettings.captive.enableNo',
                'No — hard disconnect / disable the secret',
              ),
            },
          },
          {
            key: 'captive_portal_url',
            label: t('platform.systemSettings.captive.url', 'Default captive portal URL'),
            type: 'url',
            placeholder: 'https://…/captive-portal',
          },
          {
            key: 'captive_portal_dns_ip',
            label: t('platform.systemSettings.captive.dnsIp', 'Router gateway / DNS IP'),
            placeholder: '172.50.50.1',
          },
          {
            key: 'captive_portal_proxy_port',
            label: t('platform.systemSettings.captive.proxyPort', 'Web proxy port'),
            type: 'number',
            placeholder: '8080',
          },
          {
            key: 'captive_portal_helpline',
            label: t('platform.systemSettings.captive.helpline', 'Helpline phone'),
          },
          {
            key: 'captive_portal_allowed_domains',
            label: t(
              'platform.systemSettings.captive.domains',
              'Allowed domains (comma-separated)',
            ),
            type: 'textarea',
            hint: t(
              'platform.systemSettings.captive.domainsHint',
              'Expired customers can still open these — keep the payment gateways here.',
            ),
          },
        ],
      },
    ],
    [t],
  );
  return <SettingsSectionForm section="captive_portal" groups={groups} />;
}
