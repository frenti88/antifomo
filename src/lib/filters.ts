// ─────────────────────────────────────────────
// AntiFOMO — Filter Logic
// ─────────────────────────────────────────────

import type { AntiFOMOEvent, FilterState, DateFilter, TimeOfDay, PriceRange } from './types';
import { isToday, isTomorrow, isThisWeekend, isNextDays, isMorning, isAfternoon, isEvening } from './dates';

/** Apply date filter */
function matchesDate(event: AntiFOMOEvent, filter: DateFilter): boolean {
  switch (filter) {
    case 'hoy': return isToday(event.startDate);
    case 'mañana': return isTomorrow(event.startDate);
    case 'este-finde': return isThisWeekend(event.startDate);
    case 'próximos': return isNextDays(event.startDate, 7);
  }
}

/** Apply time of day filter */
function matchesTimeOfDay(event: AntiFOMOEvent, filter: TimeOfDay): boolean {
  switch (filter) {
    case 'mañana': return isMorning(event.startTime);
    case 'tarde': return isAfternoon(event.startTime);
    case 'noche': return isEvening(event.startTime);
  }
}

/** Apply price range filter */
function matchesPriceRange(event: AntiFOMOEvent, filter: PriceRange): boolean {
  switch (filter) {
    case 'gratis': return event.priceType === 'free';
    case 'hasta-20k': return event.priceType === 'free' || (event.priceMin !== undefined && event.priceMin <= 20000);
    case 'hasta-50k': return event.priceType === 'free' || (event.priceMin !== undefined && event.priceMin <= 50000);
    case 'cualquier': return true;
  }
}

/** Apply all filters to an event list */
export function filterEvents(events: AntiFOMOEvent[], filters: FilterState): AntiFOMOEvent[] {
  return events.filter((event) => {
    // Date filter
    if (filters.date && !matchesDate(event, filters.date)) return false;

    // Time of day
    if (filters.timeOfDay && !matchesTimeOfDay(event, filters.timeOfDay)) return false;

    // Price range
    if (filters.priceRange && !matchesPriceRange(event, filters.priceRange)) return false;

    // Category
    if (filters.category && event.category !== filters.category) return false;

    // Zone
    if (filters.zone && event.neighborhood !== filters.zone) return false;

    // Free only
    if (filters.showFree && event.priceType !== 'free') return false;

    // Gems only
    if (filters.showGems && !event.isGem) return false;

    return true;
  });
}

/** Sort events by AntiFOMO score (highest first) */
export function sortByScore(events: AntiFOMOEvent[]): AntiFOMOEvent[] {
  return [...events].sort((a, b) => b.score - a.score);
}

/** Sort events by date and time */
export function sortByDate(events: AntiFOMOEvent[]): AntiFOMOEvent[] {
  return [...events].sort((a, b) => {
    const dateCompare = a.startDate.localeCompare(b.startDate);
    if (dateCompare !== 0) return dateCompare;
    return a.startTime.localeCompare(b.startTime);
  });
}

/** Get today's events */
export function getTodayEvents(events: AntiFOMOEvent[]): AntiFOMOEvent[] {
  return sortByScore(events.filter(e => isToday(e.startDate)));
}

/** Get gem events */
export function getGemEvents(events: AntiFOMOEvent[]): AntiFOMOEvent[] {
  return sortByScore(events.filter(e => e.isGem));
}

/** Get newly found events */
export function getNewlyFoundEvents(events: AntiFOMOEvent[]): AntiFOMOEvent[] {
  return sortByScore(events.filter(e => e.isNewlyFound));
}

/** Get tonight's events (starts after 18:00 today) */
export function getTonightEvents(events: AntiFOMOEvent[]): AntiFOMOEvent[] {
  return sortByDate(events.filter(e => isToday(e.startDate) && isEvening(e.startTime)));
}

/** Get free events */
export function getFreeEvents(events: AntiFOMOEvent[]): AntiFOMOEvent[] {
  return sortByScore(events.filter(e => e.priceType === 'free'));
}

/** Get editorial picks ("Para ti") - top scored events */
export function getEditorialPicks(events: AntiFOMOEvent[], count: number = 4): AntiFOMOEvent[] {
  return sortByScore(events).slice(0, count);
}

/** Count filtered results */
export function countFilteredResults(events: AntiFOMOEvent[], filters: FilterState): number {
  return filterEvents(events, filters).length;
}
