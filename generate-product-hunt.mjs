import opentype from 'opentype.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// Product Hunt launch gallery — 2026-09-02.
//
//   1270×760 gallery slides + a 240×240 thumbnail, in launch order.
//
// Every figure on these slides is traceable to something already published:
// the n=2,488 benchmark (/research/pitch-deck-clarity-benchmark-2026), the two
// homepage proof cards, and the patent set in the site's entity.ts. Nothing is
// illustrative. If a number here changes, change it in the source first.
//
// Design brief this answers: PH voters scroll a white page fast, so each slide
// carries a solid accent banner across the top with a short callout, content is
// pushed out to the margins, and the one number that matters is set large enough
// to survive a gallery thumbnail.
// ─────────────────────────────────────────────────────────────────────────────

const FONT_REG = opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-Regular.ttf');
const FONT_MED = opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-Medium.ttf');
const FONT_SEMI = opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-SemiBold.ttf');
const FONT_MONO = opentype.loadSync('./fonts/IBM_Plex_Mono/IBMPlexMono-Regular.ttf');
const FONT_MONO_MED = opentype.loadSync('./fonts/IBM_Plex_Mono/IBMPlexMono-Medium.ttf');

const ORANGE = '#DB4A2B';
const GREEN = '#147B58';
const ORANGE_LIFT = '#E26C53';  // small text on dark — canonical hue, lifted for contrast
const GREEN_LIFT = '#1AA274';
const KILL = '#C62828';
const KILL_LIFT = '#E85D5D';
const DARK = '#111119';
const CARD = '#1A1A2E';
const WHITE = '#FFFFFF';
const MUTED = '#8899AA';
const NEUTRAL_BAR = '#5A6B7C';   // the comparison bar — see the colour note in slide 5

const ASSET_DIR = './output/campaigns/20260902-product-hunt';
const PNG_DIR = path.join(ASSET_DIR, 'banners');
const SVG_DIR = path.join(ASSET_DIR, 'svg');
for (const d of [PNG_DIR, SVG_DIR]) fs.mkdirSync(d, { recursive: true });

const W = 1270, H = 760;
const PAD = 64;
const BANNER_H = 76;

// ── Text primitives ─────────────────────────────────────────────────────────
const getPath = (f, t, x, y, s) => f.getPath(t, x, y, s).toPathData(2);

function getWidth(font, text, size) {
  let w = 0;
  for (const ch of text) w += font.charToGlyph(ch).advanceWidth;
  return w * (size / font.unitsPerEm);
}
const sizeToFit = (font, text, targetW) => targetW / getWidth(font, text, 1);

const txt = (f, t, x, y, s, fill, op = 1) =>
  `<path d="${getPath(f, t, x, y, s)}" fill="${fill}"${op === 1 ? '' : ` opacity="${op}"`}/>`;

const txtRight = (f, t, x, y, s, fill, op = 1) => txt(f, t, x - getWidth(f, t, s), y, s, fill, op);

function tracked(font, text, x, y, size, fill, op, track) {
  const out = [];
  let cx = x;
  for (const c of [...text]) {
    if (c !== ' ') out.push(txt(font, c, cx, y, size, fill, op));
    cx += getWidth(font, c, size) + track;
  }
  return out;
}
const trackedWidth = (font, text, size, track) =>
  [...text].reduce((a, c) => a + getWidth(font, c, size), 0) + track * (text.length - 1);

function wrapExact(font, text, size, maxW) {
  const lines = [];
  let line = '';
  for (const word of String(text).split(/\s+/)) {
    const cand = line ? `${line} ${word}` : word;
    if (getWidth(font, cand, size) <= maxW || !line) line = cand;
    else { lines.push(line); line = word; }
  }
  if (line) lines.push(line);
  return lines;
}
const para = (font, text, x, y, size, maxW, lh, fill, op) =>
  wrapExact(font, text, size, maxW).map((l, i) => txt(font, l, x, y + i * lh, size, fill, op));

