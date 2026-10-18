'use client';

import { PortalError } from '@/components/shared/PortalError';

export default function CustomerError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <PortalError {...props} homeHref="/customer/dashboard" />;
}
