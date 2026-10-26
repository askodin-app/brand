import opentype from 'opentype.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// OPPO Pad lock screen — 2800x2000 (7:5 landscape)
//
// A personal-device asset, not published collateral, but it is the screen that
// is face-up on the table in an Osaka meeting — so it is held to the same copy
// rules as anything else with Japanese on it.
//
// ── Rendering approach ───────────────────────────────────────────────────────
// The brief suggested playwright / puppeteer / @napi-rs/canvas. This uses the
// house pipeline instead — opentype.js outlines -> SVG -> sharp — for the same
// reason every other generator here does: text is emitted as <path>, so the
// render cannot silently substitute a fallback face for Noto Sans JP. A
// headless browser would also have to be told about the fonts, and would
// rasterise differently on another machine. No new dependency is needed;
// opentype.js and sharp are already in package.json.
//
// ── Safe zones (ColorOS lock screen) ─────────────────────────────────────────
//   y    0 –  500   system clock, date, notifications      MUST stay empty
//   y  950 – 1350   optical centre, the primary stack
//   y 1840 – 2000   institutional footer + swipe indicator
// main() asserts the top zone is clear by sampling the rendered pixels, rather
// than trusting the layout arithmetic.
//
// ── Copy provenance ──────────────────────────────────────────────────────────
// 「ソニー BSS プログラム 招待枠」 as briefed is NOT the approved claim. The
// vetted surfaces say 参画 (participation):
//   askodin-coming-soon/src/pages/ja/index.astro:84   ソニー Boundary Spanning Service 参画
//   askodin-coming-soon/src/pages/ja/index.astro:497  Sony Acceleration Platform「Boundary Spanning Service」参画
// 招待枠 asserts a held invited slot, which is a stronger and differently
// shaped claim. The approved 参画 is used below. See the compliance guard note
// in generate-exec-brief-ja.mjs — that guard runs on the other repo, never here.
//
// The Japanese headline has no source on /ja. It is a fresh rendering of the
// published English title "Information Is Free. Judgment Is the Last Unscalable
// Asset." It makes no product, retention or compliance claim, so it trips none
// of the guard's rules — but it has not had a native review, and /ja's own
// header says the same of that page. Treat it as unreviewed.
// ─────────────────────────────────────────────────────────────────────────────

const F = {
  bold: opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-Bold.ttf'),
  monoMed: opentype.loadSync('./fonts/IBM_Plex_Mono/IBMPlexMono-Medium.ttf'),
  mono: opentype.loadSync('./fonts/IBM_Plex_Mono/IBMPlexMono-Regular.ttf'),
  jp: opentype.loadSync('./fonts/Noto_Sans_JP/NotoSansJP-Medium.ttf'),
};

// CLAUDE.md: never emit loose files into a shared directory — every run belongs
// to a named batch. Device wallpaper is identity furniture, replaced in place,
// so the folder is undated.
const ASSET_DIR = './output/wallpaper';
const SVG_DIR = path.join(ASSET_DIR, 'svg');
for (const d of [ASSET_DIR, SVG_DIR]) fs.mkdirSync(d, { recursive: true });

const W = 2800;
const H = 2000;
const CX = 1400;
const TOP_SAFE = 500;

const EMERALD = '#147B58';
const VERMILION = '#DB4A2B';
const WHITE = '#FFFFFF';
const SLATE = '#8E9FA6';
const VOID_FILL = '#08140F';

