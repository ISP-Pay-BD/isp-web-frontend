import { ApiError, apiClient, http } from '@/lib/api/client';

type Raw = Record<string, unknown>;

/** Software-settings tabs of PHP `settings/software` that the platform owner edits. */
export type SettingsSection =
  'app_version' | 'login_portal' | 'captive_portal' | 'cronjob' | 'shop_settings';

/** Flat `key → value` map of one tab, all text (PHP `getSetting()` values). */
export type SettingValues = Record<string, string>;
export type AllSettings = Record<SettingsSection, SettingValues>;

/**
 * Contract: Rust lane R2, `src/modules/web_parity/platform_r2/settings.rs` (super_admin only).
 * GET/PUT answer `{ app_version:{…}, captive_portal:{…}, cronjob:{…}, login_portal:{config:{…}}, shop_settings:{…} }`;
 * the R2 secret comes back as `""` + `has_r2_secret_access_key`. check-balance / sync-r2-apk answer PHP's
 * `{status, response}` envelope (not the zapi one), so they are read with `apiClient` directly.
 */
const PATHS = {
  software: '/v1/platform/settings/software',
  checkBalance: '/v1/platform/settings/check-balance',
  syncR2Apk: '/v1/platform/settings/sync-r2-apk',
} as const;

const SECTIONS: SettingsSection[] = [
  'app_version',
  'login_portal',
  'captive_portal',
  'cronjob',
  'shop_settings',
];

function flattenGroup(raw: unknown): SettingValues {
  const out: SettingValues = {};
  for (const [k, v] of Object.entries((raw && typeof raw === 'object' ? raw : {}) as Raw)) {
    if (k === 'config') out.portal_login_config = JSON.stringify(v ?? {});
    else if (v === null || v === undefined) out[k] = '';
    else out[k] = typeof v === 'object' ? JSON.stringify(v) : String(v);
  }
  return out;
}

function mapAll(raw: unknown): AllSettings {
  const src = (raw && typeof raw === 'object' ? raw : {}) as Raw;
  return Object.fromEntries(SECTIONS.map((s) => [s, flattenGroup(src[s])])) as AllSettings;
}

/** POST to a PHP-envelope endpoint; resolves with `response`, rejects with its text as the message. */
async function phpPost(url: string, body?: unknown): Promise<unknown> {
  let res;
  try {
    res = await apiClient.post(url, body, { validateStatus: () => true });
  } catch {
    throw new ApiError('Cannot reach the server. Check your connection and try again.', 0);
  }
  const data = (res.data ?? {}) as Raw;
  const response = data.response ?? data.data;
  if (res.status >= 200 && res.status < 300 && data.status !== 'error') return response;
  const text =
    typeof response === 'string'
      ? response
      : response && typeof response === 'object'
        ? Object.values(response as Raw)
            .map(String)
            .join(' ')
        : typeof data.message === 'string'
          ? data.message
          : 'Request failed.';
  throw new ApiError(text, res.status);
}

export const SMS_GATEWAYS = [
  'bulksmsbd',
  'greenwebsms',
  'smsq',
  'telnet',
  'bulksmsdhaka',
  'awajdigital',
  'automas',
] as const;

export const systemSettingsApi = {
  getAll: async (): Promise<AllSettings> => mapAll(await http.get<unknown>(PATHS.software)),

  /** Partial update of one tab (only the keys sent change). Returns every tab as saved. */
  save: async (section: SettingsSection, values: Record<string, unknown>): Promise<AllSettings> =>
    mapAll(await http.put<unknown>(PATHS.software, { [section]: values })),

  /** The gateway's balance text (or its "not the configured gateway" message). */
  checkBalance: async (gateway: string): Promise<string> => {
    const r = await phpPost(PATHS.checkBalance, { gateway });
    return r === null || r === undefined ? '' : String(r);
  },

  /** Success message (with the public URL) from the APK → Cloudflare R2 sync. */
  syncR2Apk: async (): Promise<string> => String((await phpPost(PATHS.syncR2Apk)) ?? ''),
};
