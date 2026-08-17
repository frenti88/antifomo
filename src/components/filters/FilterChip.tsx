import React from 'react';

interface FilterChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
  icon?: string;
  className?: string;
}

export function FilterChip({ label, active, onClick, icon, className = '' }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded-full text-sm px-3 py-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-text ${
        active
          ? 'bg-accent text-text border border-transparent font-medium'
          : 'bg-surface text-secondary border border-border hover:bg-surface/80'
      } ${className}`}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      {label}
    </button>
  );
}
