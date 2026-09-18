import opentype from 'opentype.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// note.com eyecatch — Theranosはどうスコアリングされたか
//
// Hero image for the Japanese localization of "How Theranos Would Have Scored"
// (askodin.app/insights/how-theranos-would-have-scored/, pubDate 2026-09-18).
// The note post is its own publication moment, so the folder is dated to the
// note publication date — change DATE if it ships on another day. note URLs
// carry no readable slug, so the folder takes a descriptive one, the departure
// generate-diligence-stack-note-ja.mjs documents.
//
// ── Copy provenance ──────────────────────────────────────────────────────────
// The headline and deck are YS's note title (2026-09-18), split at its own
// colon; nothing is translated or reworded here. 物理法則違反 is the phrase from
// the same note body. Checked by hand against the JA rules in
// askodin-coming-soon/scripts/check-compliance-lexicon.mjs (2026-09-18): no
// hits — the copy makes no retention, isolation, training or guideline claim.
//
// Layout mirrors the English OG (generate-how-theranos-would-have-scored.mjs):
// argument left, verdict right, so the two read as one piece.
// ─────────────────────────────────────────────────────────────────────────────

const F = {
  semi: opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-SemiBold.ttf'),
  medium: opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-Medium.ttf'),
  light: opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-Light.ttf'),
  mono: opentype.loadSync('./fonts/IBM_Plex_Mono/IBMPlexMono-Regular.ttf'),
  monoMed: opentype.loadSync('./fonts/IBM_Plex_Mono/IBMPlexMono-Medium.ttf'),
  jpBold: opentype.loadSync('./fonts/Noto_Sans_JP/NotoSansJP-Bold.ttf'),
  jpMedium: opentype.loadSync('./fonts/Noto_Sans_JP/NotoSansJP-Medium.ttf'),
};

const ORANGE = '#DB4A2B';
const GREEN = '#147B58';
const DARK = '#111119';
const WHITE = '#FFFFFF';
const KILL = '#C62828';

const DATE = '20260918';
const SLUG = 'theranos-note-ja';
const ASSET_DIR = `./output/social/${DATE}-${SLUG}`;
const PNG_DIR = path.join(ASSET_DIR, 'banners');
const SVG_DIR = path.join(ASSET_DIR, 'svg');
for (const d of [PNG_DIR, SVG_DIR]) fs.mkdirSync(d, { recursive: true });

const EYEBROW = '// CASE STUDY · THERANOS';
// Broken at the particle, not mid-word, so the display size can stay large.
const HEAD = ['Theranosは', 'どうスコアリングされたか'];
const DECK = ['投資家は愚かではなかった。', 'フレームワークがなかったのだ。'];
const VIOLATION = '物理法則違反';

// note.com's spec: 1280x670 (1.91:1), 1920x1006 recommended for quality.
const W = 1280;
const H = 670;
const MARGIN = 88;

// ── Mixed-script text, set glyph by glyph (as generate-podcast-ep01-note-ja.mjs)
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
  return parts.length ? `<path d="${parts.join(' ')}" fill="${fill}"${op}/>` : '';
}

const latinW = (f, t, size) => [...t].reduce((w, c) => w + f.charToGlyph(c).advanceWidth, 0) * (size / f.unitsPerEm);
const latin = (f, t, x, y, size, fill, op = 1) =>
  `<path d="${f.getPath(t, x, y, size).toPathData(2)}" fill="${fill}"${op === 1 ? '' : ` opacity="${op}"`}/>`;

function tracked(f, text, x, y, size, track, fill, opacity) {
  const out = [];
  for (const c of [...text]) {
    if (c !== ' ') out.push(latin(f, c, x, y, size, fill, opacity));
    x += latinW(f, c, size) + track;
  }
  return out;
}
const trackedW = (f, t, size, track) => latinW(f, t, size) + track * Math.max(0, [...t].length - 1);

// House chrome, identical to the other note eyecatches so the magazine reads as
// one series.
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

