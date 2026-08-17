'use client';

import { EditorialSection } from './EditorialSection';
import { getGemEvents } from '@/lib/filters';
import type { AntiFOMOEvent } from '@/lib/types';
import { useSavedEvents } from '@/hooks/useSavedEvents';
import { formatTime } from '@/lib/dates';
import { useEffect } from 'react';

interface GemSectionProps {
  events: AntiFOMOEvent[];
}

export function GemSection({ events }: GemSectionProps) {
  const gemEvents = getGemEvents(events).slice(0, 6);
  const { isSaved, toggleSave } = useSavedEvents(events);

  useEffect(() => {
    // Simulated analytics track
    console.log('Tracked gem_view');
  }, []);

  if (gemEvents.length === 0) return null;

  return (
    <EditorialSection
      id="gem-section"
      title="JOYITAS"
      symbol="◉"
      subtitle="Planes que probablemente no ibas a encontrar."
    >
      <div className="flex overflow-x-auto gap-4 pb-4 snap-x hide-scrollbar">
        {gemEvents.map(event => (
          <div 
            key={event.id}
            className="flex-none w-[240px] snap-start bg-surface border border-border rounded-lg p-4 relative"
          >
            <div className="flex justify-between items-start mb-2 gap-2">
              <h3 className="font-bold text-text text-base leading-tight">{event.title}</h3>
              <button
                onClick={() => toggleSave(event.id)}
                className={`p-2 rounded-full -mt-2 -mr-2 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ${
                  isSaved(event.id) ? 'text-accent' : 'text-secondary hover:text-text'
                }`}
                aria-label={isSaved(event.id) ? 'Quitar de guardados' : 'Guardar evento'}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill={isSaved(event.id) ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                </svg>
              </button>
            </div>
            
            <p className="text-sm text-secondary mb-1 truncate">{event.venue}</p>
            <p className="text-sm text-secondary mb-1">
              {formatTime(event.startTime)}
            </p>
            <p className="text-sm font-semibold text-text mt-3">
              {event.priceType === 'free' ? 'Gratis' : (event.priceMin ? `$${event.priceMin.toLocaleString('es-CO')}` : 'De pago')}
            </p>
          </div>
        ))}
      </div>
    </EditorialSection>
  );
}