// ── Chrome ──────────────────────────────────────────────────────────────────
function backdrop() {
  const el = [`<rect width="${W}" height="${H}" fill="${DARK}"/>`];
  el.push(`<defs><linearGradient id="gf" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="${WHITE}" stop-opacity="0.05"/>
    <stop offset="60%" stop-color="${WHITE}" stop-opacity="0.02"/>
    <stop offset="100%" stop-color="${WHITE}" stop-opacity="0"/></linearGradient></defs>`);
  for (let x = 0; x <= W; x += 80) el.push(`<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="url(#gf)" stroke-width="1"/>`);
  for (let y = BANNER_H; y < H; y += 76) el.push(`<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="url(#gf)" stroke-width="1"/>`);
  el.push(`<path d="${getPath(FONT_SEMI, 'O', -110, 700, 760)}" fill="${GREEN}" opacity="0.05"/>`);
  return el;
}

// The solid accent band is the single biggest thumbnail-legibility win: it puts a
// high-contrast bar and a short callout at the top of every frame, so the gallery
// reads as a sequence even before anyone clicks in.
function banner(text, accent) {
  const size = 27, track = 2.4;
  const w = trackedWidth(FONT_SEMI, text, size, track);
  return [
    `<rect x="0" y="0" width="${W}" height="${BANNER_H}" fill="${accent}"/>`,
    ...tracked(FONT_SEMI, text, (W - w) / 2, 49, size, WHITE, 1, track),
  ];
}

function wordmarkRight(x, y, size) {
  const total = getWidth(FONT_SEMI, 'ask', size) + getWidth(FONT_SEMI, 'Odin', size);
  return [
    txt(FONT_SEMI, 'ask', x - total, y, size, ORANGE_LIFT),
    txt(FONT_SEMI, 'Odin', x - total + getWidth(FONT_SEMI, 'ask', size), y, size, GREEN_LIFT),
  ];
}

const card = (x, y, w, h, stroke = '#2E3350', fill = CARD, so = 1) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${fill}" stroke="${stroke}" stroke-opacity="${so}" stroke-width="1.5"/>`;

// Badge: a bordered pill, so a list of capabilities reads as interface furniture
// rather than as bullet points on a slide.
function badge(text, x, y, size = 19) {
  const padX = 16, h = size * 2.0;
  const w = getWidth(FONT_MED, text, size) + padX * 2;
  return {
    w, h,
    el: [
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${WHITE}" fill-opacity="0.055" stroke="${WHITE}" stroke-opacity="0.20" stroke-width="1.2"/>`,
      txt(FONT_MED, text, x + padX, y + h * 0.68, size, WHITE, 0.92),
    ],
  };
}

function chip(text, x, y, tone) {
  const size = 18, padX = 14, h = 36, track = 1.6;
  const w = trackedWidth(FONT_MONO_MED, text, size, track) + padX * 2;
  return {
    w,
    el: [
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${tone}" fill-opacity="0.16" stroke="${tone}" stroke-opacity="0.55" stroke-width="1.2"/>`,
      ...tracked(FONT_MONO_MED, text, x + padX, y + 24, size, tone, 1, track),
    ],
  };
}

