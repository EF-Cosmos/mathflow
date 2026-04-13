/**
 * Theme Provider
 *
 * Provides theme context to the application with:
 * - localStorage persistence
 * - System theme detection
 * - Smooth theme transitions
 */

import { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'mathflow-theme';
const THEME_COLOR_DARK = '#0A0A0A';
const THEME_COLOR_LIGHT = '#FFFFFF';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: ThemeMode;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return (stored as Theme) || 'system';
  });

  const [resolvedTheme, setResolvedTheme] = useState<ThemeMode>('light');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateResolvedTheme = function() {
      if (theme === 'system') {
        setResolvedTheme(mediaQuery.matches ? 'dark' : 'light');
      } else {
        setResolvedTheme(theme);
      }
    };

    updateResolvedTheme();

    const handler = () => updateResolvedTheme();
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    const isDark = resolvedTheme === 'dark';

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    const themeColor = isDark ? THEME_COLOR_DARK : THEME_COLOR_LIGHT;
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', themeColor);
    }
  }, [resolvedTheme]);

  const setTheme = function(newTheme: Theme) {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}
