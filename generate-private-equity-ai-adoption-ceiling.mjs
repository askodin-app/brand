import opentype from 'opentype.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// "Why Private Equity's AI Adoption Is Hitting a Ceiling" — banners, cards, carousel
// https://askodin.app/insights/private-equity-ai-adoption-ceiling/ (pubDate 2026-09-30)
//
// Every line of copy is quoted or condensed from
// src/content/insights/private-equity-ai-adoption-ceiling.mdx in
// askodin-coming-soon, and every figure is FTI's, as the article restates them:
// FTI Consulting, 2026 Private Equity AI Radar — n = 200 senior PE
// professionals at firms with AUM ≥ $1bn, surveyed December 2025. If the
// article restates a number, change it here in the same edit.
//
// The site already ships a 1200x630 OG (headline + deal-activity bars), a
// 1600x640 hero and a 1080x1350 deal-activity portrait
// (public/images/articles/pe-ai-ceiling-*). This set is everything else the
// article needs off-site:
//
//   banners/  the article's identity — OG, Substack hero + share frame, X 4:5,
//             LinkedIn 1:1. Headline and the 95% / 43% paradox.
//   cards/    one claim per card for the X thread / LinkedIn / Substack Notes,
//             plus a LinkedIn document carousel PDF of the 4:5 set.
//
// Every card showing an FTI number carries SOURCE in its footer, and the chart
// cards name the FTI figure and how many of its rows are shown. The rebate case
// is the article's "illustrative mid-market deal", so it says ILLUSTRATIVE.
//
// The eyebrow is "// MARKET AUDIT" in green, the article's category, as on the
// site's OG — so the link preview and the in-feed images read as one piece.
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
// Brand green is too dark for small type on Deep Dark; labels use a lifted
// tint of the same hue, rules and markers keep the true green.
const GREEN_TEXT = '#2FA37A';
const DARK = '#111119';
const WHITE = '#FFFFFF';

const SLUG = 'pe-ai-ceiling';
const ASSET_DIR = './output/social/20260930-private-equity-ai-adoption-ceiling';
const BANNER_DIR = path.join(ASSET_DIR, 'banners');
const CARD_DIR = path.join(ASSET_DIR, 'cards');
const SVG_DIR = path.join(ASSET_DIR, 'svg');
for (const d of [BANNER_DIR, CARD_DIR, SVG_DIR]) fs.mkdirSync(d, { recursive: true });


// ---------------------------------------------------------------------------
// Copy
// ---------------------------------------------------------------------------
const TITLE = 'Why Private Equity’s AI Adoption Is Hitting a Ceiling';
const HEADLINE = ['Why Private Equity’s', 'AI Adoption Is', 'Hitting a Ceiling'];
// The lede's closing sentence.
const STANDFIRST = ['The tools that took over the reading', 'have not taken over the verdict.'];
const EYEBROW = '// MARKET AUDIT';
const URL_LINE = 'ASKODIN.APP/INSIGHTS';
const FOOTER = 'PRIVATE EQUITY’S AI CEILING · ASKODIN.APP';

// The paradox. Both are FTI's; the article: "Both numbers are true."
const PARADOX = {
  funds: { value: 95, line: 'OF FUNDS: AI MEETS OR EXCEEDS ITS CASE', label: ['OF FUNDS: AI MEETS OR', 'EXCEEDS ITS BUSINESS CASE'] },
  portcos: { value: 43, line: 'OF PORTCOS: NOT MATERIALLY DEPLOYING AI', label: ['OF PORTCOS: NOT', 'MATERIALLY DEPLOYING AI'] },
};
// The 43% as FTI splits it.
const NOT_DEPLOYED = [
  { label: 'Experimenting', value: 16 },
  { label: 'Limited use', value: 15 },
  { label: 'Not using AI', value: 12 },
];
if (NOT_DEPLOYED.reduce((a, r) => a + r.value, 0) !== PARADOX.portcos.value) throw new Error('43% split no longer sums — check the article');

