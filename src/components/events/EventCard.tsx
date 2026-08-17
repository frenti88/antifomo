'use client';

import React from 'react';
import Link from 'next/link';
import type { AntiFOMOEvent } from '@/lib/types';
import { EventPrice } from './EventPrice';
import { EventBadge } from './EventBadge';
import { SaveButton } from './SaveButton';
import { formatDateFull } from '@/lib/dates';
import { CATEGORY_ICONS } from '@/data/categories';

interface EventCardProps {
  event: AntiFOMOEvent;
}

export function EventCard({ event }: EventCardProps) {
  const categoryIcon = CATEGORY_ICONS[event.category as keyof typeof CATEGORY_ICONS] || '◉';

  return (
    <article className="relative flex flex-col justify-between border border-border/80 rounded-2xl p-5 bg-surface/30 hover:bg-surface/70 hover:border-accent/60 hover:shadow-sm transition-all duration-200 group">
      {/* Top Bar: Category Pill + Save Button */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface border border-border text-[11px] font-bold uppercase tracking-wider text-text">
          <span aria-hidden="true">{categoryIcon}</span>
          <span>{event.category}</span>
        </span>
        <SaveButton eventId={event.id} />
      </div>
      
      {/* Clickable Card Body */}
      <Link
        href={`/evento/${event.slug}`}
        className="flex flex-col flex-grow focus:outline-none focus-visible:ring-2 focus-visible:ring-text rounded-lg"
      >
        <div className="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-1.5 mb-1.5 tabular-nums">
          <span aria-hidden="true">📅</span>
          <span>{formatDateFull(event.startDate)} · {event.startTime}</span>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-text line-clamp-2 leading-snug group-hover:text-accent transition-colors tracking-tight">
          {event.title}
        </h3>

        {event.shortDescription && (
          <p className="text-sm text-secondary line-clamp-2 mt-2 leading-relaxed">
            {event.shortDescription}
          </p>
        )}

        <div className="flex items-center gap-1.5 text-xs text-secondary mt-3 font-medium">
          <span aria-hidden="true">📍</span>
          <span className="truncate">{event.venue} · {event.neighborhood}</span>
        </div>
      </Link>

      {/* Bottom Footer: Price + Badges */}
      <div className="flex items-center justify-between border-t border-border mt-4 pt-3">
        <EventPrice event={event} />
        <div className="flex items-center gap-1.5">
          {event.isGem && <EventBadge type="gem" />}
          {event.isNewlyFound && !event.isGem && <EventBadge type="newly-found" />}
        </div>
      </div>
    </article>
  );
}
