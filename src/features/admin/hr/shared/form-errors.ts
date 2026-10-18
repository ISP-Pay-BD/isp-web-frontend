import { toast } from 'sonner';
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { ApiError } from '@/lib/api/client';

/**
 * Map backend validation `details` (snake_case keys) onto form fields and
 * toast the backend message. `keyMap` renames backend keys to form keys.
 */
export function applyServerErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  keyMap: Record<string, string> = {},
): void {
  if (error instanceof ApiError && error.details && typeof error.details === 'object') {
    for (const [key, value] of Object.entries(error.details as Record<string, unknown>)) {
      const msg = Array.isArray(value) ? value[0] : value;
      if (msg) setError((keyMap[key] ?? key) as Path<T>, { type: 'server', message: String(msg) });
    }
  }
  toast.error(error instanceof Error && error.message ? error.message : 'Something went wrong. Please try again.');
}
