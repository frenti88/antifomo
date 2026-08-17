'use client';

import { EditorialSection } from './EditorialSection';
import { getNewlyFoundEvents } from '@/lib/filters';
import type { AntiFOMOEvent } from '@/lib/types';
import { getRelativeDetectedTime, formatTime } from '@/lib/dates';
import { useEffect } from 'react';
import { useSavedEvents } from '@/hooks/useSavedEvents';

interface NewlyFoundSectionProps {
  events: AntiFOMOEvent[];
}

export function NewlyFoundSection({ events }: NewlyFoundSectionProps) {
  const newlyFoundEvents = getNewlyFoundEvents(events).slice(0, 5);
  const { isSaved, toggleSave } = useSavedEvents(events);

  useEffect(() => {
    // Simulated analytics track
    console.log('Tracked newly_found_view');
  }, []);

  if (newlyFoundEvents.length === 0) return null;

  return (
    <EditorialSection
      id="newly-found-section"
      title="RECIÉN ENCONTRADO"
      symbol="◎"
    >
      <div className="flex flex-col gap-4">
        {newlyFoundEvents.map(event => (
          <div key={event.id} className="bg-surface border border-border p-4 rounded-lg flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <div className="inline-flex items-center bg-accent text-black px-2 py-1 rounded text-xs font-bold uppercase mb-2">
                ◎ Recién encontrado
              </div>
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
            
            <h3 className="font-bold text-text text-lg">{event.title}</h3>
            
            <div className="text-sm text-secondary flex flex-wrap gap-x-3 gap-y-1">
              <span>{event.venue}</span>
              <span>•</span>
              <span>{formatTime(event.startTime)}</span>
            </div>
            
            {event.detectedAt && (
              <p className="text-xs text-secondary mt-1 font-medium">
                {getRelativeDetectedTime(event.detectedAt)}
              </p>
            )}
          </div>
        ))}
      </div>
    </EditorialSection>
  );
}
