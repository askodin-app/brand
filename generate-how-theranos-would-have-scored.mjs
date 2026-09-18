import opentype from 'opentype.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// "How Theranos Would Have Scored" — headline banners and data cards
// https://askodin.app/insights/how-theranos-would-have-scored/ (pubDate 2026-09-18)
//
// Every figure below is taken from src/content/insights/how-theranos-would-have-scored.mdx
// in askodin-coming-soon. If the article restates a number, restate it here in
// the same change — the cards travel without the article attached.
//
// Two families, one folder:
//   banners/  the article's identity — OG, Substack hero + share frame, X 4:5,
//             LinkedIn 1:1. Headline + the score, nothing else.
//   cards/    one claim per card for the X thread / LinkedIn / Substack Note:
//             the physics violation, the pillar floor, the data contradiction,
//             and the closing line.
//
// The site's own OG for this page is generated in askodin-coming-soon from
// src/data/ogPages.ts ("How Theranos would have scored: 0 out of 100.", orange
// case-study accent). The banners here carry the same claim so a reader who
// meets the Substack card and then the site card sees one piece, not two.
// ─────────────────────────────────────────────────────────────────────────────

const F = {
  light: opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-Light.ttf'),
  med: opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-Medium.ttf'),
  semi: opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-SemiBold.ttf'),
  mono: opentype.loadSync('./fonts/IBM_Plex_Mono/IBMPlexMono-Regular.ttf'),
  monoMed: opentype.loadSync('./fonts/IBM_Plex_Mono/IBMPlexMono-Medium.ttf'),
  serifIt: opentype.loadSync('./fonts/IBM_Plex_Serif/IBMPlexSerif-Italic.ttf'),
};

const ORANGE = '#DB4A2B';
const GREEN = '#147B58';
const DARK = '#111119';
const WHITE = '#FFFFFF';
const KILL = '#C62828';

const ASSET_DIR = './output/social/20260918-how-theranos-would-have-scored';
const BANNER_DIR = path.join(ASSET_DIR, 'banners');
const CARD_DIR = path.join(ASSET_DIR, 'cards');
const SVG_DIR = path.join(ASSET_DIR, 'svg');
for (const d of [BANNER_DIR, CARD_DIR, SVG_DIR]) fs.mkdirSync(d, { recursive: true });

// ---------------------------------------------------------------------------
// Copy
// ---------------------------------------------------------------------------
// Title and subtitle as published. The subtitle is the article's argument —
// the zero is the evidence — so both ride on every banner.
const HEADLINE = ['How Theranos', 'Would Have Scored'];
const STANDFIRST = ['The investors were not stupid.', 'They were working without a framework.'];
const EYEBROW = '// CASE STUDY · THERANOS';

// The denominator every card carries: what was scored, by what, when.
const SOURCE = 'RECONSTRUCTED 2013 THERANOS INVESTOR MEMO · ASKODIN CRUCIBLE · SEP 2026';

// Pillar scores, out of 20 each. Sum 45; published score 0 (compile-time floor).
const PILLARS = [
  { label: 'Problem Definition', score: 18, color: GREEN },
  { label: 'Solution Logic', score: 8, color: WHITE },
  { label: 'Market Evidence', score: 10, color: WHITE },
  { label: 'Business Model Physics', score: 5, color: ORANGE },
  { label: 'Deal Structure', score: 4, color: ORANGE },
];
if (PILLARS.reduce((a, p) => a + p.score, 0) !== 45) throw new Error('Pillars no longer sum to 45 — check the article');

// ---------------------------------------------------------------------------
// Text primitives (shared vocabulary with generate-faking-judgment-cards.mjs)
// ---------------------------------------------------------------------------
const REF_W = 1200;
const pathOf = (f, t, x, y, size) => f.getPath(t, x, y, size).toPathData(2);

function width(f, t, size) {
  let w = 0;
  for (const ch of t) w += f.charToGlyph(ch).advanceWidth;
  return w * (size / f.unitsPerEm);
}

