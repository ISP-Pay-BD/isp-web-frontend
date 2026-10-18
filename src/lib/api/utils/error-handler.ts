import { toast } from 'sonner';
import type { UseFormSetError, FieldValues, Path } from 'react-hook-form';
import { ApiError } from '../client';

/**
 * Toast the backend's message and, when a form is given, map validation
 * `details` onto its fields. Returns the message shown.
 */
export function handleApiError<TFieldValues extends FieldValues = FieldValues>(
  error: unknown,
  setError?: UseFormSetError<TFieldValues>,
  defaultFallbackMessage = 'Something went wrong. Please try again.',
): string {
  const message = error instanceof Error && error.message ? error.message : defaultFallbackMessage;

  if (setError && error instanceof ApiError && error.details) {
    for (const [field, messages] of Object.entries(error.details)) {
      const msg = Array.isArray(messages) ? messages[0] : messages;
      if (msg) setError(field as Path<TFieldValues>, { type: 'server', message: String(msg) });
    }
  }

  toast.error(message);
  return message;
}

/** Human message for an unknown error (for inline error states). */
export function errorMessage(error: unknown, fallback = 'Something went wrong.'): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
