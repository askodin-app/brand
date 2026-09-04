import opentype from 'opentype.js';
import fs from 'fs';
import path from 'path';

const FONT_PATH = './fonts/IBM_Plex_Sans/static/IBMPlexSans-SemiBold.ttf';
const FONT_PATH_REG = './fonts/IBM_Plex_Sans/static/IBMPlexSans-Regular.ttf';
const FONT_PATH_MEDIUM = './fonts/IBM_Plex_Sans/static/IBMPlexSans-Medium.ttf';
const FONT_PATH_LIGHT = './fonts/IBM_Plex_Sans/static/IBMPlexSans-Light.ttf';
const FONT_PATH_MONO = './fonts/IBM_Plex_Mono/IBMPlexMono-Regular.ttf';

const OUTPUT_DIR = './output/business-card';
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// Brand colors
const ORANGE = '#DB4A2B';
const GREEN = '#147B58';
const DARK = '#111119';
const DARK_SURFACE = '#1A1A2E';
const WHITE = '#FFFFFF';
const MUTED = '#6B7A8D';
const LIGHT_MUTED = '#4A5568';

// Load fonts
const fontSemiBold = opentype.loadSync(FONT_PATH);
const fontRegular = opentype.loadSync(FONT_PATH_REG);
const fontMedium = opentype.loadSync(FONT_PATH_MEDIUM);
const fontLight = opentype.loadSync(FONT_PATH_LIGHT);

let fontMono;
try {
  fontMono = opentype.loadSync(FONT_PATH_MONO);
} catch(e) {
  // Fall back to regular if mono not available
  fontMono = fontRegular;
}

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

// =============================================================
// MOO Standard Business Card
// Bleed: 93 x 55mm → use as SVG viewport in mm
// Trim: 89 x 51mm → visible area
// Safe: 85 x 47mm → text must stay inside
//
// Working in points for easier font sizing (1mm ≈ 2.835pt)
// Let's work in mm directly, with font sizes in mm
// =============================================================

const BLEED_W = 93;
const BLEED_H = 55;
const TRIM_W = 89;
const TRIM_H = 51;
const SAFE_W = 85;
const SAFE_H = 47;
const BLEED = 2; // bleed on each side

// Safe area bounds
const SAFE_LEFT = (BLEED_W - SAFE_W) / 2;   // 4mm
const SAFE_TOP = (BLEED_H - SAFE_H) / 2;     // 4mm
const SAFE_RIGHT = SAFE_LEFT + SAFE_W;        // 89mm
const SAFE_BOTTOM = SAFE_TOP + SAFE_H;        // 51mm

const TRIM_LEFT = BLEED;
const TRIM_TOP = BLEED;

// Scale factor: work in a coordinate system where 1 unit = 1mm
// But font sizes need to be in the same units

