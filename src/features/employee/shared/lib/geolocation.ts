import type { Coordinates } from '@/lib/api/services/employee.service';
import type { useTranslations } from '@/i18n/locale-context';

type Translate = ReturnType<typeof useTranslations>;
type GeoFailure = 'unsupported' | 'denied' | 'timeout' | 'unknown';

export class GeoError extends Error {
  constructor(
    readonly reason: GeoFailure,
    message: string,
  ) {
    super(message);
  }
}

/** The failure in the active language; non-geolocation errors fall back to the generic message. */
export function geoErrorMessage(err: unknown, t: Translate): string {
  switch (err instanceof GeoError ? err.reason : 'unknown') {
    case 'unsupported':
      return t('employee.common.geo.unsupported', 'Location is not available in this browser.');
    case 'denied':
      return t('employee.common.geo.denied', 'Location permission was denied. Allow location access to continue.');
    case 'timeout':
      return t('employee.common.geo.timeout', 'Timed out while getting your location. Try again.');
    default:
      return t('employee.common.geo.unknown', 'Could not determine your location.');
  }
}

/**
 * Current device position via the browser Geolocation API. Rejects with a `GeoError` (use `geoErrorMessage`
 * to show it) when unsupported, denied, or timed out.
 */
export function getCurrentPosition(timeoutMs = 15_000): Promise<Coordinates & { accuracy: number }> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new GeoError('unsupported', 'Location is not available in this browser.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: Number(pos.coords.latitude.toFixed(7)),
          longitude: Number(pos.coords.longitude.toFixed(7)),
          accuracy: Math.round(pos.coords.accuracy),
        }),
      (err) =>
        reject(
          err.code === err.PERMISSION_DENIED
            ? new GeoError('denied', 'Location permission was denied. Allow location access to continue.')
            : err.code === err.TIMEOUT
              ? new GeoError('timeout', 'Timed out while getting your location. Try again.')
              : new GeoError('unknown', 'Could not determine your location.'),
        ),
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 30_000 },
    );
  });
}
