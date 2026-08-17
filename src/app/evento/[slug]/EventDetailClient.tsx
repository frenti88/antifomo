'use client';

import { AntiFOMOEvent } from '@/lib/types';
import { formatDateFull, formatTime } from '@/lib/dates';
import { formatPrice } from '@/lib/seo';
import { SaveButton } from '@/components/events/SaveButton';
import { ShareButton } from '@/components/events/ShareButton';
import { EventBadge } from '@/components/events/EventBadge';
import { EventSource } from '@/components/events/EventSource';
import Link from 'next/link';

const CATEGORY_GRADIENTS: Record<string, string> = {
  'música': 'from-violet-300 to-indigo-400',
  'arte': 'from-rose-300 to-pink-400',
  'cine': 'from-amber-300 to-orange-400',
  'teatro': 'from-red-300 to-rose-400',
  'fiesta': 'from-fuchsia-300 to-purple-400',
  'talleres': 'from-emerald-300 to-teal-400',
  'literatura': 'from-sky-300 to-blue-400',
  'comunidad': 'from-lime-300 to-green-400',
  'gastronomía': 'from-orange-300 to-red-400',
  'bienestar': 'from-teal-300 to-cyan-400',
  'mercados': 'from-yellow-300 to-amber-400',
  'comedia': 'from-pink-300 to-fuchsia-400',
  'performance': 'from-indigo-300 to-violet-400',
};

export default function EventDetailClient({ event }: { event: AntiFOMOEvent }) {
  const categoryGradient = CATEGORY_GRADIENTS[event.category] || 'from-neutral-200 to-neutral-300';
  const mainSource = event.sources?.[0];
  const price = formatPrice(event);

  return (
    <div className="max-w-2xl mx-auto px-4 pb-40 lg:pb-24">
      {/* Breadcrumb / Back */}
      <nav aria-label="Breadcrumb" className="py-4">
        <Link
          href="/"
          className="text-sm flex items-center gap-1 text-secondary hover:text-text transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Volver
        </Link>
      </nav>

      {/* Image placeholder */}
      <div
        className={`w-full aspect-video rounded-xl mb-6 bg-gradient-to-br ${categoryGradient} flex items-center justify-center`}
        role="img"
        aria-label={`Imagen del evento: ${event.title}`}
      >
        <span className="text-4xl opacity-30" aria-hidden="true">◉</span>
      </div>

      {/* Category + Title */}
      <div className="mb-6">
        <span className="inline-block px-3 py-1 rounded-full bg-surface text-xs font-semibold uppercase tracking-wider mb-3">
          {event.category}
        </span>
        <h1 className="text-2xl font-bold mb-2 text-text">{event.title}</h1>
        <p className="text-lg text-secondary leading-snug">{event.shortDescription}</p>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-6">
        {event.priceType === 'free' && <EventBadge type="free" />}
        {event.isGem && <EventBadge type="gem" />}
        {event.isNewlyFound && <EventBadge type="newly-found" />}
        {event.verified && <EventBadge type="verified" />}
      </div>

      {/* Event Details */}
      <div className="space-y-4 mb-8">
        <div className="flex items-start gap-3">
          <span className="text-xl mt-0.5" aria-hidden="true">📅</span>
          <div>
            <p className="font-medium text-text capitalize">{formatDateFull(event.startDate)}</p>
            <p className="text-secondary">
              {formatTime(event.startTime)}
              {event.endTime ? ` — ${formatTime(event.endTime)}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span className="text-xl mt-0.5" aria-hidden="true">📍</span>
          <div>
            <p className="font-medium text-text">{event.venue}</p>
            <p className="text-secondary">{event.neighborhood} · {event.city}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span className="text-xl mt-0.5" aria-hidden="true">💰</span>
          <div>
            <p className={`font-semibold ${event.priceType === 'free' ? 'text-accent' : 'text-text'}`}>
              {price}
            </p>
          </div>
        </div>

        {event.organizer && (
          <div className="flex items-start gap-3">
            <span className="text-xl mt-0.5" aria-hidden="true">👤</span>
            <div>
              <p className="font-medium text-text">{event.organizer}</p>
            </div>
          </div>
        )}
      </div>

      <hr className="border-border my-8" />

      {/* Long description */}
      {event.longDescription && (
        <>
          <div className="text-base leading-relaxed text-text mb-8 whitespace-pre-line">
            {event.longDescription}
          </div>
          <hr className="border-border my-8" />
        </>
      )}

      {/* Source info */}
      <div className="mb-12">
        <h2 className="text-lg font-bold mb-4">Información de origen</h2>
        <EventSource sources={event.sources} className="mb-3" />
        <ul className="text-sm text-secondary space-y-1">
          {event.verified && <li>✓ Verificado por el organizador</li>}
          {event.sourceCount > 1 && <li>✓ Confirmado en {event.sourceCount} fuentes</li>}
          {event.lastCheckedAt && (
            <li>Última comprobación: {new Date(event.lastCheckedAt).toLocaleDateString('es-CO')}</li>
          )}
        </ul>
      </div>

      {/* Action Bar */}
      <div className="fixed bottom-16 lg:bottom-0 left-0 right-0 lg:static bg-bg border-t border-border p-4 z-40">
        <div className="max-w-2xl mx-auto flex gap-3 items-center">
          {mainSource?.url && (
            <a
              href={mainSource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-accent text-text rounded-full px-6 py-3 font-semibold text-center hover:brightness-95 transition-all min-h-[44px] flex items-center justify-center"
            >
              Ver fuente original
            </a>
          )}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.venue} ${event.neighborhood} ${event.city}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-border text-text rounded-full px-4 py-3 hover:bg-surface transition-colors min-h-[44px] flex items-center justify-center font-medium"
          >
            Cómo llegar
          </a>
          <SaveButton eventId={event.id} />
          <ShareButton event={event} />
        </div>
      </div>
    </div>
  );
}
