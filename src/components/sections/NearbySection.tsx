'use client';

import React, { useState, useMemo } from 'react';
import { EditorialSection } from './EditorialSection';
import { useGeolocation } from '@/hooks/useGeolocation';
import { DEMO_EVENTS } from '@/data/events';
import { EventRow } from '@/components/events/EventRow';
import type { AntiFOMOEvent, Zone } from '@/lib/types';

interface SectorOption {
  id: string;
  label: string;
  badge: string;
  matches: (e: AntiFOMOEvent) => boolean;
}

const SECTOR_OPTIONS: SectorOption[] = [
  {
    id: 'centro',
    label: 'Centro / Prado / Bomboná',
    badge: 'Centro & Prado',
    matches: (e) =>
      e.neighborhood.toLowerCase().includes('centro') ||
      e.neighborhood.toLowerCase().includes('prado') ||
      e.neighborhood.toLowerCase().includes('buenos aires'),
  },
  {
    id: 'poblado',
    label: 'El Poblado / Manila / Ciudad del Río',
    badge: 'El Poblado & Manila',
    matches: (e) =>
      e.neighborhood.toLowerCase().includes('poblado') ||
      e.neighborhood.toLowerCase().includes('manila') ||
      e.tags?.some(t => t.toLowerCase().includes('poblado') || t.toLowerCase().includes('manila')),
  },
  {
    id: 'laureles',
    label: 'Laureles / Belén',
    badge: 'Laureles & Belén',
    matches: (e) =>
      e.neighborhood.toLowerCase().includes('laureles') ||
      e.neighborhood.toLowerCase().includes('belén'),
  },
  {
    id: 'envigado',
    label: 'Envigado / Sabaneta',
    badge: 'Envigado',
    matches: (e) =>
      e.city.toLowerCase().includes('envigado') ||
      e.neighborhood.toLowerCase().includes('envigado') ||
      e.city.toLowerCase().includes('sabaneta'),
  },
  {
    id: 'norte',
    label: 'Aranjuez / Zona Norte',
    badge: 'Aranjuez & Norte',
    matches: (e) =>
      e.neighborhood.toLowerCase().includes('aranjuez') ||
      e.tags?.some(t => t.toLowerCase().includes('norte') || t.toLowerCase().includes('planetario')),
  },
  {
    id: 'santaelena',
    label: 'Santa Elena / Montaña',
    badge: 'Santa Elena',
    matches: (e) =>
      e.neighborhood.toLowerCase().includes('santa elena') ||
      e.tags?.some(t => t.toLowerCase().includes('santa elena')),
  },
  {
    id: 'sur',
    label: 'Itagüí / Guayabal',
    badge: 'Itagüí & Guayabal',
    matches: (e) =>
      e.neighborhood.toLowerCase().includes('itagüí') ||
      e.neighborhood.toLowerCase().includes('guayabal') ||
      e.city.toLowerCase().includes('itagüí'),
  },
];

// Haversine formula to calculate distance between two coordinates in km
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

interface NearbySectionProps {
  events?: AntiFOMOEvent[];
}

