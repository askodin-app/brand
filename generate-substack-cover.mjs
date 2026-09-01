import opentype from 'opentype.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const FONT_LIGHT = opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-Light.ttf');
const FONT_SEMI = opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-SemiBold.ttf');
const FONT_MONO = opentype.loadSync('./fonts/IBM_Plex_Mono/IBMPlexMono-Regular.ttf');
const FONT_SERIF_IT = opentype.loadSync('./fonts/IBM_Plex_Serif/IBMPlexSerif-Italic.ttf');

const ORANGE = '#DB4A2B';
const GREEN = '#147B58';
const DARK = '#111119';
const WHITE = '#FFFFFF';

// One folder per publication, dated by the article's pubDate and named with
// its URL slug so the folder and the published route resolve to each other.
const ASSET_DIR = './output/social/20260508-the-judgment-stack';
const PNG_DIR = path.join(ASSET_DIR, 'banners');
const SVG_DIR = path.join(ASSET_DIR, 'svg');
for (const d of [PNG_DIR, SVG_DIR]) fs.mkdirSync(d, { recursive: true });

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

// Substack featured image: 1200x630 (1.91:1) — same frame as the OG card so the
// series masthead and the brand card read as one system. Centered layout, since
// Substack re-crops toward the middle in feed and email placements.
const W = 1200;
const H = 630;
const CX = W / 2;

function centered(font, text, y, size, fill, opacity = 1) {
  const x = CX - getWidth(font, text, size) / 2;
  const op = opacity === 1 ? '' : ` opacity="${opacity}"`;
  return `<path d="${getPath(font, text, x, y, size)}" fill="${fill}"${op}/>`;
}

function backdrop() {
  const el = [];
  el.push(`<rect width="${W}" height="${H}" fill="${DARK}"/>`);
  el.push(`<defs>
    <linearGradient id="gridFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${WHITE}" stop-opacity="0.05"/>
      <stop offset="55%" stop-color="${WHITE}" stop-opacity="0.022"/>
      <stop offset="100%" stop-color="${WHITE}" stop-opacity="0"/>
    </linearGradient>
  </defs>`);

  for (let x = 0; x <= W; x += 75) {
    el.push(`<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="url(#gridFade)" stroke-width="1"/>`);
  }
  for (let y = 70; y < H; y += 70) {
    el.push(`<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="url(#gridFade)" stroke-width="1"/>`);
  }

  // Oversized O bleeding off the left edge — the same texture cue as the DocSend banners
  el.push(`<path d="${getPath(FONT_SEMI, 'O', -110, 500, 620)}" fill="${GREEN}" opacity="0.055"/>`);

  el.push(`<rect width="${W}" height="6" fill="${ORANGE}"/>`);
  return el;
}

// Small askOdin wordmark, centered, split orange/green like the master lockup.
function wordmark(y, size) {
  const ask = 'ask';
  const odin = 'Odin';
  const askW = getWidth(FONT_SEMI, ask, size);
  const x = CX - (askW + getWidth(FONT_SEMI, odin, size)) / 2;
  return [
    `<path d="${getPath(FONT_SEMI, ask, x, y, size)}" fill="${ORANGE}"/>`,
    `<path d="${getPath(FONT_SEMI, odin, x + askW, y, size)}" fill="${GREEN}"/>`,
  ];
}

function cover() {
  const el = backdrop();

  el.push(...wordmark(132, 34));

  // Series title — Light at display scale, per the 40px+ rule
  el.push(centered(FONT_LIGHT, 'The Judgment Stack', 320, 92, WHITE, 0.96));

  // Orange rule as the divider between masthead and standfirst
  el.push(`<line x1="${CX - 44}" y1="366" x2="${CX + 44}" y2="366" stroke="${ORANGE}" stroke-width="3"/>`);

  // Standfirst — serif italic, the editorial voice of the essay series
  el.push(centered(FONT_SERIF_IT, 'Essays on judgment infrastructure, the Clarity Framework,', 428, 27, WHITE, 0.72));
  el.push(centered(FONT_SERIF_IT, 'and deterministic diligence for private capital.', 466, 27, WHITE, 0.72));

  // Mono footer — metadata register
  el.push(centered(FONT_MONO, 'A S K O D I N . A P P', 556, 17, WHITE, 0.42));

  return el;
}

function svgFor(title, elements) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <title>${title}</title>
  ${elements.join('\n  ')}
</svg>`;
}

async function emit(name, svg) {
  const file = path.join(SVG_DIR, `${name}.svg`);
  fs.writeFileSync(file, svg);
  const buf = fs.readFileSync(file);
  await sharp(buf, { density: 300 }).resize(W, H, { fit: 'fill' }).png()
    .toFile(path.join(PNG_DIR, `${name}.png`));
  await sharp(buf, { density: 300 }).resize(W * 2, H * 2, { fit: 'fill' }).png()
    .toFile(path.join(PNG_DIR, `${name}-2x.png`));
  console.log(`${name}: SVG + ${W}x${H} + ${W * 2}x${H * 2}`);
}

async function main() {
  console.log('=== Substack Cover Generator (1200x630) ===\n');
  await emit('askOdin-substack-judgment-stack', svgFor('The Judgment Stack — askOdin', cover()));
}

main().catch(console.error);
