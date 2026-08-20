// Loaded on every page. Everything here is small: the glossary tooltip and
// lead-form wiring are needed almost everywhere, so they're the one shared
// bundle. Calculator math stays page-specific — see calc-controller.js.
import { initTooltips } from './tooltip.js';
import { initContactForms } from './contact-controller.js';
import { captureAttribution } from './attribution.js';

captureAttribution();
initTooltips(document.body);
initContactForms(document.body);
