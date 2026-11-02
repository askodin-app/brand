import opentype from 'opentype.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// note.com eyecatch — AIエージェント遮断の本質は技術ではない。「責任の所在」だ
//
// Japanese edition of askodin.app/insights/ai-agent-ban-liability/ (pubDate
// 2026-10-30). The note post is its own publication moment, so the folder is
// dated to the note publication date — change DATE if it ships on another day.
// note URLs carry no readable slug, so the folder takes the page's slug plus
// -note-ja, as generate-xai-note-ja.mjs does.
//
// Copy is the site's: every string below is already on
// src/pages/ja/insights/ai-agent-ban-liability.astro or in
// generate-ai-agent-ban-liability-ja.mjs, and carries no retention, isolation,
// training, guideline or 排除 claim. No figures, and no bank is named. Layout
// mirrors the other note eyecatches: title left, the unanswered questions right.
// ─────────────────────────────────────────────────────────────────────────────

const F = {
  semi: opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-SemiBold.ttf'),
  mono: opentype.loadSync('./fonts/IBM_Plex_Mono/IBMPlexMono-Regular.ttf'),
  monoMed: opentype.loadSync('./fonts/IBM_Plex_Mono/IBMPlexMono-Medium.ttf'),
  jpBold: opentype.loadSync('./fonts/Noto_Sans_JP/NotoSansJP-Bold.ttf'),
  jpMedium: opentype.loadSync('./fonts/Noto_Sans_JP/NotoSansJP-Medium.ttf'),
};

const ORANGE = '#DB4A2B';
const GREEN = '#147B58';
const DARK = '#111119';
const WHITE = '#FFFFFF';

const DATE = '20261030';
const SLUG = 'ai-agent-ban-liability-note-ja';
const ASSET_DIR = `./output/social/${DATE}-${SLUG}`;
const PNG_DIR = path.join(ASSET_DIR, 'banners');
const SVG_DIR = path.join(ASSET_DIR, 'svg');
for (const d of [PNG_DIR, SVG_DIR]) fs.mkdirSync(d, { recursive: true });

const EYEBROW = '// MACRO THESIS';
const HEAD = ['AIエージェント遮断の', '本質は技術ではない。'];
const HEAD_TURN = '「責任の所在」だ。';
const DECK = '機関投資家もいずれ、同じ線を引くことになる。';
const QUESTIONS_HEAD = '合意された基準は、まだない';
const QUESTIONS = [
  { text: 'エージェントは何者か' },
  { text: '何を許可されたのか' },
  { text: '誰が責任を負うのか', hot: true },
];

// Text is outlined, so a kanji outside the Noto subset has no fallback.
const COPY = [...HEAD, HEAD_TURN, DECK, QUESTIONS_HEAD, ...QUESTIONS.map((q) => q.text)].join('');
const missing = [...new Set(COPY)].filter((ch) => F.jpMedium.charToGlyph(ch).index === 0);
if (missing.length) throw new Error(`Add to KANJI in tools/prepare-noto-sans-jp.py: ${missing.join('')}`);

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

function tracked(f, t, x, y, size, track, fill, op) {
  const el = [];
  for (const ch of t) {
    if (ch !== ' ') el.push(at(f, ch, x, y, size, fill, op));
    x += width(f, ch, size) + track;
  }
  return el;
}

function fit(f, lines, size, maxW) {
  while (size > 10 && lines.some((l) => width(f, l, size) > maxW)) size -= 1;
  return size;
}

// ─────────────────────────────────────────────────────────────────────────────
// Eyecatch — note.com 1280x670, house chrome shared with the other note posts
// ─────────────────────────────────────────────────────────────────────────────
const W = 1280;
const H = 670;
const MARGIN = 88;

function backdrop() {
  const el = [`<rect width="${W}" height="${H}" fill="${DARK}"/>`];
  el.push(`<defs>
    <linearGradient id="gridFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${WHITE}" stop-opacity="0.05"/>
      <stop offset="55%" stop-color="${WHITE}" stop-opacity="0.022"/>
      <stop offset="100%" stop-color="${WHITE}" stop-opacity="0"/>
    </linearGradient>
  </defs>`);
  for (let x = 0; x <= W; x += 64) el.push(`<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="url(#gridFade)" stroke-width="1"/>`);
  for (let y = 56; y < H; y += 56) el.push(`<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="url(#gridFade)" stroke-width="1"/>`);
  el.push(`<path d="${pathOf(F.semi, 'O', -110, 566, 700)}" fill="${GREEN}" opacity="0.05"/>`);
  el.push(`<rect width="${W}" height="4" fill="${ORANGE}"/>`);
  return el;
}

