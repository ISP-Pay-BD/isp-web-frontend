'use client';

import { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Only absolute or root-relative URLs can load here; legacy PHP file names (no host) cannot. */
export function renderableImage(src: string | null | undefined): string | null {
  const s = (src ?? '').trim();
  return /^(https?:)?\/\//i.test(s) || s.startsWith('/') ? s : null;
}

/** Cover / preview image with an icon placeholder when missing or broken. */
export function CmsImage({
  src,
  alt,
  className,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
}) {
  const url = renderableImage(src);
  const [failed, setFailed] = useState<string | null>(null);
  return (
    <div className={cn('bg-muted flex items-center justify-center overflow-hidden', className)}>
      {url && failed !== url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(url)}
          className="h-full w-full object-cover"
        />
      ) : (
        <ImageIcon className="text-muted-foreground h-6 w-6" aria-hidden />
      )}
    </div>
  );
}
