import opentype from 'opentype.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const FONT_SEMI = opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-SemiBold.ttf');
const FONT_LIGHT = opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-Light.ttf');
const FONT_MEDIUM = opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-Medium.ttf');
const FONT_MONO = opentype.loadSync('./fonts/IBM_Plex_Mono/IBMPlexMono-Regular.ttf');

const ORANGE = '#DB4A2B';
const GREEN = '#147B58';
const DARK = '#111119';
const WHITE = '#FFFFFF';

const OUTPUT_DIR = './output/social';
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

function getPath(font, text, x, y, fontSize) {
  return font.getPath(text, x, y, fontSize).toPathData(2);
}

function getWidth(font, text, fontSize) {
  let width = 0;
  for (let i = 0; i < text.length; i++) {
    const glyph = font.charToGlyph(text[i]);
    width += glyph.advanceWidth;
  }
  return width * (fontSize / font.unitsPerEm);
}

function getBounds(font, text, x, y, fontSize) {
  return font.getPath(text, x, y, fontSize).getBoundingBox();
}

// Twitter/X cover image: 1500 x 500
const W = 1500;
const H = 500;

// --- Mobile-safe zone -------------------------------------------------------
// On the X mobile app the banner is overlaid by chrome that the desktop view
// does not have:
//   - the device status bar across roughly the top ~28% of the banner
//   - the Search / Edit / ellipsis buttons stacked down the RIGHT side,
//     vertically centered
//   - the profile avatar in the bottom-LEFT corner
// So all primary content lives in a low band: right of the avatar
// (x > ~470) and below the action buttons (y > ~385).
// ---------------------------------------------------------------------------

function generateCover() {
  const elements = [];

  // Background
  elements.push(`<rect width="${W}" height="${H}" fill="${DARK}"/>`);

  // Top orange accent bar
  elements.push(`<rect width="${W}" height="4" fill="${ORANGE}"/>`);

  // Faint O logomarks — kept high and sparse so they never crowd the content
  const oPositions = [
    { x: 120, y: 250, size: 240, opacity: 0.022 },
    { x: 700, y: 150, size: 180, opacity: 0.018 },
    { x: 1150, y: 290, size: 210, opacity: 0.020 },
  ];
  for (const pos of oPositions) {
    elements.push(`<path d="${getPath(FONT_SEMI, 'O', pos.x, pos.y, pos.size)}" fill="${GREEN}" opacity="${pos.opacity}"/>`);
  }

  // ============================================================
  // BOTTOM BAND — logo + tagline + reference (mobile-safe zone)
  // ============================================================
  const safeLeft = 470;

  // --- askOdin logo (left of band) ---
  const logoSize = 72;
  const logoBaselineY = 440;
  const askW = getWidth(FONT_SEMI, 'ask', logoSize);
  const odinW = getWidth(FONT_SEMI, 'Odin', logoSize);
  const logoTotalW = askW + odinW;

  elements.push(`<path d="${getPath(FONT_SEMI, 'ask', safeLeft, logoBaselineY, logoSize)}" fill="${ORANGE}"/>`);
  elements.push(`<path d="${getPath(FONT_SEMI, 'Odin', safeLeft + askW, logoBaselineY, logoSize)}" fill="${GREEN}"/>`);

  // --- vertical separator between logo and tagline ---
  const sepX = safeLeft + logoTotalW + 40;
  elements.push(`<line x1="${sepX}" y1="390" x2="${sepX}" y2="441" stroke="${GREEN}" stroke-width="2" opacity="0.6"/>`);

  // --- tagline, two lines, beside the logo ---
  const tagSize = 26;
  const tagX = sepX + 40;
  elements.push(`<path d="${getPath(FONT_LIGHT, 'The Last Mile of AI Isn’t', tagX, 408, tagSize)}" fill="${WHITE}"/>`);
  elements.push(`<path d="${getPath(FONT_LIGHT, 'Information. It’s Judgment.', tagX, 441, tagSize)}" fill="${WHITE}"/>`);

  // --- reference line: patents ---
  const patentSize = 17;
  const patentText = 'U.S. Patents Pending: 63/948,559 · 63/994,876 · 64/011,252 · 64/017,488';
  elements.push(`<path d="${getPath(FONT_MONO, patentText, safeLeft, 478, patentSize)}" fill="${WHITE}" opacity="0.5"/>`);

  // --- CTA pill: askodin.app, bottom-right (clear of avatar + buttons) ---
  const ctaSize = 21;
  const ctaText = 'askodin.app';
  const ctaBaselineY = 425;
  const ctaW = getWidth(FONT_MEDIUM, ctaText, ctaSize);
  const ctaX = (W - 70) - ctaW;
  const ctaPadX = 18;
  const ctaPadY = 13;
  const ctaBounds = getBounds(FONT_MEDIUM, ctaText, ctaX, ctaBaselineY, ctaSize);
  elements.push(`<rect x="${ctaX - ctaPadX}" y="${ctaBounds.y1 - ctaPadY}" width="${ctaW + ctaPadX * 2}" height="${ctaBounds.y2 - ctaBounds.y1 + ctaPadY * 2}" rx="5" fill="${GREEN}"/>`);
  elements.push(`<path d="${getPath(FONT_MEDIUM, ctaText, ctaX, ctaBaselineY, ctaSize)}" fill="${WHITE}"/>`);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <title>askOdin Twitter Cover</title>
  ${elements.join('\n  ')}
</svg>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'askOdin-twitter-cover.svg'), svg);
  console.log('Twitter cover SVG generated');

  return svg;
}

async function main() {
  console.log('=== Twitter/X Cover Generator (1500 x 500) ===\n');
  generateCover();

  // Generate PNG
  const svgBuf = fs.readFileSync(path.join(OUTPUT_DIR, 'askOdin-twitter-cover.svg'));
  await sharp(svgBuf, { density: 300 })
    .resize(1500, 500, { fit: 'fill' })
    .png()
    .toFile(path.join(OUTPUT_DIR, 'askOdin-twitter-cover.png'));
  console.log('Twitter cover PNG generated (1500x500)');

  // 2x version for retina
  await sharp(svgBuf, { density: 300 })
    .resize(3000, 1000, { fit: 'fill' })
    .png()
    .toFile(path.join(OUTPUT_DIR, 'askOdin-twitter-cover-2x.png'));
  console.log('Twitter cover PNG @2x generated (3000x1000)');
}

main().catch(console.error);
