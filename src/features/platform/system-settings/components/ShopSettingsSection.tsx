'use client';

import { useMemo } from 'react';
import { useTranslations } from '@/i18n/locale-context';
import { SettingsSectionForm, type FieldGroup } from './SettingsSectionForm';

export function ShopSettingsSection() {
  const t = useTranslations();
  const groups = useMemo<FieldGroup[]>(
    () => [
      {
        title: t('platform.systemSettings.shop.title', 'Shop & equipment'),
        description: t(
          'platform.systemSettings.shop.hint',
          'Settings for the router / ONU / cable shop customers buy from.',
        ),
        fields: [
          {
            key: 'shop_enabled',
            label: t('platform.systemSettings.shop.enabled', 'Shop'),
            type: 'select',
            fallback: 'yes',
            options: {
              yes: t('platform.systemSettings.shop.enabledYes', 'On — customers can order'),
              no: t('platform.systemSettings.shop.enabledNo', 'Off — hide the shop'),
            },
          },
          {
            key: 'shop_contact_phone',
            label: t('platform.systemSettings.shop.contactPhone', 'Shop contact phone'),
          },
          {
            key: 'shop_delivery_note',
            label: t('platform.systemSettings.shop.deliveryNote', 'Delivery note'),
            type: 'textarea',
            hint: t(
              'platform.systemSettings.shop.deliveryHint',
              'Shown to customers when they place an order.',
            ),
          },
        ],
      },
    ],
    [t],
  );
  return <SettingsSectionForm section="shop_settings" groups={groups} />;
}
