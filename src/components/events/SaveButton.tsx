'use client';

import React, { useState, useEffect } from 'react';
import { toggleSavedEvent, isEventSaved } from '@/lib/storage';
import { trackEvent } from '@/lib/analytics';

interface SaveButtonProps {
  eventId: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function SaveButton({ eventId, size = 'md', className = '' }: SaveButtonProps) {
  const [saved, setSaved] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setSaved(isEventSaved(eventId));
  }, [eventId]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const isNowSaved = toggleSavedEvent(eventId);
    setSaved(isNowSaved);
    
    trackEvent('event_save', { event_id: eventId, saved: isNowSaved });
    
    setToastMessage(isNowSaved ? 'Evento guardado' : 'Evento eliminado de guardados');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const dimensions = size === 'sm' ? 'w-8 h-8' : 'w-11 h-11';
  
  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={handleToggle}
        aria-label={saved ? 'Eliminar de guardados' : 'Guardar en mi radar'}
        aria-pressed={saved}
        className={`${dimensions} flex items-center justify-center rounded-full hover:bg-surface active:scale-90 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-text`}
      >
        {saved ? (
          <svg className="w-5 h-5 fill-current text-[#D7FF3F] drop-shadow-xs transition-transform transform scale-110" viewBox="0 0 24 24">
            <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 fill-current text-secondary hover:text-text transition-colors" viewBox="0 0 24 24">
            <path d="M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z" />
          </svg>
        )}
      </button>
      
      {toastMessage && (
        <div className="absolute top-full right-0 mt-2 whitespace-nowrap bg-text text-bg text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg z-50 animate-in fade-in slide-in-from-top-1">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
