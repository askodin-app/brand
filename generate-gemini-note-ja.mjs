import opentype from 'opentype.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// note.com × Google Gemini campaign (#AIとできたこと) — JA article images
//
//   banners/  eyecatch, note spec 1280x670 (+1920, +2x)
//   cards/    in-article figures: the verification pipeline (replaces the
//             ASCII diagram in the draft), the 2,488-deck benchmark, and the
//             GSE 2026 Osaka schedule
//
// Dated to the note publication date — change DATE if it ships on another day.
// note URLs carry no readable slug; see generate-diligence-stack-note-ja.mjs.
//
// ── Copy provenance ──────────────────────────────────────────────────────────
// Stage names and descriptions in the pipeline are quoted from YS's draft.
// Benchmark figures come from askodin-coming-soon
// src/content/research/pitch-deck-clarity-benchmark-2026.mdx, NOT from the
// draft, which misstated them:
//   · 2,488 is decks (件), not companies (社) or business plans.
//   · 70.0% is the share of decks in the bottom band, below 50. It is not
//     "70% had a mathematical collapse or a serious contradiction".
//   · The window is organic decks scored 21 Feb – 19 Mar 2026 on one engine
//     version, not a retrospective audit of past deals.
// The engine's bottom band is called PASS in English (pass on the deal). A
// Japanese reader sees PASS as 合格, so the cards say 最下位帯 instead.
// GSE dates and venues are quoted from src/pages/ja/index.astro.
// Gemini is named as text only, and never with "×" beside askOdin: it is our
// extraction vendor, not a partner, and no Google mark appears.
// Checked by hand against the JA rules in check-compliance-lexicon.mjs
// (2026-09-18): no hits.
// ─────────────────────────────────────────────────────────────────────────────

const F = {
  semi: opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-SemiBold.ttf'),
  medium: opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-Medium.ttf'),
  light: opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-Light.ttf'),
  mono: opentype.loadSync('./fonts/IBM_Plex_Mono/IBMPlexMono-Regular.ttf'),
  monoMed: opentype.loadSync('./fonts/IBM_Plex_Mono/IBMPlexMono-Medium.ttf'),
  jpBold: opentype.loadSync('./fonts/Noto_Sans_JP/NotoSansJP-Bold.ttf'),
  jpMedium: opentype.loadSync('./fonts/Noto_Sans_JP/NotoSansJP-Medium.ttf'),
};

const ORANGE = '#DB4A2B';
const GREEN = '#147B58';
const DARK = '#111119';
const WHITE = '#FFFFFF';

const DATE = '20260918';
const SLUG = 'gemini-last-mile-note-ja';
const ASSET_DIR = `./output/social/${DATE}-${SLUG}`;
const BANNER_DIR = path.join(ASSET_DIR, 'banners');
const CARD_DIR = path.join(ASSET_DIR, 'cards');
const SVG_DIR = path.join(ASSET_DIR, 'svg');
for (const d of [BANNER_DIR, CARD_DIR, SVG_DIR]) fs.mkdirSync(d, { recursive: true });

// Benchmark — keep in sync with pitch-deck-clarity-benchmark-2026.mdx.
const BENCH = { n: '2,488', median: 35, bottomBand: '70.0%', window: '2026年2月21日〜3月19日' };

// ── Mixed-script text, set glyph by glyph ────────────────────────────────────
// Japanese codepoints take Noto, everything else Plex. A missing glyph throws
// rather than rendering tofu — outlined text has no fallback.
const isJP = (ch) => {
  const c = ch.codePointAt(0);
  return (c >= 0x3000 && c <= 0x30ff) || (c >= 0x4e00 && c <= 0x9fff) || (c >= 0xff00 && c <= 0xffef);
};

function faceFor(ch, font, jpFont) {
  const f = isJP(ch) ? jpFont : font;
  if (f.charToGlyphIndex(ch) === 0) {
    const cp = ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0');
    throw new Error(`No glyph for "${ch}" (U+${cp}) — add it to tools/prepare-noto-sans-jp.py`);
  }
  return f;
}

const advance = (ch, size, font, jpFont) => {
  const f = faceFor(ch, font, jpFont);
  return f.charToGlyph(ch).advanceWidth * (size / f.unitsPerEm);
};

