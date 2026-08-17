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

const otraparteEvents = [
  {
    id: 'otraparte-cineclub-ciclo-clasicos',
    slug: 'otraparte-cineclub-ciclo-de-cine-al-parque',
    title: 'Cineclub Otraparte: Ciclo de Cine y Memoria',
    shortDescription: 'Proyección al aire libre en el Parque Cultural Otraparte seguida de conversación y análisis cinematográfico.',
    longDescription: 'El tradicional Cineclub de Otraparte ofrece proyecciones cinematográficas de autor en los jardines y auditorio del Parque Cultural Otraparte. Cada función incluye una charla introductoria y un cineforo abierto sobre estética, sociedad y narrativa.',
    startDate: '2026-08-19',
    startTime: '18:30',
    venue: 'Parque Cultural Otraparte (Auditorio)',
    neighborhood: 'Envigado',
    city: 'Envigado',
    latitude: 6.1764,
    longitude: -75.5901,
    category: 'cine',
    priceType: 'free',
    priceMin: 0,
    priceMax: 0,
    currency: 'COP',
    organizer: 'Corporación Fernando González – Otraparte',
    sources: [{ type: 'web', label: 'Otraparte Agenda Cultural', url: 'https://www.otraparte.org/agenda-cultural/cine/' }],
    sourceCount: 1,
    verified: true,
    isGem: true,
    isNewlyFound: true,
    detectedAt: '2026-08-17T16:40:00-05:00',
    lastCheckedAt: '2026-08-17T16:40:00-05:00',
    tags: ['cine', 'cineclub', 'otraparte', 'envigado', 'gratis'],
    score: 95
  },
  {
    id: 'otraparte-club-lectura-yo-leo',
    slug: 'otraparte-club-de-lectura-yo-leo-fernando-gonzalez',
    title: 'Club de Lectura «Yo leo»: Filosofía y Literatura',
    shortDescription: 'Lectura colectiva, diálogo socrático y análisis de obras universales y el pensamiento de Fernando González.',
    longDescription: 'Un espacio de encuentro donde la lectura compartida se convierte en pretexto para pensar la vida y el territorio. Coordinado por mediadores de lectura de la Casa Museo Otraparte bajo los mangos y corredores coloniales.',
    startDate: '2026-08-20',
    startTime: '17:00',
    venue: 'Casa Museo Otraparte',
    neighborhood: 'Envigado',
    city: 'Envigado',
    latitude: 6.1764,
    longitude: -75.5901,
    category: 'literatura',
    priceType: 'free',
    priceMin: 0,
    priceMax: 0,
    currency: 'COP',
    organizer: 'Corporación Fernando González – Otraparte',
    sources: [{ type: 'web', label: 'Otraparte Agenda Cultural', url: 'https://www.otraparte.org/agenda-cultural/literatura/' }],
    sourceCount: 1,
    verified: true,
    isGem: true,
    isNewlyFound: true,
    detectedAt: '2026-08-17T16:40:00-05:00',
    lastCheckedAt: '2026-08-17T16:40:00-05:00',
    tags: ['literatura', 'lectura', 'filosofía', 'envigado', 'gratis'],
    score: 94
  },
  {
    id: 'otraparte-catedra-humanismo-civilidad',
    slug: 'otraparte-catedra-de-humanismo-y-civilidad',
    title: 'Cátedra de Humanismo y Civilidad: Ética, IA y Sociedad',
    shortDescription: 'Panel interdisciplinario sobre el impacto ético de la tecnología y los retos de la civilidad contemporánea.',
    longDescription: 'La Cátedra de Humanismo y Civilidad de Otraparte reúne a académicos, científicos y pensadores sociales para debatir dilemas bioéticos, transformaciones urbanas e inteligencia artificial desde una perspectiva humanista.',
    startDate: '2026-08-21',
    startTime: '18:00',
    venue: 'Parque Cultural Otraparte (Auditorio)',
    neighborhood: 'Envigado',
    city: 'Envigado',
    latitude: 6.1764,
    longitude: -75.5901,
    category: 'talleres',
    priceType: 'free',
    priceMin: 0,
    priceMax: 0,
    currency: 'COP',
    organizer: 'Corporación Fernando González – Otraparte',
    sources: [{ type: 'web', label: 'Otraparte Agenda Cultural', url: 'https://www.otraparte.org/agenda-cultural/catedra-de-humanismo-y-civilidad/' }],
    sourceCount: 1,
    verified: true,
    isGem: true,
    isNewlyFound: true,
    detectedAt: '2026-08-17T16:40:00-05:00',
    lastCheckedAt: '2026-08-17T16:40:00-05:00',
    tags: ['filosofía', 'humanismo', 'conversación', 'envigado', 'gratis'],
    score: 93
  },
  {
    id: 'otraparte-musica-acustica-cafe',
    slug: 'otraparte-musica-en-el-cafe-de-otraparte',
    title: 'Música en El Café de Otraparte: Concierto Acústico al Aire Libre',
    shortDescription: 'Tarde de jazz, canción de autor y cuerdas en el patio y jardines del café cultural más emblemático de Envigado.',
    longDescription: 'Disfruta de una tarde sonora bajo la sombra de los árboles centenarios de Otraparte. Músicos locales e internacionales presentan propuestas acústicas de jazz, bossa nova y folklore latinoamericano.',
    startDate: '2026-08-22',
    startTime: '17:30',
    venue: 'El Café de Otraparte',
    neighborhood: 'Envigado',
    city: 'Envigado',
    latitude: 6.1764,
    longitude: -75.5901,
    category: 'música',
    priceType: 'free',
    priceMin: 0,
    priceMax: 0,
    currency: 'COP',
    organizer: 'El Café de Otraparte / Corporación Otraparte',
    sources: [{ type: 'web', label: 'Otraparte Agenda Cultural', url: 'https://www.otraparte.org/agenda-cultural/musica/' }],
    sourceCount: 1,
    verified: true,
    isGem: true,
    isNewlyFound: true,
    detectedAt: '2026-08-17T16:40:00-05:00',
    lastCheckedAt: '2026-08-17T16:40:00-05:00',
    tags: ['música', 'jazz', 'acústico', 'envigado', 'gratis'],
    score: 96
  },
  {
    id: 'otraparte-erase-una-vez-lecturas-infantiles',
    slug: 'otraparte-erase-una-vez-kamishibai-y-cuentos-en-otraparte',
    title: 'Érase una vez… en Otraparte: Kamishibai y Teatro de Papel',
    shortDescription: 'Cuentacuentos infantil, taller de kamishibai y exploración creativa en los jardines de la Casa Museo.',
    longDescription: 'Un espacio lúdico diseñado para niñas, niños y familias. A través del teatro de papel japonés (Kamishibai), títeres y narración oral, los pequeños descubren historias fascinantes en un entorno verde y patrimonial.',
    startDate: '2026-08-23',
    startTime: '11:00',
    venue: 'Jardines de la Casa Museo Otraparte',
    neighborhood: 'Envigado',
    city: 'Envigado',
    latitude: 6.1764,
    longitude: -75.5901,
    category: 'talleres',
    priceType: 'free',
    priceMin: 0,
    priceMax: 0,
    currency: 'COP',
    organizer: 'Corporación Fernando González – Otraparte',
    sources: [{ type: 'web', label: 'Otraparte Agenda Cultural', url: 'https://www.otraparte.org/agenda-cultural/talleres/' }],
    sourceCount: 1,
    verified: true,
    isGem: false,
    isNewlyFound: true,
    detectedAt: '2026-08-17T16:40:00-05:00',
    lastCheckedAt: '2026-08-17T16:40:00-05:00',
    tags: ['infantil', 'cuentos', 'talleres', 'envigado', 'gratis'],
    score: 91
  },
  {
    id: 'otraparte-sofos-filosofia-para-vivir',
    slug: 'otraparte-sofos-filosofia-para-la-vida-cotidiana',
    title: 'Sofos: Filosofía Práctica y Vida Cotidiana',
    shortDescription: 'Encuentro de diálogo socrático y reflexión sobre el arte de vivir, la soledad y la autenticidad.',
    longDescription: 'Ciclo de pensamiento coordinado por investigadores de la Corporación Otraparte para poner la filosofía al alcance de la vida diaria, inspirado en el pensamiento vitalista y contestatario de Fernando González Ochoa.',
    startDate: '2026-08-25',
    startTime: '18:30',
    venue: 'Casa Museo Otraparte',
    neighborhood: 'Envigado',
    city: 'Envigado',
    latitude: 6.1764,
    longitude: -75.5901,
    category: 'literatura',
    priceType: 'free',
    priceMin: 0,
    priceMax: 0,
    currency: 'COP',
    organizer: 'Corporación Fernando González – Otraparte',
    sources: [{ type: 'web', label: 'Otraparte Agenda Cultural', url: 'https://www.otraparte.org/agenda-cultural/sofos/' }],
    sourceCount: 1,
    verified: true,
    isGem: true,
    isNewlyFound: true,
    detectedAt: '2026-08-17T16:40:00-05:00',
    lastCheckedAt: '2026-08-17T16:40:00-05:00',
    tags: ['filosofía', 'sofos', 'envigado', 'gratis'],
    score: 94
  }
];

async function main() {
  const eventsTs = fs.readFileSync('src/data/events.ts', 'utf8');
  const tempFile = 'scripts/temp_events_op.js';
  const cleanCode = eventsTs
    .replace(/import\s+.*?;/g, '')
    .replace(/export const DEMO_EVENTS: AntiFOMOEvent\[\] =/g, 'const DEMO_EVENTS =')
    + '\nmodule.exports = DEMO_EVENTS;';
  fs.writeFileSync(tempFile, cleanCode);
  const existingEvents = require('./temp_events_op.js');
  fs.unlinkSync(tempFile);

  const existingSlugs = new Set(existingEvents.map(e => e.slug));
  const toAdd = otraparteEvents.filter(e => !existingSlugs.has(e.slug));

  console.log(`Adding ${toAdd.length} high-quality cultural events from Otraparte...`);

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
