import { create } from 'zustand';
import { UserThemePreference } from '@lifeos/shared-types';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceLight: string;
  border: string;
  primary: string;
  primaryLight: string;
  accent: string;
  text: string;
  textMuted: string;
  success: string;
  warning: string;
  danger: string;
}

export const darkPalette: ThemeColors = {
  background: '#090D16',
  surface: '#111827',
  surfaceLight: '#1F2937',
  border: '#374151',
  primary: '#6366F1',
  primaryLight: '#818CF8',
  accent: '#10B981',
  text: '#F9FAFB',
  textMuted: '#9CA3AF',
  success: '#34D399',
  warning: '#FBBF24',
  danger: '#F87171',
};

export const lightPalette: ThemeColors = {
  background: '#F9FAFB',
  surface: '#FFFFFF',
  surfaceLight: '#F3F4F6',
  border: '#E5E7EB',
  primary: '#4F46E5',
  primaryLight: '#6366F1',
  accent: '#059669',
  text: '#111827',
  textMuted: '#6B7280',
  success: '#10B981',
  warning: '#D97706',
  danger: '#DC2626',
};

interface ThemeState {
  theme: UserThemePreference;
  colors: ThemeColors;
  isDark: boolean;
  setTheme: (theme: UserThemePreference) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: UserThemePreference.DARK,
  colors: darkPalette,
  isDark: true,
  setTheme: (theme) =>
    set({
      theme,
      isDark: theme === UserThemePreference.DARK,
      colors: theme === UserThemePreference.LIGHT ? lightPalette : darkPalette,
    }),
}));
