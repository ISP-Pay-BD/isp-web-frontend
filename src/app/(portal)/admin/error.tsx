'use client';

import { PortalError } from '@/components/shared/PortalError';

export default function AdminError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <PortalError {...props} homeHref="/admin/dashboard" />;
}
