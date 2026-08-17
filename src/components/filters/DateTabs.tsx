'use client';

import React from 'react';
import type { DateFilter } from '@/lib/types';
import { DATE_FILTERS } from '@/data/categories';

interface DateTabsProps {
  activeDate: DateFilter | null;
  onDateChange: (date: DateFilter | null) => void;
}

export function DateTabs({ activeDate, onDateChange }: DateTabsProps) {
  return (
    <nav role="tablist" className="flex overflow-x-auto gap-2 px-4 py-2 no-scrollbar w-full">
      {DATE_FILTERS.map((filter) => {
        const isActive = activeDate === filter.value;
        return (
          <button
            key={filter.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => onDateChange(isActive ? null : filter.value)}
            className={`min-w-fit h-11 px-5 rounded-full text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-text ${
              isActive 
                ? 'bg-accent text-black font-bold shadow-xs' 
                : 'bg-surface text-text hover:bg-surface/80 font-medium'
            }`}
          >
            {filter.label}
          </button>
        );
      })}
    </nav>
  );
}
