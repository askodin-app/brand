import opentype from 'opentype.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// note.com magazine header — The Judgment Stack ｜ AI判断インフラ™
//
// The masthead for the askOdin magazine on note.com, which collects the
// Japanese localizations of the Substack essays. Magazine identity is replaced
// in place and referenced by a stable path, so this folder is NOT dated — the
// same rule that keeps the favicon and the podcast show art undated.
//
// ── The crop ─────────────────────────────────────────────────────────────────
// note takes a 1280x670 upload (1.91:1) but displays only the CENTRAL 216px
// band of it on the magazine and creator page; at the higher-quality 1920x1006
// it is the central 324px. The full frame is still what gets used when the
// magazine is shared to X or Facebook, which is why note asks for the whole
// 1.91:1 image rather than the strip.
//
//   https://note.com/info/n/nca58094038d7   (note公式, the size change)
//
// So this composition is built like generate-podcast.mjs's YouTube banner:
// everything that must be READ sits inside the safe band, and the backdrop
// runs to the full frame so the social-share crop still looks composed.
//
// The orange top rule is outside the band by definition — it is at y=0 — so a
// second orange accent sits inside the band. Otherwise the brand's one
// signature colour is cropped off on the surface the magazine actually lives on.
//
// ── Copy provenance ──────────────────────────────────────────────────────────
// 「AI判断インフラ™」 is the h1 on askodin-coming-soon/src/pages/ja/index.astro
// (未公開市場のための AI判断インフラ™), and the English gloss under it is that
// page's own lang="en" line. Both are vetted surfaces — neither is translated
// fresh here. See generate-exec-brief-ja.mjs for why that matters: the guard in
// askodin-coming-soon/scripts/check-compliance-lexicon.mjs never runs on this
// repo, so JA strings have to be lifted, not written.
//
// The name is set with the fullwidth ｜ (U+FF5C) the magazine title uses. That
// glyph does NOT exist in IBM Plex — only in Noto Sans JP — so it is routed
// through the JP face by codepoint like every other Japanese character.
// ─────────────────────────────────────────────────────────────────────────────

const F = {
  semi: opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-SemiBold.ttf'),
  mono: opentype.loadSync('./fonts/IBM_Plex_Mono/IBMPlexMono-Regular.ttf'),
  jp: opentype.loadSync('./fonts/Noto_Sans_JP/NotoSansJP-Medium.ttf'),
};

const ORANGE = '#DB4A2B';
const GREEN = '#147B58';
const DARK = '#111119';
const WHITE = '#FFFFFF';
const MUTED = '#8899AA';

const ASSET_DIR = './output/note';
const SVG_DIR = path.join(ASSET_DIR, 'svg');
for (const d of [ASSET_DIR, SVG_DIR]) fs.mkdirSync(d, { recursive: true });

const TITLE_EN = 'The Judgment Stack';
const TITLE_SEP = ' ｜ ';
const TITLE_JA = 'AI判断インフラ™';
const GLOSS = 'AI JUDGMENT INFRASTRUCTURE FOR PRIVATE MARKETS';

const W = 1280;
const H = 670;
const MARGIN = 88;
const BAND_H = 216;                    // what note actually shows at 1280x670
const BAND_TOP = (H - BAND_H) / 2;     // 227
const LOGOMARK_H = 88;

const O_PATH = 'M0 175.59L0 175.59Q-44.26 175.59-77.82 155.65Q-111.39 135.71-129.63 96.55Q-147.87 57.40-147.87 0L-147.87 0Q-147.87-57.40-129.63-96.55Q-111.39-135.71-77.82-155.65Q-44.26-175.59 0-175.59L0-175.59Q44.75-175.59 78.07-155.65Q111.39-135.71 129.63-96.55Q147.87-57.40 147.87 0L147.87 0Q147.87 57.40 129.63 96.55Q111.39 135.71 78.07 155.65Q44.75 175.59 0 175.59ZM0 118.68L0 118.68Q24.81 118.68 42.56 107.49Q60.31 96.31 70.04 75.64Q79.77 54.96 79.77 26.27L79.77 26.27L79.77-26.27Q79.77-55.45 70.04-75.88Q60.31-96.31 42.56-107.49Q24.81-118.68 0-118.68L0-118.68Q-23.83-118.68-41.83-107.49Q-59.83-96.31-69.80-75.88Q-79.77-55.45-79.77-26.27L-79.77-26.27L-79.77 26.27Q-79.77 54.96-69.80 75.64Q-59.83 96.31-41.83 107.49Q-23.83 118.68 0 118.68Z';
const DIAMOND_PATH = 'M 0 -43.029888 L 43.029888 0 L 0 43.029888 L -43.029888 0 Z';
const MARK_HEIGHT = 175.59 * 2;

// ── Mixed-script text, set glyph by glyph ───────────────────────────────────
// Japanese runs take the JP face, Latin runs the Latin face, decided per
// codepoint. Fullwidth forms (U+FF00–FFEF) count as Japanese, which is what
// routes the fullwidth ｜ to Noto.
const isJP = (ch) => {
  const c = ch.codePointAt(0);
  return (c >= 0x3000 && c <= 0x30ff) || (c >= 0x4e00 && c <= 0x9fff) || (c >= 0xff00 && c <= 0xffef);
};

function faceFor(ch, font, jpFont) {
  const f = jpFont && isJP(ch) ? jpFont : font;
  if (f.charToGlyphIndex(ch) === 0) {
    const cp = ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
    throw new Error(`No glyph for "${ch}" (U+${cp})`);
  }
  return f;
}

