import opentype from 'opentype.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const FONT_SEMI = opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-SemiBold.ttf');

const ORANGE = '#DB4A2B';
const GREEN = '#147B58';
const DARK = '#111119';

// X/Twitter profile header — identity furniture, replaced in place rather than published
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

// Twitter/X cover image: 1500 x 500
const W = 1500;
const H = 500;
const CX = W / 2;
const CY = H / 2;

// --- Mobile-safe zone -------------------------------------------------------
// The X mobile app overlays the banner with: the status bar (top), the
// Search/Edit/ellipsis buttons (far right, vertically centred) and the avatar
// (bottom-left). A centred logo clears all three, provided it stays out of the
// right ~40%. The logo width below is capped to keep its right edge left of
// the button column (~x 910).
// ---------------------------------------------------------------------------

function generateCover() {
  const elements = [];

  // --- defs: gradients (ported from the Zoom virtual background) ---
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

  // Top orange + bottom green accent bars
  elements.push(`<rect width="${W}" height="4" fill="${ORANGE}"/>`);
  elements.push(`<rect y="${H - 4}" width="${W}" height="4" fill="${GREEN}"/>`);

  // Ambient glow zones
  elements.push(`<ellipse cx="${W * 0.28}" cy="${H * 0.5}" rx="430" ry="280" fill="url(#glowGreen)"/>`);
  elements.push(`<ellipse cx="${W * 0.74}" cy="${H * 0.55}" rx="400" ry="260" fill="url(#glowOrange)"/>`);

  // Infrastructure grid
  for (let x = 100; x < W; x += 100) {
    elements.push(`<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${GREEN}" stroke-width="0.8" opacity="0.07"/>`);
  }
  for (let y = 80; y < H; y += 80) {
    elements.push(`<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${GREEN}" stroke-width="0.8" opacity="0.07"/>`);
  }

  // Grid intersection dots — skip the centre where the logo sits
  for (let x = 100; x < W; x += 100) {
    for (let y = 80; y < H; y += 80) {
      const dx = x - CX;
      const dy = y - CY;
      if (Math.sqrt(dx * dx + dy * dy) < 260) continue;
      elements.push(`<circle cx="${x}" cy="${y}" r="2" fill="${GREEN}" opacity="0.12"/>`);
    }
  }

  // Concentric circles framing the centred logo
  for (const r of [170, 222]) {
    elements.push(`<circle cx="${CX}" cy="${CY}" r="${r}" fill="none" stroke="${GREEN}" stroke-width="1.5" opacity="0.1"/>`);
  }

  // Diamond accents — symmetric framing
  const diamonds = [
    { x: 80,   y: 80,  size: 12, color: ORANGE, opacity: 0.35 },
    { x: 1420, y: 80,  size: 12, color: ORANGE, opacity: 0.35 },
    { x: 80,   y: 420, size: 12, color: GREEN,  opacity: 0.35 },
    { x: 1420, y: 420, size: 12, color: GREEN,  opacity: 0.35 },
    { x: 250,  y: 60,  size: 8,  color: GREEN,  opacity: 0.30 },
    { x: 1250, y: 60,  size: 8,  color: GREEN,  opacity: 0.30 },
    { x: 250,  y: 440, size: 8,  color: ORANGE, opacity: 0.30 },
    { x: 1250, y: 440, size: 8,  color: ORANGE, opacity: 0.30 },
    { x: 60,   y: 250, size: 8,  color: GREEN,  opacity: 0.28 },
    { x: 1440, y: 250, size: 8,  color: GREEN,  opacity: 0.28 },
    { x: 470,  y: 70,  size: 6,  color: ORANGE, opacity: 0.22 },
    { x: 1030, y: 70,  size: 6,  color: ORANGE, opacity: 0.22 },
    { x: 470,  y: 430, size: 6,  color: GREEN,  opacity: 0.22 },
    { x: 1030, y: 430, size: 6,  color: GREEN,  opacity: 0.22 },
  ];
  for (const d of diamonds) {
    const { x, y, size: s, color, opacity } = d;
    elements.push(`<path d="M ${x} ${y - s} L ${x + s} ${y} L ${x} ${y + s} L ${x - s} ${y} Z" fill="${color}" opacity="${opacity}"/>`);
  }

  // Corner brackets
  const bs = 48;   // bracket arm length
  const bo = 34;   // offset from edge
  const bw = 2.5;  // stroke width
  const bop = 0.3; // opacity
  elements.push(`<path d="M ${bo} ${bo + bs} L ${bo} ${bo} L ${bo + bs} ${bo}" fill="none" stroke="${ORANGE}" stroke-width="${bw}" opacity="${bop}" stroke-linecap="round"/>`);
  elements.push(`<path d="M ${W - bo - bs} ${bo} L ${W - bo} ${bo} L ${W - bo} ${bo + bs}" fill="none" stroke="${ORANGE}" stroke-width="${bw}" opacity="${bop}" stroke-linecap="round"/>`);
  elements.push(`<path d="M ${bo} ${H - bo - bs} L ${bo} ${H - bo} L ${bo + bs} ${H - bo}" fill="none" stroke="${GREEN}" stroke-width="${bw}" opacity="${bop}" stroke-linecap="round"/>`);
  elements.push(`<path d="M ${W - bo - bs} ${H - bo} L ${W - bo} ${H - bo} L ${W - bo} ${H - bo - bs}" fill="none" stroke="${GREEN}" stroke-width="${bw}" opacity="${bop}" stroke-linecap="round"/>`);

  // ============================================================
  // askOdin logo — dead centre, horizontally and vertically
  // ============================================================
  const logoSize = 76;
  const askW = getWidth(FONT_SEMI, 'ask', logoSize);
  const odinW = getWidth(FONT_SEMI, 'Odin', logoSize);
  const logoTotalW = askW + odinW;
  const logoX = CX - logoTotalW / 2;
  const capHeight = logoSize * 0.7;
  const logoBaselineY = CY + capHeight / 2; // cap-height block centred on CY

  elements.push(`<path d="${getPath(FONT_SEMI, 'ask', logoX, logoBaselineY, logoSize)}" fill="${ORANGE}"/>`);
  elements.push(`<path d="${getPath(FONT_SEMI, 'Odin', logoX + askW, logoBaselineY, logoSize)}" fill="${GREEN}"/>`);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <title>askOdin Twitter Cover — centred</title>
  ${elements.join('\n  ')}
</svg>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'askOdin-twitter-cover-centered.svg'), svg);
  console.log('Twitter cover (centered) SVG generated');

  return svg;
}

async function main() {
  console.log('=== Twitter/X Cover Generator — centered logo (1500 x 500) ===\n');
  generateCover();

  const svgBuf = fs.readFileSync(path.join(OUTPUT_DIR, 'askOdin-twitter-cover-centered.svg'));
  await sharp(svgBuf, { density: 300 })
    .resize(1500, 500, { fit: 'fill' })
    .png()
    .toFile(path.join(OUTPUT_DIR, 'askOdin-twitter-cover-centered.png'));
  console.log('Twitter cover (centered) PNG generated (1500x500)');

  await sharp(svgBuf, { density: 300 })
    .resize(3000, 1000, { fit: 'fill' })
    .png()
    .toFile(path.join(OUTPUT_DIR, 'askOdin-twitter-cover-centered-2x.png'));
  console.log('Twitter cover (centered) PNG @2x generated (3000x1000)');
}

main().catch(console.error);
