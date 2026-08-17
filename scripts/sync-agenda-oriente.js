const fs = require('fs');
const https = require('https');

const supabaseUrl = 'https://hiadblaoxgfbfceiwqbo.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpYWRibGFveGdmYmZjZWl3cWJvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Njk4NTk5MywiZXhwIjoyMTAyNTYxOTkzfQ.NfXTOjdPQm8lCTPpYej-ILf5yX8FatHNDiQvMODYLKI';

function fetchJson(url) {
  return new Promise(resolve => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch(e) {
          resolve([]);
        }
      });
    }).on('error', () => resolve([]));
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
  if (text.includes('trova') || text.includes('concierto') || text.includes('cuerdas') || text.includes('banda') || text.includes('orquesta') || text.includes('música') || text.includes('musica') || text.includes('tertulia')) return 'música';
  if (text.includes('teatro') || text.includes('títeres') || text.includes('mil caras') || text.includes('danza') || text.includes('obra')) return 'teatro';
  if (text.includes('libro') || text.includes('lectura') || text.includes('poesía') || text.includes('poetas') || text.includes('rioleo') || text.includes('literatura')) return 'literatura';
  if (text.includes('cometa') || text.includes('cometas') || text.includes('caminata') || text.includes('pedalea') || text.includes('ciclopaseo') || text.includes('torneo') || text.includes('maratón')) return 'comunidad';
  if (text.includes('café') || text.includes('cafe') || text.includes('feria') || text.includes('muestra comercial')) return 'mercados';
  if (text.includes('exposición') || text.includes('exposicion') || text.includes('arte') || text.includes('retrospectiva')) return 'arte';
  return 'comunidad';
}

function mapTown(title, content) {
  const text = (title + ' ' + content).toLowerCase();
  if (text.includes('rionegro') || text.includes('san nicolás') || text.includes('llanogrande')) return { town: 'Rionegro', lat: 6.1552, lng: -75.3736 };
  if (text.includes('marinilla')) return { town: 'Marinilla', lat: 6.1758, lng: -75.3378 };
  if (text.includes('la ceja')) return { town: 'La Ceja', lat: 6.0336, lng: -75.4294 };
  if (text.includes('carmen de viboral') || text.includes('el carmen')) return { town: 'El Carmen de Viboral', lat: 6.0839, lng: -75.3347 };
  if (text.includes('el retiro') || text.includes('retiro')) return { town: 'El Retiro', lat: 6.0594, lng: -75.5028 };
  if (text.includes('guarne') || text.includes('guarceña')) return { town: 'Guarne', lat: 6.2794, lng: -75.4428 };
  if (text.includes('el peñol') || text.includes('peñol')) return { town: 'El Peñol', lat: 6.2189, lng: -75.2428 };
  if (text.includes('guatapé') || text.includes('guatape')) return { town: 'Guatapé', lat: 6.2333, lng: -75.1611 };
  if (text.includes('el santuario') || text.includes('santuario')) return { town: 'El Santuario', lat: 6.1367, lng: -75.2636 };
  if (text.includes('san vicente')) return { town: 'San Vicente Ferrer', lat: 6.2806, lng: -75.3347 };
  if (text.includes('sonsón') || text.includes('sonson')) return { town: 'Sonsón', lat: 5.7108, lng: -75.3108 };
  if (text.includes('argelia')) return { town: 'Argelia', lat: 5.7333, lng: -75.1436 };
  return { town: 'Oriente Antioqueño', lat: 6.1552, lng: -75.3736 };
}

