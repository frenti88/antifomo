'use client';

import React from 'react';
import Link from 'next/link';
import type { AntiFOMOEvent } from '@/lib/types';
import { EventPrice } from '../events/EventPrice';
import { EventBadge } from '../events/EventBadge';
import { formatTime } from '@/lib/dates';

interface HomeEventCardProps {
  event: AntiFOMOEvent;
  showGemBadge?: boolean;
}

export function HomeEventCard({ event, showGemBadge = false }: HomeEventCardProps) {
  return (
    <article className="relative flex flex-col justify-between border border-border/80 rounded-2xl p-5 bg-surface/30 hover:bg-surface/70 hover:border-accent/60 hover:shadow-sm transition-all duration-200 group">
      {/* Top Bar: Category Pill */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface border border-border text-[11px] font-bold uppercase tracking-wider text-text">
          <span>{event.category}</span>
        </span>
        {showGemBadge && <EventBadge type="gem" />}
      </div>
      
      {/* Clickable Card Body */}
      <Link
        href={`/evento/${event.slug}`}
        className="flex flex-col flex-grow focus:outline-none focus-visible:ring-2 focus-visible:ring-text rounded-lg"
      >
        <div className="text-xs font-bold text-accent uppercase tracking-wider flex items-center gap-1.5 mb-1.5 tabular-nums">
          <span aria-hidden="true">⏱️</span>
          <span>{formatTime(event.startTime)}</span>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-text line-clamp-2 leading-snug group-hover:text-accent transition-colors tracking-tight">
          {event.title}
        </h3>

        <div className="flex items-center gap-1.5 text-xs text-secondary mt-3 font-medium">
          <span aria-hidden="true">📍</span>
          <span className="truncate">{event.venue} {event.neighborhood ? `· ${event.neighborhood}` : ''}</span>
        </div>
      </Link>

      {/* Bottom Footer: Price + CTA */}
      <div className="flex items-center justify-between border-t border-border mt-4 pt-4">
        <EventPrice event={event} />
        <Link 
          href={`/evento/${event.slug}`}
          className="text-xs font-bold uppercase tracking-wider text-text hover:text-accent transition-colors"
        >
          Ver plan →
        </Link>
      </div>
    </article>
  );
}
