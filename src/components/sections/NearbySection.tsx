'use client';

import { EditorialSection } from './EditorialSection';
import { useGeolocation } from '@/hooks/useGeolocation';
import { ZONES } from '@/data/categories';
import { useState } from 'react';

export function NearbySection() {
  const { status, requestLocation } = useGeolocation();
  const [selectedZone, setSelectedZone] = useState('');

  return (
    <EditorialSection
      id="nearby-section"
      title="Cerca de ti"
    >
      <div className="bg-surface border border-border p-5 rounded-lg">
        {status === 'idle' || status === 'requesting' ? (
          <div className="text-center py-2">
            <p className="text-sm text-secondary mb-4">
              Usaremos tu ubicación únicamente para ordenar planes cercanos. No la guardamos ni la compartimos.
            </p>
            <button
              onClick={requestLocation}
              disabled={status === 'requesting'}
              className="bg-accent text-black font-semibold py-3 px-6 rounded-full w-full sm:w-auto min-h-[44px]"
            >
              {status === 'requesting' ? 'Obteniendo ubicación...' : 'Ver planes cerca'}
            </button>
          </div>
        ) : status === 'granted' ? (
          <div className="text-center py-4">
            <span className="text-2xl mb-2 block">📍</span>
            <p className="font-medium text-text">Mostrando planes cercanos</p>
            <p className="text-sm text-secondary mt-1">
              (La distancia real estará disponible próximamente)
            </p>
          </div>
        ) : (
          <div className="py-2">
            <p className="text-sm text-secondary mb-4 text-center">
              No tenemos acceso a tu ubicación. Puedes elegir tu zona manualmente:
            </p>
            <label htmlFor="zone-select" className="sr-only">Seleccionar zona</label>
            <select
              id="zone-select"
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="w-full bg-bg border border-border text-text rounded-lg px-4 py-3 min-h-[44px] focus:ring-2 focus:ring-accent outline-none"
            >
              <option value="">Selecciona tu zona...</option>
              {ZONES.map((zone) => (
                <option key={zone.value} value={zone.value}>
                  {zone.label}
                </option>
              ))}
            </select>
            {selectedZone && (
              <p className="text-sm text-text mt-4 text-center">
                Mostrando planes en <strong>{ZONES.find(z => z.value === selectedZone)?.label}</strong>
              </p>
            )}
          </div>
        )}
      </div>
    </EditorialSection>
  );
}
