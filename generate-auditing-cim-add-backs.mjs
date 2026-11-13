import opentype from 'opentype.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// "The CIM Add-Back Trap" — platform set
// https://askodin.app/insights/auditing-cim-add-backs/ (pubDate 2026-11-13)
//
// The site ships its own OG (1200x630) and hero (1600x640) from
// askodin-coming-soon/scripts/generate-cim-add-backs-images.mjs. This set is
// everything the article needs off-site:
//
//   banners/  substack-hero 1600x900, substack-og 1456x1048 (share frame),
//             x-mobile 1080x1350, linkedin-square 1200x1200
//   cards/    one claim per card, 4:5 and 1:1, for the X thread, LinkedIn and
//             Substack Notes; substack-note 1200x1200 (the persistence chart);
//             and a LinkedIn document carousel PDF of the 4:5 set
//   …-note-ja/ the note.com eyecatch 1280x670 (+1920, +2x), Japanese
//   figures/  six in-article figures, 1456 wide, for Substack and note.com,
//             which have no table block and no columns
//
// ── Copy provenance ──────────────────────────────────────────────────────────
// Every figure is the article's ILLUSTRATIVE COMPOSITE, not a client run, and
// every card that shows one says so in its footer. The bridge: reported 18.4 +
// 2.6 other adjustments + 1.5 "one-time" ERP + 2.5 facility synergy = 25.0
// marketed; the two items that fail their tests come out, leaving 21.0
// (−16%; 4.0 × 11x = US$44M). The checks below throw if the article's
// arithmetic is edited here and stops adding up.
//
// Claims stay where the article put them: the cards describe what the tests
// check and what a copilot does with a footnote. None says askOdin reconciles a
// ledger or sets a peg (askodin-coming-soon, 2026-09-24 scope ruling).
//
// Japanese: the eyecatch avoids 費 逃 落 抜, which the vendored Noto subset
// lacks — 「一時的なコスト」「見過ごす」 instead of 一時費用 / 見逃す. No native
// review (YS, 2026-10-04).
// ─────────────────────────────────────────────────────────────────────────────

const F = {
  light: opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-Light.ttf'),
  med: opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-Medium.ttf'),
  semi: opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-SemiBold.ttf'),
  mono: opentype.loadSync('./fonts/IBM_Plex_Mono/IBMPlexMono-Regular.ttf'),
  monoMed: opentype.loadSync('./fonts/IBM_Plex_Mono/IBMPlexMono-Medium.ttf'),
  serifIt: opentype.loadSync('./fonts/IBM_Plex_Serif/IBMPlexSerif-Italic.ttf'),
  jpRegular: opentype.loadSync('./fonts/Noto_Sans_JP/NotoSansJP-Regular.ttf'),
  jpMedium: opentype.loadSync('./fonts/Noto_Sans_JP/NotoSansJP-Medium.ttf'),
};

const ORANGE = '#DB4A2B';
const ORANGE_TEXT = '#E26C53';
const GREEN = '#147B58';
// Brand green is too dark for small type on Deep Dark; labels use a lifted
// tint of the same hue, rules and markers keep the true green.
const GREEN_TEXT = '#2FA37A';
const DARK = '#111119';
const WHITE = '#FFFFFF';

const SLUG = 'cim-add-backs';
const ASSET_DIR = './output/social/20261113-auditing-cim-add-backs';
const NOTE_DIR = './output/social/20261113-auditing-cim-add-backs-note-ja';
const BANNER_DIR = path.join(ASSET_DIR, 'banners');
const CARD_DIR = path.join(ASSET_DIR, 'cards');
const SVG_DIR = path.join(ASSET_DIR, 'svg');
const NOTE_BANNER_DIR = path.join(NOTE_DIR, 'banners');
const NOTE_SVG_DIR = path.join(NOTE_DIR, 'svg');
for (const d of [BANNER_DIR, CARD_DIR, SVG_DIR, NOTE_BANNER_DIR, NOTE_SVG_DIR]) fs.mkdirSync(d, { recursive: true });

// ---------------------------------------------------------------------------
// Copy and figures
// ---------------------------------------------------------------------------
const TITLE = 'The CIM Add-Back Trap';
const HEADLINE = ['The CIM', 'Add-Back Trap'];
const STANDFIRST = ['Why AI copilots repeat the banker’s', 'footnote instead of testing it.'];
const EYEBROW = '// METHODOLOGY';
const URL_LINE = 'ASKODIN.APP/INSIGHTS';
const ILLUSTRATIVE = 'ILLUSTRATIVE COMPOSITE · NOT A CLIENT RUN';

const BRIDGE = { reported: 18.4, other: 2.6, erp: 1.5, synergy: 2.5, marketed: 25.0, recast: 21.0, multiple: 11 };
const PERSISTENCE = [
  { label: 'FY22 · “Systems consulting”', value: 1.2 },
  { label: 'FY23 · “Digital transformation”', value: 1.4 },
  { label: 'FY24 · “ERP upgrade”', value: 1.5 },
  { label: 'FY25 · “ERP optimization”', value: 1.5, hot: true },
];
const DPO = [
  { label: '36-month baseline', value: 42 },
  { label: 'Months before the sale', value: 68, hot: true },
];

const near = (a, b) => Math.abs(a - b) < 1e-9;
const removed = BRIDGE.erp + BRIDGE.synergy;
if (!near(BRIDGE.reported + BRIDGE.other + BRIDGE.erp + BRIDGE.synergy, BRIDGE.marketed)) throw new Error('bridge no longer sums to 25.0');
if (!near(BRIDGE.marketed - removed, BRIDGE.recast)) throw new Error('recast no longer equals marketed minus the failed items');
if (!near(removed * BRIDGE.multiple, 44)) throw new Error('US$44M no longer follows from the recast');
if (PERSISTENCE.at(-1).value !== BRIDGE.erp) throw new Error('FY25 bar must be the add-back');
const PCT = Math.round((removed / BRIDGE.marketed) * 100); // 16

// ---------------------------------------------------------------------------
// Text primitives (shared vocabulary with generate-private-equity-ai-adoption-ceiling.mjs)
// ---------------------------------------------------------------------------
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
const hair = (x1, x2, y) =>
  `<line x1="${x1.toFixed(1)}" y1="${y.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${WHITE}" stroke-width="1" opacity="0.12"/>`;
const damp = (spread, k) => 1 + (spread - 1) * k;

// Hatched fill for the items that fail their tests. Pattern ids are global in
// an SVG and the carousel puts every page in one HTML document, so the id
// carries a per-render suffix.
let hatchSeq = 0;
function hatchDef(s) {
  const id = `hatch${hatchSeq++}`;
  const w = (10 * s).toFixed(1);
  return {
    id,
    def: `<defs><pattern id="${id}" width="${w}" height="${w}" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="${w}" height="${w}" fill="${ORANGE}" fill-opacity="0.14"/>
      <line x1="0" y1="0" x2="0" y2="${w}" stroke="${ORANGE_TEXT}" stroke-width="${(3 * s).toFixed(1)}" stroke-opacity="0.75"/>
    </pattern></defs>`,
  };
}

