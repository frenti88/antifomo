'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from '@/hooks/useTheme';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        aria-label="Cambiar tema"
        className={`p-2 rounded-full hover:bg-surface text-text transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center ${className}`}
      >
        <span className="w-5 h-5 block" />
      </button>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
      className={`p-2 rounded-full hover:bg-surface text-text transition-all min-h-[40px] min-w-[40px] flex items-center justify-center group ${className}`}
    >
      {isDark ? (
        // Sun icon for dark mode (click to switch to light)
        <svg
          className="w-5 h-5 text-accent group-hover:rotate-45 transition-transform duration-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        // Moon icon for light mode (click to switch to dark)
        <svg
          className="w-5 h-5 text-text group-hover:-rotate-12 transition-transform duration-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  );
}
