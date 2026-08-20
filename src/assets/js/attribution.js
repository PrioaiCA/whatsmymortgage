// Lightweight first-touch / last-touch capture for lead context. No
// cookies, no third-party script — just localStorage/sessionStorage, read
// by contact-controller.js at submit time.
const FIRST_KEY = 'wmm_first_touch';
const LAST_KEY = 'wmm_last_touch';

function readTouch() {
  const params = new URLSearchParams(window.location.search);
  const utm = {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach((k) => {
    const v = params.get(k);
    if (v) utm[k] = v;
  });
  return {
    url: window.location.href,
    referrer: document.referrer || '',
    utm,
    timestamp: new Date().toISOString()
  };
}

export function captureAttribution() {
  try {
    const touch = readTouch();
    if (!localStorage.getItem(FIRST_KEY)) {
      localStorage.setItem(FIRST_KEY, JSON.stringify(touch));
    }
    localStorage.setItem(LAST_KEY, JSON.stringify(touch));
  } catch (e) {
    // Storage unavailable (private browsing, etc.) — attribution is best-effort.
  }
}

export function getAttribution() {
  try {
    return {
      firstTouch: JSON.parse(localStorage.getItem(FIRST_KEY) || 'null'),
      lastTouch: JSON.parse(localStorage.getItem(LAST_KEY) || 'null')
    };
  } catch (e) {
    return { firstTouch: null, lastTouch: null };
  }
}
