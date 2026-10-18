'use client';

import { PortalError } from '@/components/shared/PortalError';

export default function PlatformError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <PortalError {...props} homeHref="/platform/dashboard" />;
}
