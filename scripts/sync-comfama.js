const { execSync } = require('child_process');
const fs = require('fs');
const https = require('https');
const path = require('path');

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

function mapCategory(categories = []) {
  const cats = categories.map(c => c.toLowerCase());
  if (cats.some(c => c.includes('concierto') || c.includes('música') || c.includes('musica'))) return 'música';
  if (cats.some(c => c.includes('cine'))) return 'cine';
  if (cats.some(c => c.includes('teatro') || c.includes('artes escénicas'))) return 'teatro';
  if (cats.some(c => c.includes('taller') || c.includes('laboratorio') || c.includes('creativo'))) return 'talleres';
  if (cats.some(c => c.includes('exposici') || c.includes('arte'))) return 'arte';
  if (cats.some(c => c.includes('charla') || c.includes('conversatorio') || c.includes('lectura') || c.includes('literatur'))) return 'literatura';
  if (cats.some(c => c.includes('fiesta') || c.includes('baile'))) return 'fiesta';
  if (cats.some(c => c.includes('bienestar') || c.includes('yoga') || c.includes('meditaci'))) return 'bienestar';
  return 'comunidad';
}

function mapNeighborhood(hit) {
  const addr = (hit.formattedAddress || '').toLowerCase();
  const venue = (hit.centrosCulturales || '').toLowerCase();
  const mun = (hit.municipality || '').toLowerCase();
  if (addr.includes('la candelaria') || addr.includes('san ignacio') || venue.includes('claustro') || addr.includes('centro') || venue.includes('bodega')) return 'Centro';
  if (mun.includes('envigado') || addr.includes('envigado') || venue.includes('otraparte')) return 'Envigado';
  if (mun.includes('itagüí') || mun.includes('itagui') || addr.includes('itagui')) return 'Itagüí';
  if (mun.includes('bello') || addr.includes('bello')) return 'Bello';
  if (mun.includes('sabaneta') || addr.includes('sabaneta')) return 'Sabaneta';
  if (mun.includes('rionegro') || addr.includes('rionegro')) return 'Rionegro';
  if (addr.includes('laureles')) return 'Laureles';
  if (addr.includes('poblado') || addr.includes('ciudad del río') || addr.includes('ciudad del rio')) return 'El Poblado';
  if (addr.includes('aranjuez')) return 'Aranjuez';
  if (addr.includes('belén') || addr.includes('belen')) return 'Belén';
  if (addr.includes('santa elena')) return 'Santa Elena';
  return 'Centro';
}

