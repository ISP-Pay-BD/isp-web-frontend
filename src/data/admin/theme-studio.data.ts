export interface ThemePreset {
  id: string;
  name: string;
  primary: string;
  sidebar: string;
  accent: string;
  description: string;
}

export const themePresetsData: ThemePreset[] = [
  {
    id: 'isp_default',
    name: 'ISP Pay BD Default',
    primary: '#f75803',
    sidebar: '#1a0b38',
    accent: '#2E8BFF',
    description: 'Official ISP Pay BD orange + deep purple sidebar',
  },
  {
    id: 'midnight_fiber',
    name: 'Midnight Fiber',
    primary: '#6366f1',
    sidebar: '#0f172a',
    accent: '#22d3ee',
    description: 'Cool indigo theme for enterprise fiber operators',
  },
  {
    id: 'emerald_pop',
    name: 'Emerald POP',
    primary: '#10b981',
    sidebar: '#064e3b',
    accent: '#fbbf24',
    description: 'Green accent for reseller POP portals',
  },
];

export const activeThemeId = 'isp_default';
