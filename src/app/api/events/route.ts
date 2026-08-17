import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured, mapRowToEvent } from '@/lib/supabase';
import { DEMO_EVENTS } from '@/data/events';
import { filterEvents } from '@/lib/filters';
import { searchEvents } from '@/lib/search';
import type { FilterState, Category, Zone, DateFilter, TimeOfDay, PriceRange } from '@/lib/types';

// Revalidate cache every 5 minutes (ISR)
export const revalidate = 300;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') as Category | null;
  const zone = searchParams.get('zone') as Zone | null;
  const date = searchParams.get('date') as DateFilter | null;
  const query = searchParams.get('q') || '';
  const showGems = searchParams.get('gems') === 'true';
  const showFree = searchParams.get('free') === 'true';

  try {
    let events = DEMO_EVENTS;

    // If Supabase is configured, fetch live events from PostgreSQL
    if (isSupabaseConfigured && supabase) {
      let dbQuery = supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .order('start_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (category) {
        dbQuery = dbQuery.eq('category', category);
      }
      if (zone) {
        dbQuery = dbQuery.eq('neighborhood', zone);
      }
      if (showGems) {
        dbQuery = dbQuery.eq('is_gem', true);
      }
      if (showFree) {
        dbQuery = dbQuery.eq('price_type', 'free');
      }

      const { data, error } = await dbQuery;

      if (!error && data && data.length > 0) {
        events = data.map(mapRowToEvent);
      }
    }

    // Apply in-memory search and filter logic
    const filterState: FilterState = {
      date: date || null,
      timeOfDay: null,
      priceRange: showFree ? 'gratis' : null,
      category: category || null,
      zone: zone || null,
      showFree,
      showGems,
      showNearby: false,
      query,
    };

    let result = filterEvents(events, filterState);
    if (query) {
      result = searchEvents(result, query);
    }

    return NextResponse.json({
      success: true,
      count: result.length,
      isLiveDb: isSupabaseConfigured,
      events: result,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: String(error),
      events: DEMO_EVENTS,
    }, { status: 500 });
  }
}