// The real logomark, lifted from generate-favicon.mjs — the same geometry the
// podcast avatar uses, so this is the mark and not a lookalike built from a
// circle and a rhombus. Its counter and diamond are already in proportion.
const O_PATH = 'M0 175.59L0 175.59Q-44.26 175.59-77.82 155.65Q-111.39 135.71-129.63 96.55Q-147.87 57.40-147.87 0L-147.87 0Q-147.87-57.40-129.63-96.55Q-111.39-135.71-77.82-155.65Q-44.26-175.59 0-175.59L0-175.59Q44.75-175.59 78.07-155.65Q111.39-135.71 129.63-96.55Q147.87-57.40 147.87 0L147.87 0Q147.87 57.40 129.63 96.55Q111.39 135.71 78.07 155.65Q44.75 175.59 0 175.59ZM0 118.68L0 118.68Q24.81 118.68 42.56 107.49Q60.31 96.31 70.04 75.64Q79.77 54.96 79.77 26.27L79.77 26.27L79.77-26.27Q79.77-55.45 70.04-75.88Q60.31-96.31 42.56-107.49Q24.81-118.68 0-118.68L0-118.68Q-23.83-118.68-41.83-107.49Q-59.83-96.31-69.80-75.88Q-79.77-55.45-79.77-26.27L-79.77-26.27L-79.77 26.27Q-79.77 54.96-69.80 75.64Q-59.83 96.31-41.83 107.49Q-23.83 118.68 0 118.68Z';
const DIAMOND_PATH = 'M 0 -43.029888 L 43.029888 0 L 0 43.029888 L -43.029888 0 Z';
const MARK_H = 175.59 * 2;          // 351.18 units tall
const COUNTER_RX = 79.77;           // inner void of the O, in mark units
const COUNTER_RY = 118.68;

const MARK_CY = 920;
const MARK_DRAWN_H = 140;           // ≈ the 64px-radius footprint in the brief
const MARK_SCALE = MARK_DRAWN_H / MARK_H;

// ── Text ────────────────────────────────────────────────────────────────────
// Japanese runs take the JP face, Latin runs the Latin face, decided per
// codepoint, with a fallback so a stray glyph (·, ™) that one face lacks is
// picked up by the other instead of throwing mid-render.
const isJP = (ch) => {
  const c = ch.codePointAt(0);
  return (c >= 0x3000 && c <= 0x30ff) || (c >= 0x4e00 && c <= 0x9fff) || (c >= 0xff00 && c <= 0xffef);
};

function faceFor(ch, font) {
  const primary = isJP(ch) ? F.jp : font;
  if (primary.charToGlyphIndex(ch) !== 0) return primary;
  const fallback = isJP(ch) ? font : F.jp;
  if (fallback.charToGlyphIndex(ch) !== 0) return fallback;
  const cp = ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
  throw new Error(`No glyph for "${ch}" (U+${cp}) in any loaded face`);
}

// letter-spacing is given in em in the brief; tracking here is already in px.
function widthOf(str, size, font, tracking) {
  let w = 0;
  for (const ch of str) {
    const f = faceFor(ch, font);
    w += f.charToGlyph(ch).advanceWidth * (size / f.unitsPerEm) + tracking;
  }
  return str.length ? w - tracking : 0;   // no trailing gap
}

function centeredText(str, y, size, font, fill, { tracking = 0, opacity = 1 } = {}) {
  let cursor = CX - widthOf(str, size, font, tracking) / 2;
  const parts = [];
  for (const ch of str) {
    const f = faceFor(ch, font);
    const d = f.getPath(ch, cursor, y, size).toPathData(3);
    if (d) parts.push(d);
    cursor += f.charToGlyph(ch).advanceWidth * (size / f.unitsPerEm) + tracking;
  }
  const op = opacity === 1 ? '' : ` opacity="${opacity}"`;
  return parts.length ? `<path d="${parts.join(' ')}" fill="${fill}"${op}/>` : '';
}

