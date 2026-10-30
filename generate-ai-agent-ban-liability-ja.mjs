import opentype from 'opentype.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// 「AIエージェント遮断の本質は技術ではない。「責任の所在」だ」 — OG and hero
// https://askodin.app/ja/insights/ai-agent-ban-liability/ (pubDate 2026-10-30)
//
// The Japanese edition of generate-ai-agent-ban-liability.mjs: same layouts,
// same line. Copy is quoted or condensed from
// src/pages/ja/insights/ai-agent-ban-liability.astro in askodin-coming-soon,
// and checked against the JA rules in scripts/check-compliance-lexicon.mjs.
//
//   og    1200x630  public/images/articles/ai-agent-ban-liability-ja-og.png
//   hero  1600x640  public/images/articles/ai-agent-ban-liability-ja-hero.webp
//
// If the hero's words change, change heroAlt on that page in the same commit.
// ─────────────────────────────────────────────────────────────────────────────

const F = {
  light: opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-Light.ttf'),
  semi: opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-SemiBold.ttf'),
  mono: opentype.loadSync('./fonts/IBM_Plex_Mono/IBMPlexMono-Regular.ttf'),
  monoMed: opentype.loadSync('./fonts/IBM_Plex_Mono/IBMPlexMono-Medium.ttf'),
  jpBold: opentype.loadSync('./fonts/Noto_Sans_JP/NotoSansJP-Bold.ttf'),
  jpMedium: opentype.loadSync('./fonts/Noto_Sans_JP/NotoSansJP-Medium.ttf'),
  jpRegular: opentype.loadSync('./fonts/Noto_Sans_JP/NotoSansJP-Regular.ttf'),
};

const ORANGE = '#DB4A2B';
const GREEN = '#147B58';
// Brand green is too dark for small type on Deep Dark; labels use a lifted
// tint of the same hue, rules and markers keep the true green.
const GREEN_TEXT = '#2FA37A';
const DARK = '#111119';
const SURFACE = '#1A1A2E';
const WHITE = '#FFFFFF';

const SLUG = 'ai-agent-ban-liability-ja';
const ASSET_DIR = './output/social/20261030-ai-agent-ban-liability-ja';
const BANNER_DIR = path.join(ASSET_DIR, 'banners');
const SVG_DIR = path.join(ASSET_DIR, 'svg');
for (const d of [BANNER_DIR, SVG_DIR]) fs.mkdirSync(d, { recursive: true });

// ---------------------------------------------------------------------------
// Copy
// ---------------------------------------------------------------------------
const TITLE = 'AIエージェント遮断の本質は技術ではない。「責任の所在」だ';
const HEADLINE = ['AIエージェント遮断の', '本質は技術ではない。'];
const HEADLINE_TURN = '「責任の所在」だ。';
const STANDFIRST = ['機関投資家もいずれ、', '同じ線を引くことになる。'];
const EYEBROW = '// MACRO THESIS';
const URL_LINE = 'ASKODIN.APP/JA/INSIGHTS';

const QUESTIONS_HEAD = '合意された基準は、まだない';
const QUESTIONS = [
  { text: 'エージェントは何者か' },
  { text: '何を許可されたのか' },
  { text: '誰が責任を負うのか', hot: true },
];

const HERO_EYEBROW = '// ONE LINE · TWO MARKETS';
const RAILS = [
  { label: 'リテールバンキング', tag: '線は引かれた', nodes: ['顧客', 'AIエージェント', '銀行口座'] },
  { label: 'プライベート・キャピタル', tag: 'まだ引かれていない', nodes: ['ディールチーム', 'LLM', 'LP資金'] },
];
const CAPTION = '銀行は顧客のログインに線を引いた。機関投資家は、投資委員会に同じ線を引く。';

// Text is outlined, so a kanji outside the Noto subset has no fallback: it would
// ship as a tofu box. Fail with the characters instead, in the form KANJI wants
// in tools/prepare-noto-sans-jp.py.
const COPY = [TITLE, ...HEADLINE, HEADLINE_TURN, ...STANDFIRST, QUESTIONS_HEAD, ...QUESTIONS.map((q) => q.text),
  ...RAILS.flatMap((r) => [r.label, r.tag, ...r.nodes]), CAPTION].join('');
const missing = [...new Set(COPY)].filter((ch) => ch !== ' ' && F.jpMedium.charToGlyph(ch).index === 0);
if (missing.length) throw new Error(`Add to KANJI in tools/prepare-noto-sans-jp.py: ${missing.join('')}`);

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