function at(f, t, x, y, size, fill, opacity = 1) {
  const op = opacity === 1 ? '' : ` opacity="${opacity}"`;
  return `<path d="${pathOf(f, t, x, y, size)}" fill="${fill}"${op}/>`;
}

const mid = (f, t, cx, y, size, fill, op = 1) => at(f, t, cx - width(f, t, size) / 2, y, size, fill, op);
const right = (f, t, rx, y, size, fill, op = 1) => at(f, t, rx - width(f, t, size), y, size, fill, op);

// Mono is letterspaced by hand — opentype has no tracking.
function tracked(f, t, x, y, size, track, fill, op) {
  const el = [];
  for (const ch of t) {
    if (ch !== ' ') el.push(at(f, ch, x, y, size, fill, op));
    x += width(f, ch, size) + track;
  }
  return el;
}
const trackedW = (f, t, size, track) => width(f, t, size) + track * Math.max(0, t.length - 1);
const midTracked = (f, t, cx, y, size, track, fill, op) =>
  tracked(f, t, cx - trackedW(f, t, size, track) / 2, y, size, track, fill, op);

function fit(f, lines, size, maxW) {
  while (size > 10 && lines.some((l) => width(f, l, size) > maxW)) size -= 1;
  return size;
}

// Tracked mono shrinks by size, keeping the tracking proportional.
function fitTracked(f, t, size, trackRatio, maxW) {
  while (size > 8 && trackedW(f, t, size, size * trackRatio) > maxW) size -= 0.5;
  return size;
}

const rule = (cx, y, s, color = ORANGE) =>
  `<line x1="${(cx - 44 * s).toFixed(1)}" y1="${y.toFixed(1)}" x2="${(cx + 44 * s).toFixed(1)}" y2="${y.toFixed(1)}" stroke="${color}" stroke-width="${(3 * s).toFixed(1)}"/>`;

const damp = (spread, k) => 1 + (spread - 1) * k;

// ---------------------------------------------------------------------------
// House chrome: fading grid, faint green O bleeding off the left, orange hairline
// ---------------------------------------------------------------------------
function backdrop(W, H) {
  const k = W / REF_W;
  const el = [`<rect width="${W}" height="${H}" fill="${DARK}"/>`];
  el.push(`<defs><linearGradient id="gridFade" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="${WHITE}" stop-opacity="0.05"/>
    <stop offset="55%" stop-color="${WHITE}" stop-opacity="0.022"/>
    <stop offset="100%" stop-color="${WHITE}" stop-opacity="0"/>
  </linearGradient></defs>`);
  for (let x = 0; x <= W; x += 75 * k) el.push(`<line x1="${x.toFixed(1)}" y1="0" x2="${x.toFixed(1)}" y2="${H}" stroke="url(#gridFade)" stroke-width="1"/>`);
  for (let y = 70 * k; y < H; y += 70 * k) el.push(`<line x1="0" y1="${y.toFixed(1)}" x2="${W}" y2="${y.toFixed(1)}" stroke="url(#gridFade)" stroke-width="1"/>`);
  el.push(`<path d="${pathOf(F.semi, 'O', -110 * k, H / 2 + 185 * k, 620 * k)}" fill="${GREEN}" opacity="0.055"/>`);
  el.push(`<rect width="${W}" height="${(6 * k).toFixed(1)}" fill="${ORANGE}"/>`);
  return el;
}

function wordmarkAt(x, y, size) {
  const askW = width(F.semi, 'ask', size);
  return [
    `<path d="${pathOf(F.semi, 'ask', x, y, size)}" fill="${ORANGE}"/>`,
    `<path d="${pathOf(F.semi, 'Odin', x + askW, y, size)}" fill="${GREEN}"/>`,
  ];
}
const wordmark = (cx, y, size) =>
  wordmarkAt(cx - (width(F.semi, 'ask', size) + width(F.semi, 'Odin', size)) / 2, y, size);

