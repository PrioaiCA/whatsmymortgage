// Build-time OG image generator. Runs before the 11ty build (see
// package.json "build" script) and writes one 1200x630 branded PNG per
// page into src/assets/og/, which the existing src/assets passthrough copy
// then ships to _site/assets/og/.
//
// Text is set in a generic bold sans-serif rather than the site's Archivo
// self-hosted font: OG image rasterization happens via librsvg/fontconfig
// at build time, and a CI image is far more likely to have a system sans
// font available than our vendored webfont registered with fontconfig.
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import site from '../src/_data/site.js';
import calculators from '../src/_data/calculators.js';
import learnArticles from '../src/_data/learnArticles.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, '../src/assets/og');

const BG = '#f3f2f2';
const INK = '#201e1d';
const ACCENT = '#14487a';
const ACCENT_2 = '#a6600f';
const FONT = 'Liberation Sans, Arial, Helvetica, sans-serif';

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Rough word-wrap: no real text-metrics available at build time, so
// estimate character width as a fraction of font size (safe overestimate
// for a bold sans) and wrap on that.
function wrapLines(text, fontSize, maxWidth, maxLines) {
  const avgCharWidth = fontSize * 0.58;
  const maxChars = Math.floor(maxWidth / avgCharWidth);
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    const next = current ? current + ' ' + word : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  if (lines.length > maxLines) {
    const truncated = lines.slice(0, maxLines);
    truncated[maxLines - 1] = truncated[maxLines - 1].replace(/\s*\S*$/, '') + '…';
    return truncated;
  }
  return lines;
}

function card({ title, kicker }) {
  const fontSize = 66;
  const lineHeight = 78;
  const lines = wrapLines(title, fontSize, 1040, 3);
  const titleBlockHeight = lines.length * lineHeight;
  const startY = 630 / 2 - titleBlockHeight / 2 + fontSize * 0.7;

  const tspans = lines.map((line, i) => `<tspan x="80" y="${startY + i * lineHeight}">${esc(line)}</tspan>`).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <rect width="1200" height="630" fill="${BG}"/>
    <g transform="translate(80,72) scale(0.56)">
      <path d="M50,6 L92,42 L92,94 L8,94 L8,42 Z" fill="${ACCENT}"/>
      <path d="M50,50 L70,88 L30,88 Z" fill="${ACCENT_2}"/>
    </g>
    <text x="152" y="112" font-family="${FONT}" font-weight="800" font-size="30" fill="${INK}">What's My Mortgage</text>
    <text font-family="${FONT}" font-weight="800" font-size="${fontSize}" fill="${INK}" letter-spacing="-1">${tspans}</text>
    ${kicker ? `<text x="80" y="574" font-family="${FONT}" font-weight="700" font-size="22" fill="${ACCENT}" letter-spacing="2">${esc(kicker.toUpperCase())}</text>` : ''}
    <rect x="0" y="618" width="1200" height="12" fill="${ACCENT}"/>
  </svg>`;
}

async function writeCard(slug, opts) {
  const svg = card(opts);
  await sharp(Buffer.from(svg)).png().toFile(path.join(OUT_DIR, `${slug}.png`));
  console.log('  wrote', slug + '.png');
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log('Generating OG images →', OUT_DIR);

  await writeCard('default', { title: site.name, kicker: 'Free · No signup · Ontario' });
  await writeCard('home', { title: 'Free Ontario mortgage calculators, no signup', kicker: 'Free · No signup · Ontario' });
  await writeCard('learn', { title: 'Get to know mortgages', kicker: 'Learn' });
  await writeCard('mortgage-glossary', { title: 'Mortgage glossary, decoded', kicker: 'Jargon, decoded' });
  await writeCard('what-happens-next', { title: 'What happens after you apply?', kicker: 'The process' });
  await writeCard('what-youll-need', { title: 'What documents will you need?', kicker: 'Get ready' });
  await writeCard('sources', { title: 'Sources & method', kicker: 'Methodology' });
  await writeCard('about', { title: 'About WhatsMyMortgage.ca', kicker: 'About' });
  await writeCard('contact', { title: 'Contact', kicker: 'Contact' });
  await writeCard('privacy', { title: 'Privacy Policy', kicker: 'Legal' });
  await writeCard('terms', { title: 'Terms of Service', kicker: 'Legal' });

  for (const calc of calculators) {
    await writeCard(calc.slug, { title: calc.h1, kicker: calc.navTitle });
  }
  for (const article of learnArticles) {
    await writeCard(`learn-${article.slug}`, { title: article.title, kicker: article.group });
  }

  console.log('Done.');
}

main().catch((e) => { console.error(e); process.exit(1); });