// ---------------------------------------------------------------------------
// OG — 1200x630. Title left, the three unanswered questions right.
// ---------------------------------------------------------------------------
function og(W, H) {
  const el = backdrop(W, H);
  const L = 84;
  const colW = 590;

  el.push(...wordmarkAt(L, 104, 30));
  el.push(...tracked(F.monoMed, EYEBROW, L, 180, 16, 4.2, ORANGE, 1));

  const hSize = fit(F.jpMedium, [...HEADLINE, HEADLINE_TURN], 54, colW);
  const lead = hSize * 1.3;
  HEADLINE.forEach((line, i) => el.push(at(F.jpMedium, line, L, 250 + i * lead, hSize, WHITE, 0.96)));
  // 「 sits at the right of its em box; hang it so the line stays flush left.
  el.push(at(F.jpMedium, HEADLINE_TURN, L - hSize * 0.5, 250 + HEADLINE.length * lead, hSize, ORANGE));

  const ry = 250 + HEADLINE.length * lead + 40;
  el.push(`<line x1="${L}" y1="${ry.toFixed(1)}" x2="${L + 64}" y2="${ry.toFixed(1)}" stroke="${ORANGE}" stroke-width="3"/>`);

  const sSize = fit(F.jpRegular, STANDFIRST, 22, colW);
  STANDFIRST.forEach((line, i) => el.push(at(F.jpRegular, line, L, ry + 44 + i * sSize * 1.6, sSize, WHITE, 0.72)));

  el.push(...tracked(F.mono, URL_LINE, L, 576, 14, 3.6, WHITE, 0.4));

  // Right column: unticked boxes, because none of the three has an answer yet.
  const divX = 730;
  el.push(`<line x1="${divX}" y1="150" x2="${divX}" y2="540" stroke="${WHITE}" stroke-width="1" opacity="0.12"/>`);
  const R = 782;
  const rW = W - 64 - R;
  el.push(at(F.jpMedium, QUESTIONS_HEAD, R, 180, 18, WHITE, 0.72));

  const qSize = fit(F.jpRegular, QUESTIONS.map((q) => q.text), 30, rW - 46);
  const box = 22;
  QUESTIONS.forEach((q, i) => {
    const y = 278 + i * 92;
    const color = q.hot ? ORANGE : WHITE;
    el.push(`<rect x="${R}" y="${y - box + 2}" width="${box}" height="${box}" fill="none" stroke="${color}" stroke-width="2" opacity="${q.hot ? 1 : 0.55}"/>`);
    el.push(at(F.jpRegular, q.text, R + 46, y, qSize, color, q.hot ? 1 : 0.92));
    if (i < QUESTIONS.length - 1) el.push(`<line x1="${R}" y1="${y + 34}" x2="${R + rW}" y2="${y + 34}" stroke="${WHITE}" stroke-width="1" opacity="0.1"/>`);
  });
  return el;
}

// ---------------------------------------------------------------------------
// Hero — 1600x640. Renders ~1024px wide in the article, so no text under ~22px
// source. The page prints the title directly above it, so it carries none.
// ---------------------------------------------------------------------------
function hero(W, H) {
  const el = backdrop(W, H);
  const L = 84;
  const R = W - L;
  const nodeW = 256;
  const nodeH = 84;
  const nodeX = [L, 470, R - nodeW];
  const lineX = 996; // midway through the gap between the second and third node
  const rowY = [190, 368];

  el.push(...tracked(F.monoMed, HERO_EYEBROW, L, 92, 22, 4.6, ORANGE, 1));
  el.push(...wordmarkEnd(R, 96, 36));

  const arrow = (x1, x2, y, color, op) => {
    const a = 13;
    return [
      `<line x1="${x1}" y1="${y}" x2="${x2 - a}" y2="${y}" stroke="${color}" stroke-width="3" opacity="${op}"/>`,
      `<path d="M${x2 - a},${y - 9} L${x2},${y} L${x2 - a},${y + 9} Z" fill="${color}" opacity="${op}"/>`,
    ];
  };

  RAILS.forEach((rail, r) => {
    const top = rowY[r];
    const cy = top + nodeH / 2;
    const blocked = r === 0;

    el.push(at(F.jpMedium, rail.label, L, top - 22, 24, WHITE, 0.62));

    // Tag sits against the line, on the side the flow has not reached.
    const tagColor = blocked ? ORANGE : WHITE;
    el.push(at(F.jpMedium, rail.tag, lineX + 22, top - 22, 24, tagColor, blocked ? 1 : 0.62));

    rail.nodes.forEach((label, i) => {
      const x = nodeX[i];
      const capital = i === 2;
      el.push(`<rect x="${x}" y="${top}" width="${nodeW}" height="${nodeH}" rx="4" fill="${SURFACE}" stroke="${capital ? GREEN : WHITE}" stroke-opacity="${capital ? 1 : 0.2}" stroke-width="${capital ? 2 : 1.5}"/>`);
      const color = capital ? GREEN_TEXT : WHITE;
      const size = 26;
      el.push(...midTracked(F.jpMedium, label, x + nodeW / 2, cy + size * 0.36, size, 1, color, capital ? 1 : 0.92));
    });

    el.push(...arrow(nodeX[0] + nodeW + 8, nodeX[1] - 8, cy, WHITE, 0.5));
    if (blocked) {
      // Stops short of the line. The break in the rail is the block.
      el.push(...arrow(nodeX[1] + nodeW + 8, lineX - 18, cy, WHITE, 0.5));
    } else {
      el.push(...arrow(nodeX[1] + nodeW + 8, nodeX[2] - 8, cy, ORANGE, 1));
    }
  });

  // The line itself: one x, solid over consumer banking, dashed below it.
  el.push(`<line x1="${lineX}" y1="146" x2="${lineX}" y2="${rowY[0] + nodeH + 22}" stroke="${ORANGE}" stroke-width="6"/>`);
  el.push(`<line x1="${lineX}" y1="${rowY[0] + nodeH + 22}" x2="${lineX}" y2="${rowY[1] + nodeH + 22}" stroke="${ORANGE}" stroke-width="3" stroke-dasharray="12 10" opacity="0.8"/>`);

  el.push(`<line x1="${L}" y1="508" x2="${R}" y2="508" stroke="${WHITE}" stroke-width="1" opacity="0.12"/>`);
  const cSize = fit(F.jpRegular, [CAPTION], 32, R - L);
  el.push(at(F.jpRegular, CAPTION, L, 568, cSize, WHITE, 0.82));
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
