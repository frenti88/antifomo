'use client';

import Link from 'next/link';
import CitySelector from './CitySelector';
import { ThemeToggle } from './ThemeToggle';

export default function Header() {
  return (
    <header className="sticky top-0 bg-bg/95 backdrop-blur-md border-b border-border z-50 h-14 transition-colors" aria-label="Navegación principal">
      <div className="max-w-6xl mx-auto h-full px-4 flex items-center justify-between">
        <div className="flex-1">
          <Link href="/" className="font-bold text-lg inline-flex items-center gap-1 text-text">
            ANTIFOMO <span className="text-accent text-xl leading-none">◉</span>
          </Link>
        </div>
        
        <div className="flex-none">
          <CitySelector />
        </div>
        
        <div className="flex-1 flex justify-end items-center gap-1 sm:gap-2">
          <ThemeToggle />
          <Link 
            href="/explorar?search=true" 
            className="p-2 rounded-full hover:bg-surface text-text transition-colors" 
            aria-label="Buscar eventos"
            title="Buscar eventos"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </Link>
          <Link 
            href="/guardados" 
            className="p-2 rounded-full hover:bg-surface text-text transition-colors" 
            aria-label="Eventos guardados"
            title="Eventos guardados"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
}
