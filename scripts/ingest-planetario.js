// ─────────────────────────────────────────────
// AntiFOMO — Ingestion Script for Planetario Medellín
// Fetches all 26 verified events from Planetario API and syncs with Supabase & local data
// ─────────────────────────────────────────────

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://hiadblaoxgfbfceiwqbo.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpYWRibGFveGdmYmZjZWl3cWJvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Njk4NTk5MywiZXhwIjoyMTAyNTYxOTkzfQ.NfXTOjdPQm8lCTPpYej-ILf5yX8FatHNDiQvMODYLKI';

function slugify(text) {
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

function cleanHtmlText(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&oacute;/g, 'ó')
    .replace(/&aacute;/g, 'á')
    .replace(/&eacute;/g, 'é')
    .replace(/&iacute;/g, 'í')
    .replace(/&uacute;/g, 'ú')
    .replace(/&ntilde;/g, 'ñ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseHour(hourStr) {
  if (!hourStr) return '19:00';
  const clean = hourStr.replace(/&nbsp;/g, ' ').trim().toLowerCase();
  if (clean.includes('12 m') || clean === '12:00 m') return '12:00';
  const m = clean.match(/(\d{1,2})(?::(\d{2}))?\s*([ap]\.?\s*m\.?)?/);
  if (!m) return '19:00';
  let h = parseInt(m[1], 10);
  const min = m[2] || '00';
  const isPm = m[3] ? m[3].includes('p') : (h >= 1 && h <= 6);
  if (isPm && h < 12) h += 12;
  if (!isPm && m[3] && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${min}`;
}

function inferCategory(title, content) {
  const t = title.toLowerCase();
  const c = content.toLowerCase();
  const all = `${t} ${c}`;

  if (/lectura|libro|literatura|cuento|poes[ií]a|lovecraft|velia vidal/i.test(t)) return 'literatura';
  if (/m[uú]sica|vinilo|vinilada|marimba|sonora|concierto|cantado|tot[oó]/i.test(t)) return 'música';
  if (/taller|curso|aprende|laboratorio|bordando/i.test(t)) return 'talleres';
  if (/python|software|tecnolog[ií]a|inteligencia/i.test(t)) return 'tecnología';
  if (/juegos de mesa|comunidad|adultos|bar de historias/i.test(t)) return 'comunidad';
  if (/astronom[ií]a|telescopio|planetas|luna|eclipse|estelar|galaxia|cosmolog[ií]a/i.test(all)) return 'ciencia';

  return 'ciencia';
}

function extractAiSummary(title, content) {
  const clean = cleanHtmlText(content)
    .replace(/Puedes conocerla:[\s\S]*/gi, '')
    .replace(/Suscribi[eé]ndote a[\s\S]*/gi, '')
    .replace(/Uni[eé]ndote a nuestro canal[\s\S]*/gi, '')
    .replace(/Para mayor informaci[oó]n[\s\S]*/gi, '')
    .replace(/T[eé]rminos y condiciones[\s\S]*/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  const sentences = clean.split(/(?<=[.?!])\s+/);
  let summary = '';

  for (const s of sentences) {
    const cand = summary ? `${summary} ${s}` : s;
    if (cand.length <= 280) {
      summary = cand;
    } else {
      break;
    }
  }

  if (summary.length < 40 && clean.length > 0) {
    summary = clean.slice(0, 270);
    const lastSpace = summary.lastIndexOf(' ');
    summary = (lastSpace > 40 ? summary.slice(0, lastSpace) : summary) + '...';
  }

  return summary.slice(0, 300);
}

async function ingestAllPlanetario() {
  console.log('🚀 Fetching all 26 events from Planetario Medellín API...');
  const res = await fetch('https://www.planetariomedellin.org/api/programate', {
    headers: { 'User-Agent': 'Mozilla/5.0' },
  });

  if (!res.ok) {
    throw new Error(`HTTP error: ${res.status}`);
  }

  const json = await res.json();
  const objects = json.objects || [];
  console.log(`Found ${objects.length} events from Planetario.`);

  const transformedEvents = [];

  for (const obj of objects) {
    const meta = obj.metadata || {};
    const title = obj.title.trim();
    const slug = `${slugify(title)}-planetario-${(meta.date || '20260818').replace(/-/g, '')}`;
    const category = inferCategory(title, obj.content || '');
    const shortDesc = extractAiSummary(title, obj.content || '');
    const cleanFullDesc = cleanHtmlText(obj.content || shortDesc);
    const startDate = meta.date || '2026-08-18';
    const startTime = parseHour(meta.hour);

    const isFree = !meta.price || meta.price === 'Sin costo' || meta.price === 0;
    const priceType = isFree ? 'free' : 'paid';
    const priceMin = isFree ? 0 : parseInt(String(meta.price).replace(/\D/g, ''), 10) || 0;

    let venue = 'Planetario de Medellín';
    if (meta.location && Array.isArray(meta.location) && meta.location[0]) {
      const loc = meta.location[0];
      venue = loc.toLowerCase().includes('planetario') ? 'Planetario de Medellín' : `${loc} (Planetario)`;
    }

    const imageUrl = obj.thumbnail || undefined;
    const sourceUrl = `https://www.planetariomedellin.org/programate/${obj.slug}`;

    const isGem = /vinilada|love craft|totó|marimba|eclipse|vagina/i.test(title);

    transformedEvents.push({
      slug,
      title,
      short_description: shortDesc,
      long_description: cleanFullDesc,
      start_date: startDate,
      start_time: `${startTime}:00`,
      venue,
      neighborhood: 'Aranjuez / Parque Explora',
      city: 'Medellín',
      category,
      price_type: priceType,
      price_min: priceMin,
      price_max: priceMin,
      currency: 'COP',
      organizer: 'Planetario de Medellín',
      image_url: imageUrl,
      sources: [{ type: 'web', name: 'Planetario de Medellín', url: sourceUrl }],
      source_count: 1,
      verified: true,
      is_gem: isGem,
      is_newly_found: false,
      detected_at: new Date().toISOString(),
      last_checked_at: new Date().toISOString(),
      tags: [category, 'Planetario', isFree ? 'Gratis' : 'Con Boleta', 'Medellín'],
      score: isGem ? 95 : 88,
      status: 'published',
    });
  }

  console.log(`Transformed ${transformedEvents.length} events ready for Supabase.`);

  // Upsert to Supabase
  console.log('Pushing to Supabase events table...');
  const sbRes = await fetch(`${SUPABASE_URL}/rest/v1/events?on_conflict=slug`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'resolution=merge-duplicates,return=representation',
    },
    body: JSON.stringify(transformedEvents),
  });

  if (sbRes.ok) {
    const inserted = await sbRes.json();
    console.log(`✅ Successfully synced ${inserted.length} Planetario events to Supabase!`);
  } else {
    const err = await sbRes.text();
    console.error('Supabase upsert error:', err);
  }

  // Update src/data/events.ts
  const eventsPath = './src/data/events.ts';
  let fileContent = fs.readFileSync(eventsPath, 'utf8');
  const demoEventsMatch = fileContent.match(/export const DEMO_EVENTS: AntiFOMOEvent\[\] = (\[[\s\S]*?\]);/);
  if (demoEventsMatch) {
    const existingList = JSON.parse(demoEventsMatch[1]);
    const antiEvents = transformedEvents.map(e => ({
      id: e.slug,
      slug: e.slug,
      title: e.title,
      shortDescription: e.short_description,
      longDescription: e.long_description,
      startDate: e.start_date,
      startTime: e.start_time.slice(0, 5),
      venue: e.venue,
      neighborhood: e.neighborhood,
      city: e.city,
      category: e.category,
      priceType: e.price_type,
      priceMin: e.price_min,
      currency: e.currency,
      organizer: e.organizer,
      sources: e.sources,
      sourceCount: 1,
      verified: true,
      isGem: e.is_gem,
      isNewlyFound: false,
      status: 'published',
      score: e.score,
      tags: e.tags,
      detectedAt: e.detected_at,
      lastCheckedAt: e.last_checked_at,
    }));

    const newSlugs = new Set(antiEvents.map(e => e.slug));
    const filtered = existingList.filter(e => !newSlugs.has(e.slug));
    const merged = [...antiEvents, ...filtered];
    
    const newFileContent = `import { AntiFOMOEvent } from '@/lib/types';\n\nexport const DEMO_EVENTS: AntiFOMOEvent[] = ${JSON.stringify(merged, null, 2)};\n`;
    fs.writeFileSync(eventsPath, newFileContent, 'utf8');
    console.log(`🎉 Updated src/data/events.ts with ${merged.length} events total.`);
  }
}

ingestAllPlanetario();
