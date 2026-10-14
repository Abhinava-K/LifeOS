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
  textSecondary: string;
  textMuted: string;
  success: string;
  warning: string;
  danger: string;
}

export const darkPalette: ThemeColors = {
  background: '#07080C',
  surface: '#0F1117',
  surfaceLight: '#161922',
  border: '#222634',
  primary: '#4F6BFF',
  primaryLight: '#7088FF',
  accent: '#00E599',
  text: '#F0F2F8',
  textSecondary: '#9DA4B6',
  textMuted: '#62687A',
  success: '#00D084',
  warning: '#FFB020',
  danger: '#FF4D4D',
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
  textSecondary: '#4B5563',
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
