'use client';

import React, { useState } from 'react';
import { DEMO_EVENTS } from '@/data/events';
import { useFilters } from '@/hooks/useFilters';
import { SearchBar } from '@/components/filters/SearchBar';
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
  
  // "Ciencia" events
  const cienciaEvents = DEMO_EVENTS.filter(e => e.category === 'ciencia').slice(0, 4);

  // "Tecnología" events
  const tecnologiaEvents = DEMO_EVENTS.filter(e => e.category === 'tecnología').slice(0, 4);

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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-3">
          <h2 className="text-2xl font-bold tracking-tight text-text">
            ¿Qué está pasando?
          </h2>
        </div>

        {/* Integrated Search Bar */}
        <div id="buscador" className="max-w-6xl mx-auto px-4 sm:px-6 mb-4 scroll-mt-20">
          <SearchBar 
            query={filters.query || ''} 
            onQueryChange={(q) => setFilter({ query: q })}
            placeholder="Busca por plan, artista, lugar o categoría..."
          />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-2">
          <DateTabs activeDate={filters.date} onDateChange={handleDateChange} />
          
          <div className="flex flex-nowrap overflow-x-auto md:flex-wrap md:overflow-visible gap-2 py-2 no-scrollbar w-full">
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
              label="Ciencia"
              active={filters.category === 'ciencia'}
              onClick={() => setFilter({ category: filters.category === 'ciencia' ? null : 'ciencia' })}
            />
            <FilterChip
              label="Tecnología"
              active={filters.category === 'tecnología'}
              onClick={() => setFilter({ category: filters.category === 'tecnología' ? null : 'tecnología' })}
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
              className="ml-auto md:ml-0 flex-shrink-0"
            />
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        <div className="mb-2 flex items-center gap-2">
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
          <div className="space-y-10">
            <EditorialSection title="Para ti" subtitle="Cosas que creemos que vale la pena mirar.">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-2">
                {paraTiEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </EditorialSection>

            <EditorialSection title="Ciencia" subtitle="Astronomía, biotecnología, neurociencias y divulgación científica.">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-2">
                {cienciaEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </EditorialSection>

            <EditorialSection title="Tecnología" subtitle="Inteligencia artificial, código abierto, robótica y hardware libre.">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-2">
                {tecnologiaEvents.map(event => (
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-2">
                {estaNocheEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </EditorialSection>

            <EditorialSection title="Gratis" subtitle="Planes que no cuestan un peso.">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-2">
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
