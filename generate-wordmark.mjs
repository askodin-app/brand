import opentype from 'opentype.js';
import fs from 'fs';
import path from 'path';

const FONT_PATH = './fonts/IBM_Plex_Sans/static/IBMPlexSans-SemiBold.ttf';
const OUTPUT_DIR = './output';

// Brand colors
const ORANGE = '#DB4A2B';
const GREEN = '#147B58';

// Ensure output directory exists
fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.mkdirSync(path.join(OUTPUT_DIR, 'wordmark'), { recursive: true });
fs.mkdirSync(path.join(OUTPUT_DIR, 'logomark'), { recursive: true });
fs.mkdirSync(path.join(OUTPUT_DIR, 'combined'), { recursive: true });
// Site-wide OG mark and square avatars — identity, not publications, so they
// sit at stable undated paths rather than under output/social.
fs.mkdirSync(path.join(OUTPUT_DIR, 'og'), { recursive: true });
fs.mkdirSync(path.join(OUTPUT_DIR, 'profile'), { recursive: true });
fs.mkdirSync(path.join(OUTPUT_DIR, 'favicon'), { recursive: true });

// Load font
const font = opentype.loadSync(FONT_PATH);

/**
 * Get SVG path data for a string at a given position
 */
function getTextPath(text, x, y, fontSize) {
  const p = font.getPath(text, x, y, fontSize);
  return p.toPathData(2);
}

/**
 * Get bounding box for text
 */
function getTextBounds(text, x, y, fontSize) {
  const p = font.getPath(text, x, y, fontSize);
  const bb = p.getBoundingBox();
  return bb;
}

/**
 * Get advance width for text
 */
function getTextWidth(text, fontSize) {
  let width = 0;
  for (let i = 0; i < text.length; i++) {
    const glyph = font.charToGlyph(text[i]);
    width += glyph.advanceWidth;
  }
  return width * (fontSize / font.unitsPerEm);
}

// ============================================================
// 1. PRIMARY HORIZONTAL WORDMARK (colored)
// ============================================================
function generateHorizontalWordmark() {
  const fontSize = 200;
  const askText = 'ask';
  const odinText = 'Odin';

  // Calculate widths
  const askWidth = getTextWidth(askText, fontSize);
  const odinWidth = getTextWidth(odinText, fontSize);

  // Get paths at origin (y at baseline)
  const padding = 20;
  const baseline = fontSize; // approximate baseline

  const askPath = getTextPath(askText, padding, baseline, fontSize);
  const odinPath = getTextPath(odinText, padding + askWidth, baseline, fontSize);

  // Calculate total bounding box
  const askBB = getTextBounds(askText, padding, baseline, fontSize);
  const odinBB = getTextBounds(odinText, padding + askWidth, baseline, fontSize);

  const minX = Math.min(askBB.x1, odinBB.x1) - padding;
  const minY = Math.min(askBB.y1, odinBB.y1) - padding;
  const maxX = Math.max(askBB.x2, odinBB.x2) + padding;
  const maxY = Math.max(askBB.y2, odinBB.y2) + padding;

  const width = maxX - minX;
  const height = maxY - minY;

  // Colored version
  const svgColored = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${width} ${height}" width="${width}" height="${height}">
  <title>askOdin</title>
  <path d="${askPath}" fill="${ORANGE}"/>
  <path d="${odinPath}" fill="${GREEN}"/>
</svg>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'wordmark', 'askOdin-horizontal-colored.svg'), svgColored);

  // White version (for dark backgrounds)
  const svgWhite = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${width} ${height}" width="${width}" height="${height}">
  <title>askOdin</title>
  <path d="${askPath}" fill="#FFFFFF"/>
  <path d="${odinPath}" fill="#FFFFFF"/>
</svg>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'wordmark', 'askOdin-horizontal-white.svg'), svgWhite);

  // Black version
  const svgBlack = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${width} ${height}" width="${width}" height="${height}">
  <title>askOdin</title>
  <path d="${askPath}" fill="#000000"/>
  <path d="${odinPath}" fill="#000000"/>