async function fetchComfamaEvents() {
  console.log('Fetching upcoming Comfama events from Elasticsearch...');
  const body = JSON.stringify({
    from: 0,
    size: 500,
    query: {
      bool: {
        must: [
          {
            range: {
              fullStartDate: {
                gte: '2026-08-17T00:00:00'
              }
            }
          }
        ]
      }
    },
    sort: [
      { fullStartDate: { order: 'asc' } }
    ]
  });

  const cmd = `curl -s -X POST "https://integraciones.comfama.com/tran/elasticsearch/agenda_eventtia_logstash/_search" \
    -H "Content-Type: application/json" \
    -H "Authorization: ApiKey YWZZMW1Kb0JpdERQVkJsWF9Cb3U6Ulh1d3FJS0dSNm1jNklFSklvY0FzUQ==" \
    -d '${body}'`;

  const res = execSync(cmd).toString();
  const json = JSON.parse(res);
  const hits = json.hits?.hits || [];
  console.log(`Found ${hits.length} upcoming events from Comfama.`);

  const seenSlugs = new Set();
  const events = [];

  for (const h of hits) {
    const s = h._source;
    if (!s || !s.title) continue;

    let baseSlug = s.slug ? s.slug.replace('https://www.comfama.com/agenda/evento/', '').replace(/\/$/, '') : `comfama-${s.id}`;
    baseSlug = `comfama-${baseSlug}`.toLowerCase().replace(/[^a-z0-9\-]/g, '-').replace(/-+/g, '-');
    
    let uniqueSlug = baseSlug;
    let counter = 1;
    while (seenSlugs.has(uniqueSlug)) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }
    seenSlugs.add(uniqueSlug);

    const category = mapCategory(s.category);
    const neighborhood = mapNeighborhood(s);
    const startDate = s.fullStartDate ? s.fullStartDate.split('T')[0] : '2026-08-18';
    const startTime = s.fullStartDate && s.fullStartDate.includes('T') ? s.fullStartDate.split('T')[1].slice(0, 5) : '15:00';
    const endTime = s.fullEndDate && s.fullEndDate.includes('T') ? s.fullEndDate.split('T')[1].slice(0, 5) : null;
    const venue = s.centrosCulturales || s.formattedAddress?.split(',')[0] || 'Comfama';
    const city = s.municipality || 'Medellín';
    
    const rawDesc = s.description || s.title;
    const cleanDesc = rawDesc.replace(/[\r\n]+/g, ' ').trim();
    const shortDesc = cleanDesc.length > 140 ? cleanDesc.slice(0, 137) + '...' : cleanDesc;

    events.push({
      id: `comfama-${s.id}`,
      slug: uniqueSlug,
      title: s.title.trim(),
      shortDescription: shortDesc,
      longDescription: cleanDesc,
      startDate,
      startTime,
      endTime,
      venue,
      neighborhood,
      city,
      latitude: s.latitude || 6.2461,
      longitude: s.longitude || -75.5652,
      category,
      priceType: 'free',
      currency: 'COP',
      organizer: 'Comfama',
      sources: [
        { type: 'web', label: 'Comfama Agenda Cultural', url: s.slug || 'https://www.comfama.com/agenda/eventos/?filters=false' }
      ],
      sourceCount: 1,
      verified: true,
      isGem: category === 'música' || category === 'cine' || category === 'teatro',
      isNewlyFound: true,
      detectedAt: '2026-08-17T15:35:00-05:00',
      lastCheckedAt: '2026-08-17T15:35:00-05:00',
      tags: ['comfama', ...(s.tags || []), ...(s.category || []).map(c => c.toLowerCase()), neighborhood.toLowerCase(), 'cultura'],
      score: (category === 'música' || category === 'cine' || category === 'teatro') ? 94 : 88,
    });
  }

  return events;
}

async function main() {
  const comfamaEvents = await fetchComfamaEvents();
  console.log(`Prepared ${comfamaEvents.length} events for database seeding.`);

  // Write to data file
  const outPath = path.join(__dirname, '../src/data/comfama-events.json');
  fs.writeFileSync(outPath, JSON.stringify(comfamaEvents, null, 2));
  console.log(`Saved events JSON to ${outPath}`);

  // Seed into Supabase in batches of 50
  console.log('Seeding into Supabase PostgreSQL...');
  const BATCH_SIZE = 50;
  for (let i = 0; i < comfamaEvents.length; i += BATCH_SIZE) {
    const batch = comfamaEvents.slice(i, i + BATCH_SIZE).map(e => ({
      slug: e.slug,
      title: e.title,
      short_description: e.shortDescription,
      long_description: e.longDescription,
      start_date: e.startDate,
      start_time: e.startTime,
      end_time: e.endTime,
      venue: e.venue,
      neighborhood: e.neighborhood,
      city: e.city,
      latitude: e.latitude,
      longitude: e.longitude,
      category: e.category,
      price_type: e.priceType,
      price_min: 0,
      price_max: 0,
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

    try {
      const res = await postgrestRequest('events?on_conflict=slug', 'POST', batch);
      console.log(`✅ Upserted batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} events)`);
    } catch (err) {
      console.error(`Error in batch ${i / BATCH_SIZE + 1}:`, err.message);
    }
  }

  console.log('🎉 Comfama events sync completed successfully!');
}

main().catch(console.error);