const BOLD = { font: F.semi, jpFont: F.jpBold };
const MED = { font: F.medium, jpFont: F.jpMedium };
const widthOf = (str, size, face) => [...str].reduce((w, ch) => w + advance(ch, size, face.font, face.jpFont), 0);
const fitSize = (lines, max, measure, face) => Math.min(max, ...lines.map((l) => measure / widthOf(l, 1, face)));

function run(str, x, y, size, face, fill, opacity = 1) {
  const parts = [];
  let cursor = x;
  for (const ch of str) {
    const f = faceFor(ch, face.font, face.jpFont);
    const d = f.getPath(ch, cursor, y, size).toPathData(3);
    if (d) parts.push(d);
    cursor += advance(ch, size, face.font, face.jpFont);
  }
  const op = opacity === 1 ? '' : ` opacity="${opacity}"`;
  return parts.length ? `<path d="${parts.join(' ')}" fill="${fill}"${op}/>` : '';
}
const runMid = (str, cx, y, size, face, fill, op) => run(str, cx - widthOf(str, size, face) / 2, y, size, face, fill, op);
const runRight = (str, rx, y, size, face, fill, op) => run(str, rx - widthOf(str, size, face), y, size, face, fill, op);

const latinW = (f, t, size) => [...t].reduce((w, c) => w + f.charToGlyph(c).advanceWidth, 0) * (size / f.unitsPerEm);
const latin = (f, t, x, y, size, fill, op = 1) =>
  `<path d="${f.getPath(t, x, y, size).toPathData(2)}" fill="${fill}"${op === 1 ? '' : ` opacity="${op}"`}/>`;

function tracked(f, text, x, y, size, track, fill, opacity) {
  const out = [];
  for (const c of [...text]) {
    if (c !== ' ') out.push(latin(f, c, x, y, size, fill, opacity));
    x += latinW(f, c, size) + track;
  }
  return out;
}
const trackedW = (f, t, size, track) => latinW(f, t, size) + track * Math.max(0, [...t].length - 1);
const trackedMid = (f, t, cx, y, size, track, fill, op) => tracked(f, t, cx - trackedW(f, t, size, track) / 2, y, size, track, fill, op);

function wordmark(x, y, size) {
  const askW = latinW(F.semi, 'ask', size);
  return [latin(F.semi, 'ask', x, y, size, ORANGE), latin(F.semi, 'Odin', x + askW, y, size, GREEN)];
}
const wordmarkMid = (cx, y, size) => wordmark(cx - (latinW(F.semi, 'ask', size) + latinW(F.semi, 'Odin', size)) / 2, y, size);

// House chrome, as the other note eyecatches, scaled to the canvas.
function backdrop(W, H) {
  const k = W / 1280;
  const el = [`<rect width="${W}" height="${H}" fill="${DARK}"/>`];
  el.push(`<defs>
    <linearGradient id="gridFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${WHITE}" stop-opacity="0.05"/>
      <stop offset="55%" stop-color="${WHITE}" stop-opacity="0.022"/>
      <stop offset="100%" stop-color="${WHITE}" stop-opacity="0"/>
    </linearGradient>
  </defs>`);
  for (let x = 0; x <= W; x += 64 * k) el.push(`<line x1="${x.toFixed(1)}" y1="0" x2="${x.toFixed(1)}" y2="${H}" stroke="url(#gridFade)" stroke-width="1"/>`);
  for (let y = 56 * k; y < H; y += 56 * k) el.push(`<line x1="0" y1="${y.toFixed(1)}" x2="${W}" y2="${y.toFixed(1)}" stroke="url(#gridFade)" stroke-width="1"/>`);
  el.push(`<path d="${F.semi.getPath('O', -110 * k, H / 2 + 231 * k, 700 * k).toPathData(2)}" fill="${GREEN}" opacity="0.05"/>`);
  el.push(`<rect width="${W}" height="${(4 * k).toFixed(1)}" fill="${ORANGE}"/>`);
  return el;
}

const svgFor = (title, W, H, el) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <title>${title}</title>
  ${el.join('\n  ')}
