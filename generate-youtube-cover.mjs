import opentype from 'opentype.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const FONT_SEMI = opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-SemiBold.ttf');
const FONT_MED = opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-Medium.ttf');
const FONT_MONO = opentype.loadSync('./fonts/IBM_Plex_Mono/IBMPlexMono-Medium.ttf');

const ORANGE = '#DB4A2B';
const GREEN = '#147B58';
const DARK = '#111119';

// YouTube channel art — identity furniture, replaced in place rather than published
// once, so it lives at a stable undated path.
const OUTPUT_DIR = './output/profile';
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

function getPath(font, text, x, y, fontSize) {
  return font.getPath(text, x, y, fontSize).toPathData(2);
}

function getWidth(font, text, fontSize) {
  let width = 0;
  for (let i = 0; i < text.length; i++) {
    width += font.charToGlyph(text[i]).advanceWidth;
  }
  return width * (fontSize / font.unitsPerEm);
}

// YouTube channel banner: 2560 x 1440 (recommended upload size)
const W = 2560;
const H = 1440;
const CX = W / 2;
const CY = H / 2;

// --- Safe area --------------------------------------------------------------
// YouTube crops the banner differently per device. Only the central
// 1546 x 423 region is guaranteed visible on every surface (TV, desktop,
// tablet, mobile). All text and the logo must stay inside it; everything
// outside is decorative bleed that may be cropped on phones.
// ---------------------------------------------------------------------------
const SAFE_W = 1546;
const SAFE_H = 423;
const SAFE_X = CX - SAFE_W / 2; // 507
const SAFE_Y = CY - SAFE_H / 2; // 508.5
const SAFE_R = SAFE_X + SAFE_W; // 2053
const SAFE_B = SAFE_Y + SAFE_H; // 931.5

