# What's My Mortgage.ca

Free mortgage calculators for Ontario, built with the same math a lender
uses: what you can afford, renewal options, using home equity, breaking a
mortgage early, and renting versus buying.

A dependency-free, static single-page app — no build step, no framework.
Open `index.html` through any static file server (or `python3 -m http.server`)
and it runs.

## Structure

- `index.html` — entry point.
- `css/styles.css` — design tokens (the Modernist system: Archivo type, a
  single red accent, zero border-radius, strong dividers) and component
  classes, plus the site's layout.
- `js/calculators.js` — the mortgage math engine: semi-annual compounding,
  the OSFI stress test, GDS/TDS ratios, CMHC default-insurance premiums, and
  Ontario/Toronto land transfer tax.
- `js/calcFields.js` — the slider/toggle field definitions for each
  calculator.
- `js/content.js` — static copy: the jargon glossary, calculator cards,
  process steps, sources, etc.
- `js/format.js` — currency/percentage formatting helpers.
- `js/resultCard.js`, `js/contactCard.js`, `js/tooltip.js` — shared UI
  pieces (the results panel, the lead-capture form, the info-dot glossary
  tooltip).
- `js/views.js` — HTML for every page.
- `js/app.js` — state, hash-based routing, and event wiring. Calculator
  sliders/toggles patch just the results panel on every change so dragging
  a slider stays smooth; everything else does a full page re-render on
  navigation.

## Notes

- The "Connect me with an agent" form currently only logs the submitted
  lead to the console — there is no backend wired up yet.
- Voice input uses the browser's `SpeechRecognition` API where available.
- All calculations are estimates for educational use; see the in-app
  Sources & method page.