function eyecatchSvg() {
  const el = backdrop();
  const colW = 700;

  const askW = width(F.semi, 'ask', 30);
  el.push(at(F.semi, 'ask', MARGIN, 116, 30, ORANGE), at(F.semi, 'Odin', MARGIN + askW, 116, 30, GREEN));
  el.push(...tracked(F.monoMed, EYEBROW, MARGIN, 190, 15, 4, ORANGE, 0.95));

  const hSize = fit(F.jpBold, [...HEAD, HEAD_TURN], 54, colW);
  const lead = hSize * 1.34;
  const top = 268;
  HEAD.forEach((line, i) => el.push(at(F.jpBold, line, MARGIN, top + i * lead, hSize, WHITE)));
  // 「 sits at the right of its em box; hang it so the line stays flush left.
  el.push(at(F.jpBold, HEAD_TURN, MARGIN - hSize * 0.5, top + HEAD.length * lead, hSize, ORANGE));

  const ruleY = top + HEAD.length * lead + 42;
  el.push(`<rect x="${MARGIN}" y="${ruleY}" width="64" height="3" fill="${ORANGE}"/>`);
  el.push(at(F.jpMedium, DECK, MARGIN, ruleY + 56, fit(F.jpMedium, [DECK], 28, colW), WHITE, 0.85));

  el.push(...tracked(F.mono, 'ASKODIN.APP/JA', MARGIN, H - 52, 16, 5, WHITE, 0.5));

  // Right column: unticked boxes, because none of the three has an answer yet.
  const divX = 858;
  el.push(`<line x1="${divX}" y1="160" x2="${divX}" y2="${H - 110}" stroke="${WHITE}" stroke-width="1" opacity="0.12"/>`);
  const R = 906;
  const rW = W - 64 - R;
  el.push(at(F.jpMedium, QUESTIONS_HEAD, R, 204, fit(F.jpMedium, [QUESTIONS_HEAD], 20, rW), WHITE, 0.72));

  const box = 22;
  const qSize = fit(F.jpMedium, QUESTIONS.map((q) => q.text), 28, rW - 40);
  QUESTIONS.forEach((q, i) => {
    const y = 296 + i * 88;
    const color = q.hot ? ORANGE : WHITE;
    el.push(`<rect x="${R}" y="${y - box + 2}" width="${box}" height="${box}" fill="none" stroke="${color}" stroke-width="2" opacity="${q.hot ? 1 : 0.55}"/>`);
    el.push(at(F.jpMedium, q.text, R + 40, y, qSize, color, q.hot ? 1 : 0.92));
    if (i < QUESTIONS.length - 1) el.push(`<line x1="${R}" y1="${y + 34}" x2="${R + rW}" y2="${y + 34}" stroke="${WHITE}" stroke-width="1" opacity="0.1"/>`);
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <title>askOdin — note.com eyecatch — AIエージェント遮断の本質は技術ではない。「責任の所在」だ</title>
  ${el.join('\n  ')}
</svg>`;
}

async function main() {
  console.log('=== note.com — AIエージェント遮断 (JA) ===\n');
  const name = 'askOdin-ai-agent-ban-liability-note-ja';
  fs.writeFileSync(path.join(SVG_DIR, `${name}.svg`), eyecatchSvg());
  const buf = fs.readFileSync(path.join(SVG_DIR, `${name}.svg`));
  for (const [w, h, suffix] of [[1280, 670, ''], [1920, 1006, '-1920'], [2560, 1340, '-2x']]) {
    const file = path.join(PNG_DIR, `${name}${suffix}.png`);
    await sharp(buf, { density: 300 }).resize(w, h, { fit: 'fill' }).png().toFile(file);
    console.log(`  ${path.basename(file).padEnd(46)} ${w}x${h}  ${(fs.statSync(file).size / 1024).toFixed(0)}KB`);
  }
  console.log(`\nWrote ${ASSET_DIR}/`);
}

main().catch((err) => { console.error(err); process.exit(1); });
