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
      className={`inline-flex items-center gap-1.5 rounded-full text-sm px-3.5 py-1.5 active:scale-95 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-text min-h-[36px] ${
        active
          ? 'bg-accent text-black font-bold shadow-xs border border-transparent'
          : 'bg-surface text-text/80 hover:text-text border border-border hover:bg-surface/80 font-medium'
      } ${className}`}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      <span>{label}</span>
    </button>
  );
}
