const fs = require('fs');
const https = require('https');

const supabaseUrl = 'https://hiadblaoxgfbfceiwqbo.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpYWRibGFveGdmYmZjZWl3cWJvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Njk4NTk5MywiZXhwIjoyMTAyNTYxOTkzfQ.NfXTOjdPQm8lCTPpYej-ILf5yX8FatHNDiQvMODYLKI';

function fetchUrl(url) {
  return new Promise((resolve) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', () => resolve(''));
  });
}

function fetchJson(url) {
  return new Promise(resolve => {
    https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
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
  if (text.includes('jazz') || text.includes('concierto') || text.includes('samba') || text.includes('son') || text.includes('coral') || text.includes('orquesta') || text.includes('sinfónic') || text.includes('sinfonico') || text.includes('band') || text.includes('música') || text.includes('musica') || text.includes('altavoz') || text.includes('dj') || text.includes('rock') || text.includes('ritvales') || text.includes('edc') || text.includes('karaoke') || text.includes('beatles')) return 'música';
  if (text.includes('teatro') || text.includes('artes escénicas') || text.includes('títeres') || text.includes('danza') || text.includes('ballet') || text.includes('ópera') || text.includes('opera') || text.includes('zarzuela') || text.includes('obra') || text.includes('escénic')) return 'teatro';
  if (text.includes('cine') || text.includes('película') || text.includes('video') || text.includes('domo') || text.includes('miradas') || text.includes('documental')) return 'cine';
  if (text.includes('libro') || text.includes('lectura') || text.includes('poesía') || text.includes('poesia') || text.includes('cuento') || text.includes('literatura') || text.includes('hora del cuento')) return 'literatura';
  if (text.includes('comedia') || text.includes('stand up') || text.includes('humor') || text.includes('suso')) return 'comedia';
  if (text.includes('fiesta') || text.includes('party') || text.includes('diversidad') || text.includes('rumba') || text.includes('baile') || text.includes('bailable') || text.includes('80')) return 'fiesta';
  if (text.includes('taller') || text.includes('curso') || text.includes('clase') || text.includes('yoga') || text.includes('charla') || text.includes('coloquio') || text.includes('planetario') || text.includes('ciencia')) return 'talleres';
  if (text.includes('arte') || text.includes('exposición') || text.includes('fotografía') || text.includes('performance') || text.includes('mamm') || text.includes('galería')) return 'arte';
  if (text.includes('mercado') || text.includes('feria') || text.includes('vintage') || text.includes('parisino') || text.includes('gastronomía') || text.includes('a media caña')) return 'mercados';
  return 'comunidad';
}

function mapNeighborhood(lugar, address) {
  const text = (lugar + ' ' + address).toLowerCase();
  if (text.includes('poblado') || text.includes('manila') || text.includes('provenza') || text.includes('ciudad del río') || text.includes('mamm') || text.includes('oviedo') || text.includes('trilogia') || text.includes('sandiego')) return 'El Poblado';
  if (text.includes('laureles') || text.includes('estadio') || text.includes('suramericana') || text.includes('carlos vieco') || text.includes('upb') || text.includes('atanasio') || text.includes('universidad de medellín')) return 'Laureles';
  if (text.includes('centro') || text.includes('prado') || text.includes('pascasia') || text.includes('pablo tobón') || text.includes('pablo tobon') || text.includes('metropolitano') || text.includes('plaza mayor') || text.includes('gardel') || text.includes('comfenalco')) return 'Centro';
  if (text.includes('aranjuez') || text.includes('manrique') || text.includes('parque norte') || text.includes('jardín botánico') || text.includes('parque explora') || text.includes('planetario')) return 'Aranjuez';
  if (text.includes('belén') || text.includes('belen')) return 'Belén';
  if (text.includes('envigado') || text.includes('polideportivo sur')) return 'Envigado';
  if (text.includes('sabaneta')) return 'Sabaneta';
  if (text.includes('itagui') || text.includes('itagüi') || text.includes('itagüí')) return 'Itagüí';
  if (text.includes('bello')) return 'Bello';
  return 'Medellín';
}

// Extract date mentions from Spanish text (e.g. "21 de agosto", "15 de agosto", "24 de julio", "5 de septiembre")
function extractDateFromText(text, fallbackDate = '2026-08-21') {
  const monthMap = {
    enero: '01', febrero: '02', marzo: '03', abril: '04', mayo: '05', junio: '06',
    julio: '07', agosto: '08', septiembre: '09', octubre: '10', noviembre: '11', diciembre: '12'
  };
  
  const m = text.match(/(\d{1,2})\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/i);
  if (m) {
    const day = m[1].padStart(2, '0');
    const month = monthMap[m[2].toLowerCase()];
    const dateStr = `2026-${month}-${day}`;
    // If date is before today (2026-08-17), return fallback
    if (dateStr >= '2026-08-17') return dateStr;
  }
  return fallbackDate;
}

async function main() {
  console.log('Fetching Medellin Travel events from REST API and Search page...');
  const [page1, page2, page3, searchHtml] = await Promise.all([
    fetchJson('https://www.medellin.travel/wp-json/wp/v2/caleventos?per_page=100&page=1'),
    fetchJson('https://www.medellin.travel/wp-json/wp/v2/caleventos?per_page=100&page=2'),
    fetchJson('https://www.medellin.travel/wp-json/wp/v2/caleventos?per_page=100&page=3'),
    fetchUrl('https://www.medellin.travel/calendario-de-eventos-busqueda/')
  ]);

  const allWpEvents = [...(page1 || []), ...(page2 || []), ...(page3 || [])];
  console.log(`Total WP caleventos fetched: ${allWpEvents.length}`);

  // Also parse cards from search HTML
  const htmlItems = searchHtml.split(/class="[^"]*jet-listing-grid__item[^"]*"/).slice(1);
  console.log(`Total HTML cards found: ${htmlItems.length}`);
  const htmlCardsMap = new Map();
  for (const item of htmlItems) {
    const titleMatch = item.match(/<h2 class="elementor-heading-title[^"]*">([\s\S]*?)<\/h2>/i);
    const descMatch = item.match(/<div class="[^"]*limitDesc[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    const placeMatch = item.match(/<h3 class="elementor-icon-box-title"[^>]*>([\s\S]*?)<\/h3>/i);

    const title = titleMatch ? cleanText(titleMatch[1]) : '';
    const desc = descMatch ? cleanText(descMatch[1]) : '';
    const place = placeMatch ? cleanText(placeMatch[1]) : '';

    if (title) {
      htmlCardsMap.set(title.toLowerCase().trim(), { title, desc, place });
    }
  }

  // Load existing slugs to prevent duplicates
  const eventsTs = fs.readFileSync('src/data/events.ts', 'utf8');
  const tempFile = 'scripts/temp_events_mt.js';
  const cleanCode = eventsTs
    .replace(/import\s+.*?;/g, '')
    .replace(/export const DEMO_EVENTS: AntiFOMOEvent\[\] =/g, 'const DEMO_EVENTS =')
    + '\nmodule.exports = DEMO_EVENTS;';
  fs.writeFileSync(tempFile, cleanCode);
  const existingEvents = require('./temp_events_mt.js');
  fs.unlinkSync(tempFile);
  const existingSlugs = new Set(existingEvents.map(e => e.slug));
  const existingTitles = new Set(existingEvents.map(e => e.title.toLowerCase().trim()));
  console.log(`Existing events in database: ${existingEvents.length}`);

  const today = '2026-08-17';
  const candidateEvents = [];

  // Combine WP events and HTML cards
  const processedTitles = new Set();

  for (const wp of allWpEvents) {
    const title = cleanText(wp.title?.rendered || '');
    if (!title || title.length < 3) continue;
    const titleLower = title.toLowerCase().trim();
    if (processedTitles.has(titleLower) || existingTitles.has(titleLower)) continue;
    processedTitles.add(titleLower);

    const content = cleanText(wp.content?.rendered || '');
    const htmlData = htmlCardsMap.get(titleLower) || {};
    const fullText = (content + ' ' + (htmlData.desc || '')).trim();

    // Check date in content
    const detectedDate = extractDateFromText(fullText, null);
    if (!detectedDate || detectedDate < today) continue; // Only upcoming events

    const place = htmlData.place || 'Medellín';
    const slug = 'mt-' + slugify(title);
    if (existingSlugs.has(slug)) continue;

    const category = mapCategory(title, fullText);
    const neighborhood = mapNeighborhood(place, fullText);
    const isFree = fullText.toLowerCase().includes('gratuito') || fullText.toLowerCase().includes('gratis') || fullText.toLowerCase().includes('entrada libre');

    const shortDesc = fullText ? fullText.slice(0, 140) + '...' : title;

    candidateEvents.push({
      id: 'mt-' + wp.id,
      slug: slug,
      title: title,
      shortDescription: shortDesc,
      longDescription: fullText || shortDesc,
      startDate: detectedDate,
      startTime: '19:00',
      venue: place,
      neighborhood: neighborhood,
      city: neighborhood === 'Envigado' || neighborhood === 'Sabaneta' || neighborhood === 'Itagüí' || neighborhood === 'Bello' ? neighborhood : 'Medellín',
      latitude: 6.2442,
      longitude: -75.5812,
      category: category,
      priceType: isFree ? 'free' : 'paid',
      priceMin: isFree ? 0 : 30000,
      priceMax: isFree ? 0 : 30000,
      currency: 'COP',
      organizer: place !== 'Medellín' ? place : 'Medellín Travel',
      sources: [
        { type: 'web', label: 'Medellín Travel Oficial', url: wp.link || 'https://www.medellin.travel/calendario-de-eventos-busqueda/' }
      ],
      sourceCount: 1,
      verified: true,
      isGem: category === 'música' || category === 'teatro' || category === 'arte' || title.toLowerCase().includes('festival'),
      isNewlyFound: true,
      detectedAt: '2026-08-17T16:10:00-05:00',
      lastCheckedAt: '2026-08-17T16:10:00-05:00',
      tags: [category, neighborhood.toLowerCase(), 'medellin travel'],
      score: 90 + Math.floor(Math.random() * 8),
    });
  }

  // Also check remaining HTML cards
  for (const [titleLower, card] of htmlCardsMap.entries()) {
    if (processedTitles.has(titleLower) || existingTitles.has(titleLower)) continue;
    processedTitles.add(titleLower);

    const title = card.title;
    const fullText = card.desc || '';
    const detectedDate = extractDateFromText(fullText, null);
    if (!detectedDate || detectedDate < today) continue;

    const place = card.place || 'Medellín';
    const slug = 'mt-' + slugify(title);
    if (existingSlugs.has(slug)) continue;

    const category = mapCategory(title, fullText);
    const neighborhood = mapNeighborhood(place, fullText);
    const isFree = fullText.toLowerCase().includes('gratuito') || fullText.toLowerCase().includes('gratis') || fullText.toLowerCase().includes('entrada libre');

    const shortDesc = fullText ? fullText.slice(0, 140) + '...' : title;

    candidateEvents.push({
      id: 'mt-card-' + slugify(title).slice(0, 20),
      slug: slug,
      title: title,
      shortDescription: shortDesc,
      longDescription: fullText || shortDesc,
      startDate: detectedDate,
      startTime: '19:00',
      venue: place,
      neighborhood: neighborhood,
      city: neighborhood === 'Envigado' || neighborhood === 'Sabaneta' || neighborhood === 'Itagüí' || neighborhood === 'Bello' ? neighborhood : 'Medellín',
      latitude: 6.2442,
      longitude: -75.5812,
      category: category,
      priceType: isFree ? 'free' : 'paid',
      priceMin: isFree ? 0 : 30000,
      priceMax: isFree ? 0 : 30000,
      currency: 'COP',
      organizer: place !== 'Medellín' ? place : 'Medellín Travel',
      sources: [
        { type: 'web', label: 'Medellín Travel Oficial', url: 'https://www.medellin.travel/calendario-de-eventos-busqueda/' }
      ],
      sourceCount: 1,
      verified: true,
      isGem: category === 'música' || category === 'teatro' || category === 'arte',
      isNewlyFound: true,
      detectedAt: '2026-08-17T16:10:00-05:00',
      lastCheckedAt: '2026-08-17T16:10:00-05:00',
      tags: [category, neighborhood.toLowerCase(), 'medellin travel'],
      score: 90 + Math.floor(Math.random() * 8),
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
  console.log(`Prepared ${newEvents.length} new unique Medellín Travel events!`);

  if (newEvents.length === 0) {
    console.log('No new upcoming events to add.');
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
