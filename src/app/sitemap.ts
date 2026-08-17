import { MetadataRoute } from 'next';
import { DEMO_EVENTS } from '@/data/events';
import { SITE_URL } from '@/lib/constants';

export default function sitemap(): MetadataRoute.Sitemap {
  const eventUrls = DEMO_EVENTS.map(event => ({
    url: `${SITE_URL}/evento/${event.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));
  
  return [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'hourly', priority: 1 },
    { url: `${SITE_URL}/explorar`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    ...eventUrls,
  ];
}