function widthOf(str, size, { font, jpFont = null, tracking = 0 }) {
  let w = 0;
  for (const ch of str) {
    const f = faceFor(ch, font, jpFont);
    w += f.charToGlyph(ch).advanceWidth * (size / f.unitsPerEm) + tracking * size;
  }
  return w - (str.length ? tracking * size : 0);
}

// Returns the paths plus the x cursor, so runs in different colours can be
// chained along one baseline without re-measuring.
function run(str, x, y, size, { font, jpFont = null, fill, tracking = 0, opacity = 1 }) {
  const parts = [];
  let cursor = x;
  for (const ch of str) {
    const f = faceFor(ch, font, jpFont);
    const d = f.getPath(ch, cursor, y, size).toPathData(3);
    if (d) parts.push(d);
    cursor += f.charToGlyph(ch).advanceWidth * (size / f.unitsPerEm) + tracking * size;
  }
  const op = opacity === 1 ? '' : ` opacity="${opacity}"`;
  return { svg: parts.length ? `<path d="${parts.join(' ')}" fill="${fill}"${op}/>` : '', x: cursor };
}

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

  el.push(`<path d="${getPathLatin('O', -110, 566, 700)}" fill="${GREEN}" opacity="0.05"/>`);
  el.push(`<rect width="${W}" height="4" fill="${ORANGE}"/>`);
  return el;
}

const getPathLatin = (text, x, y, size) => F.semi.getPath(text, x, y, size).toPathData(2);

function trackedMono(text, x, y, size, fill, opacity, track) {
  const out = [];
  let cx = x;
  for (const c of [...text]) {
    if (c !== ' ') out.push(`<path d="${F.mono.getPath(c, cx, y, size).toPathData(2)}" fill="${fill}" opacity="${opacity}"/>`);
    cx += F.mono.charToGlyph(c).advanceWidth * (size / F.mono.unitsPerEm) + track;
  }
  return out;
}

function logomark(cx, cy, height) {
  const scale = (height / MARK_HEIGHT).toFixed(5);
  return `<g transform="translate(${cx} ${cy}) scale(${scale})">
    <path d="${O_PATH}" fill="${GREEN}"/>
    <path d="${DIAMOND_PATH}" transform="scale(1.2)" fill="${ORANGE}"/>
  </g>`;
}

function headerSvg() {
  const el = backdrop();

  // The lockup must clear the logomark on the right, so it is measured to a
  // hard measure rather than the full live width.
  const measure = W - MARGIN * 2 - LOGOMARK_H - 56;
  const opts = { font: F.semi, jpFont: F.jp };
  const unit =
    widthOf(TITLE_EN, 1, opts) + widthOf(TITLE_SEP, 1, opts) + widthOf(TITLE_JA, 1, opts);
  const size = Math.min(54, measure / unit);

  // Everything readable is positioned from the band, not the frame.
  const ruleY = BAND_TOP + 39;
  const titleY = BAND_TOP + 121;
  const glossY = BAND_TOP + 173;

  el.push(`<rect x="${MARGIN}" y="${ruleY}" width="64" height="3" fill="${ORANGE}"/>`);

  // One line, three runs: the EN masthead, a muted separator, the JA descriptor.
  // Same size throughout — it is one name — with hierarchy carried by weight
  // and opacity instead.
  let cursor = MARGIN;
  const en = run(TITLE_EN, cursor, titleY, size, { ...opts, fill: WHITE });
  el.push(en.svg);
  const sep = run(TITLE_SEP, en.x, titleY, size, { ...opts, fill: MUTED, opacity: 0.8 });
  el.push(sep.svg);
  el.push(run(TITLE_JA, sep.x, titleY, size, { ...opts, fill: WHITE, opacity: 0.88 }).svg);

  el.push(...trackedMono(GLOSS, MARGIN, glossY, 15, WHITE, 0.5, 4));
  el.push(logomark(W - MARGIN - LOGOMARK_H / 2, BAND_TOP + BAND_H / 2, LOGOMARK_H));

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <title>askOdin — note.com magazine header — The Judgment Stack ｜ AI判断インフラ™</title>
  ${el.join('\n  ')}
</svg>`;
}

async function main() {
  console.log('=== note.com magazine header — The Judgment Stack ｜ AI判断インフラ™ ===\n');

  const name = 'askOdin-note-magazine-header';
  const svg = headerSvg();
  fs.writeFileSync(path.join(SVG_DIR, `${name}.svg`), svg);
  const buf = fs.readFileSync(path.join(SVG_DIR, `${name}.svg`));

  for (const [w, h, suffix] of [[1280, 670, ''], [1920, 1006, '-1920']]) {
    const file = path.join(ASSET_DIR, `${name}${suffix}.png`);
    await sharp(buf, { density: 300 }).resize(w, h, { fit: 'fill' }).png().toFile(file);
    console.log(`  ${path.basename(file).padEnd(42)} ${w}x${h}  ${(fs.statSync(file).size / 1024).toFixed(0)}KB`);
  }

  // Proof: exactly what note shows on the magazine page, so the crop can be
  // checked without uploading. Same -proof convention as the meishi.
  const proof = path.join(ASSET_DIR, `${name}-crop-proof.png`);
  await sharp(buf, { density: 300 }).resize(W, H, { fit: 'fill' })
    .extract({ left: 0, top: Math.round(BAND_TOP), width: W, height: BAND_H })
    .png().toFile(proof);
  console.log(`  ${path.basename(proof).padEnd(42)} ${W}x${BAND_H}  (the band note actually displays)`);

  console.log(`\nWrote ${ASSET_DIR}/ — magazine identity, undated, replaced in place.\n`);
}

main().catch((err) => { console.error(err); process.exit(1); });
