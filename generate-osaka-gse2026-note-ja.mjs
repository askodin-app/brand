import opentype from 'opentype.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// note.com eyecatch + invitation card — 大阪で探しているもの——GSE2026に参加します
//
//   banners/  eyecatch, note spec 1280x670 (+1920, +2x)
//   cards/    the invitation: GSE week schedule + contact, for the お誘い section
//
// A note-only post with no English article behind it. It is an article about an
// event, not event collateral, so it files under social/ beside the other note
// eyecatches. Dated to the note publication date — change DATE if it ships on
// another day. note URLs carry no readable slug; see
// generate-diligence-stack-note-ja.mjs.
//
// ── Copy provenance ──────────────────────────────────────────────────────────
// Title, deck, the three conversation themes and the invitation line are quoted
// from the note text YS supplied on 2026-10-03; nothing on the images is
// translated here. Each theme is the bolded lead of its paragraph, minus the
// closing 。. GSE dates and venues are quoted from askodin-coming-soon
// src/pages/ja/index.astro, as in generate-gemini-note-ja.mjs — the note body
// says only 来週. The X handle and email are the note's own.
//
// Checked by hand against the JA rules in askodin-coming-soon
// scripts/check-compliance-lexicon.mjs and the Compliance Lexicon Lock in that
// repo's CLAUDE.md (2026-10-03): no hits on the image copy. No figures appear
// on either image, so there is no denominator to carry.
// ─────────────────────────────────────────────────────────────────────────────

const F = {
  semi: opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-SemiBold.ttf'),
  medium: opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-Medium.ttf'),
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
const DATE = '20261003';
const SLUG = 'osaka-gse2026-note-ja';
const ASSET_DIR = `./output/social/${DATE}-${SLUG}`;
const PNG_DIR = path.join(ASSET_DIR, 'banners');
const CARD_DIR = path.join(ASSET_DIR, 'cards');
const SVG_DIR = path.join(ASSET_DIR, 'svg');
for (const d of [PNG_DIR, CARD_DIR, SVG_DIR]) fs.mkdirSync(d, { recursive: true });

const EYEBROW = 'GLOBAL STARTUP EXPO 2026 · OSAKA';
const HEAD = ['大阪で探しているもの——', 'GSE2026に参加します'];
// The note's subtitle, broken at its full stop and its last comma.
const DECK = ['ピッチではなく、対話を。', '日本の機関投資家、VC、ディープテックの創業者と', '語りたい3つのテーマ'];

const THEMES_LABEL = '大阪で交わしたい3つの対話';
const THEMES = [
  ['ファンドのデューデリジェンスに', 'AIがどう入り込むか'],
  ['機関投資家がAI支援型のプロセスを', 'どう検証するか'],
  ['ソブリンAIと民間資本の交差点'],
];

// Invitation card.
const INVITE_LABEL = 'お誘い';
const INVITE_HEAD = ['30分ほどのコーヒーでも、', 'あるいは展示会場での立ち話でも'];
const CONTACT = [['X', '@askodinapp'], ['MAIL', 'yeksoon@askodin.app']];
// Quoted from /ja — keep in step with generate-gemini-note-ja.mjs.
const SCHEDULE = [
  ['10月5日（月）', '中之島'],
  ['10月6日（火）〜7日（水）', 'グラングリーン大阪'],
  ['10月8日（木）', '梅田'],
];

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
const runRight = (str, xRight, y, size, opts) => run(str, xRight - widthOf(str, size, opts.font, opts.jpFont), y, size, opts);

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

const BOLD = { font: F.semi, jpFont: F.jpBold };
const MED = { font: F.medium, jpFont: F.jpMedium };
const fitSize = (lines, max, colW, opts) => Math.min(max, ...lines.map((l) => colW / widthOf(l, 1, opts.font, opts.jpFont)));
const hline = (x1, x2, y) => `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${WHITE}" stroke-width="1" opacity="0.14"/>`;

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
  const askW = latinW(F.semi, 'ask', 30);
  el.push(latin(F.semi, 'ask', MARGIN, 116, 30, ORANGE), latin(F.semi, 'Odin', MARGIN + askW, 116, 30, GREEN));
  el.push(...tracked(F.mono, 'ASKODIN.APP/JA', MARGIN, H - MARGIN + 18, 16, 5, WHITE, 0.5));
  return el;
}

const svgDoc = (title, el) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <title>${title}</title>
  ${el.join('\n  ')}