// ---------------------------------------------------------------------------
// House chrome: fading grid, faint green O bleeding off the left, orange hairline
// ---------------------------------------------------------------------------
let gridSeq = 0;
function backdrop(W, H) {
  const k = W / 1200;
  const id = `gridFade${gridSeq++}`;
  const el = [`<rect width="${W}" height="${H}" fill="${DARK}"/>`];
  el.push(`<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="${WHITE}" stop-opacity="0.05"/>
    <stop offset="55%" stop-color="${WHITE}" stop-opacity="0.022"/>
    <stop offset="100%" stop-color="${WHITE}" stop-opacity="0"/>
  </linearGradient></defs>`);
  for (let x = 0; x <= W; x += 75 * k) el.push(`<line x1="${x.toFixed(1)}" y1="0" x2="${x.toFixed(1)}" y2="${H}" stroke="url(#${id})" stroke-width="1"/>`);
  for (let y = 70 * k; y < H; y += 70 * k) el.push(`<line x1="0" y1="${y.toFixed(1)}" x2="${W}" y2="${y.toFixed(1)}" stroke="url(#${id})" stroke-width="1"/>`);
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

// The headline pair: marketed (muted) against what survives (green).
function moneyPair(cx, y, s, gapX, nSize, labelSize = 14) {
  const el = [];
  const lx = cx - gapX / 2;
  const rx = cx + gapX / 2;
  const a = `US$${BRIDGE.marketed.toFixed(1)}M`;
  const b = `US$${BRIDGE.recast.toFixed(1)}M`;
  const size = fit(F.light, [a, b], nSize * s, gapX - 40 * s);
  el.push(mid(F.light, a, lx, y, size, WHITE, 0.62));
  el.push(mid(F.light, b, rx, y, size, GREEN_TEXT));
  el.push(`<line x1="${cx.toFixed(1)}" y1="${(y - size * 0.72).toFixed(1)}" x2="${cx.toFixed(1)}" y2="${(y + 4 * s).toFixed(1)}" stroke="${WHITE}" stroke-width="1" opacity="0.14"/>`);
  const labels = [['MARKETED', 'IN THE CIM'], ['SURVIVES', 'THE TESTS']];
  const ls = Math.min(...labels.flat().map((t) => fitTracked(F.mono, t, labelSize * s, 0.2, gapX - 36 * s)));
  labels.forEach((pair, i) => pair.forEach((t, j) =>
    el.push(...midTracked(F.mono, t, i ? rx : lx, y + 44 * s + j * ls * 1.7, ls, ls * 0.2, i ? GREEN_TEXT : WHITE, i ? 0.95 : 0.55))));
  return el;
}

// ---------------------------------------------------------------------------
// Banner — landscape (Substack hero 1600x900). Title left, the pair right.
// ---------------------------------------------------------------------------
function bannerLandscape(W, H) {
  const k = W / 1200;
  const el = backdrop(W, H);
  const oy = (H - 630 * k) / 2;
  const X = (v) => v * k;
  const Y = (v) => oy + v * k;
  const L = X(84);
  const colW = X(560);

  el.push(...wordmarkAt(L, Y(104), 30 * k));
  el.push(...tracked(F.monoMed, EYEBROW, L, Y(180), 16 * k, 4.2 * k, ORANGE_TEXT, 1));

  const hSize = fit(F.light, HEADLINE, 64 * k, colW);
  HEADLINE.forEach((line, i) => el.push(at(F.light, line, L, Y(258) + i * hSize * 1.14, hSize, WHITE, 0.96)));
  const ry = Y(258) + (HEADLINE.length - 1) * hSize * 1.14 + X(42);
  el.push(`<line x1="${L.toFixed(1)}" y1="${ry.toFixed(1)}" x2="${(L + X(64)).toFixed(1)}" y2="${ry.toFixed(1)}" stroke="${ORANGE}" stroke-width="${(3 * k).toFixed(1)}"/>`);
  const sSize = fit(F.serifIt, STANDFIRST, 22 * k, colW);
  STANDFIRST.forEach((line, i) => el.push(at(F.serifIt, line, L, ry + X(48) + i * sSize * 1.45, sSize, WHITE, 0.72)));
  el.push(...tracked(F.mono, URL_LINE, L, Y(560), 14 * k, 3.6 * k, WHITE, 0.4));

  const divX = X(700);
  el.push(`<line x1="${divX.toFixed(1)}" y1="${Y(150).toFixed(1)}" x2="${divX.toFixed(1)}" y2="${Y(540).toFixed(1)}" stroke="${WHITE}" stroke-width="1" opacity="0.12"/>`);
  const rcx = X(940);
  const rW = X(400);
  const a = `US$${BRIDGE.marketed.toFixed(1)}M`;
  const b = `US$${BRIDGE.recast.toFixed(1)}M`;
  const nSize = fit(F.light, [a, b], 76 * k, rW);
  el.push(mid(F.light, a, rcx, Y(250), nSize, WHITE, 0.62));
  el.push(...midTracked(F.mono, 'MARKETED IN THE CIM', rcx, Y(284), 13 * k, 2.6 * k, WHITE, 0.55));
  el.push(mid(F.light, b, rcx, Y(400), nSize, GREEN_TEXT));
  el.push(...midTracked(F.mono, 'SURVIVES THE TESTS', rcx, Y(434), 13 * k, 2.6 * k, GREEN_TEXT, 0.95));
  el.push(mid(F.serifIt, `−${PCT}%. At ${BRIDGE.multiple}x, US$44M of price.`, rcx, Y(500), 21 * k, WHITE, 0.8));
  el.push(...midTracked(F.mono, ILLUSTRATIVE, rcx, Y(560), 11 * k, 2.6 * k, WHITE, 0.36));
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
  el.push(...midTracked(F.monoMed, EYEBROW, cx, y, 18 * s, 4.6 * s, ORANGE_TEXT, 1));

  y += 108 * s * spread;
  const hSize = fit(F.light, HEADLINE, 92 * s, inner);
  HEADLINE.forEach((line, i) => el.push(mid(F.light, line, cx, y + i * hSize * 1.12, hSize, WHITE, 0.96)));
  y += (HEADLINE.length - 1) * hSize * 1.12;

  y += 170 * s * spread;
  el.push(...moneyPair(cx, y, s, Math.min(460 * s, inner), 86));
  y += 44 * s + 14 * s * 1.7;

  y += 72 * s * damp(spread, 0.6);
  el.push(mid(F.serifIt, `−${PCT}% once two add-backs are tested.`, cx, y, 29 * s, WHITE, 0.8));

  y += 62 * s * spread;
  el.push(rule(cx, y, s));
  y += 56 * s * spread;
  const sSize = fit(F.serifIt, STANDFIRST, 27 * s, inner);
  STANDFIRST.forEach((line, i) => el.push(mid(F.serifIt, line, cx, y + i * sSize * 1.42, sSize, WHITE, 0.66)));
  y += (STANDFIRST.length - 1) * sSize * 1.42;

  y += 64 * s * spread;
  el.push(...midTracked(F.mono, `${ILLUSTRATIVE} · US$`, cx, y, 13 * s, 3 * s, WHITE, 0.4));
  y += 34 * s;
  el.push(...midTracked(F.mono, URL_LINE, cx, y, 15 * s, 4 * s, WHITE, 0.4));
  return { el, height: y };
}

// ---------------------------------------------------------------------------
// Card primitives
// ---------------------------------------------------------------------------
function cardHead(el, cx, s, spread, eyebrow, color = ORANGE_TEXT) {
  el.push(...wordmark(cx, 30 * s, 30 * s));
  const y = 30 * s + 52 * s * spread;
  el.push(...midTracked(F.monoMed, eyebrow, cx, y, 18 * s, 5 * s, color, 1));
  return y;
}
function footer(text, cx, y, s, inner) {
  const size = fitTracked(F.mono, text, 14 * s, 0.18, inner);
  return midTracked(F.mono, text, cx, y, size, size * 0.18, WHITE, 0.36);
}
function caption(el, lines, cx, y, s, inner, size = 30, op = 0.8) {
  const cSize = fit(F.serifIt, lines, size * s, inner);
  lines.forEach((line, i) => el.push(mid(F.serifIt, line, cx, y + i * cSize * 1.42, cSize, WHITE, op)));
  return y + (lines.length - 1) * cSize * 1.42;
}
function titleBlock(el, lines, cx, y, s, inner, size = 54, turn = null, turnColor = ORANGE_TEXT) {
  const tSize = fit(F.light, turn ? [...lines, ...turn] : lines, size * s, inner);
  lines.forEach((line, i) => el.push(mid(F.light, line, cx, y + i * tSize * 1.18, tSize, WHITE, 0.96)));
  let last = y + (lines.length - 1) * tSize * 1.18;
  if (turn) turn.forEach((line, i) => { last = y + (lines.length + i) * tSize * 1.18; el.push(mid(F.light, line, cx, last, tSize, turnColor)); });
  return last;
}

// Horizontal bars from zero, value printed right; hot rows in orange.
function barChart(el, rows, { L, inner, y, s, spread, max, fmt }) {
  const lSize = fit(F.med, rows.map((r) => r.label), 25 * s, inner - 110 * s);
  const barH = 16 * s;
  const gap = 82 * s * damp(spread, 0.7);
  rows.forEach((r) => {
    const color = r.hot ? ORANGE_TEXT : WHITE;
    el.push(at(F.med, r.label, L, y, lSize, WHITE, r.hot ? 0.96 : 0.82));
    const v = fmt(r.value);
    el.push(at(F.monoMed, v, L + inner - width(F.monoMed, v, 26 * s), y, 26 * s, color, r.hot ? 1 : 0.72));
    const by = y + 16 * s;
    el.push(`<rect x="${L.toFixed(1)}" y="${by.toFixed(1)}" width="${inner.toFixed(1)}" height="${barH.toFixed(1)}" fill="${WHITE}" opacity="0.05"/>`);
    el.push(`<rect x="${L.toFixed(1)}" y="${by.toFixed(1)}" width="${(inner * r.value / max).toFixed(1)}" height="${barH.toFixed(1)}" fill="${r.hot ? ORANGE : WHITE}" opacity="${r.hot ? 1 : 0.3}"/>`);
    y += gap;
  });
  return y - gap;
}

function chartCard({ eyebrow, title, rows, max, fmt, cap, foot }) {
  return (cx, s, inner, spread) => {
    const el = [];
    const L = cx - inner / 2;
    let y = cardHead(el, cx, s, spread, eyebrow);
    y += 100 * s * spread;
    y = titleBlock(el, title, cx, y, s, inner);
    y += 104 * s * spread;
    y = barChart(el, rows, { L, inner, y, s, spread, max, fmt });
    y += 118 * s * spread;
    el.push(rule(cx, y - 50 * s, s));
    y = caption(el, cap, cx, y, s, inner);
    y += 62 * s * spread;
    el.push(...footer(foot, cx, y, s, inner));
    return { el, height: y };
  };
}

// ---------------------------------------------------------------------------
// Cards
// ---------------------------------------------------------------------------
function quoteCard(eyebrow, first, second, color = ORANGE_TEXT, foot = 'THE CIM ADD-BACK TRAP · ASKODIN.APP') {
  return (cx, s, inner, spread) => {
    const el = [];
    let y = cardHead(el, cx, s, spread, eyebrow, color);
    y += 132 * s * spread;
    const qSize = fit(F.light, [...first, ...second], 62 * s, inner);
    first.forEach((line, i) => el.push(mid(F.light, line, cx, y + i * qSize * 1.2, qSize, WHITE, 0.96)));
    y += first.length * qSize * 1.2 + 24 * s * spread;
    second.forEach((line, i) => el.push(mid(F.light, line, cx, y + i * qSize * 1.2, qSize, color)));
    y += (second.length - 1) * qSize * 1.2;
    y += 100 * s * spread;
    el.push(rule(cx, y - 46 * s, s, WHITE));
    el.push(...footer(foot, cx, y, s, inner));
    return { el, height: y };
  };
}

const cardFootnote = quoteCard('// THE BANKER’S FOOTNOTE',
  [`A US$${BRIDGE.erp}M ERP fee,`, '“non-recurring.”'],
  ['A copilot repeats it.', 'A compiler tests it.']);

const cardPersistence = chartCard({
  eyebrow: '// THE PERSISTENCE TEST',
  title: ['One cost, four labels'],
  rows: PERSISTENCE, max: 1.6, fmt: (v) => `$${v.toFixed(1)}M`,
  cap: ['The CIM calls only FY25 one-time.', 'The schedules show it every year.'],
  foot: `${ILLUSTRATIVE} · US$M`,
});

const cardPeg = chartCard({
  eyebrow: '// THE PEG SQUEEZE',
  title: ['Payables stretched', 'ahead of the auction'],
  rows: DPO, max: 75, fmt: (v) => `${v} days`,
  cap: ['Record cash conversion in the deck.', 'A Day-30 liquidity deficit after close.'],
  foot: `DAYS PAYABLE OUTSTANDING · ${ILLUSTRATIVE}`,
});

function cardMultiple(cx, s, inner, spread) {
  const el = [];
  const L = cx - inner / 2;
  const R = cx + inner / 2;
  let y = cardHead(el, cx, s, spread, '// AT THE MULTIPLE');
  y += 210 * s * spread;
  const big = `US$${(BRIDGE.erp * BRIDGE.multiple).toFixed(1)}M`;
  el.push(mid(F.light, big, cx, y, fit(F.light, [big], 150 * s, inner), ORANGE_TEXT));
  y += 56 * s;
  el.push(...midTracked(F.mono, 'OF PURCHASE PRICE RISK', cx, y, 16 * s, 3.4 * s, WHITE, 0.6));
  y += 110 * s * spread;
  const rows = [['A recurring cost, added back', `US$${BRIDGE.erp}M`], ['Entry multiple', `${BRIDGE.multiple}x`]];
  const rSize = fit(F.med, rows.map((r) => r[0]), 25 * s, inner - 140 * s);
  const gap = 76 * s * damp(spread, 0.4);
  rows.forEach(([label, v]) => {
    el.push(hair(L, R, y - 46 * s));
    el.push(at(F.med, label, L, y, rSize, WHITE, 0.84));
    el.push(at(F.monoMed, v, R - width(F.monoMed, v, 28 * s), y, 28 * s, WHITE, 0.84));
    y += gap;
  });
  el.push(hair(L, R, y - 46 * s));
  y -= gap;
  y += 120 * s * spread;
  el.push(rule(cx, y - 50 * s, s));
  y = caption(el, ['The add-back enters the price', 'at the multiple, not at face value.'], cx, y, s, inner);
  y += 62 * s * spread;
  el.push(...footer(ILLUSTRATIVE, cx, y, s, inner));
  return { el, height: y };
}

function cardSynergy(cx, s, inner, spread) {
  const el = [];
  let y = cardHead(el, cx, s, spread, '// THE SYNERGY THAT ISN’T');
  y += 100 * s * spread;
  y = titleBlock(el, [`US$${BRIDGE.synergy}M in “run-rate savings”`, 'from closing two facilities.'], cx, y, s, inner, 46);
  y += 210 * s * spread;
  el.push(mid(F.light, '40%', cx, y, 170 * s, ORANGE_TEXT));
  y += 56 * s;
  const lab = ['OF REGIONAL ENTERPRISE REVENUE IS BOUND', 'TO SAME-DAY SLAS SERVED FROM THEM'];
  const lSize = Math.min(...lab.map((t) => fitTracked(F.mono, t, 15 * s, 0.22, inner)));
  lab.forEach((t, i) => el.push(...midTracked(F.mono, t, cx, y + i * lSize * 1.8, lSize, lSize * 0.22, WHITE, 0.6)));
  y += lSize * 1.8;
  y += 120 * s * spread;
  el.push(rule(cx, y - 50 * s, s));
  y = caption(el, ['Close the facilities,', 'and the contracts go with them.'], cx, y, s, inner);
  y += 62 * s * spread;
  el.push(...footer(ILLUSTRATIVE, cx, y, s, inner));
  return { el, height: y };
}

// The bridge as a horizontal waterfall on a 0–26 scale.
function cardBridge(cx, s, inner, spread) {
  const el = [];
  const L = cx - inner / 2;
  const { id, def } = hatchDef(s);
  el.push(def);
  let y = cardHead(el, cx, s, spread, '// THE RECAST');
  y += 100 * s * spread;
  y = titleBlock(el, ['US$25.0M marketed.'], cx, y, s, inner, 54, ['US$21.0M survives.'], GREEN_TEXT);
  y += 96 * s * spread;

  const B = BRIDGE;
  const rows = [
    { label: 'Reported operating EBITDA', from: 0, to: B.reported, v: `${B.reported}`, kind: 'base' },
    { label: 'Other adjustments', from: B.reported, to: B.reported + B.other, v: `+${B.other}`, kind: 'base' },
    { label: '“One-time” ERP fee · recurs 4 years', from: 21.0, to: 22.5, v: `+${B.erp}`, kind: 'fail' },
    { label: 'Facility synergy · breaks SLAs', from: 22.5, to: B.marketed, v: `+${B.synergy}`, kind: 'fail' },
    { label: 'CIM Adjusted EBITDA', from: 0, to: B.marketed, v: B.marketed.toFixed(1), kind: 'marketed' },
    { label: 'Recast Adjusted EBITDA', from: 0, to: B.recast, v: B.recast.toFixed(1), kind: 'recast' },
  ];
  const max = 26;
  const lSize = fit(F.med, rows.map((r) => r.label), 23 * s, inner - 90 * s);
  const barH = 18 * s;
  const gap = 70 * s * damp(spread, 0.6);
  rows.forEach((r, i) => {
    if (i === 4) { el.push(hair(L, L + inner, y - 40 * s)); y += 12 * s; }
    const color = r.kind === 'fail' ? ORANGE_TEXT : r.kind === 'recast' ? GREEN_TEXT : WHITE;
    el.push(at(F.med, r.label, L, y, lSize, WHITE, r.kind === 'base' ? 0.78 : 0.94));
    el.push(at(F.monoMed, r.v, L + inner - width(F.monoMed, r.v, 24 * s), y, 24 * s, color, r.kind === 'base' ? 0.72 : 1));
    const by = y + 14 * s;
    const x = L + inner * r.from / max;
    const w = inner * (r.to - r.from) / max;
    const attrs = {
      base: `fill="${WHITE}" opacity="0.3"`,
      fail: `fill="url(#${id})" stroke="${ORANGE_TEXT}" stroke-width="${(1.5 * s).toFixed(1)}"`,
      marketed: `fill="none" stroke="${WHITE}" stroke-opacity="0.7" stroke-width="${(1.5 * s).toFixed(1)}" stroke-dasharray="${(7 * s).toFixed(1)} ${(5 * s).toFixed(1)}"`,
      recast: `fill="${GREEN}"`,
    }[r.kind];
    el.push(`<rect x="${x.toFixed(1)}" y="${by.toFixed(1)}" width="${w.toFixed(1)}" height="${barH.toFixed(1)}" ${attrs}/>`);
    y += gap;
  });
  y -= gap;
  y += 116 * s * spread;
  el.push(rule(cx, y - 50 * s, s));
  y = caption(el, [`Two findings. US$${removed.toFixed(1)}M of EBITDA.`, `At ${B.multiple}x, US$44M of purchase price.`], cx, y, s, inner);
  y += 62 * s * spread;
  el.push(...footer(`${ILLUSTRATIVE} · US$M`, cx, y, s, inner));
  return { el, height: y };
}

const cardPhysics = quoteCard('// PERSUASION VS. PHYSICS',
  ['LLMs optimize', 'for persuasion.'],
  ['askOdin compiles', 'for physics.']);

const QUESTIONS = [
  ['How many years has each', '“one-time” add-back appeared?'],
  ['Is the peg adjusted for', 'multi-year DPO and DSO trends?'],
  ['Do the synergies survive', 'the customer SLAs?'],
  ['Does the debt survive a 15%', 'haircut to Adjusted EBITDA?'],
];
function cardChecklist(cx, s, inner, spread) {
  const el = [];
  const L = cx - inner / 2;
  let y = cardHead(el, cx, s, spread, '// THE MONDAY MORNING IC CHECKLIST', GREEN_TEXT);
  y += 100 * s * spread;
  y = titleBlock(el, ['Four questions before', 'you sign the LOI'], cx, y, s, inner, 52);
  y += 96 * s * spread;
  const qSize = fit(F.med, QUESTIONS.flat(), 27 * s, inner - 80 * s);
  const gap = 118 * s * damp(spread, 0.6);
  QUESTIONS.forEach((q, i) => {
    el.push(hair(L, L + inner, y - 46 * s));
    el.push(at(F.monoMed, String(i + 1).padStart(2, '0'), L, y, 26 * s, GREEN_TEXT));
    q.forEach((line, j) => el.push(at(F.med, line, L + 72 * s, y + j * qSize * 1.3, qSize, WHITE, 0.9)));
    y += gap;
  });
  el.push(hair(L, L + inner, y - 46 * s));
  y -= gap;
  y += qSize * 1.3 + 96 * s * spread;
  el.push(...footer('ANSWER THEM FROM THE PRIMARY SCHEDULES · ASKODIN.APP', cx, y, s, inner));
  return { el, height: y };
}

const cardClosing = quoteCard('// READ THE FULL PIECE',
  ['Venture capital is the last', 'unaudited asset class.'],
  ['askOdin provides the', 'infrastructure to close the gap.'], GREEN_TEXT,
  'ASKODIN.APP/INSIGHTS/AUDITING-CIM-ADD-BACKS');

// ---------------------------------------------------------------------------
// note.com eyecatch — 1280x670, Japanese
// ---------------------------------------------------------------------------
const isJP = (ch) => {
  const c = ch.codePointAt(0);
  return (c >= 0x3000 && c <= 0x30ff) || (c >= 0x4e00 && c <= 0x9fff) || (c >= 0xff00 && c <= 0xffef);
};
const JP_FOR = new Map([[F.light, F.jpRegular], [F.mono, F.jpRegular], [F.med, F.jpMedium], [F.semi, F.jpMedium]]);
function face(ch, f) {
  const g = isJP(ch) ? JP_FOR.get(f) : f;
  if (g.charToGlyphIndex(ch) === 0) throw new Error(`Glyph missing from the Noto subset — add to KANJI in tools/prepare-noto-sans-jp.py: ${ch}`);
  return g;
}
const advJ = (ch, f, size) => { const g = face(ch, f); return g.charToGlyph(ch).advanceWidth * (size / g.unitsPerEm); };
const widthJ = (t, f, size, track = 0) => [...t].reduce((w, ch) => w + advJ(ch, f, size) + track, 0) - track;
function runJ(t, x, y, f, size, fill, op = 1, track = 0) {
  const parts = [];
  for (const ch of t) {
    if (ch !== ' ') { const d = face(ch, f).getPath(ch, x, y, size).toPathData(2); if (d) parts.push(d); }
    x += advJ(ch, f, size) + track;
  }
  return `<path d="${parts.join(' ')}" fill="${fill}"${op === 1 ? '' : ` opacity="${op}"`}/>`;
}
const midJ = (t, cx, y, f, size, fill, op, track = 0) => runJ(t, cx - widthJ(t, f, size, track) / 2, y, f, size, fill, op, track);
const fitJ = (lines, f, size, maxW) => { while (size > 10 && lines.some((l) => widthJ(l, f, size) > maxW)) size -= 1; return size; };

const JA_NOTE = {
  eyebrow: '// INSIGHTS',
  title: ['AIはなぜ、CIMの', '「一時的なコスト」を見過ごすのか'],
  pair: [
    { v: `US$${BRIDGE.marketed.toFixed(1)}M`, label: 'CIMが示す調整後EBITDA', color: WHITE, op: 0.62 },
    { v: `US$${BRIDGE.recast.toFixed(1)}M`, label: '検証後に残る額', color: GREEN_TEXT, op: 1 },
  ],
  foot: '説明用の合成データ・実際の案件ではありません',
  url: 'ASKODIN.APP/INSIGHTS',
};

// English edition of the eyecatch, for an English-language note.com post
// (YS, 2026-11-13: the piece goes to note.com in English, with these figures).
const EN_NOTE = {
  eyebrow: '// INSIGHTS',
  title: ['Why AI copilots miss', 'recurring CIM add-backs'],
  pair: [
    { v: `US$${BRIDGE.marketed.toFixed(1)}M`, label: 'Adjusted EBITDA in the CIM', color: WHITE, op: 0.62 },
    { v: `US$${BRIDGE.recast.toFixed(1)}M`, label: 'Survives the tests', color: GREEN_TEXT, op: 1 },
  ],
  foot: 'Illustrative composite · not a client run',
  url: 'ASKODIN.APP/INSIGHTS',
};

function noteEyecatch(W, H, JA = JA_NOTE) {
  const el = backdrop(W, H);
  const L = 88;
  el.push(...wordmarkAt(L, 108, 34));
  el.push(...tracked(F.monoMed, JA.eyebrow, L, 182, 18, 4.4, ORANGE_TEXT, 1));
  const colW = 640;
  const tSize = fitJ(JA.title, F.med, 50, colW);
  JA.title.forEach((line, i) => el.push(runJ(line, L, 268 + i * tSize * 1.45, F.med, tSize, WHITE, 0.96)));
  const ry = 268 + tSize * 1.45 + 56;
  el.push(`<line x1="${L}" y1="${ry}" x2="${L + 64}" y2="${ry}" stroke="${ORANGE}" stroke-width="3"/>`);
  el.push(runJ(JA.foot, L, ry + 56, F.light, 20, WHITE, 0.55));
  el.push(...tracked(F.mono, JA.url, L, 606, 15, 3.6, WHITE, 0.4));

  const divX = 790;
  el.push(`<line x1="${divX}" y1="160" x2="${divX}" y2="560" stroke="${WHITE}" stroke-width="1" opacity="0.12"/>`);
  const rcx = 1030;
  JA.pair.forEach((p, i) => {
    const y = 290 + i * 190;
    el.push(mid(F.light, p.v, rcx, y, 70, p.color, p.op));
    el.push(midJ(p.label, rcx, y + 46, F.light, 22, p.color, p.color === WHITE ? 0.6 : 0.95));
  });
  el.push(midJ(`−${PCT}%`, rcx, 600, F.light, 28, ORANGE_TEXT, 1));
  return el;
}

// ---------------------------------------------------------------------------
// In-article figures — for Substack and note.com, which have no table block
// and no columns. Every HTML element in the article that would not survive a
// paste becomes one of these: the fault-lines panel, the two bar charts, the
// modules diagram, the side-by-side output (stacked, so it reads on a phone)
// and the two pipelines. The IC checklist stays as text: a numbered list
// pastes cleanly and readers copy it.
//
// 1456 wide = Substack's 728px column at 2x; body type at 28–30px lands near
// 15px on desktop. Each figure lays out top-down and returns its own height.
// ---------------------------------------------------------------------------
const FW = 1456;
const FM = 96;
const FR = FW - FM;
const FIN = FR - FM;
const FURL = 'ASKODIN.APP/INSIGHTS/AUDITING-CIM-ADD-BACKS';

function wrap(f, text, size, maxW) {
  const words = text.split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const t = cur ? `${cur} ${w}` : w;
    if (width(f, t, size) > maxW && cur) { lines.push(cur); cur = w; } else cur = t;
  }
  if (cur) lines.push(cur);
  return lines;
}
const para = (el, f, text, x, y, size, maxW, fill, op = 1, lead = 1.42) => {
  const lines = wrap(f, text, size, maxW);
  lines.forEach((l, i) => el.push(at(f, l, x, y + i * size * lead, size, fill, op)));
  return y + (lines.length - 1) * size * lead;
};
const box = (x, y, w, h, stroke, op = 1, extra = '') =>
  `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="6" fill="#1A1A2E" stroke="${stroke}" stroke-opacity="${op}" stroke-width="2" ${extra}/>`;

