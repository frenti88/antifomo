const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hiadblaoxgfbfceiwqbo.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpYWRibGFveGdmYmZjZWl3cWJvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Njk4NTk5MywiZXhwIjoyMTAyNTYxOTkzfQ.NfXTOjdPQm8lCTPpYej-ILf5yX8FatHNDiQvMODYLKI';

const monthMap = {
  'enero': '01', 'febrero': '02', 'marzo': '03', 'abril': '04',
  'mayo': '05', 'junio': '06', 'julio': '07', 'agosto': '08',
  'septiembre': '09', 'octubre': '10', 'noviembre': '11', 'diciembre': '12'
};

function parseDate(dateStr) {
  if (!dateStr) return '2026-08-22';
  const m = dateStr.match(/(\d{1,2})\s+de\s+([a-záéíóú]+)\s+de\s+(\d{4})/i);
  if (!m) return '2026-08-22';
  const day = m[1].padStart(2, '0');
  const month = monthMap[m[2].toLowerCase()] || '08';
  const year = m[3];
  return year + '-' + month + '-' + day;
}

function parseTime(timeStr) {
  if (!timeStr) return '19:00';
  const m = timeStr.match(/(\d{1,2}):(\d{2})\s*([ap]\.?\s*m\.?)/i);
  if (!m) return '19:00';
  let h = parseInt(m[1], 10);
  const min = m[2];
  const isPm = m[3].toLowerCase().includes('p');
  if (isPm && h < 12) h += 12;
  if (!isPm && h === 12) h = 0;
  return String(h).padStart(2, '0') + ':' + min;
}

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

