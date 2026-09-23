import opentype from 'opentype.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// "Judgment Infrastructure vs. Explainable AI" — headline banners and cards
// https://askodin.app/comparisons/judgment-infrastructure-vs-xai/ (datePublished 2026-09-22)
//
// Every line of copy below is quoted from src/pages/comparisons/judgment-infrastructure-vs-xai.astro
// in askodin-coming-soon, or from the Substack title/subtitle in that repo's
// Distribution_Judgment_Infrastructure_vs_XAI.md. If the page changes, change
// it here in the same edit — the cards travel without the page attached.
//
// Two families, one folder:
//   banners/  the page's identity — OG, Substack hero + share frame, X 4:5,
//             LinkedIn 1:1. Headline + the diagnostic case, nothing else.
//   cards/    one claim per card for the X thread / LinkedIn / Substack Notes:
//             the case, the two questions, the three generations, the
//             doctrine, and the closing line.
//
// The 72% / 31% case is illustrative on the page ("constructed to show the
// failure pattern and do not describe a real company"), so every surface that
// shows the figures says ILLUSTRATIVE. Do not drop it to save space.
//
// The site's own OG for this page is generated in askodin-coming-soon from
// src/data/ogPages.ts (same title, "// INSPECTION IS NOT ENFORCEMENT", green
// accent). The eyebrow here is green to match, so the two read as one piece.
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
// Brand green is too dark for small type on Deep Dark; the eyebrow and labels
// use a lifted tint of the same hue, the rule and bars keep the true green.
const GREEN_TEXT = '#2FA37A';
const DARK = '#111119';
const WHITE = '#FFFFFF';
const WATCH = '#F9A825';

const ASSET_DIR = './output/social/20260922-judgment-infrastructure-vs-xai';
const BANNER_DIR = path.join(ASSET_DIR, 'banners');
const CARD_DIR = path.join(ASSET_DIR, 'cards');
const SVG_DIR = path.join(ASSET_DIR, 'svg');
for (const d of [BANNER_DIR, CARD_DIR, SVG_DIR]) fs.mkdirSync(d, { recursive: true });

// ---------------------------------------------------------------------------
// Copy
// ---------------------------------------------------------------------------
const HEADLINE = ['Judgment Infrastructure', 'vs. Explainable AI'];
// The Substack subtitle, split at the sentence.
const STANDFIRST = [
  'Explainable AI shows where a figure came from.',
  'It does not show whether the figure survives',
  'the rest of the data room.',
];
const EYEBROW = '// INSPECTION IS NOT ENFORCEMENT';
const URL_LINE = 'ASKODIN.APP/COMPARISONS';

// The diagnostic case (page §The Diagnostic Case, illustrative_triangulation.log).
const CASE = {
  cited: { value: 72, label: 'DECK · SLIDE 14' },
  model: { value: 31, label: 'MODEL · TAB 11' },
};
if (CASE.cited.value - CASE.model.value !== 41) throw new Error('Delta no longer 41 pts — check the page');
const ILLUSTRATIVE = 'ILLUSTRATIVE · CONSTRUCTED CASE, NOT A REAL COMPANY';
const FOOTER = 'JUDGMENT INFRASTRUCTURE VS. XAI · ASKODIN.APP';

// ---------------------------------------------------------------------------
// Text primitives (shared vocabulary with generate-how-theranos-would-have-scored.mjs)
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

// A figure: Light numeral with a smaller % on the same baseline, centred on cx.
function figure(v, cx, y, size, fill, op = 1) {
  const n = String(v);
  const p = size * 0.5;
  const nW = width(F.light, n, size);
  const x = cx - (nW + size * 0.03 + width(F.light, '%', p)) / 2;
  return [at(F.light, n, x, y, size, fill, op), at(F.light, '%', x + nW + size * 0.03, y, p, fill, op)];
}

// Watch marker: the page's log reads CONFLICT HELD in amber. A small square in
// the semantic Watch colour, label in white — amber type on this ground is fine,
// but the square keeps the marker consistent with the Kill Shot cards.
function watchTag(cx, y, s, text = 'CONFLICT HELD') {
  const size = 16 * s;
  const track = 3.4 * s;
  const sq = 11 * s;
  const tw = trackedW(F.monoMed, text, size, track);
  const x = cx - (sq + 14 * s + tw) / 2;
  return [
    `<rect x="${x.toFixed(1)}" y="${(y - sq - 1.5 * s).toFixed(1)}" width="${sq.toFixed(1)}" height="${sq.toFixed(1)}" fill="${WATCH}"/>`,
    ...tracked(F.monoMed, text, x + sq + 14 * s, y, size, track, WHITE, 0.82),
  ];
}

