// ─────────────────────────────────────────────
// AntiFOMO — Date Utilities (Spanish - Colombia)
// ─────────────────────────────────────────────

import { DEMO_MODE, DEMO_BASE_DATE } from './constants';

/** Get current date string in Colombia timezone (YYYY-MM-DD) */
export function getTodayDateStr(): string {
  if (DEMO_MODE) {
    return DEMO_BASE_DATE;
  }
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

/** Get the current date anchor in Colombia (set to midday 12:00 to avoid timezone offset issues) */
export function getToday(): Date {
  const dateStr = getTodayDateStr();
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

const DAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/** Parse a date string (YYYY-MM-DD) into a Date object */
export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

/** Format date like "lunes 17 de agosto" */
export function formatDateFull(dateStr: string): string {
  const date = parseDate(dateStr);
  const day = DAYS[date.getDay()];
  const num = date.getDate();
  const month = MONTHS[date.getMonth()];
  return `${day} ${num} de ${month}`;
}

/** Format date like "17 ago" */
export function formatDateShort(dateStr: string): string {
  const date = parseDate(dateStr);
  const num = date.getDate();
  const month = MONTHS[date.getMonth()].slice(0, 3);
  return `${num} ${month}`;
}

/** Format time like "7:00 p.m." from "19:00" */
export function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'p.\u00a0m.' : 'a.\u00a0m.';
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
}

/** Get relative time like "Encontrado hace 37 min" */
export function getRelativeDetectedTime(detectedAt: string): string {
  const now = new Date();
  const detected = new Date(detectedAt);
  const diffMs = now.getTime() - detected.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMin < 1) return 'Encontrado justo ahora';
  if (diffMin < 60) return `Encontrado hace ${diffMin} min`;
  if (diffHours < 24) return `Encontrado hace ${diffHours} h`;
  if (diffDays === 1) return 'Encontrado ayer';
  return `Encontrado hace ${diffDays} días`;
}

/** Check if a date string is today */
export function isToday(dateStr: string): boolean {
  return dateStr === getTodayDateStr();
}

/** Check if a date string is tomorrow */
export function isTomorrow(dateStr: string): boolean {
  const today = getToday();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomDate = parseDate(dateStr);
  return (
    tomDate.getDate() === tomorrow.getDate() &&
    tomDate.getMonth() === tomorrow.getMonth() &&
    tomDate.getFullYear() === tomorrow.getFullYear()
  );
}

/** Check if a date string falls on this weekend (Friday through Sunday) */
export function isThisWeekend(dateStr: string): boolean {
  const today = getToday();
  const date = parseDate(dateStr);
  const dayOfWeek = today.getDay(); // 0: Sun, 1: Mon, ..., 5: Fri, 6: Sat

  const daysToFriday = dayOfWeek === 0 ? -2 : 5 - dayOfWeek;
  const friday = new Date(today);
  friday.setDate(today.getDate() + daysToFriday);
  friday.setHours(0, 0, 0, 0);

  const sunday = new Date(friday);
  sunday.setDate(friday.getDate() + 2);
  sunday.setHours(23, 59, 59, 999);

  return date >= friday && date <= sunday;
}

/** Check if a date is within the next N days starting from today */
export function isNextDays(dateStr: string, days: number = 7): boolean {
  const today = getToday();
  today.setHours(0, 0, 0, 0);
  const date = parseDate(dateStr);
  const limit = new Date(today);
  limit.setDate(today.getDate() + days);
  limit.setHours(23, 59, 59, 999);
  return date >= today && date <= limit;
}

/** Check if a date is today or in the future */
export function isUpcoming(dateStr: string): boolean {
  const todayStr = getTodayDateStr();
  return dateStr >= todayStr;
}

/** Check if a time string is evening (after 18:00) */
export function isEvening(time: string): boolean {
  const hour = parseInt(time.split(':')[0], 10);
  return hour >= 18;
}

/** Check if a time string is morning (before 12:00) */
export function isMorning(time: string): boolean {
  const hour = parseInt(time.split(':')[0], 10);
  return hour < 12;
}

/** Check if a time string is afternoon (12:00-17:59) */
export function isAfternoon(time: string): boolean {
  const hour = parseInt(time.split(':')[0], 10);
  return hour >= 12 && hour < 18;
}

/** Get a friendly date label like "Hoy", "Mañana", or the formatted date */
export function getDateLabel(dateStr: string): string {
  if (isToday(dateStr)) return 'Hoy';
  if (isTomorrow(dateStr)) return 'Mañana';
  return formatDateFull(dateStr);
}
