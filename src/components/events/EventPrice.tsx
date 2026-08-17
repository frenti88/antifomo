import React from 'react';
import type { AntiFOMOEvent } from '@/lib/types';
import { formatPrice } from '@/lib/seo';
import { EventBadge } from './EventBadge';

interface EventPriceProps {
  event: AntiFOMOEvent;
  className?: string;
}

export function EventPrice({ event, className = '' }: EventPriceProps) {
  if (event.priceType === 'free') {
    return <EventBadge type="free" className={className} />;
  }
  
  const priceFormatted = formatPrice(event);
  return <span className={`font-bold tabular-nums tracking-tight text-xs sm:text-sm text-text ${className}`}>{priceFormatted}</span>;
}