// ── 1 · Hero ────────────────────────────────────────────────────────────────
// The launch copy leads with the median, not with a flattering score. That is the
// product: most decks fail, and the number is reproducible.
function heroSlide() {
  const el = [...backdrop(), ...banner('AI PITCH DECK STRESS-TESTING', ORANGE)];
  const top = BANNER_H;

  el.push(...tracked(FONT_MONO_MED, 'THE BENCHMARK', PAD, top + 92, 20, ORANGE_LIFT, 1, 5));
  el.push(txt(FONT_SEMI, 'We scored', PAD, top + 196, 62, WHITE, 0.95));
  el.push(txt(FONT_SEMI, '2,488', PAD, top + 316, 132, WHITE));
  // Stacked, not inline: the score panel starts at x=700 and an inline second
  // word ran under it.
  el.push(txt(FONT_SEMI, 'pitch decks.', PAD, top + 392, 62, WHITE, 0.95));
  el.push(`<rect x="${PAD}" y="${top + 436}" width="150" height="5" fill="${ORANGE}"/>`);
  el.push(...para(FONT_REG, 'One engine version. One four-week window. Every organic deck inside it, zeroes included.',
    PAD, top + 496, 25, 570, 36, WHITE, 0.72));
  el.push(...tracked(FONT_MONO, 'LLMS SUMMARIZE.  askODIN JUDGES.', PAD, top + 606, 22, WHITE, 0.5, 3));

  // Score panel — a 0–100 track with the median marked, so the figure is placed
  // on its scale instead of floating free.
  const px = 700, py = top + 70, pw = W - px - PAD, ph = 500;
  el.push(card(px, py, pw, ph, GREEN, '#141B22', 0.5));
  el.push(...tracked(FONT_MONO_MED, 'MEDIAN CLARITY SCORE™', px + 40, py + 58, 19, GREEN_LIFT, 1, 3.4));
  el.push(txt(FONT_SEMI, '35', px + 40, py + 232, 200, WHITE));
  el.push(txt(FONT_MED, '/100', px + 40 + getWidth(FONT_SEMI, '35', 200) + 14, py + 232, 52, WHITE, 0.45));

  const tx = px + 40, tw = pw - 80, ty = py + 282;
  el.push(`<rect x="${tx}" y="${ty}" width="${tw}" height="10" rx="5" fill="${WHITE}" fill-opacity="0.10"/>`);
  el.push(`<rect x="${tx}" y="${ty}" width="${tw * 0.35}" height="10" rx="5" fill="${ORANGE}"/>`);
  el.push(txt(FONT_MONO, '0', tx, ty + 38, 17, WHITE, 0.4));
  el.push(txtRight(FONT_MONO, '100', tx + tw, ty + 38, 17, WHITE, 0.4));

  const stats = [['31.7%', 'of decks scored exactly zero'], ['21.3%', 'reached investment grade']];
  stats.forEach(([n, label], i) => {
    const y = py + 372 + i * 66;
    el.push(txt(FONT_SEMI, n, tx, y, 38, WHITE, 0.95));
    el.push(txt(FONT_REG, label, tx + getWidth(FONT_SEMI, n, 38) + 18, y - 2, 21, WHITE, 0.62));
  });
  return el;
}

// ── 2 · The verdict ─────────────────────────────────────────────────────────
function verdictSlide() {
  const el = [...backdrop(), ...banner('SAME ENGINE. OPPOSITE VERDICTS.', GREEN)];
  const top = BANNER_H;
  el.push(...para(FONT_SEMI, 'Scored from public documents. Both results are reproducible.',
    PAD, top + 84, 34, W - PAD * 2, 46, WHITE, 0.95));

  const cw = (W - PAD * 2 - 30) / 2, ch = 400, cy = top + 130;
  const cards = [
    { x: PAD, score: '65', tone: GREEN_LIFT, chipText: 'THESIS VALID', title: 'Airbnb — 2009 Seed Deck',
      body: 'Category-creation signal overrode weak narrative framing. The structural unit economics held.' },
    { x: PAD + cw + 30, score: '0', tone: KILL_LIFT, chipText: 'KILL SHOT', title: 'Theranos — 2013 Investor Memo',
      body: 'A hardware physics violation: fingerstick draw volume cannot satisfy a multi-analyte assay claim.' },
  ];
  for (const c of cards) {
    el.push(card(c.x, cy, cw, ch, c.tone, CARD, 0.45));
    el.push(txt(FONT_SEMI, c.score, c.x + 36, cy + 148, 118, c.tone));
    const ch1 = chip(c.chipText, c.x + 36, cy + 178, c.tone);
    el.push(...ch1.el);
    el.push(...para(FONT_SEMI, c.title, c.x + 36, cy + 262, 26, cw - 72, 34, WHITE, 0.95));
    el.push(...para(FONT_REG, c.body, c.x + 36, cy + 320, 19, cw - 72, 28, WHITE, 0.62));
  }
  el.push(...tracked(FONT_MONO, 'THE NARRATIVE WAS IMMACULATE. THE REASONING DID NOT HOLD.', PAD, H - 44, 19, WHITE, 0.45, 3));
  el.push(...wordmarkRight(W - PAD, H - 44, 26));
  return el;
}

