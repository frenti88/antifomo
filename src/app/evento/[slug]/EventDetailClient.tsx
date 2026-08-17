'use client';

import { AntiFOMOEvent } from '@/lib/types';
import { formatDateFull, formatTime } from '@/lib/dates';
import { formatPrice } from '@/lib/seo';
import { SaveButton } from '@/components/events/SaveButton';
import { ShareButton } from '@/components/events/ShareButton';
import { EventBadge } from '@/components/events/EventBadge';
import { EventSource } from '@/components/events/EventSource';
import { EventCover } from '@/components/events/EventCover';
import Link from 'next/link';

export default function EventDetailClient({ event }: { event: AntiFOMOEvent }) {
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

      {/* Radar Cover Artwork */}
      <EventCover event={event} className="mb-6" aspectRatio="banner" />

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
      <div className="mb-12 bg-surface/40 p-4 rounded-xl border border-border">
        <h2 className="text-sm font-bold uppercase tracking-wider text-secondary mb-3">
          Fuentes y Detección en el Radar
        </h2>
        <div className="mb-4">
          <EventSource sources={event.sources} interactive={true} />
        </div>
        <ul className="text-xs text-secondary space-y-1.5 pt-2 border-t border-border/50">
          {event.verified && (
            <li className="flex items-center gap-1.5 text-text font-medium">
              <span className="text-[#FFDE21] font-bold">✓</span> Verificado con el organizador o espacio
            </li>
          )}
          {event.sourceCount > 1 && (
            <li className="flex items-center gap-1.5">
              <span>●</span> Confirmado y cruzado en {event.sourceCount} fuentes independientes
            </li>
          )}
          {event.lastCheckedAt && (
            <li className="flex items-center gap-1.5">
              <span>⏱</span> Última comprobación: {new Date(event.lastCheckedAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })} ({new Date(event.lastCheckedAt).toLocaleDateString('es-CO')})
            </li>
          )}
        </ul>
      </div>

      {/* Action Bar */}
      <div className="fixed bottom-16 lg:bottom-0 left-0 right-0 lg:static bg-bg/95 backdrop-blur-md border-t border-border p-4 z-40">
        <div className="max-w-2xl mx-auto flex gap-3 items-center">
          {mainSource?.url && (
            <a
              href={mainSource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-accent text-black rounded-full px-6 py-3 font-bold text-center hover:brightness-95 transition-all min-h-[44px] flex items-center justify-center gap-2 shadow-sm"
              title={`Conocer más en ${mainSource.label} (${mainSource.url})`}
            >
              <span>Conocer más</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
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
