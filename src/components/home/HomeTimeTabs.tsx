'use client';

import React from 'react';
import type { HomeTab } from '@/lib/home-selectors';

interface HomeTimeTabsProps {
  activeTab: HomeTab;
  onTabChange: (tab: HomeTab) => void;
}

const TABS: { id: HomeTab; label: string }[] = [
  { id: 'esta-noche', label: 'Esta noche' },
  { id: 'manana', label: 'Mañana' },
  { id: 'este-finde', label: 'Este finde' }
];

export function HomeTimeTabs({ activeTab, onTabChange }: HomeTimeTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
      {TABS.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-text ${
              isActive 
                ? 'bg-text text-bg border border-text' 
                : 'bg-surface/50 border border-border text-secondary hover:text-text hover:bg-surface'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