// The case as a pair: the cited figure (muted — it is the one the tool trusted)
// and the model's figure (orange — the one that holds). Side by side, centred.
function casePair(cx, y, s, gapX, nSize) {
  const el = [];
  const lx = cx - gapX / 2;
  const rx = cx + gapX / 2;
  el.push(...figure(CASE.cited.value, lx, y, nSize * s, WHITE, 0.5));
  el.push(...figure(CASE.model.value, rx, y, nSize * s, ORANGE));
  el.push(`<line x1="${cx.toFixed(1)}" y1="${(y - nSize * 0.7 * s).toFixed(1)}" x2="${cx.toFixed(1)}" y2="${(y + 4 * s).toFixed(1)}" stroke="${WHITE}" stroke-width="1" opacity="0.14"/>`);
  const ly = y + 40 * s;
  el.push(...midTracked(F.mono, CASE.cited.label, lx, ly, 14 * s, 3 * s, WHITE, 0.5));
  el.push(...midTracked(F.mono, CASE.model.label, rx, ly, 14 * s, 3 * s, WHITE, 0.7));
  return el;
}

// ---------------------------------------------------------------------------
// Banner — landscape (OG 1200x630, Substack hero 1600x900)
//
// Title left, the case right. Designed on a 1200x630 grid and scaled by W;
// extra height (the hero is 16:9, not 1.91:1) is split evenly above and below.
// ---------------------------------------------------------------------------
function bannerLandscape(W, H) {
  const k = W / 1200;
  const el = backdrop(W, H);
  const oy = (H - 630 * k) / 2;
  const X = (v) => v * k;
  const Y = (v) => oy + v * k;

  const L = X(84);
  const colW = X(620);

  el.push(...wordmarkAt(L, Y(104), 30 * k));
  el.push(...tracked(F.monoMed, EYEBROW, L, Y(190), 16 * k, 4.2 * k, GREEN_TEXT, 1));

  const hSize = fit(F.light, HEADLINE, 62 * k, colW);
  HEADLINE.forEach((line, i) => el.push(at(F.light, line, L, Y(262) + i * hSize * 1.16, hSize, WHITE, 0.96)));

  el.push(`<line x1="${L.toFixed(1)}" y1="${Y(362).toFixed(1)}" x2="${(L + X(64)).toFixed(1)}" y2="${Y(362).toFixed(1)}" stroke="${ORANGE}" stroke-width="${(3 * k).toFixed(1)}"/>`);

  const sSize = fit(F.serifIt, STANDFIRST, 23 * k, colW);
  STANDFIRST.forEach((line, i) => el.push(at(F.serifIt, line, L, Y(412) + i * sSize * 1.45, sSize, WHITE, 0.72)));

  el.push(...tracked(F.mono, URL_LINE, L, Y(560), 14 * k, 3.6 * k, WHITE, 0.4));

  // Right column: the case. A hairline divides it from the argument.
  const divX = X(778);
  el.push(`<line x1="${divX.toFixed(1)}" y1="${Y(150).toFixed(1)}" x2="${divX.toFixed(1)}" y2="${Y(540).toFixed(1)}" stroke="${WHITE}" stroke-width="1" opacity="0.12"/>`);
  const rcx = X(990);
  el.push(...midTracked(F.monoMed, 'GROSS MARGIN', rcx, Y(190), 16 * k, 4.2 * k, WHITE, 0.55));
  el.push(...casePair(rcx, Y(336), k, X(194), 90));
  el.push(mid(F.serifIt, 'Fully explained. Still wrong.', rcx, Y(452), 22 * k, WHITE, 0.8));
  el.push(...watchTag(rcx, Y(510), k * 0.92));
  el.push(...midTracked(F.mono, 'ILLUSTRATIVE', rcx, Y(560), 13 * k, 3.4 * k, WHITE, 0.36));
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
  el.push(...midTracked(F.monoMed, EYEBROW, cx, y, 18 * s, 4.6 * s, GREEN_TEXT, 1));

  y += 96 * s * spread;
  const hSize = fit(F.light, HEADLINE, 78 * s, inner);
  HEADLINE.forEach((line, i) => el.push(mid(F.light, line, cx, y + i * hSize * 1.16, hSize, WHITE, 0.96)));
  y += (HEADLINE.length - 1) * hSize * 1.16;

  y += 186 * s * spread;
  el.push(...casePair(cx, y, s, 300 * s, 130));
  y += 40 * s;

  y += 60 * s * damp(spread, 0.6);
  el.push(...watchTag(cx, y, s, 'CONFLICT HELD · GROSS MARGIN'));
  y += 34 * s;
  el.push(...midTracked(F.mono, 'ILLUSTRATIVE', cx, y, 14 * s, 3.4 * s, WHITE, 0.36));

  y += 70 * s * spread;
  el.push(rule(cx, y, s));
  y += 58 * s * spread;
  const sSize = fit(F.serifIt, STANDFIRST, 29 * s, inner);
  STANDFIRST.forEach((line, i) => el.push(mid(F.serifIt, line, cx, y + i * sSize * 1.42, sSize, WHITE, 0.74)));
  y += (STANDFIRST.length - 1) * sSize * 1.42;

  y += 66 * s * spread;
  el.push(...midTracked(F.mono, URL_LINE, cx, y, 15 * s, 4 * s, WHITE, 0.4));
  return { el, height: y };
}

