'use client';

import { PortalError } from '@/components/shared/PortalError';

export default function EmployeeError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return <PortalError {...props} homeHref="/employee/attendance" />;
}