</svg>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'wordmark', 'askOdin-horizontal-black.svg'), svgBlack);

  // Colored on dark background
  const svgOnDark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX - padding} ${minY - padding} ${width + padding*2} ${height + padding*2}" width="${width + padding*2}" height="${height + padding*2}">
  <title>askOdin</title>
  <rect x="${minX - padding}" y="${minY - padding}" width="${width + padding*2}" height="${height + padding*2}" fill="#1A1A2E" rx="8"/>
  <path d="${askPath}" fill="${ORANGE}"/>
  <path d="${odinPath}" fill="${GREEN}"/>
</svg>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'wordmark', 'askOdin-horizontal-on-dark.svg'), svgOnDark);

  // Grayscale
  const svgGray = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${width} ${height}" width="${width}" height="${height}">
  <title>askOdin</title>
  <path d="${askPath}" fill="#666666"/>
  <path d="${odinPath}" fill="#333333"/>
</svg>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'wordmark', 'askOdin-horizontal-grayscale.svg'), svgGray);

  console.log(`Horizontal wordmark: ${width.toFixed(0)}x${height.toFixed(0)}`);

  return { minX, minY, width, height, askPath, odinPath, askWidth, odinWidth, fontSize, padding, baseline };
}

// ============================================================
// 2. STACKED WORDMARK
// ============================================================
function generateStackedWordmark() {
  const fontSize = 200;
  const askText = 'ask';
  const odinText = 'Odin';

  const padding = 30;
  const lineSpacing = fontSize * 0.2; // 20% of font size gap

  // "ask" on top, centered
  // "Odin" on bottom, centered
  const askWidth = getTextWidth(askText, fontSize);
  const odinWidth = getTextWidth(odinText, fontSize);
  const maxWidth = Math.max(askWidth, odinWidth);

  const askX = padding + (maxWidth - askWidth) / 2;
  const odinX = padding + (maxWidth - odinWidth) / 2;

  const askBaseline = fontSize;
  const odinBaseline = fontSize * 2 + lineSpacing;

  const askPath = getTextPath(askText, askX, askBaseline, fontSize);
  const odinPath = getTextPath(odinText, odinX, odinBaseline, fontSize);

  const askBB = getTextBounds(askText, askX, askBaseline, fontSize);
  const odinBB = getTextBounds(odinText, odinX, odinBaseline, fontSize);

  const minX = Math.min(askBB.x1, odinBB.x1) - padding;
  const minY = Math.min(askBB.y1, odinBB.y1) - padding;
  const maxX = Math.max(askBB.x2, odinBB.x2) + padding;
  const maxY = Math.max(askBB.y2, odinBB.y2) + padding;

  const width = maxX - minX;
  const height = maxY - minY;

  const svgColored = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${width} ${height}" width="${width}" height="${height}">
  <title>askOdin</title>
  <path d="${askPath}" fill="${ORANGE}"/>
  <path d="${odinPath}" fill="${GREEN}"/>
</svg>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'wordmark', 'askOdin-stacked-colored.svg'), svgColored);

  const svgWhite = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${width} ${height}" width="${width}" height="${height}">
  <title>askOdin</title>
  <path d="${askPath}" fill="#FFFFFF"/>
  <path d="${odinPath}" fill="#FFFFFF"/>
</svg>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'wordmark', 'askOdin-stacked-white.svg'), svgWhite);

  const svgBlack = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${width} ${height}" width="${width}" height="${height}">
  <title>askOdin</title>
  <path d="${askPath}" fill="#000000"/>
  <path d="${odinPath}" fill="#000000"/>
</svg>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'wordmark', 'askOdin-stacked-black.svg'), svgBlack);

  console.log(`Stacked wordmark: ${width.toFixed(0)}x${height.toFixed(0)}`);
}

