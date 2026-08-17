'use client';

import { useState, useEffect } from 'react';
import type { ViewMode } from '@/lib/types';
import { getViewMode, setViewMode as setStorageViewMode } from '@/lib/storage';

export function useViewMode() {
  const [viewMode, setViewModeState] = useState<ViewMode>('agenda');

  useEffect(() => {
    setViewModeState(getViewMode());
  }, []);

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    setStorageViewMode(mode);
  };

  return {
    viewMode,
    setViewMode,
    isAgenda: viewMode === 'agenda',
    isExplorar: viewMode === 'explorar'
  };
}