// FTI Figure 14, the seven of twenty activities the article shows. The first
// three are document work; the divider is the article's annotation.
const DEAL_ACTIVITY = [
  { label: 'Data analysis & summarization', value: 27 },
  { label: 'Financial due diligence support', value: 27 },
  { label: 'Document scanning & processing', value: 26 },
  { label: 'Operational due diligence', value: 23 },
  { label: 'Value-creation & exit story', value: 20 },
  { label: 'Commercial due diligence', value: 17 },
  { label: 'Exit process readiness', value: 13 },
];
// FTI Figure 11, the five most cited of ten barriers.
const BARRIERS = [
  { label: 'AI talent & skills shortage', value: 35 },
  { label: 'Data readiness & accessibility', value: 33 },
  { label: 'Time-to-value & deployment speed', value: 29, hot: true },
  { label: 'Legacy integration & technical debt', value: 28 },
  { label: 'Organizational change', value: 25 },
];
// FTI Figure 10, fund-led share: the two most centralized and the least.
const FUND_LED = [
  { label: 'AI governance, risk & compliance', value: 29, hot: true },
  { label: 'Funding & budgeting for AI', value: 29, hot: true },
  { label: 'Delivery & implementation of use cases', value: 21 },
];
const ALPHA = [
  { value: '+6%', label: 'ROI REALIZATION' },
  { value: '+5%', label: 'COST SAVINGS' },
  { value: '+4%', label: 'REVENUE GROWTH' },
];

const SOURCE = 'SOURCE: FTI CONSULTING, 2026 PE AI RADAR · n = 200 · DEC 2025';
const fig = (n, shown) => `FTI 2026 PE AI RADAR, FIG. ${n}${shown ? ` · ${shown}` : ''} · n = 200`;

// ---------------------------------------------------------------------------
// Text primitives (shared vocabulary with generate-what-lps-should-ask-their-gps-about-ai-diligence.mjs)
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

