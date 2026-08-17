'use client';

import { useState, useMemo } from 'react';
import type { AntiFOMOEvent, FilterState } from '@/lib/types';
import { DEFAULT_FILTERS } from '@/lib/types';
import { filterEvents } from '@/lib/filters';
import { searchEvents } from '@/lib/search';

export function useFilters(events: AntiFOMOEvent[]) {
  const [filters, setFiltersState] = useState<FilterState>(DEFAULT_FILTERS);

  const setFilter = (newFilters: Partial<FilterState>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFiltersState(DEFAULT_FILTERS);
  };

  const filteredEvents = useMemo(() => {
    let result = filterEvents(events, filters);
    if (filters.query) {
      result = searchEvents(result, filters.query);
    }
    return result;
  }, [events, filters]);

  return {
    filters,
    setFilter,
    clearFilters,
    filteredEvents,
    resultCount: filteredEvents.length
  };
}
