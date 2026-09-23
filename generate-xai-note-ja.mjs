import opentype from 'opentype.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// note.com eyecatch — 説明可能なAI（XAI）と「判断インフラ」の決定的な違い
//
// Hero image for the Japanese version of "Judgment Infrastructure vs.
// Explainable AI" (askodin.app/comparisons/judgment-infrastructure-vs-xai/,
// datePublished 2026-09-22). The note post is its own publication moment, so
// the folder is dated to the note publication date — change DATE if it ships
// on another day. note URLs carry no readable slug, so the folder takes the
// page's slug plus -note-ja, as generate-theranos-note-ja.mjs does.
//
// ── Copy provenance ──────────────────────────────────────────────────────────
// Headline and deck are quoted from the note.com section of
// askodin-coming-soon/Distribution_Judgment_Infrastructure_vs_XAI.md: the note
// title split at its dash, and the post's opening line. 「説明可能だが、間違って
// いる」 is the 致命的な失敗 row of the note's comparison table. Nothing is
// translated or reworded here. Checked by hand against the JA rules in
// askodin-coming-soon/scripts/check-compliance-lexicon.mjs (2026-09-22): no
// hits — no retention, isolation, training, guideline or 排除 claim.
//
// The 72% / 31% case is illustrative in every channel, so ILLUSTRATIVE rides
// with the figures here too. (例示 would need 例 in the Noto subset.)
//
// Layout mirrors the English OG (generate-judgment-infrastructure-vs-xai.mjs):
// argument left, the case right, so the two read as one piece.
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
const GREEN_TEXT = '#2FA37A';
const DARK = '#111119';
const WHITE = '#FFFFFF';
const WATCH = '#F9A825';

const DATE = '20260922';
const SLUG = 'judgment-infrastructure-vs-xai-note-ja';
const ASSET_DIR = `./output/social/${DATE}-${SLUG}`;
const PNG_DIR = path.join(ASSET_DIR, 'banners');
const SVG_DIR = path.join(ASSET_DIR, 'svg');
for (const d of [PNG_DIR, SVG_DIR]) fs.mkdirSync(d, { recursive: true });

const EYEBROW = '// INSPECTION IS NOT ENFORCEMENT';
// Broken at the particle, so the display size can stay large.
const HEAD = ['説明可能なAI（XAI）と', '「判断インフラ」の決定的な違い'];
const DECK = ['点検は、執行ではない。'];
const VERDICT = '説明可能だが、間違っている。';

// note.com's spec: 1280x670 (1.91:1), 1920x1006 recommended for quality.
const W = 1280;
const H = 670;
const MARGIN = 88;

// ── Mixed-script text, set glyph by glyph (as generate-podcast-ep01-note-ja.mjs)
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
const widthOf = (str, size, font, jpFont) => [...str].reduce((w, ch) => w + advance(ch, size, font, jpFont), 0);

function run(str, x, y, size, { font, jpFont, fill, opacity = 1 }) {
  const parts = [];
  let cursor = x;
  for (const ch of str) {
    const f = faceFor(ch, font, jpFont);
    const d = f.getPath(ch, cursor, y, size).toPathData(3);
    if (d) parts.push(d);
    cursor += advance(ch, size, font, jpFont);
  }
  const op = opacity === 1 ? '' : ` opacity="${opacity}"`;
  return parts.length ? `<path d="${parts.join(' ')}" fill="${fill}"${op}/>` : '';
}

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

// House chrome, identical to the other note eyecatches so the magazine reads as
// one series.
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
  el.push(`<path d="${F.semi.getPath('O', -110, 566, 700).toPathData(2)}" fill="${GREEN}" opacity="0.05"/>`);
  el.push(`<rect width="${W}" height="4" fill="${ORANGE}"/>`);
  return el;
}

