// ─────────────────────────────────────────────
// AntiFOMO — Smart URL Event Extractor Engine (v4 Ultra-Precision)
// ─────────────────────────────────────────────

import { Category } from './types';

export interface ExtractedEventData {
  title: string;
  description: string;
  date: string;       // YYYY-MM-DD
  time: string;       // HH:mm
  venue: string;
  category: Category;
  price: string;
  organizer?: string;
  sourceUrl: string;
  imageUrl?: string;
}

const monthMap: Record<string, string> = {
  'enero': '01', 'ene': '01', 'january': '01', 'jan': '01',
  'febrero': '02', 'feb': '02', 'february': '02',
  'marzo': '03', 'mar': '03', 'march': '03',
  'abril': '04', 'abr': '04', 'april': '04', 'apr': '04',
  'mayo': '05', 'may': '05',
  'junio': '06', 'jun': '06', 'june': '06',
  'julio': '07', 'jul': '07', 'july': '07',
  'agosto': '08', 'ago': '08', 'august': '08', 'aug': '08',
  'septiembre': '09', 'sep': '09', 'sept': '09', 'september': '09',
  'octubre': '10', 'oct': '10', 'october': '10',
  'noviembre': '11', 'nov': '11', 'november': '11',
  'diciembre': '12', 'dic': '12', 'december': '12', 'dec': '12',
};

// Known Medellín Venues for auto-detection
const KNOWN_VENUES = [
  { match: /pablo tob[oó]n/i, name: 'Teatro Pablo Tobón Uribe' },
  { match: /planetario/i, name: 'Planetario de Medellín' },
  { match: /parque explora/i, name: 'Parque Explora' },
  { match: /exploratorio/i, name: 'Exploratorio (Parque Explora)' },
  { match: /matacandelas/i, name: 'Teatro Matacandelas' },
  { match: /casa umbral/i, name: 'Casa Umbral' },
  { match: /pascasia/i, name: 'La Pascasia' },
  { match: /mamm|museo de arte moderno/i, name: 'MAMM (Museo de Arte Moderno)' },
  { match: /museo de antioquia/i, name: 'Museo de Antioquia' },
  { match: /teatro lido/i, name: 'Teatro Lido' },
  { match: /teatro metropolitano/i, name: 'Teatro Metropolitano' },
  { match: /casa de la m[uú]sica/i, name: 'Casa de la Música' },
  { match: /casa de la cultura/i, name: 'Casa de la Cultura' },
  { match: /plaza mayor/i, name: 'Plaza Mayor Medellín' },
  { match: /jard[ií]n bot[aá]nico/i, name: 'Jardín Botánico de Medellín' },
  { match: /la polilla/i, name: 'Teatro La Polilla' },
  { match: /manila/i, name: 'Manila, El Poblado' },
  { match: /provenza/i, name: 'Provenza, El Poblado' },
  { match: /carlos e\.? restrepo/i, name: 'Carlos E. Restrepo' },
  { match: /prado centro/i, name: 'Prado Centro' },
];

