import opentype from 'opentype.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// The Judgment Stack — podcast identity.
//
// Show art, profile marks, YouTube channel banner and the OG card, in the same
// grammar as generate-substack-cover.mjs: the publication and the show carry one
// name across Substack, the site article and the feed, so they must look like
// one masthead. Faded grid, oversized O bleeding off the frame, orange top rule.
//
// The podcast owns its whole namespace, deliberately kept out of output/social/:
// the show and the Substack essay series share a name but publish on independent
// schedules, so an episode must never be filed as if it were an essay.
//
//   output/podcast/                       show identity — undated, replaced in place
//   output/podcast/svg/                   identity sources
//   output/podcast/episodes/YYYYMMDD-slug/{banners,svg}/   one folder per episode, dated
// ─────────────────────────────────────────────────────────────────────────────

const FONT_LIGHT = opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-Light.ttf');
const FONT_SEMI = opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-SemiBold.ttf');
const FONT_MONO = opentype.loadSync('./fonts/IBM_Plex_Mono/IBMPlexMono-Regular.ttf');
const FONT_SERIF_IT = opentype.loadSync('./fonts/IBM_Plex_Serif/IBMPlexSerif-Italic.ttf');

const ORANGE = '#DB4A2B';
const GREEN = '#147B58';
const DARK = '#111119';
const WHITE = '#FFFFFF';

const ASSET_DIR = './output/podcast';
const SVG_DIR = path.join(ASSET_DIR, 'svg');
const EPISODE_ROOT = path.join(ASSET_DIR, 'episodes');
for (const d of [ASSET_DIR, SVG_DIR]) fs.mkdirSync(d, { recursive: true });

// One entry per published episode. `date` is the publication date and `slug` the
// episode's URL slug, so the folder and the route resolve to each other — the
// same rule the article generators follow. Empty until episode 1 has a real
// title; a placeholder slug would rot the moment the title is edited.
//
//   { n: 1, date: '20260915', slug: 'the-unaudited-asset-class',
//     title: 'Venture capital is the last unaudited asset class' },
const EPISODES = [];

const SHOW = 'The Judgment Stack';
const STANDFIRST = [
  'Conversations on judgment infrastructure, the Clarity Framework,',
  'and deterministic diligence for private capital.',
];

// ── Logomark geometry, lifted from generate-favicon.mjs so the podcast avatar
// IS the logomark rather than a lookalike. ──────────────────────────────────
const O_PATH = 'M0 175.59L0 175.59Q-44.26 175.59-77.82 155.65Q-111.39 135.71-129.63 96.55Q-147.87 57.40-147.87 0L-147.87 0Q-147.87-57.40-129.63-96.55Q-111.39-135.71-77.82-155.65Q-44.26-175.59 0-175.59L0-175.59Q44.75-175.59 78.07-155.65Q111.39-135.71 129.63-96.55Q147.87-57.40 147.87 0L147.87 0Q147.87 57.40 129.63 96.55Q111.39 135.71 78.07 155.65Q44.75 175.59 0 175.59ZM0 118.68L0 118.68Q24.81 118.68 42.56 107.49Q60.31 96.31 70.04 75.64Q79.77 54.96 79.77 26.27L79.77 26.27L79.77-26.27Q79.77-55.45 70.04-75.88Q60.31-96.31 42.56-107.49Q24.81-118.68 0-118.68L0-118.68Q-23.83-118.68-41.83-107.49Q-59.83-96.31-69.80-75.88Q-79.77-55.45-79.77-26.27L-79.77-26.27L-79.77 26.27Q-79.77 54.96-69.80 75.64Q-59.83 96.31-41.83 107.49Q-23.83 118.68 0 118.68Z';
const DIAMOND_PATH = 'M 0 -43.029888 L 43.029888 0 L 0 43.029888 L -43.029888 0 Z';
const MARK_HEIGHT = 175.59 * 2;

// ── Text helpers (paths, not font-family — the repo ships no system fonts) ──
const getPath = (font, text, x, y, size) => font.getPath(text, x, y, size).toPathData(2);

function getWidth(font, text, size) {
  let w = 0;
  for (const ch of text) w += font.charToGlyph(ch).advanceWidth;
  return w * (size / font.unitsPerEm);
}

// Advance width is linear in size, so one measurement at size 1 gives the exact
// size that fills a target measure. No estimating glyph widths.
const sizeToFit = (font, text, targetW) => targetW / getWidth(font, text, 1);

