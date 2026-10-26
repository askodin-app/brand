import opentype from 'opentype.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// note.com eyecatch — 投資判断の防衛レール (The Diligence Stack, localized)
//
// Hero image for the first askOdin article on note.com: the Japanese
// localization of "The Diligence Stack: What GPs Actually Need in 2026"
// (askodin.app/insights/the-diligence-stack-what-gps-actually-need-in-2026/,
// pubDate 2026-08-28). The note post is its own publication moment, so the
// folder is dated to the note publication date, not the Substack one.
//
// note.com URLs are /<user>/n/<hash> — there is no readable slug to name the
// folder after, so the folder carries a descriptive slug instead. That is a
// departure from the URL-slug rule in CLAUDE.md, forced by the platform.
//
// ── Copy provenance ──────────────────────────────────────────────────────────
// The banner carries the Visa / Moody's triad at YS's explicit direction
// (2026-09-12), overriding its retirement. For whoever reads this next:
// askodin-coming-soon/src/pages/ja/index.astro:19 records the triad as
// "proposed for this page and rejected — do not reintroduce in either
// language", with the standards ledger named as its approved replacement, and
// generate-exec-brief-ja.mjs:233 follows that ruling. This file deliberately
// does not. Do not treat it as precedent for other JA surfaces.
//
// The triad is set in English only. No approved Japanese rendering of it
// exists — it was retired before one was written — so translating it here
// would be inventing Japanese brand copy outside the guard in
// askodin-coming-soon/scripts/check-compliance-lexicon.mjs. Proper nouns plus
// the canonical English line is the defensible form. The only other text is
// the JA landing page URL.
// ─────────────────────────────────────────────────────────────────────────────

const FONT_LIGHT = opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-Light.ttf');
const FONT_SEMI = opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-SemiBold.ttf');
const FONT_MONO = opentype.loadSync('./fonts/IBM_Plex_Mono/IBMPlexMono-Regular.ttf');

const ORANGE = '#DB4A2B';
const GREEN = '#147B58';
const DARK = '#111119';
const WHITE = '#FFFFFF';

const ASSET_DIR = './output/social/20260912-diligence-stack-note-ja';
const PNG_DIR = path.join(ASSET_DIR, 'banners');
const SVG_DIR = path.join(ASSET_DIR, 'svg');
for (const d of [PNG_DIR, SVG_DIR]) fs.mkdirSync(d, { recursive: true });

// note.com's own spec: 1280x670, ratio 1.91:1. Anything else is auto-cropped,
// and square or portrait art loses its top and bottom. note recommends
// 1920x1006 for higher quality, so one composition is rasterised at both,
// plus a 2x of the base.
const W = 1280;
const H = 670;
const MARGIN = 88;

// Type is left-aligned and the bottom-right is reserved for the logomark —
// the mirror of generate-docsend-banner.mjs, where DocSend overlays its own
// mark on the lower left.
const LOGOMARK_H = 104;

const O_PATH = 'M0 175.59L0 175.59Q-44.26 175.59-77.82 155.65Q-111.39 135.71-129.63 96.55Q-147.87 57.40-147.87 0L-147.87 0Q-147.87-57.40-129.63-96.55Q-111.39-135.71-77.82-155.65Q-44.26-175.59 0-175.59L0-175.59Q44.75-175.59 78.07-155.65Q111.39-135.71 129.63-96.55Q147.87-57.40 147.87 0L147.87 0Q147.87 57.40 129.63 96.55Q111.39 135.71 78.07 155.65Q44.75 175.59 0 175.59ZM0 118.68L0 118.68Q24.81 118.68 42.56 107.49Q60.31 96.31 70.04 75.64Q79.77 54.96 79.77 26.27L79.77 26.27L79.77-26.27Q79.77-55.45 70.04-75.88Q60.31-96.31 42.56-107.49Q24.81-118.68 0-118.68L0-118.68Q-23.83-118.68-41.83-107.49Q-59.83-96.31-69.80-75.88Q-79.77-55.45-79.77-26.27L-79.77-26.27L-79.77 26.27Q-79.77 54.96-69.80 75.64Q-59.83 96.31-41.83 107.49Q-23.83 118.68 0 118.68Z';
const DIAMOND_PATH = 'M 0 -43.029888 L 43.029888 0 L 0 43.029888 L -43.029888 0 Z';
const MARK_HEIGHT = 175.59 * 2;

const getPath = (font, text, x, y, size) => font.getPath(text, x, y, size).toPathData(2);

function getWidth(font, text, size) {
  let w = 0;
  for (const ch of text) w += font.charToGlyph(ch).advanceWidth;
  return w * (size / font.unitsPerEm);
}

// Advance width is linear in size, so one measurement at size 1 gives the exact
// size that fills a target measure.
const sizeToFit = (font, text, targetW) => targetW / getWidth(font, text, 1);

function trackedMono(text, x, y, size, fill, opacity, track) {
  const out = [];
  let cx = x;
  for (const c of [...text]) {
    if (c !== ' ') out.push(`<path d="${getPath(FONT_MONO, c, cx, y, size)}" fill="${fill}" opacity="${opacity}"/>`);
    cx += getWidth(FONT_MONO, c, size) + track;
  }
  return out;
}

