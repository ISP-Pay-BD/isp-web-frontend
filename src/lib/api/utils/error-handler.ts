import { AxiosError } from 'axios';
import { toast } from 'sonner';
import type { UseFormSetError, FieldValues, Path } from 'react-hook-form';
import type { ApiErrorResponse } from '../types';

export function handleApiError<TFieldValues extends FieldValues = FieldValues>(
  error: unknown,
  setError?: UseFormSetError<TFieldValues>,
  defaultFallbackMessage = 'Something went wrong. Please try again.',
): string {
  let errorMessage = defaultFallbackMessage;

  if (error instanceof AxiosError) {
    const errorData = error.response?.data as ApiErrorResponse | undefined;

    if (errorData?.error?.message) {
      errorMessage = errorData.error.message;
    } else if (typeof errorData?.error === 'string') {
      errorMessage = errorData.error;
    } else if (error.message) {
      errorMessage = error.message;
    }

    // Map validation error details to React Hook Form fields
    if (setError && errorData?.error?.details && typeof errorData.error.details === 'object') {
      Object.entries(errorData.error.details).forEach(([field, messages]) => {
        const msg = Array.isArray(messages) ? messages[0] : messages;
        if (msg) {
          setError(field as Path<TFieldValues>, {
            type: 'server',
            message: String(msg),
          });
        }
      });
    }
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  toast.error(errorMessage);
  return errorMessage;
}
