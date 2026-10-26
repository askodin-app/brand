import opentype from 'opentype.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// note.com eyecatch — The Judgment Stack EP 01 (JA)
//
// Hero image for the note article
//   【Podcast】VC投資を直感から構造工学へ：1.25兆ドルの判断ボトルネックを解く
//   決定論的AI (The Judgment Stack EP 01)
//
// Episode art, so it is filed under the podcast's own namespace
// (output/podcast/episodes/), never output/social/ — see generate-podcast.mjs.
// note.com URLs carry no readable slug, so the folder takes a descriptive one,
// the same departure generate-diligence-stack-note-ja.mjs documents. The date is
// the note publication date; change DATE here if it ships on another day.
//
// ── Copy provenance ──────────────────────────────────────────────────────────
// Every Japanese string is the episode title as YS wrote it, split at its own
// colon — nothing is translated or reworded here. 【Podcast】 is note title
// furniture and the show name moves to the eyebrow, so neither is repeated in
// the headline. Checked by hand against the JA rules in
// askodin-coming-soon/scripts/check-compliance-lexicon.mjs (2026-09-14): no hits.
//
// 1.25兆ドル is a headline figure from the episode title, not a data-card stat;
// if it ever moves onto a card it needs its source in the footer.
// ─────────────────────────────────────────────────────────────────────────────

const F = {
  semi: opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-SemiBold.ttf'),
  medium: opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-Medium.ttf'),
  mono: opentype.loadSync('./fonts/IBM_Plex_Mono/IBMPlexMono-Regular.ttf'),
  jpBold: opentype.loadSync('./fonts/Noto_Sans_JP/NotoSansJP-Bold.ttf'),
  jpMedium: opentype.loadSync('./fonts/Noto_Sans_JP/NotoSansJP-Medium.ttf'),
};

const ORANGE = '#DB4A2B';
const GREEN = '#147B58';
const DARK = '#111119';
const WHITE = '#FFFFFF';

const DATE = '20260914';
const SLUG = 'judgment-stack-ep01-note-ja';
const ASSET_DIR = `./output/podcast/episodes/${DATE}-${SLUG}`;
const PNG_DIR = path.join(ASSET_DIR, 'banners');
const SVG_DIR = path.join(ASSET_DIR, 'svg');
for (const d of [PNG_DIR, SVG_DIR]) fs.mkdirSync(d, { recursive: true });

const EYEBROW = 'PODCAST  ·  THE JUDGMENT STACK  ·  EP 01';
const HEAD = 'VC投資を直感から構造工学へ';
// Line two in runs so the figure can carry the single orange accent.
const DECK = [
  ['1.25兆ドル', ORANGE],
  ['の判断ボトルネックを解く決定論的AI', WHITE],
];

// note.com's spec: 1280x670 (1.91:1), 1920x1006 recommended for quality.
const W = 1280;
const H = 670;
const MARGIN = 88;
const LOGOMARK_H = 104;

const O_PATH = 'M0 175.59L0 175.59Q-44.26 175.59-77.82 155.65Q-111.39 135.71-129.63 96.55Q-147.87 57.40-147.87 0L-147.87 0Q-147.87-57.40-129.63-96.55Q-111.39-135.71-77.82-155.65Q-44.26-175.59 0-175.59L0-175.59Q44.75-175.59 78.07-155.65Q111.39-135.71 129.63-96.55Q147.87-57.40 147.87 0L147.87 0Q147.87 57.40 129.63 96.55Q111.39 135.71 78.07 155.65Q44.75 175.59 0 175.59ZM0 118.68L0 118.68Q24.81 118.68 42.56 107.49Q60.31 96.31 70.04 75.64Q79.77 54.96 79.77 26.27L79.77 26.27L79.77-26.27Q79.77-55.45 70.04-75.88Q60.31-96.31 42.56-107.49Q24.81-118.68 0-118.68L0-118.68Q-23.83-118.68-41.83-107.49Q-59.83-96.31-69.80-75.88Q-79.77-55.45-79.77-26.27L-79.77-26.27L-79.77 26.27Q-79.77 54.96-69.80 75.64Q-59.83 96.31-41.83 107.49Q-23.83 118.68 0 118.68Z';
const DIAMOND_PATH = 'M 0 -43.029888 L 43.029888 0 L 0 43.029888 L -43.029888 0 Z';
const MARK_HEIGHT = 175.59 * 2;

// ── Mixed-script text, set glyph by glyph (as generate-note-magazine.mjs) ───
// Japanese codepoints take Noto, everything else Plex. A missing glyph throws
// rather than rendering tofu — outlined text has no fallback.
const isJP = (ch) => {
  const c = ch.codePointAt(0);
  return (c >= 0x3000 && c <= 0x30ff) || (c >= 0x4e00 && c <= 0x9fff) || (c >= 0xff00 && c <= 0xffef);
};

