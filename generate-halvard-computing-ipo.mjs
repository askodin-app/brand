import opentype from 'opentype.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// "The Halvard Dilemma: Anatomy of a Synthetic AI Neo-Cloud IPO"
// https://askodin.app/research/halvard-computing-ipo/ (pubDate 2026-10-26)
//
// Every figure below is taken from src/content/research/halvard-computing-ipo.mdx
// in askodin-coming-soon (the Clarity run of 12 Oct 2026, RUNE v4.3). If the
// article restates a number, restate it here in the same change — the figures
// travel without the article attached.
//
// Two families, one folder:
//   banners/  the article's identity — OG, Substack hero + share frame, X 4:5,
//             LinkedIn 1:1. Title, subtitle and the score, nothing else.
//   cards/    in-article figures for Substack, which has no table block: the
//             audit at a glance, the pillar table with the score's fall, the
//             funding gap, and the four findings. 1456 wide (Substack's 2x
//             column), height set by content.
//
// The site's own OG and hero for this page are drawn by
// askodin-coming-soon/scripts/generate-halvard-images.mjs. The funding-gap
// figure here uses the same bars, scale and labels, so a reader who meets both
// sees one chart, not two.
// ─────────────────────────────────────────────────────────────────────────────

const F = {
  light: opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-Light.ttf'),
  reg: opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-Regular.ttf'),
  med: opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-Medium.ttf'),
  semi: opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-SemiBold.ttf'),
  mono: opentype.loadSync('./fonts/IBM_Plex_Mono/IBMPlexMono-Regular.ttf'),
  monoMed: opentype.loadSync('./fonts/IBM_Plex_Mono/IBMPlexMono-Medium.ttf'),
  serifIt: opentype.loadSync('./fonts/IBM_Plex_Serif/IBMPlexSerif-Italic.ttf'),
};

const ORANGE = '#DB4A2B';
const GREEN = '#147B58';
const GREEN_TEXT = '#2FA37A';
const DARK = '#111119';
const SURFACE = '#1A1A2E';
const WHITE = '#FFFFFF';
const MUTED = '#8899AA';
const KILL = '#C62828';
const WATCH = '#F9A825';

const ASSET_DIR = './output/social/20261026-halvard-computing-ipo';
const BANNER_DIR = path.join(ASSET_DIR, 'banners');
const CARD_DIR = path.join(ASSET_DIR, 'cards');
const SVG_DIR = path.join(ASSET_DIR, 'svg');
for (const d of [BANNER_DIR, CARD_DIR, SVG_DIR]) fs.mkdirSync(d, { recursive: true });

// ---------------------------------------------------------------------------
// Copy and figures
// ---------------------------------------------------------------------------
const HEADLINE = ['The Halvard', 'Dilemma'];
const STANDFIRST = ['Anatomy of a synthetic', 'AI neo-cloud IPO.'];
const EYEBROW = '// FORENSIC CASE STUDY · SYNTHETIC IPO';
const URL = 'ASKODIN.APP/RESEARCH';

// The denominator every figure carries: what was scored, by what, when — and
// that none of it is real.
const SOURCE = 'SYNTHETIC 15-FILE DATA ROOM · ASKODIN CLARITY · RUNE v4.3 · RUN 12 OCT 2026 · ALL ENTITIES FICTIONAL';

const PILLARS = [
  { label: 'Problem Definition', score: 15, findings: 'none' },
  { label: 'Solution Logic', score: 12, findings: 'Unfunded capex programme · Operating capacity' },
  { label: 'Market Evidence', score: 6, findings: '“Contracted” pipeline' },
  { label: 'Business Model Physics', score: 5, findings: 'Vendor financing' },
  { label: 'Deal Structure', score: 5, findings: 'none' },
];
const PRESENTATION = 43;
const PENALTY = 20;
if (PILLARS.reduce((a, p) => a + p.score, 0) !== PRESENTATION) throw new Error('Pillars no longer sum to 43 — check the article');