// ============================================================
// 3. LOGOMARK / ICON
// ============================================================
function generateLogomark() {
  // Design: The Eye of Odin / Judgment Eye
  // A geometric eye shape formed from the brand colors
  // - Green outer "O" ring (Odin, wisdom, seeing everything)
  // - Orange inner element (the "ask", the inquiry, the lens)
  // - Clean geometric lines suggest precision/infrastructure

  // Concept: Stylized eye within an "O" shape
  // The "O" from Odin forms the outer ring
  // Inside, a diamond/lens shape represents the "asking eye" — judgment

  const size = 512;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * 0.44; // outer radius of O ring
  const innerR = size * 0.30; // inner radius of O ring (creating the ring)
  const eyeR = size * 0.14;   // inner eye/pupil

  // Create the "O" ring using the actual font glyph of "O"
  // But let's go with a geometric design for better scalability

  // Approach: Use font "O" as outer shape, with inner geometric eye
  const oGlyph = font.charToGlyph('O');
  const oPath = font.getPath('O', 0, 0, size * 0.9);
  const oBB = oPath.getBoundingBox();

  // Center the O
  const oOffsetX = cx - (oBB.x1 + oBB.x2) / 2;
  const oOffsetY = cy - (oBB.y1 + oBB.y2) / 2;

  const oCenteredPath = font.getPath('O', oOffsetX, -oBB.y1 + oOffsetY + (oBB.y2 - oBB.y1)/2, size * 0.9);

  // Actually, let me just use the O character from the font for the logomark
  // and add a stylized inner element

  // Simpler, bolder approach: The "O" from IBM Plex Sans as the primary shape
  // with an orange diamond/rhombus inside (representing the questioning eye, the judgment lens)

  const oFontSize = size * 0.95;
  const oPathData = getTextPath('O', 0, 0, oFontSize);
  const oBounds = getTextBounds('O', 0, 0, oFontSize);

  // Center it
  const oCenterX = -(oBounds.x1 + oBounds.x2) / 2;
  const oCenterY = -(oBounds.y1 + oBounds.y2) / 2;

  const oCenteredPathData = getTextPath('O', oCenterX, oCenterY, oFontSize);
  const oCenteredBounds = getTextBounds('O', oCenterX, oCenterY, oFontSize);

  // Inner diamond (the "asking eye" / judgment lens)
  // Positioned at center of the O
  const diamondSize = size * 0.12;
  const diamondPath = `M ${cx} ${cy - diamondSize} L ${cx + diamondSize} ${cy} L ${cx} ${cy + diamondSize} L ${cx - diamondSize} ${cy} Z`;

  // Wait, the O is centered at 0,0 but we need viewBox adjustments
  // Let me recalculate with proper centering

  const padding = 20;
  const vbX = oCenteredBounds.x1 - padding;
  const vbY = oCenteredBounds.y1 - padding;
  const vbW = (oCenteredBounds.x2 - oCenteredBounds.x1) + padding * 2;
  const vbH = (oCenteredBounds.y2 - oCenteredBounds.y1) + padding * 2;

  // Make it square
  const maxDim = Math.max(vbW, vbH);
  const sqX = vbX - (maxDim - vbW) / 2;
  const sqY = vbY - (maxDim - vbH) / 2;

  // Diamond center is at the center of the O bounds
  const dCx = (oCenteredBounds.x1 + oCenteredBounds.x2) / 2;
  const dCy = (oCenteredBounds.y1 + oCenteredBounds.y2) / 2;
  const dSize = maxDim * 0.11;

  const innerDiamond = `M ${dCx} ${dCy - dSize} L ${dCx + dSize} ${dCy} L ${dCx} ${dCy + dSize} L ${dCx - dSize} ${dCy} Z`;

  // Logomark: Green O with Orange diamond center
  const svgLogomark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${sqX.toFixed(1)} ${sqY.toFixed(1)} ${maxDim.toFixed(1)} ${maxDim.toFixed(1)}" width="512" height="512">
  <title>askOdin Icon</title>
  <path d="${oCenteredPathData}" fill="${GREEN}"/>
  <path d="${innerDiamond}" fill="${ORANGE}"/>
</svg>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'logomark', 'askOdin-icon-colored.svg'), svgLogomark);

  // White version
  const svgLogomarkWhite = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${sqX.toFixed(1)} ${sqY.toFixed(1)} ${maxDim.toFixed(1)} ${maxDim.toFixed(1)}" width="512" height="512">
  <title>askOdin Icon</title>
  <path d="${oCenteredPathData}" fill="#FFFFFF"/>
  <path d="${innerDiamond}" fill="#FFFFFF"/>
