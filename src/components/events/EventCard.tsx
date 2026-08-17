'use client';

import React from 'react';
import Link from 'next/link';
import type { AntiFOMOEvent } from '@/lib/types';
import { EventPrice } from './EventPrice';
import { EventBadge } from './EventBadge';
import { SaveButton } from './SaveButton';
import { EventCover } from './EventCover';
import { formatDateFull } from '@/lib/dates';

interface EventCardProps {
  event: AntiFOMOEvent;
}

export function EventCard({ event }: EventCardProps) {
  return (
    <article className="relative flex flex-col border border-border rounded-xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all bg-bg group">
      <div className="absolute top-2 right-2 z-20">
        <SaveButton eventId={event.id} />
      </div>
      
      <Link href={`/evento/${event.slug}`} className="flex flex-col h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-text">
        <EventCover event={event} aspectRatio="card" showCategoryLabel={false} className="rounded-b-none" />
        
        <div className="p-4 flex flex-col flex-grow">
          <div className="text-xs font-semibold text-secondary mb-1 uppercase tracking-wider">
            {formatDateFull(event.startDate)} · {event.startTime}
          </div>
          <h3 className="text-lg font-semibold text-text line-clamp-2 leading-tight mb-2 group-hover:text-[#FFDE21] transition-colors">
            {event.title}
          </h3>
          <div className="text-sm text-secondary mb-4 mt-auto">
            {event.venue}
          </div>
          <div className="flex items-center justify-between border-t border-border pt-3">
            <EventPrice event={event} />
            {event.isGem && <EventBadge type="gem" />}
          </div>
        </div>
      </Link>
    </article>
  );
}