// ── 3 · Founders ────────────────────────────────────────────────────────────
function foundersSlide() {
  const el = [...backdrop(), ...banner('FOR FOUNDERS · FREE · NO LOGIN', ORANGE)];
  const top = BANNER_H;
  el.push(txt(FONT_SEMI, 'Crucible', PAD, top + 106, 62, WHITE));
  el.push(...para(FONT_REG, 'Find the logic gaps in your deck before a VC does. Every claim gets a verdict you can act on.',
    PAD, top + 160, 25, 780, 36, WHITE, 0.7));

  const tiers = [
    { chipText: 'PRIORITY', tone: GREEN_LIFT, body: 'Advance to diligence.' },
    { chipText: 'INVESTIGATE', tone: '#C9D3DE', body: 'Signal present, evidence thin.' },
    { chipText: 'KILL SHOT', tone: KILL_LIFT, body: 'A claim the document cannot survive.' },
  ];
  const cw = (W - PAD * 2 - 44) / 3, cy = top + 232, ch = 220;
  tiers.forEach((t, i) => {
    const x = PAD + i * (cw + 22);
    el.push(card(x, cy, cw, ch, t.tone, CARD, 0.4));
    el.push(...chip(t.chipText, x + 28, cy + 34, t.tone).el);
    el.push(...para(FONT_REG, t.body, x + 28, cy + 128, 22, cw - 56, 32, WHITE, 0.78));
  });

  el.push(...tracked(FONT_MONO_MED, 'EVERY VERDICT CARRIES THE LINE OF THE DOCUMENT THAT TRIGGERED IT',
    PAD, cy + ch + 78, 20, WHITE, 0.5, 3));
  el.push(...tracked(FONT_MONO_MED, 'CRUCIBLE.ASKODIN.APP', PAD, H - 44, 22, ORANGE_LIFT, 1, 4));
  el.push(...wordmarkRight(W - PAD, H - 44, 26));
  return el;
}

// ── 4 · Allocators ──────────────────────────────────────────────────────────
function allocatorsSlide() {
  const el = [...backdrop(), ...banner('FOR ALLOCATORS · SCORING + AUDIT LOG', GREEN)];
  const top = BANNER_H;
  el.push(txt(FONT_SEMI, 'Clarity', PAD, top + 106, 62, WHITE));
  el.push(...para(FONT_REG, 'Institutional scoring across a whole data room, with a record of how every verdict was reached.',
    PAD, top + 160, 25, 820, 36, WHITE, 0.7));

  const cols = [
    { label: 'ACCEPTS', items: ['Pitch decks', 'Data rooms', 'Financial models', 'Memos & updates'] },
    { label: 'RETURNS', items: ['Clarity Score™', 'Clarity Brief™', 'Judgment Graph™'] },
    { label: 'DELIVERY', items: ['Terminal', 'API', 'MCP Integration', 'Data Stream'] },
  ];
  const cw = (W - PAD * 2 - 44) / 3, cy = top + 224, ch = 336;
  cols.forEach((col, i) => {
    const x = PAD + i * (cw + 22);
    el.push(card(x, cy, cw, ch, GREEN, CARD, 0.42));
    el.push(...tracked(FONT_MONO_MED, col.label, x + 28, cy + 46, 19, GREEN_LIFT, 1, 4));
    let by = cy + 78;
    for (const item of col.items) {
      const b = badge(item, x + 28, by);
      el.push(...b.el);
      by += b.h + 12;
    }
  });
  el.push(...wordmarkRight(W - PAD, H - 44, 26));
  return el;
}

