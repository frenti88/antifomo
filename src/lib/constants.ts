// ─────────────────────────────────────────────
// AntiFOMO — Constants & Configuration
// ─────────────────────────────────────────────

export const DEMO_MODE = true;
export const DEMO_BASE_DATE = '2026-08-17';

export const SITE_NAME = 'AntiFOMO';
export const SITE_TAGLINE = 'Encuentra lo que no sabías que estaba pasando.';
export const SITE_DESCRIPTION =
  'Eventos independientes, cultura, música, arte y experiencias que normalmente se pierden entre redes sociales y agendas.';
export const SITE_URL = 'https://antifomo.co';
export const DEFAULT_CITY = 'Medellín';

export const COLORS = {
  bg: '#F6F3EA',
  text: '#111111',
  accent: '#D7FF3F',
  secondary: '#5F5F58',
  surface: '#ECE9DF',
  border: '#D4D0C5',
  // Dark mode (prepared)
  darkBg: '#111111',
  darkText: '#F6F3EA',
  darkSurface: '#1A1A1A',
} as const;

export const CITIES = [
  'Medellín',
  'Envigado',
  'Sabaneta',
  'Bello',
  'Itagüí',
  'Rionegro',
  'Santa Elena',
] as const;

export const NAV_ITEMS = [
  { href: '/', label: 'Radar', icon: 'radar' },
  { href: '/explorar', label: 'Explorar', icon: 'explore' },
  { href: '/guardados', label: 'Guardados', icon: 'bookmark' },
  { href: '/enviar', label: 'Enviar', icon: 'send' },
] as const;

export const ANALYTICS_EVENTS = {
  EVENT_VIEW: 'event_view',
  EVENT_SAVE: 'event_save',
  EVENT_SHARE: 'event_share',
  SOURCE_CLICK: 'source_click',
  FILTER_APPLY: 'filter_apply',
  SEARCH: 'search',
  NEAR_ME_ACTIVATE: 'near_me_activate',
  SUBMIT_EVENT_START: 'submit_event_start',
  SUBMIT_EVENT_COMPLETE: 'submit_event_complete',
  GEM_VIEW: 'gem_view',
  NEWLY_FOUND_VIEW: 'newly_found_view',
} as const;
