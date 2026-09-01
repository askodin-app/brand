import opentype from 'opentype.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Data cards for "Faking Judgment Is Easy. Making It Verifiable Is Hard."
// Figures taken from src/content/insights/faking-judgment-is-easy.mdx in
// askodin-coming-soon. If the article's numbers are ever restated, they must be
// restated here too — these cards travel without the article attached, so a
// stale figure on a card is a claim nobody can trace back.
// ---------------------------------------------------------------------------

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
const DARK = '#111119';
const WHITE = '#FFFFFF';
const WATCH = '#F9A825';

// Same publication folder as generate-faking-judgment.mjs — banners and data
// cards for one article ship together.
const ASSET_DIR = './output/social/20260901-faking-judgment-is-easy';
const PNG_DIR = path.join(ASSET_DIR, 'cards');
const SVG_DIR = path.join(ASSET_DIR, 'svg');
for (const d of [PNG_DIR, SVG_DIR]) fs.mkdirSync(d, { recursive: true });

const REF_W = 1200;

// --- text primitives (shared vocabulary with generate-faking-judgment.mjs) ---
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

// Repeated rows (bars, ladder rungs) should stay visually grouped even when the
// fit solver opens the layout up. Damping keeps the extra height in the section
// breaks rather than pushing sibling rows apart into an unrelated list.
const damp = (spread, k) => 1 + (spread - 1) * k;

function fit(f, lines, size, maxW) {
  while (size > 10 && lines.some((l) => width(f, l, size) > maxW)) size -= 1;
  return size;
}

// --- backdrop: identical system to the headline banners --------------------
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

function wordmark(cx, y, size) {
  const askW = width(F.semi, 'ask', size);
  const x = cx - (askW + width(F.semi, 'Odin', size)) / 2;
  return [
    `<path d="${pathOf(F.semi, 'ask', x, y, size)}" fill="${ORANGE}"/>`,
    `<path d="${pathOf(F.semi, 'Odin', x + askW, y, size)}" fill="${GREEN}"/>`,
  ];
}

// Mono kicker in the accent colour — the eyebrow register used across the site.
const eyebrow = (t, cx, y, s, accent) => midTracked(F.monoMed, t, cx, y, 18 * s, 5 * s, accent, 0.9);

// Source line every data card carries. A number without its denominator is the
// thing this article is complaining about.
const SOURCE = '2,488 DECKS · ONE ENGINE VERSION · 21 FEB – 19 MAR 2026';
const source = (cx, y, s) => midTracked(F.mono, SOURCE, cx, y, 14 * s, 2.6 * s, WHITE, 0.34);

// ---------------------------------------------------------------------------
// Card A — The Asymmetry
//
// All four sections, not just the extremes. The two-bar version loses the
// gradient, and the gradient is what makes the 3.7x spread land as a property
// of the whole document rather than a cherry-picked pair.
// ---------------------------------------------------------------------------
const SECTIONS = [
  { label: 'Business Model Physics', pct: 67.0, color: ORANGE, op: 1 },
  { label: 'Deal Structure', pct: 57.8, color: WATCH, op: 0.75 },
  { label: 'Solution Logic', pct: 24.3, color: WHITE, op: 0.34 },
  { label: 'Problem Definition', pct: 17.9, color: GREEN, op: 1 },
];