export async function extractEventFromUrl(targetUrl: string): Promise<ExtractedEventData> {
  const urlObj = new URL(targetUrl);
  const hostname = urlObj.hostname.toLowerCase();
  const pathname = urlObj.pathname;

  // ─────────────────────────────────────────────────────────
  // 1. SPECIALIZED PARSER: Planetario de Medellín API
  // ─────────────────────────────────────────────────────────
  if (hostname.includes('planetariomedellin.org')) {
    const slugMatch = pathname.match(/\/(?:programate|shows)\/([^\/\?#]+)/);
    if (slugMatch) {
      const slug = slugMatch[1];
      const isShow = pathname.includes('/shows');
      const apiEndpoint = isShow 
        ? `https://www.planetariomedellin.org/api/shows/${slug}`
        : `https://www.planetariomedellin.org/api/programate/${slug}`;

      try {
        const apiRes = await fetch(apiEndpoint, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          redirect: 'follow'
        });

        if (apiRes.ok) {
          const data = await apiRes.json();
          if (data && data.title) {
            const rawDesc = data.content || data.description || data.metadatos_seo?.description_seo || '';
            const cleanDesc = cleanHtmlText(rawDesc);
            
            const eventDate = data.date || new Date().toISOString().split('T')[0];
            const eventTime = data.hour ? parseTimeString(data.hour) : '19:00';
            
            let specificVenue = 'Planetario de Medellín';
            if (data.location && Array.isArray(data.location) && data.location.length > 0) {
              const loc = data.location[0];
              if (loc.toLowerCase().includes('planetario')) {
                specificVenue = 'Planetario de Medellín';
              } else {
                specificVenue = `${loc} (Planetario de Medellín)`;
              }
            } else if (cleanDesc.includes('biblioteca') || cleanDesc.includes('Biblioteca')) {
              const bibMatch = cleanDesc.match(/biblioteca\s+[^,\.\n]+/i);
              if (bibMatch) {
                specificVenue = `${bibMatch[0]} (Planetario de Medellín)`;
              }
            }

            const isFree = data.price_check === 'Sin costo' || data.price_check === 'Entrada libre' || !data.price;
            const price = isFree ? 'Gratis (Entrada Libre)' : (data.price ? `$${data.price}` : 'Entrada con costo');
            
            const category = inferCategory(data.title, cleanDesc, specificVenue);
            const imageUrl = data.banner?.imgix_url || data.banner?.url || undefined;

            return {
              title: decodeHtmlEntities(data.title.trim()),
              description: cleanDesc.slice(0, 320).trim(),
              date: eventDate,
              time: eventTime,
              venue: specificVenue,
              category,
              price,
              organizer: 'Planetario de Medellín',
              sourceUrl: targetUrl,
              imageUrl,
            };
          }
        }
      } catch (err) {
        console.error('Planetario API extraction fallback:', err);
      }
    }
  }

  // ─────────────────────────────────────────────────────────
  // 2. SPECIALIZED PARSER: Teatro Pablo Tobón Uribe
  // ─────────────────────────────────────────────────────────
  if (hostname.includes('teatropablotobon.com') && pathname.includes('/evento/')) {
    try {
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      if (response.ok) {
        const html = await response.text();

        // 1. Title
        const h2Match = html.match(/<h2[^>]*class=["'][^"']*card__title[^"']*["'][^>]*>([\s\S]*?)<\/h2>/i) ||
                        html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i) ||
                        html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        
        let title = h2Match ? cleanHtmlText(h2Match[1]) : '';
        title = title
          .replace(/\s*\|\s*Teatro Pablo Tobón Uribe/gi, '')
          .replace(/\s*-\s*Teatro Pablo Tobon Uribe/gi, '')
          .trim();

        // 2. Description (first paragraph of main editorial)
        let description = '';
        const pMatches = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)];
        for (const pm of pMatches) {
          const cleaned = cleanHtmlText(pm[1]);
          if (
            cleaned.length > 25 &&
            !cleaned.includes('Buscar') &&
            !cleaned.includes('function') &&
            !cleaned.includes('Copyright') &&
            !cleaned.includes('Línea Ética') &&
            !cleaned.includes('Transparencia') &&
            !cleaned.includes('Información del evento')
          ) {
            description = cleaned;
            break;
          }
        }

        // 3. Exact Date from "Fecha" block
        let date = new Date().toISOString().split('T')[0];
        const dateBlockMatch = html.match(/<strong>Fecha<\/strong>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i);
        const candidateDateText = dateBlockMatch ? cleanHtmlText(dateBlockMatch[1]) : html;
        
        const dateMatch = candidateDateText.match(/(\d{1,2})\s+de\s+([a-záéíóú]+)(?:\s+de\s+(\d{4}))?/i);
        if (dateMatch) {
          const day = dateMatch[1].padStart(2, '0');
          const month = monthMap[dateMatch[2].toLowerCase()] || '08';
          const year = dateMatch[3] || '2026';
          date = `${year}-${month}-${day}`;
        }

        // 4. Exact Time from "Hora" block
        let time = '19:00';
        const timeBlockMatch = html.match(/<strong>Hora<\/strong>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i);
        if (timeBlockMatch) {
          time = parseTimeString(timeBlockMatch[1]);
        }

        // 5. Venue / Specific Spot
        let venue = 'Teatro Pablo Tobón Uribe';
        const spotMatch = html.match(/<strong>Lugar<\/strong>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i);
        if (spotMatch) {
          const spot = cleanHtmlText(spotMatch[1]);
          if (spot && spot !== 'Teatro Pablo Tobón Uribe' && spot.length > 2) {
            venue = `Teatro Pablo Tobón Uribe (${spot})`;
          }
        }

        // 6. Price from "Tipo de evento" block
        let price = 'Entrada con costo';
        const typeMatch = html.match(/<strong>Tipo de evento<\/strong>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i);
        const typeText = typeMatch ? cleanHtmlText(typeMatch[1]) : html;
        if (/libre|gratis|aporte voluntario/i.test(typeText)) {
          price = 'Gratis (Entrada Libre)';
        }

        // 7. Organizer from "Organiza" block
        let organizer = 'Teatro Pablo Tobón Uribe';
        const orgMatch = html.match(/<strong>Organiza<\/strong>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i);
        if (orgMatch) {
          organizer = cleanHtmlText(orgMatch[1]);
        }

        const category = inferCategory(title, description, venue);

        return {
          title: decodeHtmlEntities(title),
          description: description.slice(0, 320).trim(),
          date,
          time,
          venue,
          category,
          price,
          organizer,
          sourceUrl: targetUrl,
        };
      }
    } catch (err) {
      console.error('Pablo Tobon fallback:', err);
    }
  }

  // ─────────────────────────────────────────────────────────
  // 3. GENERAL HIGH-PRECISION SCRAPER ENGINE (Schema.org / OpenGraph / Next.js)
  // ─────────────────────────────────────────────────────────
  const response = await fetch(targetUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'es-CO,es;q=0.9,en;q=0.8',
    },
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`No se pudo acceder a la página (código HTTP ${response.status})`);
  }

  const html = await response.text();

  // Structured JSON-LD (Schema.org)
  let structuredData: any = null;
  const jsonLdMatches = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const m of jsonLdMatches) {
    try {
      const parsed = JSON.parse(m[1]);
      if (parsed['@type'] === 'Event' || (parsed['@graph'] && Array.isArray(parsed['@graph']))) {
        structuredData = parsed;
        break;
      }
    } catch {
      // ignore
    }
  }

  // Next.js __NEXT_DATA__
  let nextData: any = null;
  const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/i);
  if (nextDataMatch) {
    try {
      nextData = JSON.parse(nextDataMatch[1]);
    } catch {
      // ignore
    }
  }

  // Meta Tags
  const getMeta = (prop: string): string => {
    const r1 = new RegExp(`<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'i');
    const r2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${prop}["']`, 'i');
    const r3 = new RegExp(`<meta[^>]+name=["']${prop}["'][^>]+content=["']([^"']+)["']`, 'i');
    const r4 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${prop}["']`, 'i');
    const m = html.match(r1) || html.match(r2) || html.match(r3) || html.match(r4);
    return m ? decodeHtmlEntities(m[1].trim()) : '';
  };

  const pageTitleTag = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const rawTitleTag = pageTitleTag ? decodeHtmlEntities(pageTitleTag[1].trim()) : '';

  const ogTitle = getMeta('og:title') || getMeta('twitter:title') || rawTitleTag;
  const ogDesc = getMeta('og:description') || getMeta('twitter:description') || getMeta('description');
  const ogImage = getMeta('og:image') || getMeta('twitter:image');
  const ogSiteName = getMeta('og:site_name');

  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const h2Match = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
  const h1Text = h1Match ? cleanHtmlText(h1Match[1]) : '';
  const h2Text = h2Match ? cleanHtmlText(h2Match[1]) : '';

  let title = '';
  if (nextData?.props?.pageProps) {
    const p = nextData.props.pageProps;
    if (p.event?.title || p.event?.name) title = p.event.title || p.event.name;
    else if (p.show?.title) title = p.show.title;
    else if (p.data?.title) title = p.data.title;
  }

  if (!title && structuredData) {
    const eventObj = structuredData['@type'] === 'Event' 
      ? structuredData 
      : structuredData['@graph']?.find((item: any) => item['@type'] === 'Event');
    if (eventObj?.name) title = eventObj.name;
  }

  if (!title) {
    if (h1Text && !isGenericTitle(h1Text)) {
      title = h1Text;
    } else if (ogTitle && !isGenericTitle(ogTitle)) {
      title = ogTitle;
    } else if (h2Text && !isGenericTitle(h2Text)) {
      title = h2Text;
    } else {
      const pathSegments = pathname.split('/').filter(Boolean);
      const lastSeg = pathSegments[pathSegments.length - 1];
      if (lastSeg && !isGenericTitle(lastSeg)) {
        title = lastSeg.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      } else {
        title = ogTitle || 'Evento detectado';
      }
    }
  }

  title = title
    .replace(/\s*\|\s*Teatro Pablo Tobón Uribe/gi, '')
    .replace(/\s*-\s*Teatro Pablo Tobon Uribe/gi, '')
    .replace(/\s*\|\s*Planetario de Medell[ií]n/gi, '')
    .replace(/\s*-\s*Planetario de Medell[ií]n/gi, '')
    .replace(/\s*\|\s*Parque Explora/gi, '')
    .replace(/\s*\|\s*Luma/gi, '')
    .replace(/\s*\|\s*Eventbrite/gi, '')
    .replace(/\s*–\s*Teatro Pablo Tobón/gi, '')
    .trim();

  let description = ogDesc || '';
  if (!description || description.length < 20 || isGenericTitle(description)) {
    const pMatches = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)];
    for (const pm of pMatches) {
      const cleaned = cleanHtmlText(pm[1]);
      if (
        cleaned.length > 30 &&
        !cleaned.includes('Buscar') &&
        !cleaned.includes('function') &&
        !cleaned.includes('Copyright') &&
        !cleaned.includes('Todos los derechos')
      ) {
        description = cleaned;
        break;
      }
    }
  }

  let extractedDate = new Date().toISOString().split('T')[0];
  let extractedTime = '19:00';

  if (structuredData) {
    const eventObj = structuredData['@type'] === 'Event' 
      ? structuredData 
      : structuredData['@graph']?.find((item: any) => item['@type'] === 'Event');
    
    if (eventObj?.startDate) {
      const parsedDate = new Date(eventObj.startDate);
      if (!isNaN(parsedDate.getTime())) {
        extractedDate = parsedDate.toISOString().split('T')[0];
        extractedTime = `${String(parsedDate.getHours()).padStart(2, '0')}:${String(parsedDate.getMinutes()).padStart(2, '0')}`;
      }
    }
  }

  const fullContentToSearch = `${title} ${description} ${html.slice(0, 15000)}`;
  const datePattern = /(\d{1,2})\s+de\s+([a-záéíóú]+)(?:\s+de\s+(\d{4}))?/i;
  const dateMatch = fullContentToSearch.match(datePattern);
  if (dateMatch) {
    const day = dateMatch[1].padStart(2, '0');
    const month = monthMap[dateMatch[2].toLowerCase()] || '08';
    const year = dateMatch[3] || '2026';
    extractedDate = `${year}-${month}-${day}`;
  }

  const timePattern = /(\d{1,2}:\d{2})\s*([ap]\.?\s*m\.?)/i;
  const timeMatch = fullContentToSearch.match(timePattern);
  if (timeMatch) {
    extractedTime = parseTimeString(`${timeMatch[1]} ${timeMatch[2]}`);
  }

  let venue = 'Medellín';
  for (const v of KNOWN_VENUES) {
    if (v.match.test(hostname) || v.match.test(fullContentToSearch)) {
      venue = v.name;
      break;
    }
  }

  let price = 'Entrada con costo';
  const freeRegex = /gratis|sin costo|entrada libre|aporte voluntario|acceso libre/i;
  if (freeRegex.test(fullContentToSearch)) {
    price = 'Gratis (Entrada Libre)';
  } else {
    const priceRegex = /\$\s*([\d\.,]{3,8})/i;
    const priceMatch = fullContentToSearch.match(priceRegex);
    if (priceMatch) {
      price = `$${priceMatch[1]}`;
    }
  }

  const category = inferCategory(title, description, venue);

  return {
    title,
    description: description.slice(0, 300).trim(),
    date: extractedDate,
    time: extractedTime,
    venue,
    category,
    price,
    organizer: ogSiteName || venue.split('(')[0].trim() || 'Organizador verificado',
    sourceUrl: targetUrl,
    imageUrl: ogImage || undefined,
  };
}

