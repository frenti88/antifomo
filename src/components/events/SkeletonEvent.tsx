import React from 'react';

export function SkeletonEvent() {
  return (
    <div className="animate-pulse border-b border-border py-4 px-4 w-full flex flex-col gap-2">
      <div className="h-4 bg-surface rounded w-16 mb-1"></div>
      <div className="h-6 bg-surface rounded w-3/4 mb-1"></div>
      <div className="h-4 bg-surface rounded w-full mb-1"></div>
      <div className="h-4 bg-surface rounded w-1/2 mb-2"></div>
      <div className="flex gap-2">
        <div className="h-6 bg-surface rounded w-16"></div>
        <div className="h-6 bg-surface rounded w-20"></div>
      </div>
    </div>
  );
}