export function NearbySection({ events = DEMO_EVENTS }: NearbySectionProps) {
  const { status, position, requestLocation } = useGeolocation();
  const [selectedSector, setSelectedSector] = useState<string>('centro');
  const [useGpsMode, setUseGpsMode] = useState<boolean>(false);

  // Filter or sort events based on selected sector or GPS
  const displayedEvents = useMemo(() => {
    if (useGpsMode && position && position.lat && position.lng) {
      // Sort all events by distance to user GPS
      return [...events]
        .map(event => {
          const lat = event.latitude ?? 6.2442;
          const lng = event.longitude ?? -75.5812;
          return {
            ...event,
            distanceKm: calculateDistanceKm(
              position.lat,
              position.lng,
              lat,
              lng
            ),
          };
        })
        .sort((a, b) => a.distanceKm - b.distanceKm);
    }

    if (selectedSector === 'all') {
      return events.slice(0, 8);
    }

    const sector = SECTOR_OPTIONS.find(s => s.id === selectedSector);
    if (!sector) return events.slice(0, 6);

    return events.filter(sector.matches);
  }, [events, selectedSector, useGpsMode, position]);

  const activeSectorObj = SECTOR_OPTIONS.find(s => s.id === selectedSector);

  const handleGpsClick = () => {
    if (status !== 'granted') {
      requestLocation();
    }
    setUseGpsMode(true);
  };

  return (
    <EditorialSection
      id="nearby-section"
      title="Cerca de ti"
      subtitle="Filtra y encuentra qué está pasando a pocas cuadras de tu sector."
    >
      <div className="bg-surface/50 border border-border p-4 sm:p-5 rounded-2xl">
        {/* Sector Selection Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-border/60">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-secondary">
              Elige tu sector en Medellín:
            </span>
          </div>

          <button
            onClick={handleGpsClick}
            disabled={status === 'requesting'}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              useGpsMode && status === 'granted'
                ? 'bg-accent text-black font-bold shadow-sm'
                : 'bg-bg text-text hover:bg-surface border border-border'
            }`}
            title="Usar GPS para ordenar por distancia exacta"
          >
            <span>📍</span>
            <span>
              {status === 'requesting'
                ? 'Localizando...'
                : useGpsMode && status === 'granted'
                ? 'GPS Activado (Orden por distancia)'
                : 'Usar mi ubicación GPS'}
            </span>
          </button>
        </div>

        {/* Sector Quick Chips */}
        <div className="flex overflow-x-auto gap-2 pb-3 mb-4 no-scrollbar">
          {SECTOR_OPTIONS.map((sector) => {
            const isActive = !useGpsMode && selectedSector === sector.id;
            return (
              <button
                key={sector.id}
                onClick={() => {
                  setUseGpsMode(false);
                  setSelectedSector(sector.id);
                }}
                className={`px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 min-h-[38px] ${
                  isActive
                    ? 'bg-accent text-black font-bold shadow-sm ring-1 ring-black/10'
                    : 'bg-bg hover:bg-surface text-secondary hover:text-text border border-border'
                }`}
              >
                <span>📍</span>
                <span>{sector.badge}</span>
              </button>
            );
          })}
        </div>

        {/* Active Sector Summary */}
        <div className="flex items-center justify-between px-1 mb-3">
          <p className="text-xs font-semibold text-text flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse" />
            {useGpsMode && position ? (
              <span>Ordenando {displayedEvents.length} planes desde el más cercano a tu ubicación</span>
            ) : (
              <span>
                Mostrando {displayedEvents.length} planes en{' '}
                <strong className="underline decoration-accent underline-offset-2">
                  {activeSectorObj?.label || 'tu sector'}
                </strong>
              </span>
            )}
          </p>
        </div>

        {/* Events list in the selected sector */}
        {displayedEvents.length > 0 ? (
          <div className="bg-bg rounded-xl border border-border divide-y divide-border/60 overflow-hidden shadow-sm">
            {displayedEvents.map((event) => (
              <div key={event.id} className="relative">
                {useGpsMode && 'distanceKm' in event && (
                  <div className="absolute top-3 left-4 z-10 bg-accent/90 text-black text-[10px] font-bold px-2 py-0.5 rounded-full border border-black/10">
                    A {(event as AntiFOMOEvent & { distanceKm: number }).distanceKm} km de ti
                  </div>
                )}
                <EventRow event={event} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-bg rounded-xl border border-border p-4">
            <span className="text-3xl block mb-2 opacity-50">🧭</span>
            <p className="font-medium text-text text-sm">
              No hay planes programados en este sector para los próximos días.
            </p>
            <p className="text-xs text-secondary mt-1 mb-4">
              Explora los sectores vecinos donde tenemos muchos planes activos.
            </p>
            <button
              onClick={() => setSelectedSector('centro')}
              className="bg-accent text-black text-xs font-bold py-2 px-4 rounded-full"
            >
              Ver planes en el Centro
            </button>
          </div>
        )}
      </div>
    </EditorialSection>
  );
}
