import opentype from 'opentype.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const FONT_LIGHT = opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-Light.ttf');
const FONT_SEMI = opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-SemiBold.ttf');
const FONT_MONO = opentype.loadSync('./fonts/IBM_Plex_Mono/IBMPlexMono-Regular.ttf');
const FONT_MONO_LIGHT = opentype.loadSync('./fonts/IBM_Plex_Mono/IBMPlexMono-Light.ttf');
const FONT_SERIF_IT = opentype.loadSync('./fonts/IBM_Plex_Serif/IBMPlexSerif-Italic.ttf');

const ORANGE = '#DB4A2B';
const GREEN = '#147B58';
const DARK = '#111119';
const WHITE = '#FFFFFF';

// One folder per publication, dated by the article's pubDate and named with
// its URL slug so the folder and the published route resolve to each other.
const ASSET_DIR = './output/social/20260903-what-358672-investor-views-taught-me-about-pitch-decks';
const PNG_DIR = path.join(ASSET_DIR, 'banners');
const SVG_DIR = path.join(ASSET_DIR, 'svg');
for (const d of [PNG_DIR, SVG_DIR]) fs.mkdirSync(d, { recursive: true });

// ---------------------------------------------------------------------------
// Copy
//
// Title:    What 358,672 Investor Views Taught Me About Pitch Decks
// Subtitle: Key insights from Papermark's 2026 Fundraising Report
//
// The title is too long to set as a display headline and still survive a phone
// share card, so the figure carries the card and the title collapses into the
// standfirst. Per the figures rule, the hero number travels with its
// denominator (24,541 decks) and its source (the footer) — a card gets shared
// without the article attached.
// ---------------------------------------------------------------------------
const FIGURE = '358,672';
const FIGURE_LABEL = 'INVESTOR VIEWS · 24,541 DECKS';
const STANDFIRST = ['What the data says about pitch decks'];
const FOOTER = 'PAPERMARK 2026 FUNDRAISING REPORT';

// ---------------------------------------------------------------------------
// Geometry — same 1200x630 reference box as the other Substack cards, scaled
// to fit each canvas, so all the essay cards are one design at several crops.
//
//   og    1200x630   — insights page, LinkedIn, X; the box at 1:1
//   hero  1600x900   — uncropped in the Substack post body
//   og    1456x1048  — Substack's share frame; box held centred with clear
//                      ground top and bottom for platform crops
// ---------------------------------------------------------------------------
const REF_W = 1200;
const REF_H = 630;

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

function textAt(font, text, x, y, size, fill, opacity = 1) {
  const op = opacity === 1 ? '' : ` opacity="${opacity}"`;
  return `<path d="${getPath(font, text, x, y, size)}" fill="${fill}"${op}/>`;
}

function centered(font, text, cx, y, size, fill, opacity = 1) {
  return textAt(font, text, cx - getWidth(font, text, size) / 2, y, size, fill, opacity);
}

// Mono labels are letterspaced by hand — opentype has no tracking, so glyphs
// are placed one at a time.
function trackedWidth(font, text, size, track) {
  return getWidth(font, text, size) + track * Math.max(0, text.length - 1);
}

function centeredTracked(font, text, cx, y, size, track, fill, opacity) {
  let x = cx - trackedWidth(font, text, size, track) / 2;
  const el = [];
  for (const ch of text) {
    if (ch !== ' ') el.push(textAt(font, ch, x, y, size, fill, opacity));
    x += getWidth(font, ch, size) + track;
  }
  return el;
}

// Shrink a display line until it clears the margins. Protects the figure and
// the standfirst if the copy is ever swapped for something longer.
function fitSize(font, text, size, maxW) {
  while (size > 12 && getWidth(font, text, size) > maxW) size -= 1;
  return size;
}

function fitTracked(font, text, size, track, maxW) {
  while (size > 8 && trackedWidth(font, text, size, track) > maxW) size -= 1;
  return size;
}

// Keep the standfirst on one line when it fits; otherwise break at the dot
// separators into the most balanced two lines available.
function wrapParts(font, parts, size, maxW, sep = ' · ') {
  const one = parts.join(sep);
  if (getWidth(font, one, size) <= maxW) return [one];
  let best = null;
  for (let i = 1; i < parts.length; i++) {
    const a = parts.slice(0, i).join(sep);
    const b = parts.slice(i).join(sep);
    const m = Math.max(getWidth(font, a, size), getWidth(font, b, size));
    if (!best || m < best.m) best = { m, lines: [a, b] };
  }
  return best.lines;
}