const CAPEX = 28.89;   // slide 9, FY26–FY28
const CAPITAL = 24.1;  // slide 10, "fully funded"

const SEVERITY = { Critical: KILL, Major: WATCH, Minor: MUTED };

// [severity, title, [ref, claim lines], [ref, contradiction lines]]
const FINDINGS = [
  ['Critical', 'The “fully funded” build is US$4.8bn short',
    ['SLIDE 10', ['Capital sources of ~US$24.1bn “fully fund” the build through FY28']],
    ['SLIDE 9', ['FY26–FY28 capex of US$28.89bn']]],
  ['Critical', '“Contracted” revenue is not all contracted',
    ['SLIDES 2, 5', ['US$14.4bn of “contracted revenue”']],
    ['FOOTNOTE 1', ['Includes non-binding heads of agreement and', '“partner-supported offtake programmes”']]],
  ['Major', 'The vendor financing runs in reverse',
    ['SLIDE 7', ['~US$10bn of Aurelion credit support, so hardware', 'deploys “without full upfront purchase”']],
    ['SLIDE 13', ['62% of the IPO’s primary raise goes to Aurelion', 'for accelerators for Bintan Phase 1']]],
  ['Minor', 'The megawatts do not add up',
    ['SLIDE 6', ['48 MW operating: 12 MW Glen Esk, 36 MW Sydney']],
    ['SLIDE 9', ['0 MW energised end FY25A · 30 MW end FY26A']]],
];

// ---------------------------------------------------------------------------
// Text primitives (shared vocabulary with generate-how-theranos-would-have-scored.mjs)
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
const right = (f, t, rx, y, size, fill, op = 1) => at(f, t, rx - width(f, t, size), y, size, fill, op);

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

// Hand-broken lines must fit their column; throw rather than spill, so a copy
// edit fails loudly.
function fitLine(f, line, size, maxW) {
  const w = width(f, line, size);
  if (w > maxW) throw new Error(`"${line}" is ${w.toFixed(0)}px at ${size}px — column is ${maxW.toFixed(0)}px. Re-break it.`);
}

const rule = (cx, y, s, color = ORANGE) =>
  `<line x1="${(cx - 44 * s).toFixed(1)}" y1="${y.toFixed(1)}" x2="${(cx + 44 * s).toFixed(1)}" y2="${y.toFixed(1)}" stroke="${color}" stroke-width="${(3 * s).toFixed(1)}"/>`;

const damp = (spread, k) => 1 + (spread - 1) * k;

// ---------------------------------------------------------------------------
// House chrome
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

function score(cx, y, s, nSize = 250) {
  const n = nSize * s;
  const d = n * 0.24;
  const gap = n * 0.05;
  const nW = width(F.light, '0', n);
  const x = cx - (nW + gap + width(F.light, '/100', d)) / 2;
  return [at(F.light, '0', x, y, n, ORANGE), at(F.light, '/100', x + nW + gap, y, d, WHITE, 0.42)];
}

