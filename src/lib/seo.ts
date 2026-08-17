// ─────────────────────────────────────────────
// AntiFOMO — SEO Utilities
// ─────────────────────────────────────────────

import type { AntiFOMOEvent } from './types';
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION, SITE_TAGLINE } from './constants';
import { formatDateFull, formatTime } from './dates';
import type { Metadata } from 'next';

/** Generate metadata for the home page */
export function getHomeMetadata(): Metadata {
  return {
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    openGraph: {
      title: `${SITE_NAME} — ${SITE_TAGLINE}`,
      description: SITE_DESCRIPTION,
      url: SITE_URL,
      siteName: SITE_NAME,
      type: 'website',
      locale: 'es_CO',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${SITE_NAME} — ${SITE_TAGLINE}`,
      description: SITE_DESCRIPTION,
    },
  };
}

/** Generate metadata for an event detail page */
export function getEventMetadata(event: AntiFOMOEvent): Metadata {
  const title = `${event.title} — ${SITE_NAME}`;
  const description = `${event.shortDescription} | ${formatDateFull(event.startDate)} · ${event.venue}`;
  const url = `${SITE_URL}/evento/${event.slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: 'article',
      locale: 'es_CO',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: url,
    },
  };
}

/** Generate JSON-LD for an event */
export function getEventJsonLd(event: AntiFOMOEvent) {
  const priceText =
    event.priceType === 'free'
      ? '0'
      : event.priceMin?.toString() || '0';

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.longDescription || event.shortDescription,
    startDate: `${event.startDate}T${event.startTime}:00-05:00`,
    ...(event.endTime && {
      endDate: `${event.startDate}T${event.endTime}:00-05:00`,
    }),
    location: {
      '@type': 'Place',
      name: event.venue,
      address: {
        '@type': 'PostalAddress',
        addressLocality: event.city,
        addressRegion: event.neighborhood,
        addressCountry: 'CO',
      },
      ...(event.latitude && event.longitude && {
        geo: {
          '@type': 'GeoCoordinates',
          latitude: event.latitude,
          longitude: event.longitude,
        },
      }),
    },
    offers: {
      '@type': 'Offer',
      price: priceText,
      priceCurrency: event.currency,
      availability: 'https://schema.org/InStock',
    },
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    ...(event.organizer && {
      organizer: {
        '@type': 'Organization',
        name: event.organizer,
      },
    }),
    url: `${SITE_URL}/evento/${event.slug}`,
  };
}

/** Format price for display */
export function formatPrice(event: AntiFOMOEvent): string {
  if (event.priceType === 'free') return 'Gratis';
  if (event.priceType === 'donation') return 'Aporte voluntario';
  if (event.priceMin !== undefined) {
    return `$${event.priceMin.toLocaleString('es-CO')}`;
  }
  return '';
}