function figureHead(eyebrow, title) {
  const el = [];
  el.push(...wordmarkAt(FM, 104, 28));
  el.push(...tracked(F.mono, 'ASKODIN.APP', FR - trackedW(F.mono, 'ASKODIN.APP', 14, 3.6), 100, 14, 3.6, WHITE, 0.4));
  el.push(...tracked(F.monoMed, eyebrow, FM, 196, 16, 4, ORANGE_TEXT, 1));
  const tSize = fit(F.light, [title], 54, FIN);
  el.push(at(F.light, title, FM, 266, tSize, WHITE, 0.96));
  return { el, y: 266 };
}
function figureFoot(y, note = ILLUSTRATIVE) {
  const el = [hair(FM, FR, y)];
  const text = note ? `${note} · ${FURL}` : FURL;
  const size = fitTracked(F.mono, text, 14, 0.18, FIN);
  el.push(...tracked(F.mono, text, FM, y + 52, size, size * 0.18, WHITE, 0.4));
  return { el, h: y + 96 };
}
const figureSvg = (title, h, body) =>
  svgFor(`${title} — askOdin`, FW, h, [`<rect width="${FW}" height="${h}" fill="${DARK}"/>`, `<rect width="${FW}" height="6" fill="${ORANGE}"/>`, ...body]);

