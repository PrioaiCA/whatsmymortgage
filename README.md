# What's My Mortgage.ca

Free mortgage calculators for Ontario, built with the same math a lender
uses: what you can afford, renewal options, using home equity, breaking a
mortgage early, and renting versus buying.

A static, multi-page site built with [Eleventy (11ty)](https://www.11ty.dev/) —
every route is its own crawlable HTML document with real content and Open
Graph tags in the source, not a client-rendered shell. The calculator
JavaScript is vanilla, split per calculator, and loaded only on the page
that needs it.

## Build & run

```
npm install
npm run build   # writes static output to _site/
npm run serve   # build + local dev server with live reload
```

Deployed on Cloudflare Pages: build command `npx @11ty/eleventy`, output
directory `_site`, auto-deploying on push to `main`.

## Structure

```
src/
  _data/            global data: site.js, calculators.js (the 5 calculator
                     pages' routing + SEO + intent tier), learnArticles.js
  _includes/
    layouts/base.njk    <head> (title/description/canonical/OG/Twitter/JSON-LD),
                         nav, footer, script tags
    partials/           nav.njk, footer.njk, cta.njk
  assets/
    css/main.css        design tokens (Modernist: Archivo type, one red
                         accent, zero border-radius, strong dividers) +
                         component classes + layout
    js/
      lib/               environment-agnostic modules used BOTH at 11ty
                          build time (to server-render real content) and in
                          the browser (to patch it live) — calc-math/*,
                          format.js, resultCard.js, contactCard.js,
                          calcFormRender.js, content.js, calcFields.js
      pages/              one tiny entry script per calculator page,
                           importing only that calculator's math module
      common.js, tooltip.js, contact-controller.js, calc-controller.js,
      attribution.js, leadContext.js   browser-only controllers
  index.njk, mortgage-calculators.njk (paginated over the 5 calculators),
  learn/, mortgage-glossary/, sources/, ... one directory per route
functions/api/lead.js   Cloudflare Pages Function: validates + honeypots +
                         forwards a lead to the n8n webhook (LEAD_WEBHOOK_URL
                         env var — never in the repo)
scripts/build-og-images.js   generates the per-page branded OG images
                         (src/assets/og/*.png, committed — see below)
```

## Content pages

`/learn/` (hub + one article per slug), `/mortgage-glossary/` (every term,
each a real anchor other pages link to), `/what-happens-next/`,
`/what-youll-need/`, `/sources/`, `/about/`, `/contact/`, `/privacy/`,
`/terms/` — plus `/sitemap.xml` and `/robots.txt`. Every page ships a
unique title (≤60 chars), description (≤155 chars), canonical URL, OG/Twitter
tags with a branded per-page image, and JSON-LD (`WebApplication` on
calculators, `Article` on learn pages, `DefinedTermSet` on the glossary,
`FAQPage` on the document checklist).

## Conversion design

The contact form's position and tone follow the calculator's intent tier
(`calculators.js` → `intent: 'high' | 'medium' | 'low'`): high-intent
calculators (renewal, refinance, penalty) embed it directly under the
result with an intent-qualifying field; medium (affordability) shows it
lower, softened; low (rent vs. buy) shows no form at all, just a link to
whatever's actually useful next. Every calculator result also links to one
logical next page regardless of tier. No calculator ever gates a result
behind the form.

## Accessibility

Automated with axe-core (`@axe-core/playwright`) against every page — 0
WCAG 2 A/AA violations as of this build. Notably: text-sized accent-red
uses the `--color-accent-700` ramp step rather than the base `--color-accent`
(which the source design system's own docs describe as tuned for icons/large
text/UI chrome at ~3.8:1, not the 4.5:1 body-text minimum); button/toggle
fills use `--color-accent-600` with white text for the same reason. A
skip-link, visible `:focus-visible` rings, and associated `<label for>` /
`<select>` names round it out. Re-run the scan after CSS/copy changes — it's
cheap and catches regressions fast (see the audit script pattern used during
this build; not checked in, easy to recreate with `@axe-core/playwright`).

The same render functions run twice: once in Node during the 11ty build (so
the HTML a crawler sees already has real numbers and copy in it), and again
in the browser after a slider or toggle changes. They can't drift apart
because they're the same file.

## Do not change

Calculator math and formulas, result wording and notes, glossary
definitions, footer legal text and disclosure, consent checkbox wording,
and the rule that no result ever requires an email address. See
`src/assets/js/lib/calc-math/*.js` and `src/assets/js/lib/content.js`.

## Notes

- Lead submissions POST to `/api/lead` (Cloudflare Pages Function), which
  validates, checks a honeypot field, and forwards a rich payload (which
  calculator, every input, the headline result, page URL, referrer,
  first/last-touch, consent text, timestamp) to `LEAD_WEBHOOK_URL`.
- No result is ever gated behind the contact form.
