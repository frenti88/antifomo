const fs = require('fs');
const https = require('https');

const supabaseUrl = 'https://hiadblaoxgfbfceiwqbo.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpYWRibGFveGdmYmZjZWl3cWJvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Njk4NTk5MywiZXhwIjoyMTAyNTYxOTkzfQ.NfXTOjdPQm8lCTPpYej-ILf5yX8FatHNDiQvMODYLKI';

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

const newItems = [
  {
    id: 'mt-fiesta-vinilo-sandiego',
    slug: 'mt-fiesta-de-vinilo-centro-comercial-sandiego',
    title: 'Fiesta de Vinilo: Venta, DJs y Sonidos Análogos',
    shortDescription: 'Tres días en la Zona Gastrobar La T de Sandiego con venta de vinilos, selectores en vivo y rock, salsa, funk y disco.',
    longDescription: 'Durante tres días en la Zona Gastrobar La T del Centro Comercial Sandiego, disfruta de venta de vinilos, DJs en vivo y una programación sonora diversa, con ritmos que van desde el rock en español, baladas y salsa hasta latin funk, cumbia y disco.',
    startDate: '2026-08-30',
    startTime: '14:00',
    venue: 'Centro Comercial Sandiego (Zona Gastrobar La T)',
    neighborhood: 'El Poblado',
    city: 'Medellín',
    latitude: 6.2307,
    longitude: -75.5701,
    category: 'música',
    priceType: 'free',
    priceMin: 0,
    priceMax: 0,
    currency: 'COP',
    organizer: 'Centro Comercial Sandiego',
    sources: [{ type: 'web', label: 'Medellín Travel', url: 'https://www.medellin.travel/calendario-de-eventos-busqueda/' }],
    sourceCount: 1,
    verified: true,
    isGem: true,
    isNewlyFound: true,
    detectedAt: '2026-08-17T16:15:00-05:00',
    lastCheckedAt: '2026-08-17T16:15:00-05:00',
    tags: ['música', 'vinilos', 'el poblado', 'gratis'],
    score: 92
  },
  {
    id: 'mt-zarzuela-los-gavilanes',
    slug: 'mt-zarzuela-los-gavilanes-fundacion-prolirica',
    title: 'Zarzuela Los Gavilanes: Temporada Prolírica 2026',
    shortDescription: 'La magia de la zarzuela regresa al escenario con Los Gavilanes, una de las obras más emblemáticas de Jacinto Guerrero.',
    longDescription: 'La magia de la zarzuela regresa al escenario con Los Gavilanes, una de las obras más emblemáticas y queridas del repertorio lírico español, presentada por la Fundación Prolírica de Antioquia con solistas invitados, coro y orquesta en vivo.',
    startDate: '2026-09-04',
    startTime: '20:00',
    venue: 'Teatro Metropolitano José Gutiérrez Gómez',
    neighborhood: 'Centro',
    city: 'Medellín',
    latitude: 6.2415,
    longitude: -75.5786,
    category: 'teatro',
    priceType: 'paid',
    priceMin: 45000,
    priceMax: 120000,
    currency: 'COP',
    organizer: 'Fundación Prolírica de Antioquia',
    sources: [{ type: 'web', label: 'Medellín Travel', url: 'https://www.medellin.travel/calendario-de-eventos-busqueda/' }],
    sourceCount: 1,
    verified: true,
    isGem: true,
    isNewlyFound: true,
    detectedAt: '2026-08-17T16:15:00-05:00',
    lastCheckedAt: '2026-08-17T16:15:00-05:00',
    tags: ['teatro', 'ópera', 'zarzuela', 'centro'],
    score: 94
  },
  {
    id: 'mt-el-palacio-del-pecado-juan-davila',
    slug: 'mt-el-palacio-del-pecado-juan-davila-pablo-tobon',
    title: 'El Palacio del Pecado: Juan Dávila en Medellín',
    shortDescription: 'Juan Dávila, el fenómeno de la comedia y la improvisación sin filtros, llega al Teatro Pablo Tobón Uribe.',
    longDescription: 'Juan Dávila, el fenómeno de la comedia que ha revolucionado la escena internacional con «La Capital del Pecado», llega al Teatro Pablo Tobón Uribe para presentar una noche cargada de risas, interacción directa y el humor más audaz.',
    startDate: '2026-08-23',
    startTime: '20:00',
    venue: 'Teatro Pablo Tobón Uribe',
    neighborhood: 'Centro',
    city: 'Medellín',
    latitude: 6.2494,
    longitude: -75.5606,
    category: 'comedia',
    priceType: 'paid',
    priceMin: 80000,
    priceMax: 190000,
    currency: 'COP',
    organizer: 'Teatro Pablo Tobón Uribe',
    sources: [{ type: 'web', label: 'Medellín Travel', url: 'https://www.medellin.travel/calendario-de-eventos-busqueda/' }],
    sourceCount: 1,
    verified: true,
    isGem: false,
    isNewlyFound: true,
    detectedAt: '2026-08-17T16:15:00-05:00',
    lastCheckedAt: '2026-08-17T16:15:00-05:00',
    tags: ['comedia', 'stand up', 'centro'],
    score: 89
  },
  {
    id: 'mt-operas-cavalleria-rusticana-pagliacci',
    slug: 'mt-operas-cavalleria-rusticana-pagliacci-teatro-metropolitano',
    title: 'Óperas: Cavalleria Rusticana & Pagliacci',
    shortDescription: 'Doble función operática del verismo italiano con orquesta, coro y puesta en escena monumental.',
    longDescription: 'El Teatro Metropolitano y la Fundación Prolírica presentan la emblemática doble función del verismo italiano: Cavalleria Rusticana de Pietro Mascagni y Pagliacci de Ruggero Leoncavallo, con un elenco de primer nivel y orquesta sinfónica en vivo.',
    startDate: '2026-11-18',
    startTime: '19:30',
    venue: 'Teatro Metropolitano José Gutiérrez Gómez',
    neighborhood: 'Centro',
    city: 'Medellín',
    latitude: 6.2415,
    longitude: -75.5786,
    category: 'teatro',
    priceType: 'paid',
    priceMin: 60000,
    priceMax: 180000,
    currency: 'COP',
    organizer: 'Fundación Prolírica de Antioquia',
    sources: [{ type: 'web', label: 'Medellín Travel', url: 'https://www.medellin.travel/caleventos/operas-cavalleria-rusticana-pagliacci/' }],
    sourceCount: 1,
    verified: true,
    isGem: true,
    isNewlyFound: true,
    detectedAt: '2026-08-17T16:15:00-05:00',
    lastCheckedAt: '2026-08-17T16:15:00-05:00',
    tags: ['ópera', 'teatro', 'centro', 'música clásica'],
    score: 95
  },
  {
    id: 'mt-core-medellin-tomorrowland',
    slug: 'mt-core-medellin-tomorrowland-jardin-botanico',
    title: 'CORE Medellín by Tomorrowland: Edición 2026',
    shortDescription: 'El legendario escenario CORE de Tomorrowland regresa a Medellín con su experiencia audiovisual inmersiva en medio de la naturaleza.',
    longDescription: 'Tomorrowland presenta una nueva edición de CORE Medellín, trayendo su icónico escenario botánico y una curaduría de música electrónica de vanguardia (house, melodic techno e indie dance) al Jardín Botánico de Medellín.',
    startDate: '2026-11-20',
    startTime: '16:00',
    venue: 'Jardín Botánico de Medellín',
    neighborhood: 'Aranjuez',
    city: 'Medellín',
    latitude: 6.2704,
    longitude: -75.5645,
    category: 'fiesta',
    priceType: 'paid',
    priceMin: 180000,
    priceMax: 350000,
    currency: 'COP',
    organizer: 'Tomorrowland / Breakfast Club',
    sources: [{ type: 'web', label: 'Medellín Travel', url: 'https://www.medellin.travel/conciertos/core-medellin-tomorrowland/' }],
    sourceCount: 1,
    verified: true,
    isGem: true,
    isNewlyFound: true,
    detectedAt: '2026-08-17T16:15:00-05:00',
    lastCheckedAt: '2026-08-17T16:15:00-05:00',
    tags: ['electrónica', 'tomorrowland', 'fiesta', 'aranjuez'],
    score: 97
  }
];

