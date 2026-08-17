import React from 'react';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({ 
  title = 'Algo salió mal', 
  description = 'Intenta de nuevo en un momento.',
  onRetry,
  className = ''
}: ErrorStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      <div className="text-6xl mb-6 select-none" aria-hidden="true">
        💔
      </div>
      <h2 className="text-xl font-bold text-text mb-2">{title}</h2>
      <p className="text-secondary mb-6 max-w-sm">{description}</p>
      
      {onRetry && (
        <button 
          onClick={onRetry}
          className="inline-flex items-center justify-center bg-text text-bg font-semibold px-6 py-3 rounded-full hover:bg-text/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent min-h-[44px]"
        >
          Reintentar
        </button>
      )}
    </div>
  );
}