function eyecatchSvg() {
  const el = backdrop();
  const colW = 700;

  // Wordmark, top left.
  const askW = latinW(F.semi, 'ask', 30);
  el.push(latin(F.semi, 'ask', MARGIN, 116, 30, ORANGE), latin(F.semi, 'Odin', MARGIN + askW, 116, 30, GREEN));
  el.push(...tracked(F.monoMed, EYEBROW, MARGIN, 204, 16, 4.2, ORANGE, 0.95));

  const headOpts = { font: F.semi, jpFont: F.jpBold };
  const headSize = Math.min(58, ...HEAD.map((l) => colW / widthOf(l, 1, headOpts.font, headOpts.jpFont)));
  HEAD.forEach((line, i) => el.push(run(line, MARGIN, 282 + i * headSize * 1.3, headSize, { ...headOpts, fill: WHITE })));

  const ruleY = 282 + headSize * 1.3 + 50;
  el.push(`<rect x="${MARGIN}" y="${ruleY}" width="64" height="3" fill="${ORANGE}"/>`);

  const deckOpts = { font: F.medium, jpFont: F.jpMedium };
  const deckSize = Math.min(28, ...DECK.map((l) => colW / widthOf(l, 1, deckOpts.font, deckOpts.jpFont)));
  DECK.forEach((line, i) =>
    el.push(run(line, MARGIN, ruleY + 58 + i * deckSize * 1.6, deckSize, { ...deckOpts, fill: WHITE, opacity: 0.8 })));

  // The JA landing page, not the English root.
  el.push(...tracked(F.mono, 'ASKODIN.APP/JA', MARGIN, H - MARGIN + 6, 16, 5, WHITE, 0.5));

  // Right column: the verdict.
  const divX = 858;
  el.push(`<line x1="${divX}" y1="160" x2="${divX}" y2="${H - 110}" stroke="${WHITE}" stroke-width="1" opacity="0.12"/>`);
  const rcx = (divX + W) / 2 + 6;
  const lbl = 'CLARITY SCORE™';
  el.push(...tracked(F.monoMed, lbl, rcx - trackedW(F.monoMed, lbl, 15, 4) / 2, 204, 15, 4, WHITE, 0.55));

  const n = 240;
  const d = n * 0.24;
  const nW = latinW(F.light, '0', n);
  const sx = rcx - (nW + n * 0.05 + latinW(F.light, '/100', d)) / 2;
  el.push(latin(F.light, '0', sx, 430, n, ORANGE), latin(F.light, '/100', sx + nW + n * 0.05, 430, d, WHITE, 0.42));

  // Kill Shot marker + the finding in Japanese.
  const tag = 'COMPILE-TIME ERROR';
  const tw = trackedW(F.monoMed, tag, 15, 3);
  const tx = rcx - (10 + 12 + tw) / 2;
  el.push(`<rect x="${tx}" y="${490 - 11.5}" width="10" height="10" fill="${KILL}"/>`);
  el.push(...tracked(F.monoMed, tag, tx + 22, 490, 15, 3, WHITE, 0.82));
  const vSize = 22;
  const vW = widthOf(VIOLATION, vSize, F.medium, F.jpMedium);
  el.push(run(VIOLATION, rcx - vW / 2, 528, vSize, { font: F.medium, jpFont: F.jpMedium, fill: WHITE, opacity: 0.6 }));

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <title>askOdin — note.com eyecatch — How Theranos Would Have Scored (JA)</title>
  ${el.join('\n  ')}
</svg>`;
}

async function main() {
  console.log('=== note.com eyecatch — How Theranos Would Have Scored (JA) ===\n');
  const name = 'askOdin-theranos-note-ja';
  fs.writeFileSync(path.join(SVG_DIR, `${name}.svg`), eyecatchSvg());
  const buf = fs.readFileSync(path.join(SVG_DIR, `${name}.svg`));

  for (const [w, h, suffix] of [[1280, 670, ''], [1920, 1006, '-1920'], [2560, 1340, '-2x']]) {
    const file = path.join(PNG_DIR, `${name}${suffix}.png`);
    await sharp(buf, { density: 300 }).resize(w, h, { fit: 'fill' }).png().toFile(file);
    console.log(`  ${path.basename(file).padEnd(36)} ${w}x${h}  ${(fs.statSync(file).size / 1024).toFixed(0)}KB`);
  }
  console.log(`\nWrote ${ASSET_DIR}/\n`);
}

main().catch((err) => { console.error(err); process.exit(1); });