// House chrome: orange hairline, fading grid, one oversized faint O bleeding
// off the left. The O sits behind the type rather than in the bottom-right,
// which keeps faint green out of the corner where the green logomark lands.
function backdrop() {
  const el = [`<rect width="${W}" height="${H}" fill="${DARK}"/>`];
  el.push(`<defs>
    <linearGradient id="gridFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${WHITE}" stop-opacity="0.05"/>
      <stop offset="55%" stop-color="${WHITE}" stop-opacity="0.022"/>
      <stop offset="100%" stop-color="${WHITE}" stop-opacity="0"/>
    </linearGradient>
  </defs>`);

  for (let x = 0; x <= W; x += 64) el.push(`<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="url(#gridFade)" stroke-width="1"/>`);
  for (let y = 56; y < H; y += 56) el.push(`<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="url(#gridFade)" stroke-width="1"/>`);

  el.push(`<path d="${getPath(FONT_SEMI, 'O', -110, 566, 700)}" fill="${GREEN}" opacity="0.05"/>`);
  el.push(`<rect width="${W}" height="4" fill="${ORANGE}"/>`);
  return el;
}

function logomark(cx, cy, height) {
  const scale = (height / MARK_HEIGHT).toFixed(5);
  return `<g transform="translate(${cx} ${cy}) scale(${scale})">
    <path d="${O_PATH}" fill="${GREEN}"/>
    <path d="${DIAMOND_PATH}" transform="scale(1.2)" fill="${ORANGE}"/>
  </g>`;
}

function eyecatchSvg() {
  const el = backdrop();

  // The three lines are set to one size: the largest that fits every line in
  // the measure, each measured in the face it is actually drawn in. The
  // punchline is SemiBold and therefore the widest, so it usually governs.
  const measure = 700;
  const head = 'askOdin verifies ';
  const tail = 'judgment.';
  const size = Math.min(
    sizeToFit(FONT_LIGHT, 'Visa verifies transactions.', measure),
    sizeToFit(FONT_LIGHT, 'Moody’s verifies credit.', measure),
    measure / (getWidth(FONT_SEMI, head, 1) + getWidth(FONT_SEMI, tail, 1)),
  );

  const leading = size * 1.30;
  const firstBaseline = 252;

  el.push(`<path d="${getPath(FONT_LIGHT, 'Visa verifies transactions.', MARGIN, firstBaseline, size)}" fill="${WHITE}" opacity="0.92"/>`);
  el.push(`<path d="${getPath(FONT_LIGHT, 'Moody’s verifies credit.', MARGIN, firstBaseline + leading, size)}" fill="${WHITE}" opacity="0.92"/>`);

  // Punchline: "askOdin verifies " white, "judgment." as the single orange
  // accent — the canonical setting from generate-docsend-banner.mjs.
  const punchY = firstBaseline + 2 * leading;
  const headW = getWidth(FONT_SEMI, head, size);
  el.push(`<path d="${getPath(FONT_SEMI, head, MARGIN, punchY, size)}" fill="${WHITE}"/>`);
  el.push(`<path d="${getPath(FONT_SEMI, tail, MARGIN + headW, punchY, size)}" fill="${ORANGE}"/>`);

  el.push(`<line x1="${MARGIN}" y1="${punchY + 44}" x2="${MARGIN + 64}" y2="${punchY + 44}" stroke="${ORANGE}" stroke-width="3"/>`);

  // The one piece of metadata: where a note reader goes next. The JA landing
  // page, not the English root.
  el.push(...trackedMono('ASKODIN.APP/JA', MARGIN, H - MARGIN, 17, WHITE, 0.5, 5));
  el.push(logomark(W - MARGIN - LOGOMARK_H / 2, H - MARGIN - LOGOMARK_H / 2, LOGOMARK_H));

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <title>askOdin — note.com eyecatch — The Diligence Stack (JA)</title>
  ${el.join('\n  ')}
</svg>`;
}

async function main() {
  console.log('=== note.com eyecatch — The Diligence Stack (JA) ===\n');

  const name = 'askOdin-diligence-stack-note-ja';
  const svg = eyecatchSvg();
  fs.writeFileSync(path.join(SVG_DIR, `${name}.svg`), svg);
  const buf = fs.readFileSync(path.join(SVG_DIR, `${name}.svg`));

  // One composition, three raster sizes. 1280x670 is note's spec, 1920x1006 is
  // its higher-quality recommendation, 2560x1340 is the retina master.
  for (const [w, h, suffix] of [[1280, 670, ''], [1920, 1006, '-1920'], [2560, 1340, '-2x']]) {
    const file = path.join(PNG_DIR, `${name}${suffix}.png`);
    await sharp(buf, { density: 300 }).resize(w, h, { fit: 'fill' }).png().toFile(file);
    console.log(`  ${path.basename(file).padEnd(42)} ${w}x${h}  ${(fs.statSync(file).size / 1024).toFixed(0)}KB`);
  }

  console.log(`\nWrote ${ASSET_DIR}/\n`);
}

main().catch((err) => { console.error(err); process.exit(1); });