// ============================================================
// FRONT - Dark theme
// ============================================================
function generateFront() {
  const W = BLEED_W;
  const H = BLEED_H;

  const elements = [];

  // Background
  elements.push(`<rect width="${W}" height="${H}" fill="${DARK}"/>`);

  // Top accent bar (orange, full bleed width)
  elements.push(`<rect width="${W}" height="1.2" fill="${ORANGE}"/>`);

  // askOdin logo (small, top-left of safe area)
  const logoSize = 5.5; // font size in mm
  const logoX = SAFE_LEFT;
  const logoY = SAFE_TOP + 6;

  const askPath = getPath(fontSemiBold, 'ask', logoX, logoY, logoSize);
  const askW = getWidth(fontSemiBold, 'ask', logoSize);
  const odinPath = getPath(fontSemiBold, 'Odin', logoX + askW, logoY, logoSize);

  elements.push(`<path d="${askPath}" fill="${ORANGE}"/>`);
  elements.push(`<path d="${odinPath}" fill="${GREEN}"/>`);

  // Thin separator line
  const lineY = logoY + 3;
  elements.push(`<line x1="${SAFE_LEFT}" y1="${lineY}" x2="${SAFE_LEFT + 12}" y2="${lineY}" stroke="${ORANGE}" stroke-width="0.3"/>`);

  // Name
  const nameSize = 5;
  const nameY = lineY + 7;
  const namePath = getPath(fontSemiBold, 'YekSoon Lok', SAFE_LEFT, nameY, nameSize);
  elements.push(`<path d="${namePath}" fill="${WHITE}"/>`);

  // Title
  const titleSize = 3;
  const titleY = nameY + 5;
  const titlePath = getPath(fontRegular, 'Founder & CEO', SAFE_LEFT, titleY, titleSize);
  elements.push(`<path d="${titlePath}" fill="${MUTED}"/>`);

  // Contact details - bottom left of safe area
  const contactSize = 2.5;
  const contactGap = 4;

  const emailY = SAFE_BOTTOM - 2.5;
  const webY = emailY - contactGap;

  const emailPath = getPath(fontRegular, 'hi@askodin.app', SAFE_LEFT, emailY, contactSize);
  const webPath = getPath(fontRegular, 'crucible.askodin.app', SAFE_LEFT, webY, contactSize);

  elements.push(`<path d="${emailPath}" fill="#8899AA"/>`);
  elements.push(`<path d="${webPath}" fill="#8899AA"/>`);

  // Logomark (O with diamond) - bottom right
  const iconSize = 14;
  const iconX = SAFE_RIGHT - 13;
  const iconBaselineY = SAFE_BOTTOM - 1;

  const oIconPath = getPath(fontSemiBold, 'O', iconX, iconBaselineY, iconSize);
  const oIconBounds = getBounds(fontSemiBold, 'O', iconX, iconBaselineY, iconSize);

  const dCx = (oIconBounds.x1 + oIconBounds.x2) / 2;
  const dCy = (oIconBounds.y1 + oIconBounds.y2) / 2;
  const dSize = iconSize * 0.08;
  const diamondPath = `M ${dCx} ${dCy - dSize} L ${dCx + dSize} ${dCy} L ${dCx} ${dCy + dSize} L ${dCx - dSize} ${dCy} Z`;

  elements.push(`<path d="${oIconPath}" fill="${GREEN}" opacity="0.15"/>`);
  elements.push(`<path d="${diamondPath}" fill="${ORANGE}" opacity="0.25"/>`);

  // Trim marks (for reference, won't print)
  // elements.push(`<rect x="${TRIM_LEFT}" y="${TRIM_TOP}" width="${TRIM_W}" height="${TRIM_H}" fill="none" stroke="#ff0" stroke-width="0.1" stroke-dasharray="1,1"/>`);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}mm" height="${H}mm">
  <title>askOdin Business Card - Front</title>
  ${elements.join('\n  ')}
</svg>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'askOdin-card-front-dark.svg'), svg);
  console.log('Front (dark) generated');
}

