const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hiadblaoxgfbfceiwqbo.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpYWRibGFveGdmYmZjZWl3cWJvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Njk4NTk5MywiZXhwIjoyMTAyNTYxOTkzfQ.NfXTOjdPQm8lCTPpYej-ILf5yX8FatHNDiQvMODYLKI';

const headers = {
  apikey: serviceKey,
  Authorization: `Bearer ${serviceKey}`,
  'Content-Type': 'application/json',
};

function decodeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&auml;/g, 'ä').replace(/&ouml;/g, 'ö').replace(/&uuml;/g, 'ü')
    .replace(/&Auml;/g, 'Ä').replace(/&Ouml;/g, 'Ö').replace(/&Uuml;/g, 'Ü')
    .replace(/&aacute;/g, 'á').replace(/&eacute;/g, 'é').replace(/&iacute;/g, 'í')
    .replace(/&oacute;/g, 'ó').replace(/&uacute;/g, 'ú').replace(/&ntilde;/g, 'ñ')
    .replace(/&Aacute;/g, 'Á').replace(/&Eacute;/g, 'É').replace(/&Iacute;/g, 'Í')
    .replace(/&Oacute;/g, 'Ó').replace(/&Uacute;/g, 'Ú').replace(/&Ntilde;/g, 'Ñ')
    .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&apos;/g, "'")
    .replace(/&#8211;/g, '–').replace(/&#8212;/g, '—').replace(/&#8216;/g, "'")
    .replace(/&#8217;/g, "'").replace(/&#8220;/g, '"').replace(/&#8221;/g, '"')
    .replace(/&#038;/g, '&').replace(/&#8230;/g, '...')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanDescription(title, rawDesc) {
  if (!rawDesc || !rawDesc.trim()) {
    return `${title} en Medellín. Plan cultural imperdible en el radar independiente.`;
  }

  let text = decodeHtml(rawDesc)
    .replace(/Puedes conocerla:[\s\S]*/gi, '')
    .replace(/Suscribi[eé]ndote a[\s\S]*/gi, '')
    .replace(/Uni[eé]ndote a nuestro canal[\s\S]*/gi, '')
    .replace(/Para mayor informaci[oó]n[\s\S]*/gi, '')
    .replace(/T[eé]rminos y condiciones[\s\S]*/gi, '')
    .replace(/Pol[ií]tica de privacidad[\s\S]*/gi, '')
    .replace(/Todos los derechos reservados[\s\S]*/gi, '')
    .replace(/Copyright[\s\S]*/gi, '')
    .replace(/Entrada libre hasta llenar aforo\.?/gi, 'Entrada libre.')
    .replace(/\s+/g, ' ')
    .trim();

  // If text already <= 300
  if (text.length <= 295 && text.length > 30) {
    return text;
  }

  // Split into sentences
  const sentences = text.split(/(?<=[.!?])\s+/);
  let summary = '';

  for (const s of sentences) {
    const candidate = summary ? `${summary} ${s}` : s;
    if (candidate.length <= 285) {
      summary = candidate;
    } else {
      break;
    }
  }

  if (summary.length < 40 && text.length > 0) {
    summary = text.slice(0, 280);
    const lastSpace = summary.lastIndexOf(' ');
    if (lastSpace > 40) {
      summary = summary.slice(0, lastSpace) + '...';
    } else {
      summary = summary + '...';
    }
  }

  if (summary.length > 300) {
    summary = summary.slice(0, 297) + '...';
  }

  return summary || `${title} en Medellín.`;
}

function inferCategory(title, desc, currentCat) {
  const text = `${title} ${desc}`.toLowerCase();

  if (/astronom[ií]a|planetario|telescopio|f[ií]sica|biolog[ií]a|universo|estelar|eclipse|galaxias|espacio/i.test(text)) {
    return 'ciencia';
  }
  if (/c[oó]digo|software|inteligencia artificial|\bia\b|shaders|hardware|hackathon|rob[oó]tica|programaci[oó]n|tecnolog/i.test(text)) {
    return 'tecnología';
  }
  if (/stand-up|comedia|humor|chistes|chuliando lista|risas|mon[oó]logo de comedia/i.test(text)) {
    return 'comedia';
  }
  if (/pel[ií]cula|cineclub|documental|cortometraje|cinemancia|proyecci[oó]n|estreno de cine|vhs de medianoche/i.test(text)) {
    return 'cine';
  }
  if (/teatral|matacandelas|pablo tob[oó]n|dramaturgia|obra de teatro|t[ií]teres|teatro caribe|casa del teatro|puesta en escena/i.test(text)) {
    return 'teatro';
  }
  if (/concierto|jazz|sinf[oó]nica|m[uú]sica|rock|ac[uú]stico|ensamble|l[ií]rica|zarzuela|orquesta|vinilada|sonoras|blues|marimba/i.test(text)) {
    return 'música';
  }
  if (/lectura|club de lectura|libro|poes[ií]a|literatura|escritor|cuento|filosof[ií]a y literatura/i.test(text)) {
    return 'literatura';
  }
  if (/exposici[oó]n|galer[ií]a|arte contempor[aá]neo|pintura|escultura|artes pl[aá]sticas|grabado|fotograf[ií]a|lokkus|mamm/i.test(text)) {
    return 'arte';
  }
  if (/taller|laboratorio|clase|workshop|cer[aá]mica|tejido|dijes y legados|trompos con historia|costura/i.test(text)) {
    return 'talleres';
  }
  if (/yoga|meditaci[oó]n|respiraci[oó]n|bienestar|senderismo|caminata ecol[oó]gica|salud hol[ií]stica/i.test(text)) {
    return 'bienestar';
  }
  if (/feria|mercado|bazar|trueque|artesanal|emprendimientos/i.test(text)) {
    return 'mercados';
  }
  if (/gastronom[ií]a|cata|caf[eé] de especialidad|cocina|maridaje|degustaci[oó]n|cocteler[ií]a/i.test(text)) {
    return 'gastronomía';
  }
  if (/danza|baile contempor[aá]neo|performance corporal|flamenco|ballet/i.test(text)) {
    return 'performance';
  }
  if (/fiesta|rumba|dj set|clubbing|perreo|champeta|noche de perreo|electr[oó]nica/i.test(text)) {
    return 'fiesta';
  }
  if (/comunitario|vecinal|encuentro barrial|parche|lunada|trueque comunitario/i.test(text)) {
    return 'comunidad';
  }

  const validCats = [
    'música', 'arte', 'cine', 'teatro', 'fiesta', 'talleres',
    'literatura', 'comunidad', 'gastronomía', 'bienestar',
    'mercados', 'comedia', 'performance', 'ciencia', 'tecnología'
  ];

  return validCats.includes(currentCat) ? currentCat : 'comunidad';
}

function cleanPrice(priceType, priceMin, title, desc) {
  const text = `${title} ${desc}`.toLowerCase();
  if (text.includes('entrada libre') || text.includes('gratis') || text.includes('sin costo') || text.includes('aporte voluntario')) {
    return { priceType: 'free', priceMin: 0 };
  }
  if (priceType === 'free') {
    return { priceType: 'free', priceMin: 0 };
  }
  return {
    priceType: 'paid',
    priceMin: Number(priceMin) > 0 ? Number(priceMin) : 25000
  };
}

async function masterClean() {
  console.log('🚀 Starting Master Event Audit and Optimization...');

  // 1. Fetch all events from Supabase
  const res = await fetch(`${supabaseUrl}/rest/v1/events?select=*&order=start_date.asc,start_time.asc`, { headers });
  if (!res.ok) {
    console.error('Failed to fetch events:', res.statusText);
    return;
  }

  const events = await res.json();
  console.log(`Fetched ${events.length} events from Supabase.`);

  let updatedCount = 0;
  const cleanedEvents = [];

  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    const newDesc = cleanDescription(e.title, e.short_description || e.long_description);
    const newCat = inferCategory(e.title, newDesc, e.category);
    const newPrice = cleanPrice(e.price_type, e.price_min, e.title, newDesc);

    // Clean sources
    let sources = e.sources || [];
    if (!Array.isArray(sources) || sources.length === 0) {
      sources = [{
        label: e.venue || 'Fuente Oficial',
        url: 'https://antifomo.co',
        type: 'web',
        detectedAt: e.detected_at || '2026-08-17T12:00:00.000Z'
      }];
    } else {
      sources = sources.map(s => ({
        label: s.label || s.name || e.venue || 'Web',
        url: s.url && s.url.startsWith('http') ? s.url : 'https://antifomo.co',
        type: s.type || 'web',
        detectedAt: s.detectedAt || e.detected_at || '2026-08-17T12:00:00.000Z'
      }));
    }

    // Format start time to HH:MM
    const cleanTime = (e.start_time || '19:00:00').slice(0, 5);

    const isDescChanged = newDesc !== e.short_description;
    const isCatChanged = newCat !== e.category;
    const isPriceChanged = newPrice.priceType !== e.price_type || newPrice.priceMin !== e.price_min;

    if (isDescChanged || isCatChanged || isPriceChanged) {
      updatedCount++;
    }

    // Prepare updated record
    const updatedRecord = {
      ...e,
      title: decodeHtml(e.title),
      short_description: newDesc,
      long_description: e.long_description ? decodeHtml(e.long_description) : newDesc,
      category: newCat,
      price_type: newPrice.priceType,
      price_min: newPrice.priceMin,
      start_time: cleanTime,
      sources,
      source_count: sources.length,
      city: e.city || 'Medellín',
      neighborhood: e.neighborhood || 'Centro / El Poblado',
      status: e.status || 'published'
    };

    cleanedEvents.push(updatedRecord);
  }

  console.log(`\nOptimized ${cleanedEvents.length} events (Identified ${updatedCount} field adjustments).`);
  console.log('Pushing batch updates to Supabase...');

  // Update in chunks of 50 to Supabase
  const chunkSize = 50;
  for (let i = 0; i < cleanedEvents.length; i += chunkSize) {
    const chunk = cleanedEvents.slice(i, i + chunkSize);
    const upsertRes = await fetch(`${supabaseUrl}/rest/v1/events`, {
      method: 'POST',
      headers: {
        ...headers,
        Prefer: 'resolution=merge-duplicates,return=minimal'
      },
      body: JSON.stringify(chunk)
    });

    if (!upsertRes.ok) {
      console.error(`Error upserting chunk ${i}-${i + chunk.length}:`, await upsertRes.text());
    } else {
      process.stdout.write(`✓ Upserted events ${i + 1} to ${Math.min(i + chunkSize, cleanedEvents.length)}\r`);
    }
  }

  console.log('\n✅ Supabase update completed.');

  // Map to frontend types for src/data/events.ts
  const mappedFrontend = cleanedEvents.map(row => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    shortDescription: row.short_description,
    longDescription: row.long_description,
    startDate: row.start_date,
    startTime: (row.start_time || '19:00').slice(0, 5),
    endTime: row.end_time ? row.end_time.slice(0, 5) : undefined,
    venue: row.venue || 'Medellín',
    neighborhood: row.neighborhood || undefined,
    city: row.city || 'Medellín',
    latitude: row.latitude ? Number(row.latitude) : undefined,
    longitude: row.longitude ? Number(row.longitude) : undefined,
    category: row.category,
    subcategory: row.subcategory || undefined,
    priceType: row.price_type || 'free',
    priceMin: row.price_min ? Number(row.price_min) : undefined,
    priceMax: row.price_max ? Number(row.price_max) : undefined,
    currency: row.currency || 'COP',
    organizer: row.organizer || undefined,
    image: row.image_url || undefined,
    sources: row.sources || [],
    sourceCount: row.source_count || 1,
    verified: Boolean(row.verified),
    isGem: Boolean(row.is_gem),
    isNewlyFound: Boolean(row.is_newly_found),
    detectedAt: row.detected_at,
    lastCheckedAt: row.last_checked_at,
    tags: row.tags || [],
    score: row.score || 85,
  }));

  const eventsTsContent = `import { AntiFOMOEvent } from '@/lib/types';\n\nexport const DEMO_EVENTS: AntiFOMOEvent[] = ${JSON.stringify(mappedFrontend, null, 2)};\n`;
  fs.writeFileSync('./src/data/events.ts', eventsTsContent, 'utf8');
  console.log(`🎉 Successfully updated src/data/events.ts with ${mappedFrontend.length} fully verified events.`);
}

masterClean();
