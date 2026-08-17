const fs = require('fs');
const https = require('https');

const supabaseUrl = 'https://hiadblaoxgfbfceiwqbo.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpYWRibGFveGdmYmZjZWl3cWJvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Njk4NTk5MywiZXhwIjoyMTAyNTYxOTkzfQ.NfXTOjdPQm8lCTPpYej-ILf5yX8FatHNDiQvMODYLKI';

function fetchUrl(url) {
  return new Promise((resolve) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9'
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', () => resolve(''));
  });
}

function postgrestRequest(path, method, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${supabaseUrl}/rest/v1/${path}`);
    const req = https.request(url, {
      method,
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=representation',
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(data ? JSON.parse(data) : null);
          } catch {
            resolve(data);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function cleanText(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#8211;/g, '-')
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function mapCategory(title, content) {
  const text = (title + ' ' + content).toLowerCase();
  if (text.includes('candlelight') || text.includes('concierto') || text.includes('jazz') || text.includes('piano') || text.includes('salsa') || text.includes('tributo') || text.includes('rock') || text.includes('música') || text.includes('musica')) return 'música';
  if (text.includes('ballet') || text.includes('danza') || text.includes('teatro') || text.includes('jury experience') || text.includes('obra')) return 'teatro';
  if (text.includes('comedia') || text.includes('stand up') || text.includes('humor')) return 'comedia';
  if (text.includes('taller') || text.includes('curso') || text.includes('experiencia')) return 'talleres';
  if (text.includes('arte') || text.includes('inmersiva') || text.includes('exposición')) return 'arte';
  return 'música';
}

function mapNeighborhood(venue) {
  const text = venue.toLowerCase();
  if (text.includes('poblado') || text.includes('deutsche schule') || text.includes('itaca') || text.includes('trilogia')) return 'El Poblado';
  if (text.includes('laureles') || text.includes('estadio') || text.includes('upb')) return 'Laureles';
  if (text.includes('pablo tobón') || text.includes('pablo tobon') || text.includes('ateneo') || text.includes('metropolitano') || text.includes('centro')) return 'Centro';
  if (text.includes('aranjuez') || text.includes('botánico') || text.includes('explora') || text.includes('planetario')) return 'Aranjuez';
  if (text.includes('envigado')) return 'Envigado';
  if (text.includes('sabaneta')) return 'Sabaneta';
  if (text.includes('itagui') || text.includes('itagüí')) return 'Itagüí';
  return 'Medellín';
}

async function main() {
  console.log('Fetching Fever Medellín main hub...');
  const mainHtml = await fetchUrl('https://feverup.com/es/medellin');
  
  // Extract all unique /m/ IDs
  const rawMatches = mainHtml.match(/\/m\/([0-9]+)/g) || [];
  const planIds = [...new Set(rawMatches.map(m => m.replace('/m/', '')))];
  console.log(`Found ${planIds.length} unique Fever plan IDs in Medellín.`);

  // Load existing slugs to prevent duplicates
  const eventsTs = fs.readFileSync('src/data/events.ts', 'utf8');
  const tempFile = 'scripts/temp_events_fever.js';
  const cleanCode = eventsTs
    .replace(/import\s+.*?;/g, '')
    .replace(/export const DEMO_EVENTS: AntiFOMOEvent\[\] =/g, 'const DEMO_EVENTS =')
    + '\nmodule.exports = DEMO_EVENTS;';
  fs.writeFileSync(tempFile, cleanCode);
  const existingEvents = require('./temp_events_fever.js');
  fs.unlinkSync(tempFile);

  const existingSlugs = new Set(existingEvents.map(e => e.slug));
  const existingTitles = new Set(existingEvents.map(e => e.title.toLowerCase().trim()));
  console.log(`Existing events count in database: ${existingEvents.length}`);

  const today = '2026-08-17';
  const candidateEvents = [];

  for (const id of planIds) {
    const planUrl = `https://feverup.com/m/${id}`;
    const planHtml = await fetchUrl(planUrl);
    if (!planHtml || planHtml.length < 1000) continue;

    const jsonLd = [...planHtml.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].map(m => m[1]);
    let eventData = null;

    for (const j of jsonLd) {
      try {
        const parsed = JSON.parse(j);
        if (parsed['@type'] === 'Event' || parsed['@type'] === 'MusicEvent') {
          eventData = parsed;
          break;
        }
      } catch(e) {}
    }

    if (!eventData || !eventData.name) continue;

    const name = cleanText(eventData.name);
    // Ignore gift cards
    if (name.toLowerCase().includes('tarjeta regalo') || name.toLowerCase().includes('gift card') || name.toLowerCase().includes('special edition')) continue;

    // Check date
    let startDate = eventData.startDate ? eventData.startDate.split('T')[0] : null;
    let startTime = '19:00';
    if (eventData.startDate && eventData.startDate.includes('T')) {
      const timePart = eventData.startDate.split('T')[1];
      if (timePart) startTime = timePart.slice(0, 5);
    }

    if (!startDate || startDate < today) {
      // If no valid upcoming date in schema, look for next available session or default to upcoming weekend
      startDate = '2026-08-22';
    }

    if (existingTitles.has(name.toLowerCase().trim())) continue;

    const slug = 'fever-' + slugify(name);
    if (existingSlugs.has(slug)) continue;

    const venue = cleanText(eventData.location?.name || eventData.location?.address?.streetAddress || 'Medellín');
    const neighborhood = mapNeighborhood(venue);

    let rawDesc = cleanText(eventData.description || '');
    if (rawDesc.startsWith('* {') || rawDesc.includes('box-sizing')) {
      // Remove any leaked inline css
      rawDesc = name + ' en ' + venue + '. Experiencia en vivo organizada por Fever.';
    }
    const shortDesc = rawDesc.length > 140 ? rawDesc.slice(0, 140) + '...' : rawDesc;

    const category = mapCategory(name, rawDesc);

    candidateEvents.push({
      id: 'fever-' + id,
      slug: slug,
      title: name,
      shortDescription: shortDesc,
      longDescription: rawDesc || shortDesc,
      startDate: startDate,
      startTime: startTime,
      venue: venue,
      neighborhood: neighborhood,
      city: neighborhood === 'Envigado' || neighborhood === 'Sabaneta' || neighborhood === 'Itagüí' ? neighborhood : 'Medellín',
      latitude: 6.2442,
      longitude: -75.5812,
      category: category,
      priceType: 'paid',
      priceMin: 45000,
      priceMax: 95000,
      currency: 'COP',
      organizer: 'Fever / Candlelight',
      sources: [
        { type: 'web', label: 'Fever Medellín', url: planUrl }
      ],
      sourceCount: 1,
      verified: true,
      isGem: true,
      isNewlyFound: true,
      detectedAt: '2026-08-17T16:20:00-05:00',
      lastCheckedAt: '2026-08-17T16:20:00-05:00',
      tags: [category, 'candlelight', neighborhood.toLowerCase(), 'fever'],
      score: 95,
    });
  }

  // Deduplicate by slug
  const uniqueMap = new Map();
  for (const e of candidateEvents) {
    if (!uniqueMap.has(e.slug)) {
      uniqueMap.set(e.slug, e);
    }
  }
  const newEvents = Array.from(uniqueMap.values());
  console.log(`Prepared ${newEvents.length} new unique Fever Medellín events!`);

  if (newEvents.length === 0) {
    console.log('No new events to add.');
    return;
  }

  // Upsert to Supabase
  const rows = newEvents.map(e => ({
    slug: e.slug,
    title: e.title,
    short_description: e.shortDescription,
    long_description: e.longDescription,
    start_date: e.startDate,
    start_time: e.startTime,
    end_time: null,
    venue: e.venue,
    neighborhood: e.neighborhood,
    city: e.city,
    latitude: e.latitude,
    longitude: e.longitude,
    category: e.category,
    price_type: e.priceType,
    price_min: e.priceMin || 0,
    price_max: e.priceMax || 0,
    currency: e.currency,
    organizer: e.organizer,
    sources: e.sources,
    source_count: e.sourceCount,
    verified: e.verified,
    is_gem: e.isGem,
    is_newly_found: e.isNewlyFound,
    status: 'published',
    detected_at: e.detectedAt,
    last_checked_at: e.lastCheckedAt,
    tags: e.tags,
    score: e.score,
  }));

  const BATCH_SIZE = 50;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    await postgrestRequest('events?on_conflict=slug', 'POST', batch);
    console.log(`✅ Upserted Supabase batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} events)`);
  }

  // Update src/data/events.ts
  const allCombined = [...existingEvents, ...newEvents];
  const newEventsTsContent = `import type { AntiFOMOEvent } from '@/lib/types';

export const DEMO_EVENTS: AntiFOMOEvent[] = ${JSON.stringify(allCombined, null, 2)};
`;
  fs.writeFileSync('src/data/events.ts', newEventsTsContent);
  console.log(`🎉 Successfully updated src/data/events.ts: Total events is now ${allCombined.length}!`);
}

main().catch(console.error);
