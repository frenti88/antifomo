import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hiadblaoxgfbfceiwqbo.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpYWRibGFveGdmYmZjZWl3cWJvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Njk4NTk5MywiZXhwIjoyMTAyNTYxOTkzfQ.NfXTOjdPQm8lCTPpYej-ILf5yX8FatHNDiQvMODYLKI';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'antifomo_admin_2026';

function verifyAdmin(request: Request): boolean {
  const adminKey = request.headers.get('x-admin-key');
  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  
  return adminKey === ADMIN_SECRET || bearerToken === ADMIN_SECRET;
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

export async function GET(request: Request) {
  if (!verifyAdmin(request)) {
    return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
  }

  try {
    const headers = {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    };

    // 1. Fetch submitted events (pending, approved, rejected)
    const submittedRes = await fetch(`${supabaseUrl}/rest/v1/submitted_events?select=*&order=created_at.desc`, {
      headers,
    });
    const submissions: any[] = submittedRes.ok ? await submittedRes.json() : [];

    // 2. Fetch all events (published, archived)
    const eventsRes = await fetch(`${supabaseUrl}/rest/v1/events?select=*&order=start_date.asc,start_time.asc`, {
      headers,
    });
    const events: any[] = eventsRes.ok ? await eventsRes.json() : [];

    const pendingSubmissions = submissions.filter(s => s.status === 'pending_review' || !s.status);
    const approvedSubmissions = submissions.filter(s => s.status === 'approved');
    const rejectedSubmissions = submissions.filter(s => s.status === 'rejected');

    const publishedEvents = events.filter(e => e.status === 'published' || !e.status);
    const archivedEvents = events.filter(e => e.status === 'archived');

    return NextResponse.json({
      success: true,
      data: {
        pendingSubmissions,
        approvedSubmissions,
        rejectedSubmissions,
        publishedEvents,
        archivedEvents,
        stats: {
          pendingCount: pendingSubmissions.length,
          publishedCount: publishedEvents.length,
          archivedCount: archivedEvents.length,
          totalSubmissions: submissions.length,
        }
      }
    });
  } catch (error) {
    console.error('Error in admin GET:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, password, submissionId, eventId, eventData } = body;

    // Login action check
    if (action === 'login') {
      if (password === ADMIN_SECRET) {
        return NextResponse.json({ success: true, token: ADMIN_SECRET });
      }
      return NextResponse.json({ success: false, error: 'Contraseña incorrecta' }, { status: 401 });
    }

    // Require admin token for all other mutations
    if (!verifyAdmin(request) && body.adminKey !== ADMIN_SECRET) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 });
    }

    const headers = {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    };

    // 1. APPROVE SUBMISSION -> Insert/Upsert into events & mark submission as approved
    if (action === 'approve') {
      if (!submissionId) {
        return NextResponse.json({ success: false, error: 'ID de envío requerido' }, { status: 400 });
      }

      // Fetch submission if eventData is partial
      const subRes = await fetch(`${supabaseUrl}/rest/v1/submitted_events?id=eq.${submissionId}&select=*`, {
        headers,
      });
      const [submission] = subRes.ok ? await subRes.json() : [];

      if (!submission && !eventData) {
        return NextResponse.json({ success: false, error: 'Envío no encontrado' }, { status: 404 });
      }

      const title = eventData?.title || submission?.title || 'Nuevo Evento';
      const baseSlug = slugify(title);
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const slug = eventData?.slug || `${baseSlug}-${randomSuffix}`;

      const priceStr = String(eventData?.price || submission?.price || 'Gratis');
      const isFree = priceStr.toLowerCase().includes('gratis') || priceStr === '0';
      const parsedPriceMin = isFree ? 0 : (parseInt(priceStr.replace(/\D/g, ''), 10) || 0);

      const sources = eventData?.sources || (submission?.source_url ? [{
        name: 'Aporte de la Comunidad',
        url: submission.source_url,
        type: submission.source_url.includes('instagram') ? 'instagram' : 'web',
        detectedAt: submission.created_at || new Date().toISOString(),
      }] : []);

      const newEventRecord = {
        title,
        slug,
        short_description: eventData?.short_description || submission?.description || 'Evento enviado por la comunidad y verificado por AntiFOMO.',
        long_description: eventData?.long_description || submission?.description || '',
        start_date: eventData?.start_date || submission?.event_date || new Date().toISOString().split('T')[0],
        start_time: (eventData?.start_time || submission?.event_time || '19:00').slice(0, 5),
        end_time: eventData?.end_time || null,
        venue: eventData?.venue || submission?.venue || 'Medellín',
        neighborhood: eventData?.neighborhood || 'El Poblado / Centro',
        city: eventData?.city || 'Medellín',
        category: eventData?.category || submission?.category || 'música',
        price_type: isFree ? 'free' : 'paid',
        price_min: parsedPriceMin,
        currency: 'COP',
        organizer: eventData?.organizer || 'Comunidad AntiFOMO',
        sources,
        source_count: sources.length,
        verified: eventData?.verified !== undefined ? eventData.verified : true,
        is_gem: eventData?.is_gem !== undefined ? eventData.is_gem : false,
        is_newly_found: false,
        status: 'published',
        score: eventData?.score || 90,
        tags: eventData?.tags || [eventData?.category || submission?.category || 'cultural', 'radar'],
        detected_at: new Date().toISOString(),
        last_checked_at: new Date().toISOString(),
      };

      // Insert event into events table
      const insertEventRes = await fetch(`${supabaseUrl}/rest/v1/events`, {
        method: 'POST',
        headers: {
          ...headers,
          Prefer: 'resolution=merge-duplicates,return=representation',
        },
        body: JSON.stringify(newEventRecord),
      });

      if (!insertEventRes.ok) {
        const errorText = await insertEventRes.text();
        return NextResponse.json({ success: false, error: `Error creando evento: ${errorText}` }, { status: 500 });
      }

      const createdEvents = await insertEventRes.json();

      // Update submission status to approved
      await fetch(`${supabaseUrl}/rest/v1/submitted_events?id=eq.${submissionId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: 'approved' }),
      });

      return NextResponse.json({
        success: true,
        message: 'Evento aprobado y publicado exitosamente en el radar.',
        event: createdEvents[0],
      });
    }

    // 2. REJECT SUBMISSION
    if (action === 'reject') {
      if (!submissionId) {
        return NextResponse.json({ success: false, error: 'ID de envío requerido' }, { status: 400 });
      }

      const patchRes = await fetch(`${supabaseUrl}/rest/v1/submitted_events?id=eq.${submissionId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: 'rejected' }),
      });

      if (!patchRes.ok) {
        return NextResponse.json({ success: false, error: 'Error rechazando envío' }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Envío marcado como rechazado.' });
    }

    // 3. ARCHIVE EVENT (Dar de baja)
    if (action === 'archive') {
      if (!eventId) {
        return NextResponse.json({ success: false, error: 'ID de evento requerido' }, { status: 400 });
      }

      const patchRes = await fetch(`${supabaseUrl}/rest/v1/events?id=eq.${eventId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: 'archived' }),
      });

      if (!patchRes.ok) {
        return NextResponse.json({ success: false, error: 'Error archivando evento' }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Evento dado de baja (archivado) del radar público.' });
    }

    // 4. PUBLISH EVENT (Dar de alta)
    if (action === 'publish') {
      if (!eventId) {
        return NextResponse.json({ success: false, error: 'ID de evento requerido' }, { status: 400 });
      }

      const patchRes = await fetch(`${supabaseUrl}/rest/v1/events?id=eq.${eventId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: 'published' }),
      });

      if (!patchRes.ok) {
        return NextResponse.json({ success: false, error: 'Error publicando evento' }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Evento reactivado y publicado en el radar.' });
    }

    // 5. TOGGLE IS_GEM
    if (action === 'toggle_gem') {
      if (!eventId) {
        return NextResponse.json({ success: false, error: 'ID de evento requerido' }, { status: 400 });
      }

      const patchRes = await fetch(`${supabaseUrl}/rest/v1/events?id=eq.${eventId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ is_gem: Boolean(body.is_gem) }),
      });

      return NextResponse.json({ success: patchRes.ok });
    }

    // 6. TOGGLE VERIFIED
    if (action === 'toggle_verified') {
      if (!eventId) {
        return NextResponse.json({ success: false, error: 'ID de evento requerido' }, { status: 400 });
      }

      const patchRes = await fetch(`${supabaseUrl}/rest/v1/events?id=eq.${eventId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ verified: Boolean(body.verified) }),
      });

      return NextResponse.json({ success: patchRes.ok });
    }

    // 7. DELETE EVENT
    if (action === 'delete_event') {
      if (!eventId) {
        return NextResponse.json({ success: false, error: 'ID de evento requerido' }, { status: 400 });
      }

      const delRes = await fetch(`${supabaseUrl}/rest/v1/events?id=eq.${eventId}`, {
        method: 'DELETE',
        headers,
      });

      return NextResponse.json({ success: delRes.ok, message: 'Evento eliminado definitivamente.' });
    }

    // 8. DELETE SUBMISSION
    if (action === 'delete_submission') {
      if (!submissionId) {
        return NextResponse.json({ success: false, error: 'ID de envío requerido' }, { status: 400 });
      }

      const delRes = await fetch(`${supabaseUrl}/rest/v1/submitted_events?id=eq.${submissionId}`, {
        method: 'DELETE',
        headers,
      });

      return NextResponse.json({ success: delRes.ok, message: 'Envío eliminado definitivamente.' });
    }

    return NextResponse.json({ success: false, error: 'Acción no reconocida' }, { status: 400 });
  } catch (error) {
    console.error('Error in admin POST:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
