'use client';

import React from 'react';
import Link from 'next/link';
import { EditorialSection } from './EditorialSection';
import { getGemEvents } from '@/lib/filters';
import type { AntiFOMOEvent } from '@/lib/types';
import { useSavedEvents } from '@/hooks/useSavedEvents';
import { formatTime } from '@/lib/dates';
import { EventCover } from '../events/EventCover';

interface GemSectionProps {
  events: AntiFOMOEvent[];
}

export function GemSection({ events }: GemSectionProps) {
  const gemEvents = getGemEvents(events).slice(0, 6);
  const { isSaved, toggleSave } = useSavedEvents(events);

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
            className="flex-none w-[240px] snap-start bg-surface border border-border rounded-xl overflow-hidden relative flex flex-col group"
          >
            <EventCover event={event} aspectRatio="card" showCategoryLabel={false} className="h-28 rounded-b-none" />

            <div className="p-4 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-2 gap-2">
                <Link href={`/evento/${event.slug}`} className="font-bold text-text text-base leading-tight group-hover:text-[#FFDE21] transition-colors line-clamp-2">
                  {event.title}
                </Link>
                <button
                  onClick={() => toggleSave(event.id)}
                  className={`p-1.5 rounded-full transition-colors flex items-center justify-center ${
                    isSaved(event.id) ? 'text-[#FFDE21]' : 'text-secondary hover:text-text'
                  }`}
                  aria-label={isSaved(event.id) ? 'Quitar de guardados' : 'Guardar evento'}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
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

              <p className="text-xs text-secondary mb-1 truncate">{event.venue}</p>
              <p className="text-xs text-secondary mb-2">
                {formatTime(event.startTime)}
              </p>

              <div className="mt-auto pt-2 border-t border-border/50 flex justify-between items-center text-xs font-semibold text-text">
                <span>{event.priceType === 'free' ? 'Gratis' : (event.priceMin ? `$${event.priceMin.toLocaleString('es-CO')}` : 'De pago')}</span>
                <span className="text-[#FFDE21] font-mono text-[10px]">◉ JOYITA</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </EditorialSection>
  );
}
