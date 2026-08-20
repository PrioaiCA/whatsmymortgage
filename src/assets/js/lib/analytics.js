// Minimal instrumentation scaffold. No analytics vendor is wired in — this
// only queues GTM-shaped events on window.dataLayer so one can be connected
// later without touching any call site below.
export function track(event, data) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...(data || {}) });
}

export function trackPageView(intent) {
  track('page_view', { intent: intent || 'none', path: location.pathname });
}
