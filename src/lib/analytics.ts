// ─────────────────────────────────────────────
// AntiFOMO — Analytics Layer (Decoupled)
// ─────────────────────────────────────────────

/**
 * Decoupled analytics layer.
 * Replace the implementation with your analytics provider
 * (e.g., Plausible, Fathom, PostHog, GA4, Amplitude, etc.)
 */

type AnalyticsProperties = Record<string, string | number | boolean | undefined>;

export function trackEvent(eventName: string, properties?: AnalyticsProperties): void {
  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', eventName, properties);
  }

  // TODO: Replace with actual analytics provider
  // Example with Plausible:
  // if (typeof window !== 'undefined' && window.plausible) {
  //   window.plausible(eventName, { props: properties });
  // }
}

export function trackPageView(path: string, title?: string): void {
  trackEvent('page_view', { path, title });
}
