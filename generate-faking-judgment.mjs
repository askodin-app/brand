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

// One folder per publication. Deliverable PNGs sit in banners/ and cards/ so
// they can be grabbed without hunting; the source SVGs are tucked into svg/.
const ASSET_DIR = './output/social/20260901-faking-judgment-is-easy';
const PNG_DIR = path.join(ASSET_DIR, 'banners');
const SVG_DIR = path.join(ASSET_DIR, 'svg');
for (const d of [PNG_DIR, SVG_DIR]) fs.mkdirSync(d, { recursive: true });

// ---------------------------------------------------------------------------
// Copy — https://askodin.app/insights/faking-judgment-is-easy/
// ---------------------------------------------------------------------------
// Two line-breaks of the same title. The wide crops take the two-beat version;
// the tall crops break to four so the display type can grow and fill the frame
// instead of running edge-to-edge over a column of dead air.
const HEADLINE = ['Faking Judgment Is Easy.', 'Making It Verifiable Is Hard.'];
const HEADLINE_TALL = ['Faking Judgment', 'Is Easy.', 'Making It Verifiable', 'Is Hard.'];
// Matches the published subtitle in askodin-coming-soon's frontmatter. The
// house voice dropped contractions between draft and publication — keep these
// two in sync if the article is edited again.
const STANDFIRST = ['The problem is not bad judgment. It is judgment nobody can inspect after the fact.'];
const STANDFIRST_TALL = ['The problem is not bad judgment.', 'It is judgment nobody can inspect after the fact.'];
const FOOTER = 'JUDGMENT INFRASTRUCTURE · 2026';

// ---------------------------------------------------------------------------
// Geometry
//
// One content stack — wordmark / headline / rule / standfirst / mono footer —
// laid out from a zero origin, measured, then centred in whatever canvas it is
// asked for. `s` scales the type, `spread` opens the vertical gaps so the same
// stack fills a 2:1 landscape card and a 4:5 portrait card without either one
// looking cramped or under-filled.
//
//   og        1200x630   — site OG, LinkedIn + X link previews
//   hero      1600x900   — Substack post body, uncropped
//   substack  1456x1048  — Substack's share frame
//   x-mobile  1080x1350  — 4:5 in-feed image post; owns the phone screen
//   li-square 1200x1200  — LinkedIn in-feed image post
// ---------------------------------------------------------------------------
const REF_W = 1200;

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

// Shrink a display block until every line clears the margins. Protects the
// headline if the copy is ever swapped for something longer.
function fitLines(font, lines, size, maxW) {
  while (size > 12 && lines.some((l) => getWidth(font, l, size) > maxW)) size -= 1;
  return size;
}

// ---------------------------------------------------------------------------
// Backdrop — full canvas, independent of the content stack
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
  // the same way at every aspect ratio.
  const oY = H / 2 + 185 * k;
  el.push(`<path d="${getPath(FONT_SEMI, 'O', -110 * k, oY, 620 * k)}" fill="${GREEN}" opacity="0.055"/>`);

  el.push(`<rect width="${W}" height="${(6 * k).toFixed(1)}" fill="${ORANGE}"/>`);
  return el;
}

// Small askOdin wordmark, centred, split orange/green like the master lockup.
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
// Content stack — laid out from y = 0, returns its own measured height so the
// caller can centre it.
// ---------------------------------------------------------------------------
function content(cx, s, inner, spread, headline, standfirst) {
  const el = [];
  let y = 0;

  el.push(...wordmark(cx, (y += 34 * s), 34 * s));

  // Headline — Light at display scale, per the 40px+ rule
  const hSize = fitLines(FONT_LIGHT, headline, 84 * s, inner);
  const lead = hSize * 1.18;
  y += 118 * s * spread;
  headline.forEach((line, i) => {
    el.push(centered(FONT_LIGHT, line, cx, y + i * lead, hSize, WHITE, 0.96));
  });
  y += (headline.length - 1) * lead;

  // Orange rule — divider between headline and standfirst
  y += 50 * s * spread;
  el.push(`<line x1="${(cx - 44 * s).toFixed(1)}" y1="${y.toFixed(1)}" x2="${(cx + 44 * s).toFixed(1)}" y2="${y.toFixed(1)}" stroke="${ORANGE}" stroke-width="${(3 * s).toFixed(1)}"/>`);

  // Standfirst — serif italic, the editorial voice of the essay series
  const sSize = fitLines(FONT_SERIF_IT, standfirst, 27 * s, inner);
  y += 58 * s * spread;
  standfirst.forEach((line, i) => {
    el.push(centered(FONT_SERIF_IT, line, cx, y + i * sSize * 1.42, sSize, WHITE, 0.72));
  });
  y += (standfirst.length - 1) * sSize * 1.42;

  // Mono footer — metadata register
  y += 64 * s * spread;
  el.push(...centeredTracked(FONT_MONO, FOOTER, cx, y, 17 * s, 4 * s, WHITE, 0.42));

  return { el, height: y };
}

function card(W, H, { s, margin, spread = 1, headline = HEADLINE, standfirst = STANDFIRST }) {
  const { el, height } = content(W / 2, s, W - margin * 2, spread, headline, standfirst);
  // Optical centring: the measured height runs cap-top to mono baseline, so a
  // small lift keeps the block from sitting low.
  const ty = (H - height) / 2 - 6 * s;
  return [...backdrop(W, H), `<g transform="translate(0 ${ty.toFixed(1)})">`, ...el, `</g>`];
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
  console.log(`  ${name}: SVG + ${W}x${H} + ${W * 2}x${H * 2}`);
}

async function main() {
  console.log('=== Faking Judgment Is Easy. Making It Verifiable Is Hard. ===\n');

  const TITLE = 'Faking Judgment Is Easy — askOdin';

  // Site/social OG: the 1200x630 frame the insights pages, LinkedIn and X all
  // read for link previews. X crops this to 2:1 — the stack is centred, so the
  // crop only takes empty ground.
  await emit('askOdin-faking-judgment-og', 1200, 630,
    svgFor(TITLE, 1200, 630, card(1200, 630, { s: 1, margin: 100 })));

  // Substack hero: shown uncropped in the post body.
  await emit('askOdin-substack-faking-judgment-hero', 1600, 900,
    svgFor(TITLE, 1600, 900, card(1600, 900, { s: 1.333, margin: 133 })));

  // Substack social/OG: Substack's recommended share frame, with clear ground
  // top and bottom for the platform crops.
  await emit('askOdin-substack-faking-judgment-og', 1456, 1048,
    svgFor(TITLE, 1456, 1048, card(1456, 1048, { s: 1.1, margin: 150, spread: 1.35, standfirst: STANDFIRST_TALL })));

  // X in-feed image post, 4:5 portrait. X shows this near full height on a
  // phone, so the headline lands at roughly twice the on-screen size of the
  // same words inside a 2:1 link card.
  await emit('askOdin-faking-judgment-x-mobile', 1080, 1350,
    svgFor(TITLE, 1080, 1350, card(1080, 1350, { s: 1.05, margin: 100, spread: 1.7, headline: HEADLINE_TALL, standfirst: STANDFIRST_TALL })));

  // LinkedIn in-feed image post, 1:1. Square outperforms landscape in the
  // LinkedIn mobile feed for the same reason.
  await emit('askOdin-faking-judgment-linkedin-square', 1200, 1200,
    svgFor(TITLE, 1200, 1200, card(1200, 1200, { s: 1.05, margin: 110, spread: 1.15, headline: HEADLINE_TALL, standfirst: STANDFIRST_TALL })));
}

main().catch(console.error);
