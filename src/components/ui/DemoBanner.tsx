'use client';

import { useState, useEffect } from 'react';
import { DEMO_MODE } from '@/lib/constants';

export default function DemoBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (DEMO_MODE) {
      setIsVisible(true);
    }
  }, []);

  if (!DEMO_MODE || !isVisible || dismissed) return null;

  return (
    <div 
      className="fixed bottom-20 lg:bottom-4 right-4 z-[60] bg-text/90 backdrop-blur-sm text-bg text-xs px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm"
      role="status"
      aria-label="Modo de demostración activo"
    >
      <span className="text-accent animate-pulse">●</span>
      <span>Datos de demostración</span>
      <button 
        onClick={() => setDismissed(true)}
        className="ml-1 opacity-70 hover:opacity-100 p-0.5 rounded-full hover:bg-white/10"
        aria-label="Cerrar banner de demostración"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  );
}
