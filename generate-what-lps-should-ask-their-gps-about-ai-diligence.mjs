import opentype from 'opentype.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// "What LPs Should Ask Their GPs About AI Diligence" — banners, cards, carousel
// https://askodin.app/insights/what-lps-should-ask-their-gps-about-ai-diligence/ (pubDate 2026-09-28)
//
// Every line of copy below is quoted or condensed from
// src/content/insights/what-lps-should-ask-their-gps-about-ai-diligence.mdx in
// askodin-coming-soon. The one-line "good answer" per question is copied
// verbatim from that repo's src/data/lp-ai-diligence-checklist.json, which also
// drives the checklist on the page — if a question changes there, change it
// here in the same edit.
//
// The site already ships its own 1200x630 OG and a 1080x1350 checklist PNG
// (public/images/articles/what-lps-should-ask-*.png). This set is everything
// else the article needs off-site, in the house banner style:
//
//   banners/  the article's identity — OG, Substack hero + share frame, X 4:5,
//             LinkedIn 1:1. Headline, standfirst, and (landscape) the seven checks.
//   cards/    one claim per card for the X thread / LinkedIn / Substack Notes:
//             the checklist, one card per question (good vs. weak answer), the
//             failure mode, accountability, the ILPA gap, the input benchmark,
//             and the closing line. Plus a LinkedIn document carousel PDF of
//             the 4:5 cover + seven question cards + closing card.
//
// The eyebrow is "// LP CHECKLIST" in green to match the site's OG, so a link
// preview and an in-feed image read as one piece.
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

const SLUG = 'lp-questions';
const ASSET_DIR = './output/social/20260928-what-lps-should-ask-their-gps-about-ai-diligence';
const BANNER_DIR = path.join(ASSET_DIR, 'banners');
const CARD_DIR = path.join(ASSET_DIR, 'cards');
const SVG_DIR = path.join(ASSET_DIR, 'svg');
for (const d of [BANNER_DIR, CARD_DIR, SVG_DIR]) fs.mkdirSync(d, { recursive: true });

// ---------------------------------------------------------------------------
// Copy
// ---------------------------------------------------------------------------
const TITLE = 'What LPs Should Ask Their GPs About AI Diligence';
const HEADLINE = ['What LPs Should Ask', 'Their GPs About', 'AI Diligence'];
// The article's subtitle.
const STANDFIRST = ['Seven questions that separate a defensible', 'process from an expensive summary engine.'];
const EYEBROW = '// LP CHECKLIST';
const URL_LINE = 'ASKODIN.APP/INSIGHTS';
const NO_TECH = 'NONE OF THEM NEEDS A TECHNICAL BACKGROUND';
const FOOTER = 'WHAT LPS SHOULD ASK THEIR GPS · ASKODIN.APP';

// short: the site OG's labels. good: lp-ai-diligence-checklist.json, verbatim.
// weak: the article's "A weak answer" paragraph for each, quoted or condensed.
const QUESTIONS = [
  { short: 'The standard', q: 'What standard does your diligence apply?',
    good: 'It names the tests a claim must pass before anyone relies on it.',
    weak: '“We use AI to be more efficient.” A process, with no standard named.' },
  { short: 'The reasoning', q: 'Can you show me the reasoning behind a conclusion?',
    good: 'Every claim traces to a source document, and contradictions are named.',
    weak: 'A summary with no traceability. The reasoning felt right. The model said so.' },
  { short: 'The failure mode', q: 'What happens when a claim fails the test?',
    good: 'The system flags the violation and stops. It does not smooth it over.',
    weak: '“It summarizes the data room.” Summarization hides contradictions.' },
  { short: 'The data', q: 'Where does the deal data go?',
    good: 'Named subprocessors, a stated retention window, no training, a written policy.',
    weak: '“It’s all secure.” “We use a leading provider.” Vagueness is not a security posture.' },
  { short: 'The accountable partner', q: 'Who is accountable for the output?',
    good: 'A named partner signs off, with the reasoning trail attached.',
    weak: '“The team reviews it.” Nobody named, no signature required.' },
  { short: 'Reproducibility', q: 'Is the verdict reproducible?',
    good: 'Same documents, same verdict, months later.',
    weak: '“A human always makes the final call.” That avoids the question.' },
  { short: 'A real audit', q: 'Can you show me a real audit?',
    good: 'A redacted reasoning trail from the fund’s own pipeline, not a vendor demo.',
    weak: 'An explanation of why they cannot share one.' },
];
if (QUESTIONS.length !== 7) throw new Error('The article asks seven questions');
// The article: "This is the most important question on the list".
const MOST_IMPORTANT = 2;