async function run() {
  console.log('Fetching Teatro Pablo Tobón Uribe events...');
  const pages = [
    'https://teatropablotobon.com/eventos/',
    'https://teatropablotobon.com/eventos/?paged=2'
  ];

  const rawCards = [];

  for (const pageUrl of pages) {
    try {
      const res = await fetch(pageUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      const html = await res.text();
      const parts = html.split('<div class="card">');
      
      for (let i = 1; i < parts.length; i++) {
        const part = parts[i];
        const dateM = part.match(/<div>\s*<p[^>]*>[^<]*<\/p>\s*<p[^>]*><strong>\s*([^<]+)\s*<\/strong>/i);
        const timeM = part.match(/schedule<\/i><\/p>\s*<p[^>]*><strong>\s*([^<]+)\s*<\/strong>/i);
        const titleM = part.match(/<h2 class="card__title[^"]*">\s*(.*?)\s*<\/h2>/i);
        const linkM = part.match(/href="(https:\/\/teatropablotobon\.com\/evento\/[^"]+)"/i);
        const chips = [...part.matchAll(/<div class="chips__chip[^"]*">\s*(.*?)\s*<\/div>/g)].map(m => m[1].trim());

        if (titleM && linkM) {
          rawCards.push({
            title: titleM[1].replace(/&#8211;/g, '–').replace(/&#038;/g, '&').replace(/&nbsp;/g, ' ').replace(/&#8217;/g, '\'').trim(),
            dateStr: dateM ? dateM[1] : null,
            timeStr: timeM ? timeM[1].trim() : '19:00',
            url: linkM[1],
            chips
          });
        }
      }
    } catch (e) {
      console.error('Error fetching page', e);
    }
  }

  console.log('Found ' + rawCards.length + ' raw cards. Fetching descriptions and details...');

  const antiEvents = [];

  for (let i = 0; i < rawCards.length; i++) {
    const card = rawCards[i];
    let shortDesc = 'Evento cultural en el emblemático Teatro Pablo Tobón Uribe de Medellín.';
    let longDesc = '';

    try {
      const detailRes = await fetch(card.url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (detailRes.ok) {
        const dHtml = await detailRes.text();
        const descMatch = dHtml.match(/<div class="text-editor[^"]*">([\s\S]*?)<\/div>/i) || dHtml.match(/<div class="post-content[^"]*">([\s\S]*?)<\/div>/i);
        if (descMatch) {
          const cleanText = descMatch[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          if (cleanText.length > 20) {
            shortDesc = cleanText.slice(0, 160) + '...';
            longDesc = cleanText;
          }
        }
      }
    } catch (e) {
      // fallback
    }

    const categoryChip = card.chips[0] || 'Teatro';
    const priceChip = card.chips[1] || 'Entrada con costo';

    let category = 'teatro';
    const lowerChip = categoryChip.toLowerCase();
    if (lowerChip.includes('música') || lowerChip.includes('musica')) category = 'música';
    else if (lowerChip.includes('danza')) category = 'performance';
    else if (lowerChip.includes('circo')) category = 'teatro';
    else if (lowerChip.includes('ferias') || lowerChip.includes('festival')) category = 'comunidad';
    else if (card.title.toLowerCase().includes('yoga')) category = 'bienestar';
    else if (card.title.toLowerCase().includes('pecado') || card.title.toLowerCase().includes('dávila')) category = 'comedia';
    else if (card.title.toLowerCase().includes('baile')) category = 'talleres';

    const isFree = priceChip.toLowerCase().includes('libre') || priceChip.toLowerCase().includes('gratis') || priceChip.toLowerCase().includes('voluntario');
    const isGem = card.title.toLowerCase().includes('santaolalla') || card.title.toLowerCase().includes('iberacademy') || card.title.toLowerCase().includes('diestra de dios') || card.title.toLowerCase().includes('pantolocos') || card.title.toLowerCase().includes('soda stereo');

    const startDate = parseDate(card.dateStr);
    const startTime = parseTime(card.timeStr);
    const baseSlug = slugify(card.title);
    const uniqueSlug = `${baseSlug}-tptu-${startDate.replace(/-/g, '')}`;

    const eventObj = {
      id: `pablo-tobon-${startDate}-${i + 1}`,
      slug: uniqueSlug,
      title: card.title,
      shortDescription: shortDesc,
      longDescription: longDesc || shortDesc,
      startDate,
      startTime,
      venue: 'Teatro Pablo Tobón Uribe',
      neighborhood: 'Centro / La Playa',
      city: 'Medellín',
      latitude: 6.2494,
      longitude: -75.5606,
      category,
      priceType: isFree ? 'free' : 'paid',
      priceMin: isFree ? 0 : 35000,
      currency: 'COP',
      organizer: 'Teatro Pablo Tobón Uribe',
      sources: [
        {
          label: 'Teatro Pablo Tobón Uribe (Oficial)',
          url: card.url,
          type: 'web',
          detectedAt: '2026-08-17T23:55:00.000Z'
        }
      ],
      sourceCount: 1,
      verified: true,
      isGem,
      isNewlyFound: false,
      status: 'published',
      score: isGem ? 96 : 90,
      tags: ['teatro', 'cultura', 'centro', 'la playa', category, isFree ? 'gratis' : 'con costo', 'pablo tobon'],
      detectedAt: '2026-08-17T23:55:00.000Z',
      lastCheckedAt: '2026-08-17T23:55:00.000Z'
    };

    antiEvents.push(eventObj);
  }

  console.log('Synchronizing ' + antiEvents.length + ' Teatro Pablo Tobón events to Supabase...');

  for (const ev of antiEvents) {
    const record = {
      slug: ev.slug,
      title: ev.title,
      short_description: ev.shortDescription,
      long_description: ev.longDescription,
      start_date: ev.startDate,
      start_time: ev.startTime,
      venue: ev.venue,
      neighborhood: ev.neighborhood,
      city: ev.city,
      latitude: ev.latitude,
      longitude: ev.longitude,
      category: ev.category,
      price_type: ev.priceType,
      price_min: ev.priceMin,
      currency: ev.currency,
      organizer: ev.organizer,
      sources: ev.sources,
      source_count: ev.sourceCount,
      verified: ev.verified,
      is_gem: ev.isGem,
      is_newly_found: ev.isNewlyFound,
      status: ev.status,
      score: ev.score,
      tags: ev.tags,
      detected_at: ev.detectedAt,
      last_checked_at: ev.lastCheckedAt
    };

    const res = await fetch(supabaseUrl + '/rest/v1/events', {
      method: 'POST',
      headers: {
        apikey: serviceKey,
        Authorization: 'Bearer ' + serviceKey,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=representation'
      },
      body: JSON.stringify(record)
    });

    console.log('✓ Ingested:', ev.title, '(', ev.startDate, ev.startTime, ') -> Status:', res.status);
  }

  // Update src/data/events.ts
  const eventsPath = './src/data/events.ts';
  let content = fs.readFileSync(eventsPath, 'utf8');
  const demoEventsMatch = content.match(/export const DEMO_EVENTS: AntiFOMOEvent\[\] = \[([\s\S]*?)\];/);
  if (demoEventsMatch) {
    const existingList = JSON.parse('[' + demoEventsMatch[1] + ']');
    const newSlugs = new Set(antiEvents.map(e => e.slug));
    const filtered = existingList.filter(e => !newSlugs.has(e.slug));
    const merged = [...antiEvents, ...filtered];
    
    const newContent = 'import { AntiFOMOEvent } from \'@/lib/types\';\n\nexport const DEMO_EVENTS: AntiFOMOEvent[] = ' + JSON.stringify(merged, null, 2) + ';\n';
    fs.writeFileSync(eventsPath, newContent, 'utf8');
    console.log('🎉 Updated src/data/events.ts with ' + merged.length + ' events total.');
  }
}

run();