// ============================================================
// FRONT - Light theme (alternative)
// ============================================================
function generateFrontLight() {
  const W = BLEED_W;
  const H = BLEED_H;

  const elements = [];

  // White background
  elements.push(`<rect width="${W}" height="${H}" fill="${WHITE}"/>`);

  // Top accent bar
  elements.push(`<rect width="${W}" height="1.2" fill="${ORANGE}"/>`);

  // askOdin logo
  const logoSize = 5.5;
  const logoX = SAFE_LEFT;
  const logoY = SAFE_TOP + 6;

  const askPath = getPath(fontSemiBold, 'ask', logoX, logoY, logoSize);
  const askW = getWidth(fontSemiBold, 'ask', logoSize);
  const odinPath = getPath(fontSemiBold, 'Odin', logoX + askW, logoY, logoSize);

  elements.push(`<path d="${askPath}" fill="${ORANGE}"/>`);
  elements.push(`<path d="${odinPath}" fill="${GREEN}"/>`);

  // Separator
  const lineY = logoY + 3;
  elements.push(`<line x1="${SAFE_LEFT}" y1="${lineY}" x2="${SAFE_LEFT + 12}" y2="${lineY}" stroke="${ORANGE}" stroke-width="0.3"/>`);

  // Name
  const nameSize = 5;
  const nameY = lineY + 7;
  const namePath = getPath(fontSemiBold, 'YekSoon Lok', SAFE_LEFT, nameY, nameSize);
  elements.push(`<path d="${namePath}" fill="#1A1A2E"/>`);

  // Title
  const titleSize = 3;
  const titleY = nameY + 5;
  const titlePath = getPath(fontRegular, 'Founder & CEO', SAFE_LEFT, titleY, titleSize);
  elements.push(`<path d="${titlePath}" fill="${LIGHT_MUTED}"/>`);

  // Contact
  const contactSize = 2.5;
  const contactGap = 4;
  const emailY = SAFE_BOTTOM - 2.5;
  const webY = emailY - contactGap;

  const emailPath = getPath(fontRegular, 'hi@askodin.app', SAFE_LEFT, emailY, contactSize);
  const webPath = getPath(fontRegular, 'crucible.askodin.app', SAFE_LEFT, webY, contactSize);

  elements.push(`<path d="${emailPath}" fill="${LIGHT_MUTED}"/>`);
  elements.push(`<path d="${webPath}" fill="${LIGHT_MUTED}"/>`);

  // Subtle logomark bottom right
  const iconSize = 14;
  const iconX = SAFE_RIGHT - 13;
  const iconBaselineY = SAFE_BOTTOM - 1;

  const oIconPath = getPath(fontSemiBold, 'O', iconX, iconBaselineY, iconSize);
  const oIconBounds = getBounds(fontSemiBold, 'O', iconX, iconBaselineY, iconSize);

  const dCx = (oIconBounds.x1 + oIconBounds.x2) / 2;
  const dCy = (oIconBounds.y1 + oIconBounds.y2) / 2;
  const dSize = iconSize * 0.08;
  const diamondPath = `M ${dCx} ${dCy - dSize} L ${dCx + dSize} ${dCy} L ${dCx} ${dCy + dSize} L ${dCx - dSize} ${dCy} Z`;

  elements.push(`<path d="${oIconPath}" fill="${GREEN}" opacity="0.07"/>`);
  elements.push(`<path d="${diamondPath}" fill="${ORANGE}" opacity="0.12"/>`);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}mm" height="${H}mm">
  <title>askOdin Business Card - Front (Light)</title>
  ${elements.join('\n  ')}
</svg>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'askOdin-card-front-light.svg'), svg);
  console.log('Front (light) generated');
}

// ============================================================
// BACK - Dark with centered logomark
// ============================================================
function generateBackDark() {
  const W = BLEED_W;
  const H = BLEED_H;

  const elements = [];

  // Background
  elements.push(`<rect width="${W}" height="${H}" fill="${DARK}"/>`);

  // Bottom accent bar
  elements.push(`<rect y="${H - 1.2}" width="${W}" height="1.2" fill="${ORANGE}"/>`);

  // Centered logomark
  const iconSize = 18;
  const centerX = W / 2;
  const centerY = H / 2;

  // Get O bounds to center it
  const oBounds = getBounds(fontSemiBold, 'O', 0, 0, iconSize);
  const oW = oBounds.x2 - oBounds.x1;
  const oH = oBounds.y2 - oBounds.y1;

  const oX = centerX - oW / 2 - oBounds.x1;
  const oY = centerY - oH / 2 - oBounds.y1 - 2; // shift up slightly for visual center with tagline

  const oPath = getPath(fontSemiBold, 'O', oX, oY, iconSize);
  const oCenteredBounds = getBounds(fontSemiBold, 'O', oX, oY, iconSize);

  const dCx = (oCenteredBounds.x1 + oCenteredBounds.x2) / 2;
  const dCy = (oCenteredBounds.y1 + oCenteredBounds.y2) / 2;
  const dSize = iconSize * 0.08;
  const diamondPath = `M ${dCx} ${dCy - dSize} L ${dCx + dSize} ${dCy} L ${dCx} ${dCy + dSize} L ${dCx - dSize} ${dCy} Z`;

  elements.push(`<path d="${oPath}" fill="${GREEN}"/>`);
  elements.push(`<path d="${diamondPath}" fill="${ORANGE}"/>`);

  // Tagline below logomark
  const tagSize = 2.2;
  const tagText = 'Judgment Infrastructure for Capital Allocation';
  const tagW = getWidth(fontRegular, tagText, tagSize);
  const tagX = centerX - tagW / 2;
  const tagY = oCenteredBounds.y2 + 5;

  const tagPath = getPath(fontRegular, tagText, tagX, tagY, tagSize);
  elements.push(`<path d="${tagPath}" fill="${MUTED}"/>`);

  // Patent line at very bottom
  const patentSize = 1.6;
  const patentText = 'U.S. Patents Pending';
  const patentW = getWidth(fontRegular, patentText, patentSize);
  const patentX = centerX - patentW / 2;
  const patentY = SAFE_BOTTOM - 1;

  const patentPath = getPath(fontRegular, patentText, patentX, patentY, patentSize);
  elements.push(`<path d="${patentPath}" fill="#3A3A4A"/>`);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}mm" height="${H}mm">
  <title>askOdin Business Card - Back (Dark)</title>
  ${elements.join('\n  ')}
