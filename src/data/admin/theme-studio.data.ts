export interface ThemePreset {
  id: string;
  name: string;
  primary: string;
  sidebar: string;
  accent: string;
  description: string;
  radius: number;
}

export const themePresetsData: ThemePreset[] = [
  {
    id: 'isp_default',
    name: 'ISP Pay BD Default',
    primary: '#f75803',
    sidebar: '#1a0b38',
    accent: '#2E8BFF',
    description: 'Official ISP Pay BD orange + deep violet obsidian portal',
    radius: 12,
  },
  {
    id: 'midnight_fiber',
    name: 'Midnight Fiber',
    primary: '#6366f1',
    sidebar: '#0f172a',
    accent: '#22d3ee',
    description: 'Cool indigo theme for high-capacity enterprise networks',
    radius: 8,
  },
  {
    id: 'emerald_pop',
    name: 'Emerald POP',
    primary: '#10b981',
    sidebar: '#064e3b',
    accent: '#fbbf24',
    description: 'Vibrant emerald accent for reseller POPs and billing',
    radius: 12,
  },
  {
    id: 'crimson_telecom',
    name: 'Crimson Telecom',
    primary: '#e11d48',
    sidebar: '#1f0814',
    accent: '#fb7185',
    description: 'Bold magenta-ruby theme for modern broadband providers',
    radius: 8,
  },
  {
    id: 'royal_cyber',
    name: 'Royal Cyber',
    primary: '#8b5cf6',
    sidebar: '#0c0118',
    accent: '#38bdf8',
    description: 'Electric violet styling paired with deep space dark theme',
    radius: 12,
  },
  {
    id: 'sunset_isp',
    name: 'Sunset ISP',
    primary: '#f59e0b',
    sidebar: '#18181b',
    accent: '#ea580c',
    description: 'Warm amber and deep carbon slate for clean contrast',
    radius: 20,
  },
];

export const activeThemeId = 'isp_default';

export { generateColorRamp } from '@/lib/theme/generate-color-ramp';
