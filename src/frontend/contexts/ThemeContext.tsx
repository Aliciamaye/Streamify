/**
 * Theme Context
 * Manages application theme and visual preferences
 */

import React, { createContext, useState, useCallback, useEffect, ReactNode } from 'react';

export type ThemeType = 'midnight' | 'nebula' | 'arctic' | 'sunset' | 'ocean' | 'forest';

export interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  isDark: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'streamify_theme';
const DARK_MODE_STORAGE_KEY = 'streamify_dark_mode';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeType>('midnight');
  const [isDark, setIsDark] = useState(true);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = (localStorage.getItem(THEME_STORAGE_KEY) || 'midnight') as ThemeType;
    const savedDarkMode = localStorage.getItem(DARK_MODE_STORAGE_KEY);

    setThemeState(savedTheme);
    setIsDark(savedDarkMode !== 'false');
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (themeToApply: ThemeType) => {
    const root = document.documentElement;
    root.setAttribute('data-theme', themeToApply);

    // Optional: Apply theme colors directly to CSS variables if needed
    // Each theme can have its own color scheme
  };

  const setTheme = useCallback((newTheme: ThemeType) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    applyTheme(newTheme);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setIsDark((prev) => {
      const newValue = !prev;
      localStorage.setItem(DARK_MODE_STORAGE_KEY, newValue.toString());
      return newValue;
    });
  }, []);

  const value: ThemeContextType = {
    theme,
    setTheme,
    isDark,
    toggleDarkMode,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
