// ─────────────────────────────────────────────
// AntiFOMO — Smart URL Event Extractor Engine
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

  // 1. Try to find structured JSON-LD (Schema.org)
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
      // ignore json parse error
    }
  }

  // 2. Try to find Next.js __NEXT_DATA__
  let nextData: any = null;
  const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/i);
  if (nextDataMatch) {
    try {
      nextData = JSON.parse(nextDataMatch[1]);
    } catch {
      // ignore
    }
  }

  // 3. Extract Open Graph & Meta Tags
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

  // Headings
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const h2Match = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
  const h1Text = h1Match ? cleanHtmlText(h1Match[1]) : '';
  const h2Text = h2Match ? cleanHtmlText(h2Match[1]) : '';

  // Clean Title
  let title = h1Text || ogTitle || h2Text || 'Evento detectado';
  title = title
    .replace(/\s*\|\s*Teatro Pablo Tobón Uribe/gi, '')
    .replace(/\s*-\s*Teatro Pablo Tobon Uribe/gi, '')
    .replace(/\s*\|\s*Planetario de Medell[ií]n/gi, '')
    .replace(/\s*\|\s*Parque Explora/gi, '')
    .replace(/\s*\|\s*Luma/gi, '')
    .replace(/\s*\|\s*Eventbrite/gi, '')
    .replace(/\s*–\s*Teatro Pablo Tobón/gi, '')
    .trim();

  // Clean Description
  let description = ogDesc || '';
  if (!description || description.length < 15) {
    // Look for text in first descriptive paragraph
    const pMatches = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)];
    for (const pm of pMatches) {
      const cleaned = cleanHtmlText(pm[1]);
      if (cleaned.length > 25 && !cleaned.includes('Buscar') && !cleaned.includes('function') && !cleaned.includes('Copyright') && !cleaned.includes('Todos los derechos')) {
        description = cleaned;
        break;
      }
    }
  }

  // 4. Extract Date & Time
  let extractedDate = new Date().toISOString().split('T')[0];
  let extractedTime = '19:00';

  // Check Schema.org Event startDate
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
    if (eventObj?.name && !title) title = eventObj.name;
    if (eventObj?.description && !description) description = eventObj.description;
  }

  // Check NextData for CosmicJS or standard Next apps
  if (nextData?.props?.pageProps) {
    const pageProps = nextData.props.pageProps;
    const featured = pageProps.pageInfo?.featured?.[0] || pageProps.showData?.featured?.[0];
    if (featured) {
      if (featured.title) title = featured.title;
      if (featured.content) description = cleanHtmlText(featured.content);
      if (featured.metadata?.date) extractedDate = featured.metadata.date;
      if (featured.metadata?.hour) extractedTime = parseTimeString(featured.metadata.hour);
    }
  }

  // Search Date in HTML text if still default
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

  // 5. Detect Venue / Location
  let venue = 'Medellín';
  for (const v of KNOWN_VENUES) {
    if (v.match.test(urlObj.hostname) || v.match.test(fullContentToSearch)) {
      venue = v.name;
      break;
    }
  }

  // 6. Detect Price
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

  // 7. Detect Category
  const category = inferCategory(`${title} ${description} ${venue}`);

  return {
    title,
    description: description.slice(0, 300).trim(),
    date: extractedDate,
    time: extractedTime,
    venue,
    category,
    price,
    organizer: ogSiteName || venue || 'Organizador verificado',
    sourceUrl: targetUrl,
    imageUrl: ogImage || undefined,
  };
}

function parseTimeString(timeStr: string): string {
  const m = timeStr.match(/(\d{1,2}):(\d{2})\s*([ap]\.?\s*m\.?)/i);
  if (!m) return '19:00';
  let h = parseInt(m[1], 10);
  const min = m[2];
  const isPm = m[3].toLowerCase().includes('p');
  if (isPm && h < 12) h += 12;
  if (!isPm && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${min}`;
}

function inferCategory(text: string): Category {
  const t = text.toLowerCase();
  if (/astronom[ií]a|planetario|telescopio|f[ií]sica|biolog[ií]a|ciencia|c[oó]smic|universo|estrellas/i.test(t)) return 'ciencia';
  if (/software|tecnolog[ií]a|inteligencia artificial|\bia\b|hackathon|startup|coding|programaci[oó]n|ciberseguridad/i.test(t)) return 'tecnología';
  if (/teatro|obra|dramaturgia|puesta en escena|pantolocos|t[ií]teres|actuaci[oó]n|circo/i.test(t)) return 'teatro';
  if (/m[uú]sica|concierto|orquesta|sinf[oó]nica|jazz|rock|ac[uú]stico|banda|recital|guitarra|cumbia|vinilo/i.test(t)) return 'música';
  if (/danza|baile|ballet|coreograf[ií]a|molienda/i.test(t)) return 'performance';
  if (/cine|pel[ií]cula|cortometraje|documental|proyecci[oó]n|cineforo/i.test(t)) return 'cine';
  if (/arte|exposici[oó]n|galer[ií]a|museo|pintura|escultura|artes visuales/i.test(t)) return 'arte';
  if (/yoga|meditaci[oó]n|bienestar|sound healing|respiraci[oó]n|pilates/i.test(t)) return 'bienestar';
  if (/stand[\s-]?up|comedia|humor|comediante|risas|chistes/i.test(t)) return 'comedia';
  if (/taller|curso|workshop|laboratorio|aprende|clase de/i.test(t)) return 'talleres';
  if (/fiesta|club|after|dj set|electr[oó]nica|techno|noche/i.test(t)) return 'fiesta';
  if (/feria|mercado|bazar|artesanal|emprendimiento/i.test(t)) return 'mercados';
  if (/comunidad|charla|conversatorio|foro|encuentro/i.test(t)) return 'comunidad';
  if (/gastronom[ií]a|cocina|cata|vino|cerveza|caf[eé]/i.test(t)) return 'gastronomía';
  if (/poes[ií]a|libro|literatura|lectura|cuento/i.test(t)) return 'literatura';
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
