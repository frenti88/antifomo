# ◉ AntiFOMO — El Radar Cultural de Medellín

> **Encuentra lo que no sabías que estaba pasando.**
> El radar cultural y de planes independientes para Medellín, el Valle de Aburrá y el Oriente Antioqueño.

[![Next.js](https://img.shields.io/badge/Next.js-16.3-black?style=flat&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ecf8e?style=flat&logo=supabase)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=flat&logo=vercel)](https://antifomo-app.vercel.app)
[![Events](https://img.shields.io/badge/Active%20Events-594-D7FF3F?style=flat&labelColor=111111)](https://antifomo-app.vercel.app)

---

## 📍 ¿Qué es AntiFOMO?

**AntiFOMO** es un radar cultural anti-algoritmo diseñado para descubrir eventos, conciertos, teatro, cineclubes, exposiciones de arte, poesía, talleres y fiestas alternativas en Medellín y sus alrededores sin la fricción de redes sociales saturadas de publicidad o imágenes pesadas.

### 🎯 Principios de Diseño
- **Escaneabilidad Radical**: La información esencial se procesa en menos de 2 segundos (**Hora ➔ Título ➔ Lugar · Barrio ➔ Entrada / Badges**).
- **Cero Imágenes Distractoras en Listados**: Las tarjetas y filas se enfocan en tipografía pura, iconos contextuales y microdatos.
- **Detector de Joyitas (◉)**: Curaduría automatizada de planes fuera del circuito masivo tradicional.
- **Verificación Multi-fuente**: Cruzado de datos entre organizadores, colectivos independientes y plataformas oficiales.

---

## 🏛️ Cobertura y Fuentes Integradas (594 Eventos)

AntiFOMO rastrea e indexa de forma continua las siguientes plataformas y espacios culturales:

1. **[Eventario](https://eventario.co)**: Planes culturales, conciertos de autor, ferias y lanzamientos en el Valle de Aburrá.
2. **[Compás Urbano](https://www.compasurbano.com/eventos)**: Agenda urbana, artes escénicas, música independiente y talleres.
3. **[Medellín Travel](https://www.medellin.travel)**: Festivales oficiales, turismo cultural, convenciones y ferias metropolitanas.
4. **[Fever Medellín](https://feverup.com/es/medellin)**: Conciertos Candlelight a la luz de las velas, tributos clásicos, teatro inmersivo y experiencias gastronómicas.
5. **[Agenda Oriente](https://agendaoriente.com)**: Festivales y cultura en el Oriente Antioqueño (**Rionegro, Marinilla, La Ceja, El Carmen de Viboral, El Retiro, Guatapé, El Peñol**).
6. **[Casa Museo Otraparte](https://www.otraparte.org)**: Cineclubes, clubes de lectura, cátedras de humanismo y filosofía en Envigado.
7. **Comunidad AntiFOMO (`/enviar`)**: Envíos directos de colectivos, promotores y usuarios mediante formulario con validación automática.

---

## 🎨 Sistema de Diseño y Tokens (Impeccable Design System)

AntiFOMO utiliza un sistema de diseño editorial basado en Tailwind CSS v4 con variables CSS nativas y soporte de modo Claro / Oscuro:

| Token | Modo Claro | Modo Oscuro | Descripción |
|---|---|---|---|
| `--color-bg` | `#F6F3EA` (Papel cálido) | `#0D0E11` (Obsidiana) | Fondo principal de la interfaz |
| `--color-text` | `#111111` | `#F4F4EE` | Color principal de tipografía |
| `--color-accent` | `#D7FF3F` / `#FFDE21` | `#D7FF3F` / `#FFDE21` | Acento Chartreuse de radar |
| `--color-secondary` | `#555550` | `#A2A098` | Subtítulos, horas y metadatos |
| `--color-surface` | `#ECE9DF` | `#17191E` | Superficies de chips y paneles |
| `--color-border` | `#D4D0C5` | `#282B33` | Divisores y bordes sutiles |

### 🔤 Tipografía y OpenType
- **Fuente Principal**: `Geist Sans`, `Inter`, `system-ui`.
- **Cifras Tabulares (`tabular-nums`)**: Activado en horas y precios para alineación vertical perfecta.
- **Balance Óptico**: `text-wrap: balance` en encabezados y `text-wrap: pretty` en párrafos para evitar líneas huérfanas.

---

## 🏗️ Arquitectura Técnica

```mermaid
graph TD
    A[Scrapers / Cron Jobs] -->|Upsert JSON| B[(Supabase PostgreSQL)]
    B -->|Fetch Data| C[Next.js App Router]
    C -->|SSG / Pre-render| D[Vercel CDN Production]
    D -->|606 Rutas Estáticas| E[Usuario Web / PWA]
    E -->|Guardados / Storage| F[localStorage]
    E -->|Propuestas de Eventos| G[/api/events/submit]
    G --> B
    A2[Vercel Crons] -->|Weekly Digest| H[Newsletter Automatizada]
```

- **Frontend**: Next.js 16.3.1 (React 19, Turbopack, App Router).
- **Static Site Generation (SSG)**: 606 páginas pre-renderizadas (`/`, `/explorar`, `/guardados`, `/enviar` y 594 rutas individuales `/evento/[slug]`).
- **Base de Datos**: Supabase PostgreSQL con tablas `events`, `sources`, `event_submissions`, `subscribers`.
- **SEO & Datos Estructurados**: Dynamic Metadata + Schemas JSON-LD `Event` en cada ficha para indexación en Google Event Search.
- **Crons Automáticos**: Vercel Cron Jobs para sincronización diaria (`0 4 * * *`) y resumen semanal (`0 8 * * 4`).

---

## 💻 Desarrollo Local

### 1. Clonar el repositorio e instalar dependencias:
```bash
git clone https://github.com/frenti88/antifomo.git
cd antifomo/antifomo-app
npm install
```

### 2. Configurar variables de entorno (`.env.local`):
```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://<tu-proyecto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<tu-service-role-key>
CRON_SECRET=<tu-cron-secret>
```

### 3. Iniciar servidor de desarrollo:
```bash
npm run dev
```
Visita [http://localhost:3000](http://localhost:3000) en tu navegador.

### 4. Compilar para producción (SSG):
```bash
npm run build
```

---

## 🤖 Scripts de Ingesta y Scraping

Para ejecutar manualmente los sincronizadores de eventos:

```bash
# Sincronizar todos los orígenes de datos
node scripts/sync-all.js

# Sincronizar fuentes individuales
node scripts/sync-fever-all.js         # Fever Medellín (Candlelight)
node scripts/sync-agenda-oriente.js    # Agenda Oriente (WordPress REST API)
node scripts/sync-otraparte.js         # Casa Museo Otraparte
node scripts/sync-eventario.js         # Eventario
node scripts/sync-compas.js            # Compás Urbano
node scripts/sync-medellin-travel.js   # Medellín Travel
```

---

## 🌐 Endpoints de la API

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/events` | Listar y filtrar eventos (fecha, categoría, precio, zona, joyitas) |
| `POST` | `/api/events/submit` | Enviar una propuesta de evento para revisión comunitaria |
| `GET` | `/api/cron/sync-events` | Trigger de sincronización de eventos (protegido con `CRON_SECRET`) |
| `GET` | `/api/cron/weekly-digest` | Trigger del newsletter semanal con el radar cultural |

---

## 🚀 Despliegue en Producción

La aplicación está conectada a **Vercel** con despliegue continuo desde la rama `main`:

- **Producción**: **[https://antifomo-app.vercel.app](https://antifomo-app.vercel.app)**
- **Repositorio GitHub**: **[https://github.com/frenti88/antifomo](https://github.com/frenti88/antifomo)**

---

## 📄 Licencia

Este proyecto está desarrollado bajo la licencia **MIT**. Desarrollado con ❤️ para la comunidad cultural de Medellín y Antioquia.
