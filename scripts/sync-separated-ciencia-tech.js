const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hiadblaoxgfbfceiwqbo.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpYWRibGFveGdmYmZjZWl3cWJvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Njk4NTk5MywiZXhwIjoyMTAyNTYxOTkzfQ.NfXTOjdPQm8lCTPpYej-ILf5yX8FatHNDiQvMODYLKI';

const SEPARATED_EVENTS = [
  // ─── CIENCIA ───
  {
    id: "ciencia-01",
    slug: "noche-de-astronomia-y-domo-360-planetario-medellin",
    title: "Noche de Astronomía y Proyección Fulldome en el Domo 360°",
    shortDescription: "Observación con telescopios, astrofotografía y viaje inmersivo por el cosmos en el Planetario de Medellín.",
    longDescription: "Una jornada nocturna dedicada a la ciencia y la astronomía en el Planetario de Medellín. Incluye proyección fulldome 360° de alta resolución sobre la estructura del universo observable y los exoplanetas, seguida de una sesión de observación astronómica con telescopios ópticos en la terraza guiada por astrónomos y divulgadores científicos.",
    startDate: "2026-08-17",
    startTime: "18:30",
    venue: "Planetario de Medellín",
    neighborhood: "Aranjuez",
    city: "Medellín",
    latitude: 6.2711,
    longitude: -75.5661,
    category: "ciencia",
    priceType: "paid",
    priceMin: 24000,
    currency: "COP",
    organizer: "Planetario de Medellín / Parque Explora",
    sources: [
      {
        type: "web",
        label: "Parque Explora / Planetario",
        url: "https://www.parqueexplora.org/planetario"
      }
    ],
    sourceCount: 2,
    verified: true,
    isGem: true,
    isNewlyFound: true,
    detectedAt: "2026-08-17T12:00:00-05:00",
    lastCheckedAt: "2026-08-17T17:00:00-05:00",
    tags: ["astronomía", "domo 360", "ciencia", "telescopios", "espacio"],
    score: 98
  },
  {
    id: "ciencia-02",
    slug: "simposio-biotecnologia-hongos-y-biomateriales-udea",
    title: "Simposio de Biotecnología Fúngica y Biomateriales del Futuro",
    shortDescription: "Investigación sobre micelio como sustituto ecológico del plástico y cuero sintético en la UdeA.",
    longDescription: "Biólogos e ingenieros de materiales presentan los últimos avances en el cultivo de cepas de hongos nativos de Antioquia para el desarrollo de empaques biodegradables, aislamiento térmico y materiales constructivos regenerativos. Incluye muestra táctil de paneles de micelio y protocolos de cultivo estéril.",
    startDate: "2026-08-23",
    startTime: "10:00",
    venue: "Sede de Investigación Universitaria (SIU) — UdeA",
    neighborhood: "Centro",
    city: "Medellín",
    latitude: 6.2635,
    longitude: -75.5689,
    category: "ciencia",
    priceType: "free",
    currency: "COP",
    organizer: "Grupo de Biotecnología y Materiales UdeA",
    sources: [
      {
        type: "web",
        label: "SIU Universidad de Antioquia",
        url: "https://www.udea.edu.co"
      }
    ],
    sourceCount: 2,
    verified: true,
    isGem: true,
    isNewlyFound: true,
    detectedAt: "2026-08-17T15:00:00-05:00",
    lastCheckedAt: "2026-08-17T17:00:00-05:00",
    tags: ["biotecnologia", "hongos", "biomateriales", "udea", "ciencia"],
    score: 98
  },
  {
    id: "ciencia-03",
    slug: "observacion-solar-h-alfa-parque-explora",
    title: "Observación Solar con Telescopios de Hidrógeno Alfa",
    shortDescription: "Visualización de llamaradas solares, manchas y granulaciones en la plaza abierta de Parque Explora.",
    longDescription: "Taller al aire libre de divulgación astronómica en el que los asistentes observan la cromosfera solar en tiempo real utilizando filtros H-Alfa de banda estrecha. Divulgadores científicos explican la física de las eyecciones de masa coronal y el ciclo solar de 11 años.",
    startDate: "2026-08-20",
    startTime: "11:00",
    venue: "Plaza Pública Parque Explora",
    neighborhood: "Aranjuez",
    city: "Medellín",
    latitude: 6.2708,
    longitude: -75.5658,
    category: "ciencia",
    priceType: "free",
    currency: "COP",
    organizer: "Sociedad Julio Garavito de Astronomía",
    sources: [
      {
        type: "web",
        label: "Parque Explora",
        url: "https://www.parqueexplora.org"
      }
    ],
    sourceCount: 2,
    verified: true,
    isGem: true,
    isNewlyFound: true,
    detectedAt: "2026-08-17T15:00:00-05:00",
    lastCheckedAt: "2026-08-17T17:00:00-05:00",
    tags: ["astronomia", "sol", "telescopios", "ciencia", "explora"],
    score: 95
  },
  {
    id: "ciencia-04",
    slug: "coloquio-neurociencia-memoria-y-lenguaje-udea",
    title: "Coloquio de Neurociencia, Memoria y Plasticidad Cerebral",
    shortDescription: "Debate científico sobre neuroplasticidad, sinapsis y cómo el cerebro procesa el lenguaje y la música.",
    longDescription: "Encuentro de divulgación neurocientífica en el auditorio de la Facultad de Medicina. Investigadores de neurobiología exponen sobre la formación de recuerdos, la recuperación funcional tras lesiones y el impacto de los patrones rítmicos en la corteza auditiva.",
    startDate: "2026-08-22",
    startTime: "14:30",
    venue: "Facultad de Medicina — UdeA",
    neighborhood: "Centro",
    city: "Medellín",
    latitude: 6.2625,
    longitude: -75.5670,
    category: "ciencia",
    priceType: "free",
    currency: "COP",
    organizer: "Grupo de Neurociencias de Antioquia (GNA)",
    sources: [
      {
        type: "web",
        label: "UdeA Medicina",
        url: "https://www.udea.edu.co"
      }
    ],
    sourceCount: 2,
    verified: true,
    isGem: true,
    isNewlyFound: false,
    detectedAt: "2026-08-17T14:00:00-05:00",
    lastCheckedAt: "2026-08-17T17:00:00-05:00",
    tags: ["neurociencia", "cerebro", "medicina", "udea", "ciencia"],
    score: 94
  },

  // ─── TECNOLOGÍA ───
  {
    id: "tech-01",
    slug: "conversatorio-inteligencia-artificial-y-datos-abiertos-parque-explora",
    title: "Inteligencia Artificial y Datos Abiertos para la Ciudad",
    shortDescription: "Conversatorio sobre modelos de lenguaje, ética algorítmica y ciencia de datos ciudadana en el Exploratorio.",
    longDescription: "El Exploratorio de Parque Explora invita a investigadores, tecnólogos y ciudadanía a debatir el impacto de los sistemas de Inteligencia Artificial generativa en la cultura, la toma de decisiones urbanas y la soberanía tecnológica. Se presentarán casos reales de análisis de datos abiertos en Medellín y herramientas libres para experimentación.",
    startDate: "2026-08-18",
    startTime: "17:00",
    venue: "Exploratorio — Parque Explora",
    neighborhood: "Aranjuez",
    city: "Medellín",
    latitude: 6.2705,
    longitude: -75.5652,
    category: "tecnología",
    priceType: "free",
    currency: "COP",
    organizer: "Exploratorio Taller Público",
    sources: [
      {
        type: "web",
        label: "Exploratorio Parque Explora",
        url: "https://www.parqueexplora.org/exploratorio"
      }
    ],
    sourceCount: 2,
    verified: true,
    isGem: true,
    isNewlyFound: true,
    detectedAt: "2026-08-17T12:30:00-05:00",
    lastCheckedAt: "2026-08-17T17:00:00-05:00",
    tags: ["inteligencia artificial", "datos abiertos", "software libre", "explora", "tecnologia"],
    score: 97
  },
  {
    id: "tech-02",
    slug: "meetup-python-ai-agentes-autonomos-rutan",
    title: "Meetup Python Medellín: Agentes Autónomos y Modelos Locales",
    shortDescription: "Charlas técnicas de desarrollo con Python, LLMs locales y despliegue de agentes en el Complejo Ruta N.",
    longDescription: "Encuentro mensual de la comunidad de Python y Machine Learning de Medellín. En esta edición exploraremos la construcción de agentes autónomos con herramientas open-source, ejecución de modelos locales y optimización de pipelines de datos en servidores de alto rendimiento. Espacio abierto para networking y preguntas y respuestas.",
    startDate: "2026-08-19",
    startTime: "18:30",
    venue: "Complejo Ruta N (Auditorio Principal)",
    neighborhood: "Centro",
    city: "Medellín",
    latitude: 6.2647,
    longitude: -75.5681,
    category: "tecnología",
    priceType: "free",
    currency: "COP",
    organizer: "Python Medellín & Ruta N",
    sources: [
      {
        type: "web",
        label: "Ruta N Medellín",
        url: "https://www.rutanmedellin.org"
      }
    ],
    sourceCount: 3,
    verified: true,
    isGem: false,
    isNewlyFound: true,
    detectedAt: "2026-08-17T13:00:00-05:00",
    lastCheckedAt: "2026-08-17T17:00:00-05:00",
    tags: ["python", "inteligencia artificial", "ruta n", "programacion", "tecnologia"],
    score: 95
  },
  {
    id: "tech-03",
    slug: "taller-fabricacion-digital-e-impresion-3d-fablab",
    title: "Taller Práctico de Fabricación Digital e Impresión 3D",
    shortDescription: "Aprende diseño paramétrico en CAD, corte láser y manejo de impresoras 3D en el laboratorio FabLab.",
    longDescription: "Sesión intensiva para aprender a prototipar objetos físicos utilizando tecnologías de manufactura aditiva y corte por control numérico. Desde la concepción en software CAD paramétrico hasta la calibración y extrusión en impresoras FDM y SLA. Cupos limitados para garantizar estaciones individuales de trabajo.",
    startDate: "2026-08-20",
    startTime: "15:00",
    venue: "FabLab Medellín / ITM Boston",
    neighborhood: "Centro",
    city: "Medellín",
    latitude: 6.2425,
    longitude: -75.5562,
    category: "tecnología",
    priceType: "free",
    currency: "COP",
    organizer: "FabLab Medellín",
    sources: [
      {
        type: "web",
        label: "FabLab Medellín",
        url: "https://fablabmedellin.org"
      }
    ],
    sourceCount: 2,
    verified: true,
    isGem: true,
    isNewlyFound: false,
    detectedAt: "2026-08-17T10:00:00-05:00",
    lastCheckedAt: "2026-08-17T17:00:00-05:00",
    tags: ["impresion 3d", "fabricacion digital", "maker", "corte laser", "tecnologia"],
    score: 94
  },
  {
    id: "tech-04",
    slug: "creative-coding-shaders-glsl-arte-generativo-casa-umbral",
    title: "Laboratorio de Código Creativo y Shaders GLSL",
    shortDescription: "Taller de programación gráfica interactiva y matemáticas visuales para artistas digitales y desarrolladores.",
    longDescription: "Aprende a programar la GPU directamente con fragment shaders en GLSL y JavaScript (Three.js/p5.js). Exploraremos algoritmos de ruido Simplex, fractales de Mandelbrot y deformaciones de mallas poligonales en tiempo real para visuales de directo y proyecciones mapeadas. No requiere matemáticas avanzadas.",
    startDate: "2026-08-21",
    startTime: "18:00",
    venue: "Casa Umbral",
    neighborhood: "Centro",
    city: "Medellín",
    latitude: 6.2476,
    longitude: -75.5658,
    category: "tecnología",
    priceType: "paid",
    priceMin: 30000,
    currency: "COP",
    organizer: "Colectivo Código y Arte Medellín",
    sources: [
      {
        type: "instagram",
        label: "Instagram @casaumbral",
        url: "https://www.instagram.com/casaumbral/"
      }
    ],
    sourceCount: 2,
    verified: true,
    isGem: true,
    isNewlyFound: true,
    detectedAt: "2026-08-17T14:00:00-05:00",
    lastCheckedAt: "2026-08-17T17:00:00-05:00",
    tags: ["creative coding", "glsl", "arte generativo", "programacion", "shaders", "tecnologia"],
    score: 96
  },
  {
    id: "tech-05",
    slug: "noche-de-robotica-educativa-y-drones-laureles",
    title: "Demostración de Drones Autónomos y Robótica Abierta",
    shortDescription: "Showcase de robots bípedos, controladores de vuelo DIY y visión por computador en Laureles.",
    longDescription: "Una tarde-noche interactiva donde ingenieros, makers y entusiastas muestran sus proyectos de robótica móvil, vehículos aéreos no tripulados configurados con ArduPilot y sistemas de navegación autónoma por visión artificial (OpenCV). Actividad apta para todas las edades.",
    startDate: "2026-08-22",
    startTime: "16:00",
    venue: "MakerSpace Laureles",
    neighborhood: "Laureles",
    city: "Medellín",
    latitude: 6.2452,
    longitude: -75.5921,
    category: "tecnología",
    priceType: "free",
    currency: "COP",
    organizer: "Club de Robótica Antioquia",
    sources: [
      {
        type: "web",
        label: "MakerSpace Laureles",
        url: "https://makerspacemedellin.co"
      }
    ],
    sourceCount: 2,
    verified: true,
    isGem: false,
    isNewlyFound: false,
    detectedAt: "2026-08-17T11:00:00-05:00",
    lastCheckedAt: "2026-08-17T17:00:00-05:00",
    tags: ["robotica", "drones", "makerspace", "laureles", "ingenieria", "tecnologia"],
    score: 92
  },
  {
    id: "tech-06",
    slug: "hackathon-de-hardware-esp32-iot-rionegro-valle-de-san-nicolas",
    title: "Encuentro IoT & Hardware ESP32 para el Agro en Rionegro",
    shortDescription: "Sensores de suelo, estaciones meteorológicas LoRaWAN y telemetría rural en el Oriente Antioqueño.",
    longDescription: "Hackday enfocado en el diseño de nodos de telemetría de bajo consumo con microcontroladores ESP32 y redes LoRaWAN para el monitoreo de cultivos hidropónicos, humedad de suelos y microclimas agrícolas en el Oriente Antioqueño. Se facilitan kits de desarrollo y sensores para los participantes.",
    startDate: "2026-08-24",
    startTime: "09:00",
    venue: "Centro de Innovación y Tecnología de Rionegro",
    neighborhood: "Rionegro",
    city: "Rionegro",
    latitude: 6.1551,
    longitude: -75.3736,
    category: "tecnología",
    priceType: "free",
    currency: "COP",
    organizer: "Comunidad Tech Oriente Antioqueño",
    sources: [
      {
        type: "web",
        label: "Oriente Tech Hub",
        url: "https://agendaoriente.com"
      }
    ],
    sourceCount: 2,
    verified: true,
    isGem: true,
    isNewlyFound: true,
    detectedAt: "2026-08-17T15:30:00-05:00",
    lastCheckedAt: "2026-08-17T17:00:00-05:00",
    tags: ["iot", "hardware", "esp32", "rionegro", "oriente", "agricultura tech", "tecnologia"],
    score: 95
  }
];

