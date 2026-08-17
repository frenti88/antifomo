// ─────────────────────────────────────────────
// AntiFOMO — Local Storage Utilities
// ─────────────────────────────────────────────

import type { ViewMode } from './types';

const SAVED_EVENTS_KEY = 'antifomo_saved_events';
const VIEW_MODE_KEY = 'antifomo_view_mode';

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

/** Get saved event IDs */
export function getSavedEventIds(): string[] {
  const storage = getStorage();
  if (!storage) return [];
  try {
    const data = storage.getItem(SAVED_EVENTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/** Save an event by ID */
export function saveEventId(id: string): void {
  const storage = getStorage();
  if (!storage) return;
  const ids = getSavedEventIds();
  if (!ids.includes(id)) {
    ids.push(id);
    storage.setItem(SAVED_EVENTS_KEY, JSON.stringify(ids));
  }
}

/** Remove a saved event by ID */
export function removeEventId(id: string): void {
  const storage = getStorage();
  if (!storage) return;
  const ids = getSavedEventIds().filter((savedId) => savedId !== id);
  storage.setItem(SAVED_EVENTS_KEY, JSON.stringify(ids));
}

/** Check if an event is saved */
export function isEventSaved(id: string): boolean {
  return getSavedEventIds().includes(id);
}

/** Toggle saved state, returns new state */
export function toggleSavedEvent(id: string): boolean {
  if (isEventSaved(id)) {
    removeEventId(id);
    return false;
  } else {
    saveEventId(id);
    return true;
  }
}

/** Get view mode preference */
export function getViewMode(): ViewMode {
  const storage = getStorage();
  if (!storage) return 'agenda';
  const mode = storage.getItem(VIEW_MODE_KEY);
  return (mode === 'explorar' ? 'explorar' : 'agenda') as ViewMode;
}

/** Set view mode preference */
export function setViewMode(mode: ViewMode): void {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(VIEW_MODE_KEY, mode);
}