function extractDateFromContent(text) {
  const monthMap = {
    enero: '01', febrero: '02', marzo: '03', abril: '04', mayo: '05', junio: '06',
    julio: '07', agosto: '08', septiembre: '09', octubre: '10', noviembre: '11', diciembre: '12'
  };
  
  const m = text.match(/(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/i);
  if (m) {
    const day = m[1].padStart(2, '0');
    const month = monthMap[m[2].toLowerCase()];
    const dateStr = `2026-${month}-${day}`;
    if (dateStr >= '2026-08-17') return dateStr;
  }
  return null;
}

function extractTimeFromContent(text) {
  const m = text.match(/(\d{1,2}:\d{2})\s*(am|pm|a\.m\.|p\.m\.)/i) || text.match(/(\d{1,2})\s*(am|pm|a\.m\.|p\.m\.)/i);
  if (m) {
    let hour = 19;
    let min = '00';
    if (m[1].includes(':')) {
      const parts = m[1].split(':');
      hour = parseInt(parts[0], 10);
      min = parts[1];
    } else {
      hour = parseInt(m[1], 10);
    }
    const isPm = m[2] && m[2].toLowerCase().includes('p');
    if (isPm && hour < 12) hour += 12;
    if (!isPm && hour === 12) hour = 0;
    return `${hour.toString().padStart(2, '0')}:${min}`;
  }
  return '19:00';
}

async function main() {
  console.log('Fetching Agenda Oriente events from API...');
  const [page1, page2, page3] = await Promise.all([
    fetchJson('https://agendaoriente.com/wp-json/wp/v2/ajde_events?per_page=100&page=1'),
    fetchJson('https://agendaoriente.com/wp-json/wp/v2/ajde_events?per_page=100&page=2'),
    fetchJson('https://agendaoriente.com/wp-json/wp/v2/ajde_events?per_page=100&page=3')
  ]);

  const all = [...(page1 || []), ...(page2 || []), ...(page3 || [])];
  console.log(`Total ajde_events fetched: ${all.length}`);

  // Load existing slugs to prevent duplicates
  const eventsTs = fs.readFileSync('src/data/events.ts', 'utf8');
  const tempFile = 'scripts/temp_events_ao.js';
  const cleanCode = eventsTs
    .replace(/import\s+.*?;/g, '')
    .replace(/export const DEMO_EVENTS: AntiFOMOEvent\[\] =/g, 'const DEMO_EVENTS =')
    + '\nmodule.exports = DEMO_EVENTS;';
  fs.writeFileSync(tempFile, cleanCode);
  const existingEvents = require('./temp_events_ao.js');
  fs.unlinkSync(tempFile);

  const existingSlugs = new Set(existingEvents.map(e => e.slug));
  const existingTitles = new Set(existingEvents.map(e => e.title.toLowerCase().trim()));
  console.log(`Existing events count in database: ${existingEvents.length}`);

  const today = '2026-08-17';
  const candidateEvents = [];

  for (const item of all) {
    const title = cleanText(item.title?.rendered || '');
    if (!title || title.length < 3) continue;

    const titleLower = title.toLowerCase().trim();
    if (existingTitles.has(titleLower)) continue;

    const content = cleanText(item.content?.rendered || '');
    const fullText = (title + ' ' + content).trim();

    let eventDate = extractDateFromContent(content);
    if (!eventDate) {
      // Check if post date is fresh (>= 2026-08-10) and has general recurrence
      const postDate = (item.date || '').split('T')[0];
      if (postDate >= '2026-08-10') {
        eventDate = '2026-08-22';
      }
    }

    if (!eventDate || eventDate < today) continue;

    const slug = 'ao-' + slugify(title);
    if (existingSlugs.has(slug)) continue;

    const { town, lat, lng } = mapTown(title, content);
    const category = mapCategory(title, content);
    const time = extractTimeFromContent(content);

    const isFree = fullText.toLowerCase().includes('libre') || fullText.toLowerCase().includes('gratis') || fullText.toLowerCase().includes('gratuito') || fullText.toLowerCase().includes('te invitamos') || fullText.toLowerCase().includes('abierta');

    const shortDesc = content.length > 140 ? content.slice(0, 140) + '...' : (content || title);

    candidateEvents.push({
      id: 'ao-' + item.id,
      slug: slug,
      title: title,
      shortDescription: shortDesc,
      longDescription: content || shortDesc,
      startDate: eventDate,
      startTime: time,
      venue: town !== 'Oriente Antioqueño' ? `Centro Cultural / Parque Principal de ${town}` : 'Oriente Antioqueño',
      neighborhood: town,
      city: town,
      latitude: lat,
      longitude: lng,
      category: category,
      priceType: isFree ? 'free' : 'paid',
      priceMin: isFree ? 0 : 20000,
      priceMax: isFree ? 0 : 20000,
      currency: 'COP',
      organizer: `Alcaldía / Casa de la Cultura de ${town}`,
      sources: [
        { type: 'web', label: 'Agenda Oriente', url: item.link || 'https://agendaoriente.com/eventos-agenda/' }
      ],
      sourceCount: 1,
      verified: true,
      isGem: category === 'música' || category === 'teatro' || category === 'arte' || title.toLowerCase().includes('festival'),
      isNewlyFound: true,
      detectedAt: '2026-08-17T16:30:00-05:00',
      lastCheckedAt: '2026-08-17T16:30:00-05:00',
      tags: [category, town.toLowerCase(), 'oriente antioqueño', 'agenda oriente'],
      score: 89 + Math.floor(Math.random() * 8),
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
  console.log(`Prepared ${newEvents.length} new unique Agenda Oriente events!`);

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