// The score: a Light numeral with /100 on a shared baseline, optically centred
// as one unit around cx. A numeral, not a gauge — an arc does not survive a
// thumbnail, a "0" does.
function score(cx, y, s, nSize = 250) {
  const n = nSize * s;
  const d = n * 0.24;
  const gap = n * 0.05;
  const nW = width(F.light, '0', n);
  const x = cx - (nW + gap + width(F.light, '/100', d)) / 2;
  return [at(F.light, '0', x, y, n, ORANGE), at(F.light, '/100', x + nW + gap, y, d, WHITE, 0.42)];
}

// Kill Shot marker: the compile-time error is the fatal-severity finding, so it
// gets the semantic red — as a small square, never as a fill over type.
function killTag(cx, y, s, text = 'COMPILE-TIME ERROR') {
  const size = 17 * s;
  const track = 3.4 * s;
  const sq = 11 * s;
  const tw = trackedW(F.monoMed, text, size, track);
  const x = cx - (sq + 14 * s + tw) / 2;
  return [
    `<rect x="${x.toFixed(1)}" y="${(y - sq - 1.5 * s).toFixed(1)}" width="${sq.toFixed(1)}" height="${sq.toFixed(1)}" fill="${KILL}"/>`,
    ...tracked(F.monoMed, text, x + sq + 14 * s, y, size, track, WHITE, 0.82),
  ];
}

// ---------------------------------------------------------------------------
// Banner — landscape (OG 1200x630, Substack hero 1600x900)
//
// Title left, score right. Designed on a 1200x630 grid and scaled by W; extra
// height (the hero is 16:9, not 1.91:1) is split evenly above and below.
// ---------------------------------------------------------------------------
function bannerLandscape(W, H) {
  const k = W / 1200;
  const el = backdrop(W, H);
  const oy = (H - 630 * k) / 2;
  const X = (v) => v * k;
  const Y = (v) => oy + v * k;

  const L = X(84);
  const colW = X(610);

  el.push(...wordmarkAt(L, Y(104), 30 * k));
  el.push(...tracked(F.monoMed, EYEBROW, L, Y(196), 16 * k, 4.2 * k, ORANGE, 0.95));

  const hSize = fit(F.light, HEADLINE, 66 * k, colW);
  HEADLINE.forEach((line, i) => el.push(at(F.light, line, L, Y(274) + i * hSize * 1.14, hSize, WHITE, 0.96)));

  el.push(`<line x1="${L.toFixed(1)}" y1="${Y(372).toFixed(1)}" x2="${(L + X(64)).toFixed(1)}" y2="${Y(372).toFixed(1)}" stroke="${ORANGE}" stroke-width="${(3 * k).toFixed(1)}"/>`);

  const sSize = fit(F.serifIt, STANDFIRST, 25 * k, colW);
  STANDFIRST.forEach((line, i) => el.push(at(F.serifIt, line, L, Y(426) + i * sSize * 1.45, sSize, WHITE, 0.72)));

  el.push(...tracked(F.mono, 'ASKODIN.APP/INSIGHTS', L, Y(548), 14 * k, 3.6 * k, WHITE, 0.4));

  // Right column: the verdict. A hairline divides it from the argument.
  const divX = X(768);
  el.push(`<line x1="${divX.toFixed(1)}" y1="${Y(150).toFixed(1)}" x2="${divX.toFixed(1)}" y2="${Y(530).toFixed(1)}" stroke="${WHITE}" stroke-width="1" opacity="0.12"/>`);
  const rcx = X(986);
  el.push(...midTracked(F.monoMed, 'CLARITY SCORE™', rcx, Y(196), 16 * k, 4.2 * k, WHITE, 0.55));
  el.push(...score(rcx, Y(424), k, 250));
  el.push(...killTag(rcx, Y(490), k * 0.92));
  el.push(...midTracked(F.mono, 'PHYSICS VIOLATION', rcx, Y(524), 14 * k, 3.4 * k, WHITE, 0.42));
  return el;
}

