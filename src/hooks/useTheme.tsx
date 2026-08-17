'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Sync on mount from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('antifomo-theme') as Theme | null;
      if (stored && (stored === 'light' || stored === 'dark' || stored === 'system')) {
        setThemeState(stored);
      }
    } catch {
      // Ignored
    }
  }, []);

  // Update DOM and resolved theme when theme state changes
  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateResolved = () => {
      let isDark = false;
      if (theme === 'dark') {
        isDark = true;
      } else if (theme === 'light') {
        isDark = false;
      } else {
        isDark = mediaQuery.matches;
      }

      if (isDark) {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
        setResolvedTheme('dark');
      } else {
        root.classList.remove('dark');
        root.setAttribute('data-theme', 'light');
        setResolvedTheme('light');
      }
    };

    updateResolved();

    // Listen to OS system theme changes
    const handler = () => {
      if (theme === 'system') {
        updateResolved();
      }
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('antifomo-theme', newTheme);
    } catch {
      // Ignored
    }
  };

  const toggleTheme = () => {
    if (resolvedTheme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      theme: 'system' as Theme,
      resolvedTheme: 'light' as const,
      setTheme: () => {},
      toggleTheme: () => {},
    };
  }
  return context;
}