function buildSvg() {
  const el = [];

  el.push(`<defs>
    <radialGradient id="forestNoir" gradientUnits="userSpaceOnUse" cx="1400" cy="1150" r="1900">
      <stop offset="0%" stop-color="#0E221A"/>
      <stop offset="45%" stop-color="#07130E"/>
      <stop offset="100%" stop-color="#030605"/>
    </radialGradient>
    <filter id="emeraldGlow" x="-120%" y="-120%" width="340%" height="340%">
      <feGaussianBlur stdDeviation="17"/>
    </filter>
    <filter id="vermilionGlow" x="-160%" y="-160%" width="420%" height="420%">
      <feGaussianBlur stdDeviation="7"/>
    </filter>
  </defs>`);

  el.push(`<rect width="${W}" height="${H}" fill="url(#forestNoir)"/>`);

  // Judgment Eye contour. Its topmost edge sits at 1120 - 560 - 20 (half the
  // stroke) = 540, which clears the 500px system zone by design.
  el.push(`<ellipse cx="1400" cy="1120" rx="480" ry="560" fill="none" stroke="rgba(20,123,88,0.04)" stroke-width="40"/>`);

  // ── Logomark. Glow is drawn as a blurred copy underneath rather than with
  // feDropShadow, which librsvg does not render consistently. ──
  const mark = (inner) => `<g transform="translate(${CX} ${MARK_CY}) scale(${MARK_SCALE.toFixed(6)})">${inner}</g>`;

  el.push(mark(`<path d="${O_PATH}" fill="${EMERALD}" opacity="0.45" filter="url(#emeraldGlow)"/>`));
  el.push(mark(`<ellipse cx="0" cy="0" rx="${COUNTER_RX}" ry="${COUNTER_RY}" fill="${VOID_FILL}"/>`));
  el.push(mark(`<path d="${O_PATH}" fill="${EMERALD}"/>`));
  el.push(mark(`<path d="${DIAMOND_PATH}" transform="scale(1.2)" fill="${VERMILION}" opacity="0.6" filter="url(#vermilionGlow)"/>`));
  el.push(mark(`<path d="${DIAMOND_PATH}" transform="scale(1.2)" fill="${VERMILION}"/>`));

  // ── The centred stack ──
  el.push(centeredText('askOdin', 1045, 76, F.bold, WHITE, { tracking: -0.03 * 76 }));
  el.push(centeredText('「判断」は、最後に残されたスケールしない資産。', 1170, 58, F.jp, WHITE, { tracking: 0.04 * 58 }));
  el.push(centeredText('JUDGMENT INFRASTRUCTURE FOR PRIVATE CAPITAL', 1245, 24, F.monoMed, SLATE, { tracking: 0.22 * 24 }));

  // 招待枠 -> 参画, the approved form. See the copy provenance note above.
  el.push(centeredText('ASKODIN.APP/JA  ·  SONY BSS PROGRAM 参画  ·  OSAKA 2026', 1880, 18, F.mono, SLATE, { tracking: 0.14 * 18, opacity: 0.45 }));

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <title>askOdin — OPPO Pad lock screen</title>
  ${el.join('\n  ')}
</svg>`;
}

// Sample the rendered pixels rather than trusting the layout maths. Background
// luminance in the top band runs to roughly 20; white type would spike to 255.
async function assertTopZoneClear(file) {
  const { data, info } = await sharp(file)
    .extract({ left: 0, top: 0, width: W, height: TOP_SAFE })
    .raw().toBuffer({ resolveWithObject: true });

  let maxLum = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    const lum = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
    if (lum > maxLum) maxLum = lum;
  }
  const LIMIT = 40;
  const verdict = maxLum <= LIMIT ? 'CLEAR' : 'CONTENT DETECTED';
  console.log(`  top ${TOP_SAFE}px safe zone           ${verdict} (peak luminance ${maxLum.toFixed(1)}, limit ${LIMIT})`);
  if (maxLum > LIMIT) throw new Error(`Top ${TOP_SAFE}px is not clear — peak luminance ${maxLum.toFixed(1)}`);
}

async function main() {
  console.log('=== OPPO Pad lock screen — 2800x2000 ===\n');

  const name = 'askOdin-oppo-lockscreen-2800x2000';
  const svgFile = path.join(SVG_DIR, `${name}.svg`);
  fs.writeFileSync(svgFile, buildSvg());

  const file = path.join(ASSET_DIR, `${name}.png`);
  await sharp(fs.readFileSync(svgFile), { density: 96 })
    .resize(W, H, { fit: 'fill' })
    .flatten({ background: '#030605' })     // 24-bit, no alpha channel
    .png({ compressionLevel: 9, adaptiveFiltering: true, palette: false })
    .toFile(file);

  const meta = await sharp(file).metadata();
  const okDims = meta.width === W && meta.height === H;
  console.log(`  ${path.basename(file)}`);
  console.log(`  dimensions                  ${meta.width}x${meta.height} ${okDims ? 'OK' : 'WRONG'}`);
  console.log(`  channels / depth            ${meta.channels}ch ${meta.depth} (${meta.space})`);
  console.log(`  size                        ${(fs.statSync(file).size / 1024).toFixed(0)}KB`);
  if (!okDims) throw new Error(`Expected ${W}x${H}, got ${meta.width}x${meta.height}`);

  await assertTopZoneClear(file);
  console.log(`\nWrote ${ASSET_DIR}/ — device identity, undated, replaced in place.\n`);
}

main().catch((err) => { console.error(err); process.exit(1); });