function eyecatchSvg() {
  const el = backdrop();
  const colW = 700;

  // Wordmark, top left.
  const askW = latinW(F.semi, 'ask', 30);
  el.push(latin(F.semi, 'ask', MARGIN, 116, 30, ORANGE), latin(F.semi, 'Odin', MARGIN + askW, 116, 30, GREEN));
  el.push(...tracked(F.monoMed, EYEBROW, MARGIN, 204, 16, 4.2, GREEN_TEXT, 1));

  const headOpts = { font: F.semi, jpFont: F.jpBold };
  const headSize = Math.min(52, ...HEAD.map((l) => colW / widthOf(l, 1, headOpts.font, headOpts.jpFont)));
  HEAD.forEach((line, i) => el.push(run(line, MARGIN, 282 + i * headSize * 1.36, headSize, { ...headOpts, fill: WHITE })));

  const ruleY = 282 + headSize * 1.36 + 50;
  el.push(`<rect x="${MARGIN}" y="${ruleY}" width="64" height="3" fill="${ORANGE}"/>`);

  const deckOpts = { font: F.medium, jpFont: F.jpMedium };
  const deckSize = Math.min(30, ...DECK.map((l) => colW / widthOf(l, 1, deckOpts.font, deckOpts.jpFont)));
  DECK.forEach((line, i) =>
    el.push(run(line, MARGIN, ruleY + 60 + i * deckSize * 1.6, deckSize, { ...deckOpts, fill: WHITE, opacity: 0.85 })));

  // The JA landing page, not the English root.
  el.push(...tracked(F.mono, 'ASKODIN.APP/JA', MARGIN, H - MARGIN + 6, 16, 5, WHITE, 0.5));

  // Right column: the case.
  const divX = 858;
  el.push(`<line x1="${divX}" y1="160" x2="${divX}" y2="${H - 110}" stroke="${WHITE}" stroke-width="1" opacity="0.12"/>`);
  const rcx = (divX + W) / 2 + 6;
  const midT = (f, t, cx, y, size, track, fill, op) => tracked(f, t, cx - trackedW(f, t, size, track) / 2, y, size, track, fill, op);
  el.push(...midT(F.monoMed, 'GROSS MARGIN', rcx, 204, 15, 4, WHITE, 0.55));

  // 72% muted (the cited slide), 31% orange (the model), hairline between.
  const figure = (v, cx, y, n, fill, op) => {
    const s = String(v);
    const p = n * 0.5;
    const nW = latinW(F.light, s, n);
    const x = cx - (nW + n * 0.03 + latinW(F.light, '%', p)) / 2;
    return [latin(F.light, s, x, y, n, fill, op), latin(F.light, '%', x + nW + n * 0.03, y, p, fill, op)];
  };
  const gap = 172;
  const fy = 342;
  el.push(...figure(72, rcx - gap / 2, fy, 78, WHITE, 0.5));
  el.push(...figure(31, rcx + gap / 2, fy, 78, ORANGE, 1));
  el.push(`<line x1="${rcx}" y1="${fy - 56}" x2="${rcx}" y2="${fy + 4}" stroke="${WHITE}" stroke-width="1" opacity="0.14"/>`);
  el.push(...midT(F.mono, 'DECK · SLIDE 14', rcx - gap / 2, fy + 36, 12, 2.6, WHITE, 0.5));
  el.push(...midT(F.mono, 'MODEL · TAB 11', rcx + gap / 2, fy + 36, 12, 2.6, WHITE, 0.7));

  const vSize = 22;
  const vW = widthOf(VERDICT, vSize, F.medium, F.jpMedium);
  el.push(run(VERDICT, rcx - vW / 2, 452, vSize, { font: F.medium, jpFont: F.jpMedium, fill: WHITE, opacity: 0.8 }));

  // Watch marker, as the English banners.
  const tag = 'CONFLICT HELD';
  const tw = trackedW(F.monoMed, tag, 15, 3);
  const tx = rcx - (10 + 12 + tw) / 2;
  el.push(`<rect x="${tx}" y="${506 - 11.5}" width="10" height="10" fill="${WATCH}"/>`);
  el.push(...tracked(F.monoMed, tag, tx + 22, 506, 15, 3, WHITE, 0.82));
  el.push(...midT(F.mono, 'ILLUSTRATIVE', rcx, H - MARGIN + 6, 13, 3.4, WHITE, 0.36));

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <title>askOdin — note.com eyecatch — Judgment Infrastructure vs. Explainable AI (JA)</title>
  ${el.join('\n  ')}
</svg>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// In-article figures — the two tables, as images
//
// note.com has no table block. The note text quotes both tables from the same
// syndication section as the eyecatch: the six-row comparison and the three
// generations (a list in the note body, set here as a figure so the pair reads
// as one series). Line breaks are placed by hand at phrase boundaries — a
// greedy wrap breaks Japanese mid-word — and fitLine() throws if one overruns,
// so a copy edit fails loudly instead of spilling past the column.
//
// Sized for note's column: 1280 wide, body at 34px, so a phone showing the
// image at ~360px still renders the text near 10px.
// ─────────────────────────────────────────────────────────────────────────────
const FW = 1280;
const FM = 80;
const BODY = 34;
const LEAD = 1.55;
const jp = (weight) => ({ font: weight === 'bold' ? F.semi : F.medium, jpFont: weight === 'bold' ? F.jpBold : F.jpMedium });

function fitLine(line, size, opts, maxW) {
  const w = widthOf(line, size, opts.font, opts.jpFont);
  if (w > maxW) throw new Error(`"${line}" is ${w.toFixed(0)}px at ${size}px — column is ${maxW}px. Re-break it.`);
}

function figureChrome(h, title) {
  const el = [`<rect width="${FW}" height="${h}" fill="${DARK}"/>`, `<rect width="${FW}" height="4" fill="${ORANGE}"/>`];
  const askW = latinW(F.semi, 'ask', 24);
  el.push(latin(F.semi, 'ask', FM, 92, 24, ORANGE), latin(F.semi, 'Odin', FM + askW, 92, 24, GREEN));
  const t = 'ASKODIN.APP/JA';
  el.push(...tracked(F.mono, t, FW - FM - trackedW(F.mono, t, 14, 4), 90, 14, 4, WHITE, 0.4));
  el.push(run(title, FM, 176, 44, { ...jp('bold'), fill: WHITE }));
  return el;
}

const hline = (y, x1 = FM, x2 = FW - FM, op = 0.12) =>
  `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${WHITE}" stroke-width="1" opacity="${op}"/>`;

// Copy quoted from the note section's comparison table. [label, xai lines, judgment lines]
const COMPARISON = [
  ['本質的な問い', ['「なぜAIはこの出力を', '生成したのか？」'], ['「この推論は、行動に移す', '基準を満たしているか？」']],
  ['位置づけ', ['モデルの機能', '（観測用レンズ）'], ['出力と意思決定の間に置かれる', '独立した検証レイヤー']],
  ['メカニズム', ['事後的な特徴量重み付け、', '引用リンク'], ['主張をロジックグラフに変換し、', '事業の物理的制約に照らして検証']],
  ['アウトプット', ['説明文と確信度スコア'], ['Clarity Score、判定、', 'SHA-256で文書に紐づく監査記録']],
  ['検証の担い手', ['人間が説明を読んだ後、', '手作業で検証'], ['署名の前にシステムが検証。', '署名と責任は人間に残る']],
  ['致命的な失敗', ['「説明可能だが、', '間違っている」'], ['致命的矛盾を検知すると停止し、', 'フラグを立てる']],
];

function comparisonSvg() {
  // The judgment cells run longer, so its column gets the extra width.
  const colW = 440;
  const lx = FM;
  const rx = FM + colW + 48;
  const rW = FW - FM - rx;
  const body = [];
  let y = 262;

  // Column heads. The judgment column sits on a faint green panel, drawn once
  // the table height is known.
  body.push(run('説明可能なAI（XAI）', lx, y, 28, { ...jp('bold'), fill: WHITE, opacity: 0.6 }));
  body.push(run('AI判断インフラ™', rx, y, 28, { ...jp('bold'), fill: GREEN_TEXT }));
  y += 30;
  body.push(hline(y, FM, FW - FM, 0.3));
  const panelTop = y;

  COMPARISON.forEach(([label, left, right], i) => {
    y += 62;
    const n = String(i + 1).padStart(2, '0');
    body.push(...tracked(F.monoMed, n, lx, y, 17, 2, ORANGE, 0.95));
    body.push(run(label, lx + 44, y, 24, { ...jp('medium'), fill: WHITE, opacity: 0.55 }));
    y += 56;
    const rows = Math.max(left.length, right.length);
    left.forEach((line, j) => {
      fitLine(line, BODY, jp('medium'), colW);
      body.push(run(line, lx, y + j * BODY * LEAD, BODY, { ...jp('medium'), fill: WHITE, opacity: 0.62 }));
    });
    right.forEach((line, j) => {
      fitLine(line, BODY, jp('medium'), rW - 48);
      body.push(run(line, rx + 24, y + j * BODY * LEAD, BODY, { ...jp('medium'), fill: WHITE, opacity: 0.96 }));
    });
    y += (rows - 1) * BODY * LEAD + 34;
    if (i < COMPARISON.length - 1) body.push(hline(y));
  });

  const h = y + 150;
  const el = figureChrome(h, '比較：XAIと判断インフラ');
  el.push(`<rect x="${rx}" y="${panelTop}" width="${FW - FM - rx}" height="${y - panelTop}" fill="${GREEN}" opacity="0.10"/>`);
  el.push(`<rect x="${rx}" y="${panelTop}" width="3" height="${y - panelTop}" fill="${GREEN}"/>`);
  el.push(...body);
  el.push(hline(y, FM, FW - FM, 0.3));
  // Closing line: the page's own verdict on the table.
  el.push(run('点検は、執行ではない。', FM, y + 84, 30, { ...jp('bold'), fill: ORANGE }));
  return { h, svg: el };
}

// Copy quoted from the note section's 三つの世代 list.
const GENERATIONS = [
  { name: '生成', aim: ['速度と流暢さ'], limit: ['ハルシネーション'], color: WHITE },
  { name: '点検（XAI）', aim: ['可視化と引用'], limit: ['説明できても、間違っている'], color: WHITE },
  { name: '執行（判断インフラ）', aim: ['行動前の検証'],
    limit: ['askOdinは「真実」ではなく「推論」を監査します。', '数字が内部で整合した捏造は、通過し得ます。'], color: GREEN_TEXT },
];

function generationsSvg() {
  const body = [];
  const tx = FM + 64;
  const labelW = 96;
  const textW = FW - FM - tx - labelW;
  let y = 262;
  body.push(hline(y - 32, FM, FW - FM, 0.3));

  GENERATIONS.forEach((g, i) => {
    y += 40;
    body.push(...tracked(F.monoMed, String(i + 1).padStart(2, '0'), FM, y, 20, 2, g.color === WHITE ? ORANGE : g.color, 1));
    body.push(run(g.name, tx, y, 40, { ...jp('bold'), fill: g.color }));
    const field = (label, lines, op) => {
      y += BODY * 1.9;
      body.push(run(label, tx, y, 24, { ...jp('medium'), fill: WHITE, opacity: 0.45 }));
      lines.forEach((line, j) => {
        fitLine(line, BODY, jp('medium'), textW);
        body.push(run(line, tx + labelW, y + j * BODY * LEAD, BODY, { ...jp('medium'), fill: WHITE, opacity: op }));
      });
      y += (lines.length - 1) * BODY * LEAD;
    };
    field('目的', g.aim, 0.9);
    field('限界', g.limit, 0.7);
    y += 56;
    if (i < GENERATIONS.length - 1) body.push(hline(y));
    y += 12;
  });

  const h = y + 50;
  const el = figureChrome(h, '三つの世代');
  el.push(...body);
  return { h, svg: el };
}

async function emitFigure(name, { h, svg }, title) {
  const doc = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${FW} ${h}" width="${FW}" height="${h}">
  <title>${title}</title>
  ${svg.join('\n  ')}
</svg>`;
  fs.writeFileSync(path.join(SVG_DIR, `${name}.svg`), doc);
  const buf = Buffer.from(doc);
  for (const [k, suffix] of [[1, ''], [2, '-2x']]) {
    const file = path.join(FIG_DIR, `${name}${suffix}.png`);
    await sharp(buf, { density: 72 * k * 2 }).resize(FW * k, Math.round(h * k), { fit: 'fill' }).png().toFile(file);
    console.log(`  ${path.basename(file).padEnd(36)} ${FW * k}x${Math.round(h * k)}  ${(fs.statSync(file).size / 1024).toFixed(0)}KB`);
  }
}

const FIG_DIR = path.join(ASSET_DIR, 'cards');
fs.mkdirSync(FIG_DIR, { recursive: true });

async function main() {
  console.log('=== note.com eyecatch — Judgment Infrastructure vs. XAI (JA) ===\n');
  const name = 'askOdin-xai-note-ja';
  fs.writeFileSync(path.join(SVG_DIR, `${name}.svg`), eyecatchSvg());
  const buf = fs.readFileSync(path.join(SVG_DIR, `${name}.svg`));

  for (const [w, h, suffix] of [[1280, 670, ''], [1920, 1006, '-1920'], [2560, 1340, '-2x']]) {
    const file = path.join(PNG_DIR, `${name}${suffix}.png`);
    await sharp(buf, { density: 300 }).resize(w, h, { fit: 'fill' }).png().toFile(file);
    console.log(`  ${path.basename(file).padEnd(36)} ${w}x${h}  ${(fs.statSync(file).size / 1024).toFixed(0)}KB`);
  }

  console.log('\ncards/  (in-article tables; note.com has no table block)');
  await emitFigure('askOdin-xai-note-ja-comparison', comparisonSvg(), 'askOdin — 比較：XAIと判断インフラ');
  await emitFigure('askOdin-xai-note-ja-generations', generationsSvg(), 'askOdin — 三つの世代');
  console.log(`\nWrote ${ASSET_DIR}/\n`);
}

main().catch((err) => { console.error(err); process.exit(1); });