// ---------------------------------------------------------------------------
// Banner — stacked (Substack share 1456x1048, X 4:5, LinkedIn 1:1)
// ---------------------------------------------------------------------------
function bannerStacked(cx, s, inner, spread) {
  const el = [];
  let y = 0;
  el.push(...wordmark(cx, (y += 32 * s), 32 * s));

  y += 64 * s * spread;
  el.push(...midTracked(F.monoMed, EYEBROW, cx, y, 18 * s, 4.6 * s, ORANGE, 0.95));

  y += 96 * s * spread;
  const hSize = fit(F.light, HEADLINE, 84 * s, inner);
  HEADLINE.forEach((line, i) => el.push(mid(F.light, line, cx, y + i * hSize * 1.16, hSize, WHITE, 0.96)));
  y += (HEADLINE.length - 1) * hSize * 1.16;

  y += 250 * s * spread;
  el.push(...score(cx, y, s, 260));

  y += 64 * s * damp(spread, 0.6);
  el.push(...killTag(cx, y, s));
  y += 34 * s;
  el.push(...midTracked(F.mono, 'CLARITY SCORE™ · PHYSICS VIOLATION', cx, y, 15 * s, 3.4 * s, WHITE, 0.42));

  y += 70 * s * spread;
  el.push(rule(cx, y, s));
  y += 58 * s * spread;
  const sSize = fit(F.serifIt, STANDFIRST, 30 * s, inner);
  STANDFIRST.forEach((line, i) => el.push(mid(F.serifIt, line, cx, y + i * sSize * 1.42, sSize, WHITE, 0.74)));
  y += (STANDFIRST.length - 1) * sSize * 1.42;

  y += 66 * s * spread;
  el.push(...midTracked(F.mono, 'ASKODIN.APP/INSIGHTS', cx, y, 15 * s, 4 * s, WHITE, 0.4));
  return { el, height: y };
}

// ---------------------------------------------------------------------------
// Card A — The physics violation
//
// Linear bars on one scale, so the 10x reads as length. An area comparison
// (circles, squares) would exaggerate it — the claim is an order of magnitude,
// and that is what the picture should show, no more.
// ---------------------------------------------------------------------------
function cardPhysics(cx, s, inner, spread) {
  const el = [];
  const L = cx - inner / 2;
  const R = cx + inner / 2;
  let y = 0;

  el.push(...wordmark(cx, (y += 30 * s), 30 * s));
  y += 52 * s * spread;
  el.push(...midTracked(F.monoMed, '// THE PHYSICS VIOLATION', cx, y, 18 * s, 5 * s, ORANGE, 0.95));

  y += 96 * s * spread;
  const head = ['One fingerstick.', 'One order of magnitude short.'];
  const hSize = fit(F.light, head, 64 * s, inner);
  head.forEach((line, i) => el.push(mid(F.light, line, cx, y + i * hSize * 1.2, hSize, WHITE, 0.96)));
  y += hSize * 1.2;

  // Scale: 500 µL = full measure. The ">" is carried in the label, and the bar
  // stops exactly at 500 rather than guessing how far past it the need ran.
  y += 104 * s * spread;
  const barH = 22 * s;
  const rows = [
    { label: 'Blood from a fingerstick', value: '~50 µL', frac: 0.1, color: GREEN },
    { label: 'Immunoassay panel as described', value: '>500 µL', frac: 1, color: ORANGE },
  ];
  const gap = 104 * s * damp(spread, 0.4);
  for (const r of rows) {
    el.push(at(F.med, r.label, L, y, 27 * s, WHITE, 0.82));
    el.push(right(F.monoMed, r.value, R, y, 30 * s, r.color));
    const by = y + 20 * s;
    el.push(`<rect x="${L.toFixed(1)}" y="${by.toFixed(1)}" width="${inner.toFixed(1)}" height="${barH.toFixed(1)}" fill="${WHITE}" opacity="0.05"/>`);
    el.push(`<rect x="${L.toFixed(1)}" y="${by.toFixed(1)}" width="${(inner * r.frac).toFixed(1)}" height="${barH.toFixed(1)}" fill="${r.color}"/>`);
    y += gap;
  }
  y -= gap;

  y += 128 * s * spread;
  el.push(rule(cx, y - 46 * s, s));
  const cap = ['No amount of polish closes it.'];
  const cSize = fit(F.serifIt, cap, 34 * s, inner);
  el.push(mid(F.serifIt, cap[0], cx, y, cSize, WHITE, 0.78));

  y += 64 * s * spread;
  el.push(...source(cx, y, s, inner));
  return { el, height: y };
}