function cardAsymmetry(cx, s, inner, spread) {
  const el = [];
  const L = cx - inner / 2;
  const R = cx + inner / 2;
  let y = 0;

  el.push(...wordmark(cx, (y += 30 * s), 30 * s));
  y += 52 * s * spread;
  el.push(...eyebrow('// WHERE DECKS BREAK', cx, y, s, ORANGE));

  y += 62 * s * spread;
  const hSize = fit(F.light, ['Decks scoring below', 'half marks, by section'], 52 * s, inner);
  el.push(mid(F.light, 'Decks scoring below', cx, y, hSize, WHITE, 0.96));
  y += hSize * 1.2;
  el.push(mid(F.light, 'half marks, by section', cx, y, hSize, WHITE, 0.96));

  // Bars scale against 70% so the longest bar stops short of the margin — a
  // full-bleed bar reads as 100% to someone skimming.
  y += 78 * s * spread;
  const barH = 15 * s;
  const gap = 74 * s * damp(spread, 0.4);
  for (const sec of SECTIONS) {
    const w = (sec.pct / 70) * inner;
    el.push(at(F.med, sec.label, L, y, 27 * s, WHITE, 0.82));
    el.push(right(F.monoMed, `${sec.pct.toFixed(1)}%`, R, y, 30 * s, sec.color, sec.op < 0.5 ? 0.6 : 1));
    const by = y + 17 * s;
    el.push(`<rect x="${L.toFixed(1)}" y="${by.toFixed(1)}" width="${inner.toFixed(1)}" height="${barH.toFixed(1)}" fill="${WHITE}" opacity="0.05"/>`);
    el.push(`<rect x="${L.toFixed(1)}" y="${by.toFixed(1)}" width="${w.toFixed(1)}" height="${barH.toFixed(1)}" fill="${sec.color}" opacity="${sec.op}"/>`);
    y += gap;
  }
  y -= gap;

  // The spread is the finding — set it as a statement, not a chart annotation.
  y += 86 * s * spread;
  el.push(`<line x1="${L.toFixed(1)}" y1="${(y - 44 * s).toFixed(1)}" x2="${R.toFixed(1)}" y2="${(y - 44 * s).toFixed(1)}" stroke="${WHITE}" stroke-width="1" opacity="0.1"/>`);
  const kSize = fit(F.serifIt, ['A 3.7× spread between the weakest and', 'strongest section of the same document.'], 27 * s, inner);
  el.push(mid(F.serifIt, 'A 3.7× spread between the weakest and', cx, y, kSize, WHITE, 0.74));
  y += kSize * 1.4;
  el.push(mid(F.serifIt, 'strongest section of the same document.', cx, y, kSize, WHITE, 0.74));

  y += 56 * s * spread;
  el.push(...source(cx, y, s));
  return { el, height: y };
}

// ---------------------------------------------------------------------------
// Card B — The Median
//
// A numeral, not a gauge. ScoreGauge is right in-article at full column width;
// at social thumbnail size an arc reads as decoration and the number does not
// survive the downscale.
// ---------------------------------------------------------------------------
function cardMedian(cx, s, inner, spread) {
  const el = [];
  const L = cx - inner / 2;
  let y = 0;

  el.push(...wordmark(cx, (y += 30 * s), 30 * s));
  y += 52 * s * spread;
  el.push(...eyebrow('// MEDIAN CLARITY SCORE', cx, y, s, GREEN));

  // Numeral + /100 set on a shared baseline, optically centred as one unit.
  y += 190 * s * spread;
  const nSize = 240 * s;
  const dSize = 62 * s;
  const nW = width(F.light, '35', nSize);
  const dW = width(F.light, '/100', dSize);
  const nX = cx - (nW + 14 * s + dW) / 2;
  el.push(at(F.light, '35', nX, y, nSize, WHITE, 0.97));
  el.push(at(F.light, '/100', nX + nW + 14 * s, y, dSize, WHITE, 0.4));

  // Scale track: 0–100 with the investment-grade threshold marked. The gap
  // between the fill and the threshold is the whole point of the graphic.
  y += 78 * s * spread;
  const tH = 16 * s;
  const g60 = L + inner * 0.6;
  el.push(`<rect x="${L.toFixed(1)}" y="${y.toFixed(1)}" width="${inner.toFixed(1)}" height="${tH.toFixed(1)}" fill="${WHITE}" opacity="0.06"/>`);
  el.push(`<rect x="${L.toFixed(1)}" y="${y.toFixed(1)}" width="${(inner * 0.35).toFixed(1)}" height="${tH.toFixed(1)}" fill="${ORANGE}"/>`);
  el.push(`<line x1="${g60.toFixed(1)}" y1="${(y - 16 * s).toFixed(1)}" x2="${g60.toFixed(1)}" y2="${(y + tH + 16 * s).toFixed(1)}" stroke="${GREEN}" stroke-width="${(2.5 * s).toFixed(1)}"/>`);
  el.push(...tracked(F.mono, 'SEED INVESTMENT GRADE · 60', g60 + 16 * s, y + tH + 34 * s, 15 * s, 2.4 * s, GREEN, 0.95));

  y += 118 * s * spread;
  const kSize = fit(F.light, ['70.0% of decks fell below 60.'], 42 * s, inner);
  el.push(mid(F.light, '70.0% of decks fell below 60.', cx, y, kSize, WHITE, 0.94));

  y += 60 * s * spread;
  el.push(...source(cx, y, s));
  return { el, height: y };
}

