import opentype from 'opentype.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const FONT_SEMI = opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-SemiBold.ttf');
const FONT_REG = opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-Regular.ttf');
const FONT_MONO = opentype.loadSync('./fonts/IBM_Plex_Mono/IBMPlexMono-Regular.ttf');

const ORANGE = '#DB4A2B';
const GREEN = '#147B58';
const DARK = '#111119';
const DARK_CARD = '#1E293B';
const WHITE = '#FFFFFF';
const MUTED = '#8899AA';

// LinkedIn profile cover — identity furniture, replaced in place rather than published
// once, so it lives at a stable undated path.
//
// Premium covers rotate up to five images. Slide 1 is the one the homepage card and
// every thumbnail show, so it keeps the original askOdin-linkedin-banner.* paths
// (the brand guidelines link them); slides 2-5 sit beside it, numbered in upload order.
const OUTPUT_DIR = './output/profile';
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// LinkedIn cover image: 1584 x 396
const W = 1584;
const H = 396;

// The cover is read at three very different scales.
//
// Homepage left-rail card: the whole canvas shrinks to ~225 x 56 CSS px (14%), and
// the avatar covers the left third. Anything under ~64px is noise at that scale —
// the original 62px wordmark and 30px tagline rendered at 9px and 4px. Only slide 1
// is ever seen there, so only slide 1 is built for it.
//
// Mobile profile: ~390px wide (25%), with ~8-10% trimmed off each side. Slides 2-5
// are built for this: headline lines stay at 56px+ (14px on a phone); smaller
// supporting lines are read on the desktop profile (~51%).
//
// Desktop profile: the avatar sits bottom-left over roughly the first 400 x 160px.
//
// Zones, identical on every slide so only the text block changes as it rotates:
// 0-460 is left empty for the avatar, a rule marks 480, and content right-aligns
// to 1416, leaving a 168px buffer for mobile edge cropping.
const ZONE_LEFT = 480;
const CONTENT_RIGHT = 1416;
const CONTENT_W = CONTENT_RIGHT - ZONE_LEFT - 40;

// Copy is held to the site's claims canon (askodin-coming-soon/CLAUDE.md and
// src/data/entity.ts): claimed marks carry ™, product names do not, patent lines
// follow brand guidelines 7.4, and IPOS §34 and the Visa/Moody's triplet are retired.

const width = (font, text, size) => font.getAdvanceWidth(text, size);

function text(font, str, x, y, size, fill) {
  return `<path d="${font.getPath(str, x, y, size).toPathData(2)}" fill="${fill}"/>`;
}

// Right-aligned run of differently styled segments, e.g. the two-tone wordmark.
function runRight(segments, y, right = CONTENT_RIGHT) {
  let x = right - segments.reduce((sum, s) => sum + width(s.font, s.text, s.size), 0);
  return segments.map((s) => {
    const out = text(s.font, s.text, x, y, s.size, s.fill);
    x += width(s.font, s.text, s.size);
    return out;
  });
}

// Largest size up to `max` at which the text fits the content zone.
function fit(font, str, max) {
  return Math.min(max, Math.floor(CONTENT_W / width(font, str, 1)));
}

function frame(content) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <title>askOdin LinkedIn Cover</title>
  <rect width="${W}" height="${H}" fill="${DARK}"/>
  <rect width="${W}" height="6" fill="${ORANGE}"/>
  <line x1="${ZONE_LEFT}" y1="56" x2="${ZONE_LEFT}" y2="${H - 56}" stroke="${DARK_CARD}" stroke-width="2"/>
  ${content.flat().join('\n  ')}
