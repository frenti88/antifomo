import React from 'react';

type BadgeType = 'free' | 'gem' | 'newly-found' | 'verified' | 'last-spots';

interface EventBadgeProps {
  type: BadgeType;
  className?: string;
}

export function EventBadge({ type, className = '' }: EventBadgeProps) {
  const baseClasses = 'inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap';
  
  switch (type) {
    case 'free':
      return <span title="Entrada libre / Sin costo" className={`${baseClasses} bg-accent text-black font-bold shadow-xs ${className}`}>Gratis</span>;
    case 'gem':
      return <span title="Joyita: Plan alternativo o espacio cultural independiente" className={`${baseClasses} border border-accent/80 text-text bg-accent/10 ${className}`}>◉ Joyita</span>;
    case 'newly-found':
      return <span title="Recién encontrado: Detectado e indexado por el radar" className={`${baseClasses} text-secondary bg-surface/50 border border-border/50 ${className}`}>◎ Recién encontrado</span>;
    case 'verified':
      return <span title="Verificado con el organizador o espacio cultural oficial" className={`${baseClasses} bg-surface text-text border border-border ${className}`}>✓ Verificado</span>;
    case 'last-spots':
      return <span title="Últimos cupos disponibles reportados" className={`${baseClasses} bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30 ${className}`}>Últimos cupos</span>;
    default:
      return null;
  }
}