// Kill Shot marker: semantic red as a small square, never as red type — red on
// this ground drops below legible contrast at feed size.
function killTag(cx, y, s, text = 'KILL SHOT') {
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
  el.push(...tracked(F.monoMed, EYEBROW, L, Y(196), 15 * k, 3.6 * k, ORANGE, 0.95));

  const hSize = fit(F.light, HEADLINE, 74 * k, colW);
  HEADLINE.forEach((line, i) => el.push(at(F.light, line, L, Y(280) + i * hSize * 1.1, hSize, WHITE, 0.96)));

  el.push(`<line x1="${L.toFixed(1)}" y1="${Y(388).toFixed(1)}" x2="${(L + X(64)).toFixed(1)}" y2="${Y(388).toFixed(1)}" stroke="${ORANGE}" stroke-width="${(3 * k).toFixed(1)}"/>`);

  const sSize = fit(F.serifIt, STANDFIRST, 27 * k, colW);
  STANDFIRST.forEach((line, i) => el.push(at(F.serifIt, line, L, Y(440) + i * sSize * 1.45, sSize, WHITE, 0.72)));

  el.push(...tracked(F.mono, URL, L, Y(548), 14 * k, 3.6 * k, WHITE, 0.4));

  const divX = X(768);
  el.push(`<line x1="${divX.toFixed(1)}" y1="${Y(150).toFixed(1)}" x2="${divX.toFixed(1)}" y2="${Y(530).toFixed(1)}" stroke="${WHITE}" stroke-width="1" opacity="0.12"/>`);
  const rcx = X(986);
  el.push(...midTracked(F.monoMed, 'CLARITY SCORE', rcx, Y(196), 16 * k, 4.2 * k, WHITE, 0.55));
  el.push(...score(rcx, Y(424), k, 250));
  el.push(...killTag(rcx, Y(490), k * 0.92));
  el.push(...midTracked(F.mono, 'NARRATIVE MASKING', rcx, Y(524), 14 * k, 3.4 * k, WHITE, 0.42));
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
  const eSize = fitTracked(F.monoMed, EYEBROW, 18 * s, 0.25, inner);
  el.push(...midTracked(F.monoMed, EYEBROW, cx, y, eSize, eSize * 0.25, ORANGE, 0.95));

  y += 100 * s * spread;
  const head = [HEADLINE.join(' ')];
  const hSize = fit(F.light, head, 88 * s, inner);
  el.push(mid(F.light, head[0], cx, y, hSize, WHITE, 0.96));

  y += 250 * s * spread;
  el.push(...score(cx, y, s, 260));

  y += 64 * s * damp(spread, 0.6);
  el.push(...killTag(cx, y, s));
  y += 34 * s;
  el.push(...midTracked(F.mono, 'CLARITY SCORE · NARRATIVE MASKING', cx, y, 15 * s, 3.4 * s, WHITE, 0.42));

  y += 70 * s * spread;
  el.push(rule(cx, y, s));
  y += 58 * s * spread;
  const sub = [STANDFIRST.join(' ')];
  const sSize = fit(F.serifIt, sub, 32 * s, inner);
  el.push(mid(F.serifIt, sub[0], cx, y, sSize, WHITE, 0.74));

  y += 66 * s * spread;
  el.push(...midTracked(F.mono, URL, cx, y, 15 * s, 4 * s, WHITE, 0.4));
  return { el, height: y };
}

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

// ---------------------------------------------------------------------------
// In-article figures — Substack column, 1456 wide
//
// Substack shows images at 728px on desktop, so 1456 is its 2x. Body type at
// 30px lands near 15px on desktop and stays legible on a phone. Each figure
// lays out top-down and returns its own height.
// ---------------------------------------------------------------------------
const FW = 1456;
const FM = 96;
const FR = FW - FM;
const FIN = FR - FM;

const hline = (y, x1 = FM, x2 = FR, op = 0.12) =>
  `<line x1="${x1}" y1="${y.toFixed(1)}" x2="${x2}" y2="${y.toFixed(1)}" stroke="${WHITE}" stroke-width="1" opacity="${op}"/>`;

const square = (x, baseline, size, color) =>
  `<rect x="${x.toFixed(1)}" y="${(baseline - size * 0.74).toFixed(1)}" width="${(size * 0.6).toFixed(1)}" height="${(size * 0.6).toFixed(1)}" rx="2" fill="${color}"/>`;

// Header: wordmark + URL, eyebrow, title. Returns elements and the y below it.
function figureHead(eyebrow, title) {
  const el = [];
  el.push(...wordmarkAt(FM, 104, 28));
  el.push(...tracked(F.mono, URL, FR - trackedW(F.mono, URL, 14, 3.6), 100, 14, 3.6, WHITE, 0.4));
  el.push(...tracked(F.monoMed, eyebrow, FM, 196, 16, 4, ORANGE, 0.95));
  const tSize = fit(F.light, [title], 54, FIN);
  el.push(at(F.light, title, FM, 266, tSize, WHITE, 0.96));
  return { el, y: 266 };
}

