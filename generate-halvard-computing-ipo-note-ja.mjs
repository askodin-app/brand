import opentype from 'opentype.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// note.com eyecatch + in-article figures — The Halvard Dilemma (JA)
//
// Japanese edition of askodin.app/research/halvard-computing-ipo/ (pubDate
// 2026-10-26). The note post is its own publication moment, so the folder is
// dated to the note publication date — change DATE if it ships on another day.
// note URLs carry no readable slug, so the folder takes the page's slug plus
// -note-ja, as generate-xai-note-ja.mjs does.
//
// ── Copy provenance ──────────────────────────────────────────────────────────
// Figures are the English article's (the Clarity run of 12 Oct 2026, RUNE
// v4.3), restated here in 億米ドル: 28.89bn = 288.9億, 24.1bn = 241億, 4.8bn =
// 48億. No yen conversion — the source states none, and a card that travels
// without the article cannot carry an FX rate it does not date.
//
// The Japanese wording starts from a pasted note.com draft and was corrected
// against the English MDX line by line (2026-10-26), where the draft had
// drifted stronger than the source:
//   「主張の虚偽を警告」   → 「主張をシンジケートデスクに指摘」 (EN: "flag the assertion")
//   「大半に法的拘束力がない」→ 「すべてが契約済ではない」 (EN: "not all contracted")
//   目論見書             → データルーム (Clarity read a data room, not a prospectus)
// Checked by hand against the JA rules in
// askodin-coming-soon/scripts/check-compliance-lexicon.mjs: no retention,
// isolation, training, guideline or 排除 claim.
//
// Layout mirrors the English set (generate-halvard-computing-ipo.mjs).
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
const SURFACE = '#1A1A2E';
const WHITE = '#FFFFFF';
const MUTED = '#8899AA';
const KILL = '#C62828';
const WATCH = '#F9A825';

const DATE = '20261026';
const SLUG = 'halvard-computing-ipo-note-ja';
const ASSET_DIR = `./output/social/${DATE}-${SLUG}`;
const PNG_DIR = path.join(ASSET_DIR, 'banners');
const FIG_DIR = path.join(ASSET_DIR, 'cards');
const SVG_DIR = path.join(ASSET_DIR, 'svg');
for (const d of [PNG_DIR, FIG_DIR, SVG_DIR]) fs.mkdirSync(d, { recursive: true });

const EYEBROW = '// FORENSIC CASE STUDY · SYNTHETIC IPO';
const HEAD = ['架空AIネオクラウドのIPOを', 'Claudeで作り、監査した結果'];
const DECK = ['矛盾は、ページとページの間にある。'];

// Every figure's denominator.
const SOURCE = '架空の15ファイル・データルーム ・ askOdin Clarity ・ RUNE v4.3 ・ 2026年10月12日実行 ・ 企業・拠点・契約相手はすべて架空';

const PILLARS = [
  { label: '課題の定義', score: 15, findings: ['特記事項なし'] },
  { label: '解決策の論理', score: 12, findings: ['未手当ての設備投資計画', '稼働容量の不一致'] },
  { label: '市場の裏付け', score: 6, findings: ['「契約済」パイプライン'] },
  { label: '事業物理法則', score: 5, findings: ['ベンダーファイナンス'] },
  { label: 'ディール構造', score: 5, findings: ['特記事項なし'] },
];
const PRESENTATION = 43;
const PENALTY = 20;
if (PILLARS.reduce((a, p) => a + p.score, 0) !== PRESENTATION) throw new Error('Pillars no longer sum to 43 — check the article');

const SEVERITY = { 致命的: KILL, 重大: WATCH, 軽微: MUTED };

