import { createClient } from '@supabase/supabase-js';
import type { AntiFOMOEvent } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a Supabase client if keys are present
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Server-side client with service role for admin/cron ingestion
export function getServiceSupabase() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
  if (!supabaseUrl || !serviceKey) return null;
  return createClient(supabaseUrl, serviceKey);
}

// Convert database row to AntiFOMOEvent type
export function mapRowToEvent(row: Record<string, any>): AntiFOMOEvent {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    shortDescription: row.short_description,
    longDescription: row.long_description,
    startDate: row.start_date,
    startTime: row.start_time?.slice(0, 5) || row.start_time,
    endTime: row.end_time?.slice(0, 5) || row.end_time,
    venue: row.venue,
    neighborhood: row.neighborhood,
    city: row.city || 'Medellín',
    latitude: row.latitude ? Number(row.latitude) : undefined,
    longitude: row.longitude ? Number(row.longitude) : undefined,
    category: row.category,
    subcategory: row.subcategory,
    priceType: row.price_type || 'free',
    priceMin: row.price_min ? Number(row.price_min) : undefined,
    priceMax: row.price_max ? Number(row.price_max) : undefined,
    currency: row.currency || 'COP',
    organizer: row.organizer,
    image: row.image_url,
    sources: row.sources || [],
    sourceCount: row.source_count || (row.sources ? row.sources.length : 1),
    verified: Boolean(row.verified),
    isGem: Boolean(row.is_gem),
    isNewlyFound: Boolean(row.is_newly_found),
    detectedAt: row.detected_at,
    lastCheckedAt: row.last_checked_at,
    tags: row.tags || [],
    score: row.score || 85,
  };
}