function figureFoot(y) {
  const el = [hline(y)];
  const size = fitTracked(F.mono, SOURCE, 14, 0.18, FIN);
  el.push(...tracked(F.mono, SOURCE, FM, y + 52, size, size * 0.18, WHITE, 0.4));
  return { el, h: y + 96 };
}

function figureChrome(h, body) {
  const el = [`<rect width="${FW}" height="${h}" fill="${DARK}"/>`, `<rect width="${FW}" height="6" fill="${ORANGE}"/>`];
  return [...el, ...body];
}

// Figure A — the audit at a glance, as the article's terminal panel.
function glanceFigure() {
  const { el: head, y: y0 } = figureHead('// THE AUDIT AT A GLANCE', 'Halvard Computing IPO');
  const body = [...head];
  const top = y0 + 56;
  const labelX = FM + 36;
  const valX = FM + 420;
  const valW = FR - 36 - valX;
  const ROW = 30;
  const LEAD = 1.5;

  const rows = [
    ['DATA ROOM', ['15 files · 12 PDF, 3 XLSX']],
    ['PRIMARY DOCUMENT', ['01_Investor_Presentation_IPO_Sep2026.pdf'], { mono: true }],
    ['PRESENTATION SCORE', ['43 / 100']],
    ['PENALTY', ['−20 · “fully funded” asserted against', 'the deck’s own capex schedule']],
    ['JUDGE OVERRIDE', ['Narrative Masking · kill shot'], { kill: true }],
    ['CLARITY SCORE', ['0 / 100'], { score: true }],
    ['FINDINGS', null, { severity: true }],
    ['NEXT STEP, AS THE', ['Reject allocation. Flag the “fully funded”', 'assertion to the syndicate desk.'], { label2: 'BRIEF STATES IT' }],
  ];

  const inner = [];
  let y = top + 40;
  // Panel title strip.
  const strip = 'ASKODIN CLARITY · HALVARD COMPUTING IPO · 12 OCT 2026 · RUNE PROTOCOL v4.3';
  const stripSize = fitTracked(F.mono, strip, 15, 0.16, FIN - 72);
  inner.push(...tracked(F.mono, strip, labelX, y + 6, stripSize, stripSize * 0.16, WHITE, 0.5));
  y += 40;
  inner.push(hline(y, FM, FR, 0.14));

  rows.forEach(([label, lines, opt = {}], i) => {
    y += 66;
    inner.push(...tracked(F.mono, label, labelX, y - 4, 15, 2.4, WHITE, 0.5));
    if (opt.label2) inner.push(...tracked(F.mono, opt.label2, labelX, y - 4 + 26, 15, 2.4, WHITE, 0.5));
    if (opt.severity) {
      let x = valX;
      for (const [n, sev] of [[2, 'Critical'], [1, 'Major'], [1, 'Minor']]) {
        const t = `${n} ${sev}`;
        inner.push(square(x, y, ROW, SEVERITY[sev]));
        inner.push(at(F.med, t, x + ROW * 0.95, y, ROW, WHITE, 0.94));
        x += ROW * 0.95 + width(F.med, t, ROW) + 44;
      }
    } else if (opt.score) {
      inner.push(at(F.med, lines[0], valX, y + 8, 46, ORANGE));
      y += 10;
    } else {
      const f = opt.mono ? F.mono : F.med;
      const size = opt.mono ? 26 : ROW;
      lines.forEach((line, j) => {
        fitLine(f, line, size, valW);
        inner.push(at(f, line, valX, y + j * ROW * LEAD, size, opt.kill ? ORANGE : WHITE, opt.kill ? 1 : 0.94));
      });
      if (opt.kill) {
        const kx = valX + width(f, lines[0], size) + 20;
        inner.push(`<rect x="${kx.toFixed(1)}" y="${(y - 20).toFixed(1)}" width="13" height="13" fill="${KILL}"/>`);
      }
      y += (Math.max(lines.length, opt.label2 ? 2 : 1) - 1) * ROW * LEAD;
    }
    y += 26;
    if (i < rows.length - 1) inner.push(hline(y, labelX, FR - 36, 0.07));
  });
  y += 14;

  body.push(`<rect x="${FM}" y="${top}" width="${FIN}" height="${(y - top).toFixed(1)}" rx="10" fill="${SURFACE}" stroke="${WHITE}" stroke-opacity="0.12"/>`);
  body.push(...inner);

  const foot = figureFoot(y + 64);
  return { h: foot.h, svg: figureChrome(foot.h, [...body, ...foot.el]) };
}

