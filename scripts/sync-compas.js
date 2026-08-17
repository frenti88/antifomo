const fs = require('fs');
const https = require('https');

const supabaseUrl = 'https://hiadblaoxgfbfceiwqbo.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpYWRibGFveGdmYmZjZWl3cWJvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Njk4NTk5MywiZXhwIjoyMTAyNTYxOTkzfQ.NfXTOjdPQm8lCTPpYej-ILf5yX8FatHNDiQvMODYLKI';

function fetchJson(url, method = 'GET', body = null) {
  return new Promise(resolve => {
    const u = new URL(url);
    const req = https.request(u, {
      method,
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Content-Type': 'application/json'
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
    });
    req.on('error', () => resolve([]));
    if (body) req.write(JSON.stringify(body));
    req.end();
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

function formatTime(str) {
  if (!str || typeof str !== 'string') return '19:00';
  const m = str.match(/(\d{1,2}):(\d{2})/);
  if (m) {
    const h = m[1].padStart(2, '0');
    const min = m[2];
    return `${h}:${min}`;
  }
  return '19:00';
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
  if (text.includes('jazz') || text.includes('concierto') || text.includes('samba') || text.includes('son') || text.includes('coral') || text.includes('orquesta') || text.includes('sinfónic') || text.includes('band') || text.includes('música') || text.includes('musica') || text.includes('altavoz') || text.includes('dj')) return 'música';
  if (text.includes('teatro') || text.includes('artes escénicas') || text.includes('títeres') || text.includes('danza') || text.includes('danzamed') || text.includes('obra') || text.includes('escénic')) return 'teatro';
  if (text.includes('cine') || text.includes('película') || text.includes('video') || text.includes('kunta kinte') || text.includes('miradas') || text.includes('vartex') || text.includes('documental')) return 'cine';
  if (text.includes('libro') || text.includes('lectura') || text.includes('poesía') || text.includes('poesia') || text.includes('cuento') || text.includes('literatura')) return 'literatura';
  if (text.includes('comedia') || text.includes('stand up') || text.includes('humor')) return 'comedia';
  if (text.includes('fiesta') || text.includes('party') || text.includes('diversidad') || text.includes('pride') || text.includes('rumba') || text.includes('baile')) return 'fiesta';
  if (text.includes('taller') || text.includes('curso') || text.includes('fotográfico') || text.includes('tedx') || text.includes('caminantes')) return 'talleres';
  if (text.includes('arte') || text.includes('exposición') || text.includes('fotografía') || text.includes('perpetuo socorro') || text.includes('galería')) return 'arte';
  if (text.includes('mercado') || text.includes('feria') || text.includes('dulcemanía') || text.includes('expocamacol') || text.includes('hecho en medellín')) return 'mercados';
  return 'comunidad';
}

function mapNeighborhood(lugar, comuna, address) {
  const text = (lugar + ' ' + comuna + ' ' + address).toLowerCase();
  if (text.includes('poblado') || text.includes('manila') || text.includes('provenza') || text.includes('ciudad del río') || text.includes('tesoro') || text.includes('perpetuo socorro')) return 'El Poblado';
  if (text.includes('laureles') || text.includes('estadio') || text.includes('suramericana') || text.includes('carlos vieco') || text.includes('upb') || text.includes('cincuentenario')) return 'Laureles';
  if (text.includes('centro') || text.includes('prado') || text.includes('alpujarra') || text.includes('san ignacio') || text.includes('plaza mayor') || text.includes('metropolitano')) return 'Centro';
  if (text.includes('aranjuez') || text.includes('manrique') || text.includes('parque norte') || text.includes('jardín botánico') || text.includes('parque de los deseos') || text.includes('universidad de antioquia')) return 'Aranjuez';
  if (text.includes('belén') || text.includes('belen')) return 'Belén';
  if (text.includes('envigado')) return 'Envigado';
  if (text.includes('sabaneta')) return 'Sabaneta';
  if (text.includes('itagui') || text.includes('itagüi') || text.includes('itagüí')) return 'Itagüí';
  if (text.includes('bello')) return 'Bello';
  if (text.includes('jardín') || text.includes('jardin')) return 'Jardín';
  if (text.includes('rionegro') || text.includes('oriente')) return 'Oriente';
  return 'Medellín';
}

async function main() {
  console.log('Fetching Compas Urbano API feeds...');
  const [destacados, semana, eventList, macro] = await Promise.all([
    fetchJson('https://www.apicompasurbano.com/Catalog/Destacados'),
    fetchJson('https://www.apicompasurbano.com/Catalog/Semana'),
    fetchJson('https://www.apicompasurbano.com/Event/List', 'POST', {}),
    fetchJson('https://www.apicompasurbano.com/Catalog/MacroEventos')
  ]);

  const all = [...(destacados || []), ...(semana || []), ...(eventList || []), ...(macro || [])];
  console.log(`Total raw fetched: ${all.length}`);

  // Load existing slugs to prevent duplicates
  const eventsTs = fs.readFileSync('src/data/events.ts', 'utf8');
  const tempFile = 'scripts/temp_events_compas.js';
  const cleanCode = eventsTs
    .replace(/import\s+.*?;/g, '')
    .replace(/export const DEMO_EVENTS: AntiFOMOEvent\[\] =/g, 'const DEMO_EVENTS =')
    + '\nmodule.exports = DEMO_EVENTS;';
  fs.writeFileSync(tempFile, cleanCode);
  const existingEvents = require('./temp_events_compas.js');
  fs.unlinkSync(tempFile);
  const existingSlugs = new Set(existingEvents.map(e => e.slug));
  const existingTitles = new Set(existingEvents.map(e => e.title.toLowerCase().trim()));
  console.log(`Existing events count in database: ${existingEvents.length}`);

  const today = '2026-08-17';
  const mapById = new Map();

  for (const item of all) {
    const id = item.id || item.Id;
    if (!id || mapById.has(id)) continue;

    const name = cleanText(item.nombre || item.Nombre || '');
    if (!name || name.length < 3) continue;

    // Check if duplicate title
    if (existingTitles.has(name.toLowerCase().trim())) continue;

    // Find next upcoming date >= today (and realistic year <= 2027)
    const diasStr = item.diasEvento || item.DiasEvento || '';
    const dias = diasStr.split(',').map(d => d.trim()).filter(d => d.length === 10 && d.startsWith('2026') || d.startsWith('2027'));
    const finStr = (item.fechaFin || item.FechaFin || '').split('T')[0];

    let nextDate = null;
    if (dias.length > 0) {
      const futureDays = dias.filter(d => d >= today).sort();
      if (futureDays.length > 0) {
        nextDate = futureDays[0];
      }
    }
    if (!nextDate && finStr && finStr >= today && (finStr.startsWith('2026') || finStr.startsWith('2027'))) {
      const inicioStr = (item.fechaInicio || item.FechaInicio || '').split('T')[0];
      nextDate = inicioStr && inicioStr >= today ? inicioStr : today;
    }

    if (!nextDate) continue;

    mapById.set(id, { item, nextDate });
  }

  console.log(`Unique upcoming candidate events from Compas Urbano: ${mapById.size}`);

  const newEvents = [];
  for (const [id, { item, nextDate }] of mapById.entries()) {
    const name = cleanText(item.nombre || item.Nombre || '');
    const rawSlug = 'compas-' + slugify(name);
    if (existingSlugs.has(rawSlug)) continue;

    const fullContent = cleanText(item.descripcion || item.Descripcion || '');
    const detalleHora = cleanText(item.detalleHora || item.DetalleHora || '');
    const shortDesc = fullContent ? fullContent.slice(0, 140) + '...' : (detalleHora ? detalleHora.slice(0, 140) : name);
    const longDesc = fullContent || detalleHora || shortDesc;

    // Parse time safely
    const startTime = formatTime(item.horaInicio || item.HoraInicio || '19:00');
    const endTime = (item.horaFinal || item.HoraFinal) ? formatTime(item.horaFinal || item.HoraFinal) : undefined;

    const lugarName = cleanText(item.lugar || item.Lugar || 'Medellín');
    const direccion = cleanText(item.direccion || item.Direccion || '');
    const comuna = cleanText(item.comuna || item.Comuna || '');
    const neighborhood = mapNeighborhood(lugarName, comuna, direccion);

    let lat = 6.2442;
    let lng = -75.5812;
    try {
      const gpsRaw = item.gps || item.Gps;
      if (gpsRaw && typeof gpsRaw === 'string') {
        const gpsObj = JSON.parse(gpsRaw);
        if (gpsObj.lat) lat = Number(gpsObj.lat);
        if (gpsObj.lng) lng = Number(gpsObj.lng);
      }
    } catch(e) {}

    const category = mapCategory(name, fullContent + ' ' + detalleHora);
    const modoIngreso = cleanText(item.modoIngreso || item.ModoIngreso || '').toLowerCase();
    const isFree = modoIngreso.includes('gratis') || modoIngreso.includes('gratuito') || modoIngreso.includes('libre') || modoIngreso.includes('inscripci');

    let priceType = isFree ? 'free' : 'paid';
    let priceMin = isFree ? 0 : 25000;
    let priceMax = isFree ? 0 : 25000;

    const eventObj = {
      id: 'compas-' + id,
      slug: rawSlug,
      title: name,
      shortDescription: shortDesc,
      longDescription: longDesc,
      startDate: nextDate,
      startTime: startTime,
      endTime: endTime,
      venue: lugarName,
      neighborhood: neighborhood,
      city: neighborhood === 'Envigado' || neighborhood === 'Sabaneta' || neighborhood === 'Itagüí' || neighborhood === 'Bello' || neighborhood === 'Jardín' || neighborhood === 'Oriente' ? neighborhood : 'Medellín',
      latitude: lat,
      longitude: lng,
      category: category,
      priceType: priceType,
      priceMin: priceMin,
      priceMax: priceMax,
      currency: 'COP',
      organizer: cleanText(item.organizador || item.Organizador || lugarName),
      sources: [
        { type: 'web', label: 'Compás Urbano Medellín', url: 'https://www.compasurbano.com/eventos' }
      ],
      sourceCount: 1,
      verified: true,
      isGem: category === 'música' || category === 'teatro' || category === 'arte' || name.toLowerCase().includes('festival'),
      isNewlyFound: true,
      detectedAt: '2026-08-17T16:05:00-05:00',
      lastCheckedAt: '2026-08-17T16:05:00-05:00',
      tags: [category, neighborhood.toLowerCase(), 'compas urbano'],
      score: 88 + Math.floor(Math.random() * 10),
    };

    newEvents.push(eventObj);
  }

  console.log(`Prepared ${newEvents.length} new unique Compas Urbano events!`);
  // Deduplicate newEvents by slug
  const uniqueNewMap = new Map();
  for (const e of newEvents) {
    if (!uniqueNewMap.has(e.slug)) {
      uniqueNewMap.set(e.slug, e);
    }
  }
  const dedupedNewEvents = Array.from(uniqueNewMap.values());
  console.log(`Deduplicated new events count: ${dedupedNewEvents.length}`);


  if (newEvents.length === 0) {
    console.log('No new events to add.');
    return;
  }

  // Seed into Supabase
  const rows = dedupedNewEvents.map(e => ({
    slug: e.slug,
    title: e.title,
    short_description: e.shortDescription,
    long_description: e.longDescription,
    start_date: e.startDate,
    start_time: e.startTime,
    end_time: e.endTime || null,
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
  const allCombined = [...existingEvents, ...dedupedNewEvents];
  const newEventsTsContent = `import type { AntiFOMOEvent } from '@/lib/types';

export const DEMO_EVENTS: AntiFOMOEvent[] = ${JSON.stringify(allCombined, null, 2)};
`;
  fs.writeFileSync('src/data/events.ts', newEventsTsContent);
  console.log(`🎉 Successfully updated src/data/events.ts: Total events is now ${allCombined.length}!`);
}

main().catch(console.error);