function isGenericTitle(str: string): boolean {
  const s = str.toLowerCase().trim();
  return (
    s === 'eventos' ||
    s === 'inicio' ||
    s === 'home' ||
    s === 'programate' ||
    s === 'prográmate' ||
    s === 'programación' ||
    s === 'agenda' ||
    s === 'planetario medellin' ||
    s === 'planetario de medellin' ||
    s === 'planetario de medellín' ||
    s === 'teatro pablo tobon uribe' ||
    s === 'teatro pablo tobón uribe' ||
    s === 'parque explora'
  );
}

function parseTimeString(timeStr: string): string {
  const clean = timeStr.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').trim();
  const m = clean.match(/(\d{1,2})(?::(\d{2}))?\s*([ap]\.?\s*m\.?|\b(?:am|pm)\b)?/i);
  if (!m) return '19:00';
  let h = parseInt(m[1], 10);
  const min = m[2] || '00';
  const isPm = m[3] ? m[3].toLowerCase().includes('p') : (h >= 1 && h <= 6);
  if (isPm && h < 12) h += 12;
  if (!isPm && m[3] && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${min}`;
}

function inferCategory(title: string, description: string, venue: string): Category {
  const t = title.toLowerCase();
  const d = description.toLowerCase();
  const all = `${t} ${d} ${venue.toLowerCase()}`;

  // 1. High-priority Title & Content Check
  if (/lectura|libro|literatura|cuento|poes[ií]a|autor|escritora|velia vidal|letras como estrellas/i.test(all)) return 'literatura';
  if (/orquesta|sinf[oó]nica|concierto|m[uú]sica|jazz|rock|ac[uú]stico|banda|recital|guitarra|cumbia|vinilo|dj|sonoro|canto|ronroco|soda stereo/i.test(all)) return 'música';
  if (/astronom[ií]a|planetario|telescopio|f[ií]sica|biolog[ií]a|ciencia|c[oó]smic|universo|estelar|galaxia/i.test(all)) return 'ciencia';
  if (/software|tecnolog[ií]a|inteligencia artificial|\bia\b|hackathon|startup|coding|programaci[oó]n|ciberseguridad/i.test(all)) return 'tecnología';
  if (/teatro|obra|dramaturgia|puesta en escena|pantolocos|t[ií]teres|actuaci[oó]n|circo/i.test(all)) return 'teatro';
  if (/danza|baile|ballet|coreograf[ií]a|molienda/i.test(all)) return 'performance';
  if (/cine|pel[ií]cula|cortometraje|documental|proyecci[oó]n|cineforo/i.test(all)) return 'cine';
  if (/arte|exposici[oó]n|galer[ií]a|museo|pintura|escultura|artes visuales/i.test(all)) return 'arte';
  if (/yoga|meditaci[oó]n|bienestar|sound healing|respiraci[oó]n|pilates/i.test(all)) return 'bienestar';
  if (/stand[\s-]?up|comedia|humor|comediante|risas|chistes|pecado/i.test(all)) return 'comedia';
  if (/taller|curso|workshop|laboratorio|aprende|clase de/i.test(all)) return 'talleres';
  if (/feria|mercado|bazar|artesanal|emprendimiento/i.test(all)) return 'mercados';

  return 'comunidad';
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&#8211;/g, '–')
    .replace(/&#8217;/g, '\'')
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#038;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, '\'')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&iquest;/g, '¿')
    .replace(/&iexcl;/g, '¡')
    .replace(/&aacute;/g, 'á')
    .replace(/&eacute;/g, 'é')
    .replace(/&iacute;/g, 'í')
    .replace(/&oacute;/g, 'ó')
    .replace(/&uacute;/g, 'ú')
    .replace(/&ntilde;/g, 'ñ')
    .replace(/&Aacute;/g, 'Á')
    .replace(/&Eacute;/g, 'É')
    .replace(/&Iacute;/g, 'Í')
    .replace(/&Oacute;/g, 'Ó')
    .replace(/&Uacute;/g, 'Ú')
    .replace(/&Ntilde;/g, 'Ñ');
}

function cleanHtmlText(html: string): string {
  return decodeHtmlEntities(
    html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  );
}