// ---------------------------------------------------------------------------
// Card B — Five pillars, one floor
//
// The bars are drawn at full strength and then overruled. The point of the card
// is that 18/20 on Problem Definition is real and still does not matter.
// ---------------------------------------------------------------------------
function cardPillars(cx, s, inner, spread) {
  const el = [];
  const L = cx - inner / 2;
  const R = cx + inner / 2;
  let y = 0;

  el.push(...wordmark(cx, (y += 30 * s), 30 * s));
  y += 52 * s * spread;
  el.push(...midTracked(F.monoMed, '// FIVE PILLARS · ONE FLOOR', cx, y, 18 * s, 5 * s, ORANGE, 0.95));

  y += 82 * s * spread;
  const barH = 13 * s;
  const gap = 70 * s * damp(spread, 0.35);
  for (const p of PILLARS) {
    el.push(at(F.med, p.label, L, y, 26 * s, WHITE, 0.82));
    el.push(right(F.monoMed, `${p.score}/20`, R, y, 27 * s, p.color, p.color === WHITE ? 0.7 : 1));
    const by = y + 16 * s;
    el.push(`<rect x="${L.toFixed(1)}" y="${by.toFixed(1)}" width="${inner.toFixed(1)}" height="${barH.toFixed(1)}" fill="${WHITE}" opacity="0.05"/>`);
    el.push(`<rect x="${L.toFixed(1)}" y="${by.toFixed(1)}" width="${(inner * p.score / 20).toFixed(1)}" height="${barH.toFixed(1)}" fill="${p.color}" opacity="${p.color === WHITE ? 0.34 : 1}"/>`);
    y += gap;
  }
  y -= gap;

  // Sum → published, on one line: the arithmetic the reader would do anyway.
  y += 92 * s * spread;
  el.push(`<line x1="${L.toFixed(1)}" y1="${(y - 58 * s).toFixed(1)}" x2="${R.toFixed(1)}" y2="${(y - 58 * s).toFixed(1)}" stroke="${WHITE}" stroke-width="1" opacity="0.12"/>`);
  el.push(at(F.med, 'Pillars sum to', L, y, 26 * s, WHITE, 0.6));
  el.push(right(F.monoMed, '45/100', R, y, 27 * s, WHITE, 0.6));
  y += 64 * s * damp(spread, 0.5);
  el.push(at(F.med, 'Published score', L, y, 26 * s, WHITE, 0.94));
  el.push(right(F.monoMed, '0/100', R, y, 40 * s, ORANGE));
  y += 36 * s;
  // Same marker as the banners: red square, readable label. Red type on the
  // dark ground drops below legible contrast at feed size.
  const sq = 10 * s;
  el.push(`<rect x="${L.toFixed(1)}" y="${(y - sq - 1.5 * s).toFixed(1)}" width="${sq.toFixed(1)}" height="${sq.toFixed(1)}" fill="${KILL}"/>`);
  el.push(...tracked(F.mono, 'COMPILE-TIME ERROR FLOORS THE SCORE', L + sq + 12 * s, y, 15 * s, 3 * s, WHITE, 0.6));

  y += 96 * s * spread;
  const cap = ['A broken foundation does not get', 'averaged against a good roof.'];
  const cSize = fit(F.serifIt, cap, 30 * s, inner);
  cap.forEach((line, i) => el.push(mid(F.serifIt, line, cx, y + i * cSize * 1.42, cSize, WHITE, 0.78)));
  y += cSize * 1.42;

  y += 62 * s * spread;
  el.push(...source(cx, y, s, inner));
  return { el, height: y };
}