// Shared card head: wordmark + eyebrow.
function cardHead(el, cx, s, spread, eyebrow, color = ORANGE) {
  el.push(...wordmark(cx, 30 * s, 30 * s));
  const y = 30 * s + 52 * s * spread;
  el.push(...midTracked(F.monoMed, eyebrow, cx, y, 18 * s, 5 * s, color, color === ORANGE ? 0.95 : 1));
  return y;
}

function footer(text, cx, y, s, inner) {
  const size = fitTracked(F.mono, text, 14 * s, 0.18, inner);
  return midTracked(F.mono, text, cx, y, size, size * 0.18, WHITE, 0.36);
}

// ---------------------------------------------------------------------------
// Card A — The diagnostic case
//
// Linear bars on a 0–100 scale so 72 against 31 reads as length, not area.
// ---------------------------------------------------------------------------
function cardCase(cx, s, inner, spread) {
  const el = [];
  const L = cx - inner / 2;
  const R = cx + inner / 2;
  let y = cardHead(el, cx, s, spread, '// THE DIAGNOSTIC CASE');

  y += 100 * s * spread;
  const hSize = fit(F.light, ['Fully explained.'], 70 * s, inner);
  el.push(mid(F.light, 'Fully explained.', cx, y, hSize, WHITE, 0.96));
  y += hSize * 1.18;
  el.push(mid(F.light, 'Still wrong.', cx, y, hSize, ORANGE));

  y += 104 * s * spread;
  const barH = 22 * s;
  const rows = [
    { label: 'Deck, slide 14 · cited', value: `${CASE.cited.value}%`, frac: CASE.cited.value / 100, color: WHITE, op: 0.34 },
    { label: 'Model, tab 11 · P&L', value: `${CASE.model.value}%`, frac: CASE.model.value / 100, color: ORANGE, op: 1 },
  ];
  el.push(...midTracked(F.mono, 'GROSS MARGIN, SAME COMPANY', cx, y - 50 * s, 14 * s, 3.2 * s, WHITE, 0.5));
  const gap = 100 * s * damp(spread, 0.4);
  for (const r of rows) {
    el.push(at(F.med, r.label, L, y, 26 * s, WHITE, 0.82));
    el.push(right(F.monoMed, r.value, R, y, 30 * s, r.color, r.color === WHITE ? 0.72 : 1));
    const by = y + 20 * s;
    el.push(`<rect x="${L.toFixed(1)}" y="${by.toFixed(1)}" width="${inner.toFixed(1)}" height="${barH.toFixed(1)}" fill="${WHITE}" opacity="0.05"/>`);
    el.push(`<rect x="${L.toFixed(1)}" y="${by.toFixed(1)}" width="${(inner * r.frac).toFixed(1)}" height="${barH.toFixed(1)}" fill="${r.color}" opacity="${r.op}"/>`);
    y += gap;
  }
  y -= gap;

  y += 92 * s * spread;
  el.push(...watchTag(cx, y, s, 'CONFLICT HELD · DELTA 41 PTS'));

  y += 92 * s * spread;
  el.push(rule(cx, y - 46 * s, s));
  const cap = ['The citation proved where', 'the error came from.'];
  const cSize = fit(F.serifIt, cap, 32 * s, inner);
  cap.forEach((line, i) => el.push(mid(F.serifIt, line, cx, y + i * cSize * 1.42, cSize, WHITE, 0.78)));
  y += cSize * 1.42;

  y += 62 * s * spread;
  el.push(...footer(ILLUSTRATIVE, cx, y, s, inner));
  return { el, height: y };
}