// ---------------------------------------------------------------------------
// House chrome: fading grid, faint green O bleeding off the left, orange hairline
// ---------------------------------------------------------------------------
function backdrop(W, H) {
  const k = W / 1200;
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
function figure(v, cx, y, size, fill, op = 1, suffix = '%') {
  const n = String(v);
  const p = size * 0.5;
  const nW = width(F.light, n, size);
  const x = cx - (nW + size * 0.03 + width(F.light, suffix, p)) / 2;
  return [at(F.light, n, x, y, size, fill, op), at(F.light, suffix, x + nW + size * 0.03, y, p, fill, op)];
}

// The paradox side by side: 95% muted (the satisfied funds), 43% orange (the
// portfolio that has not deployed), each with a two-line label.
function paradoxPair(cx, y, s, gapX, nSize, labelSize = 14) {
  const el = [];
  const lx = cx - gapX / 2;
  const rx = cx + gapX / 2;
  el.push(...figure(PARADOX.funds.value, lx, y, nSize * s, WHITE, 0.62));
  el.push(...figure(PARADOX.portcos.value, rx, y, nSize * s, ORANGE));
  el.push(`<line x1="${cx.toFixed(1)}" y1="${(y - nSize * 0.7 * s).toFixed(1)}" x2="${cx.toFixed(1)}" y2="${(y + 4 * s).toFixed(1)}" stroke="${WHITE}" stroke-width="1" opacity="0.14"/>`);
  const ls = labelSize * s;
  const colW = gapX - 36 * s;
  const size = Math.min(...[...PARADOX.funds.label, ...PARADOX.portcos.label].map((t) => fitTracked(F.mono, t, ls, 0.2, colW)));
  [PARADOX.funds, PARADOX.portcos].forEach((p, i) => {
    p.label.forEach((t, j) =>
      el.push(...midTracked(F.mono, t, i ? rx : lx, y + 44 * s + j * size * 1.7, size, size * 0.2, WHITE, i ? 0.75 : 0.55)));
  });
  return el;
}

// ---------------------------------------------------------------------------
// Banner — landscape (OG 1200x630, Substack hero 1600x900)
//
// Title left, the paradox right, stacked. Designed on a 1200x630 grid and
// scaled by W; extra height is split above and below.
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
  el.push(...tracked(F.monoMed, EYEBROW, L, Y(180), 16 * k, 4.2 * k, GREEN_TEXT, 1));

  const hSize = fit(F.light, HEADLINE, 58 * k, colW);
  HEADLINE.forEach((line, i) => el.push(at(F.light, line, L, Y(250) + i * hSize * 1.14, hSize, WHITE, 0.96)));

  const ry = Y(250) + (HEADLINE.length - 1) * hSize * 1.14 + X(42);
  el.push(`<line x1="${L.toFixed(1)}" y1="${ry.toFixed(1)}" x2="${(L + X(64)).toFixed(1)}" y2="${ry.toFixed(1)}" stroke="${ORANGE}" stroke-width="${(3 * k).toFixed(1)}"/>`);

  const sSize = fit(F.serifIt, STANDFIRST, 22 * k, colW);
  STANDFIRST.forEach((line, i) => el.push(at(F.serifIt, line, L, ry + X(48) + i * sSize * 1.45, sSize, WHITE, 0.72)));

  el.push(...tracked(F.mono, URL_LINE, L, Y(560), 14 * k, 3.6 * k, WHITE, 0.4));

  // Right column: the two numbers, stacked, then the article's verdict on them.
  const divX = X(700);
  el.push(`<line x1="${divX.toFixed(1)}" y1="${Y(150).toFixed(1)}" x2="${divX.toFixed(1)}" y2="${Y(540).toFixed(1)}" stroke="${WHITE}" stroke-width="1" opacity="0.12"/>`);
  const rcx = X(916);
  const rW = X(380);
  const lSize = Math.min(fitTracked(F.mono, PARADOX.funds.line, 13 * k, 0.2, rW), fitTracked(F.mono, PARADOX.portcos.line, 13 * k, 0.2, rW));
  el.push(...figure(PARADOX.funds.value, rcx, Y(250), 84 * k, WHITE, 0.62));
  el.push(...midTracked(F.mono, PARADOX.funds.line, rcx, Y(284), lSize, lSize * 0.2, WHITE, 0.55));
  el.push(...figure(PARADOX.portcos.value, rcx, Y(410), 84 * k, ORANGE));
  el.push(...midTracked(F.mono, PARADOX.portcos.line, rcx, Y(444), lSize, lSize * 0.2, WHITE, 0.75));
  el.push(mid(F.serifIt, 'Both numbers are true.', rcx, Y(508), 22 * k, WHITE, 0.8));
  el.push(...midTracked(F.mono, 'SOURCE: FTI CONSULTING · n = 200', rcx, Y(560), 12 * k, 3 * k, WHITE, 0.36));
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

  y += 104 * s * spread;
  const hSize = fit(F.light, HEADLINE, 76 * s, inner);
  HEADLINE.forEach((line, i) => el.push(mid(F.light, line, cx, y + i * hSize * 1.16, hSize, WHITE, 0.96)));
  y += (HEADLINE.length - 1) * hSize * 1.16;

  y += 176 * s * spread;
  el.push(...paradoxPair(cx, y, s, Math.min(420 * s, inner), 120));
  y += 44 * s + 16 * s * 1.7;

  y += 64 * s * damp(spread, 0.6);
  el.push(mid(F.serifIt, 'Both numbers are true.', cx, y, 30 * s, WHITE, 0.8));

  y += 60 * s * spread;
  el.push(rule(cx, y, s));
  y += 56 * s * spread;
  const sSize = fit(F.serifIt, STANDFIRST, 27 * s, inner);
  STANDFIRST.forEach((line, i) => el.push(mid(F.serifIt, line, cx, y + i * sSize * 1.42, sSize, WHITE, 0.66)));
  y += (STANDFIRST.length - 1) * sSize * 1.42;

  y += 64 * s * spread;
  el.push(...midTracked(F.mono, 'SOURCE: FTI CONSULTING, 2026 PE AI RADAR · n = 200', cx, y, 13 * s, 3.2 * s, WHITE, 0.4));
  y += 34 * s;
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


function caption(el, lines, cx, y, s, inner, size = 30, op = 0.8) {
  const cSize = fit(F.serifIt, lines, size * s, inner);
  lines.forEach((line, i) => el.push(mid(F.serifIt, line, cx, y + i * cSize * 1.42, cSize, WHITE, op)));
  return y + (lines.length - 1) * cSize * 1.42;
}

// Horizontal bars from zero, value printed at the right. `tone(row, i)` picks
// the bar colour; an optional labelled divider falls after row `divider.after`.
function barChart(el, rows, { L, inner, y, s, spread, max, tone, divider }) {
  const lSize = fit(F.med, rows.map((r) => r.label), 25 * s, inner - 100 * s);
  const barH = 16 * s;
  const gap = 78 * s * damp(spread, 0.7);
  rows.forEach((r, i) => {
    const color = tone(r, i);
    el.push(at(F.med, r.label, L, y, lSize, WHITE, 0.86));
    const v = `${r.value}%`;
    el.push(at(F.monoMed, v, L + inner - width(F.monoMed, v, 26 * s), y, 26 * s, color === MUTED ? WHITE : color, color === MUTED ? 0.72 : 1));
    const by = y + 16 * s;
    el.push(`<rect x="${L.toFixed(1)}" y="${by.toFixed(1)}" width="${inner.toFixed(1)}" height="${barH.toFixed(1)}" fill="${WHITE}" opacity="0.05"/>`);
    el.push(`<rect x="${L.toFixed(1)}" y="${by.toFixed(1)}" width="${(inner * r.value / max).toFixed(1)}" height="${barH.toFixed(1)}" fill="${color === MUTED ? WHITE : color}" opacity="${color === MUTED ? 0.3 : 1}"/>`);
    y += gap;
    if (divider && i === divider.after) {
      const dy = y - gap * 0.28;
      const size = 14 * s;
      const tw = trackedW(F.monoMed, divider.label, size, 3.4 * s);
      const cx = L + inner / 2;
      const dash = `stroke="${ORANGE}" stroke-width="${(1.5 * s).toFixed(1)}" stroke-dasharray="${(6 * s).toFixed(1)} ${(5 * s).toFixed(1)}"`;
      el.push(`<line x1="${L.toFixed(1)}" y1="${(dy - size * 0.35).toFixed(1)}" x2="${(cx - tw / 2 - 16 * s).toFixed(1)}" y2="${(dy - size * 0.35).toFixed(1)}" ${dash}/>`);
      el.push(`<line x1="${(cx + tw / 2 + 16 * s).toFixed(1)}" y1="${(dy - size * 0.35).toFixed(1)}" x2="${(L + inner).toFixed(1)}" y2="${(dy - size * 0.35).toFixed(1)}" ${dash}/>`);
      el.push(...midTracked(F.monoMed, divider.label, cx, dy, size, 3.4 * s, ORANGE, 1));
      y += gap * 0.5;
    }
  });
  return y - gap;
}
const MUTED = 'muted';

// A card whose body is a titled bar chart and a caption.
function chartCard({ eyebrow, title, rows, max, tone, divider, cap, foot }) {
  return (cx, s, inner, spread) => {
    const el = [];
    const L = cx - inner / 2;
    let y = cardHead(el, cx, s, spread, eyebrow);
    y += 100 * s * spread;
    const tSize = fit(F.light, title, 54 * s, inner);
    title.forEach((line, i) => el.push(mid(F.light, line, cx, y + i * tSize * 1.18, tSize, WHITE, 0.96)));
    y += (title.length - 1) * tSize * 1.18;
    y += 104 * s * spread;
    y = barChart(el, rows, { L, inner, y, s, spread, max, tone, divider });
    y += 118 * s * spread;
    el.push(rule(cx, y - 50 * s, s));
    y = caption(el, cap, cx, y, s, inner);
    y += 62 * s * spread;
    el.push(...footer(foot, cx, y, s, inner));
    return { el, height: y };
  };
}

// ---------------------------------------------------------------------------
// Card — both numbers are true: 95% vs 43%, and how the 43% splits
// ---------------------------------------------------------------------------
function cardParadox(cx, s, inner, spread) {
  const el = [];
  const L = cx - inner / 2;
  let y = cardHead(el, cx, s, spread, '// BOTH NUMBERS ARE TRUE');

  y += 190 * s * spread;
  el.push(...paradoxPair(cx, y, s, inner / 2, 150, 15));
  y += 44 * s + 15 * s * 1.7;

  // The 43% as one segmented bar on a 0–100 track.
  y += 110 * s * spread;
  el.push(...midTracked(F.mono, 'THE 43%, AS FTI SPLITS IT', cx, y - 40 * s, 14 * s, 3.2 * s, WHITE, 0.5));
  const barH = 26 * s;
  el.push(`<rect x="${L.toFixed(1)}" y="${y.toFixed(1)}" width="${inner.toFixed(1)}" height="${barH.toFixed(1)}" fill="${WHITE}" opacity="0.05"/>`);
  let x = L;
  const ops = [1, 0.7, 0.45];
  NOT_DEPLOYED.forEach((r, i) => {
    const w = inner * r.value / 100;
    el.push(`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(w - 3 * s).toFixed(1)}" height="${barH.toFixed(1)}" fill="${ORANGE}" opacity="${ops[i]}"/>`);
    x += w;
  });
  // Legend below, one row per segment.
  y += barH + 52 * s;
  const lgap = 44 * s * damp(spread, 0.3);
  NOT_DEPLOYED.forEach((r, i) => {
    el.push(`<rect x="${L.toFixed(1)}" y="${(y - 15 * s).toFixed(1)}" width="${(15 * s).toFixed(1)}" height="${(15 * s).toFixed(1)}" fill="${ORANGE}" opacity="${ops[i]}"/>`);
    el.push(at(F.med, r.label, L + 30 * s, y, 24 * s, WHITE, 0.84));
    const v = `${r.value}%`;
    el.push(at(F.monoMed, v, L + inner - width(F.monoMed, v, 24 * s), y, 24 * s, WHITE, 0.84));
    y += lgap;
  });
  y -= lgap;

  y += 100 * s * spread;
  el.push(...footer(SOURCE, cx, y, s, inner));
  return { el, height: y };
}

// ---------------------------------------------------------------------------
// Card — how can 95% be satisfied? The target was modest.
// ---------------------------------------------------------------------------
function cardTarget(cx, s, inner, spread) {
  const el = [];
  const L = cx - inner / 2;
  const R = cx + inner / 2;
  let y = cardHead(el, cx, s, spread, '// HOW CAN 95% BE SATISFIED?');

  y += 200 * s * spread;
  el.push(...figure(17, cx, y, 170 * s, ORANGE));
  y += 54 * s;
  const lab = ['OF FUNDS SAY THEIR AI PROGRAMS', 'SIGNIFICANTLY EXCEEDED THE BUSINESS CASE'];
  const lSize = Math.min(...lab.map((t) => fitTracked(F.mono, t, 15 * s, 0.22, inner)));
  lab.forEach((t, i) => el.push(...midTracked(F.mono, t, cx, y + i * lSize * 1.8, lSize, lSize * 0.22, WHITE, 0.6)));
  y += lSize * 1.8;

  y += 100 * s * spread;
  const rows = [['Most programs were designed to deliver', '5–10%'], ['The broader benchmark for AI impact', '15%']];
  const rSize = fit(F.med, rows.map((r) => r[0]), 25 * s, inner - 120 * s);
  const gap = 76 * s * damp(spread, 0.4);
  rows.forEach(([label, v], i) => {
    el.push(hair(L, R, y - 46 * s));
    el.push(at(F.med, label, L, y, rSize, WHITE, 0.84));
    el.push(at(F.monoMed, v, R - width(F.monoMed, v, 28 * s), y, 28 * s, i ? WHITE : ORANGE, i ? 0.8 : 1));
    y += gap;
  });
  el.push(hair(L, R, y - 46 * s));
  y -= gap;

  y += 120 * s * spread;
  el.push(rule(cx, y - 50 * s, s));
  y = caption(el, ['A modest target, met, reads as success.'], cx, y, s, inner, 32);
  y += 62 * s * spread;
  el.push(...footer(SOURCE, cx, y, s, inner));
  return { el, height: y };
}

// ---------------------------------------------------------------------------
// Chart cards — FTI figures 14, 11 and 10
// ---------------------------------------------------------------------------
const cardDealActivity = chartCard({
  eyebrow: '// WHERE ADOPTION COLLAPSES',
  title: ['AI usage by deal activity'],
  rows: DEAL_ACTIVITY, max: 30,
  tone: (r, i) => (i < 3 ? GREEN_TEXT : MUTED),
  divider: { after: 2, label: 'JUDGMENT-DRIVEN WORK' },
  cap: ['Generative AI has absorbed information', 'retrieval. It stalls at judgment.'],
  foot: fig(14, '7 OF 20 ACTIVITIES'),
});

const cardBarriers = chartCard({
  eyebrow: '// TOP BARRIERS TO SCALING AI',
  title: ['What stops funds scaling AI'],
  rows: BARRIERS, max: 40,
  tone: (r) => (r.hot ? ORANGE : MUTED),
  cap: ['Deal work runs on a different clock.'],
  foot: fig(11, '5 OF 10 BARRIERS'),
});

const cardGovernance = chartCard({
  eyebrow: '// WHAT THE FUND KEEPS',
  title: ['Risk and the money are the', 'last things a fund lets go of.'],
  rows: FUND_LED, max: 35,
  tone: (r) => (r.hot ? GREEN_TEXT : MUTED),
  cap: ['The general partner owns', 'the fiduciary downside.'],
  foot: fig(10, '3 OF 9 FUNCTIONS · SHARE FUND-LED'),
});

// ---------------------------------------------------------------------------
// Card — the illustrative rebate case
// ---------------------------------------------------------------------------
function cardRebate(cx, s, inner, spread) {
  const el = [];
  let y = cardHead(el, cx, s, spread, '// AN ILLUSTRATIVE DEAL');

  y += 104 * s * spread;
  const head = ['The CIM says pricing power.', 'The schedules say rebates.'];
  const hSize = fit(F.light, head, 54 * s, inner);
  el.push(mid(F.light, head[0], cx, y, hSize, WHITE, 0.96));
  el.push(mid(F.light, head[1], cx, y + hSize * 1.2, hSize, ORANGE));
  y += hSize * 1.2;

  y += 190 * s * spread;
  const gapX = inner / 2;
  const lx = cx - gapX / 2;
  const rx = cx + gapX / 2;
  el.push(...figure(28, lx, y, 130 * s, WHITE, 0.62));
  el.push(...figure(42, rx, y, 130 * s, ORANGE));
  el.push(`<line x1="${cx.toFixed(1)}" y1="${(y - 92 * s).toFixed(1)}" x2="${cx.toFixed(1)}" y2="${(y + 4 * s).toFixed(1)}" stroke="${WHITE}" stroke-width="1" opacity="0.14"/>`);
  const labels = [['CIM · EBITDA MARGIN', '“PRICING POWER”'], ['OF MARGIN EXPANSION FROM', 'ONE-TIME REBATES']];
  const ls = Math.min(...labels.flat().map((t) => fitTracked(F.mono, t, 14 * s, 0.2, gapX - 30 * s)));
  labels.forEach((pair, i) => pair.forEach((t, j) =>
    el.push(...midTracked(F.mono, t, i ? rx : lx, y + 44 * s + j * ls * 1.7, ls, ls * 0.2, WHITE, i ? 0.75 : 0.55))));
  y += 44 * s + ls * 1.7;
  y += 34 * s;
  el.push(...midTracked(F.mono, 'REBATES EXPIRE WITHIN NINE MONTHS', rx, y, ls, ls * 0.2, ORANGE, 0.9));

  y += 120 * s * spread;
  el.push(rule(cx, y - 50 * s, s));
  y = caption(el, ['A language model reconciles the two.', 'It does not throw an error.'], cx, y, s, inner);
  y += 62 * s * spread;
  el.push(...footer('ILLUSTRATIVE · CONSTRUCTED EXAMPLE, NOT A REAL DEAL', cx, y, s, inner));
  return { el, height: y };
}

// ---------------------------------------------------------------------------
// Card — the Alpha Tier
// ---------------------------------------------------------------------------
function cardAlpha(cx, s, inner, spread) {
  const el = [];
  let y = cardHead(el, cx, s, spread, '// THE PE AI ALPHA TIER', GREEN_TEXT);

  y += 180 * s * spread;
  const colW = inner / 3;
  ALPHA.forEach((a, i) => {
    const x = cx - inner / 2 + colW * (i + 0.5);
    el.push(mid(F.light, a.value, x, y, 110 * s, GREEN_TEXT));
    const ls = fitTracked(F.mono, a.label, 17 * s, 0.2, colW - 20 * s);
    el.push(...midTracked(F.mono, a.label, x, y + 50 * s, ls, ls * 0.2, WHITE, 0.66));
  });
  y += 50 * s;
  y += 44 * s;
  el.push(...midTracked(F.mono, 'VS. PEERS', cx, y, 15 * s, 3.4 * s, WHITE, 0.45));

  y += 120 * s * spread;
  el.push(rule(cx, y - 50 * s, s, GREEN));
  const q = ['Spending is broadly similar across tiers.', '“It is not how much they invest in AI.', 'It is where and how they deploy it.”'];
  const qSize = fit(F.serifIt, q, 30 * s, inner);
  q.forEach((line, i) => el.push(mid(F.serifIt, line, cx, y + i * qSize * 1.42 + (i ? 14 * s : 0), qSize, WHITE, i ? 0.86 : 0.55)));
  y += 2 * qSize * 1.42 + 14 * s;
  y += 46 * s;
  el.push(...midTracked(F.monoMed, '— FTI CONSULTING', cx, y, 14 * s, 3 * s, WHITE, 0.5));

  y += 70 * s * spread;
  el.push(...footer(SOURCE, cx, y, s, inner));
  return { el, height: y };
}

// ---------------------------------------------------------------------------
// Quote cards — the article's own lines
// ---------------------------------------------------------------------------
function quoteCard(eyebrow, first, second, color = ORANGE) {
  return (cx, s, inner, spread) => {
    const el = [];
    let y = cardHead(el, cx, s, spread, eyebrow);
    y += 132 * s * spread;
    const qSize = fit(F.light, [...first, ...second], 62 * s, inner);
    first.forEach((line, i) => el.push(mid(F.light, line, cx, y + i * qSize * 1.2, qSize, WHITE, 0.96)));
    y += first.length * qSize * 1.2 + 24 * s * spread;
    second.forEach((line, i) => el.push(mid(F.light, line, cx, y + i * qSize * 1.2, qSize, color)));
    y += (second.length - 1) * qSize * 1.2;

    y += 100 * s * spread;
    el.push(rule(cx, y - 46 * s, s, WHITE));
    el.push(...footer(FOOTER, cx, y, s, inner));
    return { el, height: y };
  };
}

const cardFluency = quoteCard('// WHY FLUENCY FAILS',
  ['In preliminary research,', 'fluency is an asset.'],
  ['In diligence,', 'it is a liability.']);
const cardClosing = quoteCard('// THE NEXT GENERATION',
  ['The first generation', 'organized data.', 'The second summarized text.'],
  ['The funds that pull ahead', 'will verify judgment.'], GREEN_TEXT);

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
  return svg;
}

