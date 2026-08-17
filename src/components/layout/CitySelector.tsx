'use client';

import { useState, useRef, useEffect } from 'react';

const CITIES = [
  { id: 'mde', name: 'Medellín', active: true },
  { id: 'bog', name: 'Bogotá', active: false },
  { id: 'clo', name: 'Cali', active: false },
];

export default function CitySelector() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="font-medium flex items-center gap-1 hover:bg-surface px-2 py-1 rounded"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Seleccionar ciudad"
      >
        Medellín <span className="text-xs">▾</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-48 bg-surface border border-border rounded-lg shadow-xl overflow-hidden py-1 z-50">
          <ul role="menu">
            {CITIES.map((city) => (
              <li key={city.id} role="none">
                <button
                  role="menuitem"
                  className={`w-full text-left px-4 py-2 text-sm ${
                    city.active ? 'text-text hover:bg-surface' : 'text-secondary cursor-not-allowed opacity-50'
                  }`}
                  disabled={!city.active}
                  onClick={() => setIsOpen(false)}
                >
                  {city.name}
                  {!city.active && <span className="block text-xs">Próximamente</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