// [severity, title, [ref, claim lines], [ref, contradiction lines]]
const FINDINGS = [
  ['致命的', '「全額調達済み」の建設資金が約48億ドル不足',
    ['スライド10', ['約241億米ドルの資本で、2028年度まで「全額調達済み」']],
    ['スライド9', ['2026〜2028年度の設備投資は288.9億米ドル']]],
  ['致命的', '「契約済収益」のすべてが契約済ではない',
    ['スライド2・5', ['144億米ドルの「契約済収益」']],
    ['脚注1', ['法的拘束力のない基本合意書と', '「パートナー支援型オフテイク」を含む']]],
  ['重大', 'ベンダーファイナンスの資金が逆流している',
    ['スライド7', ['Aurelionの約100億米ドルの信用供与で、', 'ハードウェアを「全額前払いなしに」展開']],
    ['スライド13', ['IPO調達資金の62%が、ビンタン第1期の', 'アクセラレータ代金としてAurelionへ']]],
  ['軽微', '稼働メガワット数が一致しない',
    ['スライド6', ['稼働中48MW（Glen Esk 12MW、Sydney 36MW）']],
    ['スライド9', ['通電容量は2025年度末0MW、2026年度末30MW']]],
];

// ── Mixed-script text, set glyph by glyph (as generate-xai-note-ja.mjs) ──────
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
const midT = (f, t, cx, y, size, track, fill, op) => tracked(f, t, cx - trackedW(f, t, size, track) / 2, y, size, track, fill, op);

const jp = (weight) => ({ font: weight === 'bold' ? F.semi : F.medium, jpFont: weight === 'bold' ? F.jpBold : F.jpMedium });

function fitLine(line, size, opts, maxW) {
  const w = widthOf(line, size, opts.font, opts.jpFont);
  if (w > maxW) throw new Error(`"${line}" is ${w.toFixed(0)}px at ${size}px — column is ${maxW.toFixed(0)}px. Re-break it.`);
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
  el.push(`<path d="${F.semi.getPath('O', -110, 566, 700).toPathData(2)}" fill="${GREEN}" opacity="0.05"/>`);
  el.push(`<rect width="${W}" height="4" fill="${ORANGE}"/>`);
  return el;
}

