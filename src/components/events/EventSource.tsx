import React from 'react';
import type { EventSource as EventSourceType } from '@/lib/types';
import { SOURCE_ICONS } from '@/data/categories';

interface EventSourceProps {
  sources: EventSourceType[];
  className?: string;
}

export function EventSource({ sources, className = '' }: EventSourceProps) {
  if (!sources || sources.length === 0) return null;
  
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
