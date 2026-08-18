import { NextResponse } from 'next/server';
import { sendEventNotificationEmail } from '@/lib/email';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hiadblaoxgfbfceiwqbo.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpYWRibGFveGdmYmZjZWl3cWJvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Njk4NTk5MywiZXhwIjoyMTAyNTYxOTkzfQ.NfXTOjdPQm8lCTPpYej-ILf5yX8FatHNDiQvMODYLKI';

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

    // Format event time safely (e.g. "19:00" -> "19:00:00")
    let formattedTime: string | null = null;
    if (time) {
      formattedTime = time.length === 5 ? `${time}:00` : time;
    }

    // Direct REST insert into Supabase submitted_events
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/submitted_events`, {
        method: 'POST',
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          title: title || 'Evento enviado por la comunidad',
          description: description || null,
          source_url: sourceUrl || null,
          event_date: date || null,
          event_time: formattedTime,
          venue: venue || null,
          category: category ? category.toLowerCase() : null,
          price: price || null,
          submitter_email: email || null,
          status: 'pending_review',
        }),
      });

      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows[0]?.id) {
          submissionId = rows[0].id;
        }
      } else {
        const errText = await res.text();
        console.error('Error inserting into submitted_events REST:', errText);
      }
    } catch (dbErr) {
      console.error('Supabase REST submission exception:', dbErr);
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
      message: 'Evento registrado con éxito en el panel de moderación de AntiFOMO.',
    });
  } catch (error) {
    console.error('Error in /api/events/submit:', error);
    return NextResponse.json({
      success: false,
      error: String(error),
    }, { status: 500 });
  }
}
