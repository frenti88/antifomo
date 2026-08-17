// ─────────────────────────────────────────────
// AntiFOMO — Search Logic
// ─────────────────────────────────────────────

import type { AntiFOMOEvent } from './types';

/** Normalize text for search (remove diacritics, lowercase) */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/** Search events by query across multiple fields */
export function searchEvents(events: AntiFOMOEvent[], query: string): AntiFOMOEvent[] {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return events;

  return events.filter((event) => {
    const searchableFields = [
      event.title,
      event.shortDescription,
      event.longDescription || '',
      event.venue,
      event.neighborhood,
      event.category,
      event.organizer || '',
      ...event.tags,
    ];

    const searchableText = normalize(searchableFields.join(' '));
    return searchableText.includes(normalizedQuery);
  });
}