function centered(font, text, cx, y, size, fill, opacity = 1) {
  const x = cx - getWidth(font, text, size) / 2;
  const op = opacity === 1 ? '' : ` opacity="${opacity}"`;
  return `<path d="${getPath(font, text, x, y, size)}" fill="${fill}"${op}/>`;
}

// Letterspaced mono, drawn glyph by glyph — the metadata register.
function trackedMono(text, cx, y, size, fill, opacity, track) {
  const chars = [...text];
  const total = chars.reduce((a, c) => a + getWidth(FONT_MONO, c, size), 0) + track * (chars.length - 1);
  let x = cx - total / 2;
  const out = [];
  for (const c of chars) {
    if (c !== ' ') out.push(`<path d="${getPath(FONT_MONO, c, x, y, size)}" fill="${fill}" opacity="${opacity}"/>`);
    x += getWidth(FONT_MONO, c, size) + track;
  }
  return out;
}

// ── Shared backdrop: the Substack masthead grammar, scaled to any frame ─────
function backdrop(W, H, { rule = 6, oScale = 1 } = {}) {
  const el = [`<rect width="${W}" height="${H}" fill="${DARK}"/>`];
  el.push(`<defs>
    <linearGradient id="gridFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${WHITE}" stop-opacity="0.05"/>
      <stop offset="55%" stop-color="${WHITE}" stop-opacity="0.022"/>
      <stop offset="100%" stop-color="${WHITE}" stop-opacity="0"/>
    </linearGradient>
  </defs>`);

  const step = Math.round(H / 9);
  for (let x = 0; x <= W; x += step) el.push(`<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="url(#gridFade)" stroke-width="${Math.max(1, H / 630)}"/>`);
  for (let y = step; y < H; y += step) el.push(`<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="url(#gridFade)" stroke-width="${Math.max(1, H / 630)}"/>`);

  // Oversized O bleeding off the left edge — the same texture cue as the
  // Substack cover and the DocSend banners.
  const oSize = H * 0.98 * oScale;
  el.push(`<path d="${getPath(FONT_SEMI, 'O', -oSize * 0.18, H * 0.79, oSize)}" fill="${GREEN}" opacity="0.055"/>`);
  el.push(`<rect width="${W}" height="${rule}" fill="${ORANGE}"/>`);
  return el;
}

function wordmarkLeft(x, y, size) {
  const askW = getWidth(FONT_SEMI, 'ask', size);
  return [
    `<path d="${getPath(FONT_SEMI, 'ask', x, y, size)}" fill="${ORANGE}"/>`,
    `<path d="${getPath(FONT_SEMI, 'Odin', x + askW, y, size)}" fill="${GREEN}"/>`,
  ];
}

function wordmarkRight(x, y, size) {
  const total = getWidth(FONT_SEMI, 'ask', size) + getWidth(FONT_SEMI, 'Odin', size);
  return wordmarkLeft(x - total, y, size);
}

function trackedMonoLeft(text, x, y, size, fill, opacity, track) {
  const out = [];
  let cx = x;
  for (const c of [...text]) {
    if (c !== ' ') out.push(`<path d="${getPath(FONT_MONO, c, cx, y, size)}" fill="${fill}" opacity="${opacity}"/>`);
    cx += getWidth(FONT_MONO, c, size) + track;
  }
  return out;
}

// Wrap and fit against real advance widths — no glyph-width estimates.
function wrapExact(font, text, size, maxW) {
  const lines = [];
  let line = '';
  for (const word of String(text).split(/\s+/)) {
    const cand = line ? `${line} ${word}` : word;
    if (getWidth(font, cand, size) <= maxW || !line) line = cand;
    else { lines.push(line); line = word; }
  }
  if (line) lines.push(line);
  return lines;
}

function fitBlock(font, text, maxW, maxLines, sizes) {
  for (const size of sizes) {
    const lines = wrapExact(font, text, size, maxW);
    if (lines.length <= maxLines) return { size, lines };
  }
  const size = sizes[sizes.length - 1];
  return { size, lines: wrapExact(font, text, size, maxW).slice(0, maxLines) };
}

function wordmark(cx, y, size) {
  const askW = getWidth(FONT_SEMI, 'ask', size);
  const x = cx - (askW + getWidth(FONT_SEMI, 'Odin', size)) / 2;
  return [
    `<path d="${getPath(FONT_SEMI, 'ask', x, y, size)}" fill="${ORANGE}"/>`,
    `<path d="${getPath(FONT_SEMI, 'Odin', x + askW, y, size)}" fill="${GREEN}"/>`,
  ];
}