// ── 5 · The finding ─────────────────────────────────────────────────────────
// One measure across two sections, so the bars are NOT a categorical pair: the
// accent marks the failing section and the comparison sits in neutral ink. Green
// and orange were the obvious choice and are the wrong one — the validator puts
// that pair at ΔE 5.7 under protanopia, below even the secondary-encoding floor.
// Each bar is directly labelled, so identity never rests on colour.
function findingSlide() {
  const el = [...backdrop(), ...banner('WHERE DECKS ACTUALLY BREAK', ORANGE)];
  const top = BANNER_H;
  el.push(...para(FONT_SEMI, 'Founders describe the problem well and the business model badly.',
    PAD, top + 96, 42, W - PAD * 2, 56, WHITE, 0.95));

  const bars = [
    { label: 'Business Model Physics', pct: 67.0, fill: ORANGE, accent: true },
    { label: 'Problem Definition', pct: 17.9, fill: NEUTRAL_BAR, accent: false },
  ];
  const trackX = PAD, trackW = W - PAD * 2 - 150;
  bars.forEach((b, i) => {
    const y = top + 288 + i * 158;
    el.push(txt(FONT_MED, b.label, trackX, y, 28, WHITE, b.accent ? 0.95 : 0.72));
    const by = y + 26;
    el.push(`<rect x="${trackX}" y="${by}" width="${trackW}" height="46" rx="6" fill="${WHITE}" fill-opacity="0.07"/>`);
    el.push(`<rect x="${trackX}" y="${by}" width="${trackW * (b.pct / 100)}" height="46" rx="6" fill="${b.fill}"/>`);
    el.push(txt(FONT_SEMI, `${b.pct.toFixed(1)}%`, trackX + trackW + 26, by + 38, 44, WHITE, b.accent ? 1 : 0.7));
  });

  el.push(`<line x1="${PAD}" y1="${H - 118}" x2="${W - PAD}" y2="${H - 118}" stroke="${WHITE}" stroke-opacity="0.12" stroke-width="1.5"/>`);
  el.push(...para(FONT_REG, 'Share of 2,488 decks scoring below half marks on the section. A 3.7x spread between the weakest and strongest section of the same document.',
    PAD, H - 76, 20, 900, 28, WHITE, 0.55));
  el.push(...wordmarkRight(W - PAD, H - 44, 26));
  return el;
}

// ── 6 · The moat ────────────────────────────────────────────────────────────
function moatSlide() {
  const el = [...backdrop(), ...banner('FOUR U.S. PROVISIONAL PATENTS', GREEN)];
  const top = BANNER_H;
  el.push(...para(FONT_SEMI, 'Judgment you can inspect, on infrastructure you can cite.',
    PAD, top + 96, 40, W - PAD * 2, 52, WHITE, 0.95));

  const rows = [
    ['RUNE Protocol™', '63/948,559', 'Judgment compiler'],
    ['RAVEN Protocol™', '63/994,876', 'Cross-document triangulation'],
    ['NORN Protocol™', '64/011,252', 'Temporal semantic drift'],
    ['JUDGE Protocol™', '64/017,488', 'Runtime circuit breaker'],
  ];
  const ry = top + 156, rh = 66;
  rows.forEach((r, i) => {
    const y = ry + i * (rh + 12);
    el.push(card(PAD, y, W - PAD * 2, rh, GREEN, CARD, 0.32));
    el.push(txt(FONT_SEMI, r[0], PAD + 28, y + 43, 25, WHITE, 0.95));
    el.push(txt(FONT_REG, r[2], PAD + 300, y + 43, 21, WHITE, 0.6));
    const pn = `U.S. PROV. ${r[1]}`;
    el.push(...tracked(FONT_MONO_MED, pn, W - PAD - 28 - trackedWidth(FONT_MONO_MED, pn, 19, 2.4), y + 42, 19, GREEN_LIFT, 1, 2.4));
  });

  const fy = ry + 4 * (rh + 12) + 26;
  el.push(...tracked(FONT_MONO_MED, 'IPOS §34 NATIONAL SECURITY CLEARANCE · ISSUED 2026-03-26', PAD, fy + 24, 19, WHITE, 0.55, 3));
  el.push(...tracked(FONT_MONO_MED, '100,000+ BENCHMARKED CLARITY SCORES · THE CALIBRATION CORPUS', PAD, fy + 58, 19, WHITE, 0.55, 3));
  el.push(...wordmarkRight(W - PAD, H - 44, 26));
  return el;
}