async function main() {
  const eventsTs = fs.readFileSync('src/data/events.ts', 'utf8');
  const tempFile = 'scripts/temp_events_mt2.js';
  const cleanCode = eventsTs
    .replace(/import\s+.*?;/g, '')
    .replace(/export const DEMO_EVENTS: AntiFOMOEvent\[\] =/g, 'const DEMO_EVENTS =')
    + '\nmodule.exports = DEMO_EVENTS;';
  fs.writeFileSync(tempFile, cleanCode);
  const existingEvents = require('./temp_events_mt2.js');
  fs.unlinkSync(tempFile);

  const existingSlugs = new Set(existingEvents.map(e => e.slug));
  const toAdd = newItems.filter(e => !existingSlugs.has(e.slug));

  console.log(`Adding ${toAdd.length} high-profile upcoming events from Medellín Travel...`);

  if (toAdd.length > 0) {
    const rows = toAdd.map(e => ({
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

    await postgrestRequest('events?on_conflict=slug', 'POST', rows);
    console.log('✅ Upserted to Supabase!');

    const allCombined = [...existingEvents, ...toAdd];
    const newEventsTsContent = `import type { AntiFOMOEvent } from '@/lib/types';

export const DEMO_EVENTS: AntiFOMOEvent[] = ${JSON.stringify(allCombined, null, 2)};
`;
    fs.writeFileSync('src/data/events.ts', newEventsTsContent);
    console.log(`🎉 Total events in codebase is now ${allCombined.length}!`);
  }
}

main().catch(console.error);
