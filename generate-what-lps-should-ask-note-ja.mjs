import opentype from 'opentype.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// note.com eyecatch + checklist figure — LPがGPに問うべきAIデューデリジェンスの7つの質問
//
// Japanese version of "What LPs Should Ask Their GPs About AI Diligence"
// (askodin.app/insights/what-lps-should-ask-their-gps-about-ai-diligence/,
// pubDate 2026-09-28). The note post is its own publication moment, so the
// folder is dated to the note publication date. note URLs carry no readable
// slug, so the folder takes the article's slug plus -note-ja, as
// generate-xai-note-ja.mjs does.
//
// ── Copy provenance ──────────────────────────────────────────────────────────
// Title, deck and the seven questions are quoted from the note text YS
// supplied on 2026-09-29; nothing on the images is translated here. The
// eyecatch's short labels (SHORT) are single words lifted from each question.
// Checked against the JA rules in askodin-coming-soon/scripts/
// check-compliance-lexicon.mjs (2026-09-29): no hits, and none of the image
// copy makes a retention, training, guideline or 排除 claim. Body-text issues
// found in the same review (benchmark wording, IPOS line, 仮特許出願) do not
// reach these images.
//
// Layout mirrors the English OG (generate-what-lps-should-ask-their-gps-about-
// ai-diligence.mjs): title left, the seven checks right.
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

// The note publication date — change it if the post ships on another day.
const DATE = '20260929';
const SLUG = 'what-lps-should-ask-their-gps-about-ai-diligence-note-ja';
const ASSET_DIR = `./output/social/${DATE}-${SLUG}`;
const PNG_DIR = path.join(ASSET_DIR, 'banners');
const SVG_DIR = path.join(ASSET_DIR, 'svg');
for (const d of [PNG_DIR, SVG_DIR]) fs.mkdirSync(d, { recursive: true });

const EYEBROW = '// LP CHECKLIST';
const HEAD = ['LPがGPに問うべき', 'AIデューデリジェンスの', '7つの質問'];
const DECK = ['防御可能なプロセスと、', '高価な要約エンジンを分けるもの'];

// The seven questions, quoted from the note text. Broken by hand at a phrase
// boundary where one is too long for the figure column.
const QUESTIONS = [
  ['あなたのデューデリジェンスは、', 'どのような基準を適用していますか？'],
  ['結論の背後にある推論を見せてもらえますか？'],
  ['主張がテストに失敗したとき、何が起こりますか？'],
  ['ディールデータはどこに行きますか？'],
  ['出力に対して誰が責任を負いますか？'],
  ['判定は再現可能ですか？'],
  ['実際の監査を見せてもらえますか？'],
];
// 「これが最も重要な質問です」 — the note, on question 3.
const MOST_IMPORTANT = 2;
// Eyecatch-only short labels, each lifted from its question's own wording.
const SHORT = ['基準', '推論', '失敗したとき', 'ディールデータ', '責任', '再現可能か', '実際の監査'];

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

function checkBox(x, y, size, color) {
  const top = y - size * 0.84;
  const sw = Math.max(1.5, size * 0.085);
  return [
    `<rect x="${x}" y="${top.toFixed(1)}" width="${size}" height="${size}" rx="${(size * 0.14).toFixed(1)}" fill="none" stroke="${color}" stroke-width="${sw.toFixed(1)}"/>`,
    `<path d="M${(x + size * 0.24).toFixed(1)} ${(top + size * 0.52).toFixed(1)} L${(x + size * 0.43).toFixed(1)} ${(top + size * 0.72).toFixed(1)} L${(x + size * 0.77).toFixed(1)} ${(top + size * 0.3).toFixed(1)}" fill="none" stroke="${color}" stroke-width="${sw.toFixed(1)}" stroke-linecap="round" stroke-linejoin="round"/>`,
  ];
}