</svg>`;

function eyecatch() {
  const el = backdrop();
  const colW = 600;

  el.push(...tracked(F.monoMed, EYEBROW, MARGIN, 190, 16, 4.2, GREEN_TEXT, 1));

  const headSize = fitSize(HEAD, 50, colW, BOLD);
  HEAD.forEach((line, i) => el.push(run(line, MARGIN, 270 + i * headSize * 1.34, headSize, { ...BOLD, fill: WHITE })));

  const ruleY = 270 + (HEAD.length - 1) * headSize * 1.34 + 42;
  el.push(`<rect x="${MARGIN}" y="${ruleY.toFixed(1)}" width="64" height="3" fill="${ORANGE}"/>`);

  const deckSize = fitSize(DECK, 22, colW, MED);
  DECK.forEach((line, i) =>
    el.push(run(line, MARGIN, ruleY + 48 + i * deckSize * 1.6, deckSize, { ...MED, fill: WHITE, opacity: i === 0 ? 0.95 : 0.72 })));

  // Right column: the three conversations as a ruled list.
  const divX = 744;
  el.push(`<line x1="${divX}" y1="150" x2="${divX}" y2="${H - 90}" stroke="${WHITE}" stroke-width="1" opacity="0.12"/>`);
  const x = 792;
  const R = W - 72;
  const textX = x + 58;
  el.push(run(THEMES_LABEL, x, 190, 18, { ...MED, fill: GREEN_TEXT }));
  const size = fitSize(THEMES.flat(), 21, R - textX, MED);
  const rowH = 112;
  let y = 222;
  el.push(hline(x, R, y));
  THEMES.forEach((lines, i) => {
    const lead = size * 1.5;
    const first = y + rowH / 2 + size * 0.36 - ((lines.length - 1) * lead) / 2;
    el.push(latin(F.monoMed, `0${i + 1}`, x, first, 18, ORANGE));
    lines.forEach((l, j) => el.push(run(l, textX, first + j * lead, size, { ...MED, fill: WHITE, opacity: 0.92 })));
    y += rowH;
    el.push(hline(x, R, y));
  });
  const when = '2026.10.05–07';
  el.push(...tracked(F.mono, when, R - trackedW(F.mono, when, 14, 3), H - MARGIN + 18, 14, 3, WHITE, 0.4));

  return svgDoc('askOdin — note.com eyecatch — 大阪で探しているもの——GSE2026に参加します', el);
}

function invitation() {
  const el = backdrop();

  el.push(...tracked(F.monoMed, EYEBROW, MARGIN, 190, 16, 4.2, GREEN_TEXT, 1));
  const hSize = fitSize(INVITE_HEAD, 40, 540, BOLD);
  INVITE_HEAD.forEach((l, i) => el.push(run(l, MARGIN, 268 + i * hSize * 1.4, hSize, { ...BOLD, fill: WHITE })));
  const ruleY = 268 + (INVITE_HEAD.length - 1) * hSize * 1.4 + 42;
  el.push(`<rect x="${MARGIN}" y="${ruleY.toFixed(1)}" width="64" height="3" fill="${ORANGE}"/>`);
  CONTACT.forEach(([k, v], i) => {
    const y = ruleY + 58 + i * 42;
    el.push(...tracked(F.monoMed, k, MARGIN, y, 14, 3, GREEN_TEXT, 1));
    el.push(latin(F.mono, v, MARGIN + 76, y, 21, WHITE, 0.92));
  });

  // Right: the week as a ruled list, as on /ja.
  const L = 720, R = W - MARGIN;
  el.push(run(INVITE_LABEL, L, 190, 18, { ...MED, fill: GREEN_TEXT }));
  let y = 222;
  el.push(hline(L, R, y));
  for (const [date, venue] of SCHEDULE) {
    el.push(run(date, L, y + 62, 21, { ...MED, fill: WHITE, opacity: 0.95 }));
    el.push(runRight(venue, R, y + 62, 21, { ...MED, fill: WHITE, opacity: 0.62 }));
    y += 104;
    el.push(hline(L, R, y));
  }

  return svgDoc('askOdin — GSE 2026 Osaka — お誘い', el);
}

async function emit(dir, name, doc, sizes) {
  fs.writeFileSync(path.join(SVG_DIR, `${name}.svg`), doc);
  const buf = Buffer.from(doc);
  for (const [w, h, suffix] of sizes) {
    const file = path.join(dir, `${name}${suffix}.png`);
    await sharp(buf, { density: 300 }).resize(w, h, { fit: 'fill' }).png().toFile(file);
    console.log(`  ${path.basename(file).padEnd(40)} ${w}x${h}  ${(fs.statSync(file).size / 1024).toFixed(0)}KB`);
  }
}

async function main() {
  console.log('=== note.com eyecatch — Osaka / GSE2026 (JA) ===\n');
  await emit(PNG_DIR, 'askOdin-osaka-gse2026-note-ja', eyecatch(), [[1280, 670, ''], [1920, 1006, '-1920'], [2560, 1340, '-2x']]);
  console.log('\ncards/  (in-article invitation, for the お誘い section)');
  await emit(CARD_DIR, 'askOdin-osaka-gse2026-note-ja-invitation', invitation(), [[1280, 670, ''], [2560, 1340, '-2x']]);
  console.log(`\nWrote ${ASSET_DIR}/\n`);
}

main().catch((err) => { console.error(err); process.exit(1); });
