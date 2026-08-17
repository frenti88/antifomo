import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase';
import { DEMO_EVENTS } from '@/data/events';

// Route Handler for Vercel Cron Job
export async function GET(request: Request) {
  // Verify authorization token (optional for development, required in production with CRON_SECRET)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const supabase = getServiceSupabase();
    let syncedCount = 0;

    if (supabase) {
      // Upsert base events into Supabase PostgreSQL
      for (const event of DEMO_EVENTS) {
        const { error } = await supabase.from('events').upsert({
          slug: event.slug,
          title: event.title,
          short_description: event.shortDescription,
          long_description: event.longDescription || null,
          start_date: event.startDate,
          start_time: event.startTime,
          end_time: event.endTime || null,
          venue: event.venue,
          neighborhood: event.neighborhood,
          city: event.city,
          latitude: event.latitude || null,
          longitude: event.longitude || null,
          category: event.category,
          price_type: event.priceType,
          price_min: event.priceMin || 0,
          price_max: event.priceMax || 0,
          currency: event.currency,
          organizer: event.organizer || null,
          sources: event.sources,
          source_count: event.sourceCount,
          verified: event.verified,
          is_gem: event.isGem,
          is_newly_found: event.isNewlyFound,
          score: event.score,
          tags: event.tags,
          status: 'published',
          last_checked_at: new Date().toISOString(),
        }, { onConflict: 'slug' });

        if (!error) syncedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      syncedEvents: syncedCount,
      totalCatalog: DEMO_EVENTS.length,
      message: 'Sincronización del radar de eventos completada con éxito.',
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: String(error),
    }, { status: 500 });
  }
}
