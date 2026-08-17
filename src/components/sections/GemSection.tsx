'use client';

import React from 'react';
import Link from 'next/link';
import { EditorialSection } from './EditorialSection';
import { getGemEvents } from '@/lib/filters';
import type { AntiFOMOEvent } from '@/lib/types';
import { useSavedEvents } from '@/hooks/useSavedEvents';
import { formatTime } from '@/lib/dates';
import { CATEGORY_ICONS } from '@/data/categories';

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
        {gemEvents.map(event => {
          const categoryIcon = CATEGORY_ICONS[event.category as keyof typeof CATEGORY_ICONS] || '◉';

          return (
            <div
              key={event.id}
              className="flex-none w-[260px] snap-start bg-surface/50 border border-border hover:border-[#FFDE21]/60 rounded-xl p-4 relative flex flex-col justify-between group transition-all"
            >
              {/* Top Row: Category + Save Button */}
              <div className="flex justify-between items-center mb-2.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-bg border border-border text-[10px] font-bold uppercase tracking-wider text-text">
                  <span aria-hidden="true">{categoryIcon}</span>
                  <span>{event.category}</span>
                </span>
                
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

              {/* Main Content */}
              <Link href={`/evento/${event.slug}`} className="flex flex-col flex-1 focus:outline-none">
                <h3 className="font-bold text-text text-base leading-snug group-hover:text-[#FFDE21] transition-colors line-clamp-2 mb-1.5">
                  {event.title}
                </h3>
                
                {event.shortDescription && (
                  <p className="text-xs text-secondary line-clamp-2 mb-3 leading-relaxed">
                    {event.shortDescription}
                  </p>
                )}

                <div className="text-xs text-secondary mb-1 flex items-center gap-1 truncate">
                  <span aria-hidden="true">📍</span>
                  <span className="truncate">{event.venue}</span>
                </div>

                <div className="text-xs text-secondary mb-3 flex items-center gap-1">
                  <span aria-hidden="true">🕐</span>
                  <span>{formatTime(event.startTime)}</span>
                </div>
              </Link>

              {/* Footer */}
              <div className="mt-auto pt-2.5 border-t border-border flex justify-between items-center text-xs font-semibold text-text">
                <span>{event.priceType === 'free' ? 'Gratis' : (event.priceMin ? `$${event.priceMin.toLocaleString('es-CO')}` : 'De pago')}</span>
                <span className="text-[#FFDE21] font-mono text-[10px] font-bold">◉ JOYITA</span>
              </div>
            </div>
          );
        })}
      </div>
    </EditorialSection>
  );
}
