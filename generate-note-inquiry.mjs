import opentype from 'opentype.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// note.com お仕事依頼 header — AI判断インフラ™ / 実証実験（PoC）・共同検証のご案内
//
// The eyecatch for the article pinned as the creator page's お仕事依頼 tab. note
// puts that eyecatch at the top of the inquiry page, and it is the preview card
// whenever the article is shared to X or LinkedIn. It is replaced in place and
// referenced by a stable URL, so — like the magazine header beside it — this
// is identity, not a moment, and the folder is NOT dated.
//
// note's eyecatch spec is 1280x670 (1.91:1); 1920x1006 is the high-quality
// upload. The lockup is centred on both axes so any centre crop note applies
// in its feed and thumbnails keeps it whole.
//
// ── Copy provenance ──────────────────────────────────────────────────────────
// 「AI判断インフラ™」 is the h1 on askodin-coming-soon/src/pages/ja/index.astro.
// 「実証実験（PoC）・共同検証のご案内」 and the English line are from YS's brief;
// the /ja page's own CTA wording is 「投資委員会プロセスへの導入、PoC、協業のご相談」.
// Checked by hand against the JA rules in check-compliance-lexicon.mjs
// (2026-09-18): no hits.
// ─────────────────────────────────────────────────────────────────────────────

const F = {
  semi: opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-SemiBold.ttf'),
  mono: opentype.loadSync('./fonts/IBM_Plex_Mono/IBMPlexMono-Regular.ttf'),
  jpBold: opentype.loadSync('./fonts/Noto_Sans_JP/NotoSansJP-Bold.ttf'),
};

const ORANGE = '#DB4A2B';
const GREEN = '#147B58';
const DARK = '#111119';
const WHITE = '#FFFFFF';
const MUTED = '#8899AA';

const ASSET_DIR = './output/note';
const SVG_DIR = path.join(ASSET_DIR, 'svg');
for (const d of [ASSET_DIR, SVG_DIR]) fs.mkdirSync(d, { recursive: true });

const HEAD = 'AI判断インフラ™';
const SUB_JA = '実証実験（PoC）・共同検証のご案内';
// Was "ENTERPRISE SANDBOX": dropped because it reads as a per-customer isolated
// environment, and tenant isolation is an open defect (the isolated-runtime
// rule in check-compliance-lexicon.mjs). "Sandbox" on askodin.app means
// /sandbox, the in-browser demo — keep it off this banner.
const SUB_EN = 'ENTERPRISE POC & PILOT VALIDATION';

const W = 1280;
const H = 670;

// ── Mixed-script text, set glyph by glyph ────────────────────────────────────
// Japanese codepoints (incl. fullwidth （）) take Noto, everything else Plex —
// which is what routes ™ to Plex. A missing glyph throws rather than rendering
// tofu; add it to KANJI in tools/prepare-noto-sans-jp.py.
const isJP = (ch) => {
  const c = ch.codePointAt(0);
  return (c >= 0x3000 && c <= 0x30ff) || (c >= 0x4e00 && c <= 0x9fff) || (c >= 0xff00 && c <= 0xffef);
};

function faceFor(ch, face) {
  const f = isJP(ch) ? face.jpFont : face.font;
  if (f.charToGlyphIndex(ch) === 0) {
    const cp = ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
    throw new Error(`No glyph for "${ch}" (U+${cp}) — add it to tools/prepare-noto-sans-jp.py`);
  }
  return f;
}

const BOLD = { font: F.semi, jpFont: F.jpBold };
const advance = (ch, size, face) => { const f = faceFor(ch, face); return f.charToGlyph(ch).advanceWidth * (size / f.unitsPerEm); };
const widthOf = (str, size, face) => [...str].reduce((w, ch) => w + advance(ch, size, face), 0);

function runMid(str, cx, y, size, face, fill, opacity = 1) {
  const parts = [];
  let cursor = cx - widthOf(str, size, face) / 2;
  for (const ch of str) {
    const d = faceFor(ch, face).getPath(ch, cursor, y, size).toPathData(3);
    if (d) parts.push(d);
    cursor += advance(ch, size, face);
  }
  return `<path d="${parts.join(' ')}" fill="${fill}"${opacity === 1 ? '' : ` opacity="${opacity}"`}/>`;
}

const latinW = (f, t, size) => [...t].reduce((w, c) => w + f.charToGlyph(c).advanceWidth, 0) * (size / f.unitsPerEm);
const latin = (f, t, x, y, size, fill, op = 1) =>
  `<path d="${f.getPath(t, x, y, size).toPathData(2)}" fill="${fill}"${op === 1 ? '' : ` opacity="${op}"`}/>`;

function trackedMid(f, text, cx, y, size, track, fill, opacity) {
  const chars = [...text];
  let x = cx - (latinW(f, text, size) + track * (chars.length - 1)) / 2;
  const out = [];
  for (const c of chars) {
    if (c !== ' ') out.push(latin(f, c, x, y, size, fill, opacity));
    x += latinW(f, c, size) + track;
  }
  return out;
}

function wordmarkMid(cx, y, size) {
  const askW = latinW(F.semi, 'ask', size);
  const x = cx - (askW + latinW(F.semi, 'Odin', size)) / 2;
  return [latin(F.semi, 'ask', x, y, size, ORANGE), latin(F.semi, 'Odin', x + askW, y, size, GREEN)];
}

// House chrome, as the other note eyecatches.
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
  el.push(`<path d="${F.semi.getPath('O', -110, H / 2 + 231, 700).toPathData(2)}" fill="${GREEN}" opacity="0.05"/>`);
  el.push(`<rect width="${W}" height="4" fill="${ORANGE}"/>`);
  return el;
}

function headerSvg() {
  const el = backdrop();
  const cx = W / 2;

  // One centred column: mark, descriptor, the offer, the English gloss.
  el.push(...wordmarkMid(cx, 196, 52));
  el.push(runMid(HEAD, cx, 322, 76, BOLD, WHITE));
  el.push(`<rect x="${cx - 32}" y="366" width="64" height="3" fill="${ORANGE}"/>`);
  // Noto is vendored at 400/500/700 only, so the heading's SemiBold falls to 700.
  el.push(runMid(SUB_JA, cx, 436, 34, BOLD, WHITE));
  el.push(...trackedMid(F.mono, SUB_EN, cx, 496, 16, 4, MUTED, 1));

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <title>askOdin — note.com お仕事依頼 header — ${HEAD} ${SUB_JA}</title>
  ${el.join('\n  ')}
</svg>`;
}

async function main() {
  console.log('=== note.com お仕事依頼 header ===\n');

  const name = 'askOdin-note-inquiry-header';
  const svgPath = path.join(SVG_DIR, `${name}.svg`);
  fs.writeFileSync(svgPath, headerSvg());
  const buf = fs.readFileSync(svgPath);

  for (const [w, h, suffix] of [[1280, 670, ''], [1920, 1006, '-1920']]) {
    const file = path.join(ASSET_DIR, `${name}${suffix}.png`);
    await sharp(buf, { density: 300 }).resize(w, h, { fit: 'fill' }).png().toFile(file);
    console.log(`  ${path.basename(file).padEnd(42)} ${w}x${h}  ${(fs.statSync(file).size / 1024).toFixed(0)}KB`);
  }

  console.log(`\nWrote ${ASSET_DIR}/ — note identity, undated, replaced in place.\n`);
}

main().catch((err) => { console.error(err); process.exit(1); });
