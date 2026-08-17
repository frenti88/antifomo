import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, sourceUrl, date, time, venue, category, price, email } = body;

    // Validate minimum required fields
    if (!title && !sourceUrl) {
      return NextResponse.json({
        success: false,
        error: 'Se requiere al menos un título o un enlace de origen.',
      }, { status: 400 });
    }

    // If Supabase is connected, store in submitted_events table for moderation
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('submitted_events')
        .insert([
          {
            title: title || 'Evento enviado por la comunidad',
            description: description || null,
            source_url: sourceUrl || null,
            event_date: date || null,
            event_time: time || null,
            venue: venue || null,
            category: category || null,
            price: price || null,
            submitter_email: email || null,
            status: 'pending_review',
          },
        ])
        .select();

      if (error) {
        console.error('Supabase submission error:', error);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Evento recibido correctamente. Pasará a revisión antes de publicarse en el radar.',
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: String(error),
    }, { status: 500 });
  }
}
