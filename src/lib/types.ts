// ─────────────────────────────────────────────
// AntiFOMO — Type Definitions
// ─────────────────────────────────────────────

export type PriceType = 'free' | 'paid' | 'donation' | 'unknown';
export type SourceType = 'instagram' | 'facebook' | 'tiktok' | 'luma' | 'eventbrite' | 'web' | 'community' | 'whatsapp';
export type ViewMode = 'agenda' | 'explorar';

export type Category =
  | 'música'
  | 'arte'
  | 'cine'
  | 'teatro'
  | 'fiesta'
  | 'talleres'
  | 'literatura'
  | 'comunidad'
  | 'gastronomía'
  | 'bienestar'
  | 'mercados'
  | 'comedia'
  | 'performance'
  | 'ciencia-tecnologia';

export type Zone =
  | 'Centro'
  | 'Laureles'
  | 'El Poblado'
  | 'Manila'
  | 'Belén'
  | 'Envigado'
  | 'Sabaneta'
  | 'Itagüí'
  | 'Bello'
  | 'Santa Elena'
  | 'Rionegro'
  | 'Prado'
  | 'Buenos Aires'
  | 'Barrio Colombia'
  | 'Aranjuez'
  | 'Guayabal';

export type DateFilter = 'hoy' | 'mañana' | 'este-finde' | 'próximos';
export type TimeOfDay = 'mañana' | 'tarde' | 'noche';
export type PriceRange = 'gratis' | 'hasta-20k' | 'hasta-50k' | 'cualquier';

export interface EventSource {
  type: SourceType;
  label: string;
  url?: string;
}

export interface AntiFOMOEvent {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  longDescription?: string;
  startDate: string; // ISO date: YYYY-MM-DD
  startTime: string; // HH:mm
  endTime?: string;  // HH:mm
  venue: string;
  neighborhood: Zone | string;
  city: string;
  latitude?: number;
  longitude?: number;
  category: Category | string;
  subcategory?: string;
  priceType: PriceType;
  priceMin?: number;
  priceMax?: number;
  currency: string;
  organizer?: string;
  image?: string;
  sources: EventSource[];
  sourceCount: number;
  verified: boolean;
  isGem: boolean;
  isNewlyFound: boolean;
  detectedAt?: string; // ISO datetime
  lastCheckedAt?: string; // ISO datetime
  capacity?: number;
  tags: string[];
  score: number; // AntiFOMO Score (manual for MVP)
}

export interface FilterState {
  date: DateFilter | null;
  timeOfDay: TimeOfDay | null;
  priceRange: PriceRange | null;
  category: Category | null;
  zone: Zone | null;
  query: string;
  showGems: boolean;
  showFree: boolean;
  showNearby: boolean;
}

export const DEFAULT_FILTERS: FilterState = {
  date: null,
  timeOfDay: null,
  priceRange: null,
  category: null,
  zone: null,
  query: '',
  showGems: false,
  showFree: false,
  showNearby: false,
};

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface SubmitEventData {
  url?: string;
  title?: string;
  description?: string;
  date?: string;
  time?: string;
  venue?: string;
  category?: string;
  price?: string;
}
