import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { sendEventNotificationEmail } from '@/lib/email';

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

    let submissionId: string | undefined = undefined;

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
        .select('id')
        .single();

      if (error) {
        console.error('Supabase submission error:', error);
      } else if (data?.id) {
        submissionId = data.id;
      }
    }

    // Send instant email notification to admin with direct moderation action links
    await sendEventNotificationEmail({
      submissionId,
      title: title || 'Nuevo enlace propuesto',
      description,
      sourceUrl,
      startDate: date,
      startTime: time,
      venue,
      category,
      price,
      submitterEmail: email,
      type: 'community_submission',
    });

    return NextResponse.json({
      success: true,
      submissionId,
      message: 'Evento recibido correctamente. Pasará a revisión antes de publicarse en el radar.',
    });
  } catch (error) {
    console.error('Error in /api/events/submit:', error);
    return NextResponse.json({
      success: false,
      error: String(error),
    }, { status: 500 });
  }
}