// ---------------------------------------------------------------------------
// Card C — The data contradiction
// ---------------------------------------------------------------------------
function cardContradiction(cx, s, inner, spread) {
  const el = [];
  let y = 0;

  el.push(...wordmark(cx, (y += 30 * s), 30 * s));
  y += 52 * s * spread;
  el.push(...midTracked(F.monoMed, '// THE DATA CONTRADICTION', cx, y, 18 * s, 5 * s, ORANGE, 0.95));

  // Two claims from the same memo, set as equals — neither is the "real" one.
  const block = (fig, lbl) => {
    y += 150 * s * spread;
    el.push(mid(F.light, fig, cx, y, fit(F.light, [fig], 128 * s, inner), WHITE, 0.96));
    y += 50 * s;
    el.push(...midTracked(F.mono, lbl, cx, y, 17 * s, 4 * s, WHITE, 0.55));
  };
  block('$300M', 'GUARANTEED 18-MONTH REVENUE');
  y += 40 * s * spread;
  el.push(...midTracked(F.monoMed, 'WHILE ASKING FOR', cx, y + 40 * s * spread, 16 * s, 4 * s, ORANGE, 0.95));
  y += 40 * s * spread;
  block('$10–15M', 'IN NEW CAPITAL');

  y += 110 * s * spread;
  el.push(rule(cx, y - 46 * s, s));
  const cap = ['Both statements cannot', 'be true at once.'];
  const cSize = fit(F.light, cap, 46 * s, inner);
  cap.forEach((line, i) => el.push(mid(F.light, line, cx, y + i * cSize * 1.2, cSize, WHITE, 0.96)));
  y += cSize * 1.2;

  y += 62 * s * spread;
  el.push(...source(cx, y, s, inner));
  return { el, height: y };
}

// ---------------------------------------------------------------------------
// Card D — The closing line
// ---------------------------------------------------------------------------
function cardQuote(cx, s, inner, spread) {
  const el = [];
  let y = 0;
  el.push(...wordmark(cx, (y += 30 * s), 30 * s));
  y += 52 * s * spread;
  el.push(...midTracked(F.monoMed, '// THE COUNTERFACTUAL', cx, y, 18 * s, 5 * s, ORANGE, 0.95));

  y += 132 * s * spread;
  const q1 = ['The investors did not', 'need hindsight.'];
  const q2 = ['They needed a compiler.'];
  const qSize = fit(F.light, [...q1, ...q2], 68 * s, inner);
  q1.forEach((line, i) => el.push(mid(F.light, line, cx, y + i * qSize * 1.2, qSize, WHITE, 0.96)));
  y += q1.length * qSize * 1.2 + 20 * s * spread;
  el.push(mid(F.light, q2[0], cx, y, qSize, ORANGE));

  y += 100 * s * spread;
  el.push(rule(cx, y - 46 * s, s, WHITE));
  el.push(...midTracked(F.mono, 'HOW THERANOS WOULD HAVE SCORED · ASKODIN.APP', cx, y, 15 * s, 3 * s, WHITE, 0.4));
  return { el, height: y };
}

function source(cx, y, s, inner) {
  const size = fitTracked(F.mono, SOURCE, 14 * s, 0.18, inner);
  return midTracked(F.mono, SOURCE, cx, y, size, size * 0.18, WHITE, 0.36);
}

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------
// Solve for the spread that makes the stack fill `target` of the canvas height,
// so a copy change never needs a hand retune. Height is monotonic in spread.
function solveSpread(layout, cx, s, inner, want) {
  let lo = 0.5, hi = 3.6;
  for (let i = 0; i < 30; i++) {
    const m = (lo + hi) / 2;
    if (layout(cx, s, inner, m).height < want) lo = m; else hi = m;
  }
  return lo;
}

