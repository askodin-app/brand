import opentype from 'opentype.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// "Sounding Thorough vs. Being Thorough" — site images
// https://askodin.app/insights/sounding-thorough-vs-being-thorough/ (pubDate 2026-11-03)
//
//   og    1200x630  public/images/articles/sounding-thorough-vs-being-thorough-og.png
//   hero  1600x640  public/images/articles/sounding-thorough-vs-being-thorough-hero.webp
//
// Chrome and primitives follow generate-ai-agent-ban-liability.mjs. The hero is
// the article's turn drawn as two pipelines over the same documents: one that
// summarizes, one that separates extraction from evaluation and keeps a record.
// The OG quotes the model's line from the Goldman Sachs Exchanges transcript
// (24 Aug 2026). No firm is named on either image: the article does the
// attribution. If the hero's words change, change heroAlt in the article's
// frontmatter in the same commit.
// ─────────────────────────────────────────────────────────────────────────────

const F = {
  light: opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-Light.ttf'),
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
const SURFACE = '#1A1A2E';
const WHITE = '#FFFFFF';

const SLUG = 'sounding-thorough-vs-being-thorough';
const ASSET_DIR = './output/social/20261103-sounding-thorough-vs-being-thorough';
const BANNER_DIR = path.join(ASSET_DIR, 'banners');
const SVG_DIR = path.join(ASSET_DIR, 'svg');
for (const d of [BANNER_DIR, SVG_DIR]) fs.mkdirSync(d, { recursive: true });

// ---------------------------------------------------------------------------
// Copy
// ---------------------------------------------------------------------------
const TITLE = 'Sounding Thorough vs. Being Thorough';
const HEADLINE = ['Sounding thorough', 'is not'];
const HEADLINE_TURN = 'being thorough.';
const STANDFIRST = ['Wall Street\u2019s AI problem isn\u2019t', 'human atrophy. It\u2019s architecture.'];
const EYEBROW = '// MACRO THESIS';
const URL_LINE = 'ASKODIN.APP/INSIGHTS';

const QUOTE = ['Look, in the end,', 'I\u2019m better at', 'sounding thorough', 'than being', 'thorough.\u201D'];
const QUOTE_BY = 'AN LLM, CHALLENGED';
const QUOTE_BY2 = 'BY ITS BUILDERS';

const HERO_EYEBROW = '// SAME DOCUMENTS · TWO ARCHITECTURES';
const RAILS = [
  {
    label: 'SOUNDING THOROUGH',
    nodes: [{ t: 'DATA ROOM' }, { t: 'LLM', sub: 'READS AND SUMMARIZES' }, null, { t: 'FLUENT MEMO', sub: 'NO SOURCE TRAIL' }],
  },
  {
    label: 'BEING THOROUGH',
    nodes: [{ t: 'DATA ROOM' }, { t: 'EXTRACT', sub: 'LANGUAGE MODEL' }, { t: 'EVALUATE', sub: 'DETERMINISTIC RULES' }, { t: 'AUDIT LOG', sub: 'TRACEABLE RECORD', record: true }],
  },
];
const HALT = 'FAILED CLAIM: HALT + FLAG';
const CAPTION = 'Training improves the reviewer. Architecture changes what the system is built to do.';

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
const mid = (f, t, cx, y, size, fill, op = 1) => at(f, t, cx - width(f, t, size) / 2, y, size, fill, op);

function fit(f, lines, size, maxW) {
  while (size > 10 && lines.some((l) => width(f, l, size) > maxW)) size -= 1;
  return size;
}

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
const wordmarkEnd = (x, y, size) =>
  wordmarkAt(x - (width(F.semi, 'ask', size) + width(F.semi, 'Odin', size)), y, size);
const wordmark = (cx, y, size) =>
  wordmarkAt(cx - (width(F.semi, 'ask', size) + width(F.semi, 'Odin', size)) / 2, y, size);

// ---------------------------------------------------------------------------
// OG — 1200x630. Title left, the model's line right.
// ---------------------------------------------------------------------------
function og(W, H) {
  const el = backdrop(W, H);
  const L = 84;
  const colW = 560;

  el.push(...wordmarkAt(L, 104, 30));
  el.push(...tracked(F.monoMed, EYEBROW, L, 180, 16, 4.2, ORANGE, 1));

  const hSize = fit(F.light, [...HEADLINE, HEADLINE_TURN], 62, colW);
  const lead = hSize * 1.16;
  HEADLINE.forEach((line, i) => el.push(at(F.light, line, L, 256 + i * lead, hSize, WHITE, 0.96)));
  el.push(at(F.light, HEADLINE_TURN, L, 256 + HEADLINE.length * lead, hSize, ORANGE));

  const ry = 256 + HEADLINE.length * lead + 40;
  el.push(`<line x1="${L}" y1="${ry.toFixed(1)}" x2="${L + 64}" y2="${ry.toFixed(1)}" stroke="${ORANGE}" stroke-width="3"/>`);
  const sSize = fit(F.serifIt, STANDFIRST, 22, colW);
  STANDFIRST.forEach((line, i) => el.push(at(F.serifIt, line, L, ry + 44 + i * sSize * 1.45, sSize, WHITE, 0.72)));

  el.push(...tracked(F.mono, URL_LINE, L, 576, 14, 3.6, WHITE, 0.4));

  const divX = 720;
  el.push(`<line x1="${divX}" y1="150" x2="${divX}" y2="540" stroke="${WHITE}" stroke-width="1" opacity="0.12"/>`);
  const R = 772;
  el.push(at(F.serifIt, '\u201C', R - 6, 238, 96, ORANGE));
  const qSize = fit(F.serifIt, QUOTE, 34, W - 64 - R);
  QUOTE.forEach((line, i) => el.push(at(F.serifIt, line, R, 262 + i * qSize * 1.32, qSize, WHITE, 0.94)));
  const by = 262 + (QUOTE.length - 1) * qSize * 1.32 + 52;
  el.push(...tracked(F.mono, QUOTE_BY, R, by, 14, 3, WHITE, 0.6));
  el.push(...tracked(F.mono, QUOTE_BY2, R, by + 24, 14, 3, WHITE, 0.6));
  return el;
}

// ---------------------------------------------------------------------------
// Hero — 1600x640. Renders ~1024px wide in the article, so no text under ~22px
// source; sublabels sit at 19. The page prints the title above it.
// ---------------------------------------------------------------------------
function hero(W, H) {
  const el = backdrop(W, H);
  const L = 84;
  const R = W - L;
  const nodeW = 272;
  const nodeH = 76;
  const gap = (R - L - nodeW * 4) / 3;
  const nodeX = [0, 1, 2, 3].map((i) => L + i * (nodeW + gap));
  const rowY = [176, 360];

  el.push(...tracked(F.monoMed, HERO_EYEBROW, L, 92, 22, 4.6, ORANGE, 1));
  el.push(...wordmarkEnd(R, 96, 36));

  const arrow = (x1, x2, y, color, op, w = 3) => {
    const a = 13;
    return [
      `<line x1="${x1}" y1="${y}" x2="${x2 - a}" y2="${y}" stroke="${color}" stroke-width="${w}" opacity="${op}"/>`,
      `<path d="M${x2 - a},${y - 9} L${x2},${y} L${x2 - a},${y + 9} Z" fill="${color}" opacity="${op}"/>`,
    ];
  };

  RAILS.forEach((rail, r) => {
    const top = rowY[r];
    const cy = top + nodeH / 2;
    const good = r === 1;
    el.push(...tracked(F.mono, rail.label, L, top - 22, 22, 3.4, good ? GREEN_TEXT : WHITE, good ? 1 : 0.62));

    rail.nodes.forEach((n, i) => {
      if (!n) return;
      const x = nodeX[i];
      const stroke = n.record ? GREEN : WHITE;
      el.push(`<rect x="${x}" y="${top}" width="${nodeW}" height="${nodeH}" rx="4" fill="${SURFACE}" stroke="${stroke}" stroke-opacity="${n.record ? 1 : 0.2}" stroke-width="${n.record ? 2 : 1.5}" ${!good && i === 3 ? 'stroke-dasharray="8 6"' : ''}/>`);
      el.push(...midTracked(F.monoMed, n.t, x + nodeW / 2, cy + 8, 23, 2.4, n.record ? GREEN_TEXT : WHITE, 0.94));
      if (n.sub) el.push(...midTracked(F.mono, n.sub, x + nodeW / 2, top + nodeH + 32, 19, 2, n.record ? GREEN_TEXT : WHITE, n.record ? 0.9 : 0.5));
    });

    el.push(...arrow(nodeX[0] + nodeW + 8, nodeX[1] - 8, cy, WHITE, 0.5));
    if (good) {
      el.push(...arrow(nodeX[1] + nodeW + 8, nodeX[2] - 8, cy, WHITE, 0.5));
      el.push(...arrow(nodeX[2] + nodeW + 8, nodeX[3] - 8, cy, GREEN, 1));
    } else {
      // Straight past evaluation: the summary goes out with nothing tested.
      el.push(...arrow(nodeX[1] + nodeW + 8, nodeX[3] - 8, cy, ORANGE, 1));
    }
  });

  // The halt: a branch down from EVALUATE.
  const hx = nodeX[2] + nodeW / 2;
  const hy = rowY[1] + nodeH + 44;
  el.push(...tracked(F.monoMed, HALT, hx - trackedW(F.monoMed, HALT, 19, 2) / 2, hy + 26, 19, 2, ORANGE, 1));

  el.push(`<line x1="${L}" y1="528" x2="${R}" y2="528" stroke="${WHITE}" stroke-width="1" opacity="0.12"/>`);
  const cSize = fit(F.serifIt, [CAPTION], 30, R - L);
  el.push(at(F.serifIt, CAPTION, L, 584, cSize, WHITE, 0.8));
  return el;
}

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------
const svgFor = (title, W, H, el) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <title>${title.replace(/&/g, '&amp;')}</title>
  ${el.join('\n  ')}
</svg>`;

async function emit(name, W, H, svg) {
  const file = path.join(SVG_DIR, `${name}.svg`);
  fs.writeFileSync(file, svg);
  const buf = fs.readFileSync(file);
  await sharp(buf, { density: 300 }).resize(W, H, { fit: 'fill' }).png().toFile(path.join(BANNER_DIR, `${name}.png`));
  await sharp(buf, { density: 300 }).resize(W * 2, H * 2, { fit: 'fill' }).png().toFile(path.join(BANNER_DIR, `${name}-2x.png`));
  console.log(`  ${name}: ${W}x${H} + @2x`);
}

async function main() {
  console.log(`=== ${TITLE} ===\n`);
  const T = `${TITLE} — askOdin`;
  await emit(`askOdin-${SLUG}-og`, 1200, 630, svgFor(T, 1200, 630, og(1200, 630)));
  await emit(`askOdin-${SLUG}-hero`, 1600, 640, svgFor(T, 1600, 640, hero(1600, 640)));
  console.log(`\nWrote ${ASSET_DIR}/`);
}

main().catch((err) => { console.error(err); process.exit(1); });