// Three layers: judgment on top, retrieval beneath, raw data below. Abstract
// enough to survive the 55px thumbnail Spotify renders in a feed.
function stack(cx, y, w, barH, gap) {
  const bars = [
    { stroke: GREEN, so: 1, fill: GREEN, op: 0.22 },
    { stroke: ORANGE, so: 0.7, fill: ORANGE, op: 0.14 },
    { stroke: '#3A3A52', so: 1, fill: '#1C1C2E', op: 1 },
  ];
  const sw = Math.max(1.5, barH * 0.04);
  return bars.map((b, i) =>
    `<rect x="${cx - w / 2}" y="${y + i * (barH + gap)}" width="${w}" height="${barH}" rx="${barH * 0.06}"
      fill="${b.fill}" fill-opacity="${b.op}" stroke="${b.stroke}" stroke-opacity="${b.so}" stroke-width="${sw}"/>`
  );
}

// ── Show art ────────────────────────────────────────────────────────────────
// Spotify show-art rules: 1:1, ≤2 typefaces, no secondary copy, never the word
// "Podcast". The only text is the show title plus the publisher wordmark, which
// is kept deliberately — askOdin ↔ The Judgment Stack is the entity association
// the whole distribution strategy depends on.
//
// Weight is the one place this departs from the Substack cover. The brand rule
// allows Light at 40px+ display scale, and the Substack masthead uses it — but
// Spotify renders show art at 55px in a feed, where Light strokes disappear.
// SemiBold by default; `weight: 'light'` renders the Substack-faithful variant.
function coverSvg(S, { weight = 'semi' } = {}) {
  const k = S / 3000;
  const cx = S / 2;
  const font = weight === 'light' ? FONT_LIGHT : FONT_SEMI;
  const el = backdrop(S, S, { rule: 15 * k, oScale: 1.15 });

  el.push(...wordmark(cx, 430 * k, 90 * k));

  // Three lines, all set to the size that fits the longest word in the measure.
  const lines = ['The', 'Judgment', 'Stack'];
  const measure = S * 0.76;
  const size = Math.min(...lines.map((l) => sizeToFit(font, l, measure)));
  const lh = size * 1.11;
  const firstBaseline = 1050 * k;
  lines.forEach((l, i) => el.push(centered(font, l, cx, firstBaseline + i * lh, size, WHITE, 0.96)));

  const dividerY = firstBaseline + 2 * lh + 200 * k;
  el.push(`<line x1="${cx - 130 * k}" y1="${dividerY}" x2="${cx + 130 * k}" y2="${dividerY}" stroke="${ORANGE}" stroke-width="${9 * k}"/>`);
  el.push(...stack(cx, dividerY + 130 * k, S * 0.62, 84 * k, 24 * k));
  return svgFor(`${SHOW} — askOdin`, el, S, S);
}

// ── Profile mark ────────────────────────────────────────────────────────────
function avatarSvg(S, bg) {
  const fill = 0.78;
  const scale = ((S * fill) / MARK_HEIGHT).toFixed(5);
  const half = S / 2;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-half} ${-half} ${S} ${S}" width="${S}" height="${S}">
  <title>${SHOW} — askOdin</title>
  <rect x="${-half}" y="${-half}" width="${S}" height="${S}" fill="${bg}"/>
  <g transform="scale(${scale})">
    <path d="${O_PATH}" fill="${GREEN}"/>
    <path d="${DIAMOND_PATH}" transform="scale(1.2)" fill="${ORANGE}"/>
  </g>
