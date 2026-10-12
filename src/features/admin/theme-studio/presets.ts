/** Design-token presets offered by Theme Studio (UI configuration, not data). */
export interface ThemePreset {
  id: string;
  name: string;
  primary: string;
  sidebar: string;
  accent: string;
  description: string;
  radius: number;
}

export const THEME_PRESETS: ThemePreset[] = [
  { id: 'isp_default', name: 'Default', primary: '#e85a1a', sidebar: '#10141a', accent: '#e85a1a', description: 'Signature orange on deep ink neutrals', radius: 12 },
  { id: 'midnight_fiber', name: 'Midnight Fiber', primary: '#6366f1', sidebar: '#0f172a', accent: '#22d3ee', description: 'Cool indigo for high-capacity networks', radius: 8 },
  { id: 'emerald_pop', name: 'Emerald POP', primary: '#10b981', sidebar: '#064e3b', accent: '#fbbf24', description: 'Vibrant emerald for reseller POPs and billing', radius: 12 },
  { id: 'crimson_telecom', name: 'Crimson Telecom', primary: '#e11d48', sidebar: '#1f0814', accent: '#fb7185', description: 'Bold ruby theme for modern broadband', radius: 8 },
  { id: 'royal_cyber', name: 'Royal Cyber', primary: '#8b5cf6', sidebar: '#0a0c10', accent: '#38bdf8', description: 'Electric violet on deep space dark', radius: 12 },
  { id: 'sunset_isp', name: 'Sunset', primary: '#f59e0b', sidebar: '#18181b', accent: '#ea580c', description: 'Warm amber and carbon slate', radius: 20 },
];

export const DEFAULT_PRESET = THEME_PRESETS[0];
