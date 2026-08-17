'use client';

import { useState, useEffect } from 'react';

type GeolocationStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable';
type Position = { lat: number; lng: number };

export function useGeolocation() {
  const [status, setStatus] = useState<GeolocationStatus>('idle');
  const [position, setPosition] = useState<Position | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus('unavailable');
      return;
    }

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          setStatus('granted');
        } else if (result.state === 'denied') {
          setStatus('denied');
        }
        
        result.onchange = () => {
          if (result.state === 'granted') {
            setStatus('granted');
          } else if (result.state === 'denied') {
            setStatus('denied');
          }
        };
      }).catch(() => {
        // Ignored
      });
    }
  }, []);

  const requestLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setStatus('unavailable');
      setError('Geolocalización no soportada en este dispositivo.');
      return;
    }

    setStatus('requesting');
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus('granted');
        setError(null);
      },
      (err) => {
        setStatus('denied');
        setError(err.message || 'Permiso denegado o error de ubicación.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return { status, position, requestLocation, error };
}
