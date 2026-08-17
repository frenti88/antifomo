'use client';

import React, { useState } from 'react';
import { DEMO_EVENTS } from '@/data/events';
import { useFilters } from '@/hooks/useFilters';
import { DateTabs } from '@/components/filters/DateTabs';
import { FilterChip } from '@/components/filters/FilterChip';
import { FilterSheet } from '@/components/filters/FilterSheet';
import { EventList } from '@/components/events/EventList';
import { EventCard } from '@/components/events/EventCard';
import { EditorialSection } from '@/components/sections/EditorialSection';
import { GemSection } from '@/components/sections/GemSection';
import { NewlyFoundSection } from '@/components/sections/NewlyFoundSection';
import { NearbySection } from '@/components/sections/NearbySection';
import type { Category, DateFilter } from '@/lib/types';

export default function HomePage() {
  const { filters, setFilter, clearFilters, filteredEvents, resultCount } = useFilters(DEMO_EVENTS);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const isFiltering = 
    filters.category !== null ||
    filters.showFree === true ||
    filters.showGems === true ||
    filters.zone !== null ||
    filters.timeOfDay !== null ||
    filters.priceRange !== null ||
    (filters.query !== undefined && filters.query !== '');

  const isDefaultView = !isFiltering && filters.date === null;

  // "Para ti" events
  const paraTiEvents = [...DEMO_EVENTS].sort((a, b) => b.score - a.score).slice(0, 4);
  
  // "Ciencia & Tech" events
  const cienciaTechEvents = DEMO_EVENTS.filter(e => e.category === 'ciencia-tecnologia').slice(0, 4);

  // "Esta noche" events
  const estaNocheEvents = DEMO_EVENTS.filter(e => e.tags?.includes('noche') || (e.startTime >= '18:00')).slice(0, 4);
  
  // "Gratis" events
  const freeEvents = DEMO_EVENTS.filter(e => e.priceType === 'free').slice(0, 4);

  const handleDateChange = (date: DateFilter | null) => {
    setFilter({ date });
  };

  return (
    <div className="pb-24">
      <h1 className="sr-only">AntiFOMO — Radar cultural de Medellín</h1>

      <section className="pt-6 pb-4">
        <div className="px-4 max-w-3xl mx-auto mb-4">
          <h2 className="text-2xl font-bold tracking-tight text-text">
            ¿Qué está pasando?
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-2">
          <DateTabs activeDate={filters.date} onDateChange={handleDateChange} />
          
          <div className="flex overflow-x-auto gap-2 px-4 py-2 no-scrollbar w-full">
            <FilterChip
              label="Todo"
              active={!isFiltering}
              onClick={clearFilters}
            />
            <FilterChip
              label="Gratis"
              active={filters.showFree}
              onClick={() => setFilter({ showFree: !filters.showFree })}
            />
            <FilterChip
              label="Joyitas"
              active={filters.showGems}
              onClick={() => setFilter({ showGems: !filters.showGems })}
            />
            <FilterChip
              label="Ciencia & Tech"
              active={filters.category === 'ciencia-tecnologia'}
              onClick={() => setFilter({ category: filters.category === 'ciencia-tecnologia' ? null : 'ciencia-tecnologia' })}
            />
            {['música', 'arte', 'cine', 'fiesta', 'talleres'].map(cat => (
              <FilterChip
                key={cat}
                label={cat.charAt(0).toUpperCase() + cat.slice(1)}
                active={filters.category === cat}
                onClick={() => setFilter({ category: filters.category === cat ? null : cat as Category })}
              />
            ))}
            <FilterChip
              label="+ Filtros"
              active={isFilterSheetOpen}
              onClick={() => setIsFilterSheetOpen(true)}
              className="ml-auto flex-shrink-0"
            />
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto space-y-6">
        <div className="px-4 mb-2 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D7FF3F] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D7FF3F]"></span>
          </span>
          <p className="text-sm font-semibold text-secondary">
            {resultCount} planes activos{filters.date ? ` para ${filters.date}` : ' rastreados hoy en el radar'}.
          </p>
        </div>
        
        <EventList 
          events={isDefaultView ? filteredEvents.slice(0, 6) : filteredEvents} 
          viewMode="explorar" 
        />

        {isDefaultView && (
          <div className="px-4 sm:px-0 space-y-8">
            <EditorialSection title="Para ti" subtitle="Cosas que creemos que vale la pena mirar.">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {paraTiEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </EditorialSection>

            <EditorialSection title="Ciencia & Tecnología" subtitle="Astronomía, inteligencia artificial, robótica y código creativo.">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {cienciaTechEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </EditorialSection>

            <div className="py-2">
              <GemSection events={DEMO_EVENTS} />
            </div>

            <div className="py-2">
              <NewlyFoundSection events={DEMO_EVENTS} />
            </div>

            <EditorialSection title="Esta noche" subtitle="Para los que no quieren dormir.">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {estaNocheEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </EditorialSection>

            <EditorialSection title="Gratis" subtitle="Planes que no cuestan un peso.">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {freeEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </EditorialSection>

            <div className="py-2">
              <NearbySection events={DEMO_EVENTS} />
            </div>
          </div>
        )}
      </div>

      <FilterSheet
        open={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        filters={filters}
        onFiltersChange={setFilter}
        eventCount={resultCount}
      />
    </div>
  );
}