// "What does the input look like?" — the benchmark figures, with the denominator
// from /research/pitch-deck-clarity-benchmark-2026/.
const BENCH = { n: '2,488', median: 35, pass: 70, bmp: 67 };
const BENCH_FOOTER = 'n = 2,488 DECKS · ONE ENGINE VERSION · SCORED 21 FEB – 19 MAR 2026';

// ---------------------------------------------------------------------------
// Text primitives (shared vocabulary with generate-judgment-infrastructure-vs-xai.mjs)
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

// Greedy word wrap. The question and answer copy is long enough that hand
// breaks would need redoing for every crop.
function wrap(f, text, size, maxW) {
  const lines = [];
  let line = '';
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (line && width(f, next, size) > maxW) { lines.push(line); line = word; } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

// Same line count as the greedy wrap, but the narrowest measure that keeps it,
// so a two-line answer never ends on a one-word widow.
function wrapBalanced(f, text, size, maxW) {
  const n = wrap(f, text, size, maxW).length;
  let lo = maxW * 0.3, hi = maxW;
  for (let i = 0; i < 20; i++) {
    const m = (lo + hi) / 2;
    if (wrap(f, text, size, m).length > n) lo = m; else hi = m;
  }
  return wrap(f, text, size, hi);
}

const rule = (cx, y, s, color = ORANGE) =>
  `<line x1="${(cx - 44 * s).toFixed(1)}" y1="${y.toFixed(1)}" x2="${(cx + 44 * s).toFixed(1)}" y2="${y.toFixed(1)}" stroke="${color}" stroke-width="${(3 * s).toFixed(1)}"/>`;

const hair = (x1, x2, y) =>
  `<line x1="${x1.toFixed(1)}" y1="${y.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${WHITE}" stroke-width="1" opacity="0.12"/>`;

const damp = (spread, k) => 1 + (spread - 1) * k;
const nn = (i) => String(i + 1).padStart(2, '0');

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

// A check box: green outline, green tick. The site's checklist uses the same mark.
function checkBox(x, y, size, color = GREEN_TEXT) {
  const r = size * 0.14;
  const sw = Math.max(1.5, size * 0.085);
  const top = y - size * 0.82;
  return [
    `<rect x="${x.toFixed(1)}" y="${top.toFixed(1)}" width="${size.toFixed(1)}" height="${size.toFixed(1)}" rx="${r.toFixed(1)}" fill="none" stroke="${color}" stroke-width="${sw.toFixed(1)}"/>`,
    `<path d="M${(x + size * 0.24).toFixed(1)} ${(top + size * 0.52).toFixed(1)} L${(x + size * 0.43).toFixed(1)} ${(top + size * 0.72).toFixed(1)} L${(x + size * 0.77).toFixed(1)} ${(top + size * 0.3).toFixed(1)}" fill="none" stroke="${color}" stroke-width="${sw.toFixed(1)}" stroke-linecap="round" stroke-linejoin="round"/>`,
  ];
}

// ---------------------------------------------------------------------------
// Banner — landscape (OG 1200x630, Substack hero 1600x900)
//
// Title left, the seven checks right. Designed on a 1200x630 grid and scaled by
// W; extra height (the hero is 16:9, not 1.91:1) is split above and below.
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

  const hSize = fit(F.light, HEADLINE, 56 * k, colW);
  HEADLINE.forEach((line, i) => el.push(at(F.light, line, L, Y(246) + i * hSize * 1.14, hSize, WHITE, 0.96)));

  const ry = Y(246) + (HEADLINE.length - 1) * hSize * 1.14 + X(42);
  el.push(`<line x1="${L.toFixed(1)}" y1="${ry.toFixed(1)}" x2="${(L + X(64)).toFixed(1)}" y2="${ry.toFixed(1)}" stroke="${ORANGE}" stroke-width="${(3 * k).toFixed(1)}"/>`);

  const sSize = fit(F.serifIt, STANDFIRST, 21 * k, colW);
  STANDFIRST.forEach((line, i) => el.push(at(F.serifIt, line, L, ry + X(48) + i * sSize * 1.45, sSize, WHITE, 0.72)));

  el.push(...tracked(F.mono, URL_LINE, L, Y(560), 14 * k, 3.6 * k, WHITE, 0.4));

  // Right column: the seven checks. A hairline divides it from the title.
  const divX = X(700);
  el.push(`<line x1="${divX.toFixed(1)}" y1="${Y(150).toFixed(1)}" x2="${divX.toFixed(1)}" y2="${Y(540).toFixed(1)}" stroke="${WHITE}" stroke-width="1" opacity="0.12"/>`);
  const RL = X(756);
  const gap = X(52);
  let y = Y(186);
  QUESTIONS.forEach((q, i) => {
    const hot = i === MOST_IMPORTANT;
    el.push(...checkBox(RL, y, 20 * k, hot ? ORANGE : GREEN_TEXT));
    el.push(...tracked(F.monoMed, nn(i), RL + X(38), y, 15 * k, 1.5 * k, hot ? ORANGE : GREEN_TEXT, 1));
    el.push(at(F.med, q.short, RL + X(80), y, 22 * k, WHITE, 0.92));
    y += gap;
  });
  return el;
}

