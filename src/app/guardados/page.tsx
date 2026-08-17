'use client';

import { useSavedEvents } from '@/hooks/useSavedEvents';
import { DEMO_EVENTS } from '@/data/events';
import { EventList } from '@/components/events/EventList';
import { EmptyState } from '@/components/ui/EmptyState';

export default function GuardadosPage() {
  const { savedEvents } = useSavedEvents(DEMO_EVENTS);

  return (
    <div className="max-w-2xl mx-auto px-4 pb-24 pt-8">
      <h1 className="text-2xl font-bold mb-6 text-text">Guardados</h1>

      {savedEvents.length > 0 ? (
        <EventList events={savedEvents} viewMode="agenda" />
      ) : (
        <EmptyState
          title="Todavía no has guardado planes"
          description="Guarda lo que te interese y arma tu próxima salida."
          actionLabel="Explorar eventos"
          actionHref="/explorar"
        />
      )}
    </div>
  );
}
