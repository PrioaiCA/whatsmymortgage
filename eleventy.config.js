import nunjucks from 'nunjucks';
import { computers, defaultStates } from './src/assets/js/lib/calc-math/index.js';
import { getCalcFields } from './src/assets/js/lib/calcFields.js';
import { renderCalcForm } from './src/assets/js/lib/calcFormRender.js';
import { renderResultMetrics } from './src/assets/js/lib/resultCard.js';
import { renderContactCard } from './src/assets/js/lib/contactCard.js';
import { termButton } from './src/assets/js/lib/terms.js';

const safe = (html) => new nunjucks.runtime.SafeString(html);

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ 'src/assets': 'assets' });
  eleventyConfig.addPassthroughCopy({ 'src/_redirects': '_redirects' });
  eleventyConfig.addPassthroughCopy({ 'src/robots.txt': 'robots.txt' });
  if (eleventyConfig.addWatchTarget) eleventyConfig.addWatchTarget('src/assets');

  // ── Nunjucks globals — every one wraps the exact same math/render
  // modules the browser loads, so build-time HTML and client-side updates
  // never drift apart. Registered as globals (not shortcodes) so they're
  // callable as plain functions inside `{{ }}` expressions. ──

  eleventyConfig.addNunjucksFilter('termButton', (term) => safe(termButton(term)));
  eleventyConfig.addNunjucksFilter('jsonify', (obj) => JSON.stringify(obj));
  eleventyConfig.addNunjucksFilter('slugify', (str) => String(str).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  eleventyConfig.addNunjucksFilter('sortByLabel', (arr) => [...arr].sort((a, b) => a.label.localeCompare(b.label)));
  eleventyConfig.addNunjucksFilter('termsSorted', (termsObj) =>
    Object.entries(termsObj)
      .map(([key, [label, def]]) => ({ key, label, def }))
      .sort((a, b) => a.label.localeCompare(b.label))
  );
  eleventyConfig.addGlobalData('buildYear', () => new Date().getFullYear());
  eleventyConfig.addGlobalData('buildDate', () => new Date().toISOString().slice(0, 10));

  // Server-renders the slider/toggle form at its default values — real,
  // crawlable markup, not an empty div waiting on JS.
  eleventyConfig.addNunjucksGlobal('calcForm', (view) => {
    const s = defaultStates[view];
    const fields = getCalcFields(view, s);
    return safe(renderCalcForm(view, s, fields, '/sources/'));
  });

  // Server-renders the default result (the numbers a crawler — or an AI
  // answer engine — actually sees). The client controller recomputes and
  // patches this same #result-metrics markup on every slider/toggle change.
  eleventyConfig.addNunjucksGlobal('calcMetricsHtml', (view) => {
    const result = computers[view](defaultStates[view]);
    return safe(renderResultMetrics(result));
  });

  eleventyConfig.addNunjucksGlobal('contactCardHtml', (opts) => safe(renderContactCard(opts)));

  return {
    dir: {
      input: 'src',
      includes: '_includes',
      data: '_data',
      output: '_site'
    },
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk'
  };
}