// ── Thumbnail ───────────────────────────────────────────────────────────────
const O_PATH = 'M0 175.59L0 175.59Q-44.26 175.59-77.82 155.65Q-111.39 135.71-129.63 96.55Q-147.87 57.40-147.87 0L-147.87 0Q-147.87-57.40-129.63-96.55Q-111.39-135.71-77.82-155.65Q-44.26-175.59 0-175.59L0-175.59Q44.75-175.59 78.07-155.65Q111.39-135.71 129.63-96.55Q147.87-57.40 147.87 0L147.87 0Q147.87 57.40 129.63 96.55Q111.39 135.71 78.07 155.65Q44.75 175.59 0 175.59ZM0 118.68L0 118.68Q24.81 118.68 42.56 107.49Q60.31 96.31 70.04 75.64Q79.77 54.96 79.77 26.27L79.77 26.27L79.77-26.27Q79.77-55.45 70.04-75.88Q60.31-96.31 42.56-107.49Q24.81-118.68 0-118.68L0-118.68Q-23.83-118.68-41.83-107.49Q-59.83-96.31-69.80-75.88Q-79.77-55.45-79.77-26.27L-79.77-26.27L-79.77 26.27Q-79.77 54.96-69.80 75.64Q-59.83 96.31-41.83 107.49Q-23.83 118.68 0 118.68Z';
const DIAMOND_PATH = 'M 0 -43.029888 L 43.029888 0 L 0 43.029888 L -43.029888 0 Z';

function thumbnailSvg(S = 240) {
  const scale = ((S * 0.78) / (175.59 * 2)).toFixed(5);
  const half = S / 2;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-half} ${-half} ${S} ${S}" width="${S}" height="${S}">
  <title>askOdin</title>
  <rect x="${-half}" y="${-half}" width="${S}" height="${S}" fill="${DARK}"/>
  <g transform="scale(${scale})">
    <path d="${O_PATH}" fill="${GREEN}"/>
    <path d="${DIAMOND_PATH}" transform="scale(1.2)" fill="${ORANGE}"/>
  </g>
</svg>`;
}

// ── Emit ────────────────────────────────────────────────────────────────────
const svgFor = (title, el, w = W, h = H) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <title>${title}</title>
  ${el.join('\n  ')}
</svg>`;

async function emit(name, svg, w = W, h = H) {
  fs.writeFileSync(path.join(SVG_DIR, `${name}.svg`), svg);
  const buf = fs.readFileSync(path.join(SVG_DIR, `${name}.svg`));
  await sharp(buf, { density: 300 }).resize(w, h, { fit: 'fill' }).png().toFile(path.join(PNG_DIR, `${name}.png`));
  await sharp(buf, { density: 300 }).resize(w * 2, h * 2, { fit: 'fill' }).png().toFile(path.join(PNG_DIR, `${name}-2x.png`));
  console.log(`  ${name.padEnd(42)} ${w}x${h} + ${w * 2}x${h * 2}`);
}

async function main() {
  console.log('=== Product Hunt gallery (1270x760, launch order) ===\n');
  const slides = [
    ['askOdin-ph-1-benchmark', 'The benchmark', heroSlide()],
    ['askOdin-ph-2-verdict', 'Same engine, opposite verdicts', verdictSlide()],
    ['askOdin-ph-3-founders', 'For founders — Crucible', foundersSlide()],
    ['askOdin-ph-4-allocators', 'For allocators — Clarity', allocatorsSlide()],
    ['askOdin-ph-5-finding', 'Where decks break', findingSlide()],
    ['askOdin-ph-6-moat', 'Four provisional patents', moatSlide()],
  ];
  for (const [name, title, el] of slides) await emit(name, svgFor(`askOdin — ${title}`, el));
  await emit('askOdin-ph-thumbnail', thumbnailSvg(240), 240, 240);
  console.log(`\nWrote ${PNG_DIR}/\n`);
}

main().catch((err) => { console.error(err); process.exit(1); });