// Figure B — the pillar table, then the score's fall from 43 to 0.
function pillarsFigure() {
  const { el: head, y: y0 } = figureHead('// FIVE PILLARS · ONE FLOOR', 'How the score fell');
  const body = [...head];
  const barX = FM + 420;
  const barW = 300;
  const scoreR = barX + barW + 150;
  const findX = scoreR + 50;
  const findW = FR - findX;
  let y = y0 + 96;

  body.push(...tracked(F.mono, 'PILLAR', FM, y, 15, 2.4, WHITE, 0.5));
  body.push(...tracked(F.mono, 'SCORE', scoreR - trackedW(F.mono, 'SCORE', 15, 2.4), y, 15, 2.4, WHITE, 0.5));
  body.push(...tracked(F.mono, 'FINDINGS FILED', findX, y, 15, 2.4, WHITE, 0.5));
  y += 26;
  body.push(hline(y, FM, FR, 0.3));

  for (const p of PILLARS) {
    y += 66;
    body.push(at(F.med, p.label, FM, y, 30, WHITE, 0.92));
    const by = y - 17;
    body.push(`<rect x="${barX}" y="${by}" width="${barW}" height="14" fill="${WHITE}" opacity="0.06"/>`);
    const weak = p.score <= 6;
    body.push(`<rect x="${barX}" y="${by}" width="${(barW * p.score / 20).toFixed(1)}" height="14" fill="${weak ? ORANGE : WHITE}" opacity="${weak ? 1 : 0.4}"/>`);
    body.push(right(F.monoMed, `${p.score} / 20`, scoreR, y, 28, weak ? ORANGE : WHITE, weak ? 1 : 0.8));
    const lines = p.findings.length > 30 ? p.findings.split(' · ') : [p.findings];
    lines.forEach((line, j) => {
      fitLine(F.reg, line, 26, findW);
      body.push(at(F.reg, line, findX, y + j * 36, 26, WHITE, p.findings === 'none' ? 0.4 : 0.8));
    });
    y += (lines.length - 1) * 36 + 30;
    body.push(hline(y, FM, FR, 0.08));
  }

  // The fall, left to right: presentation, penalty, where it would have
  // landed, and where JUDGE put it.
  y += 180;
  const steps = [
    { n: String(PRESENTATION), lbl: ['PRESENTATION', 'SCORE'], fill: WHITE, op: 0.92 },
    { n: `−${PENALTY}`, lbl: ['PENALTY ·', '“FULLY FUNDED”'], fill: WHITE, op: 0.92 },
    { n: String(PRESENTATION - PENALTY), lbl: ['WOULD HAVE', 'LANDED AT'], fill: WHITE, op: 0.4 },
    { n: '0', lbl: ['CLARITY SCORE ·', 'JUDGE KILL SHOT'], fill: ORANGE, op: 1, kill: true },
  ];
  const colW = FIN / steps.length;
  steps.forEach((st, i) => {
    const cx = FM + colW * i + colW / 2;
    body.push(mid(F.light, st.n, cx, y, 96, st.fill, st.op));
    st.lbl.forEach((l, j) => body.push(...midTracked(F.mono, l, cx, y + 52 + j * 26, 15, 2.6, WHITE, 0.55)));
    if (i < steps.length - 1) {
      const ax = FM + colW * (i + 1);
      body.push(`<path d="M${ax - 12},${y - 52} l12,12 l-12,12" fill="none" stroke="${WHITE}" stroke-opacity="0.3" stroke-width="2"/>`);
    }
    if (st.kill) body.push(`<rect x="${(cx - 7).toFixed(1)}" y="${y + 104}" width="14" height="14" fill="${KILL}"/>`);
  });
  y += 160;

  const cap = 'A kill shot floors the score to 0, however well the rest of the story is told.';
  const cSize = fit(F.serifIt, [cap], 30, FIN);
  body.push(at(F.serifIt, cap, FM, y + 30, cSize, WHITE, 0.78));

  const foot = figureFoot(y + 90);
  return { h: foot.h, svg: figureChrome(foot.h, [...body, ...foot.el]) };
}