// ---------------------------------------------------------------------------
// Backdrop — full canvas, independent of the content box
// ---------------------------------------------------------------------------
function backdrop(W, H) {
  const k = W / REF_W;
  const el = [];
  el.push(`<rect width="${W}" height="${H}" fill="${DARK}"/>`);
  el.push(`<defs>
    <linearGradient id="gridFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${WHITE}" stop-opacity="0.05"/>
      <stop offset="55%" stop-color="${WHITE}" stop-opacity="0.022"/>
      <stop offset="100%" stop-color="${WHITE}" stop-opacity="0"/>
    </linearGradient>
  </defs>`);

  const gx = 75 * k;
  const gy = 70 * k;
  for (let x = 0; x <= W; x += gx) {
    el.push(`<line x1="${x.toFixed(1)}" y1="0" x2="${x.toFixed(1)}" y2="${H}" stroke="url(#gridFade)" stroke-width="1"/>`);
  }
  for (let y = gy; y < H; y += gy) {
    el.push(`<line x1="0" y1="${y.toFixed(1)}" x2="${W}" y2="${y.toFixed(1)}" stroke="url(#gridFade)" stroke-width="1"/>`);
  }

  // Oversized O bleeding off the left edge — the shared texture cue across the
  // DocSend, Substack and OG assets. Anchored to the canvas centre so it sits
  // the same way at both aspect ratios.
  const oY = H / 2 + 185 * k;
  el.push(`<path d="${getPath(FONT_SEMI, 'O', -110 * k, oY, 620 * k)}" fill="${GREEN}" opacity="0.055"/>`);

  el.push(`<rect width="${W}" height="${(6 * k).toFixed(1)}" fill="${ORANGE}"/>`);
  return el;
}

// Small askOdin wordmark, centered, split orange/green like the master lockup.
function wordmark(cx, y, size) {
  const ask = 'ask';
  const odin = 'Odin';
  const askW = getWidth(FONT_SEMI, ask, size);
  const x = cx - (askW + getWidth(FONT_SEMI, odin, size)) / 2;
  return [
    `<path d="${getPath(FONT_SEMI, ask, x, y, size)}" fill="${ORANGE}"/>`,
    `<path d="${getPath(FONT_SEMI, odin, x + askW, y, size)}" fill="${GREEN}"/>`,
  ];
}

// ---------------------------------------------------------------------------
// Content stack, laid out in the reference box then scaled by s
// ---------------------------------------------------------------------------
function content(box) {
  const { x: bx, y: by, s } = box;
  const cx = bx + (REF_W * s) / 2;
  const inner = (REF_W - 200) * s; // 100pt side margins in reference units
  const el = [];

  el.push(...wordmark(cx, by + 128 * s, 34 * s));

  // The figure is the card. Mono Light at display scale: the data register of
  // the brand, set large enough to read as a headline rather than a statistic
  // dropped into one.
  const fSize = fitSize(FONT_MONO_LIGHT, FIGURE, 152 * s, inner);
  el.push(centered(FONT_MONO_LIGHT, FIGURE, cx, by + 310 * s, fSize, WHITE, 0.96));

  // Denominator, immediately under the figure — the number never travels alone.
  const lSize = fitTracked(FONT_MONO, FIGURE_LABEL, 19 * s, 4 * s, inner);
  el.push(...centeredTracked(FONT_MONO, FIGURE_LABEL, cx, by + 374 * s, lSize, 4 * s, ORANGE, 0.9));

  // Orange rule — divider between the figure block and the standfirst
  const ry = by + 424 * s;
  el.push(`<line x1="${(cx - 44 * s).toFixed(1)}" y1="${ry.toFixed(1)}" x2="${(cx + 44 * s).toFixed(1)}" y2="${ry.toFixed(1)}" stroke="${ORANGE}" stroke-width="${(3 * s).toFixed(1)}"/>`);

  // Standfirst — serif italic, the editorial voice of the essay series
  const sSize = fitSize(FONT_SERIF_IT, STANDFIRST.join(' · '), 30 * s, inner);
  const lines = wrapParts(FONT_SERIF_IT, STANDFIRST, sSize, inner);
  const lead = 40 * s;
  const startY = by + 492 * s - ((lines.length - 1) * lead) / 2;
  lines.forEach((line, i) => {
    el.push(centered(FONT_SERIF_IT, line, cx, startY + i * lead, sSize, WHITE, 0.72));
  });

  // Mono footer — source attribution in the metadata register
  const ftSize = fitTracked(FONT_MONO, FOOTER, 17 * s, 4 * s, inner);
  el.push(...centeredTracked(FONT_MONO, FOOTER, cx, by + 560 * s, ftSize, 4 * s, WHITE, 0.42));

  return el;
}

function card(W, H, boxW) {
  const s = boxW / REF_W;
  const box = { x: (W - boxW) / 2, y: (H - REF_H * s) / 2, s };
  return [...backdrop(W, H), ...content(box)];
}

function svgFor(title, W, H, elements) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <title>${title}</title>
  ${elements.join('\n  ')}
</svg>`;
}

async function emit(name, W, H, svg) {
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
  console.log('=== What 358,672 Investor Views Taught Me About Pitch Decks ===\n');

  const TITLE = 'What 358,672 Investor Views Taught Me About Pitch Decks — askOdin';

  await emit('askOdin-investor-views-og', 1200, 630,
    svgFor(TITLE, 1200, 630, card(1200, 630, 1200)));

  await emit('askOdin-substack-investor-views-hero', 1600, 900,
    svgFor(TITLE, 1600, 900, card(1600, 900, 1600)));

  await emit('askOdin-substack-investor-views-og', 1456, 1048,
    svgFor(TITLE, 1456, 1048, card(1456, 1048, 1320)));
}

main().catch(console.error);
