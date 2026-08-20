'use client';

import { useState, useEffect } from 'react';
import type { AntiFOMOEvent } from '@/lib/types';
import { DEMO_EVENTS } from '@/data/events';

/**
 * Hook to provide events with immediate static fallback (SSR safe)
 * and seamless background update from live Supabase /api/events on client mount.
 */
export function useLiveEvents(initial: AntiFOMOEvent[] = DEMO_EVENTS) {
  const [events, setEvents] = useState<AntiFOMOEvent[]>(initial);
  const [isLiveLoaded, setIsLiveLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchLatestEvents() {
      try {
        const res = await fetch('/api/events');
        if (!res.ok) return;
        const json = await res.json();
        if (json && Array.isArray(json.events) && json.events.length > 0 && isMounted) {
          setEvents(json.events);
          setIsLiveLoaded(true);
        }
      } catch {
        // Fallback silently to initial static events
      }
    }

    fetchLatestEvents();
    return () => {
      isMounted = false;
    };
  }, []);

  return { events, isLiveLoaded };
}