// Figure C — the funding gap. Same bars as the site's OG: one linear scale, so
// the gap reads as length.
function fundingFigure() {
  const { el: head, y: y0 } = figureHead('// CRITICAL · THE FUNDING GAP', 'The “fully funded” build is US$4.8bn short');
  const body = [...head];
  body.push(`<defs><pattern id="hatch" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <rect width="12" height="12" fill="${KILL}" fill-opacity="0.12"/>
    <line x1="0" y1="0" x2="0" y2="12" stroke="${KILL}" stroke-width="3.5" stroke-opacity="0.7"/>
  </pattern></defs>`);

  const max = 30;
  const k = FIN / max;
  const barH = 64;
  const wCapex = CAPEX * k;
  const wCap = CAPITAL * k;
  let y = y0 + 130;

  const barRow = (label, w, value) => {
    body.push(...tracked(F.mono, label, FM, y, 16, 2.6, WHITE, 0.6));
    const by = y + 22;
    body.push(`<path d="M${FM},${by} H${FM + w - 5} Q${FM + w},${by} ${FM + w},${by + 5} V${by + barH - 5} Q${FM + w},${by + barH} ${FM + w - 5},${by + barH} H${FM} Z" fill="#64748B"/>`);
    body.push(right(F.monoMed, value, FM + w - 20, by + barH / 2 + 11, 32, WHITE));
    return by;
  };
  barRow('SLIDE 9 · CAPEX, FY26–FY28', wCapex, 'US$28.89bn');
  y += 170;
  const by2 = barRow('SLIDE 10 · CAPITAL SOURCES, “FULLY FUNDED”', wCap, 'US$24.1bn');
  body.push(`<rect x="${(FM + wCap + 3).toFixed(1)}" y="${by2 + 1}" width="${(wCapex - wCap - 4).toFixed(1)}" height="${barH - 2}" rx="5" fill="url(#hatch)" stroke="${KILL}" stroke-width="2" stroke-dasharray="7 5"/>`);
  // Gap label in white beside a red square, not red type.
  const gy = by2 + barH + 52;
  const gl = '≈US$4.8bn with no stated source';
  const gw = width(F.monoMed, gl, 28);
  const gx = FM + wCapex - gw;
  body.push(`<rect x="${(gx - 30).toFixed(1)}" y="${gy - 20}" width="16" height="16" fill="${KILL}"/>`);
  body.push(at(F.monoMed, gl, gx, gy, 28, WHITE));

  y = gy + 110;
  const cap = ['Two numbers in the same document cannot both be true.'];
  body.push(at(F.serifIt, cap[0], FM, y, fit(F.serifIt, cap, 32, FIN), WHITE, 0.8));
  y += 52;
  body.push(at(F.reg, 'This is the finding the 20-point penalty was charged for.', FM, y, 26, WHITE, 0.55));

  const foot = figureFoot(y + 70);
  return { h: foot.h, svg: figureChrome(foot.h, [...body, ...foot.el]) };
}