</svg>`;
}

const wordmark = (size, y) => runRight([
  { font: FONT_SEMI, text: 'ask', size, fill: ORANGE },
  { font: FONT_SEMI, text: 'Odin', size, fill: GREEN },
], y);

// The comprehensive form — brand guidelines 7.4 fixes it for cover banners.
const PATENT_LINE = 'U.S. Patents Pending: 63/948,559 · 63/994,876 · 64/011,252 · 64/017,488';

// ── Slide 1: the entity — the only slide the thumbnail ever shows ──────────────
function slideCategory() {
  const cat = 'AI Judgment Infrastructure™';
  return frame([
    wordmark(150, 188),                                                   // ~21px in the homepage card
    runRight([{ font: FONT_SEMI, text: cat, size: fit(FONT_SEMI, cat, 64), fill: WHITE }], 266),
    runRight([{ font: FONT_MONO, text: PATENT_LINE, size: fit(FONT_MONO, PATENT_LINE, 24), fill: MUTED }], 322),
  ]);
}

// Slides 2-5 speak to the allocator, not the engineer: the buyer's verbs (deal
// memo, IC, pitch deck vs. spreadsheet), never the engine's (compiler,
// probabilistic, semantic drift). Scope still follows the site canon — Clarity is
// pre-IC triage; no QoE, no CIM reconciliation, no IPOS §34.

// ── Slide 2: the hook — the homepage H1, and where to go ───────────────────────
function slideCredo() {
  const l2 = 'Audit the reasoning before you write the check.';
  return frame([
    runRight([{ font: FONT_SEMI, text: 'Hope is not an asset class.', size: fit(FONT_SEMI, 'Hope is not an asset class.', 72), fill: WHITE }], 170),
    runRight([{ font: FONT_REG, text: l2, size: fit(FONT_REG, l2, 48), fill: WHITE }], 240),
    runRight([{ font: FONT_MONO, text: 'askodin.app', size: 34, fill: GREEN }], 322),
  ]);
}

// ── Slide 3: the conflict — the doctrine aphorism, and what it means in a deal ─
function slideTension() {
  const l1 = 'LLMs optimize for persuasion.';
  const l2 = ' compiles for physics.';
  const l3 = 'Pitch decks cross-examined against the spreadsheet, before the IC.';
  const size = Math.min(fit(FONT_SEMI, l1, 68), fit(FONT_SEMI, 'askOdin' + l2, 68));
  return frame([
    runRight([{ font: FONT_SEMI, text: l1, size, fill: MUTED }], 162),
    runRight([
      { font: FONT_SEMI, text: 'ask', size, fill: ORANGE },
      { font: FONT_SEMI, text: 'Odin', size, fill: GREEN },
      { font: FONT_SEMI, text: l2, size, fill: WHITE },
    ], 246),
    runRight([{ font: FONT_REG, text: l3, size: fit(FONT_REG, l3, 34), fill: WHITE }], 316),
  ]);
}

// ── Slide 4: the product — Clarity, for the allocator reading the profile ──────
function slideClarity() {
  const desc = 'Audits deal memos against the models behind them';
  return frame([
    runRight([
      { font: FONT_SEMI, text: 'askOdin ', size: 88, fill: WHITE },
      { font: FONT_SEMI, text: 'Clarity', size: 88, fill: GREEN },
    ], 160),
    runRight([{ font: FONT_SEMI, text: desc, size: fit(FONT_SEMI, desc, 44), fill: WHITE }], 232),
    runRight([{ font: FONT_MONO, text: 'VC \u00B7 PE \u00B7 Family offices \u00B7 LPs \u00B7 askodin.app/clarity', size: 26, fill: MUTED }], 310),
  ]);
}

// ── Slide 5: the moat — the four filings, protocol ↔ number as on the site ─────
function slidePatents() {
  const rows = [
    ['RUNE Protocol\u2122', 'Narrative logic audit', '63/948,559'],
    ['RAVEN Protocol\u2122', 'Cross-document triangulation', '63/994,876'],
    ['NORN Protocol\u2122', 'Narrative inflation over time', '64/011,252'],
    ['JUDGE Protocol\u2122', 'Hallucination interception', '64/017,488'],
  ];
  const out = [
    runRight([{ font: FONT_SEMI, text: 'Proprietary Verification Architecture', size: fit(FONT_SEMI, 'Proprietary Verification Architecture', 56), fill: WHITE }], 108),
    // The compact form (brand guidelines 7.4); the numbers sit in the table.
    runRight([{ font: FONT_MONO, text: 'U.S. Patents Pending', size: 24, fill: MUTED }], 150),
  ];
  // Three columns: number flush right, description and name right-aligned to fixed stops.
  const numStop = CONTENT_RIGHT;
  const descStop = numStop - width(FONT_MONO, '00/000,000', 26) - 32;
  const nameStop = descStop - Math.max(...rows.map((r) => width(FONT_REG, r[1], 30))) - 32;
  rows.forEach(([name, desc, num], i) => {
    const y = 206 + i * 44;
    out.push(runRight([{ font: FONT_SEMI, text: name, size: 30, fill: ORANGE }], y, nameStop));
    out.push(text(FONT_REG, desc, nameStop + 32, y, 30, WHITE));
    out.push(runRight([{ font: FONT_MONO, text: num, size: 26, fill: MUTED }], y, numStop));
  });
  return frame(out);
}

const SLIDES = [
  ['askOdin-linkedin-banner', slideCategory],
  ['askOdin-linkedin-banner-2-credo', slideCredo],
  ['askOdin-linkedin-banner-3-tension', slideTension],
  ['askOdin-linkedin-banner-4-clarity', slideClarity],
  ['askOdin-linkedin-banner-5-patents', slidePatents],
];

async function main() {
  console.log('=== LinkedIn Cover Generator (5 x 1584 x 396) ===\n');
  for (const [name, build] of SLIDES) {
    const svg = build();
    fs.writeFileSync(path.join(OUTPUT_DIR, `${name}.svg`), svg);
    const buf = Buffer.from(svg);
    await sharp(buf, { density: 300 }).resize(W, H, { fit: 'fill' }).png()
      .toFile(path.join(OUTPUT_DIR, `${name}.png`));
    await sharp(buf, { density: 300 }).resize(W * 2, H * 2, { fit: 'fill' }).png()
      .toFile(path.join(OUTPUT_DIR, `${name}-2x.png`));
    console.log(`${name}: svg, png, 2x png`);
  }
}

main().catch(console.error);