</svg>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'logomark', 'askOdin-icon-white.svg'), svgLogomarkWhite);

  // Black version
  const svgLogomarkBlack = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${sqX.toFixed(1)} ${sqY.toFixed(1)} ${maxDim.toFixed(1)} ${maxDim.toFixed(1)}" width="512" height="512">
  <title>askOdin Icon</title>
  <path d="${oCenteredPathData}" fill="#000000"/>
  <path d="${innerDiamond}" fill="#000000"/>
</svg>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'logomark', 'askOdin-icon-black.svg'), svgLogomarkBlack);

  // On dark background with circle container
  const circleR = maxDim / 2 * 0.95;
  const circleCx = sqX + maxDim / 2;
  const circleCy = sqY + maxDim / 2;

  const svgLogomarkOnDark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${sqX.toFixed(1)} ${sqY.toFixed(1)} ${maxDim.toFixed(1)} ${maxDim.toFixed(1)}" width="512" height="512">
  <title>askOdin Icon</title>
  <circle cx="${circleCx.toFixed(1)}" cy="${circleCy.toFixed(1)}" r="${(maxDim/2).toFixed(1)}" fill="#1A1A2E"/>
  <path d="${oCenteredPathData}" fill="${GREEN}"/>
  <path d="${innerDiamond}" fill="${ORANGE}"/>
</svg>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'logomark', 'askOdin-icon-on-dark.svg'), svgLogomarkOnDark);

  console.log(`Logomark: ${maxDim.toFixed(0)}x${maxDim.toFixed(0)}`);

  return { sqX, sqY, maxDim, oCenteredPathData, innerDiamond, dCx, dCy };
}

