'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { DEMO_EVENTS } from '@/data/events';
import { useFilters } from '@/hooks/useFilters';
import { FilterSheet } from '@/components/filters/FilterSheet';
import { HomeEventCard } from '@/components/home/HomeEventCard';
import { HomeTimeTabs } from '@/components/home/HomeTimeTabs';
import { NearbyBarrioChips } from '@/components/home/NearbyBarrioChips';
import { getEstaNocheEvents, getJoyitasRadar, getCercaDeTi } from '@/lib/home-selectors';
import type { HomeTab } from '@/lib/home-selectors';

export default function HomePage() {
  const { filters, setFilter, filteredEvents, resultCount } = useFilters(DEMO_EVENTS);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  
  const [activeTab, setActiveTab] = useState<HomeTab>('esta-noche');
  const [activeBarrio, setActiveBarrio] = useState<string>('');

  // 1. Esta noche (filtered via useFilters to respect active categories/free filters)
  const estaNocheEvents = useMemo(() => {
    return getEstaNocheEvents(filteredEvents, activeTab);
  }, [filteredEvents, activeTab]);

  const excludeSlugs = useMemo(() => new Set(estaNocheEvents.map(e => e.slug)), [estaNocheEvents]);

  // 2. Joyitas del radar
  const joyitas = useMemo(() => {
    return getJoyitasRadar(filteredEvents, excludeSlugs);
  }, [filteredEvents, excludeSlugs]);

  // Exclude joyitas from cerca de ti
  const excludeSlugsCerca = useMemo(() => {
    const s = new Set(excludeSlugs);
    joyitas.forEach(j => s.add(j.slug));
    return s;
  }, [excludeSlugs, joyitas]);

  // 3. Cerca de ti
  const cercaDeTi = useMemo(() => {
    return getCercaDeTi(filteredEvents, activeBarrio, excludeSlugsCerca);
  }, [filteredEvents, activeBarrio, excludeSlugsCerca]);

  return (
    <div className="pb-24">
      {/* ─────────────────────────────────────────────
          HERO & HEADER CONTROLS
          ───────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text mb-2">
          Esta noche en Medellín
        </h1>
        <p className="text-secondary text-base sm:text-lg mb-6">
          Lo que no iba a aparecer en tu feed.
        </p>

        <div className="flex items-center gap-3">
          <HomeTimeTabs activeTab={activeTab} onTabChange={setActiveTab} />
          
          {/* Botón Filtros (remplaza chips primarios) */}
          <button 
            onClick={() => setIsFilterSheetOpen(true)}
            className="ml-auto flex items-center gap-2 px-4 py-2 rounded-full bg-surface border border-border text-sm font-bold text-text hover:border-accent hover:text-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-text whitespace-nowrap"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
            </svg>
            Filtros
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        
        {/* ─────────────────────────────────────────────
            SECCIÓN 1: Esta noche (o mañana / finde)
            ───────────────────────────────────────────── */}
        <section>
          {estaNocheEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {estaNocheEvents.map(event => (
                <HomeEventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="py-12 px-6 border border-border border-dashed rounded-2xl bg-surface/30 text-center">
              <p className="text-lg font-bold text-text mb-2">Poco en el radar para {activeTab === 'esta-noche' ? 'esta noche' : activeTab === 'manana' ? 'mañana' : 'este finde'}.</p>
              <p className="text-secondary">Ajusta los filtros o mira qué hay para otros días.</p>
            </div>
          )}
        </section>

        {/* ─────────────────────────────────────────────
            SECCIÓN 2: Joyitas del radar
            ───────────────────────────────────────────── */}
        {joyitas.length > 0 && (
          <section>
            <div className="mb-4">
              <h2 className="text-2xl font-extrabold tracking-tight text-text">Joyitas del radar</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {joyitas.map(event => (
                <HomeEventCard key={event.id} event={event} showGemBadge />
              ))}
            </div>
          </section>
        )}

        {/* ─────────────────────────────────────────────
            SECCIÓN 3: Cerca de ti
            ───────────────────────────────────────────── */}
        <section>
          <div className="mb-4">
            <h2 className="text-2xl font-extrabold tracking-tight text-text">Cerca de ti</h2>
            <p className="text-sm text-secondary mt-1">¿En qué barrio te mueves?</p>
            <div className="mt-3">
              <NearbyBarrioChips onBarrioChange={setActiveBarrio} />
            </div>
          </div>
          
          {activeBarrio && cercaDeTi.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {cercaDeTi.map(event => (
                <HomeEventCard key={event.id} event={event} />
              ))}
            </div>
          )}
          {activeBarrio && cercaDeTi.length === 0 && (
            <div className="py-6 px-4 border border-border border-dashed rounded-xl bg-surface/30 text-center mt-4">
              <p className="text-secondary text-sm">No encontramos planes recomendados en {activeBarrio} para los próximos días que no hayas visto ya.</p>
            </div>
          )}
        </section>

        {/* ─────────────────────────────────────────────
            SECCIÓN 4: Catálogo completo
            ───────────────────────────────────────────── */}
        <section className="py-8 text-center border-t border-border mt-8">
          <h2 className="text-xl font-extrabold tracking-tight text-text mb-2">¿Quieres el catálogo completo?</h2>
          <Link 
            href="/explorar"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-text text-bg font-bold hover:bg-secondary hover:scale-105 active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-text mt-4"
          >
            Ver los {DEMO_EVENTS.length} planes en Explorar
          </Link>
        </section>

      </div>

      <FilterSheet
        open={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        filters={filters}
        onFiltersChange={setFilter}
        eventCount={resultCount}
      />
    </div>
  );
}