// ---------------------------------------------------------------------------
// Card B — The question each one answers
// ---------------------------------------------------------------------------
function cardQuestions(cx, s, inner, spread) {
  const el = [];
  let y = cardHead(el, cx, s, spread, '// THE QUESTION IT ANSWERS');

  const block = (label, color, lines, op) => {
    y += 110 * s * spread;
    el.push(...midTracked(F.monoMed, label, cx, y, 17 * s, 4.4 * s, color, color === WHITE ? 0.55 : 1));
    y += 70 * s;
    const qSize = fit(F.light, lines, 50 * s, inner);
    lines.forEach((line, i) => el.push(mid(F.light, line, cx, y + i * qSize * 1.22, qSize, WHITE, op)));
    y += (lines.length - 1) * qSize * 1.22;
  };
  block('EXPLAINABLE AI', WHITE, ['“Why did the model say this?”'], 0.6);
  y += 20 * s * spread;
  block('JUDGMENT INFRASTRUCTURE', GREEN_TEXT, ['“Does this reasoning meet', 'the standard we need', 'before we act?”'], 0.96);

  y += 110 * s * spread;
  el.push(rule(cx, y - 50 * s, s));
  el.push(mid(F.serifIt, 'Inspection is not enforcement.', cx, y, fit(F.serifIt, ['Inspection is not enforcement.'], 34 * s, inner), WHITE, 0.8));

  y += 64 * s * spread;
  el.push(...footer(FOOTER, cx, y, s, inner));
  return { el, height: y };
}

// ---------------------------------------------------------------------------
// Card C — Generation, inspection, enforcement
//
// The last row states the limit the page states. Keep it: "askOdin audits
// reasoning, not truth" is the line that stops the card over-claiming.
// ---------------------------------------------------------------------------
const GENERATIONS = [
  { n: '01', name: 'Generation', paradigm: 'PROBABILISTIC OUTPUT', limit: 'The model writes what sounds right.', color: WHITE },
  { n: '02', name: 'Inspection (XAI)', paradigm: 'POST-HOC EXPLANATION', limit: 'Explained, and still wrong.', color: WHITE },
  { n: '03', name: 'Enforcement', paradigm: 'JUDGMENT INFRASTRUCTURE', limit: 'It audits reasoning, not truth.', color: GREEN_TEXT },
];

function cardGenerations(cx, s, inner, spread) {
  const el = [];
  const L = cx - inner / 2;
  const R = cx + inner / 2;
  let y = cardHead(el, cx, s, spread, '// THREE GENERATIONS');

  y += 96 * s * spread;
  const gap = 150 * s * damp(spread, 0.5);
  for (const g of GENERATIONS) {
    el.push(`<line x1="${L.toFixed(1)}" y1="${(y - 52 * s).toFixed(1)}" x2="${R.toFixed(1)}" y2="${(y - 52 * s).toFixed(1)}" stroke="${WHITE}" stroke-width="1" opacity="0.12"/>`);
    el.push(...tracked(F.monoMed, g.n, L, y, 17 * s, 3 * s, g.color === WHITE ? ORANGE : g.color, 1));
    el.push(at(F.med, g.name, L + 56 * s, y, 32 * s, g.color, g.color === WHITE ? 0.94 : 1));
    const pSize = fitTracked(F.mono, g.paradigm, 13 * s, 0.2, inner * 0.42);
    const pW = trackedW(F.mono, g.paradigm, pSize, pSize * 0.2);
    el.push(...tracked(F.mono, g.paradigm, R - pW, y - 4 * s, pSize, pSize * 0.2, WHITE, 0.45));
    el.push(at(F.serifIt, g.limit, L + 56 * s, y + 50 * s, 27 * s, WHITE, 0.74));
    y += gap;
  }
  y -= gap;

  y += 132 * s * spread;
  el.push(rule(cx, y - 50 * s, s));
  const cap = ['Forensic accounting audits the artifacts.', 'askOdin audits the reasoning built on them.'];
  const cSize = fit(F.serifIt, cap, 28 * s, inner);
  cap.forEach((line, i) => el.push(mid(F.serifIt, line, cx, y + i * cSize * 1.42, cSize, WHITE, i ? 0.9 : 0.66)));
  y += cSize * 1.42;

  y += 62 * s * spread;
  el.push(...footer(FOOTER, cx, y, s, inner));
  return { el, height: y };
}