// Figure — the fault lines: what the CIM says against what the exhibits show.
function faultLinesFigure() {
  const { el, y: y0 } = figureHead('// THE ANATOMY OF THE COLLISION', 'Where the narrative meets the numbers');
  let y = y0 + 70;
  const colW = (FIN - 40) / 2;
  const cols = [
    { x: FM, label: 'SELL-SIDE CIM · NARRATIVE', color: WHITE, op: 0.55, stroke: WHITE, sop: 0.2,
      items: ['“US$25.0M Adjusted EBITDA (28% margin)”', '“Fully normalized, historical cash flow”'] },
    { x: FM + colW + 40, label: 'SUPPORTING EXHIBITS · NUMBERS', color: ORANGE_TEXT, op: 1, stroke: ORANGE, sop: 0.6,
      items: ['Recurring operating expense labeled one-off', 'Working capital stretched ahead of the auction'] },
  ];
  const size = 30;
  const heights = cols.map((c) => c.items.reduce((h, t) => h + wrap(F.light, t, size, colW - 64).length * size * 1.4 + 28, 0));
  const bh = 70 + Math.max(...heights) + 20;
  cols.forEach((c) => {
    el.push(box(c.x, y, colW, bh, c.stroke, c.sop));
    el.push(...tracked(F.mono, c.label, c.x + 32, y + 52, 15, 3, c.color, c.op));
    let ty = y + 112;
    c.items.forEach((t) => { ty = para(el, F.light, t, c.x + 32, ty, size, colW - 64, WHITE, 0.92, 1.4) + size * 1.4 + 28; });
  });
  const foot = figureFoot(y + bh + 64, null);
  return { h: foot.h, svg: [...el, ...foot.el] };
}

