'use client';

import React, { useState, useEffect, useRef } from 'react';

interface SearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  onClose?: () => void;
  autoFocus?: boolean;
  placeholder?: string;
}

export function SearchBar({ 
  query, 
  onQueryChange, 
  onClose,
  autoFocus = false,
  placeholder = "Busca por plan, artista, lugar o categoría..."
}: SearchBarProps) {
  const [localQuery, setLocalQuery] = useState(query);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (localQuery !== query) {
        onQueryChange(localQuery);
      }
    }, 250);
    return () => clearTimeout(handler);
  }, [localQuery, onQueryChange, query]);

  return (
    <div className="relative flex items-center w-full">
      <div className="absolute left-4 text-secondary pointer-events-none">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      
      <input
        ref={inputRef}
        type="search"
        value={localQuery}
        onChange={(e) => setLocalQuery(e.target.value)}
        placeholder={placeholder}
        aria-label="Buscar eventos"
        className="w-full bg-surface/70 hover:bg-surface/90 border border-border text-text rounded-2xl py-3 pl-11 pr-10 outline-none focus:border-accent focus:ring-2 focus:ring-accent transition-all text-sm sm:text-base placeholder:text-secondary/70 shadow-xs"
      />
      
      {localQuery && (
        <button
          type="button"
          onClick={() => {
            setLocalQuery('');
            onQueryChange('');
            inputRef.current?.focus();
          }}
          className="absolute right-12 w-8 h-8 flex items-center justify-center text-secondary hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-text rounded-full"
          aria-label="Borrar búsqueda"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-2 px-3 py-2 text-sm font-medium text-text hover:bg-surface rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-text"
        >
          Cancelar
        </button>
      )}
    </div>
  );
}
