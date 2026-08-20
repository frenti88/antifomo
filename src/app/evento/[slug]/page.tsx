import { DEMO_EVENTS } from '@/data/events';
import { getEventMetadata, getEventJsonLd } from '@/lib/seo';
import { isSupabaseConfigured, supabase, mapRowToEvent } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import EventDetailClient from './EventDetailClient';

type Props = { params: Promise<{ slug: string }> };

async function findEventBySlug(slug: string) {
  const local = DEMO_EVENTS.find(e => e.slug === slug);
  if (local) return local;

  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase.from('events').select('*').eq('slug', slug).single();
      if (data) return mapRowToEvent(data);
    } catch {
      // Fallback
    }
  }
  return null;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const event = await findEventBySlug(slug);
  if (!event) return { title: 'Evento no encontrado — AntiFOMO' };
  return getEventMetadata(event);
}

export function generateStaticParams() {
  return DEMO_EVENTS.map(event => ({ slug: event.slug }));
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  const event = await findEventBySlug(slug);
  if (!event) notFound();
  
  const jsonLd = getEventJsonLd(event);
  
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <EventDetailClient event={event} />
    </>
  );
}