// ---------------------------------------------------------------------------
// LinkedIn document carousel — 4:5 pages, vector, one PDF.
//
// PDF /Title and /Author are stamped by incremental update, and Chrome's own
// timestamps normalised, so a rebuild is byte-identical (same approach and
// reasoning as generate-exec-brief-ja.mjs). LinkedIn shows /Title nowhere, but
// the file is downloadable from the post and gets forwarded.
// ---------------------------------------------------------------------------
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

// In carousel order.
const CARDS = [
  { id: 'paradox', title: 'Both Numbers Are True', layout: cardParadox },
  { id: 'target', title: 'How Can 95% Be Satisfied?', layout: cardTarget },
  { id: 'deal-activity', title: 'Where Adoption Collapses', layout: cardDealActivity },
  { id: 'rebate', title: 'The CIM Says Pricing Power', layout: cardRebate },
  { id: 'fluency', title: 'Why Fluency Fails', layout: cardFluency },
  { id: 'barriers', title: 'Top Barriers to Scaling AI', layout: cardBarriers },
  { id: 'governance', title: 'What the Fund Keeps', layout: cardGovernance },
  { id: 'alpha', title: 'The PE AI Alpha Tier', layout: cardAlpha },
  { id: 'closing', title: 'The Funds That Verify Judgment', layout: cardClosing },
];

