import type { AntiFOMOEvent } from './types';
import { isToday, isTomorrow, isThisWeekend, isNextDays } from './dates';

// ─────────────────────────────────────────────
// Curation Rules
// ─────────────────────────────────────────────

const EXCLUDED_KEYWORDS = [
  'masaya', 'hostal', 'beer pong', 'free workout', 
  'cartagena', 'santa marta', 'bogotá', 'bogota', 'quibdó', 'barranquilla'
];

const CURATED_VENUES = [
  'matacandelas', 'planetario', 'pascasia', 'comfama', 'mamm', 
  'casa umbral', 'teatro lido', 'teatro pablo tobón', 'teatro pablo tobon', 'otraparte', 
  'parque explora', 'museo de antioquia', 'jardín botánico', 'jardin botanico'
];

const JOYITA_CATEGORIES = ['ciencia', 'arte', 'teatro', 'literatura'];

function isLowQuality(event: AntiFOMOEvent): boolean {
  const text = `${event.venue} ${event.city || ''} ${event.tags?.join(' ')}`.toLowerCase();
  return EXCLUDED_KEYWORDS.some(kw => text.includes(kw));
}

function isCuratedVenue(event: AntiFOMOEvent): boolean {
  const venue = event.venue.toLowerCase();
  return CURATED_VENUES.some(v => venue.includes(v));
}

export function isStrictJoyita(event: AntiFOMOEvent): boolean {
  return (
    isCuratedVenue(event) ||
    event.sourceCount >= 3 ||
    JOYITA_CATEGORIES.includes(event.category)
  );
}

// ─────────────────────────────────────────────
// Selectors
// ─────────────────────────────────────────────

export type HomeTab = 'esta-noche' | 'manana' | 'este-finde';

export function getEstaNocheEvents(events: AntiFOMOEvent[], tab: HomeTab): AntiFOMOEvent[] {
  // 1. Filter out bad locations/spam
  let validEvents = events.filter(e => !isLowQuality(e));

  // 2. Filter by time window
  validEvents = validEvents.filter(e => {
    if (tab === 'esta-noche') {
      return isToday(e.startDate) && e.startTime >= '17:00';
    }
    if (tab === 'manana') {
      return isTomorrow(e.startDate);
    }
    if (tab === 'este-finde') {
      return isThisWeekend(e.startDate);
    }
    return false;
  });

  // 3. Sort (prioritize curated venues, then by score)
  validEvents.sort((a, b) => {
    const aCurated = isCuratedVenue(a) ? 1 : 0;
    const bCurated = isCuratedVenue(b) ? 1 : 0;
    if (aCurated !== bCurated) return bCurated - aCurated;
    return b.score - a.score;
  });

  // 4. Deduplicate (by title + date)
  const seen = new Set<string>();
  const deduped: AntiFOMOEvent[] = [];
  for (const e of validEvents) {
    const key = `${e.title.toLowerCase()}|${e.startDate}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(e);
    }
  }

  // 5. Mix categories (max 3 per category)
  const categoryCounts: Record<string, number> = {};
  const mixed: AntiFOMOEvent[] = [];
  
  for (const e of deduped) {
    if (mixed.length >= 8) break;
    const cat = e.category;
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    if (categoryCounts[cat] <= 3) {
      mixed.push(e);
    }
  }

  return mixed;
}

export function getJoyitasRadar(events: AntiFOMOEvent[], excludeSlugs: Set<string>): AntiFOMOEvent[] {
  // Próximos 7 días, estrictamente joyitas, no excluidas
  const valid = events.filter(e => 
    !excludeSlugs.has(e.slug) &&
    !isLowQuality(e) &&
    isNextDays(e.startDate, 7) &&
    isStrictJoyita(e)
  );

  // Sort by score
  valid.sort((a, b) => b.score - a.score);

  // Deduplicate
  const seen = new Set<string>();
  const deduped: AntiFOMOEvent[] = [];
  for (const e of valid) {
    if (deduped.length >= 5) break;
    const key = `${e.title.toLowerCase()}|${e.startDate}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(e);
    }
  }

  return deduped;
}

export function getCercaDeTi(events: AntiFOMOEvent[], barrio: string, excludeSlugs: Set<string>): AntiFOMOEvent[] {
  if (!barrio) return [];
  
  const valid = events.filter(e => 
    !excludeSlugs.has(e.slug) &&
    !isLowQuality(e) &&
    isNextDays(e.startDate, 7) &&
    e.neighborhood === barrio
  );

  valid.sort((a, b) => b.score - a.score);

  // Deduplicate
  const seen = new Set<string>();
  const deduped: AntiFOMOEvent[] = [];
  for (const e of valid) {
    if (deduped.length >= 4) break;
    const key = `${e.title.toLowerCase()}|${e.startDate}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(e);
    }
  }

  return deduped;
}