// ---------------------------------------------------------------------------
// Banner — stacked (Substack share 1456x1048, X 4:5, LinkedIn 1:1)
//
// Headline and standfirst only; the checklist lives in the cards.
// ---------------------------------------------------------------------------
function bannerStacked(cx, s, inner, spread) {
  const el = [];
  let y = 0;
  el.push(...wordmark(cx, (y += 32 * s), 32 * s));

  y += 64 * s * spread;
  el.push(...midTracked(F.monoMed, EYEBROW, cx, y, 18 * s, 4.6 * s, GREEN_TEXT, 1));

  y += 110 * s * spread;
  const hSize = fit(F.light, HEADLINE, 80 * s, inner);
  HEADLINE.forEach((line, i) => el.push(mid(F.light, line, cx, y + i * hSize * 1.16, hSize, WHITE, 0.96)));
  y += (HEADLINE.length - 1) * hSize * 1.16;

  y += 80 * s * spread;
  el.push(rule(cx, y, s));
  y += 64 * s * spread;
  const sSize = fit(F.serifIt, STANDFIRST, 31 * s, inner);
  STANDFIRST.forEach((line, i) => el.push(mid(F.serifIt, line, cx, y + i * sSize * 1.42, sSize, WHITE, 0.76)));
  y += (STANDFIRST.length - 1) * sSize * 1.42;

  y += 76 * s * spread;
  const nSize = fitTracked(F.mono, NO_TECH, 15 * s, 0.24, inner);
  el.push(...midTracked(F.mono, NO_TECH, cx, y, nSize, nSize * 0.24, WHITE, 0.5));
  y += 40 * s * damp(spread, 0.5);
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
// Card — the checklist, all seven with the good answer
// ---------------------------------------------------------------------------
function cardChecklist(cx, s, inner, spread) {
  const el = [];
  const L = cx - inner / 2;
  const R = cx + inner / 2;
  let y = cardHead(el, cx, s, spread, '// SEVEN QUESTIONS', GREEN_TEXT);

  y += 92 * s * spread;
  const title = ['Ask your GP about', 'AI diligence.'];
  const tSize = fit(F.light, title, 56 * s, inner);
  title.forEach((line, i) => el.push(mid(F.light, line, cx, y + i * tSize * 1.16, tSize, WHITE, 0.96)));
  y += (title.length - 1) * tSize * 1.16;

  const indent = 64 * s;
  const qSize = fit(F.med, QUESTIONS.map((q) => q.q), 26 * s, inner - indent);
  const gSize = fit(F.serifIt, QUESTIONS.map((q) => q.good), 21 * s, inner - indent);
  const gap = (qSize + gSize * 1.5) + 34 * s * damp(spread, 0.5);

  y += 96 * s * spread;
  QUESTIONS.forEach((q, i) => {
    el.push(hair(L, R, y - qSize * 1.45));
    el.push(...tracked(F.monoMed, nn(i), L, y, 17 * s, 2 * s, i === MOST_IMPORTANT ? ORANGE : GREEN_TEXT, 1));
    el.push(at(F.med, q.q, L + indent, y, qSize, WHITE, 0.94));
    el.push(at(F.serifIt, q.good, L + indent, y + gSize * 1.5, gSize, WHITE, 0.62));
    y += gap;
  });
  y -= gap;

  y += 104 * s * spread;
  el.push(...footer(FOOTER, cx, y, s, inner));
  return { el, height: y };
}

// ---------------------------------------------------------------------------
// Cards — one per question: the question, then a good and a weak answer.
// ---------------------------------------------------------------------------
function answerBlock(el, label, color, text, cx, y, s, inner, op) {
  el.push(...midTracked(F.monoMed, label, cx, y, 16 * s, 4.4 * s, color, 1));
  y += 54 * s;
  const size = 34 * s;
  const lines = wrapBalanced(F.serifIt, text, size, inner * 0.94);
  lines.forEach((line, i) => el.push(mid(F.serifIt, line, cx, y + i * size * 1.4, size, WHITE, op)));
  return y + (lines.length - 1) * size * 1.4;
}

function questionCard(i) {
  const q = QUESTIONS[i];
  const hot = i === MOST_IMPORTANT;
  return (cx, s, inner, spread) => {
    const el = [];
    const eyebrow = hot ? `// ${nn(i)} OF 07 · THE MOST IMPORTANT` : `// QUESTION ${nn(i)} OF 07`;
    let y = cardHead(el, cx, s, spread, eyebrow);

    y += 112 * s * spread;
    const qSize = 66 * s;
    const qLines = wrapBalanced(F.light, q.q, qSize, inner);
    qLines.forEach((line, j) => el.push(mid(F.light, line, cx, y + j * qSize * 1.18, qSize, WHITE, 0.96)));
    y += (qLines.length - 1) * qSize * 1.18;

    y += 72 * s * spread;
    el.push(rule(cx, y, s));

    y += 88 * s * spread;
    y = answerBlock(el, 'A GOOD ANSWER', GREEN_TEXT, q.good, cx, y, s, inner, 0.9);
    y += 88 * s * spread;
    y = answerBlock(el, 'A WEAK ANSWER', ORANGE, q.weak, cx, y, s, inner, 0.6);

    y += 96 * s * spread;
    el.push(...footer(FOOTER, cx, y, s, inner));
    return { el, height: y };
  };
}

// ---------------------------------------------------------------------------
// Quote cards — the article's aphorisms
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

const cardFailure = quoteCard('// THE FAILURE MODE',
  ['Meeting a contradiction,', 'a language model produces', 'a smoother answer.'],
  ['A deterministic system', 'halts and flags it.'], GREEN_TEXT);
const cardAccountable = quoteCard('// ACCOUNTABILITY',
  ['“A human reviews it”', 'is a process step.'],
  ['“A human is accountable”', 'is a governance structure.']);
const cardClosing = quoteCard('// AN INDEFENSIBLE PROCESS',
  ['Their judgment', 'might be excellent.'],
  ['You have no way', 'to know.']);

// ---------------------------------------------------------------------------
// Card — the ILPA gap. Two dated ticks on one line: the template, then the tool.
// ---------------------------------------------------------------------------
function cardIlpa(cx, s, inner, spread) {
  const el = [];
  const L = cx - inner / 2;
  const R = cx + inner / 2;
  let y = cardHead(el, cx, s, spread, '// OVERSIGHT HAS NOT KEPT PACE');

  y += 118 * s * spread;
  const head = ['The LP due diligence template', 'predates ChatGPT.'];
  const hSize = fit(F.light, head, 58 * s, inner);
  head.forEach((line, i) => el.push(mid(F.light, line, cx, y + i * hSize * 1.18, hSize, WHITE, 0.96)));
  y += (head.length - 1) * hSize * 1.18;

  // Timeline, 2021 → 2026 on a linear year scale.
  y += 150 * s * spread;
  const x0 = L + 30 * s;
  const x1 = R - 30 * s;
  const xAt = (yr) => x0 + (x1 - x0) * (yr - 2021) / (2026.75 - 2021);
  el.push(`<line x1="${x0.toFixed(1)}" y1="${y.toFixed(1)}" x2="${x1.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${WHITE}" stroke-width="${(2 * s).toFixed(1)}" opacity="0.25"/>`);
  const ticks = [
    { yr: 2021, year: '2021', label: 'ILPA DDQ', sub: 'LAST UPDATED', color: ORANGE },
    { yr: 2022.9, year: 'NOV 2022', label: 'ChatGPT', sub: 'PUBLIC RELEASE', color: WHITE },
    { yr: 2026.75, year: 'SEP 2026', label: 'Today', sub: 'AI IN GP DILIGENCE', color: GREEN_TEXT },
  ];
  for (const t of ticks) {
    const x = xAt(t.yr);
    el.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(9 * s).toFixed(1)}" fill="${t.color === WHITE ? DARK : t.color}" stroke="${t.color}" stroke-width="${(2.5 * s).toFixed(1)}"/>`);
    const anchor = t.yr === 2021 ? 'l' : t.yr > 2026 ? 'r' : 'm';
    const put = (f, str, yy, size, track, fill, op) => {
      const w = trackedW(f, str, size, track);
      const sx = anchor === 'l' ? x - 9 * s : anchor === 'r' ? x + 9 * s - w : x - w / 2;
      return tracked(f, str, sx, yy, size, track, fill, op);
    };
    el.push(...put(F.monoMed, t.year, y - 34 * s, 17 * s, 3 * s, t.color, t.color === WHITE ? 0.7 : 1));
    el.push(...put(F.med, t.label, y + 56 * s, 28 * s, 0, WHITE, 0.92));
    el.push(...put(F.mono, t.sub, y + 88 * s, 13 * s, 2.6 * s, WHITE, 0.5));
  }
  y += 88 * s;

  y += 118 * s * spread;
  el.push(rule(cx, y - 46 * s, s));
  const cap = ['LPs are being asked to trust', 'a process they cannot see.'];
  const cSize = fit(F.serifIt, cap, 32 * s, inner);
  cap.forEach((line, i) => el.push(mid(F.serifIt, line, cx, y + i * cSize * 1.42, cSize, WHITE, 0.8)));
  y += cSize * 1.42;

  y += 62 * s * spread;
  el.push(...footer('SOURCE: ILPA DUE DILIGENCE QUESTIONNAIRE, 2021 EDITION', cx, y, s, inner));
  return { el, height: y };
}