async function main() {
  console.log(`=== ${TITLE} ===\n`);
  const T = `${TITLE} — askOdin`;

  console.log('banners/');
  // Social OG — LinkedIn and X link previews read 1200x630.
  await emit(BANNER_DIR, `askOdin-${SLUG}-og`, 1200, 630, svgFor(T, 1200, 630, bannerLandscape(1200, 630)));
  // Substack post body, uncropped.
  await emit(BANNER_DIR, `askOdin-substack-${SLUG}-hero`, 1600, 900, svgFor(T, 1600, 900, bannerLandscape(1600, 900)));
  // Substack share frame, with clear ground top and bottom for platform crops.
  await emit(BANNER_DIR, `askOdin-substack-${SLUG}-og`, 1456, 1048,
    svgFor(T, 1456, 1048, frame(1456, 1048, bannerStacked, { s: 0.7, margin: 200, target: 0.82 })));
  // X in-feed image post, 4:5.
  const cover = await emit(BANNER_DIR, `askOdin-${SLUG}-x-mobile`, 1080, 1350,
    svgFor(T, 1080, 1350, frame(1080, 1350, bannerStacked, { s: 1.0, margin: 90, target: 0.78 })));
  // LinkedIn in-feed image post, 1:1.
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

  // Cover, then every card in order.
  await carouselPdf([cover, ...portrait], 1080, 1350, path.join(CARD_DIR, `askOdin-${SLUG}-linkedin-carousel.pdf`), T);
  console.log(`\nWrote ${ASSET_DIR}/`);
}

main().catch((err) => { console.error(err); process.exit(1); });
