'use client';

import { useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { http } from '@/lib/api/client';
import { useTranslations } from '@/i18n/locale-context';

/** Same limits as Rust `platform_r2::media::upload_media` (lane R10). */
const ACCEPT = 'image/png,image/jpeg,image/gif,image/webp,image/avif';
const EXTS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'avif'];
const MAX_BYTES = 2 * 1024 * 1024;

/** `POST /v1/platform/media` (super admin, multipart `file`) → 201 `{url, name, size}`; `url` is public. */
export function MediaUploadButton({
  onUploaded,
  disabled,
}: {
  onUploaded: (url: string) => void;
  disabled?: boolean;
}) {
  const t = useTranslations();
  const input = useRef<HTMLInputElement>(null);
  const upload = useMutation({
    mutationFn: (file: File) => {
      const form = new FormData();
      form.append('file', file);
      return http.upload<{ url?: string }>('/v1/platform/media', form);
    },
    onSuccess: (res) => {
      if (!res?.url) return;
      onUploaded(res.url);
      toast.success(t('platform.cms.media.uploaded', 'Image uploaded'));
    },
  });

  const pick = (file: File | undefined) => {
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!EXTS.includes(ext) || !file.type.startsWith('image/')) {
      toast.error(t('platform.cms.media.badType', 'Use a PNG, JPG, GIF, WebP or AVIF image.'));
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error(t('platform.cms.media.tooBig', 'The image must be 2 MB or smaller.'));
      return;
    }
    upload.mutate(file);
  };

  return (
    <>
      <input
        ref={input}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          pick(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="shrink-0"
        disabled={disabled || upload.isPending}
        onClick={() => input.current?.click()}
      >
        {upload.isPending ? (
          <Loader2 className="mr-1.5 h-4 w-4 animate-spin motion-reduce:animate-none" />
        ) : (
          <Upload className="mr-1.5 h-4 w-4" />
        )}
        {upload.isPending
          ? t('platform.cms.media.uploading', 'Uploading…')
          : t('platform.cms.media.upload', 'Upload')}
      </Button>
    </>
  );
}
