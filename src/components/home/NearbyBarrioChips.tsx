'use client';

import React, { useEffect, useState } from 'react';

const BARRIOS = ['Centro', 'El Poblado', 'Laureles', 'Envigado', 'Aranjuez', 'Belén'];
const STORAGE_KEY = 'antifomo_home_barrio';

interface NearbyBarrioChipsProps {
  onBarrioChange: (barrio: string) => void;
}

export function NearbyBarrioChips({ onBarrioChange }: NearbyBarrioChipsProps) {
  const [activeBarrio, setActiveBarrio] = useState<string>('');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && BARRIOS.includes(saved)) {
      setActiveBarrio(saved);
      onBarrioChange(saved);
    }
  }, [onBarrioChange]);

  const handleSelect = (barrio: string) => {
    setActiveBarrio(barrio);
    localStorage.setItem(STORAGE_KEY, barrio);
    onBarrioChange(barrio);
  };

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
      {BARRIOS.map(barrio => {
        const isActive = activeBarrio === barrio;
        return (
          <button
            key={barrio}
            onClick={() => handleSelect(barrio)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-text ${
              isActive 
                ? 'bg-text text-bg border border-text' 
                : 'bg-surface/50 border border-border text-secondary hover:text-text hover:bg-surface'
            }`}
          >
            {barrio}
          </button>
        );
      })}
    </div>
  );
}
