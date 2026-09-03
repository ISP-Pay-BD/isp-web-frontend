'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { themePresetsData, type ThemePreset } from '@/data/admin/theme-studio.data';

interface ThemeCustomizerState {
  presetId: string;
  primaryColor: string;
  radius: number;
  density: 'comfortable' | 'compact';
  reduceMotion: boolean;
  setPreset: (presetId: string) => void;
  setPrimaryColor: (color: string) => void;
  setRadius: (radius: number) => void;
  setDensity: (density: 'comfortable' | 'compact') => void;
  setReduceMotion: (reduce: boolean) => void;
  resetToDefault: () => void;
  applyDomStyles: () => void;
}

export const useThemeCustomizerStore = create<ThemeCustomizerState>()(
  persist(
    (set, get) => ({
      presetId: 'isp_default',
      primaryColor: '#f75803',
      radius: 12,
      density: 'comfortable',
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
          reduceMotion: false,
        });
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
