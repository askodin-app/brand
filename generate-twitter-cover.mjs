import opentype from 'opentype.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const FONT_SEMI = opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-SemiBold.ttf');
const FONT_REG = opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-Regular.ttf');
const FONT_LIGHT = opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-Light.ttf');
const FONT_MEDIUM = opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-Medium.ttf');
const FONT_MONO = opentype.loadSync('./fonts/IBM_Plex_Mono/IBMPlexMono-Regular.ttf');

const ORANGE = '#DB4A2B';
const GREEN = '#147B58';
const DARK = '#111119';
const WHITE = '#FFFFFF';
const MUTED = '#6B7A8D';
const LIGHT_MUTED = '#8899AA';

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

// Profile photo overlap zone: approximately left 0-120px, bottom 130px on desktop
// Safe zone for important content: right/center, avoid bottom-left corner

function generateCover() {
  const elements = [];

  // Background
  elements.push(`<rect width="${W}" height="${H}" fill="${DARK}"/>`);

  // Top orange accent bar
  elements.push(`<rect width="${W}" height="4" fill="${ORANGE}"/>`);

  // Subtle background pattern: faint O logomarks scattered
  const oPositions = [
    { x: 100, y: 150, size: 200, opacity: 0.02 },
    { x: 380, y: 320, size: 140, opacity: 0.015 },
    { x: 600, y: 100, size: 220, opacity: 0.02 },
    { x: 800, y: 380, size: 110, opacity: 0.015 },
    { x: 200, y: 420, size: 100, opacity: 0.012 },
  ];

  for (const pos of oPositions) {
    const oPath = getPath(FONT_SEMI, 'O', pos.x, pos.y, pos.size);
    elements.push(`<path d="${oPath}" fill="${GREEN}" opacity="${pos.opacity}"/>`);
  }

  // Subtle grid lines suggesting "infrastructure"
  for (let x = 460; x < W - 40; x += 80) {
    elements.push(`<line x1="${x}" y1="20" x2="${x}" y2="${H - 20}" stroke="${WHITE}" stroke-width="0.3" opacity="0.02"/>`);
  }
  for (let y = 40; y < H - 20; y += 60) {
    elements.push(`<line x1="460" y1="${y}" x2="${W - 40}" y2="${y}" stroke="${WHITE}" stroke-width="0.3" opacity="0.02"/>`);
  }

  // ============================================================
  // RIGHT SIDE: Logo + Tagline + CTA (primary content)
  // ============================================================
  const rightMargin = 80;
  const contentRight = W - rightMargin;

  // askOdin logo - right aligned
  const logoSize = 62;
  const askText = 'ask';
  const odinText = 'Odin';
  const askW = getWidth(FONT_SEMI, askText, logoSize);
  const odinW = getWidth(FONT_SEMI, odinText, logoSize);
  const logoTotalW = askW + odinW;
  const logoX = contentRight - logoTotalW;
  const logoY = 145;

  const askPath = getPath(FONT_SEMI, askText, logoX, logoY, logoSize);
  const odinPath = getPath(FONT_SEMI, odinText, logoX + askW, logoY, logoSize);

  elements.push(`<path d="${askPath}" fill="${ORANGE}"/>`);
  elements.push(`<path d="${odinPath}" fill="${GREEN}"/>`);

  // Tagline
  const tagSize = 22;
  const tagText = 'The Last Mile of AI Isn\'t Information. It\'s Judgment.';
  const tagW = getWidth(FONT_LIGHT, tagText, tagSize);
  const tagX = contentRight - tagW;
  const tagY = logoY + 55;

  const tagPath = getPath(FONT_LIGHT, tagText, tagX, tagY, tagSize);
  elements.push(`<path d="${tagPath}" fill="${WHITE}"/>`);

  // Separator line
  const sepY = tagY + 35;
  const sepW = 70;
  elements.push(`<line x1="${contentRight - sepW}" y1="${sepY}" x2="${contentRight}" y2="${sepY}" stroke="${ORANGE}" stroke-width="2.5"/>`);

  // Sub-info line: Patent number
  const infoSize = 16;
  const infoY = sepY + 35;

  const infoText = 'U.S. Patent App. 63/948,559';
  const infoW = getWidth(FONT_MONO, infoText, infoSize);
  const infoX = contentRight - infoW;
  const infoPath = getPath(FONT_MONO, infoText, infoX, infoY, infoSize);
  elements.push(`<path d="${infoPath}" fill="${WHITE}" opacity="0.7"/>`);

  // CTA at bottom right
  const ctaSize = 18;
  const ctaText = 'askodin.app';
  const ctaW = getWidth(FONT_MEDIUM, ctaText, ctaSize);
  const ctaX = contentRight - ctaW;
  const ctaY = H - 55;

  // CTA pill background
  const ctaPadX = 18;
  const ctaPadY = 12;
  const ctaBounds = getBounds(FONT_MEDIUM, ctaText, ctaX, ctaY, ctaSize);
  elements.push(`<rect x="${ctaX - ctaPadX}" y="${ctaBounds.y1 - ctaPadY}" width="${ctaW + ctaPadX * 2}" height="${ctaBounds.y2 - ctaBounds.y1 + ctaPadY * 2}" rx="5" fill="${GREEN}"/>`);

  const ctaPath = getPath(FONT_MEDIUM, ctaText, ctaX, ctaY, ctaSize);
  elements.push(`<path d="${ctaPath}" fill="${WHITE}"/>`);

  // "Learn More" label before CTA
  const trySize = 16;
  const tryText = 'Learn More';
  const tryW = getWidth(FONT_SEMI, tryText, trySize);
  const tryX = ctaX - ctaPadX - 14 - tryW;
  const tryPath = getPath(FONT_SEMI, tryText, tryX, ctaY, trySize);
  elements.push(`<path d="${tryPath}" fill="${ORANGE}" opacity="0.8"/>`);

  // Arrow
  const arrowX = tryX + tryW + 6;
  const arrowY = ctaY - 5;
  elements.push(`<path d="M ${arrowX} ${arrowY} l 6 0 l -2 -2 M ${arrowX + 6} ${arrowY} l -2 2" stroke="${ORANGE}" stroke-width="1.5" fill="none" opacity="0.6"/>`);

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