// Figure — horizontal bars, value at right, hot row in orange.
function barsFigure(eyebrow, title, note, rows, max, fmt) {
  const { el, y: y0 } = figureHead(eyebrow, title);
  let y = y0 + 64;
  y = para(el, F.serifIt, note, FM, y, 26, FIN, WHITE, 0.66) + 96;
  const barH = 20;
  rows.forEach((r) => {
    el.push(at(F.med, r.label, FM, y, 30, WHITE, r.hot ? 0.96 : 0.82));
    const v = fmt(r.value);
    el.push(at(F.monoMed, v, FR - width(F.monoMed, v, 30), y, 30, r.hot ? ORANGE_TEXT : WHITE, r.hot ? 1 : 0.72));
    el.push(`<rect x="${FM}" y="${y + 20}" width="${FIN}" height="${barH}" fill="${WHITE}" opacity="0.05"/>`);
    el.push(`<rect x="${FM}" y="${y + 20}" width="${(FIN * r.value / max).toFixed(1)}" height="${barH}" fill="${r.hot ? ORANGE : WHITE}" opacity="${r.hot ? 1 : 0.3}"/>`);
    y += 104;
  });
  const foot = figureFoot(y - 104 + 20 + barH + 64);
  return { h: foot.h, svg: [...el, ...foot.el] };
}
const persistenceFigure = () => barsFigure('// THE PERSISTENCE TEST', 'One cost, four labels',
  'The expense the CIM calls non-recurring, by fiscal year, in US$ millions. Only FY25 is presented as one-time.',
  PERSISTENCE.map((r) => (r.hot ? { ...r, label: `${r.label} (add-back #3)` } : r)), 1.6, (v) => `$${v.toFixed(1)}M`);