</svg>
`;
}

// ── YouTube channel banner ──────────────────────────────────────────────────
// 2560×1440 upload; only the central 1546×423 survives the mobile crop, so every
// element sits inside it. Same box generate-youtube-cover.mjs works to.
function bannerSvg() {
  const W = 2560, H = 1440, cx = W / 2, cy = H / 2;
  const SAFE_W = 1546, SAFE_H = 423;
  const safeTop = cy - SAFE_H / 2, safeBottom = cy + SAFE_H / 2;
  const el = backdrop(W, H, { rule: 8, oScale: 0.9 });

  const size = sizeToFit(FONT_SEMI, SHOW, SAFE_W * 0.9);
  const titleBaseline = safeTop + 132;
  el.push(centered(FONT_SEMI, SHOW, cx, titleBaseline, size, WHITE, 0.96));
  el.push(`<line x1="${cx - 46}" y1="${titleBaseline + 52}" x2="${cx + 46}" y2="${titleBaseline + 52}" stroke="${ORANGE}" stroke-width="3"/>`);
  el.push(centered(FONT_SERIF_IT, STANDFIRST[0], cx, titleBaseline + 118, 30, WHITE, 0.72));
  el.push(centered(FONT_SERIF_IT, STANDFIRST[1], cx, titleBaseline + 158, 30, WHITE, 0.72));
  el.push(...trackedMono('ASKODIN.APP', cx, safeBottom - 34, 19, WHITE, 0.42, 7));
  return svgFor(`${SHOW} — YouTube channel art`, el, W, H);
}

// ── OG card for a future /podcast page ──────────────────────────────────────
function ogSvg() {
  const W = 1200, H = 630, cx = W / 2;
  const el = backdrop(W, H);
  el.push(...wordmark(cx, 132, 34));
  el.push(centered(FONT_SEMI, SHOW, cx, 320, sizeToFit(FONT_SEMI, SHOW, W * 0.66), WHITE, 0.96));
  el.push(`<line x1="${cx - 44}" y1="366" x2="${cx + 44}" y2="366" stroke="${ORANGE}" stroke-width="3"/>`);
  el.push(centered(FONT_SERIF_IT, STANDFIRST[0], cx, 428, 27, WHITE, 0.72));
  el.push(centered(FONT_SERIF_IT, STANDFIRST[1], cx, 466, 27, WHITE, 0.72));
  el.push(...trackedMono('ASKODIN.APP', cx, 556, 17, WHITE, 0.42, 6));
  return svgFor(`${SHOW} — askOdin`, el, W, H);
}

// ── Episode art ─────────────────────────────────────────────────────────────
// Left-aligned, unlike the centered show masthead: episode titles are sentences
// and read badly ragged-both-sides.
function episodeCoverSvg(ep, S = 3000) {
  const k = S / 3000;
  const pad = 260 * k;
  const el = backdrop(S, S, { rule: 15 * k, oScale: 1.15 });
  const eyebrow = `${SHOW.toUpperCase()}  ·  EP ${String(ep.n).padStart(2, '0')}`;

  el.push(...trackedMonoLeft(eyebrow, pad, 470 * k, 62 * k, WHITE, 0.55, 9 * k));
  el.push(`<rect x="${pad}" y="${590 * k}" width="${190 * k}" height="${9 * k}" fill="${ORANGE}"/>`);

  const { size, lines } = fitBlock(FONT_SEMI, ep.title, S - pad * 2, 4, [280, 250, 222, 196, 172, 152].map((n) => n * k));
  const lh = size * 1.16;
  lines.forEach((l, i) => el.push(`<path d="${getPath(FONT_SEMI, l, pad, 1100 * k + i * lh, size)}" fill="${WHITE}" opacity="0.96"/>`));

  el.push(`<line x1="${pad}" y1="${2640 * k}" x2="${S - pad}" y2="${2640 * k}" stroke="${WHITE}" stroke-opacity="0.12" stroke-width="${3 * k}"/>`);
  el.push(...trackedMonoLeft('ASKODIN.APP', pad, 2800 * k, 52 * k, WHITE, 0.42, 7 * k));
  el.push(...wordmarkRight(S - pad, 2800 * k, 78 * k));
  return svgFor(`${SHOW} — EP ${ep.n}`, el, S, S);
}

function episodeThumbnailSvg(ep) {
  const W = 1280, H = 720, pad = 76;
  const el = backdrop(W, H, { rule: 5, oScale: 0.85 });
  el.push(...trackedMonoLeft(`EP ${String(ep.n).padStart(2, '0')}  ·  ${SHOW.toUpperCase()}`, pad, 108, 24, WHITE, 0.55, 5));

  const { size, lines } = fitBlock(FONT_SEMI, ep.title, W - pad * 2 - 34, 3, [112, 100, 90, 80, 70]);
  const lh = size * 1.15;
  const blockTop = (H - lines.length * lh) / 2 + size * 0.38;
  el.push(`<rect x="${pad}" y="${blockTop - size * 0.84}" width="9" height="${lines.length * lh}" fill="${ORANGE}"/>`);
  lines.forEach((l, i) => el.push(`<path d="${getPath(FONT_SEMI, l, pad + 34, blockTop + i * lh, size)}" fill="${WHITE}" opacity="0.96"/>`));

  el.push(...wordmarkRight(W - pad, H - 58, 38));
  return svgFor(`${SHOW} — EP ${ep.n} thumbnail`, el, W, H);
}

function episodeSquareSvg(ep) {
  const S = 1080, pad = 92, cx = S / 2;
  const el = backdrop(S, S, { rule: 5, oScale: 1.1 });
  el.push(...trackedMonoLeft(`NEW EPISODE  ·  EP ${String(ep.n).padStart(2, '0')}`, pad, 156, 23, GREEN, 0.9, 6));

  const { size, lines } = fitBlock(FONT_SEMI, ep.title, S - pad * 2, 4, [90, 80, 72, 64, 56]);
  const lh = size * 1.18;
  lines.forEach((l, i) => el.push(`<path d="${getPath(FONT_SEMI, l, pad, 340 + i * lh, size)}" fill="${WHITE}" opacity="0.96"/>`));

  el.push(...stack(cx, 770, S - pad * 2, 44, 13));
  el.push(...trackedMonoLeft(SHOW.toUpperCase(), pad, S - 68, 22, WHITE, 0.42, 5));
  el.push(...wordmarkRight(S - pad, S - 68, 32));
  return svgFor(`${SHOW} — EP ${ep.n} square`, el, S, S);
}

// ── Emit ────────────────────────────────────────────────────────────────────
function svgFor(title, elements, W, H) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <title>${title}</title>
  ${elements.join('\n  ')}
</svg>`;
}