function generateCover() {
  const elements = [];

  // --- defs: gradients (ported from the Twitter cover / virtual background) ---
  elements.push(`<defs>`);
  elements.push(`  <radialGradient id="bgGrad" cx="50%" cy="50%" r="75%">`);
  elements.push(`    <stop offset="0%" stop-color="#1E1E30"/>`);
  elements.push(`    <stop offset="100%" stop-color="${DARK}"/>`);
  elements.push(`  </radialGradient>`);
  elements.push(`  <radialGradient id="glowGreen" cx="50%" cy="50%" r="50%">`);
  elements.push(`    <stop offset="0%" stop-color="${GREEN}" stop-opacity="0.18"/>`);
  elements.push(`    <stop offset="100%" stop-color="${GREEN}" stop-opacity="0"/>`);
  elements.push(`  </radialGradient>`);
  elements.push(`  <radialGradient id="glowOrange" cx="50%" cy="50%" r="50%">`);
  elements.push(`    <stop offset="0%" stop-color="${ORANGE}" stop-opacity="0.12"/>`);
  elements.push(`    <stop offset="100%" stop-color="${ORANGE}" stop-opacity="0"/>`);
  elements.push(`  </radialGradient>`);
  elements.push(`</defs>`);

  // Background
  elements.push(`<rect width="${W}" height="${H}" fill="url(#bgGrad)"/>`);

  // Ambient glow zones (full-bleed)
  elements.push(`<ellipse cx="${W * 0.30}" cy="${CY}" rx="760" ry="520" fill="url(#glowGreen)"/>`);
  elements.push(`<ellipse cx="${W * 0.72}" cy="${CY}" rx="720" ry="480" fill="url(#glowOrange)"/>`);

  // Infrastructure grid (full-bleed)
  for (let x = 160; x < W; x += 160) {
    elements.push(`<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${GREEN}" stroke-width="1" opacity="0.06"/>`);
  }
  for (let y = 160; y < H; y += 160) {
    elements.push(`<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${GREEN}" stroke-width="1" opacity="0.06"/>`);
  }

  // Grid intersection dots — skip the centre where the logo sits
  for (let x = 160; x < W; x += 160) {
    for (let y = 160; y < H; y += 160) {
      const dx = x - CX;
      const dy = y - CY;
      if (Math.sqrt(dx * dx + dy * dy) < 420) continue;
      elements.push(`<circle cx="${x}" cy="${y}" r="2.5" fill="${GREEN}" opacity="0.10"/>`);
    }
  }

  // Concentric circles framing the centred logo
  for (const r of [300, 380]) {
    elements.push(`<circle cx="${CX}" cy="${CY}" r="${r}" fill="none" stroke="${GREEN}" stroke-width="2" opacity="0.09"/>`);
  }

  // Top orange + bottom green accent bars, confined to the safe band so they
  // read as a deliberate frame on every device rather than getting cropped.
  elements.push(`<rect x="${SAFE_X}" y="${SAFE_Y}" width="${SAFE_W}" height="3" fill="${ORANGE}" opacity="0.8"/>`);
  elements.push(`<rect x="${SAFE_X}" y="${SAFE_B - 3}" width="${SAFE_W}" height="3" fill="${GREEN}" opacity="0.8"/>`);

  // Corner brackets on the safe-area rectangle
  const bs = 60;   // bracket arm length
  const bw = 3;    // stroke width
  const bop = 0.28; // opacity
  elements.push(`<path d="M ${SAFE_X} ${SAFE_Y + bs} L ${SAFE_X} ${SAFE_Y} L ${SAFE_X + bs} ${SAFE_Y}" fill="none" stroke="${ORANGE}" stroke-width="${bw}" opacity="${bop}" stroke-linecap="round"/>`);
  elements.push(`<path d="M ${SAFE_R - bs} ${SAFE_Y} L ${SAFE_R} ${SAFE_Y} L ${SAFE_R} ${SAFE_Y + bs}" fill="none" stroke="${ORANGE}" stroke-width="${bw}" opacity="${bop}" stroke-linecap="round"/>`);
  elements.push(`<path d="M ${SAFE_X} ${SAFE_B - bs} L ${SAFE_X} ${SAFE_B} L ${SAFE_X + bs} ${SAFE_B}" fill="none" stroke="${GREEN}" stroke-width="${bw}" opacity="${bop}" stroke-linecap="round"/>`);
  elements.push(`<path d="M ${SAFE_R - bs} ${SAFE_B} L ${SAFE_R} ${SAFE_B} L ${SAFE_R} ${SAFE_B - bs}" fill="none" stroke="${GREEN}" stroke-width="${bw}" opacity="${bop}" stroke-linecap="round"/>`);

  // Diamond accents — symmetric framing inside the safe band
  const diamonds = [
    { x: SAFE_X + 140, y: SAFE_Y + 40, size: 9,  color: ORANGE, opacity: 0.30 },
    { x: SAFE_R - 140, y: SAFE_Y + 40, size: 9,  color: ORANGE, opacity: 0.30 },
    { x: SAFE_X + 140, y: SAFE_B - 40, size: 9,  color: GREEN,  opacity: 0.30 },
    { x: SAFE_R - 140, y: SAFE_B - 40, size: 9,  color: GREEN,  opacity: 0.30 },
  ];
  for (const d of diamonds) {
    const { x, y, size: s, color, opacity } = d;
    elements.push(`<path d="M ${x} ${y - s} L ${x + s} ${y} L ${x} ${y + s} L ${x - s} ${y} Z" fill="${color}" opacity="${opacity}"/>`);
  }

  // ============================================================
  // Centred content stack — all inside the 1546 x 423 safe area
  // ============================================================

  // 1) askOdin logo
  const logoSize = 132;
  const askW = getWidth(FONT_SEMI, 'ask', logoSize);
  const odinW = getWidth(FONT_SEMI, 'Odin', logoSize);
  const logoTotalW = askW + odinW;
  const logoX = CX - logoTotalW / 2;
  const logoBaselineY = CY - 14; // nudge up to leave room for the tagline below

  elements.push(`<path d="${getPath(FONT_SEMI, 'ask', logoX, logoBaselineY, logoSize)}" fill="${ORANGE}"/>`);
  elements.push(`<path d="${getPath(FONT_SEMI, 'Odin', logoX + askW, logoBaselineY, logoSize)}" fill="${GREEN}"/>`);

  // 2) Tagline — IBM Plex Sans Medium, centred under the logo
  const tagline = 'Judgment infrastructure for capital allocation';
  const tagSize = 38;
  const tagW = getWidth(FONT_MED, tagline, tagSize);
  const tagX = CX - tagW / 2;
  const tagY = logoBaselineY + 76;
  elements.push(`<path d="${getPath(FONT_MED, tagline, tagX, tagY, tagSize)}" fill="#FFFFFF" opacity="0.92"/>`);

  // 3) Positioning one-liner — IBM Plex Mono, muted, with a flanking rule
  const sub = 'askOdin verifies judgment.';
  const subSize = 26;
  const subW = getWidth(FONT_MONO, sub, subSize);
  const subX = CX - subW / 2;
  const subY = tagY + 64;
  elements.push(`<path d="${getPath(FONT_MONO, sub, subX, subY, subSize)}" fill="${ORANGE}" opacity="0.85"/>`);

  // flanking rules either side of the mono line
  const ruleGap = 28;
  const ruleLen = 90;
  const ruleY = subY - subSize * 0.32;
  elements.push(`<line x1="${subX - ruleGap - ruleLen}" y1="${ruleY}" x2="${subX - ruleGap}" y2="${ruleY}" stroke="${GREEN}" stroke-width="2" opacity="0.45"/>`);
  elements.push(`<line x1="${subX + subW + ruleGap}" y1="${ruleY}" x2="${subX + subW + ruleGap + ruleLen}" y2="${ruleY}" stroke="${GREEN}" stroke-width="2" opacity="0.45"/>`);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <title>askOdin YouTube Channel Banner — 2560 x 1440 (1546 x 423 safe area)</title>
  ${elements.join('\n  ')}
</svg>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'askOdin-youtube-cover.svg'), svg);
  console.log('YouTube banner SVG generated');

  return svg;
}

async function main() {
  console.log('=== YouTube Channel Banner Generator (2560 x 1440) ===\n');
  generateCover();

  const svgBuf = fs.readFileSync(path.join(OUTPUT_DIR, 'askOdin-youtube-cover.svg'));
  await sharp(svgBuf, { density: 200 })
    .resize(2560, 1440, { fit: 'fill' })
    .png()
    .toFile(path.join(OUTPUT_DIR, 'askOdin-youtube-cover.png'));
  console.log('YouTube banner PNG generated (2560x1440)');
}

main().catch(console.error);