</svg>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'askOdin-card-back-dark.svg'), svg);
  console.log('Back (dark) generated');
}

// ============================================================
// BACK - White with centered logomark
// ============================================================
function generateBackLight() {
  const W = BLEED_W;
  const H = BLEED_H;

  const elements = [];

  // White background
  elements.push(`<rect width="${W}" height="${H}" fill="${WHITE}"/>`);

  // Bottom accent bar
  elements.push(`<rect y="${H - 1.2}" width="${W}" height="1.2" fill="${ORANGE}"/>`);

  // Centered logomark
  const iconSize = 18;
  const centerX = W / 2;
  const centerY = H / 2;

  const oBounds = getBounds(fontSemiBold, 'O', 0, 0, iconSize);
  const oW = oBounds.x2 - oBounds.x1;
  const oH = oBounds.y2 - oBounds.y1;

  const oX = centerX - oW / 2 - oBounds.x1;
  const oY = centerY - oH / 2 - oBounds.y1 - 2;

  const oPath = getPath(fontSemiBold, 'O', oX, oY, iconSize);
  const oCenteredBounds = getBounds(fontSemiBold, 'O', oX, oY, iconSize);

  const dCx = (oCenteredBounds.x1 + oCenteredBounds.x2) / 2;
  const dCy = (oCenteredBounds.y1 + oCenteredBounds.y2) / 2;
  const dSize = iconSize * 0.08;
  const diamondPath = `M ${dCx} ${dCy - dSize} L ${dCx + dSize} ${dCy} L ${dCx} ${dCy + dSize} L ${dCx - dSize} ${dCy} Z`;

  elements.push(`<path d="${oPath}" fill="${GREEN}"/>`);
  elements.push(`<path d="${diamondPath}" fill="${ORANGE}"/>`);

  // Tagline
  const tagSize = 2.2;
  const tagText = 'Judgment Infrastructure for Capital Allocation';
  const tagW = getWidth(fontRegular, tagText, tagSize);
  const tagX = centerX - tagW / 2;
  const tagY = oCenteredBounds.y2 + 5;

  const tagPath = getPath(fontRegular, tagText, tagX, tagY, tagSize);
  elements.push(`<path d="${tagPath}" fill="${LIGHT_MUTED}"/>`);

  // Patent
  const patentSize = 1.6;
  const patentText = 'U.S. Patents Pending';
  const patentW = getWidth(fontRegular, patentText, patentSize);
  const patentX = centerX - patentW / 2;
  const patentY = SAFE_BOTTOM - 1;

  const patentPath = getPath(fontRegular, patentText, patentX, patentY, patentSize);
  elements.push(`<path d="${patentPath}" fill="#C0C0C0"/>`);

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}mm" height="${H}mm">
  <title>askOdin Business Card - Back (Light)</title>
  ${elements.join('\n  ')}
</svg>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'askOdin-card-back-light.svg'), svg);
  console.log('Back (light) generated');
}

// ============================================================
// RUN
// ============================================================
console.log('=== Business Card Generator (MOO Standard 3.5 x 2.0") ===\n');
console.log(`Bleed: ${BLEED_W} x ${BLEED_H}mm`);
console.log(`Trim: ${TRIM_W} x ${TRIM_H}mm`);
console.log(`Safe: ${SAFE_W} x ${SAFE_H}mm\n`);

generateFront();
generateFrontLight();
generateBackDark();
generateBackLight();

console.log('\nAll business card SVGs generated in ./output/business-card/');
