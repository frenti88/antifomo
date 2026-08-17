'use client';

import React, { useState, useEffect, useRef } from 'react';

interface SearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  onClose?: () => void;
}

export function SearchBar({ query, onQueryChange, onClose }: SearchBarProps) {
  const [localQuery, setLocalQuery] = useState(query);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (localQuery !== query) {
        onQueryChange(localQuery);
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [localQuery, onQueryChange, query]);

  return (
    <div className="relative flex items-center w-full px-4 py-2 bg-bg border-b border-border">
      <div className="absolute left-7 text-secondary">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      
      <input
        ref={inputRef}
        type="search"
        value={localQuery}
        onChange={(e) => setLocalQuery(e.target.value)}
        placeholder="Busca un plan, lugar o categoría"
        aria-label="Buscar eventos"
        className="w-full bg-surface text-text rounded-full py-2.5 pl-10 pr-10 outline-none focus:ring-2 focus:ring-accent transition-shadow text-base"
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