// ---------------------------------------------------------------------------
// Cards D, E — The doctrine and the closing line (the page's two aphorisms)
// ---------------------------------------------------------------------------
function quoteCard(eyebrow, first, second) {
  return (cx, s, inner, spread) => {
    const el = [];
    let y = cardHead(el, cx, s, spread, eyebrow);
    y += 132 * s * spread;
    const qSize = fit(F.light, [...first, ...second], 64 * s, inner);
    first.forEach((line, i) => el.push(mid(F.light, line, cx, y + i * qSize * 1.2, qSize, WHITE, 0.96)));
    y += first.length * qSize * 1.2 + 20 * s * spread;
    second.forEach((line, i) => el.push(mid(F.light, line, cx, y + i * qSize * 1.2, qSize, ORANGE)));
    y += (second.length - 1) * qSize * 1.2;

    y += 100 * s * spread;
    el.push(rule(cx, y - 46 * s, s, WHITE));
    el.push(...footer(FOOTER, cx, y, s, inner));
    return { el, height: y };
  };
}

const cardDoctrine = quoteCard('// THE DOCTRINE', ['LLMs optimize', 'for persuasion.'], ['askOdin compiles', 'for physics.']);
const cardClosing = quoteCard('// INSPECTION IS NOT ENFORCEMENT',
  ['Inspection tells you', 'what happened.'], ['Enforcement decides', 'whether you can act.']);

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
  const ty = (H - height) / 2 + 12 * s;
  return [...backdrop(W, H), `<g transform="translate(0 ${ty.toFixed(1)})">`, ...el, `</g>`];
}

const svgFor = (title, W, H, el) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <title>${title.replace(/&/g, '&amp;')}</title>
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
  { id: 'case', title: 'Fully Explained. Still Wrong.', layout: cardCase },
  { id: 'questions', title: 'The Question It Answers', layout: cardQuestions },
  { id: 'generations', title: 'Generation, Inspection, Enforcement', layout: cardGenerations },
  { id: 'doctrine', title: 'LLMs Optimize for Persuasion', layout: cardDoctrine },
  { id: 'closing', title: 'Inspection Is Not Enforcement', layout: cardClosing },
];

async function main() {
  console.log('=== Judgment Infrastructure vs. Explainable AI ===\n');
  const TITLE = 'Judgment Infrastructure vs. Explainable AI — askOdin';

  console.log('banners/');
  // Site/social OG — LinkedIn and X link previews read 1200x630.
  await emit(BANNER_DIR, 'askOdin-xai-og', 1200, 630, svgFor(TITLE, 1200, 630, bannerLandscape(1200, 630)));
  // Substack post body, uncropped.
  await emit(BANNER_DIR, 'askOdin-substack-xai-hero', 1600, 900, svgFor(TITLE, 1600, 900, bannerLandscape(1600, 900)));
  // Substack share frame, with clear ground top and bottom for platform crops.
  await emit(BANNER_DIR, 'askOdin-substack-xai-og', 1456, 1048,
    svgFor(TITLE, 1456, 1048, frame(1456, 1048, bannerStacked, { s: 0.74, margin: 200, target: 0.82 })));
  // X in-feed image post, 4:5.
  await emit(BANNER_DIR, 'askOdin-xai-x-mobile', 1080, 1350,
    svgFor(TITLE, 1080, 1350, frame(1080, 1350, bannerStacked, { s: 1.0, margin: 90, target: 0.8 })));
  // LinkedIn in-feed image post, 1:1.
  await emit(BANNER_DIR, 'askOdin-xai-linkedin-square', 1200, 1200,
    svgFor(TITLE, 1200, 1200, frame(1200, 1200, bannerStacked, { s: 0.94, margin: 110, target: 0.82 })));

  console.log('\ncards/');
  for (const card of CARDS) {
    for (const c of CARD_CROPS) {
      await emit(CARD_DIR, `askOdin-xai-${card.id}-${c.suffix}`, c.W, c.H,
        svgFor(`${card.title} — askOdin`, c.W, c.H, frame(c.W, c.H, card.layout, c)));
    }
  }
  console.log(`\nWrote ${ASSET_DIR}/`);
}

main().catch((err) => { console.error(err); process.exit(1); });
