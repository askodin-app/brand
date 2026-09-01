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
const ASSET_DIR = './output/social/20260821-ai-data-retention-fork';
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

// Per-article OG image for The Judgment Stack. Same 1200x630 frame and chrome as
// askOdin-substack-judgment-stack so the series masthead and the article cards
// read as one system. Substack re-crops toward the middle in feed and email
// placements, so everything stays centered.
const W = 1200;
const H = 630;
const CX = W / 2;

function textAt(font, text, x, y, size, fill, opacity = 1) {
  const op = opacity === 1 ? '' : ` opacity="${opacity}"`;
  return `<path d="${getPath(font, text, x, y, size)}" fill="${fill}"${op}/>`;
}

function centered(font, text, y, size, fill, opacity = 1, cx = CX) {
  return textAt(font, text, cx - getWidth(font, text, size) / 2, y, size, fill, opacity);
}

// Mono labels are letterspaced by hand — opentype has no tracking, so glyphs are
// placed one at a time.
function trackedWidth(font, text, size, track) {
  return getWidth(font, text, size) + track * Math.max(0, text.length - 1);
}

function centeredTracked(font, text, y, size, track, fill, opacity, cx = CX) {
  let x = cx - trackedWidth(font, text, size, track) / 2;
  const el = [];
  for (const ch of text) {
    if (ch !== ' ') el.push(textAt(font, ch, x, y, size, fill, opacity));
    x += getWidth(font, ch, size) + track;
  }
  return el;
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

  // Oversized O bleeding off the left edge — shared texture cue across the social system
  el.push(`<path d="${getPath(FONT_SEMI, 'O', -110, 500, 620)}" fill="${GREEN}" opacity="0.055"/>`);

  el.push(`<rect width="${W}" height="6" fill="${ORANGE}"/>`);
  return el;
}

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

// The fork itself: one vertical hairline splitting the lower half into the two
// answers. Left = retention as conduct, right = zero retention as capability.
function forkBlock(top) {
  const el = [];
  const LEFT_CX = CX - 258;
  const RIGHT_CX = CX + 258;

  el.push(`<line x1="${CX}" y1="${top}" x2="${CX}" y2="${top + 132}" stroke="${ORANGE}" stroke-width="2" opacity="0.85"/>`);

  const labelY = top + 34;
  el.push(...centeredTracked(FONT_MONO, '30-DAY RETENTION', labelY, 19, 3.2, GREEN, 1, LEFT_CX));
  el.push(...centeredTracked(FONT_MONO, 'ZERO RETENTION', labelY, 19, 3.2, ORANGE, 1, RIGHT_CX));

  const claimY = top + 86;
  el.push(centered(FONT_LIGHT, 'A promise about', claimY, 30, WHITE, 0.9, LEFT_CX));
  el.push(centered(FONT_SEMI, 'conduct.', claimY + 38, 30, WHITE, 0.95, LEFT_CX));
  el.push(centered(FONT_LIGHT, 'A claim about', claimY, 30, WHITE, 0.9, RIGHT_CX));
  el.push(centered(FONT_SEMI, 'capability.', claimY + 38, 30, WHITE, 0.95, RIGHT_CX));

  return el;
}

function cover() {
  const el = backdrop();

  el.push(...wordmark(118, 30));

  // Article title — Light at display scale, per the 40px+ rule
  el.push(centered(FONT_LIGHT, 'The Fork in Data Retention', 244, 78, WHITE, 0.96));

  // Standfirst — serif italic, the editorial register of the essay series
  el.push(centered(FONT_SERIF_IT, 'Two AI giants. One problem. Opposite answers.', 296, 27, WHITE, 0.72));

  el.push(...forkBlock(356));

  // Mono footer — metadata register, ties the card back to the series
  el.push(...centeredTracked(FONT_MONO, 'THE JUDGMENT STACK · ASKODIN.APP', 574, 16, 4, WHITE, 0.42));

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
  console.log('=== Substack OG Image — The Fork in Data Retention (1200x630) ===\n');
  await emit('askOdin-substack-og-fork-retention',
    svgFor('The Fork in Data Retention — askOdin', cover()));
}

main().catch(console.error);