function frame(W, H, layout, { s, margin, target }) {
  const inner = W - margin * 2;
  const spread = solveSpread(layout, W / 2, s, inner, H * target);
  const { el, height } = layout(W / 2, s, inner, spread);
  // The measured height runs cap-top of the wordmark to the last baseline; a
  // small lift keeps the block from sitting optically low.
  const ty = (H - height) / 2 + 12 * s;
  return [...backdrop(W, H), `<g transform="translate(0 ${ty.toFixed(1)})">`, ...el, `</g>`];
}

const svgFor = (title, W, H, el) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <title>${title}</title>
  ${el.join('\n  ')}
</svg>`;

async function emit(dir, name, W, H, svg) {
  const file = path.join(SVG_DIR, `${name}.svg`);
  fs.writeFileSync(file, svg);
  const buf = fs.readFileSync(file);
  await sharp(buf, { density: 300 }).resize(W, H, { fit: 'fill' }).png().toFile(path.join(dir, `${name}.png`));
  await sharp(buf, { density: 300 }).resize(W * 2, H * 2, { fit: 'fill' }).png().toFile(path.join(dir, `${name}-2x.png`));
  console.log(`  ${name}: ${W}x${H} + @2x`);
}

const CARD_CROPS = [
  { suffix: 'x-mobile', W: 1080, H: 1350, s: 0.92, margin: 96, target: 0.74 },
  { suffix: 'square', W: 1200, H: 1200, s: 1.0, margin: 110, target: 0.78 },
];

const CARDS = [
  { id: 'physics', title: 'The Physics Violation', layout: cardPhysics },
  { id: 'pillars', title: 'Five Pillars, One Floor', layout: cardPillars },
  { id: 'contradiction', title: 'The Data Contradiction', layout: cardContradiction },
  { id: 'quote', title: 'They Needed a Compiler', layout: cardQuote },
];

async function main() {
  console.log('=== How Theranos Would Have Scored ===\n');
  const TITLE = 'How Theranos Would Have Scored — askOdin';

  console.log('banners/');
  // Site/social OG — LinkedIn and X link previews read 1200x630.
  await emit(BANNER_DIR, 'askOdin-theranos-og', 1200, 630, svgFor(TITLE, 1200, 630, bannerLandscape(1200, 630)));
  // Substack post body, uncropped.
  await emit(BANNER_DIR, 'askOdin-substack-theranos-hero', 1600, 900, svgFor(TITLE, 1600, 900, bannerLandscape(1600, 900)));
  // Substack share frame, with clear ground top and bottom for platform crops.
  await emit(BANNER_DIR, 'askOdin-substack-theranos-og', 1456, 1048,
    svgFor(TITLE, 1456, 1048, frame(1456, 1048, bannerStacked, { s: 0.78, margin: 200, target: 0.8 })));
  // X in-feed image post, 4:5.
  await emit(BANNER_DIR, 'askOdin-theranos-x-mobile', 1080, 1350,
    svgFor(TITLE, 1080, 1350, frame(1080, 1350, bannerStacked, { s: 1.0, margin: 90, target: 0.78 })));
  // LinkedIn in-feed image post, 1:1.
  await emit(BANNER_DIR, 'askOdin-theranos-linkedin-square', 1200, 1200,
    svgFor(TITLE, 1200, 1200, frame(1200, 1200, bannerStacked, { s: 0.98, margin: 110, target: 0.8 })));

  console.log('\ncards/');
  for (const card of CARDS) {
    for (const c of CARD_CROPS) {
      await emit(CARD_DIR, `askOdin-theranos-${card.id}-${c.suffix}`, c.W, c.H,
        svgFor(`${card.title} — askOdin`, c.W, c.H, frame(c.W, c.H, card.layout, c)));
    }
  }
  console.log(`\nWrote ${ASSET_DIR}/`);
}

main().catch((err) => { console.error(err); process.exit(1); });
