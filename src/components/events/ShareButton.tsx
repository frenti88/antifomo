'use client';

import React, { useState } from 'react';
import type { AntiFOMOEvent } from '@/lib/types';
import { trackEvent } from '@/lib/analytics';
import { SITE_URL } from '@/lib/constants';

interface ShareButtonProps {
  event: AntiFOMOEvent;
  className?: string;
}

export function ShareButton({ event, className = '' }: ShareButtonProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleShare = async () => {
    const url = `${SITE_URL || window.location.origin}/evento/${event.slug}`;
    const shareData = {
      title: event.title,
      text: event.shortDescription,
      url,
    };

    trackEvent('event_share', { event_id: event.id });

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or failed
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        setToastMessage('Enlace copiado');
        setTimeout(() => setToastMessage(null), 3000);
      } catch (err) {
        console.error('Failed to copy', err);
      }
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={handleShare}
        aria-label="Compartir evento"
        className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-surface transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-text text-secondary hover:text-text"
      >
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
        </svg>
      </button>

      {toastMessage && (
        <div className="absolute top-full right-0 mt-2 whitespace-nowrap bg-text text-bg text-xs px-3 py-1.5 rounded shadow-lg z-50 animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