// ---------------------------------------------------------------------------
// Card — what arrives. The benchmark, with its denominator in the footer.
// ---------------------------------------------------------------------------
function cardBenchmark(cx, s, inner, spread) {
  const el = [];
  const L = cx - inner / 2;
  let y = cardHead(el, cx, s, spread, '// WHAT ARRIVES AT THE GP');

  y += 180 * s * spread;
  const nSize = 190 * s;
  const n = String(BENCH.median);
  const nW = width(F.light, n, nSize);
  const dW = width(F.light, '/100', nSize * 0.3);
  const nx = cx - (nW + dW + 10 * s) / 2;
  el.push(at(F.light, n, nx, y, nSize, ORANGE));
  el.push(at(F.light, '/100', nx + nW + 10 * s, y, nSize * 0.3, WHITE, 0.55));
  y += 52 * s;
  el.push(...midTracked(F.monoMed, 'MEDIAN CLARITY SCORE', cx, y, 16 * s, 4.4 * s, WHITE, 0.6));

  // Two shares as bars on a 0–100 scale.
  y += 96 * s * spread;
  const rows = [
    { label: 'Drew a PASS verdict (below 50)', v: BENCH.pass },
    { label: 'Below half marks on Business Model Physics', v: BENCH.bmp },
  ];
  const lSize = fit(F.med, rows.map((r) => r.label), 24 * s, inner - 110 * s);
  const barH = 18 * s;
  const gap = 96 * s * damp(spread, 0.4);
  for (const r of rows) {
    el.push(at(F.med, r.label, L, y, lSize, WHITE, 0.84));
    const v = `${r.v}%`;
    el.push(at(F.monoMed, v, L + inner - width(F.monoMed, v, 28 * s), y, 28 * s, ORANGE));
    const by = y + 18 * s;
    el.push(`<rect x="${L.toFixed(1)}" y="${by.toFixed(1)}" width="${inner.toFixed(1)}" height="${barH.toFixed(1)}" fill="${WHITE}" opacity="0.05"/>`);
    el.push(`<rect x="${L.toFixed(1)}" y="${by.toFixed(1)}" width="${(inner * r.v / 100).toFixed(1)}" height="${barH.toFixed(1)}" fill="${ORANGE}"/>`);
    y += gap;
  }
  y -= gap;

  y += 130 * s * spread;
  el.push(rule(cx, y - 50 * s, s));
  const cap = ['A tool that summarizes a weak business', 'model will describe it fluently.'];
  const cSize = fit(F.serifIt, cap, 30 * s, inner);
  cap.forEach((line, i) => el.push(mid(F.serifIt, line, cx, y + i * cSize * 1.42, cSize, WHITE, 0.8)));
  y += cSize * 1.42;

  y += 62 * s * spread;
  el.push(...footer(BENCH_FOOTER, cx, y, s, inner));
  return { el, height: y };
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

const CARDS = [
  { id: 'checklist', title: 'Seven Questions to Ask Your GP About AI Diligence', layout: cardChecklist, target: { 'x-mobile': 0.84, square: 0.86 }, s: { square: 0.86 } },
  ...QUESTIONS.map((q, i) => ({ id: `q${nn(i)}`, title: q.q, layout: questionCard(i) })),
  { id: 'failure-mode', title: 'The Failure Mode', layout: cardFailure },
  { id: 'accountable', title: 'A Process Step Is Not Accountability', layout: cardAccountable },
  { id: 'ilpa', title: 'Oversight Has Not Kept Pace', layout: cardIlpa },
  { id: 'benchmark', title: 'What Arrives at the GP', layout: cardBenchmark },
  { id: 'closing', title: 'You Have No Way to Know', layout: cardClosing },
];

async function main() {
  console.log(`=== ${TITLE} ===\n`);
  const T = `${TITLE} — askOdin`;
  const xMobileBanner = frame(1080, 1350, bannerStacked, { s: 1.0, margin: 90, target: 0.74 });

  console.log('banners/');
  // Social OG — LinkedIn and X link previews read 1200x630.
  await emit(BANNER_DIR, `askOdin-${SLUG}-og`, 1200, 630, svgFor(T, 1200, 630, bannerLandscape(1200, 630)));
  // Substack post body, uncropped.
  await emit(BANNER_DIR, `askOdin-substack-${SLUG}-hero`, 1600, 900, svgFor(T, 1600, 900, bannerLandscape(1600, 900)));
  // Substack share frame, with clear ground top and bottom for platform crops.
  await emit(BANNER_DIR, `askOdin-substack-${SLUG}-og`, 1456, 1048,
    svgFor(T, 1456, 1048, frame(1456, 1048, bannerStacked, { s: 0.74, margin: 200, target: 0.8 })));
  // X in-feed image post, 4:5.
  const cover = await emit(BANNER_DIR, `askOdin-${SLUG}-x-mobile`, 1080, 1350, svgFor(T, 1080, 1350, xMobileBanner));
  // LinkedIn in-feed image post, 1:1.
  await emit(BANNER_DIR, `askOdin-${SLUG}-linkedin-square`, 1200, 1200,
    svgFor(T, 1200, 1200, frame(1200, 1200, bannerStacked, { s: 0.94, margin: 110, target: 0.8 })));

  console.log('\ncards/');
  const portrait = {};
  for (const card of CARDS) {
    for (const c of CARD_CROPS) {
      const opts = { ...c, s: card.s?.[c.suffix] ?? c.s, target: card.target?.[c.suffix] ?? c.target };
      const svg = await emit(CARD_DIR, `askOdin-${SLUG}-${card.id}-${c.suffix}`, c.W, c.H,
        svgFor(`${card.title} — askOdin`, c.W, c.H, frame(c.W, c.H, card.layout, opts)));
      if (c.suffix === 'x-mobile') portrait[card.id] = svg;
    }
  }

  // Cover, the seven questions, the closing line.
  const pages = [cover, ...QUESTIONS.map((_, i) => portrait[`q${nn(i)}`]), portrait.closing];
  await carouselPdf(pages, 1080, 1350, path.join(CARD_DIR, `askOdin-${SLUG}-linkedin-carousel.pdf`), T);
  console.log(`\nWrote ${ASSET_DIR}/`);
}

main().catch((err) => { console.error(err); process.exit(1); });