// ============================================================
// 4. FAVICON (simplified for small sizes)
// ============================================================
function generateFavicon() {
  // For favicon, use a simpler version of the logomark
  // At 16-32px, the diamond detail may be too small
  // Use the "aO" monogram approach for favicon

  const fontSize = 400;
  const aText = 'a';
  const OText = 'O';

  const aWidth = getTextWidth(aText, fontSize);
  const OWidth = getTextWidth(OText, fontSize);

  // Place 'a' and 'O' with slight overlap
  const padding = 20;
  const overlap = fontSize * 0.02; // slight kerning
  const baseline = fontSize;

  const aPath = getTextPath(aText, padding, baseline, fontSize);
  const OPath = getTextPath(OText, padding + aWidth - overlap, baseline, fontSize);

  const aBB = getTextBounds(aText, padding, baseline, fontSize);
  const OBB = getTextBounds(OText, padding + aWidth - overlap, baseline, fontSize);

  const minX = Math.min(aBB.x1, OBB.x1) - padding;
  const minY = Math.min(aBB.y1, OBB.y1) - padding;
  const maxX = Math.max(aBB.x2, OBB.x2) + padding;
  const maxY = Math.max(aBB.y2, OBB.y2) + padding;

  let width = maxX - minX;
  let height = maxY - minY;

  // Make square
  const maxDim = Math.max(width, height);
  const sqX = minX - (maxDim - width) / 2;
  const sqY = minY - (maxDim - height) / 2;

  // Retired: the live favicon is the logomark (see generate-favicon.mjs). The aO
  // lettermark is kept reproducible but written to Archived/ so it never lands
  // back in the shipping favicon set.
  const ARCHIVE_DIR = path.join(OUTPUT_DIR, 'favicon', 'Archived');
  fs.mkdirSync(ARCHIVE_DIR, { recursive: true });

  const svgFavicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${sqX.toFixed(1)} ${sqY.toFixed(1)} ${maxDim.toFixed(1)} ${maxDim.toFixed(1)}" width="512" height="512">
  <title>aO</title>
  <path d="${aPath}" fill="${ORANGE}"/>
  <path d="${OPath}" fill="${GREEN}"/>
</svg>`;

  fs.writeFileSync(path.join(ARCHIVE_DIR, 'askOdin-favicon-aO.svg'), svgFavicon);

  // White bg version for Apple touch icon
  const svgFaviconWhiteBg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${sqX.toFixed(1)} ${sqY.toFixed(1)} ${maxDim.toFixed(1)} ${maxDim.toFixed(1)}" width="512" height="512">
  <title>aO</title>
  <rect x="${sqX.toFixed(1)}" y="${sqY.toFixed(1)}" width="${maxDim.toFixed(1)}" height="${maxDim.toFixed(1)}" fill="#FFFFFF" rx="60"/>
  <path d="${aPath}" fill="${ORANGE}"/>
  <path d="${OPath}" fill="${GREEN}"/>
</svg>`;

  fs.writeFileSync(path.join(ARCHIVE_DIR, 'askOdin-favicon-aO-whiteBg.svg'), svgFaviconWhiteBg);

  // Dark bg version
  const svgFaviconDarkBg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${sqX.toFixed(1)} ${sqY.toFixed(1)} ${maxDim.toFixed(1)} ${maxDim.toFixed(1)}" width="512" height="512">
  <title>aO</title>
  <rect x="${sqX.toFixed(1)}" y="${sqY.toFixed(1)}" width="${maxDim.toFixed(1)}" height="${maxDim.toFixed(1)}" fill="#1A1A2E" rx="60"/>
  <path d="${aPath}" fill="${ORANGE}"/>
  <path d="${OPath}" fill="${GREEN}"/>
</svg>`;

  fs.writeFileSync(path.join(ARCHIVE_DIR, 'askOdin-favicon-aO-darkBg.svg'), svgFaviconDarkBg);

  console.log(`Favicon aO (archived): ${maxDim.toFixed(0)}x${maxDim.toFixed(0)}`);
}

// ============================================================
// 5. COMBINED (LOGOMARK + WORDMARK)
// ============================================================
function generateCombined() {
  const wordFontSize = 160;
  const iconFontSize = 200;

  const askText = 'ask';
  const odinText = 'Odin';

  // Icon: "O" with diamond
  const oPathIcon = getTextPath('O', 0, 0, iconFontSize);
  const oBoundsIcon = getTextBounds('O', 0, 0, iconFontSize);
  const iconW = oBoundsIcon.x2 - oBoundsIcon.x1;
  const iconH = oBoundsIcon.y2 - oBoundsIcon.y1;

  // Gap between icon and text
  const gap = 30;
  const padding = 20;

  // Position icon
  const iconX = padding - oBoundsIcon.x1;
  const iconBaseline = padding - oBoundsIcon.y1 + iconH;

  const oPathIconPositioned = getTextPath('O', iconX, iconBaseline, iconFontSize);
  const oBoundsPositioned = getTextBounds('O', iconX, iconBaseline, iconFontSize);

  // Diamond in center of O
  const dCx = (oBoundsPositioned.x1 + oBoundsPositioned.x2) / 2;
  const dCy = (oBoundsPositioned.y1 + oBoundsPositioned.y2) / 2;
  const dSize = iconH * 0.11;
  const innerDiamond = `M ${dCx} ${dCy - dSize} L ${dCx + dSize} ${dCy} L ${dCx} ${dCy + dSize} L ${dCx - dSize} ${dCy} Z`;

  // Position wordmark to right of icon, vertically centered
  const textX = oBoundsPositioned.x2 + gap;

  // Vertically center text with icon
  const textBaseline = dCy + wordFontSize * 0.35; // approximate vertical center

  const askPath = getTextPath(askText, textX, textBaseline, wordFontSize);
  const askWidth = getTextWidth(askText, wordFontSize);
  const odinPath = getTextPath(odinText, textX + askWidth, textBaseline, wordFontSize);

  // Calculate bounds
  const askBB = getTextBounds(askText, textX, textBaseline, wordFontSize);
  const odinBB = getTextBounds(odinText, textX + askWidth, textBaseline, wordFontSize);

  const minX = Math.min(oBoundsPositioned.x1, askBB.x1, odinBB.x1) - padding;
  const minY = Math.min(oBoundsPositioned.y1, askBB.y1, odinBB.y1) - padding;
  const maxX = Math.max(oBoundsPositioned.x2, askBB.x2, odinBB.x2) + padding;
  const maxY = Math.max(oBoundsPositioned.y2, askBB.y2, odinBB.y2) + padding;

  const width = maxX - minX;
  const height = maxY - minY;

  const svgCombined = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX.toFixed(1)} ${minY.toFixed(1)} ${width.toFixed(1)} ${height.toFixed(1)}" width="${width.toFixed(0)}" height="${height.toFixed(0)}">
  <title>askOdin</title>
  <!-- Logomark: O with diamond -->
  <path d="${oPathIconPositioned}" fill="${GREEN}"/>
  <path d="${innerDiamond}" fill="${ORANGE}"/>
  <!-- Wordmark -->
  <path d="${askPath}" fill="${ORANGE}"/>
  <path d="${odinPath}" fill="${GREEN}"/>
</svg>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'combined', 'askOdin-combined-colored.svg'), svgCombined);

  // White version
  const svgCombinedWhite = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX.toFixed(1)} ${minY.toFixed(1)} ${width.toFixed(1)} ${height.toFixed(1)}" width="${width.toFixed(0)}" height="${height.toFixed(0)}">
  <title>askOdin</title>
  <path d="${oPathIconPositioned}" fill="#FFFFFF"/>
  <path d="${innerDiamond}" fill="#FFFFFF"/>
  <path d="${askPath}" fill="#FFFFFF"/>
  <path d="${odinPath}" fill="#FFFFFF"/>
</svg>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'combined', 'askOdin-combined-white.svg'), svgCombinedWhite);

  console.log(`Combined: ${width.toFixed(0)}x${height.toFixed(0)}`);
}

// ============================================================
// 6. SOCIAL MEDIA / OG IMAGE
// ============================================================
function generateSocialAssets() {
  // OG Image: 1200x630 with dark background
  const ogWidth = 1200;
  const ogHeight = 630;
  const fontSize = 120;

  const askText = 'ask';
  const odinText = 'Odin';

  const askWidth = getTextWidth(askText, fontSize);
  const odinWidth = getTextWidth(odinText, fontSize);
  const totalWidth = askWidth + odinWidth;

  const startX = (ogWidth - totalWidth) / 2;
  const baseline = ogHeight / 2 + fontSize * 0.35;

  const askPath = getTextPath(askText, startX, baseline, fontSize);
  const odinPath = getTextPath(odinText, startX + askWidth, baseline, fontSize);

  // Tagline
  const tagFontSize = 24;
  const tagText = 'Judgment Infrastructure for Capital Allocation';
  const tagWidth = getTextWidth(tagText, tagFontSize);
  const tagX = (ogWidth - tagWidth) / 2;
  const tagBaseline = baseline + fontSize * 0.5;
  const tagPath = getTextPath(tagText, tagX, tagBaseline, tagFontSize);

  const svgOG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${ogWidth} ${ogHeight}" width="${ogWidth}" height="${ogHeight}">
  <title>askOdin - Judgment Infrastructure for Capital Allocation</title>
  <rect width="${ogWidth}" height="${ogHeight}" fill="#111119"/>
  <!-- Top accent bar -->
  <rect width="${ogWidth}" height="6" fill="${ORANGE}"/>
  <!-- Logo -->
  <path d="${askPath}" fill="${ORANGE}"/>
  <path d="${odinPath}" fill="${GREEN}"/>
  <!-- Tagline -->
  <path d="${tagPath}" fill="#888899"/>
</svg>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'og', 'askOdin-og-image.svg'), svgOG);

  // Square social profile (800x800)
  const sqSize = 800;
  const sqFontSize = 140;
  const sqAskText = 'ask';
  const sqOdinText = 'Odin';

  const sqAskWidth = getTextWidth(sqAskText, sqFontSize);
  const sqOdinWidth = getTextWidth(sqOdinText, sqFontSize);
  const sqTotalWidth = sqAskWidth + sqOdinWidth;

  const sqStartX = (sqSize - sqTotalWidth) / 2;
  const sqBaseline = sqSize / 2 + sqFontSize * 0.35;

  const sqAskPath = getTextPath(sqAskText, sqStartX, sqBaseline, sqFontSize);
  const sqOdinPath = getTextPath(sqOdinText, sqStartX + sqAskWidth, sqBaseline, sqFontSize);

  const svgProfile = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sqSize} ${sqSize}" width="${sqSize}" height="${sqSize}">
  <title>askOdin</title>
  <rect width="${sqSize}" height="${sqSize}" fill="#111119"/>
  <path d="${sqAskPath}" fill="${ORANGE}"/>
  <path d="${sqOdinPath}" fill="${GREEN}"/>
</svg>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'profile', 'askOdin-profile-dark.svg'), svgProfile);

  // Light background profile
  const svgProfileLight = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sqSize} ${sqSize}" width="${sqSize}" height="${sqSize}">
  <title>askOdin</title>
  <rect width="${sqSize}" height="${sqSize}" fill="#FFFFFF"/>
  <path d="${sqAskPath}" fill="${ORANGE}"/>
  <path d="${sqOdinPath}" fill="${GREEN}"/>
</svg>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'profile', 'askOdin-profile-light.svg'), svgProfileLight);

  console.log(`Social assets generated`);
}

// ============================================================
// 7. EMAIL SIGNATURE
// ============================================================
function generateEmailSignature() {
  const fontSize = 48;
  const askText = 'ask';
  const odinText = 'Odin';

  const askWidth = getTextWidth(askText, fontSize);
  const odinWidth = getTextWidth(odinText, fontSize);

  const padding = 8;
  const baseline = fontSize;

  const askPath = getTextPath(askText, padding, baseline, fontSize);
  const odinPath = getTextPath(odinText, padding + askWidth, baseline, fontSize);

  const askBB = getTextBounds(askText, padding, baseline, fontSize);
  const odinBB = getTextBounds(odinText, padding + askWidth, baseline, fontSize);

  const minX = Math.min(askBB.x1, odinBB.x1) - padding;
  const minY = Math.min(askBB.y1, odinBB.y1) - padding;
  const maxX = Math.max(askBB.x2, odinBB.x2) + padding;
  const maxY = Math.max(askBB.y2, odinBB.y2) + padding;

  const width = maxX - minX;
  const height = maxY - minY;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${width} ${height}" width="${(width * 2).toFixed(0)}" height="${(height * 2).toFixed(0)}">
  <title>askOdin</title>
  <path d="${askPath}" fill="${ORANGE}"/>
  <path d="${odinPath}" fill="${GREEN}"/>
</svg>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'wordmark', 'askOdin-email-signature.svg'), svg);
  console.log(`Email signature: ${(width*2).toFixed(0)}x${(height*2).toFixed(0)}`);
}

// ============================================================
// RUN ALL
// ============================================================
console.log('=== askOdin Brand Asset Generator ===\n');

console.log('1. Generating horizontal wordmark variants...');
const wordmarkData = generateHorizontalWordmark();

console.log('2. Generating stacked wordmark...');
generateStackedWordmark();

console.log('3. Generating logomark/icon...');
const logomarkData = generateLogomark();

console.log('4. Generating favicon...');
generateFavicon();

console.log('5. Generating combined mark...');
generateCombined();

console.log('6. Generating social media assets...');
generateSocialAssets();

console.log('7. Generating email signature...');
generateEmailSignature();

console.log('\n=== All SVG assets generated in ./output/ ===');
console.log('\nDirectory structure:');
console.log('  output/');
console.log('    wordmark/     - Horizontal & stacked wordmarks');
console.log('    logomark/     - Standalone icon/symbol');
console.log('    combined/     - Icon + wordmark together');
console.log('    og/           - site-wide default OG card');
console.log('    profile/      - square avatars, headers, virtual backgrounds');
console.log('    favicon/      - Favicon variants');
