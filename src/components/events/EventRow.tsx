'use client';

import React from 'react';
import Link from 'next/link';
import type { AntiFOMOEvent } from '@/lib/types';
import { EventPrice } from './EventPrice';
import { EventBadge } from './EventBadge';
import { SaveButton } from './SaveButton';

interface EventRowProps {
  event: AntiFOMOEvent;
}

export function EventRow({ event }: EventRowProps) {
  return (
    <article className="relative border-b border-border hover:bg-surface transition-colors py-4 px-4">
      <div className="absolute top-2 right-2 z-10">
        <SaveButton eventId={event.id} />
      </div>
      
      <Link href={`/evento/${event.slug}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-text rounded">
        <div className="pr-12">
          <div className="text-xs font-bold uppercase tracking-wider text-secondary mb-1 tabular-nums">
            {event.startTime} {event.endTime ? `— ${event.endTime}` : ''}
          </div>
          <h3 className="text-base sm:text-lg font-bold text-text line-clamp-2 leading-snug tracking-tight mb-1">
            {event.title}
          </h3>
          <p className="text-xs sm:text-sm text-secondary truncate mb-2 leading-relaxed">
            {event.shortDescription}
          </p>
          <div className="text-xs sm:text-sm text-secondary/90 mb-3 font-medium flex items-center gap-1.5">
            <span aria-hidden="true">📍</span>
            <span className="truncate">{event.venue} · {event.neighborhood}</span>
          </div>
          <div className="flex items-center flex-wrap gap-2">
            <EventPrice event={event} />
            {event.isGem && <EventBadge type="gem" />}
            {event.isNewlyFound && !event.isGem && <EventBadge type="newly-found" />}
          </div>
        </div>
      </Link>
    </article>
  );
}
