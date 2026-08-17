import React from 'react';

type BadgeType = 'free' | 'gem' | 'newly-found' | 'verified' | 'last-spots';

interface EventBadgeProps {
  type: BadgeType;
  className?: string;
}

export function EventBadge({ type, className = '' }: EventBadgeProps) {
  const baseClasses = 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap';
  
  switch (type) {
    case 'free':
      return <span className={`${baseClasses} bg-accent text-text ${className}`}>Gratis</span>;
    case 'gem':
      return <span className={`${baseClasses} border border-accent text-text ${className}`}>◉ Joyita</span>;
    case 'newly-found':
      return <span className={`${baseClasses} text-secondary ${className}`}>◎ Recién encontrado</span>;
    case 'verified':
      return <span className={`${baseClasses} bg-surface text-text border border-border ${className}`}>Verificado</span>;
    case 'last-spots':
      return <span className={`${baseClasses} bg-red-100 text-red-800 ${className}`}>Últimos cupos</span>;
    default:
      return null;
  }
}
