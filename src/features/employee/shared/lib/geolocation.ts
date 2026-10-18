import type { Coordinates } from '@/lib/api/services/employee.service';

/**
 * Current device position via the browser Geolocation API. Rejects with a
 * human message when unsupported, denied, or timed out.
 */
export function getCurrentPosition(timeoutMs = 15_000): Promise<Coordinates & { accuracy: number }> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Location is not available in this browser.'));
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
          new Error(
            err.code === err.PERMISSION_DENIED
              ? 'Location permission was denied. Allow location access to continue.'
              : err.code === err.TIMEOUT
                ? 'Timed out while getting your location. Try again.'
                : 'Could not determine your location.',
          ),
        ),
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 30_000 },
    );
  });
}
