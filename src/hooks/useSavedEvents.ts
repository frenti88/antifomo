'use client';

import { useState, useEffect, useMemo } from 'react';
import type { AntiFOMOEvent } from '@/lib/types';
import { getSavedEventIds, toggleSavedEvent } from '@/lib/storage';

export function useSavedEvents(allEvents: AntiFOMOEvent[]) {
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    setSavedIds(getSavedEventIds());
  }, []);

  const isSaved = (id: string) => savedIds.includes(id);

  const toggleSave = (id: string) => {
    const isNowSaved = toggleSavedEvent(id);
    if (isNowSaved) {
      setSavedIds(prev => [...prev, id]);
    } else {
      setSavedIds(prev => prev.filter(savedId => savedId !== id));
    }
    return isNowSaved;
  };

  const savedEvents = useMemo(() => {
    return allEvents.filter(event => savedIds.includes(event.id));
  }, [allEvents, savedIds]);

  return { savedIds, isSaved, toggleSave, savedEvents };
}
