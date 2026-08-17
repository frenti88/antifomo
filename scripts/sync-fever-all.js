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

const feverItems = [
  {
    id: 'fever-398059',
    slug: 'fever-candlelight-ed-sheeran-coldplay-teatro-metropolitano',
    title: 'Candlelight: Ed Sheeran & Coldplay a la luz de las velas',
    shortDescription: 'Los grandes éxitos de Ed Sheeran y Coldplay interpretados por un cuarteto de cuerdas en un ambiente iluminado por miles de velas.',
    longDescription: 'Candlelight son los conciertos a la luz de las velas que traen la magia de una experiencia musical multisensorial en vivo a lugares increíbles en Medellín. Disfruta de los éxitos de Ed Sheeran y Coldplay bajo la tenue luz de las velas en el Teatro Metropolitano.',
    startDate: '2026-09-10',
    startTime: '19:00',
    venue: 'Teatro Metropolitano José Gutiérrez Gómez',
    neighborhood: 'Centro',
    city: 'Medellín',
    latitude: 6.2415,
    longitude: -75.5786,
    category: 'música',
    priceType: 'paid',
    priceMin: 90000,
    priceMax: 140000,
    currency: 'COP',
    organizer: 'Candlelight / Fever',
    sources: [{ type: 'web', label: 'Fever Medellín', url: 'https://feverup.com/m/398059' }],
    sourceCount: 1,
    verified: true,
    isGem: true,
    isNewlyFound: true,
    detectedAt: '2026-08-17T16:25:00-05:00',
    lastCheckedAt: '2026-08-17T16:25:00-05:00',
    tags: ['candlelight', 'música', 'centro', 'cuarteto de cuerdas'],
    score: 96
  },
  {
    id: 'fever-660650',
    slug: 'fever-candlelight-disney-canciones-de-amor-teatro-metropolitano',
    title: 'Candlelight: Disney Canciones de Amor',
    shortDescription: 'Las bandas sonoras más emotivas de Disney interpretadas en vivo por ensamble de cuerdas a la luz de las velas.',
    longDescription: 'Revive las canciones más icónicas y mágicas de Disney (El Rey León, La Bella y la Bestia, Aladdín, Frozen, Encanto) en un formato íntimo e iluminado por velas en el Teatro Metropolitano de Medellín.',
    startDate: '2026-09-10',
    startTime: '21:30',
    venue: 'Teatro Metropolitano José Gutiérrez Gómez',
    neighborhood: 'Centro',
    city: 'Medellín',
    latitude: 6.2415,
    longitude: -75.5786,
    category: 'música',
    priceType: 'paid',
    priceMin: 119500,
    priceMax: 160000,
    currency: 'COP',
    organizer: 'Candlelight / Fever',
    sources: [{ type: 'web', label: 'Fever Medellín', url: 'https://feverup.com/m/660650' }],
    sourceCount: 1,
    verified: true,
    isGem: true,
    isNewlyFound: true,
    detectedAt: '2026-08-17T16:25:00-05:00',
    lastCheckedAt: '2026-08-17T16:25:00-05:00',
    tags: ['candlelight', 'disney', 'música', 'centro'],
    score: 96
  },
  {
    id: 'fever-678036',
    slug: 'fever-candlelight-tributo-a-taylor-swift-teatro-panamericana',
    title: 'Candlelight: Tributo a Taylor Swift',
    shortDescription: 'Los grandes himnos de Taylor Swift versionados para cuarteto de cuerdas en un escenario iluminado por velas.',
    longDescription: 'Desde los clásicos de Fearless y 1989 hasta Folklore y Midnights, una experiencia acústica inolvidable para los fans de Taylor Swift a la luz de las velas en el Teatro Panamericana.',
    startDate: '2026-10-10',
    startTime: '18:30',
    venue: 'Teatro Panamericana',
    neighborhood: 'El Poblado',
    city: 'Medellín',
    latitude: 6.2085,
    longitude: -75.5682,
    category: 'música',
    priceType: 'paid',
    priceMin: 79500,
    priceMax: 125000,
    currency: 'COP',
    organizer: 'Candlelight / Fever',
    sources: [{ type: 'web', label: 'Fever Medellín', url: 'https://feverup.com/m/678036' }],
    sourceCount: 1,
    verified: true,
    isGem: true,
    isNewlyFound: true,
    detectedAt: '2026-08-17T16:25:00-05:00',
    lastCheckedAt: '2026-08-17T16:25:00-05:00',
    tags: ['candlelight', 'taylor swift', 'música', 'el poblado'],
    score: 96
  },
  {
    id: 'fever-613990',
    slug: 'fever-candlelight-tributo-a-coldplay-teatro-panamericana',
    title: 'Candlelight: Tributo a Coldplay',
    shortDescription: 'Yellow, Viva la Vida, The Scientist, Fix You y Clocks en un concierto íntimo a la luz de las velas.',
    longDescription: 'Disfruta de las canciones más legendarias de Coldplay interpretadas por un cuarteto de cuerdas en una atmósfera iluminada por miles de velas en el Teatro Panamericana.',
    startDate: '2026-10-10',
    startTime: '21:00',
    venue: 'Teatro Panamericana',
    neighborhood: 'El Poblado',
    city: 'Medellín',
    latitude: 6.2085,
    longitude: -75.5682,
    category: 'música',
    priceType: 'paid',
    priceMin: 79500,
    priceMax: 125000,
    currency: 'COP',
    organizer: 'Candlelight / Fever',
    sources: [{ type: 'web', label: 'Fever Medellín', url: 'https://feverup.com/m/613990' }],
    sourceCount: 1,
    verified: true,
    isGem: true,
    isNewlyFound: true,
    detectedAt: '2026-08-17T16:25:00-05:00',
    lastCheckedAt: '2026-08-17T16:25:00-05:00',
    tags: ['candlelight', 'coldplay', 'música', 'el poblado'],
    score: 96
  },
  {
    id: 'fever-467401',
    slug: 'fever-candlelight-clasicos-del-rock-deutsche-schule',
    title: 'Candlelight: Clásicos del Rock (Queen, Led Zeppelin & Pink Floyd)',
    shortDescription: 'Los grandes himnos del rock clásico en arreglos para cuerdas y piano bajo miles de velas.',
    longDescription: 'Queen, Led Zeppelin, Pink Floyd, Aerosmith, The Beatles y Metallica reinterpretados en un formato clásico inolvidable en el Auditorium Maximum del Colegio Alemán (Deutsche Schule Medellín).',
    startDate: '2026-10-24',
    startTime: '19:00',
    venue: 'Auditorium Maximum (Deutsche Schule Medellín)',
    neighborhood: 'Itagüí',
    city: 'Itagüí',
    latitude: 6.1725,
    longitude: -75.6085,
    category: 'música',
    priceType: 'paid',
    priceMin: 42000,
    priceMax: 90000,
    currency: 'COP',
    organizer: 'Candlelight / Fever',
    sources: [{ type: 'web', label: 'Fever Medellín', url: 'https://feverup.com/m/467401' }],
    sourceCount: 1,
    verified: true,
    isGem: true,
    isNewlyFound: true,
    detectedAt: '2026-08-17T16:25:00-05:00',
    lastCheckedAt: '2026-08-17T16:25:00-05:00',
    tags: ['candlelight', 'rock', 'queen', 'música'],
    score: 96
  },
  {
    id: 'fever-673127',
    slug: 'fever-candlelight-piano-tributo-a-linkin-park-deutsche-schule',
    title: 'Candlelight Piano: Tributo a Linkin Park',
    shortDescription: 'In the End, Numb, Faint, Crawling y Somewhere I Belong al piano solo en una atmósfera a la luz de las velas.',
    longDescription: 'Una emotiva velada de homenaje a Linkin Park y Chester Bennington con las mejores canciones de la banda en arreglos exclusivos para piano solista bajo la tenue luz de las velas.',
    startDate: '2026-11-07',
    startTime: '18:00',
    venue: 'Auditorium Maximum (Deutsche Schule Medellín)',
    neighborhood: 'Itagüí',
    city: 'Itagüí',
    latitude: 6.1725,
    longitude: -75.6085,
    category: 'música',
    priceType: 'paid',
    priceMin: 40000,
    priceMax: 85000,
    currency: 'COP',
    organizer: 'Candlelight / Fever',
    sources: [{ type: 'web', label: 'Fever Medellín', url: 'https://feverup.com/m/673127' }],
    sourceCount: 1,
    verified: true,
    isGem: true,
    isNewlyFound: true,
    detectedAt: '2026-08-17T16:25:00-05:00',
    lastCheckedAt: '2026-08-17T16:25:00-05:00',
    tags: ['candlelight', 'piano', 'linkin park', 'música'],
    score: 96
  },
  {
    id: 'fever-660680',
    slug: 'fever-candlelight-piano-tributo-a-michael-jackson-deutsche-schule',
    title: 'Candlelight Piano: Tributo a Michael Jackson',
    shortDescription: 'Billie Jean, Thriller, Smooth Criminal, Man in the Mirror y Beat It interpretados al piano bajo la luz de las velas.',
    longDescription: 'El Rey del Pop como nunca antes lo habías escuchado: arreglos virtuosos de piano solista para revivir los grandes éxitos de Michael Jackson en un ambiente iluminado por miles de velas.',
    startDate: '2026-11-07',
    startTime: '20:30',
    venue: 'Auditorium Maximum (Deutsche Schule Medellín)',
    neighborhood: 'Itagüí',
    city: 'Itagüí',
    latitude: 6.1725,
    longitude: -75.6085,
    category: 'música',
    priceType: 'paid',
    priceMin: 47000,
    priceMax: 90000,
    currency: 'COP',
    organizer: 'Candlelight / Fever',
    sources: [{ type: 'web', label: 'Fever Medellín', url: 'https://feverup.com/m/660680' }],
    sourceCount: 1,
    verified: true,
    isGem: true,
    isNewlyFound: true,
    detectedAt: '2026-08-17T16:25:00-05:00',
    lastCheckedAt: '2026-08-17T16:25:00-05:00',
    tags: ['candlelight', 'piano', 'michael jackson', 'música'],
    score: 96
  },
  {
    id: 'fever-413176',
    slug: 'fever-candlelight-exitos-de-salsa-mamm',
    title: 'Candlelight: Éxitos de Salsa a la luz de las velas',
    shortDescription: 'Joe Arroyo, Héctor Lavoe, Grupo Niche, Rubén Blades y Celia Cruz interpretados por ensamble de cuerdas en el MAMM.',
    longDescription: 'Una fusión única e innovadora: los mayores clásicos de la salsa latina y colombiana adaptados para ensamble clásico en el imponente Museo de Arte Moderno de Medellín (MAMM), rodeado de miles de velas.',
    startDate: '2026-11-12',
    startTime: '19:00',
    venue: 'Museo de Arte Moderno de Medellín (MAMM)',
    neighborhood: 'El Poblado',
    city: 'Medellín',
    latitude: 6.2238,
    longitude: -75.5746,
    category: 'música',
    priceType: 'paid',
    priceMin: 130000,
    priceMax: 180000,
    currency: 'COP',
    organizer: 'Candlelight / Fever',
    sources: [{ type: 'web', label: 'Fever Medellín', url: 'https://feverup.com/m/413176' }],
    sourceCount: 1,
    verified: true,
    isGem: true,
    isNewlyFound: true,
    detectedAt: '2026-08-17T16:25:00-05:00',
    lastCheckedAt: '2026-08-17T16:25:00-05:00',
    tags: ['candlelight', 'salsa', 'mamm', 'el poblado'],
    score: 97
  },
  {
    id: 'fever-325480',
    slug: 'fever-candlelight-tributo-a-bad-bunny-mamm',
    title: 'Candlelight: Tributo a Bad Bunny',
    shortDescription: 'Los mayores hits globales de Bad Bunny en una versión orquestal y de cuerdas a la luz de las velas.',
    longDescription: 'Yonaguni, Ojitos Lindos, Tití Me Preguntó, Monaco y Callaita transformados en piezas de música de cámara por talentosos músicos locales en el domo de velas del MAMM.',
    startDate: '2026-11-12',
    startTime: '21:30',
    venue: 'Museo de Arte Moderno de Medellín (MAMM)',
    neighborhood: 'El Poblado',
    city: 'Medellín',
    latitude: 6.2238,
    longitude: -75.5746,
    category: 'música',
    priceType: 'paid',
    priceMin: 130000,
    priceMax: 180000,
    currency: 'COP',
    organizer: 'Candlelight / Fever',
    sources: [{ type: 'web', label: 'Fever Medellín', url: 'https://feverup.com/m/325480' }],
    sourceCount: 1,
    verified: true,
    isGem: true,
    isNewlyFound: true,
    detectedAt: '2026-08-17T16:25:00-05:00',
    lastCheckedAt: '2026-08-17T16:25:00-05:00',
    tags: ['candlelight', 'bad bunny', 'mamm', 'el poblado'],
    score: 96
  },
  {
    id: 'fever-325449',
    slug: 'fever-candlelight-lo-mejor-de-hans-zimmer-mamm',
    title: 'Candlelight: Lo Mejor de Hans Zimmer',
    shortDescription: 'Interstellar, El Rey León, Gladiador, Piratas del Caribe, Inception y Dune bajo la luz de las velas.',
    longDescription: 'Las bandas sonoras más épicas del cine contemporáneo compuestas por Hans Zimmer, interpretadas en vivo por un cuarteto de cuerdas en una atmósfera multisensorial dentro del MAMM.',
    startDate: '2026-12-03',
    startTime: '19:00',
    venue: 'Museo de Arte Moderno de Medellín (MAMM)',
    neighborhood: 'El Poblado',
    city: 'Medellín',
    latitude: 6.2238,
    longitude: -75.5746,
    category: 'música',
    priceType: 'paid',
    priceMin: 130000,
    priceMax: 180000,
    currency: 'COP',
    organizer: 'Candlelight / Fever',
    sources: [{ type: 'web', label: 'Fever Medellín', url: 'https://feverup.com/m/325449' }],
    sourceCount: 1,
    verified: true,
    isGem: true,
    isNewlyFound: true,
    detectedAt: '2026-08-17T16:25:00-05:00',
    lastCheckedAt: '2026-08-17T16:25:00-05:00',
    tags: ['candlelight', 'hans zimmer', 'bandas sonoras', 'mamm'],
    score: 98
  },
  {
    id: 'fever-305910',
    slug: 'fever-candlelight-las-cuatro-estaciones-de-vivaldi-mamm',
    title: 'Candlelight: Las Cuatro Estaciones de Vivaldi',
    shortDescription: 'La obra cumbre del barroco italiano interpretada en su totalidad bajo la mágica iluminación de velas.',
    longDescription: 'La Primavera, El Verano, El Otoño y El Invierno de Antonio Vivaldi en una interpretación sublime por destacados solistas y ensamble de cuerdas en el Museo de Arte Moderno de Medellín.',
    startDate: '2026-11-26',
    startTime: '19:00',
    venue: 'Museo de Arte Moderno de Medellín (MAMM)',
    neighborhood: 'El Poblado',
    city: 'Medellín',
    latitude: 6.2238,
    longitude: -75.5746,
    category: 'música',
    priceType: 'paid',
    priceMin: 130000,
    priceMax: 180000,
    currency: 'COP',
    organizer: 'Candlelight / Fever',
    sources: [{ type: 'web', label: 'Fever Medellín', url: 'https://feverup.com/m/305910' }],
    sourceCount: 1,
    verified: true,
    isGem: true,
    isNewlyFound: true,
    detectedAt: '2026-08-17T16:25:00-05:00',
    lastCheckedAt: '2026-08-17T16:25:00-05:00',
    tags: ['candlelight', 'vivaldi', 'música clásica', 'mamm'],
    score: 97
  },
  {
    id: 'fever-720276',
    slug: 'fever-candlelight-tributo-a-karol-g-mamm',
    title: 'Candlelight: Tributo a Karol G a la luz de las velas',
    shortDescription: 'Provenza, TQG, Mañana Será Bonito, Amargura y MAMIII en arreglos sinfónicos y de cuerdas.',
    longDescription: 'El primer tributo oficial Candlelight a la Bichota en su ciudad natal: un viaje musical por toda la discografía de Karol G en un formato íntimo e iluminado por velas en el MAMM.',
    startDate: '2026-12-03',
    startTime: '21:30',
    venue: 'Museo de Arte Moderno de Medellín (MAMM)',
    neighborhood: 'El Poblado',
    city: 'Medellín',
    latitude: 6.2238,
    longitude: -75.5746,
    category: 'música',
    priceType: 'paid',
    priceMin: 130000,
    priceMax: 180000,
    currency: 'COP',
    organizer: 'Candlelight / Fever',
    sources: [{ type: 'web', label: 'Fever Medellín', url: 'https://feverup.com/m/720276' }],
    sourceCount: 1,
    verified: true,
    isGem: true,
    isNewlyFound: true,
    detectedAt: '2026-08-17T16:25:00-05:00',
    lastCheckedAt: '2026-08-17T16:25:00-05:00',
    tags: ['candlelight', 'karol g', 'mamm', 'el poblado'],
    score: 98
  },
  {
    id: 'fever-683386',
    slug: 'fever-the-jazz-room-tributo-a-marvin-gaye-trilogia',
    title: 'The Jazz Room: Tributo a Marvin Gaye – Una noche de soul',
    shortDescription: 'What’s Going On, Sexual Healing, Let’s Get It On y Ain’t No Mountain High Enough con banda en vivo.',
    longDescription: 'Déjate envolver por la magia del soul clásico y el R&B en The Jazz Room. Una noche para rendir tributo a la leyenda de Motown Marvin Gaye con músicos excepcionales en Trilogía Bar.',
    startDate: '2026-11-26',
    startTime: '20:00',
    venue: 'Trilogía Bar',
    neighborhood: 'El Poblado',
    city: 'Medellín',
    latitude: 6.2124,
    longitude: -75.5721,
    category: 'música',
    priceType: 'paid',
    priceMin: 85000,
    priceMax: 130000,
    currency: 'COP',
    organizer: 'Fever / The Jazz Room',
    sources: [{ type: 'web', label: 'Fever Medellín', url: 'https://feverup.com/m/683386' }],
    sourceCount: 1,
    verified: true,
    isGem: true,
    isNewlyFound: true,
    detectedAt: '2026-08-17T16:25:00-05:00',
    lastCheckedAt: '2026-08-17T16:25:00-05:00',
    tags: ['jazz', 'soul', 'marvin gaye', 'el poblado'],
    score: 95
  },
  {
    id: 'fever-481803',
    slug: 'fever-medellin-murder-mystery-solve-the-case-el-poblado',
    title: 'Medellín Murder Mystery: Resuelve el Misterio en El Poblado',
    shortDescription: 'Un juego de detectives interactivo y al aire libre por las calles históricas de El Poblado.',
    longDescription: 'Ponte en la piel de un detective y sigue las pistas, interroga a sospechosos virtuales y desvela los secretos ocultos de un crimen misterioso en un recorrido interactivo por El Poblado.',
    startDate: '2026-08-22',
    startTime: '15:00',
    venue: 'Calle 10 #36 (Punto de Partida)',
    neighborhood: 'El Poblado',
    city: 'Medellín',
    latitude: 6.2085,
    longitude: -75.5682,
    category: 'talleres',
    priceType: 'paid',
    priceMin: 22000,
    priceMax: 22000,
    currency: 'COP',
    organizer: 'Fever / Mystery City Games',
    sources: [{ type: 'web', label: 'Fever Medellín', url: 'https://feverup.com/m/481803' }],
    sourceCount: 1,
    verified: true,
    isGem: true,
    isNewlyFound: true,
    detectedAt: '2026-08-17T16:25:00-05:00',
    lastCheckedAt: '2026-08-17T16:25:00-05:00',
    tags: ['misterio', 'juegos', 'escape room', 'el poblado'],
    score: 91
  }
];

async function main() {
  const eventsTs = fs.readFileSync('src/data/events.ts', 'utf8');
  const tempFile = 'scripts/temp_events_fever2.js';
  const cleanCode = eventsTs
    .replace(/import\s+.*?;/g, '')
    .replace(/export const DEMO_EVENTS: AntiFOMOEvent\[\] =/g, 'const DEMO_EVENTS =')
    + '\nmodule.exports = DEMO_EVENTS;';
  fs.writeFileSync(tempFile, cleanCode);
  const existingEvents = require('./temp_events_fever2.js');
  fs.unlinkSync(tempFile);

  const existingSlugs = new Set(existingEvents.map(e => e.slug));
  const toAdd = feverItems.filter(e => !existingSlugs.has(e.slug));

  console.log(`Adding ${toAdd.length} additional Fever & Candlelight experiences...`);

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
