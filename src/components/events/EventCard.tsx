'use client';

import React from 'react';
import Link from 'next/link';
import type { AntiFOMOEvent } from '@/lib/types';
import { EventPrice } from './EventPrice';
import { EventBadge } from './EventBadge';
import { SaveButton } from './SaveButton';
import { formatDateFull } from '@/lib/dates';

interface EventCardProps {
  event: AntiFOMOEvent;
}

export function EventCard({ event }: EventCardProps) {
  const colorIndex = event.category.length % 5;
  const colors = [
    'bg-[#FFD166]',
    'bg-[#EF476F]',
    'bg-[#06D6A0]',
    'bg-[#118AB2]',
    'bg-[#073B4C]',
  ];
  const placeholderColor = colors[colorIndex];

  return (
    <article className="relative flex flex-col border border-border rounded-lg overflow-hidden hover:shadow-sm hover:-translate-y-0.5 transition-all bg-bg">
      <div className="absolute top-2 right-2 z-10">
        <SaveButton eventId={event.id} />
      </div>
      
      <Link href={`/evento/${event.slug}`} className="flex flex-col h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-text">
        <div className={`h-32 w-full ${placeholderColor} flex items-center justify-center`}>
        </div>
        
        <div className="p-4 flex flex-col flex-grow">
          <div className="text-xs font-semibold text-secondary mb-1 uppercase tracking-wider">
            {formatDateFull(event.startDate)} · {event.startTime}
          </div>
          <h3 className="text-lg font-semibold text-text line-clamp-2 leading-tight mb-2">
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
