'use client';

import { useState, useEffect, useMemo } from 'react';
import type { AntiFOMOEvent } from '@/lib/types';
import { searchEvents } from '@/lib/search';

export function useSearch(events: AntiFOMOEvent[]) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    return searchEvents(events, debouncedQuery);
  }, [events, debouncedQuery]);

  return { query, setQuery, debouncedQuery, results, isSearching };
}
