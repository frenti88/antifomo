'use client';

import React, { useState } from 'react';
import type { AntiFOMOEvent } from '@/lib/types';

interface EventCoverProps {
  event: AntiFOMOEvent;
  className?: string;
  aspectRatio?: 'video' | 'card' | 'banner';
  showCategoryLabel?: boolean;
}

const CATEGORY_THEMES: Record<string, { bg: string; accent: string; waveColor: string }> = {
  música: { bg: 'from-zinc-900 via-neutral-900 to-black', accent: '#FFDE21', waveColor: 'rgba(255, 222, 33, 0.25)' },
  arte: { bg: 'from-slate-900 via-stone-900 to-zinc-950', accent: '#FFDE21', waveColor: 'rgba(255, 222, 33, 0.25)' },
  cine: { bg: 'from-stone-900 via-zinc-900 to-black', accent: '#FFDE21', waveColor: 'rgba(255, 222, 33, 0.25)' },
  teatro: { bg: 'from-neutral-900 via-zinc-900 to-stone-950', accent: '#FFDE21', waveColor: 'rgba(255, 222, 33, 0.25)' },
  fiesta: { bg: 'from-zinc-950 via-neutral-900 to-black', accent: '#FFDE21', waveColor: 'rgba(255, 222, 33, 0.25)' },
  talleres: { bg: 'from-stone-900 via-neutral-900 to-zinc-900', accent: '#FFDE21', waveColor: 'rgba(255, 222, 33, 0.25)' },
  literatura: { bg: 'from-zinc-900 via-stone-950 to-black', accent: '#FFDE21', waveColor: 'rgba(255, 222, 33, 0.25)' },
  comunidad: { bg: 'from-neutral-900 via-zinc-900 to-stone-900', accent: '#FFDE21', waveColor: 'rgba(255, 222, 33, 0.25)' },
  gastronomía: { bg: 'from-stone-900 via-zinc-950 to-black', accent: '#FFDE21', waveColor: 'rgba(255, 222, 33, 0.25)' },
  bienestar: { bg: 'from-zinc-900 via-neutral-950 to-black', accent: '#FFDE21', waveColor: 'rgba(255, 222, 33, 0.25)' },
  mercados: { bg: 'from-stone-950 via-zinc-900 to-neutral-900', accent: '#FFDE21', waveColor: 'rgba(255, 222, 33, 0.25)' },
  comedia: { bg: 'from-zinc-900 via-neutral-900 to-black', accent: '#FFDE21', waveColor: 'rgba(255, 222, 33, 0.25)' },
  performance: { bg: 'from-stone-900 via-zinc-900 to-black', accent: '#FFDE21', waveColor: 'rgba(255, 222, 33, 0.25)' },
};

export function EventCover({
  event,
  className = '',
  aspectRatio = 'video',
  showCategoryLabel = true,
}: EventCoverProps) {
  const [imageError, setImageError] = useState(false);

  const theme = CATEGORY_THEMES[event.category.toLowerCase()] || CATEGORY_THEMES['música'];
  const hasValidImage = Boolean(event.image) && !imageError;

  // Generate deterministic coordinates for radar blip based on event ID
  const hash = event.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const blipX = 25 + (hash % 50);
  const blipY = 25 + ((hash * 7) % 50);

  const aspectClasses =
    aspectRatio === 'video'
      ? 'aspect-video w-full'
      : aspectRatio === 'card'
      ? 'h-36 w-full'
      : 'h-48 sm:h-64 w-full';

  if (hasValidImage) {
    return (
      <div className={`relative overflow-hidden rounded-xl bg-neutral-900 ${aspectClasses} ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={event.image}
          alt={`Afiche oficial de ${event.title}`}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${theme.bg} ${aspectClasses} border border-border/40 select-none ${className}`}
      role="img"
      aria-label={`Afiche ilustrativo del radar para: ${event.title}`}
    >
      {/* Grid Pattern Background */}
      <svg
        className="absolute inset-0 w-full h-full opacity-15"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id={`grid-${event.id}`} width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#FFFFFF" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-${event.id})`} />
      </svg>

      {/* Radar Concentric Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25">
        <svg className="w-full h-full max-w-[280px] max-h-[280px]" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="90" fill="none" stroke="#FFDE21" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="100" cy="100" r="65" fill="none" stroke="#FFDE21" strokeWidth="1" />
          <circle cx="100" cy="100" r="40" fill="none" stroke="#FFDE21" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="100" cy="100" r="15" fill="none" stroke="#FFDE21" strokeWidth="1.5" />
          <line x1="100" y1="5" x2="100" y2="195" stroke="#FFDE21" strokeWidth="0.5" opacity="0.6" />
          <line x1="5" y1="100" x2="195" y2="100" stroke="#FFDE21" strokeWidth="0.5" opacity="0.6" />
        </svg>
      </div>

      {/* Animated Radar Scanning Line */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
        <div className="w-[240px] h-[240px] rounded-full border border-[#FFDE21]/30 relative animate-[spin_8s_linear_infinite]">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'conic-gradient(from 0deg at 50% 50%, rgba(255, 222, 33, 0.4) 0deg, transparent 60deg, transparent 360deg)',
            }}
          />
        </div>
      </div>

      {/* Target Blip (Event Marker Location) */}
      <div
        className="absolute z-10 flex items-center justify-center"
        style={{ left: `${blipX}%`, top: `${blipY}%` }}
      >
        <span className="relative flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFDE21] opacity-75" />
          <span className="relative inline-flex rounded-full h-4 w-4 bg-[#FFDE21] items-center justify-center text-[8px] font-bold text-black">
            ◉
          </span>
        </span>
      </div>

      {/* Audio Soundwave Spectrum at Bottom */}
      <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-1 opacity-30 h-8 pointer-events-none">
        {[40, 70, 30, 90, 50, 80, 100, 45, 65, 85, 35, 95, 60, 40, 75, 50, 90, 30, 80, 60].map(
          (height, index) => (
            <div
              key={index}
              className="w-full bg-[#FFDE21] rounded-t"
              style={{ height: `${height}%` }}
            />
          )
        )}
      </div>

      {/* Category Watermark Text */}
      <div className="absolute top-3 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md border border-[#FFDE21]/30 text-[#FFDE21] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FFDE21] animate-pulse" />
          RADAR DETECTADO
        </div>
        {showCategoryLabel && (
          <span className="text-xs font-bold text-white/50 uppercase tracking-widest font-mono">
            {event.category}
          </span>
        )}
      </div>

      {/* Event Title & Venue Overlay at Bottom */}
      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black via-black/70 to-transparent z-10">
        <p className="text-xs font-semibold text-[#FFDE21] tracking-wide uppercase mb-0.5 truncate">
          {event.venue} · {event.neighborhood}
        </p>
        <p className="text-sm sm:text-base font-bold text-white leading-tight line-clamp-1">
          {event.title}
        </p>
      </div>
    </div>
  );
}
