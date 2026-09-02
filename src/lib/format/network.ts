/** Network identifiers — IP, MAC, username */

export function formatMac(value: string, separator: ':' | '-' = ':'): string {
  const hex = value.replace(/[^a-fA-F0-9]/g, '').toUpperCase();
  if (hex.length !== 12) return value;
  const pairs = hex.match(/.{2}/g) ?? [];
  return pairs.join(separator);
}

export function isValidMac(value: string): boolean {
  return /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/.test(value.trim())
    || /^[0-9A-Fa-f]{12}$/.test(value.replace(/[^a-fA-F0-9]/g, ''));
}

export function isValidIpv4(value: string): boolean {
  const parts = value.trim().split('.');
  if (parts.length !== 4) return false;
  return parts.every((p) => {
    if (!/^\d{1,3}$/.test(p)) return false;
    const n = Number(p);
    return n >= 0 && n <= 255;
  });
}

/** Mask long tokens for UI (API keys, secrets) */
export function maskSecret(value: string, visible = 4): string {
  if (value.length <= visible * 2) return '••••';
  return `${value.slice(0, visible)}…${value.slice(-visible)}`;
}
