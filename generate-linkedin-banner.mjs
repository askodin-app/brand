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

// LinkedIn cover image: 1584 x 396
const W = 1584;
const H = 396;

// Profile photo overlap zone: approximately left 0-420px, bottom 200-396px on desktop
// Safe zone for important content: right side, roughly x > 450
// On mobile: center is most visible

function generateBanner() {
  const elements = [];

  // Background
  elements.push(`<rect width="${W}" height="${H}" fill="${DARK}"/>`);

  // Top orange accent bar
  elements.push(`<rect width="${W}" height="4" fill="${ORANGE}"/>`);

  // Subtle background pattern: faint O logomarks scattered
  // Creates a "judgment infrastructure" texture feel
  const patternOs = [];
  const oPositions = [
    { x: 80, y: 120, size: 180, opacity: 0.02 },
    { x: 350, y: 250, size: 120, opacity: 0.015 },
    { x: 550, y: 80, size: 200, opacity: 0.02 },
    { x: 750, y: 300, size: 100, opacity: 0.015 },
    { x: 180, y: 320, size: 90, opacity: 0.012 },
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
  const logoY = 105;

  const askPath = getPath(FONT_SEMI, askText, logoX, logoY, logoSize);
  const odinPath = getPath(FONT_SEMI, odinText, logoX + askW, logoY, logoSize);

  elements.push(`<path d="${askPath}" fill="${ORANGE}"/>`);
  elements.push(`<path d="${odinPath}" fill="${GREEN}"/>`);

  // Tagline
  const tagSize = 30;
  const tagText = 'The Last Mile of AI Isn\'t Information. It\'s Judgment.';
  const tagW = getWidth(FONT_LIGHT, tagText, tagSize);
  const tagX = contentRight - tagW;
  const tagY = logoY + 55;

  const tagPath = getPath(FONT_LIGHT, tagText, tagX, tagY, tagSize);
  elements.push(`<path d="${tagPath}" fill="${WHITE}"/>`);

  // Separator line
  const sepY = tagY + 36;
  const sepW = 80;
  elements.push(`<line x1="${contentRight - sepW}" y1="${sepY}" x2="${contentRight}" y2="${sepY}" stroke="${ORANGE}" stroke-width="2.5"/>`);

  // Sub-info line: Patent number
  const infoSize = 20;
  const infoY = sepY + 34;

  const infoText = 'U.S. Patents Pending: 63/948,559 \u00B7 63/994,876 \u00B7 64/011,252 \u00B7 64/017,488';
  const infoW = getWidth(FONT_MONO, infoText, infoSize);
  const infoX = contentRight - infoW;
  const infoPath = getPath(FONT_MONO, infoText, infoX, infoY, infoSize);
  elements.push(`<path d="${infoPath}" fill="${WHITE}" opacity="0.7"/>`);

  // CTA at bottom right
  const ctaSize = 22;
  const ctaText = 'askodin.app';
  const ctaW = getWidth(FONT_MEDIUM, ctaText, ctaSize);
  const ctaX = contentRight - ctaW;
  const ctaY = H - 48;

  // CTA pill background
  const ctaPadX = 22;
  const ctaPadY = 14;
  const ctaBounds = getBounds(FONT_MEDIUM, ctaText, ctaX, ctaY, ctaSize);
  elements.push(`<rect x="${ctaX - ctaPadX}" y="${ctaBounds.y1 - ctaPadY}" width="${ctaW + ctaPadX * 2}" height="${ctaBounds.y2 - ctaBounds.y1 + ctaPadY * 2}" rx="5" fill="${GREEN}"/>`);

  const ctaPath = getPath(FONT_MEDIUM, ctaText, ctaX, ctaY, ctaSize);
  elements.push(`<path d="${ctaPath}" fill="${WHITE}"/>`);


  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <title>askOdin LinkedIn Banner</title>
  ${elements.join('\n  ')}
</svg>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'askOdin-linkedin-banner.svg'), svg);
  console.log('LinkedIn banner SVG generated');

  return svg;
}

async function main() {
  console.log('=== LinkedIn Banner Generator (1584 x 396) ===\n');
  generateBanner();

  // Generate PNG
  const svgBuf = fs.readFileSync(path.join(OUTPUT_DIR, 'askOdin-linkedin-banner.svg'));
  await sharp(svgBuf, { density: 300 })
    .resize(1584, 396, { fit: 'fill' })
    .png()
    .toFile(path.join(OUTPUT_DIR, 'askOdin-linkedin-banner.png'));
  console.log('LinkedIn banner PNG generated (1584x396)');

  // 2x version for retina
  await sharp(svgBuf, { density: 300 })
    .resize(3168, 792, { fit: 'fill' })
    .png()
    .toFile(path.join(OUTPUT_DIR, 'askOdin-linkedin-banner-2x.png'));
  console.log('LinkedIn banner PNG @2x generated (3168x792)');
}

main().catch(console.error);
