'use client';

import React, { useEffect, useRef } from 'react';
import type { FilterState } from '@/lib/types';
import { FilterChip } from './FilterChip';
import { CATEGORIES, ZONES, PRICE_RANGES, TIME_OF_DAY_OPTIONS } from '@/data/categories';

interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: Partial<FilterState>) => void;
  eventCount: number;
}

export function FilterSheet({ open, onClose, filters, onFiltersChange, eventCount }: FilterSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    
    if (open) {
      if (!dialog.open) dialog.showModal();
    } else {
      if (dialog.open) dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  const handleClearFilters = () => {
    onFiltersChange({
      category: null,
      zone: null,
      priceRange: null,
      timeOfDay: null,
      showGems: false,
      showFree: false,
    });
  };

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      onClose={onClose}
      className="fixed inset-0 m-0 w-full max-w-none h-full bg-transparent backdrop:bg-black/50 p-0 open:flex open:justify-end lg:open:justify-end lg:p-4 lg:bg-black/20"
    >
      <div 
        className="mt-auto bg-bg w-full h-[85vh] lg:h-full lg:w-[400px] lg:mt-0 rounded-t-2xl lg:rounded-xl shadow-xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-full lg:slide-in-from-right-full duration-300"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-bold text-text">Filtros</h2>
          <button
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-surface transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-text"
            aria-label="Cerrar filtros"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-8 pb-24">
          <section>
            <h3 className="text-sm font-semibold text-text mb-3">Momento</h3>
            <div className="flex flex-wrap gap-2">
              {TIME_OF_DAY_OPTIONS.map(opt => (
                <FilterChip
                  key={opt.value}
                  label={opt.label}
                  active={filters.timeOfDay === opt.value}
                  onClick={() => onFiltersChange({ timeOfDay: filters.timeOfDay === opt.value ? null : opt.value })}
                />
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-text mb-3">Precio</h3>
            <div className="flex flex-wrap gap-2">
              {PRICE_RANGES.map(opt => (
                <FilterChip
                  key={opt.value}
                  label={opt.label}
                  active={filters.priceRange === opt.value}
                  onClick={() => onFiltersChange({ priceRange: filters.priceRange === opt.value ? null : opt.value })}
                />
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-text mb-3">Categoría</h3>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(opt => (
                <FilterChip
                  key={opt.value}
                  label={opt.label}
                  active={filters.category === opt.value}
                  onClick={() => onFiltersChange({ category: filters.category === opt.value ? null : opt.value })}
                />
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-text mb-3">Zona</h3>
            <div className="flex flex-wrap gap-2">
              {ZONES.map(opt => (
                <FilterChip
                  key={opt.value}
                  label={opt.label}
                  active={filters.zone === opt.value}
                  onClick={() => onFiltersChange({ zone: filters.zone === opt.value ? null : opt.value })}
                />
              ))}
            </div>
          </section>
          
          <section>
            <h3 className="text-sm font-semibold text-text mb-3">Especial</h3>
            <div className="flex flex-wrap gap-2">
              <FilterChip
                label="Solo Joyitas ◉"
                active={filters.showGems}
                onClick={() => onFiltersChange({ showGems: !filters.showGems })}
              />
            </div>
          </section>
        </div>

        <div className="p-4 border-t border-border bg-bg flex items-center justify-between">
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-sm font-medium text-secondary underline hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-text rounded px-2 py-1"
          >
            Limpiar filtros
          </button>
          
          <button
            type="button"
            onClick={onClose}
            className="bg-accent text-black font-bold px-6 py-3 rounded-full hover:bg-accent/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-text min-h-[44px]"
          >
            Ver {eventCount} eventos
          </button>
        </div>
      </div>
    </dialog>
  );
}
