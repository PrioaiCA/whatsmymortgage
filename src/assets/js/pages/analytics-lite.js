// Page-view + scroll-depth + glossary-interaction tracking for the pages
// that opt out of the common.js bundle (learn hub, glossary, learn
// articles) so they stay JS-free for everything but this.
import { track, trackPageView } from '../lib/analytics.js';

trackPageView(document.body.dataset.intent);

const article = document.querySelector('.learn-article');
if (article) {
  const seen = new Set();
  const thresholds = [25, 50, 75, 100];
  const onScroll = () => {
    const rect = article.getBoundingClientRect();
    if (!rect.height) return;
    const viewed = Math.min(rect.height, Math.max(0, window.innerHeight - rect.top));
    const pct = Math.round((viewed / rect.height) * 100);
    for (const t of thresholds) {
      if (pct >= t && !seen.has(t)) {
        seen.add(t);
        track('learn_scroll_depth', { depth: t, path: location.pathname });
      }
    }
    if (seen.size === thresholds.length) window.removeEventListener('scroll', onScroll);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// A term link elsewhere on the site (JS or not) always lands here as
// /mortgage-glossary/#key — that arrival is the interaction signal.
if (document.querySelector('.jargon-item') && location.hash) {
  track('glossary_interaction', { term: location.hash.slice(1), path: location.pathname });
}
