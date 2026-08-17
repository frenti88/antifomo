// ─────────────────────────────────────────────
// AntiFOMO — Categories, Zones & Filter Options
// ─────────────────────────────────────────────

import type { Category, Zone, PriceRange, DateFilter, TimeOfDay } from '@/lib/types';

export interface FilterOption<T> {
  value: T;
  label: string;
}

export const CATEGORIES: FilterOption<Category>[] = [
  { value: 'música', label: 'Música' },
  { value: 'arte', label: 'Arte' },
  { value: 'cine', label: 'Cine' },
  { value: 'teatro', label: 'Teatro' },
  { value: 'ciencia', label: 'Ciencia' },
  { value: 'tecnología', label: 'Tecnología' },
  { value: 'fiesta', label: 'Fiesta' },
  { value: 'talleres', label: 'Talleres' },
  { value: 'literatura', label: 'Literatura' },
  { value: 'comunidad', label: 'Comunidad' },
  { value: 'gastronomía', label: 'Gastronomía' },
  { value: 'bienestar', label: 'Bienestar' },
  { value: 'mercados', label: 'Mercados' },
  { value: 'comedia', label: 'Comedia' },
  { value: 'performance', label: 'Performance' },
];

export const CATEGORY_ICONS: Record<Category, string> = {
  música: '🎵',
  arte: '🎨',
  cine: '🎬',
  teatro: '🎭',
  ciencia: '🔬',
  tecnología: '💻',
  fiesta: '⚡',
  talleres: '🏺',
  literatura: '📖',
  comunidad: '🏛️',
  gastronomía: '🍻',
  bienestar: '🧘',
  mercados: '🛍️',
  comedia: '🎙️',
  performance: '💃',
};

export const ZONES: FilterOption<Zone>[] = [
  { value: 'Centro', label: 'Centro' },
  { value: 'Laureles', label: 'Laureles' },
  { value: 'El Poblado', label: 'El Poblado / Manila' },
  { value: 'Belén', label: 'Belén' },
  { value: 'Envigado', label: 'Envigado' },
  { value: 'Sabaneta', label: 'Sabaneta' },
  { value: 'Itagüí', label: 'Itagüí' },
  { value: 'Bello', label: 'Bello' },
  { value: 'Santa Elena', label: 'Santa Elena' },
  { value: 'Rionegro', label: 'Rionegro' },
];

export const DATE_FILTERS: FilterOption<DateFilter>[] = [
  { value: 'hoy', label: 'Hoy' },
  { value: 'mañana', label: 'Mañana' },
  { value: 'este-finde', label: 'Este finde' },
  { value: 'próximos', label: 'Próximos' },
];

export const TIME_OF_DAY_OPTIONS: FilterOption<TimeOfDay>[] = [
  { value: 'mañana', label: 'Mañana' },
  { value: 'tarde', label: 'Tarde' },
  { value: 'noche', label: 'Noche' },
];

export const PRICE_RANGES: FilterOption<PriceRange>[] = [
  { value: 'gratis', label: 'Gratis' },
  { value: 'hasta-20k', label: 'Hasta $20.000' },
  { value: 'hasta-50k', label: 'Hasta $50.000' },
  { value: 'cualquier', label: 'Cualquier precio' },
];

export const QUICK_CHIPS = [
  { id: 'todo', label: 'Todo', filter: {} },
  { id: 'gratis', label: 'Gratis', filter: { showFree: true } },
  { id: 'joyitas', label: 'Joyitas', filter: { showGems: true } },
  { id: 'ciencia', label: 'Ciencia', filter: { category: 'ciencia' as Category } },
  { id: 'tecnologia', label: 'Tecnología', filter: { category: 'tecnología' as Category } },
  { id: 'música', label: 'Música', filter: { category: 'música' as Category } },
  { id: 'arte', label: 'Arte', filter: { category: 'arte' as Category } },
  { id: 'cine', label: 'Cine', filter: { category: 'cine' as Category } },
  { id: 'fiesta', label: 'Fiesta', filter: { category: 'fiesta' as Category } },
  { id: 'talleres', label: 'Talleres', filter: { category: 'talleres' as Category } },
] as const;

export const SOURCE_ICONS: Record<string, string> = {
  instagram: '📷',
  facebook: '📘',
  tiktok: '🎵',
  luma: '✨',
  eventbrite: '🎫',
  web: '🌐',
  community: '👥',
  whatsapp: '💬',
};
