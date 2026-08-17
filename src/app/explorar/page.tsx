'use client';

import React, { useState } from 'react';
import { DEMO_EVENTS } from '@/data/events';
import { useFilters } from '@/hooks/useFilters';
import { useViewMode } from '@/hooks/useViewMode';
import { SearchBar } from '@/components/filters/SearchBar';
import { DateTabs } from '@/components/filters/DateTabs';
import { FilterChip } from '@/components/filters/FilterChip';
import { FilterSheet } from '@/components/filters/FilterSheet';
import { EventList } from '@/components/events/EventList';
import type { Category, DateFilter } from '@/lib/types';

export default function ExplorarPage() {
  const { filters, setFilter, clearFilters, filteredEvents, resultCount } = useFilters(DEMO_EVENTS);
  const { viewMode, setViewMode, isAgenda, isExplorar } = useViewMode();
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const isFiltering = 
    filters.category !== null ||
    filters.showFree === true ||
    filters.showGems === true ||
    filters.zone !== null ||
    filters.timeOfDay !== null ||
    filters.priceRange !== null ||
    filters.date !== null;

  const handleDateChange = (date: DateFilter | null) => {
    setFilter({ date });
  };

  return (
    <div className="pb-24">
      <h1 className="sr-only">Explorar eventos en Medellín</h1>

      <div className="sticky top-14 z-20 bg-bg/95 backdrop-blur-md border-b border-border transition-colors">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row sm:items-center">
          <div className="flex-1">
            <SearchBar 
              query={filters.query || ''} 
              onQueryChange={(q) => setFilter({ query: q })} 
            />
          </div>
          <div className="px-4 py-2 sm:py-3 flex justify-start sm:justify-end">
            <div className="flex bg-surface rounded-full p-1 border border-border w-fit">
              <button
                type="button"
                onClick={() => setViewMode('agenda')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-text ${
                  isAgenda ? 'bg-text text-bg' : 'text-secondary hover:text-text'
                }`}
              >
                Agenda
              </button>
              <button
                type="button"
                onClick={() => setViewMode('explorar')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-text ${
                  isExplorar ? 'bg-text text-bg' : 'text-secondary hover:text-text'
                }`}
              >
                Explorar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="space-y-2 py-4">
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

        <div className="px-4 mb-4">
          <p className="text-sm font-medium text-secondary">
            Encontramos {resultCount} evento{resultCount !== 1 ? 's' : ''}
          </p>
        </div>

        <EventList events={filteredEvents} viewMode={viewMode} />
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
