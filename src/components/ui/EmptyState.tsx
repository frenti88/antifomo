import React from 'react';
import Link from 'next/link';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}

export function EmptyState({ title, description, actionLabel, actionHref, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      <div className="text-8xl text-surface mb-6 select-none" aria-hidden="true">
        ◎
      </div>
      <h2 className="text-xl font-bold text-text mb-2">{title}</h2>
      <p className="text-secondary mb-6 max-w-sm">{description}</p>
      
      {actionLabel && actionHref && (
        <Link 
          href={actionHref}
          className="inline-flex items-center justify-center bg-accent text-text font-semibold px-6 py-3 rounded-full hover:bg-accent/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-text min-h-[44px]"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