function eyecatchSvg() {
  const el = backdrop();
  const colW = 620;

  const askW = latinW(F.semi, 'ask', 30);
  el.push(latin(F.semi, 'ask', MARGIN, 116, 30, ORANGE), latin(F.semi, 'Odin', MARGIN + askW, 116, 30, GREEN));
  el.push(...tracked(F.monoMed, EYEBROW, MARGIN, 196, 16, 4.2, GREEN_TEXT, 1));

  const headOpts = { font: F.semi, jpFont: F.jpBold };
  const headSize = Math.min(48, ...HEAD.map((l) => colW / widthOf(l, 1, headOpts.font, headOpts.jpFont)));
  HEAD.forEach((line, i) => el.push(run(line, MARGIN, 270 + i * headSize * 1.34, headSize, { ...headOpts, fill: WHITE })));

  const ruleY = 270 + (HEAD.length - 1) * headSize * 1.34 + 44;
  el.push(`<rect x="${MARGIN}" y="${ruleY.toFixed(1)}" width="64" height="3" fill="${ORANGE}"/>`);

  const deckOpts = { font: F.medium, jpFont: F.jpMedium };
  const deckSize = Math.min(24, ...DECK.map((l) => colW / widthOf(l, 1, deckOpts.font, deckOpts.jpFont)));
  DECK.forEach((line, i) =>
    el.push(run(line, MARGIN, ruleY + 52 + i * deckSize * 1.6, deckSize, { ...deckOpts, fill: WHITE, opacity: 0.8 })));

  el.push(...tracked(F.mono, 'ASKODIN.APP/JA', MARGIN, H - MARGIN + 6, 16, 5, WHITE, 0.5));

  // Right column: the seven checks.
  const divX = 790;
  el.push(`<line x1="${divX}" y1="160" x2="${divX}" y2="${H - 110}" stroke="${WHITE}" stroke-width="1" opacity="0.12"/>`);
  const RL = 846;
  let y = 196;
  SHORT.forEach((label, i) => {
    const color = i === MOST_IMPORTANT ? ORANGE : GREEN_TEXT;
    el.push(...checkBox(RL, y, 22, color));
    el.push(...tracked(F.monoMed, String(i + 1).padStart(2, '0'), RL + 40, y, 16, 1.5, color, 1));
    el.push(run(label, RL + 84, y, 25, { ...deckOpts, fill: WHITE, opacity: 0.92 }));
    y += 56;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <title>askOdin — note.com eyecatch — What LPs Should Ask Their GPs About AI Diligence (JA)</title>
  ${el.join('\n  ')}
</svg>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// In-article figure — the seven questions as one checklist image
//
// Sized for note's column, as the XAI figures: 1280 wide, body at 34px.
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

function checklistSvg() {
  const body = [];
  const tx = FM + 104;
  const textW = FW - FM - tx;
  let y = 250;
  body.push(hline(y, FM, FW - FM, 0.3));

  QUESTIONS.forEach((lines, i) => {
    y += 70;
    const color = i === MOST_IMPORTANT ? ORANGE : GREEN_TEXT;
    body.push(...checkBox(FM, y, 30, color));
    body.push(...tracked(F.monoMed, String(i + 1).padStart(2, '0'), FM + 50, y, 20, 2, color, 1));
    lines.forEach((line, j) => {
      fitLine(line, BODY, jp('medium'), textW);
      body.push(run(line, tx, y + j * BODY * LEAD, BODY, { ...jp('medium'), fill: WHITE, opacity: 0.94 }));
    });
    y += (lines.length - 1) * BODY * LEAD + 36;
    if (i < QUESTIONS.length - 1) body.push(hline(y));
  });

  const h = y + 50;
  const el = figureChrome(h, 'LPがGPに問うべき7つの質問');
  el.push(...body);
  el.push(hline(y, FM, FW - FM, 0.3));
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
  console.log('=== note.com eyecatch — What LPs Should Ask Their GPs (JA) ===\n');
  const name = 'askOdin-lp-questions-note-ja';
  fs.writeFileSync(path.join(SVG_DIR, `${name}.svg`), eyecatchSvg());
  const buf = fs.readFileSync(path.join(SVG_DIR, `${name}.svg`));

  for (const [w, h, suffix] of [[1280, 670, ''], [1920, 1006, '-1920'], [2560, 1340, '-2x']]) {
    const file = path.join(PNG_DIR, `${name}${suffix}.png`);
    await sharp(buf, { density: 300 }).resize(w, h, { fit: 'fill' }).png().toFile(file);
    console.log(`  ${path.basename(file).padEnd(36)} ${w}x${h}  ${(fs.statSync(file).size / 1024).toFixed(0)}KB`);
  }

  console.log('\ncards/  (in-article checklist)');
  await emitFigure('askOdin-lp-questions-note-ja-checklist', checklistSvg(), 'askOdin — LPがGPに問うべき7つの質問');
  console.log(`\nWrote ${ASSET_DIR}/\n`);
}

main().catch((err) => { console.error(err); process.exit(1); });
