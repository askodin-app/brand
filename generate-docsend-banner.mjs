import opentype from 'opentype.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const FONT_SEMI = opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-SemiBold.ttf');
const FONT_LIGHT = opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-Light.ttf');
const FONT_MONO = opentype.loadSync('./fonts/IBM_Plex_Mono/IBMPlexMono-Regular.ttf');

const ORANGE = '#DB4A2B';
const GREEN = '#147B58';
const DARK = '#111119';
const WHITE = '#FFFFFF';

// DocSend / data-room banner — identity furniture, replaced in place rather than published
// once, so it lives at a stable undated path.
const OUTPUT_DIR = './output/decks';
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

// DocSend Space banner: 4:1 ratio, 1920x480 min / 3840x960 for 4K.
// The logomark is uploaded to DocSend separately, so the wordmark is
// deliberately absent here — the banner carries positioning + proof only.
//
// DocSend overlays that logomark on the LOWER LEFT of the banner, so the
// bottom-left quadrant (roughly x < 480, y > 280) is a reserved dead zone:
// all type is right-aligned and the O texture sits high-left, above it.
const W = 1920;
const H = 480;
const MARGIN = 96;
const RIGHT = W - MARGIN;

const PATENTS = 'U.S. PATENTS PENDING · 63/948,559 · 63/994,876 · 64/011,252 · 64/017,488';

// The four numbers set legibly on a deck cover, but DocSend renders this 1920px
// banner into roughly a 1200px container (~0.63 scale), which lands the mono line
// near 12px and drops it entirely on mobile. The tight variant states the fact and
// leaves the numbers to the deck cover and footer, where they can be read and checked.
//
// This is the compact standard from Brand Guidelines 7.4, which carries neither the
// numbers nor a count — set here in the banner's caps treatment.
const PATENTS_SHORT = 'U.S. PATENTS PENDING';

// Shared chrome: orange hairline, fading grid, one oversized faint O on the right.
function backdrop() {
  const el = [];
  el.push(`<rect width="${W}" height="${H}" fill="${DARK}"/>`);
  el.push(`<defs>
    <linearGradient id="gridFade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${WHITE}" stop-opacity="0.045"/>
      <stop offset="70%" stop-color="${WHITE}" stop-opacity="0.02"/>
      <stop offset="100%" stop-color="${WHITE}" stop-opacity="0"/>
    </linearGradient>
  </defs>`);

  for (let x = 0; x <= W; x += 80) {
    el.push(`<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="url(#gridFade)" stroke-width="1"/>`);
  }
  for (let y = 60; y < H; y += 60) {
    el.push(`<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="url(#gridFade)" stroke-width="1"/>`);
  }

  // Oversized O as texture, bleeding off the top-left — sits above the logomark zone
  el.push(`<path d="${getPath(FONT_SEMI, 'O', 40, 296, 420)}" fill="${GREEN}" opacity="0.05"/>`);

  el.push(`<rect width="${W}" height="5" fill="${ORANGE}"/>`);
  return el;
}

function rule(y) {
  return `<line x1="${RIGHT - 56}" y1="${y}" x2="${RIGHT}" y2="${y}" stroke="${ORANGE}" stroke-width="3"/>`;
}

function patentLine(y, text = PATENTS) {
  const x = RIGHT - getWidth(FONT_MONO, text, 19);
  return `<path d="${getPath(FONT_MONO, text, x, y, 19)}" fill="${WHITE}" opacity="0.6"/>`;
}

// Variant A — investor Space: the category analogy.
// Parameterised on the patent copy only: A and A-tight are the same composition,
// so a change to the ladder cannot drift between them.
function investorLadder(patents) {
  const el = backdrop();
  const size = 46;
  const leading = 58;
  let y = 150;

  const plain = (text) => {
    const x = RIGHT - getWidth(FONT_LIGHT, text, size);
    return `<path d="${getPath(FONT_LIGHT, text, x, y, size)}" fill="${WHITE}" opacity="0.92"/>`;
  };

  el.push(plain('Visa verifies transactions.'));
  y += leading;
  el.push(plain('Moody’s verifies credit.'));
  y += leading;

  // Punchline: "askOdin verifies " in white, "judgment." as the single orange accent
  const head = 'askOdin verifies ';
  const tail = 'judgment.';
  const headW = getWidth(FONT_SEMI, head, size);
  const headX = RIGHT - headW - getWidth(FONT_SEMI, tail, size);
  el.push(`<path d="${getPath(FONT_SEMI, head, headX, y, size)}" fill="${WHITE}"/>`);
  el.push(`<path d="${getPath(FONT_SEMI, tail, headX + headW, y, size)}" fill="${ORANGE}"/>`);

  el.push(rule(y + 38));
  el.push(patentLine(y + 80, patents));
  return el;
}

const variantInvestor = () => investorLadder(PATENTS);
const variantInvestorTight = () => investorLadder(PATENTS_SHORT);

// Variant B — design partner / enterprise buyer Space: capability over category.
function variantOperator() {
  const el = backdrop();

  const headSize = 54;
  const headY = 196;
  const head = 'Judgment infrastructure for ';
  const tail = 'capital allocation';
  const headW = getWidth(FONT_LIGHT, head, headSize);
  const headX = RIGHT - headW - getWidth(FONT_SEMI, tail, headSize);
  el.push(`<path d="${getPath(FONT_LIGHT, head, headX, headY, headSize)}" fill="${WHITE}" opacity="0.92"/>`);
  el.push(`<path d="${getPath(FONT_SEMI, tail, headX + headW, headY, headSize)}" fill="${ORANGE}"/>`);

  const sub = '40+ forensic dimensions · 5 failure modes';
  const subY = headY + 54;
  const subX = RIGHT - getWidth(FONT_MONO, sub, 24);
  el.push(`<path d="${getPath(FONT_MONO, sub, subX, subY, 24)}" fill="${WHITE}" opacity="0.75"/>`);

  el.push(rule(subY + 40));
  el.push(patentLine(subY + 82));
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
  const file = path.join(OUTPUT_DIR, `${name}.svg`);
  fs.writeFileSync(file, svg);
  const buf = fs.readFileSync(file);
  await sharp(buf, { density: 300 }).resize(W, H, { fit: 'fill' }).png()
    .toFile(path.join(OUTPUT_DIR, `${name}.png`));
  await sharp(buf, { density: 300 }).resize(W * 2, H * 2, { fit: 'fill' }).png()
    .toFile(path.join(OUTPUT_DIR, `${name}-2x.png`));
  console.log(`${name}: SVG + ${W}x${H} + ${W * 2}x${H * 2}`);
}

async function main() {
  console.log('=== DocSend Space Banner Generator (1920x480, 4:1) ===\n');
  await emit('askOdin-docsend-banner-investor', svgFor('askOdin DocSend Banner — Investor', variantInvestor()));
  await emit('askOdin-docsend-banner-investor-tight', svgFor('askOdin DocSend Banner — Investor (tight)', variantInvestorTight()));
  await emit('askOdin-docsend-banner-operator', svgFor('askOdin DocSend Banner — Operator', variantOperator()));
}

main().catch(console.error);