// ---------------------------------------------------------------------------
// Card C — The Standards Ladder
//
// Keeps "each firm's private convention" rather than collapsing to "a memo".
// The private-convention half is the actual indictment; the memo is the punchline.
// ---------------------------------------------------------------------------
const LADDER = [
  { domain: 'Financial reporting', std: 'GAAP', missing: false },
  { domain: 'Audit', std: 'PCAOB', missing: false },
  { domain: 'Cybersecurity', std: 'SOC 2', missing: false },
  { domain: 'Investment judgment', std: 'a memo', missing: true },
];

function cardLadder(cx, s, inner, spread) {
  const el = [];
  const L = cx - inner / 2;
  const R = cx + inner / 2;
  let y = 0;

  el.push(...wordmark(cx, (y += 30 * s), 30 * s));
  y += 52 * s * spread;
  el.push(...eyebrow('// THE MISSING STANDARD', cx, y, s, GREEN));

  y += 96 * s * spread;
  const rowGap = 96 * s * damp(spread, 0.28);
  const dSize = fit(F.med, LADDER.map((r) => r.domain), 36 * s, inner * 0.56);
  for (const row of LADDER) {
    const accent = row.missing ? ORANGE : WHITE;
    el.push(at(F.med, row.domain, L, y, dSize, WHITE, row.missing ? 0.94 : 0.62));
    el.push(right(F.monoMed, row.std, R, y, dSize * 0.94, accent, row.missing ? 1 : 0.9));
    // Leader rule sits on the baseline between the two columns.
    const lx1 = L + width(F.med, row.domain, dSize) + 22 * s;
    const lx2 = R - width(F.monoMed, row.std, dSize * 0.94) - 22 * s;
    if (lx2 > lx1) {
      el.push(`<line x1="${lx1.toFixed(1)}" y1="${(y - 10 * s).toFixed(1)}" x2="${lx2.toFixed(1)}" y2="${(y - 10 * s).toFixed(1)}" stroke="${row.missing ? ORANGE : WHITE}" stroke-width="1" opacity="${row.missing ? 0.4 : 0.13}" stroke-dasharray="${(3 * s).toFixed(1)} ${(7 * s).toFixed(1)}"/>`);
    }
    y += rowGap;
  }
  y -= rowGap;

  y += 100 * s * spread;
  el.push(`<line x1="${(cx - 44 * s).toFixed(1)}" y1="${(y - 46 * s).toFixed(1)}" x2="${(cx + 44 * s).toFixed(1)}" y2="${(y - 46 * s).toFixed(1)}" stroke="${ORANGE}" stroke-width="${(3 * s).toFixed(1)}"/>`);
  const kSize = fit(F.light, ['Venture capital is the last', 'unaudited asset class.'], 46 * s, inner);
  el.push(mid(F.light, 'Venture capital is the last', cx, y, kSize, WHITE, 0.96));
  y += kSize * 1.2;
  el.push(mid(F.light, 'unaudited asset class.', cx, y, kSize, WHITE, 0.96));

  y += 58 * s * spread;
  el.push(...midTracked(F.mono, 'ASKODIN.APP', cx, y, 15 * s, 4 * s, WHITE, 0.34));
  return { el, height: y };
}

// ---------------------------------------------------------------------------
// Card D — Score Zero
//
// The one the ranked list said to skip. Kept because "Score: 0. Do Not Proceed."
// is already brand vocabulary, and because the disclosure — zeros retained, not
// dropped — is the credibility move the article is built on.
// ---------------------------------------------------------------------------
function cardZero(cx, s, inner, spread) {
  const el = [];
  let y = 0;

  el.push(...wordmark(cx, (y += 30 * s), 30 * s));
  y += 52 * s * spread;
  el.push(...eyebrow('// TERMINAL FINDING', cx, y, s, ORANGE));

  y += 190 * s * spread;
  el.push(mid(F.light, '31.7%', cx, y, fit(F.light, ['31.7%'], 210 * s, inner), ORANGE, 0.97));

  y += 84 * s * spread;
  const kSize = fit(F.light, ['scored exactly zero.'], 52 * s, inner);
  el.push(mid(F.light, 'scored exactly zero.', cx, y, kSize, WHITE, 0.96));

  y += 74 * s * spread;
  el.push(`<line x1="${(cx - 44 * s).toFixed(1)}" y1="${(y - 40 * s).toFixed(1)}" x2="${(cx + 44 * s).toFixed(1)}" y2="${(y - 40 * s).toFixed(1)}" stroke="${ORANGE}" stroke-width="${(3 * s).toFixed(1)}"/>`);
  const caption = ['A zero is a terminal structural finding,', 'not a missing value. Kept in the median.'];
  const cSize = fit(F.serifIt, caption, 27 * s, inner);
  caption.forEach((line, i) => el.push(mid(F.serifIt, line, cx, y + i * cSize * 1.4, cSize, WHITE, 0.74)));
  y += (caption.length - 1) * cSize * 1.4;

  y += 60 * s * spread;
  el.push(...source(cx, y, s));
  return { el, height: y };
}

