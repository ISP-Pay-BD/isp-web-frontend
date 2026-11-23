'use client';

import { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CloudUpload } from 'lucide-react';
import { toast } from 'sonner';
import { handleApiError } from '@/lib/api/utils/error-handler';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslations } from '@/i18n/locale-context';
import { systemSettingsApi } from '../api/system-settings.api';
import { SettingsSectionForm, type FieldGroup } from './SettingsSectionForm';

function SyncApkCard({ r2Enabled }: { r2Enabled: boolean }) {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const sync = useMutation({
    mutationFn: systemSettingsApi.syncR2Apk,
    onSuccess: (message) => {
      toast.success(
        message || t('platform.systemSettings.app.synced', 'APK uploaded to Cloudflare R2'),
      );
      void queryClient.invalidateQueries({ queryKey: ['platform', 'system-settings'] });
    },
    onError: (err) => handleApiError(err),
  });

  return (
    <Card className="border-border/60">
      <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium">
            {t('platform.systemSettings.app.syncTitle', 'Sync the server APK to Cloudflare R2')}
          </p>
          <p className="text-muted-foreground text-xs">
            {r2Enabled
              ? t(
                  'platform.systemSettings.app.syncHint',
                  'Uploads the APK already on the server and points the download URL at R2, so app downloads stop using VPS bandwidth.',
                )
              : t(
                  'platform.systemSettings.app.syncOff',
                  'Turn on Cloudflare R2 storage and save the R2 credentials first.',
                )}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={!r2Enabled || sync.isPending}
          onClick={() => sync.mutate()}
          className="shrink-0"
        >
          <CloudUpload className="mr-1.5 h-4 w-4" />
          {sync.isPending
            ? t('platform.systemSettings.app.syncing', 'Uploading…')
            : t('platform.systemSettings.app.syncButton', 'Sync APK to R2')}
        </Button>
      </CardContent>
    </Card>
  );
}

export function AppVersionSection() {
  const t = useTranslations();
  const groups = useMemo<FieldGroup[]>(
    () => [
      {
        title: t('platform.systemSettings.app.versionTitle', 'Mobile app version'),
        description: t(
          'platform.systemSettings.app.versionHint',
          'The mobile app compares its version with these on start-up (/api/v1/app/min-version).',
        ),
        fields: [
          {
            key: 'app_latest_version',
            label: t('platform.systemSettings.app.latest', 'Latest app version'),
            placeholder: '1.0.0+1',
            fallback: '1.0.0+1',
            required: true,
          },
          {
            key: 'app_min_version',
            label: t('platform.systemSettings.app.min', 'Minimum required version'),
            placeholder: '1.0.0',
            fallback: '1.0.0',
            required: true,
          },
          {
            key: 'app_force_update',
            label: t('platform.systemSettings.app.force', 'Force update'),
            type: 'select',
            fallback: 'no',
            options: {
              no: t(
                'platform.systemSettings.app.forceNo',
                'No — only block versions below the minimum',
              ),
              yes: t(
                'platform.systemSettings.app.forceYes',
                'Yes — every outdated app must update',
              ),
            },
          },
          {
            key: 'app_download_url',
            label: t('platform.systemSettings.app.downloadUrl', 'App download URL'),
            type: 'url',
            placeholder: 'https://…',
          },
        ],
      },
      {
        title: t('platform.systemSettings.app.dialogTitle', 'Update dialog'),
        fields: [
          {
            key: 'app_update_title',
            label: t('platform.systemSettings.app.updateTitle', 'Dialog title'),
            fallback: 'নতুন সংস্করণ উপলব্ধ',
            wide: true,
          },
          {
            key: 'app_message_bn',
            label: t('platform.systemSettings.app.messageBn', 'Message (Bangla)'),
            type: 'textarea',
          },
          {
            key: 'app_release_notes',
            label: t('platform.systemSettings.app.releaseNotes', 'Release notes'),
            type: 'textarea',
          },
        ],
      },
      {
        title: t('platform.systemSettings.app.r2Title', 'Cloudflare R2 storage'),
        description: t(
          'platform.systemSettings.app.r2Hint',
          'Serve the APK from R2 instead of the VPS. The secret key is write-only and never shown again.',
        ),
        fields: [
          {
            key: 'r2_enabled',
            label: t('platform.systemSettings.app.r2Enabled', 'Use Cloudflare R2'),
            type: 'select',
            fallback: 'no',
            options: {
              no: t('platform.systemSettings.app.r2No', 'No — serve from the VPS'),
              yes: t('platform.systemSettings.app.r2Yes', 'Yes — sync and serve via R2'),
            },
          },
          { key: 'r2_account_id', label: t('platform.systemSettings.app.r2Account', 'Account ID') },
          { key: 'r2_bucket', label: t('platform.systemSettings.app.r2Bucket', 'Bucket name') },
          {
            key: 'r2_access_key_id',
            label: t('platform.systemSettings.app.r2AccessKey', 'Access key ID'),
          },
          {
            key: 'r2_secret_access_key',
            label: t('platform.systemSettings.app.r2Secret', 'Secret access key'),
            type: 'secret',
          },
          {
            key: 'r2_public_url',
            label: t('platform.systemSettings.app.r2PublicUrl', 'Public domain / CDN URL'),
            type: 'url',
            placeholder: 'https://cdn.example.com',
          },
        ],
      },
    ],
    [t],
  );

  return (
    <SettingsSectionForm
      section="app_version"
      groups={groups}
      footer={(v) => <SyncApkCard r2Enabled={v.r2_enabled === 'yes'} />}
    />
  );
}
