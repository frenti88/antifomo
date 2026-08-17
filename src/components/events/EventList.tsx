'use client';

import React from 'react';
import type { AntiFOMOEvent, ViewMode } from '@/lib/types';
import { EventRow } from './EventRow';
import { EventCard } from './EventCard';
import { EmptyState } from '../ui/EmptyState';
import { getDateLabel } from '@/lib/dates';

interface EventListProps {
  events: AntiFOMOEvent[];
  viewMode: ViewMode;
  title?: string;
}

export function EventList({ events, viewMode, title }: EventListProps) {
  if (events.length === 0) {
    return (
      <EmptyState 
        title="No encontramos eventos"
        description="Intenta cambiar los filtros o busca algo distinto."
      />
    );
  }

  const groupedEvents = events.reduce((acc, event) => {
    const date = event.startDate;
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {} as Record<string, AntiFOMOEvent[]>);

  const dates = Object.keys(groupedEvents).sort();

  return (
    <div className="w-full">
      {title && <h2 className="text-xl font-bold mb-4 px-4">{title}</h2>}
      
      {dates.map((date) => (
        <div key={date} className="mb-8">
          <h3 className="text-xs font-bold text-secondary uppercase tracking-wider px-4 py-2 bg-bg/95 border-b border-border/60 sticky top-14 z-10 backdrop-blur-md">
            {getDateLabel(date)}
          </h3>
          
          {viewMode === 'agenda' ? (
            <div className="flex flex-col">
              {groupedEvents[date].map(event => (
                <EventRow key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 px-4 pt-4">
              {groupedEvents[date].map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