// ---------------------------------------------------------------------------
// Card E — Pull quote
//
// The self-demonstrating line. Set in Light sans rather than serif italic: this
// is the article speaking in its own voice, not quoting a source.
// ---------------------------------------------------------------------------
const QUOTE = ['This is what a verifiable', 'claim costs: you publish', 'the thing that makes your', 'own figure look worse.'];

function cardQuote(cx, s, inner, spread) {
  const el = [];
  let y = 0;

  el.push(...wordmark(cx, (y += 30 * s), 30 * s));
  y += 52 * s * spread;
  el.push(...eyebrow('// ON PUBLISHING THE ZEROS', cx, y, s, ORANGE));

  y += 130 * s * spread;
  const qSize = fit(F.light, QUOTE, 68 * s, inner);
  QUOTE.forEach((line, i) => el.push(mid(F.light, line, cx, y + i * qSize * 1.2, qSize, WHITE, 0.96)));
  y += (QUOTE.length - 1) * qSize * 1.2;

  y += 92 * s * spread;
  el.push(`<line x1="${(cx - 44 * s).toFixed(1)}" y1="${(y - 44 * s).toFixed(1)}" x2="${(cx + 44 * s).toFixed(1)}" y2="${(y - 44 * s).toFixed(1)}" stroke="${ORANGE}" stroke-width="${(3 * s).toFixed(1)}"/>`);
  el.push(...midTracked(F.mono, 'FAKING JUDGMENT IS EASY · ASKODIN.APP', cx, y, 15 * s, 3 * s, WHITE, 0.38));
  return { el, height: y };
}

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------
// Each card has a different amount of content, so a hand-tuned `spread` per
// crop would need retuning every time a line of copy changes. Instead: solve
// for the spread that makes the block fill `target` of the canvas height.
// Height is monotonic in spread, so bisection converges.
function solveSpread(layout, cx, s, inner, want) {
  let lo = 0.55, hi = 3.6;
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
  const ty = (H - height) / 2 - 6 * s;
  return [...backdrop(W, H), `<g transform="translate(0 ${ty.toFixed(1)})">`, ...el, `</g>`];
}

const svgFor = (title, W, H, el) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <title>${title}</title>
  ${el.join('\n  ')}
</svg>`;

async function emit(name, W, H, svg) {
  const file = path.join(SVG_DIR, `${name}.svg`);
  fs.writeFileSync(file, svg);
  const buf = fs.readFileSync(file);
  await sharp(buf, { density: 300 }).resize(W, H, { fit: 'fill' }).png().toFile(path.join(PNG_DIR, `${name}.png`));
  await sharp(buf, { density: 300 }).resize(W * 2, H * 2, { fit: 'fill' }).png().toFile(path.join(PNG_DIR, `${name}-2x.png`));
  console.log(`  ${name}: ${W}x${H} + @2x`);
}

// Two crops only. 4:5 is the tallest ratio X shows uncropped in-timeline; 1:1
// serves the LinkedIn feed and a Substack Note. 16:9 is deliberately absent —
// it is the worst-performing ratio on a phone feed.
const CROPS = [
  { suffix: 'x-mobile', W: 1080, H: 1350, s: 0.92, margin: 96, target: 0.74 },
  { suffix: 'square', W: 1200, H: 1200, s: 1.0, margin: 110, target: 0.78 },
];

const CARDS = [
  { id: 'asymmetry', title: 'Where Decks Break', layout: cardAsymmetry },
  { id: 'median', title: 'Median Clarity Score 35/100', layout: cardMedian },
  { id: 'ladder', title: 'The Missing Standard', layout: cardLadder },
  { id: 'zero', title: '31.7% Scored Exactly Zero', layout: cardZero },
  { id: 'quote', title: 'What a Verifiable Claim Costs', layout: cardQuote },
];

async function main() {
  console.log('=== Faking Judgment — data & quote cards ===\n');
  for (const card of CARDS) {
    console.log(card.title);
    for (const c of CROPS) {
      const el = frame(c.W, c.H, card.layout, c);
      await emit(`askOdin-fj-${card.id}-${c.suffix}`, c.W, c.H, svgFor(`${card.title} — askOdin`, c.W, c.H, el));
    }
  }
}

main().catch(console.error);