</svg>`;

// ---------------------------------------------------------------------------
// Eyecatch — 1280x670. Argument left, the median right, as the Theranos note
// eyecatch, so the magazine reads as one series.
// ---------------------------------------------------------------------------
function eyecatch() {
  const W = 1280, H = 670, M = 88, colW = 700;
  const el = backdrop(W, H);

  el.push(...wordmark(M, 116, 30));
  el.push(run('#AIとできたこと', M, 204, 22, MED, ORANGE));

  const head = ['投資判断の', 'ラストワンマイル'];
  const hSize = fitSize(head, 76, colW, BOLD);
  head.forEach((l, i) => el.push(run(l, M, 292 + i * hSize * 1.28, hSize, BOLD, WHITE)));

  const ruleY = 292 + hSize * 1.28 + 48;
  el.push(`<rect x="${M}" y="${ruleY.toFixed(1)}" width="64" height="3" fill="${ORANGE}"/>`);
  const deck = `${BENCH.n}件のピッチ資料を監査して見えたもの`;
  el.push(run(deck, M, ruleY + 62, fitSize([deck], 30, colW, MED), MED, WHITE, 0.82));

  el.push(...tracked(F.mono, 'ASKODIN.APP/JA', M, H - M + 6, 16, 5, WHITE, 0.5));

  // Right column: the median, with its denominator directly under it.
  const divX = 858;
  el.push(`<line x1="${divX}" y1="160" x2="${divX}" y2="${H - 110}" stroke="${WHITE}" stroke-width="1" opacity="0.12"/>`);
  const rcx = (divX + W) / 2 + 6;
  const lbl = 'CLARITY SCORE™';
  el.push(...trackedMid(F.monoMed, lbl, rcx, 204, 15, 4, WHITE, 0.55));
  el.push(runMid('中央値', rcx, 240, 22, MED, WHITE, 0.7));

  const n = 168, d = n * 0.24, gap = n * 0.05;
  const num = String(BENCH.median);
  const nW = latinW(F.light, num, n);
  const sx = rcx - (nW + gap + latinW(F.light, '/100', d)) / 2;
  el.push(latin(F.light, num, sx, 430, n, WHITE, 0.97), latin(F.light, '/100', sx + nW + gap, 430, d, WHITE, 0.42));

  el.push(...trackedMid(F.monoMed, `n = ${BENCH.n} DECKS`, rcx, 488, 15, 3, ORANGE, 0.95));
  el.push(...trackedMid(F.mono, '21 FEB – 19 MAR 2026', rcx, 520, 14, 3, WHITE, 0.45));
  return el;
}

// ---------------------------------------------------------------------------
// Figure — the verification pipeline, 1200x1500 portrait.
// note's article column is ~620px wide, so a portrait figure keeps the stage
// text near 19px on screen; a landscape flow would shrink it to ~11px.
// ---------------------------------------------------------------------------
const STAGES = [
  { no: '01', title: '非構造化資料', sub: ['PDF・スライド・Excel・メモ'] },
  { no: '02', title: 'Google Gemini API', sub: ['忠実なセマンティック抽出＆構造化', '元のページ番号・セル位置へのトレーサビリティを保持'], tag: 'EXTRACTION ONLY' },
  { no: '03', title: 'askOdin 決定論的コンパイラ', sub: ['セル単位の数理突合・前提の整合性検証'], tag: 'DETERMINISTIC', accent: true },
  { no: '04', title: '投資委員会（IC）向け監査ログ', sub: ['説明可能性を備えた客観的判定'] },
];

function pipeline() {
  const W = 1200, H = 1500, M = 96, inner = W - M * 2;
  const el = backdrop(W, H);

  el.push(...wordmark(M, 142, 30));
  el.push(...tracked(F.monoMed, '// VERIFICATION PIPELINE', M, 226, 17, 4.4, ORANGE, 0.95));
  el.push(run('実際の検証パイプライン', M, 300, 54, BOLD, WHITE));

  const arrow = 62;
  let y = 352;
  STAGES.forEach((st, i) => {
    // Boxes grow with their description lines so a second line never spills.
    const boxH = 196 + (st.sub.length - 1) * 38;
    const stroke = st.accent ? GREEN : WHITE;
    el.push(`<rect x="${M}" y="${y}" width="${inner}" height="${boxH}" rx="6" fill="${st.accent ? GREEN : WHITE}" fill-opacity="${st.accent ? 0.1 : 0.025}" stroke="${stroke}" stroke-opacity="${st.accent ? 0.85 : 0.16}" stroke-width="${st.accent ? 2 : 1.2}"/>`);
    const px = M + 40;
    el.push(...tracked(F.monoMed, st.no, px, y + 62, 18, 3, st.accent ? GREEN : ORANGE, 1));
    if (st.tag) {
      const tw = trackedW(F.monoMed, st.tag, 14, 3);
      // Tags stay neutral: the green border already marks the compiler, and
      // green type on the dark ground loses contrast at note's column width.
      el.push(...tracked(F.monoMed, st.tag, M + inner - 40 - tw, y + 62, 14, 3, WHITE, 0.55));
    }
    const tSize = fitSize([st.title], 40, inner - 80, BOLD);
    el.push(run(st.title, px, y + 118, tSize, BOLD, WHITE));
    const sSize = fitSize(st.sub, 25, inner - 80, MED);
    st.sub.forEach((l, j) => el.push(run(l, px, y + 162 + j * sSize * 1.5, sSize, MED, WHITE, j === 0 ? 0.78 : 0.55)));
    y += boxH;
    if (i < STAGES.length - 1) {
      const cx = W / 2;
      el.push(`<line x1="${cx}" y1="${y + 12}" x2="${cx}" y2="${y + arrow - 20}" stroke="${WHITE}" stroke-width="2" opacity="0.35"/>`);
      el.push(`<path d="M${cx - 9} ${y + arrow - 22} L${cx + 9} ${y + arrow - 22} L${cx} ${y + arrow - 10} Z" fill="${WHITE}" opacity="0.35"/>`);
      y += arrow;
    }
  });

  el.push(...tracked(F.mono, 'ASKODIN.APP/JA', M, H - 70, 16, 5, WHITE, 0.45));
  return el;
}

// ---------------------------------------------------------------------------
// Figure — the benchmark, 1200x1200. The denominator line is mandatory: this
// card is the one most likely to be screenshotted away from the article.
// ---------------------------------------------------------------------------
function benchmark() {
  const W = 1200, H = 1200, M = 110, inner = W - M * 2, cx = W / 2;
  const el = backdrop(W, H);

  el.push(...wordmarkMid(cx, 170, 32));
  el.push(...trackedMid(F.monoMed, '// CLARITY BENCHMARK 2026', cx, 250, 17, 4.6, ORANGE, 0.95));
  el.push(runMid(`${BENCH.n}件のピッチ資料を監査した結果`, cx, 324, fitSize([`${BENCH.n}件のピッチ資料を監査した結果`], 46, inner, BOLD), BOLD, WHITE));

  el.push(runMid('Clarity Score™ 中央値', cx, 422, 26, MED, WHITE, 0.68));
  const n = 230, d = n * 0.24, gap = n * 0.05;
  const num = String(BENCH.median);
  const nW = latinW(F.light, num, n);
  const sx = cx - (nW + gap + latinW(F.light, '/100', d)) / 2;
  el.push(latin(F.light, num, sx, 632, n, WHITE, 0.97), latin(F.light, '/100', sx + nW + gap, 632, d, WHITE, 0.42));

  // 0–100 track: the median as a fill, the bottom band's upper edge marked at 50.
  const ty = 700, th = 16;
  const x50 = M + inner * 0.5;
  el.push(`<rect x="${M}" y="${ty}" width="${inner}" height="${th}" fill="${WHITE}" opacity="0.06"/>`);
  el.push(`<rect x="${M}" y="${ty}" width="${(inner * BENCH.median / 100).toFixed(1)}" height="${th}" fill="${ORANGE}"/>`);
  el.push(`<line x1="${x50}" y1="${ty - 16}" x2="${x50}" y2="${ty + th + 16}" stroke="${WHITE}" stroke-width="2.5" opacity="0.6"/>`);
  el.push(runMid('50', x50, ty + th + 46, 18, MED, WHITE, 0.6));
  el.push(...tracked(F.mono, '0', M, ty + th + 46, 16, 0, WHITE, 0.4));
  el.push(latin(F.mono, '100', M + inner - latinW(F.mono, '100', 16), ty + th + 46, 16, WHITE, 0.4));

  el.push(`<rect x="${cx - 32}" y="848" width="64" height="3" fill="${ORANGE}"/>`);
  const stat = BENCH.bottomBand;
  const tail = 'が50点未満（最下位帯）';
  const sSize = 64, tSize = 36;
  const total = latinW(F.light, stat, sSize) + 10 + widthOf(tail, tSize, MED);
  const x0 = cx - total / 2;
  el.push(latin(F.light, stat, x0, 950, sSize, ORANGE));
  el.push(run(tail, x0 + latinW(F.light, stat, sSize) + 10, 950, tSize, MED, WHITE, 0.9));

  const src = `n = ${BENCH.n}・単一エンジンバージョン・${BENCH.window}に採点`;
  el.push(runMid(src, cx, 1040, fitSize([src], 20, inner, MED), MED, WHITE, 0.45));
  return el;
}

// ---------------------------------------------------------------------------
// Figure — GSE 2026 Osaka, 1280x670. Dates and venues quoted from /ja.
// ---------------------------------------------------------------------------
const SCHEDULE = [
  ['10月5日（月）', '中之島'],
  ['10月6日（火）〜7日（水）', 'グラングリーン大阪'],
  ['10月8日（木）', '梅田'],
];

function gse() {
  const W = 1280, H = 670, M = 88;
  const el = backdrop(W, H);

  el.push(...wordmark(M, 116, 30));
  el.push(...tracked(F.monoMed, 'GLOBAL STARTUP EXPO 2026 · OSAKA', M, 204, 15, 4, ORANGE, 0.95));
  const head = ['10月、大阪', 'GSE2026の現地にて'];
  const hSize = fitSize(head, 60, 520, BOLD);
  head.forEach((l, i) => el.push(run(l, M, 290 + i * hSize * 1.3, hSize, BOLD, WHITE)));
  const ruleY = 290 + hSize * 1.3 + 46;
  el.push(`<rect x="${M}" y="${ruleY.toFixed(1)}" width="64" height="3" fill="${ORANGE}"/>`);
  el.push(run('ソニー Boundary Spanning Service 参画', M, ruleY + 58, 24, MED, WHITE, 0.78));
  el.push(...tracked(F.mono, 'ASKODIN.APP/JA', M, H - M + 6, 16, 5, WHITE, 0.5));

  // Right: the schedule as a ruled list, as on /ja.
  const L = 680, R = W - M;
  el.push(run('個別面談・PoCのご相談', L, 204, 20, MED, GREEN));
  let y = 236;
  el.push(`<line x1="${L}" y1="${y}" x2="${R}" y2="${y}" stroke="${WHITE}" stroke-width="1" opacity="0.14"/>`);
  for (const [date, venue] of SCHEDULE) {
    el.push(run(date, L, y + 58, 21, MED, WHITE, 0.95));
    el.push(runRight(venue, R, y + 58, 21, MED, WHITE, 0.62));
    y += 92;
    el.push(`<line x1="${L}" y1="${y}" x2="${R}" y2="${y}" stroke="${WHITE}" stroke-width="1" opacity="0.14"/>`);
  }
  return el;
}

// ---------------------------------------------------------------------------
async function emit(dir, name, W, H, el, title, sizes) {
  const file = path.join(SVG_DIR, `${name}.svg`);
  fs.writeFileSync(file, svgFor(title, W, H, el));
  const buf = fs.readFileSync(file);
  for (const [w, h, suffix] of sizes) {
    await sharp(buf, { density: 300 }).resize(w, h, { fit: 'fill' }).png().toFile(path.join(dir, `${name}${suffix}.png`));
  }
  console.log(`  ${name}: ${sizes.map(([w, h]) => `${w}x${h}`).join(', ')}`);
}

async function main() {
  console.log('=== note × Gemini (#AIとできたこと) — JA article images ===\n');
  await emit(BANNER_DIR, 'askOdin-gemini-note-ja', 1280, 670, eyecatch(), 'askOdin — 投資判断のラストワンマイル — note eyecatch',
    [[1280, 670, ''], [1920, 1006, '-1920'], [2560, 1340, '-2x']]);
  await emit(CARD_DIR, 'askOdin-gemini-note-ja-pipeline', 1200, 1500, pipeline(), 'askOdin — 実際の検証パイプライン',
    [[1200, 1500, ''], [2400, 3000, '-2x']]);
  await emit(CARD_DIR, 'askOdin-gemini-note-ja-benchmark', 1200, 1200, benchmark(), 'askOdin — Clarity Benchmark 2026 (JA)',
    [[1200, 1200, ''], [2400, 2400, '-2x']]);
  await emit(CARD_DIR, 'askOdin-gemini-note-ja-gse', 1280, 670, gse(), 'askOdin — GSE 2026 Osaka',
    [[1280, 670, ''], [2560, 1340, '-2x']]);
  console.log(`\nWrote ${ASSET_DIR}/`);
}

main().catch((err) => { console.error(err); process.exit(1); });
