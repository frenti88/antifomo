import { DEMO_EVENTS } from '@/data/events';
import { getEventMetadata, getEventJsonLd } from '@/lib/seo';
import { notFound } from 'next/navigation';
import EventDetailClient from './EventDetailClient';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const event = DEMO_EVENTS.find(e => e.slug === slug);
  if (!event) return { title: 'Evento no encontrado — AntiFOMO' };
  return getEventMetadata(event);
}

export function generateStaticParams() {
  return DEMO_EVENTS.map(event => ({ slug: event.slug }));
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  const event = DEMO_EVENTS.find(e => e.slug === slug);
  if (!event) notFound();
  
  const jsonLd = getEventJsonLd(event);
  
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <EventDetailClient event={event} />
    </>
  );
}