function eyecatchSvg() {
  const el = backdrop();
  const colW = 700;

  const askW = latinW(F.semi, 'ask', 30);
  el.push(latin(F.semi, 'ask', MARGIN, 116, 30, ORANGE), latin(F.semi, 'Odin', MARGIN + askW, 116, 30, GREEN));
  el.push(...tracked(F.monoMed, EYEBROW, MARGIN, 204, 14, 3.4, ORANGE, 0.95));

  const headOpts = jp('bold');
  const headSize = Math.min(52, ...HEAD.map((l) => colW / widthOf(l, 1, headOpts.font, headOpts.jpFont)));
  HEAD.forEach((line, i) => el.push(run(line, MARGIN, 282 + i * headSize * 1.36, headSize, { ...headOpts, fill: WHITE })));

  const ruleY = 282 + headSize * 1.36 + 50;
  el.push(`<rect x="${MARGIN}" y="${ruleY}" width="64" height="3" fill="${ORANGE}"/>`);

  const deckOpts = jp('medium');
  const deckSize = Math.min(30, ...DECK.map((l) => colW / widthOf(l, 1, deckOpts.font, deckOpts.jpFont)));
  DECK.forEach((line, i) =>
    el.push(run(line, MARGIN, ruleY + 60 + i * deckSize * 1.6, deckSize, { ...deckOpts, fill: WHITE, opacity: 0.85 })));

  el.push(...tracked(F.mono, 'ASKODIN.APP/JA', MARGIN, H - MARGIN + 6, 16, 5, WHITE, 0.5));

  // Right column: the verdict.
  const divX = 858;
  el.push(`<line x1="${divX}" y1="160" x2="${divX}" y2="${H - 110}" stroke="${WHITE}" stroke-width="1" opacity="0.12"/>`);
  const rcx = (divX + W) / 2 + 6;
  el.push(...midT(F.monoMed, 'CLARITY SCORE', rcx, 204, 15, 4, WHITE, 0.55));

  const n = 210;
  const d = n * 0.24;
  const nW = latinW(F.light, '0', n);
  const sx = rcx - (nW + n * 0.05 + latinW(F.light, '/100', d)) / 2;
  el.push(latin(F.light, '0', sx, 412, n, ORANGE), latin(F.light, '/100', sx + nW + n * 0.05, 412, d, WHITE, 0.42));

  const tag = 'KILL SHOT';
  const tw = trackedW(F.monoMed, tag, 15, 3);
  const tx = rcx - (10 + 12 + tw) / 2;
  el.push(`<rect x="${tx}" y="${470 - 11.5}" width="10" height="10" fill="${KILL}"/>`);
  el.push(...tracked(F.monoMed, tag, tx + 22, 470, 15, 3, WHITE, 0.82));
  el.push(...midT(F.mono, 'NARRATIVE MASKING', rcx, 500, 12, 3, WHITE, 0.42));
  el.push(...midT(F.mono, 'SYNTHETIC · ALL FICTIONAL', rcx, H - MARGIN + 6, 12, 3, WHITE, 0.36));

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <title>askOdin — note.com eyecatch — The Halvard Dilemma (JA)</title>
  ${el.join('\n  ')}
</svg>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Audio cover — square, for note's audio embed
//
// note's help centre recommends a 1:1 cover for embedded audio (10MB max, jpg
// or png); the retired audio post type asked for 1000x1000 or larger. 1400 is
// drawn, matching the podcast show art. It is shown small beside a player, so
// it carries only the wordmark, the title and the score — the eyecatch's
// argument column would be unreadable at that size.
// ─────────────────────────────────────────────────────────────────────────────
const AS = 1400;

function audioCoverSvg() {
  const S = AS;
  const cx = S / 2;
  const el = [`<rect width="${S}" height="${S}" fill="${DARK}"/>`];
  el.push(`<defs><linearGradient id="gridFadeSq" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="${WHITE}" stop-opacity="0.05"/>
    <stop offset="55%" stop-color="${WHITE}" stop-opacity="0.022"/>
    <stop offset="100%" stop-color="${WHITE}" stop-opacity="0"/>
  </linearGradient></defs>`);
  for (let x = 0; x <= S; x += 70) el.push(`<line x1="${x}" y1="0" x2="${x}" y2="${S}" stroke="url(#gridFadeSq)" stroke-width="1"/>`);
  for (let y = 70; y < S; y += 70) el.push(`<line x1="0" y1="${y}" x2="${S}" y2="${y}" stroke="url(#gridFadeSq)" stroke-width="1"/>`);
  el.push(`<path d="${F.semi.getPath('O', -160, S / 2 + 420, 1400).toPathData(2)}" fill="${GREEN}" opacity="0.05"/>`);
  el.push(`<rect width="${S}" height="10" fill="${ORANGE}"/>`);

  const centreRun = (t, y, size, opts) => run(t, cx - widthOf(t, size, opts.font, opts.jpFont) / 2, y, size, opts);

  const wm = 64;
  const askW = latinW(F.semi, 'ask', wm);
  const wx = cx - (askW + latinW(F.semi, 'Odin', wm)) / 2;
  el.push(latin(F.semi, 'ask', wx, 190, wm, ORANGE), latin(F.semi, 'Odin', wx + askW, 190, wm, GREEN));

  // Title: the eyecatch's two lines, set as large as the measure allows.
  const measure = S - 220;
  const hOpts = jp('bold');
  const hSize = Math.min(84, ...HEAD.map((l) => measure / widthOf(l, 1, hOpts.font, hOpts.jpFont)));
  HEAD.forEach((line, i) => el.push(centreRun(line, 370 + i * hSize * 1.34, hSize, { ...hOpts, fill: WHITE })));

  // The score.
  const n = 440;
  const d = n * 0.24;
  const nW = latinW(F.light, '0', n);
  const sx = cx - (nW + n * 0.05 + latinW(F.light, '/100', d)) / 2;
  el.push(...midT(F.monoMed, 'CLARITY SCORE', cx, 640, 28, 7, WHITE, 0.55));
  el.push(latin(F.light, '0', sx, 1010, n, ORANGE), latin(F.light, '/100', sx + nW + n * 0.05, 1010, d, WHITE, 0.42));

  const tag = 'KILL SHOT';
  const tw = trackedW(F.monoMed, tag, 30, 6);
  const tx = cx - (20 + 22 + tw) / 2;
  el.push(`<rect x="${tx}" y="${1100 - 23}" width="20" height="20" fill="${KILL}"/>`);
  el.push(...tracked(F.monoMed, tag, tx + 42, 1100, 30, 6, WHITE, 0.85));

  el.push(`<rect x="${cx - 50}" y="1162" width="100" height="4" fill="${ORANGE}"/>`);
  const dOpts = jp('medium');
  el.push(centreRun(DECK[0], 1238, 40, { ...dOpts, fill: WHITE, opacity: 0.85 }));
  el.push(...midT(F.mono, 'ASKODIN.APP/JA · SYNTHETIC · ALL FICTIONAL', cx, 1320, 20, 5, WHITE, 0.4));

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${S} ${S}" width="${S}" height="${S}">
  <title>askOdin — note.com audio cover — The Halvard Dilemma (JA)</title>
  ${el.join('\n  ')}
</svg>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// In-article figures — note.com has no table block
//
// 1280 wide, body at 32px, so a phone showing the image at ~360px still renders
// the text near 9–10px. Line breaks are placed by hand at phrase boundaries and
// fitLine() throws if one overruns.
// ─────────────────────────────────────────────────────────────────────────────
const FW = 1280;
const FM = 80;
const FR = FW - FM;
const BODY = 32;
const LEAD = 1.55;

const hline = (y, x1 = FM, x2 = FR, op = 0.12) =>
  `<line x1="${x1}" y1="${y.toFixed(1)}" x2="${x2}" y2="${y.toFixed(1)}" stroke="${WHITE}" stroke-width="1" opacity="${op}"/>`;
const square = (x, baseline, size, color) =>
  `<rect x="${x.toFixed(1)}" y="${(baseline - size * 0.78).toFixed(1)}" width="${(size * 0.62).toFixed(1)}" height="${(size * 0.62).toFixed(1)}" rx="2" fill="${color}"/>`;

function figureChrome(h, title) {
  const el = [`<rect width="${FW}" height="${h}" fill="${DARK}"/>`, `<rect width="${FW}" height="4" fill="${ORANGE}"/>`];
  const askW = latinW(F.semi, 'ask', 24);
  el.push(latin(F.semi, 'ask', FM, 92, 24, ORANGE), latin(F.semi, 'Odin', FM + askW, 92, 24, GREEN));
  const t = 'ASKODIN.APP/JA';
  el.push(...tracked(F.mono, t, FR - trackedW(F.mono, t, 14, 4), 90, 14, 4, WHITE, 0.4));
  el.push(run(title, FM, 176, 44, { ...jp('bold'), fill: WHITE }));
  return el;
}

function footer(y) {
  const size = 18;
  fitLine(SOURCE, size, jp('medium'), FR - FM);
  return { el: [hline(y), run(SOURCE, FM, y + 48, size, { ...jp('medium'), fill: WHITE, opacity: 0.45 })], h: y + 92 };
}

// Figure 1 — 監査結果の概要
function glanceSvg() {
  const rows = [
    ['データルーム', ['15ファイル（PDF 12件、XLSX 3件）']],
    ['主ドキュメント', ['01_Investor_Presentation_IPO_Sep2026.pdf'], { mono: true }],
    ['プレゼンテーション点', ['43 / 100']],
    ['ペナルティ', ['−20：自社の設備投資計画と矛盾する', '「全額調達済み」の主張']],
    ['JUDGE判定', ['Narrative Masking（論理隠蔽）・キルショット'], { kill: true }],
    ['Clarityスコア', ['0 / 100'], { score: true }],
    ['所見', null, { severity: true }],
    ['次の一手（ブリーフ記載）', ['アロケーションを否決。「全額調達済み」の', '主張をシンジケートデスクに指摘。']],
  ];
  const labelX = FM + 32;
  const valX = FM + 400;
  const valW = FR - 32 - valX;
  const top = 236;
  const body = [];
  let y = top + 34;
  const strip = 'ASKODIN CLARITY · HALVARD COMPUTING IPO · 12 OCT 2026 · RUNE PROTOCOL v4.3';
  body.push(...tracked(F.mono, strip, labelX, y + 8, 13, 2.2, WHITE, 0.5));
  y += 34;
  body.push(hline(y, FM, FR, 0.14));

  rows.forEach(([label, lines, opt = {}], i) => {
    y += 64;
    body.push(run(label, labelX, y - 2, 22, { ...jp('medium'), fill: WHITE, opacity: 0.5 }));
    if (opt.severity) {
      let x = valX;
      for (const [sev, nn] of [['致命的', 2], ['重大', 1], ['軽微', 1]]) {
        const t = `${sev} ${nn}`;
        body.push(square(x, y, BODY, SEVERITY[sev]));
        body.push(run(t, x + BODY * 0.95, y, BODY, { ...jp('medium'), fill: WHITE, opacity: 0.94 }));
        x += BODY * 0.95 + widthOf(t, BODY, F.medium, F.jpMedium) + 40;
      }
    } else if (opt.score) {
      body.push(latin(F.medium, lines[0], valX, y + 8, 44, ORANGE));
      y += 10;
    } else if (opt.mono) {
      body.push(latin(F.mono, lines[0], valX, y, 23, WHITE, 0.94));
    } else {
      lines.forEach((line, j) => {
        fitLine(line, BODY, jp('medium'), valW);
        body.push(run(line, valX, y + j * BODY * LEAD, BODY, { ...jp('medium'), fill: opt.kill ? ORANGE : WHITE, opacity: opt.kill ? 1 : 0.94 }));
      });
      y += (lines.length - 1) * BODY * LEAD;
    }
    y += 28;
    if (i < rows.length - 1) body.push(hline(y, labelX, FR - 32, 0.07));
  });
  y += 12;

  const foot = footer(y + 60);
  const el = figureChrome(foot.h, '監査結果の概要');
  el.push(`<rect x="${FM}" y="${top}" width="${FR - FM}" height="${(y - top).toFixed(1)}" rx="10" fill="${SURFACE}" stroke="${WHITE}" stroke-opacity="0.12"/>`);
  el.push(...body, ...foot.el);
  return { h: foot.h, svg: el };
}

// Figure 2 — 5つの柱とスコアの推移
function pillarsSvg() {
  const barX = FM + 300;
  const barW = 260;
  const scoreR = barX + barW + 140;
  const findX = scoreR + 44;
  const findW = FR - findX;
  const body = [];
  let y = 262;

  body.push(run('評価軸', FM, y, 22, { ...jp('medium'), fill: WHITE, opacity: 0.5 }));
  body.push(run('スコア', scoreR - widthOf('スコア', 22, F.medium, F.jpMedium), y, 22, { ...jp('medium'), fill: WHITE, opacity: 0.5 }));
  body.push(run('検出された所見', findX, y, 22, { ...jp('medium'), fill: WHITE, opacity: 0.5 }));
  y += 24;
  body.push(hline(y, FM, FR, 0.3));

  for (const p of PILLARS) {
    y += 64;
    body.push(run(p.label, FM, y, BODY, { ...jp('medium'), fill: WHITE, opacity: 0.92 }));
    const weak = p.score <= 6;
    body.push(`<rect x="${barX}" y="${y - 18}" width="${barW}" height="14" fill="${WHITE}" opacity="0.06"/>`);
    body.push(`<rect x="${barX}" y="${y - 18}" width="${(barW * p.score / 20).toFixed(1)}" height="14" fill="${weak ? ORANGE : WHITE}" opacity="${weak ? 1 : 0.4}"/>`);
    const st = `${p.score} / 20`;
    body.push(latin(F.monoMed, st, scoreR - latinW(F.monoMed, st, 27), y, 27, weak ? ORANGE : WHITE, weak ? 1 : 0.8));
    const none = p.findings[0] === '特記事項なし';
    p.findings.forEach((line, j) => {
      fitLine(line, 26, jp('medium'), findW);
      body.push(run(line, findX, y + j * 40, 26, { ...jp('medium'), fill: WHITE, opacity: none ? 0.4 : 0.85 }));
    });
    y += (p.findings.length - 1) * 40 + 30;
    body.push(hline(y, FM, FR, 0.08));
  }

  y += 170;
  const steps = [
    { n: String(PRESENTATION), lbl: 'プレゼンテーション点', fill: WHITE, op: 0.92 },
    { n: `−${PENALTY}`, lbl: '「全額調達済み」減点', fill: WHITE, op: 0.92 },
    { n: String(PRESENTATION - PENALTY), lbl: '本来の着地点', fill: WHITE, op: 0.4 },
    { n: '0', lbl: 'JUDGEキルショット', fill: ORANGE, op: 1, kill: true },
  ];
  const colW = (FR - FM) / steps.length;
  steps.forEach((st, i) => {
    const cx = FM + colW * i + colW / 2;
    body.push(latin(F.light, st.n, cx - latinW(F.light, st.n, 92) / 2, y, 92, st.fill, st.op));
    const lw = widthOf(st.lbl, 22, F.medium, F.jpMedium);
    body.push(run(st.lbl, cx - lw / 2, y + 52, 22, { ...jp('medium'), fill: WHITE, opacity: 0.6 }));
    if (i < steps.length - 1) {
      const ax = FM + colW * (i + 1);
      body.push(`<path d="M${ax - 12},${y - 50} l12,12 l-12,12" fill="none" stroke="${WHITE}" stroke-opacity="0.3" stroke-width="2"/>`);
    }
    if (st.kill) body.push(`<rect x="${(cx - 7).toFixed(1)}" y="${y + 76}" width="14" height="14" fill="${KILL}"/>`);
  });
  y += 150;

  const cap = 'キルショットが1件でも検出されれば、スコアは0に固定される。';
  fitLine(cap, 28, jp('medium'), FR - FM);
  body.push(run(cap, FM, y + 20, 28, { ...jp('medium'), fill: WHITE, opacity: 0.78 }));

  const foot = footer(y + 80);
  const el = figureChrome(foot.h, '5つの柱と、スコアが0になるまで');
  el.push(...body, ...foot.el);
  return { h: foot.h, svg: el };
}

// Figure 3 — 検出された4つの矛盾
function findingsSvg() {
  const refX = FM + 64;
  const textX = refX + 210;
  const textW = FR - textX;
  const S = 28;
  const body = [];
  let y = 220;

  FINDINGS.forEach(([sev, title, says, against], i) => {
    y += 80;
    body.push(...tracked(F.monoMed, String(i + 1).padStart(2, '0'), FM, y, 20, 2, ORANGE, 0.95));
    body.push(square(refX, y, 26, SEVERITY[sev]));
    body.push(run(sev, refX + 28, y - 2, 22, { ...jp('medium'), fill: WHITE, opacity: 0.7 }));
    const tx = refX + 28 + widthOf('致命的', 22, F.medium, F.jpMedium) + 28;
    fitLine(title, 32, jp('bold'), FR - tx);
    body.push(run(title, tx, y, 32, { ...jp('bold'), fill: WHITE }));

    for (const [kind, [ref, lines]] of [['says', says], ['against', against]]) {
      y += 58;
      body.push(run(ref, refX, y, 22, { ...jp('medium'), fill: kind === 'says' ? WHITE : ORANGE, opacity: kind === 'says' ? 0.55 : 0.95 }));
      lines.forEach((line, j) => {
        fitLine(line, S, jp('medium'), textW);
        body.push(run(line, textX, y + j * S * LEAD, S, { ...jp('medium'), fill: WHITE, opacity: kind === 'says' ? 0.7 : 0.94 }));
      });
      y += (lines.length - 1) * S * LEAD;
    }
    y += 42;
    if (i < FINDINGS.length - 1) body.push(hline(y));
  });

  const foot = footer(y + 40);
  const el = figureChrome(foot.h, '検出された4つの矛盾');
  el.push(...body, ...foot.el);
  return { h: foot.h, svg: el };
}

async function emitFigure(name, { h, svg }, title) {
  const hh = Math.round(h);
  const doc = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${FW} ${hh}" width="${FW}" height="${hh}">
  <title>${title}</title>
  ${svg.join('\n  ')}
</svg>`;
  fs.writeFileSync(path.join(SVG_DIR, `${name}.svg`), doc);
  const buf = Buffer.from(doc);
  for (const [k, suffix] of [[1, ''], [2, '-2x']]) {
    const file = path.join(FIG_DIR, `${name}${suffix}.png`);
    await sharp(buf, { density: 72 * k * 2 }).resize(FW * k, hh * k, { fit: 'fill' }).png().toFile(file);
    console.log(`  ${path.basename(file).padEnd(40)} ${FW * k}x${hh * k}  ${(fs.statSync(file).size / 1024).toFixed(0)}KB`);
  }
}

async function main() {
  console.log('=== note.com — The Halvard Dilemma (JA) ===\n');
  const name = 'askOdin-halvard-note-ja';
  fs.writeFileSync(path.join(SVG_DIR, `${name}.svg`), eyecatchSvg());
  const buf = fs.readFileSync(path.join(SVG_DIR, `${name}.svg`));
  for (const [w, h, suffix] of [[1280, 670, ''], [1920, 1006, '-1920'], [2560, 1340, '-2x']]) {
    const file = path.join(PNG_DIR, `${name}${suffix}.png`);
    await sharp(buf, { density: 300 }).resize(w, h, { fit: 'fill' }).png().toFile(file);
    console.log(`  ${path.basename(file).padEnd(40)} ${w}x${h}  ${(fs.statSync(file).size / 1024).toFixed(0)}KB`);
  }

  const audio = 'askOdin-halvard-note-ja-audio';
  fs.writeFileSync(path.join(SVG_DIR, `${audio}.svg`), audioCoverSvg());
  const abuf = fs.readFileSync(path.join(SVG_DIR, `${audio}.svg`));
  for (const [w, suffix] of [[AS, ''], [AS * 2, '-2x']]) {
    const file = path.join(PNG_DIR, `${audio}${suffix}.png`);
    await sharp(abuf, { density: 300 }).resize(w, w, { fit: 'fill' }).png().toFile(file);
    console.log(`  ${path.basename(file).padEnd(40)} ${w}x${w}  ${(fs.statSync(file).size / 1024).toFixed(0)}KB`);
  }

  console.log('\ncards/  (in-article tables; note.com has no table block)');
  await emitFigure('askOdin-halvard-note-ja-glance', glanceSvg(), 'askOdin — 監査結果の概要');
  await emitFigure('askOdin-halvard-note-ja-pillars', pillarsSvg(), 'askOdin — 5つの柱と、スコアが0になるまで');
  await emitFigure('askOdin-halvard-note-ja-findings', findingsSvg(), 'askOdin — 検出された4つの矛盾');
  console.log(`\nWrote ${ASSET_DIR}/\n`);
}

main().catch((err) => { console.error(err); process.exit(1); });
