'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { themePresetsData } from '@/data/admin/theme-studio.data';

interface ThemeCustomizerState {
  presetId: string;
  primaryColor: string;
  radius: number;
  density: 'comfortable' | 'compact';
  tableLayout: 'full' | 'centered';
  reduceMotion: boolean;
  setPreset: (presetId: string) => void;
  setPrimaryColor: (color: string) => void;
  setRadius: (radius: number) => void;
  setDensity: (density: 'comfortable' | 'compact') => void;
  setTableLayout: (layout: 'full' | 'centered') => void;
  setReduceMotion: (reduce: boolean) => void;
  resetToDefault: () => void;
  applyDomStyles: () => void;
}

export const useThemeCustomizerStore = create<ThemeCustomizerState>()(
  persist(
    (set, get) => ({
      presetId: 'isp_default',
      primaryColor: '#e85a1a',
      radius: 12,
      density: 'comfortable',
      tableLayout: 'full',
      reduceMotion: false,

      setPreset: (presetId: string) => {
        const target = themePresetsData.find((p) => p.id === presetId) || themePresetsData[0]!;
        set({
          presetId: target.id,
          primaryColor: target.primary,
          radius: target.radius,
        });
        get().applyDomStyles();
      },

      setPrimaryColor: (color: string) => {
        set({ primaryColor: color });
        get().applyDomStyles();
      },

      setRadius: (radius: number) => {
        set({ radius });
        get().applyDomStyles();
      },

      setDensity: (density: 'comfortable' | 'compact') => {
        set({ density });
        get().applyDomStyles();
      },

      setTableLayout: (tableLayout: 'full' | 'centered') => {
        set({ tableLayout });
        if (typeof window !== 'undefined') {
          localStorage.setItem('ipb_table_layout', tableLayout);
        }
        get().applyDomStyles();
      },

      setReduceMotion: (reduceMotion: boolean) => {
        set({ reduceMotion });
        get().applyDomStyles();
      },

      resetToDefault: () => {
        const def = themePresetsData[0]!;
        set({
          presetId: def.id,
          primaryColor: def.primary,
          radius: def.radius,
          density: 'comfortable',
          tableLayout: 'full',
          reduceMotion: false,
        });
        if (typeof window !== 'undefined') {
          localStorage.setItem('ipb_table_layout', 'full');
        }
        get().applyDomStyles();
      },

      applyDomStyles: () => {
        if (typeof document === 'undefined') return;
        const state = get();
        const root = document.documentElement;

        // Apply radius
        root.style.setProperty('--radius', `${state.radius / 16}rem`);

        // Density attribute
        if (state.density === 'compact') {
          root.setAttribute('data-density', 'compact');
        } else {
          root.removeAttribute('data-density');
        }

        // Table layout attribute
        root.setAttribute('data-table-layout', state.tableLayout || 'full');

        // Reduce motion
        if (state.reduceMotion) {
          root.setAttribute('data-reduce-motion', 'true');
        } else {
          root.removeAttribute('data-reduce-motion');
        }
      },
    }),
    {
      name: 'ipb_theme_customizer_storage',
    }
  )
);
