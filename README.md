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
```

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