async function emit(name, svg, W, H, { dir = ASSET_DIR, svgDir = SVG_DIR, retina = false, jpeg = false, density = 300 } = {}) {
  const svgFile = path.join(svgDir, `${name}.svg`);
  fs.writeFileSync(svgFile, svg);
  const buf = fs.readFileSync(svgFile);
  await sharp(buf, { density }).resize(W, H, { fit: 'fill' }).png().toFile(path.join(dir, `${name}.png`));
  const out = [`${W}x${H}`];
  if (retina) {
    await sharp(buf, { density }).resize(W * 2, H * 2, { fit: 'fill' }).png().toFile(path.join(dir, `${name}-2x.png`));
    out.push(`${W * 2}x${H * 2}`);
  }
  // Spotify and Apple both want show art under 500 KB; step quality until it is.
  if (jpeg) {
    const jpgFile = path.join(dir, `${name}.jpg`);
    let bytes = Infinity, q = 92;
    for (const quality of [92, 86, 80, 72, 64]) {
      await sharp(buf, { density }).resize(W, H, { fit: 'fill' }).jpeg({ quality, chromaSubsampling: '4:4:4' }).toFile(jpgFile);
      bytes = fs.statSync(jpgFile).size; q = quality;
      if (bytes <= 500 * 1024) break;
    }
    out.push(`jpg q${q} ${(bytes / 1024).toFixed(0)}KB`);
  }
  console.log(`  ${name.padEnd(38)} SVG + ${out.join(' + ')}`);
}

async function main() {
  console.log(`=== ${SHOW} — podcast identity ===\n`);

  await emit('askOdin-podcast-cover', coverSvg(3000), 3000, 3000, { jpeg: true, density: 96 });
  await emit('askOdin-podcast-cover-1400', coverSvg(1400), 1400, 1400, { density: 150 });
  await emit('askOdin-podcast-cover-light', coverSvg(3000, { weight: 'light' }), 3000, 3000, { density: 96 });

  await emit('askOdin-podcast-avatar-dark', avatarSvg(800, DARK), 800, 800);
  await emit('askOdin-podcast-avatar-light', avatarSvg(800, WHITE), 800, 800);

  await emit('askOdin-podcast-youtube-banner', bannerSvg(), 2560, 1440, { density: 96 });
  await emit('askOdin-podcast-og', ogSvg(), 1200, 630, { retina: true });

  for (const ep of EPISODES) {
    const folder = path.join(EPISODE_ROOT, `${ep.date}-${ep.slug}`);
    const banners = path.join(folder, 'banners');
    const svgs = path.join(folder, 'svg');
    for (const d of [banners, svgs]) fs.mkdirSync(d, { recursive: true });
    const id = String(ep.n).padStart(2, '0');
    const opts = { dir: banners, svgDir: svgs };
    console.log(`\n  EP ${id} → ${folder}`);
    await emit(`askOdin-podcast-ep${id}-cover`, episodeCoverSvg(ep), 3000, 3000, { ...opts, density: 96 });
    await emit(`askOdin-podcast-ep${id}-youtube`, episodeThumbnailSvg(ep), 1280, 720, opts);
    await emit(`askOdin-podcast-ep${id}-square`, episodeSquareSvg(ep), 1080, 1080, opts);
  }

  console.log(`\nWrote ${ASSET_DIR}/ — show identity, undated, replaced in place.`);
  if (!EPISODES.length) {
    console.log('No episodes declared. Add one to EPISODES at the head of this file and');
    console.log(`re-run; it writes to ${EPISODE_ROOT}/YYYYMMDD-<slug>/.\n`);
  } else {
    console.log('');
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
