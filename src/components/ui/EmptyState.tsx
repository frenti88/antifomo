import React from 'react';
import Link from 'next/link';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({ title, description, actionLabel, actionHref, onAction, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      <div className="text-7xl text-secondary/30 mb-5 select-none" aria-hidden="true">
        ◎
      </div>
      <h2 className="text-xl font-bold text-text mb-2 tracking-tight">{title}</h2>
      <p className="text-secondary mb-6 max-w-sm text-sm leading-relaxed">{description}</p>
      
      {actionLabel && actionHref && (
        <Link 
          href={actionHref}
          className="inline-flex items-center justify-center bg-accent text-black font-bold px-6 py-3 rounded-full hover:brightness-95 active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-text min-h-[44px] shadow-sm text-sm"
        >
          {actionLabel}
        </Link>
      )}

      {actionLabel && !actionHref && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center justify-center bg-accent text-black font-bold px-6 py-3 rounded-full hover:brightness-95 active:scale-95 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-text min-h-[44px] shadow-sm text-sm"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
