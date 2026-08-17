import { NextResponse } from 'next/server';
import { getServiceSupabase, mapRowToEvent } from '@/lib/supabase';
import { DEMO_EVENTS } from '@/data/events';
import { sendWeeklyDigestEmail } from '@/lib/email';
import type { AntiFOMOEvent } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const supabase = getServiceSupabase();
    let events: AntiFOMOEvent[] = [];

    if (supabase) {
      // Query events for the current week starting today
      const today = new Date().toISOString().split('T')[0];
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .gte('start_date', today)
        .lte('start_date', nextWeek)
        .order('score', { ascending: false })
        .limit(25);

      if (!error && data && data.length > 0) {
        events = data.map(mapRowToEvent);
      }
    }

    // Fallback to static catalog if needed
    if (events.length === 0) {
      events = [...DEMO_EVENTS].sort((a, b) => b.score - a.score);
    }

    // Pick 5 varied top-scoring events
    const selected: AntiFOMOEvent[] = [];
    const usedCategories = new Set<string>();

    for (const ev of events) {
      if (selected.length >= 5) break;
      if (!usedCategories.has(ev.category) || selected.length >= 4) {
        selected.push(ev);
        usedCategories.add(ev.category);
      }
    }

    if (selected.length < 5) {
      for (const ev of events) {
        if (selected.length >= 5) break;
        if (!selected.some(s => s.id === ev.id)) {
          selected.push(ev);
        }
      }
    }

    // Allow testing with ?email=xxx parameter or defaults to admin
    const { searchParams } = new URL(request.url);
    const targetEmail = searchParams.get('email') || undefined;

    const emailResult = await sendWeeklyDigestEmail(selected, targetEmail);

    return NextResponse.json({
      success: true,
      message: 'Boletín semanal de 5 eventos enviado con éxito',
      digestCount: selected.length,
      events: selected.map(e => ({
        title: e.title,
        date: e.startDate,
        time: e.startTime,
        venue: e.venue,
        category: e.category,
      })),
      emailResult,
    });
  } catch (error) {
    console.error('Error in weekly digest handler:', error);
    return NextResponse.json(
      { success: false, error: 'Error al enviar el boletín semanal' },
      { status: 500 }
    );
  }
}