// Figure D — the four findings, each as the claim set against what contradicts
// it. The pairs are the argument: every contradiction sits between two pages.
function findingsFigure() {
  const { el: head, y: y0 } = figureHead('// THE FOUR FINDINGS', 'The contradictions sit between the pages');
  const body = [...head];
  const refX = FM + 70;
  const textX = refX + 230;
  const textW = FR - textX;
  const BODY = 28;
  const LEAD = 1.45;
  let y = y0 + 50;

  FINDINGS.forEach(([sev, title, says, against], i) => {
    y += 76;
    body.push(...tracked(F.monoMed, String(i + 1).padStart(2, '0'), FM, y, 20, 2, ORANGE, 0.95));
    body.push(square(refX, y, 24, SEVERITY[sev]));
    const sevLabel = sev.toUpperCase();
    body.push(...tracked(F.monoMed, sevLabel, refX + 26, y - 2, 16, 3, WHITE, 0.7));
    const tx = refX + 26 + trackedW(F.monoMed, 'CRITICAL', 16, 3) + 32;
    fitLine(F.semi, title, 32, FR - tx);
    body.push(at(F.semi, title, tx, y, 32, WHITE, 0.96));

    for (const [kind, [ref, lines]] of [['SAYS', says], ['AGAINST', against]]) {
      y += 56;
      body.push(...tracked(F.mono, ref, refX, y, 16, 2.4, kind === 'SAYS' ? WHITE : ORANGE, kind === 'SAYS' ? 0.55 : 0.95));
      lines.forEach((line, j) => {
        fitLine(F.reg, line, BODY, textW);
        body.push(at(F.reg, line, textX, y + j * BODY * LEAD, BODY, WHITE, kind === 'SAYS' ? 0.7 : 0.94));
      });
      y += (lines.length - 1) * BODY * LEAD;
    }
    y += 40;
    if (i < FINDINGS.length - 1) body.push(hline(y));
  });

  const foot = figureFoot(y + 50);
  return { h: foot.h, svg: figureChrome(foot.h, [...body, ...foot.el]) };
}

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------
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

const FIGURES = [
  { id: 'glance', title: 'The Audit at a Glance', build: glanceFigure },
  { id: 'pillars', title: 'How the Score Fell', build: pillarsFigure },
  { id: 'funding-gap', title: 'The Funding Gap', build: fundingFigure },
  { id: 'findings', title: 'The Four Findings', build: findingsFigure },
];

async function main() {
  console.log('=== The Halvard Dilemma ===\n');
  const TITLE = 'The Halvard Dilemma — askOdin';

  console.log('banners/');
  await emit(BANNER_DIR, 'askOdin-halvard-og', 1200, 630, svgFor(TITLE, 1200, 630, bannerLandscape(1200, 630)));
  await emit(BANNER_DIR, 'askOdin-substack-halvard-hero', 1600, 900, svgFor(TITLE, 1600, 900, bannerLandscape(1600, 900)));
  await emit(BANNER_DIR, 'askOdin-substack-halvard-og', 1456, 1048,
    svgFor(TITLE, 1456, 1048, frame(1456, 1048, bannerStacked, { s: 0.78, margin: 200, target: 0.8 })));
  await emit(BANNER_DIR, 'askOdin-halvard-x-mobile', 1080, 1350,
    svgFor(TITLE, 1080, 1350, frame(1080, 1350, bannerStacked, { s: 1.0, margin: 90, target: 0.78 })));
  await emit(BANNER_DIR, 'askOdin-halvard-linkedin-square', 1200, 1200,
    svgFor(TITLE, 1200, 1200, frame(1200, 1200, bannerStacked, { s: 0.98, margin: 110, target: 0.8 })));

  console.log('\ncards/  (in-article figures; Substack has no table block)');
  for (const fig of FIGURES) {
    const { h, svg } = fig.build();
    await emit(CARD_DIR, `askOdin-halvard-${fig.id}`, FW, Math.round(h), svgFor(`${fig.title} — askOdin`, FW, Math.round(h), svg));
  }
  console.log(`\nWrote ${ASSET_DIR}/`);
}

main().catch((err) => { console.error(err); process.exit(1); });