const dpoFigure = () => barsFigure('// THE PEG SQUEEZE', 'Payables stretched ahead of the auction',
  'Days payable outstanding. The 26-day stretch shows up as record cash conversion in the deck.',
  DPO, 75, (v) => `${v} days`);

// Figure — one standard, pluggable modules.
function modulesFigure() {
  const { el, y: y0 } = figureHead('// EXTENSIBLE JUDGMENT', 'One standard, pluggable modules');
  let y = y0 + 64;
  y = para(el, F.serifIt, 'The standard does not change between asset types. Each module brings the extraction rules and tests for its own documents.', FM, y, 26, FIN, WHITE, 0.66) + 56;

  const sh = 176;
  el.push(box(FM, y, FIN, sh, ORANGE, 0.7));
  el.push(...tracked(F.mono, 'THE STANDARD', FM + 32, y + 52, 15, 3.4, ORANGE_TEXT, 1));
  const parts = ['5 pillars · 3 audit checks', 'JUDGE: Critical · Major · Minor', 'Defensible Audit Log'];
  const pw = (FIN - 64 - 2 * 20) / 3;
  const pSize = fit(F.med, parts, 26, pw - 40);
  parts.forEach((p, i) => {
    const px = FM + 32 + i * (pw + 20);
    el.push(box(px, y + 80, pw, 64, WHITE, 0.15));
    el.push(mid(F.med, p, px + pw / 2, y + 122, pSize, WHITE, 0.92));
  });
  y += sh;
  // Drawn, not typeset: Plex Mono has no U+25B2.
  [-90, 0, 90].forEach((dx) => {
    const cx = FW / 2 + dx;
    el.push(`<path d="M${cx - 11},${y + 52} L${cx},${y + 34} L${cx + 11},${y + 52} Z" fill="${WHITE}" opacity="0.4"/>`);
  });
  y += 84;

  const mods = [
    { name: ['Pitch decks and', 'investment memos'], tests: ['Claims against the model', 'Structural archetype match', 'Funding and runway physics'], stroke: WHITE, sop: 0.2, color: WHITE },
    { name: ['CIM evaluation'], tests: ['Persistence test (add-backs)', 'Working capital trend test', 'Contract-compatibility test'], stroke: ORANGE, sop: 0.8, color: ORANGE_TEXT },
    { name: ['Next document type'], tests: ['Same standard, same record,', 'new extraction rules.'], stroke: WHITE, sop: 0.25, color: WHITE, op: 0.5, dashed: true },
  ];
  const mw = (FIN - 2 * 24) / 3;
  const mh = 340;
  const tSize = fit(F.light, mods.flatMap((m) => m.tests.map((t) => `· ${t}`)), 24, mw - 56);
  mods.forEach((m, i) => {
    const mx = FM + i * (mw + 24);
    el.push(box(mx, y, mw, mh, m.stroke, m.sop, m.dashed ? 'stroke-dasharray="10 8" fill-opacity="0"' : ''));
    el.push(...tracked(F.mono, 'MODULE', mx + 28, y + 48, 13, 3, WHITE, 0.45));
    m.name.forEach((n, j) => el.push(at(F.med, n, mx + 28, y + 96 + j * 36, 28, m.color, m.op ?? 1)));
    const ty = y + 96 + m.name.length * 36 + 40;
    m.tests.forEach((t, j) => el.push(at(F.light, m.dashed ? t : `· ${t}`, mx + 28, ty + j * tSize * 1.6, tSize, WHITE, m.dashed ? 0.5 : 0.8)));
  });
  const foot = figureFoot(y + mh + 64, null);
  return { h: foot.h, svg: [...el, ...foot.el] };
}

