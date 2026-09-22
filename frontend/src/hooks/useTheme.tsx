/**
 * Theme Context and Provider Hook.
 *
 * WHAT IT IS:
 *   Manages the global UI theme ('light' or 'dark'), defaulting to 'light' mode
 *   to match the provided UI kit screenshots.
 *
 * WHY WE USE IT:
 *   Provides a unified theme toggle across all pages, persists preference in localStorage,
 *   and toggles the Tailwind `.dark` class on the HTML document root.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeMode } from '../types';

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to 'light' to match the provided UI reference photos
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('cognitio_theme') as ThemeMode;
    return saved === 'dark' || saved === 'light' ? saved : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('cognitio_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