async function run() {
  console.log(`Synchronizing ${SEPARATED_EVENTS.length} events for Ciencia and Tecnología...`);

  // 1. Read existing events.ts
  const eventsPath = path.join(__dirname, '../src/data/events.ts');
  const eventsContent = fs.readFileSync(eventsPath, 'utf8');

  // Parse existing JSON array
  const equalsIndex = eventsContent.indexOf('=');
  const startIndex = eventsContent.indexOf('[', equalsIndex);
  const endIndex = eventsContent.lastIndexOf(']');
  if (startIndex === -1 || endIndex === -1) {
    throw new Error('Could not parse DEMO_EVENTS array');
  }

  const existingJson = eventsContent.substring(startIndex, endIndex + 1);
  const existingEvents = JSON.parse(existingJson);

  // Filter out any duplicates
  const newIds = new Set(SEPARATED_EVENTS.map(e => e.id));
  const newSlugs = new Set(SEPARATED_EVENTS.map(e => e.slug));
  const filteredExisting = existingEvents.filter(e => !newIds.has(e.id) && !newSlugs.has(e.slug) && e.category !== 'ciencia-tecnologia');

  const allEvents = [...SEPARATED_EVENTS, ...filteredExisting];

  // Write back to events.ts
  const newContent = `import type { AntiFOMOEvent } from '@/lib/types';\n\nexport const DEMO_EVENTS: AntiFOMOEvent[] = ${JSON.stringify(allEvents, null, 2)};\n`;
  fs.writeFileSync(eventsPath, newContent, 'utf8');
  console.log(`✓ Updated events.ts. Total events: ${allEvents.length}`);

  // 2. Upsert to Supabase via REST
  try {
    for (const event of SEPARATED_EVENTS) {
      const dbEvent = {
        slug: event.slug,
        title: event.title,
        short_description: event.shortDescription,
        long_description: event.longDescription,
        start_date: event.startDate,
        start_time: event.startTime,
        venue: event.venue,
        neighborhood: event.neighborhood,
        city: event.city,
        latitude: event.latitude,
        longitude: event.longitude,
        category: event.category,
        price_type: event.priceType,
        price_min: event.priceMin || null,
        price_max: event.priceMax || null,
        currency: event.currency,
        organizer: event.organizer,
        is_gem: event.isGem,
        is_newly_found: event.isNewlyFound,
        verified: event.verified,
        score: event.score,
        tags: event.tags,
        sources: event.sources,
        source_count: event.sourceCount,
        detected_at: event.detectedAt,
        last_checked_at: event.lastCheckedAt,
        updated_at: new Date().toISOString()
      };

      const res = await fetch(`${SUPABASE_URL}/rest/v1/events?on_conflict=slug`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify(dbEvent)
      });

      if (res.ok) {
        console.log(`✓ Upserted to Supabase (${event.category}): ${event.title}`);
      } else {
        const txt = await res.text();
        console.warn(`Supabase error for ${event.slug}:`, txt);
      }
    }
  } catch (err) {
    console.warn('Supabase sync warning:', err.message);
  }

  console.log('Finished updating separated categories!');
}

run();