// Figure — the side-by-side output, stacked: copilot, then compiler.
function outputFigure() {
  const { el, y: y0 } = figureHead('// PERSUASION VS. PHYSICS', 'The same disclosures, read two ways');
  let y = y0 + 64;
  const size = 28;
  const inW = FIN - 72;

  // Copilot block
  const copilot = '“The target company demonstrates strong 28% Adjusted EBITDA margins with US$6.6M in defensible adjustments, primarily related to non-recurring ERP upgrades and facility rationalization.”';
  const cLines = wrap(F.serifIt, copilot, size, inW).length;
  const ch = 84 + cLines * size * 1.45 + 70;
  el.push(box(FM, y, FIN, ch, WHITE, 0.2));
  el.push(...tracked(F.mono, 'WHAT CONVERSATIONAL AI REPORTS', FM + 36, y + 52, 15, 3, WHITE, 0.55));
  para(el, F.serifIt, copilot, FM + 36, y + 108, size, inW, WHITE, 0.9, 1.45);
  el.push(...tracked(F.monoMed, '[VERDICT: NARRATIVE SMOOTHING]', FM + 36, y + ch - 32, 16, 2.4, WHITE, 0.55));
  y += ch + 36;

  // Compiler block
  const findings = [
    { tag: '[CRITICAL · KILL SHOT · PILLAR 4: BUSINESS MODEL PHYSICS]', body: 'Synergy (US$2.5M facility consolidation) conflicts with same-day SLAs covering 40% of regional enterprise revenue. Synergy disallowed.' },
    { tag: '[MAJOR · PILLAR 5: DEAL STRUCTURE]', body: 'Add-back #3 (US$1.5M ERP upgrade) recurs across 4 consecutive fiscal years (FY22: $1.2M, FY23: $1.4M, FY24: $1.5M, FY25: $1.5M). Reclassified as recurring OpEx.' },
    { tag: '[MAJOR · PILLAR 5: DEAL STRUCTURE]', body: 'Accounts payable stretched 26 days against the 36-month baseline. Estimated post-close cash shortfall against the proposed peg: US$4.1M.' },
  ];
  const bodySize = 26;
  const fh = findings.reduce((h, f) => h + 36 + wrap(F.light, f.body, bodySize, inW).length * bodySize * 1.45 + 34, 0);
  const kh = 84 + fh + 60 + 84;
  el.push(box(FM, y, FIN, kh, ORANGE, 0.7));
  el.push(...tracked(F.mono, 'WHAT A DETERMINISTIC COMPILER SURFACES', FM + 36, y + 52, 15, 3, ORANGE_TEXT, 1));
  let ty = y + 112;
  findings.forEach((f) => {
    const tagSize = fitTracked(F.monoMed, f.tag, 17, 0.08, inW);
    el.push(...tracked(F.monoMed, f.tag, FM + 36, ty, tagSize, tagSize * 0.08, ORANGE_TEXT, 1));
    ty = para(el, F.light, f.body, FM + 36, ty + 44, bodySize, inW, WHITE, 0.92, 1.45) + bodySize * 1.45 + 30;
  });
  el.push(at(F.med, `Recast Adjusted EBITDA: US$${BRIDGE.recast.toFixed(1)}M (−${PCT}.0%)`, FM + 36, ty + 6, 28, GREEN_TEXT));
  el.push(...tracked(F.monoMed, '[VERDICT: DO NOT PROCEED]', FM + 36, ty + 66, 17, 2.4, ORANGE_TEXT, 1));
  y += kh;

  const foot = figureFoot(y + 64);
  return { h: foot.h, svg: [...el, ...foot.el] };
}

// Figure — same documents, two architectures.
function pipelinesFigure() {
  const { el, y: y0 } = figureHead('// WHY COPILOTS MISS IT', 'Same documents, two architectures');
  let y = y0 + 80;
  const rows = [
    { label: 'CONVERSATIONAL COPILOT', color: WHITE, op: 0.55, stroke: WHITE, sop: 0.2, out: 'NARRATIVE SMOOTHING',
      steps: [['Read', 'CIM and footnotes as one text corpus'], ['Summarize', 'Weighs how plausible the explanation sounds'], ['Memo', 'Fluent prose, no trace to the schedules']] },
    { label: 'DETERMINISTIC COMPILER', color: ORANGE_TEXT, op: 1, stroke: ORANGE, sop: 0.7, out: 'FINDING RAISED',
      steps: [['Extract', 'Each add-back becomes a discrete claim'], ['Evaluate', 'Deterministic tests against the multi-year exhibits'], ['Record', 'Findings tiered and traceable to their source']] },
  ];
  const gap = 56;
  const sw = (FIN - 2 * gap) / 3;
  const bSize = 23;
  const bh = 64 + Math.max(...rows.flatMap((r) => r.steps.map(([, b]) => wrap(F.light, b, bSize, sw - 48).length))) * bSize * 1.42 + 30;
  rows.forEach((r) => {
    el.push(...tracked(F.mono, r.label, FM, y, 15, 3.4, r.color, r.op));
    y += 30;
    r.steps.forEach(([t, b], i) => {
      const x = FM + i * (sw + gap);
      el.push(box(x, y, sw, bh, r.stroke, r.sop));
      el.push(at(F.med, t, x + 24, y + 48, 28, WHITE, 0.96));
      para(el, F.light, b, x + 24, y + 48 + 44, bSize, sw - 48, WHITE, 0.78, 1.42);
      if (i < 2) el.push(mid(F.mono, '→', x + sw + gap / 2, y + bh / 2 + 10, 28, WHITE, 0.45));
    });
    y += bh + 20;
    el.push(`<rect x="${FM}" y="${y}" width="${FIN}" height="54" rx="6" fill="${r.stroke === ORANGE ? ORANGE : WHITE}" fill-opacity="${r.stroke === ORANGE ? 0.15 : 0.06}"/>`);
    el.push(...tracked(F.monoMed, `↳ ${r.out}`, FM + 24, y + 35, 16, 3, r.color, r.op));
    y += 54 + 72;
  });
  const foot = figureFoot(y - 8, null);
  return { h: foot.h, svg: [...el, ...foot.el] };
}

const FIGURES = [
  { id: 'fig1-fault-lines', title: 'Where the Narrative Meets the Numbers', make: faultLinesFigure },
  { id: 'fig2-persistence', title: 'One Cost, Four Labels', make: persistenceFigure },
  { id: 'fig3-dpo', title: 'Payables Stretched Ahead of the Auction', make: dpoFigure },
  { id: 'fig4-modules', title: 'One Standard, Pluggable Modules', make: modulesFigure },
  { id: 'fig5-output', title: 'The Same Disclosures, Read Two Ways', make: outputFigure },
  { id: 'fig6-pipelines', title: 'Same Documents, Two Architectures', make: pipelinesFigure },
];

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------
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

async function emit(dir, name, W, H, svg, svgDir = SVG_DIR, sizes = [[W, H, ''], [W * 2, H * 2, '-2x']]) {
  const file = path.join(svgDir, `${name}.svg`);
  fs.writeFileSync(file, svg);
  const buf = fs.readFileSync(file);
  for (const [w, h, suffix] of sizes) {
    await sharp(buf, { density: 300 }).resize(w, h, { fit: 'fill' }).png().toFile(path.join(dir, `${name}${suffix}.png`));
  }
  console.log(`  ${name}: ${sizes.map(([w, h]) => `${w}x${h}`).join(', ')}`);
  return svg;
}

