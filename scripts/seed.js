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

async function seed() {
  console.log('Seeding events into Supabase PostgreSQL...');

  const eventsFile = fs.readFileSync('src/data/events.ts', 'utf8');
  const cleanCode = eventsFile
    .replace(/import\s+.*?;/g, '')
    .replace(/export const DEMO_EVENTS: AntiFOMOEvent\[\] =/g, 'const DEMO_EVENTS =')
    + '\nmodule.exports = DEMO_EVENTS;';
  
  const tempFile = 'scripts/temp_events.js';
  fs.writeFileSync(tempFile, cleanCode);
  const events = require('./temp_events.js');
  fs.unlinkSync(tempFile);

  console.log(`Found ${events.length} events to seed.`);

  const rows = events.map(event => ({
    slug: event.slug,
    title: event.title,
    short_description: event.shortDescription,
    long_description: event.longDescription || null,
    start_date: event.startDate,
    start_time: event.startTime,
    end_time: event.endTime || null,
    venue: event.venue,
    neighborhood: event.neighborhood,
    city: event.city || 'Medellín',
    latitude: event.latitude || null,
    longitude: event.longitude || null,
    category: event.category,
    subcategory: event.subcategory || null,
    price_type: event.priceType || 'free',
    price_min: event.priceMin || 0,
    price_max: event.priceMax || 0,
    currency: event.currency || 'COP',
    organizer: event.organizer || null,
    image_url: event.image || null,
    sources: event.sources || [],
    source_count: event.sourceCount || 1,
    verified: Boolean(event.verified),
    is_gem: Boolean(event.isGem),
    is_newly_found: Boolean(event.isNewlyFound),
    score: event.score || 85,
    tags: event.tags || [],
    status: 'published',
    detected_at: event.detectedAt || new Date().toISOString(),
    last_checked_at: event.lastCheckedAt || new Date().toISOString(),
  }));

  const result = await postgrestRequest('events?on_conflict=slug', 'POST', rows);
  console.log(`✅ Successfully seeded ${result?.length || rows.length} events into Supabase!`);
}

seed().catch(console.error);