function faceFor(ch, font, jpFont) {
  const f = isJP(ch) ? jpFont : font;
  if (f.charToGlyphIndex(ch) === 0) {
    const cp = ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
    throw new Error(`No glyph for "${ch}" (U+${cp}) — add it to tools/prepare-noto-sans-jp.py`);
  }
  return f;
}

const advance = (ch, size, font, jpFont) => {
  const f = faceFor(ch, font, jpFont);
  return f.charToGlyph(ch).advanceWidth * (size / f.unitsPerEm);
};

const widthOf = (str, size, font, jpFont) => [...str].reduce((w, ch) => w + advance(ch, size, font, jpFont), 0);

function run(str, x, y, size, { font, jpFont, fill, opacity = 1 }) {
  const parts = [];
  let cursor = x;
  for (const ch of str) {
    const f = faceFor(ch, font, jpFont);
    const d = f.getPath(ch, cursor, y, size).toPathData(3);
    if (d) parts.push(d);
    cursor += advance(ch, size, font, jpFont);
  }
  const op = opacity === 1 ? '' : ` opacity="${opacity}"`;
  return { svg: parts.length ? `<path d="${parts.join(' ')}" fill="${fill}"${op}/>` : '', x: cursor };
}

function trackedMono(text, x, y, size, fill, opacity, track) {
  const out = [];
  let cx = x;
  for (const c of [...text]) {
    if (c !== ' ') out.push(`<path d="${F.mono.getPath(c, cx, y, size).toPathData(2)}" fill="${fill}" opacity="${opacity}"/>`);
    cx += F.mono.charToGlyph(c).advanceWidth * (size / F.mono.unitsPerEm) + track;
  }
  return out;
}

// House chrome, identical to the Diligence Stack note eyecatch so the two sit
// together in the magazine as one series.
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

  el.push(`<path d="${F.semi.getPath('O', -110, 566, 700).toPathData(2)}" fill="${GREEN}" opacity="0.05"/>`);
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
  const measure = W - MARGIN * 2;

  el.push(`<rect x="${MARGIN}" y="136" width="64" height="3" fill="${ORANGE}"/>`);
  el.push(...trackedMono(EYEBROW, MARGIN, 192, 17, WHITE, 0.55, 4));

  // Headline: the thesis, as large as the measure allows, capped so it does
  // not dwarf the deck line.
  const headOpts = { font: F.semi, jpFont: F.jpBold };
  const headSize = Math.min(76, measure / widthOf(HEAD, 1, headOpts.font, headOpts.jpFont));
  const headY = 300;
  el.push(run(HEAD, MARGIN, headY, headSize, { ...headOpts, fill: WHITE }).svg);

  // Deck: the problem and the answer, one line, fitted to the full measure.
  const deckOpts = { font: F.medium, jpFont: F.jpMedium };
  const deckText = DECK.map(([t]) => t).join('');
  const deckSize = Math.min(44, measure / widthOf(deckText, 1, deckOpts.font, deckOpts.jpFont));
  const deckY = headY + headSize * 0.5 + deckSize * 1.5;
  let cursor = MARGIN;
  for (const [text, fill] of DECK) {
    const r = run(text, cursor, deckY, deckSize, { ...deckOpts, fill, opacity: fill === WHITE ? 0.88 : 1 });
    el.push(r.svg);
    cursor = r.x;
  }

  el.push(...trackedMono('ASKODIN.APP/JA', MARGIN, H - MARGIN, 17, WHITE, 0.5, 5));
  el.push(logomark(W - MARGIN - LOGOMARK_H / 2, H - MARGIN - LOGOMARK_H / 2, LOGOMARK_H));

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <title>askOdin — note.com eyecatch — The Judgment Stack EP 01 (JA)</title>
  ${el.join('\n  ')}
</svg>`;
}

async function main() {
  console.log('=== note.com eyecatch — The Judgment Stack EP 01 (JA) ===\n');

  const name = 'askOdin-podcast-ep01-note-ja';
  const svg = eyecatchSvg();
  fs.writeFileSync(path.join(SVG_DIR, `${name}.svg`), svg);
  const buf = fs.readFileSync(path.join(SVG_DIR, `${name}.svg`));

  for (const [w, h, suffix] of [[1280, 670, ''], [1920, 1006, '-1920'], [2560, 1340, '-2x']]) {
    const file = path.join(PNG_DIR, `${name}${suffix}.png`);
    await sharp(buf, { density: 300 }).resize(w, h, { fit: 'fill' }).png().toFile(file);
    console.log(`  ${path.basename(file).padEnd(42)} ${w}x${h}  ${(fs.statSync(file).size / 1024).toFixed(0)}KB`);
  }

  console.log(`\nWrote ${ASSET_DIR}/\n`);
}

main().catch((err) => { console.error(err); process.exit(1); });
