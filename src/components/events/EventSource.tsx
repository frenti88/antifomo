'use client';

import React from 'react';
import type { EventSource as EventSourceType } from '@/lib/types';
import { SOURCE_ICONS } from '@/data/categories';

interface EventSourceProps {
  sources: EventSourceType[];
  className?: string;
  interactive?: boolean;
}

export function EventSource({ sources, className = '', interactive = true }: EventSourceProps) {
  if (!sources || sources.length === 0) return null;

  if (!interactive) {
    const mainSource = sources[0];
    const icon = SOURCE_ICONS[mainSource.type] || '🌐';
    return (
      <div className={`text-xs text-secondary flex items-center gap-1 ${className}`}>
        <span>{icon}</span>
        <span>
          {sources.length === 1 
            ? mainSource.label 
            : `Confirmado en ${sources.length} fuentes`}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap gap-2 items-center ${className}`}>
      {sources.map((source, index) => {
        const icon = SOURCE_ICONS[source.type] || '🌐';
        
        if (source.url) {
          return (
            <a
              key={index}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface hover:bg-[#FFDE21] text-text hover:text-black border border-border transition-all text-xs font-medium group"
              title={`Conocer más en ${source.label}`}
              aria-label={`Conocer más en ${source.label}`}
            >
              <span>{icon}</span>
              <span>{source.label}</span>
              <svg 
                className="w-3 h-3 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          );
        }

        return (
          <span
            key={index}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface text-secondary border border-border text-xs font-medium"
          >
            <span>{icon}</span>
            <span>{source.label}</span>
          </span>
        );
      })}
    </div>
  );
}
