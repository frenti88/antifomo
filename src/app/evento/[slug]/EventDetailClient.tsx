'use client';

import { AntiFOMOEvent } from '@/lib/types';
import { formatDateFull, formatTime } from '@/lib/dates';
import { formatPrice } from '@/lib/seo';
import { SaveButton } from '@/components/events/SaveButton';
import { ShareButton } from '@/components/events/ShareButton';
import { EventBadge } from '@/components/events/EventBadge';
import { EventSource } from '@/components/events/EventSource';
import { CATEGORY_ICONS } from '@/data/categories';
import Link from 'next/link';

export default function EventDetailClient({ event }: { event: AntiFOMOEvent }) {
  const mainSource = event.sources?.[0];
  const price = formatPrice(event);
  const categoryIcon = CATEGORY_ICONS[event.category as keyof typeof CATEGORY_ICONS] || '◉';

  return (
    <div className="max-w-2xl mx-auto px-4 pb-40 lg:pb-24 pt-2">
      {/* Breadcrumb / Back */}
      <nav aria-label="Breadcrumb" className="py-3">
        <Link
          href="/"
          className="text-sm font-medium flex items-center gap-1.5 text-secondary hover:text-[#FFDE21] transition-colors inline-flex"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>Volver al radar</span>
        </Link>
      </nav>

      {/* Main Header */}
      <header className="pb-6 border-b border-border/70">
        {/* Category Pill + Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface border border-border text-xs font-bold uppercase tracking-wider text-text">
            <span aria-hidden="true">{categoryIcon}</span>
            <span>{event.category}</span>
          </span>

          <div className="flex items-center gap-1.5">
            {event.isGem && <EventBadge type="gem" />}
            {event.isNewlyFound && !event.isGem && <EventBadge type="newly-found" />}
            {event.priceType === 'free' && <EventBadge type="free" />}
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl font-extrabold text-text leading-tight tracking-tight mb-4">
          {event.title}
        </h1>

        {/* Short Description / Lead */}
        {event.shortDescription && (
          <p className="text-base sm:text-lg text-secondary leading-relaxed font-medium">
            {event.shortDescription}
          </p>
        )}
      </header>

      {/* Key Details Strip */}
      <section aria-label="Detalles clave" className="py-6 border-b border-border/70 grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="flex items-start gap-3">
          <span className="text-xl mt-0.5" aria-hidden="true">📅</span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-secondary">Fecha y Hora</p>
            <p className="font-semibold text-text capitalize text-base">{formatDateFull(event.startDate)}</p>
            <p className="text-secondary text-sm">
              {formatTime(event.startTime)}
              {event.endTime ? ` — ${formatTime(event.endTime)}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span className="text-xl mt-0.5" aria-hidden="true">📍</span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-secondary">Lugar y Zona</p>
            <p className="font-semibold text-text text-base">{event.venue}</p>
            <p className="text-secondary text-sm">{event.neighborhood} · {event.city}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span className="text-xl mt-0.5" aria-hidden="true">💰</span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-secondary">Entrada</p>
            <p className={`font-bold text-base ${event.priceType === 'free' ? 'text-black font-extrabold bg-[#D7FF3F] px-2 py-0.5 rounded-md inline-block text-xs uppercase mt-0.5' : 'text-text'}`}>
              {price}
            </p>
          </div>
        </div>

        {event.organizer && (
          <div className="flex items-start gap-3">
            <span className="text-xl mt-0.5" aria-hidden="true">👤</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-secondary">Organiza</p>
              <p className="font-semibold text-text text-base">{event.organizer}</p>
            </div>
          </div>
        )}
      </section>

      {/* Long Description (Prose) */}
      {event.longDescription && (
        <section aria-label="Descripción completa" className="py-6 border-b border-border/70">
          <h2 className="text-xs font-bold uppercase tracking-wider text-secondary mb-3">
            Sobre este plan
          </h2>
          <div className="text-base sm:text-lg leading-relaxed text-text whitespace-pre-line font-normal">
            {event.longDescription}
          </div>
        </section>
      )}

      {/* Verification & Radar Source */}
      <section aria-label="Verificación de fuentes" className="py-6 mb-8">
        <h2 className="text-xs font-bold uppercase tracking-wider text-secondary mb-3">
          Verificación en el Radar
        </h2>
        <div className="mb-4">
          <EventSource sources={event.sources} interactive={true} />
        </div>
        <ul className="text-xs text-secondary space-y-1.5">
          {event.verified && (
            <li className="flex items-center gap-1.5 text-text font-medium">
              <span className="text-[#D7FF3F] font-bold">✓</span> Verificado con el organizador o espacio
            </li>
          )}
          {event.sourceCount > 1 && (
            <li className="flex items-center gap-1.5">
              <span>●</span> Confirmado y cruzado en {event.sourceCount} fuentes independientes
            </li>
          )}
          {event.lastCheckedAt && (
            <li className="flex items-center gap-1.5">
              <span>⏱</span> Última comprobación: {new Date(event.lastCheckedAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
            </li>
          )}
        </ul>
      </section>

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