// LinkedIn document carousel — 4:5 pages, vector, one PDF. Metadata stamping
// as generate-private-equity-ai-adoption-ceiling.mjs, so rebuilds are
// byte-identical.
function pdfText(str) {
  if (/^[\x20-\x7E]*$/.test(str)) return `(${str.replace(/([\\()])/g, '\\$1')})`;
  return `<${Buffer.from('\uFEFF' + str, 'utf16le').swap16().toString('hex').toUpperCase()}>`;
}
function stampPdfMetadata(file, meta) {
  let orig = fs.readFileSync(file);
  orig = Buffer.from(
    orig.toString('latin1').replace(
      /\/(CreationDate|ModDate)\s*\(D:\d{14}([+-]\d{2}'\d{2}')\)/g,
      (_, key, tz) => `/${key} (D:20260101000000${tz})`),
    'latin1');
  const tail = orig.subarray(-2048).toString('latin1');
  const prev = /startxref\s+(\d+)\s+%%EOF\s*$/.exec(tail);
  const trailer = /trailer\s*<<([\s\S]*?)>>\s*startxref/.exec(tail);
  if (!prev || !trailer) throw new Error(`${file}: no classic xref trailer to chain onto`);
  const size = Number(/\/Size\s+(\d+)/.exec(trailer[1])[1]);
  const root = /\/Root\s+(\d+\s+\d+\s+R)/.exec(trailer[1])[1];
  const num = size;
  const body = Object.entries(meta).map(([k, v]) => `  /${k} ${pdfText(v)}`).join('\n');
  const obj = `${num} 0 obj\n<<\n${body}\n>>\nendobj\n`;
  const objOff = orig.length;
  const xrefOff = objOff + Buffer.byteLength(obj, 'latin1');
  const xref =
    `xref\n0 1\n0000000000 65535 f \n` +
    `${num} 1\n${String(objOff).padStart(10, '0')} 00000 n \n` +
    `trailer\n<< /Size ${num + 1} /Root ${root} /Info ${num} 0 R /Prev ${prev[1]} >>\n` +
    `startxref\n${xrefOff}\n%%EOF\n`;
  fs.writeFileSync(file, Buffer.concat([orig, Buffer.from(obj, 'latin1'), Buffer.from(xref, 'latin1')]));
}
async function carouselPdf(pages, W, H, outPath, docTitle) {
  const { default: puppeteer } = await import('puppeteer');
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${docTitle}</title><style>
    @page { size: ${W}px ${H}px; margin: 0; }
    html, body { margin: 0; padding: 0; }
    .pg { width: ${W}px; height: ${H}px; overflow: hidden; break-after: page; }
    .pg:last-child { break-after: auto; }
    svg { display: block; }
  </style></head><body>${pages.map((s) => `<div class="pg">${s.replace(/<\?xml[^>]*\?>/, '')}</div>`).join('')}</body></html>`;
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'load' });
  await page.pdf({ path: outPath, width: `${W}px`, height: `${H}px`, printBackground: true, preferCSSPageSize: true });
  await browser.close();
  stampPdfMetadata(outPath, { Title: docTitle, Author: 'askOdin' });
  console.log(`  ${path.basename(outPath)}: ${pages.length} pages`);
}

const CARD_CROPS = [
  { suffix: 'x-mobile', W: 1080, H: 1350, s: 0.92, margin: 96, target: 0.74 },
  { suffix: 'square', W: 1200, H: 1200, s: 1.0, margin: 110, target: 0.78 },
];

// In carousel order: the claim, the three fault lines, the arithmetic, the
// argument, the checklist, the close.
const CARDS = [
  { id: 'footnote', title: 'The Banker’s Footnote', layout: cardFootnote },
  { id: 'persistence', title: 'One Cost, Four Labels', layout: cardPersistence },
  { id: 'multiple', title: 'At the Multiple', layout: cardMultiple },
  { id: 'peg', title: 'The Peg Squeeze', layout: cardPeg },
  { id: 'synergy', title: 'The Synergy That Isn’t', layout: cardSynergy },
  { id: 'bridge', title: 'The Recast', layout: cardBridge },
  { id: 'physics', title: 'Persuasion vs. Physics', layout: cardPhysics },
  { id: 'checklist', title: 'Four Questions Before You Sign the LOI', layout: cardChecklist },
  { id: 'closing', title: 'Close the Gap', layout: cardClosing },
];

async function main() {
  console.log(`=== ${TITLE} ===\n`);
  const T = `${TITLE} — askOdin`;

  console.log('banners/');
  await emit(BANNER_DIR, `askOdin-substack-${SLUG}-hero`, 1600, 900, svgFor(T, 1600, 900, bannerLandscape(1600, 900)));
  await emit(BANNER_DIR, `askOdin-substack-${SLUG}-og`, 1456, 1048,
    svgFor(T, 1456, 1048, frame(1456, 1048, bannerStacked, { s: 0.7, margin: 200, target: 0.82 })));
  const cover = await emit(BANNER_DIR, `askOdin-${SLUG}-x-mobile`, 1080, 1350,
    svgFor(T, 1080, 1350, frame(1080, 1350, bannerStacked, { s: 1.0, margin: 90, target: 0.78 })));
  await emit(BANNER_DIR, `askOdin-${SLUG}-linkedin-square`, 1200, 1200,
    svgFor(T, 1200, 1200, frame(1200, 1200, bannerStacked, { s: 0.9, margin: 110, target: 0.82 })));

  console.log('\ncards/');
  const portrait = [];
  for (const card of CARDS) {
    for (const c of CARD_CROPS) {
      const svg = await emit(CARD_DIR, `askOdin-${SLUG}-${card.id}-${c.suffix}`, c.W, c.H,
        svgFor(`${card.title} — askOdin`, c.W, c.H, frame(c.W, c.H, card.layout, c)));
      if (c.suffix === 'x-mobile') portrait.push(svg);
    }
  }
  // Substack Note: the one chart that carries the argument without the article.
  await emit(CARD_DIR, `askOdin-substack-${SLUG}-note`, 1200, 1200,
    svgFor('One Cost, Four Labels — askOdin', 1200, 1200, frame(1200, 1200, cardPersistence, { s: 1.0, margin: 110, target: 0.78 })));

  await carouselPdf([cover, ...portrait], 1080, 1350, path.join(CARD_DIR, `askOdin-${SLUG}-linkedin-carousel.pdf`), T);

  console.log('\nfigures/  (in-article, for Substack and note.com: no tables, no columns)');
  const FIG_DIR = path.join(ASSET_DIR, 'figures');
  fs.mkdirSync(FIG_DIR, { recursive: true });
  for (const f of FIGURES) {
    const { h, svg } = f.make();
    const H = Math.round(h);
    await emit(FIG_DIR, `askOdin-${SLUG}-${f.id}`, FW, H, figureSvg(f.title, H, svg));
  }

  console.log('\nnote.com (ja)');
  await emit(NOTE_BANNER_DIR, `askOdin-${SLUG}-note-ja`, 1280, 670,
    svgFor('askOdin — note.com eyecatch — CIM add-backs (JA)', 1280, 670, noteEyecatch(1280, 670)),
    NOTE_SVG_DIR, [[1280, 670, ''], [1920, 1006, '-1920'], [2560, 1340, '-2x']]);
  await emit(NOTE_BANNER_DIR, `askOdin-${SLUG}-note-en`, 1280, 670,
    svgFor('askOdin — note.com eyecatch — CIM add-backs (EN)', 1280, 670, noteEyecatch(1280, 670, EN_NOTE)),
    NOTE_SVG_DIR, [[1280, 670, ''], [1920, 1006, '-1920'], [2560, 1340, '-2x']]);

  console.log(`\nWrote ${ASSET_DIR}/ and ${NOTE_DIR}/`);
}

main().catch((err) => { console.error(err); process.exit(1); });
