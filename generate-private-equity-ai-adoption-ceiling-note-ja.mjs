import opentype from 'opentype.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// note.com eyecatch + deal-activity figure — 判断の空白——なぜPEのAI導入は天井に突き当たっているのか
//
// Japanese version of "Why Private Equity's AI Adoption Is Hitting a Ceiling"
// (askodin.app/insights/private-equity-ai-adoption-ceiling/, pubDate
// 2026-09-30). The note post is its own publication moment, so the folder is
// dated to the note publication date — change DATE if it ships on another
// day. note URLs carry no readable slug, so the folder takes the article's
// slug plus -note-ja, as generate-what-lps-should-ask-note-ja.mjs does.
//
// ── Copy provenance ──────────────────────────────────────────────────────────
// Title, deck and the Japanese activity labels are quoted from the note text
// YS supplied on 2026-09-30; nothing on the images is translated here. The
// figures are FTI's (2026 Private Equity AI Radar, Figure 14; n = 200, Dec
// 2025), identical to generate-private-equity-ai-adoption-ceiling.mjs — change
// both together. 判断主導 in the divider is the note's own rendering of FTI's
// "judgment-driven". The divider is our annotation, not FTI's, as in English.
//
// Checked against askodin-coming-soon/scripts/check-compliance-lexicon.mjs and
// the Compliance Lexicon Lock in that repo's CLAUDE.md (2026-09-30). The image
// copy is clean. The note body is not: its data-room / stateless sentence and
// several figure restatements were flagged separately, and none reach these
// images.
//
// Layout mirrors the site's English OG: title left, the deal-activity bars
// right, so the preview reads as the same piece in both languages.
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
const DATE = '20260930';
const SLUG = 'private-equity-ai-adoption-ceiling-note-ja';
const ASSET_DIR = `./output/social/${DATE}-${SLUG}`;
const PNG_DIR = path.join(ASSET_DIR, 'banners');
const SVG_DIR = path.join(ASSET_DIR, 'svg');
for (const d of [PNG_DIR, SVG_DIR]) fs.mkdirSync(d, { recursive: true });

const EYEBROW = '// MARKET AUDIT';
const HEAD = ['判断の空白——', 'なぜPEのAI導入は', '天井に突き当たっているのか'];
// The note's deck, broken at its comma.
const DECK = ['95%のファンドが「成功」と回答する一方で、', '43%のポートフォリオ企業がAIを', '実質的に導入していない'];

// FTI Figure 14 — the seven of twenty activities the article shows, with the
// note's labels. The first three are document work; the divider follows them.
const DEAL_ACTIVITY = [
  { label: 'データ分析・要約', value: 27 },
  { label: '財務デューデリジェンス支援', value: 27 },
  { label: 'ドキュメントスキャン・処理', value: 26 },
  { label: 'オペレーショナル・デューデリジェンス', value: 23 },
  { label: 'バリュー・クリエーション計画', value: 20 },
  { label: 'コマーシャル・デューデリジェンス', value: 17 },
  { label: 'エグジット・プロセス準備', value: 13 },
];
const DIVIDE_AFTER = 2;
const DIVIDER = '判断主導の作業';
const MAX = 30;
const SOURCE = 'SOURCE: FTI CONSULTING, 2026 PE AI RADAR, FIG. 14 · 7 OF 20 ACTIVITIES · n = 200';


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


// A labelled dashed divider across [x1, x2] at baseline y.
function divider(x1, x2, y, size, label, opts) {
  const tw = widthOf(label, size, opts.font, opts.jpFont);
  const cx = (x1 + x2) / 2;
  const ly = y - size * 0.35;
  const dash = `stroke="${ORANGE}" stroke-width="1.5" stroke-dasharray="6 5"`;
  return [
    `<line x1="${x1}" y1="${ly.toFixed(1)}" x2="${(cx - tw / 2 - 14).toFixed(1)}" y2="${ly.toFixed(1)}" ${dash}/>`,
    `<line x1="${(cx + tw / 2 + 14).toFixed(1)}" y1="${ly.toFixed(1)}" x2="${x2}" y2="${ly.toFixed(1)}" ${dash}/>`,
    run(label, cx - tw / 2, y, size, { ...opts, fill: ORANGE }),
  ];
}

// Seven bars from zero. Document work in green, the rest muted.
function bars(el, { x, w, y, labelSize, valueSize, barH, gap, dividerGap, opts }) {
  DEAL_ACTIVITY.forEach((r, i) => {
    const hot = i <= DIVIDE_AFTER;
    el.push(run(r.label, x, y, labelSize, { ...opts, fill: WHITE, opacity: 0.88 }));
    const v = `${r.value}%`;
    el.push(latin(F.monoMed, v, x + w - latinW(F.monoMed, v, valueSize), y, valueSize, hot ? GREEN_TEXT : WHITE, hot ? 1 : 0.75));
    const by = y + labelSize * 0.45;
    el.push(`<rect x="${x}" y="${by.toFixed(1)}" width="${w}" height="${barH}" fill="${WHITE}" opacity="0.05"/>`);
    el.push(`<rect x="${x}" y="${by.toFixed(1)}" width="${(w * r.value / MAX).toFixed(1)}" height="${barH}" fill="${hot ? GREEN_TEXT : WHITE}" opacity="${hot ? 1 : 0.3}"/>`);
    y += gap;
    if (i === DIVIDE_AFTER) {
      el.push(...divider(x, x + w, y - gap * 0.3 + dividerGap * 0.2, labelSize * 0.8, DIVIDER, opts));
      y += dividerGap;
    }
  });
  return y - gap;
}

function eyecatchSvg() {
  const el = backdrop();
  const colW = 600;

  const askW = latinW(F.semi, 'ask', 30);
  el.push(latin(F.semi, 'ask', MARGIN, 116, 30, ORANGE), latin(F.semi, 'Odin', MARGIN + askW, 116, 30, GREEN));
  el.push(...tracked(F.monoMed, EYEBROW, MARGIN, 190, 16, 4.2, GREEN_TEXT, 1));

  const headOpts = { font: F.semi, jpFont: F.jpBold };
  const headSize = Math.min(46, ...HEAD.map((l) => colW / widthOf(l, 1, headOpts.font, headOpts.jpFont)));
  HEAD.forEach((line, i) => el.push(run(line, MARGIN, 258 + i * headSize * 1.34, headSize, { ...headOpts, fill: WHITE })));

  const ruleY = 258 + (HEAD.length - 1) * headSize * 1.34 + 38;
  el.push(`<rect x="${MARGIN}" y="${ruleY.toFixed(1)}" width="64" height="3" fill="${ORANGE}"/>`);

  const deckOpts = { font: F.medium, jpFont: F.jpMedium };
  const deckSize = Math.min(21, ...DECK.map((l) => colW / widthOf(l, 1, deckOpts.font, deckOpts.jpFont)));
  DECK.forEach((line, i) =>
    el.push(run(line, MARGIN, ruleY + 44 + i * deckSize * 1.6, deckSize, { ...deckOpts, fill: WHITE, opacity: 0.8 })));

  el.push(...tracked(F.mono, 'ASKODIN.APP/JA', MARGIN, H - MARGIN + 18, 16, 5, WHITE, 0.5));

  // Right column: the deal-activity bars.
  const divX = 744;
  el.push(`<line x1="${divX}" y1="150" x2="${divX}" y2="${H - 90}" stroke="${WHITE}" stroke-width="1" opacity="0.12"/>`);
  const x = 792;
  const w = W - x - 72;
  el.push(...tracked(F.monoMed, 'AI USAGE BY DEAL ACTIVITY · FTI 2026', x, 170, 13, 3, GREEN_TEXT, 1));
  bars(el, { x, w, y: 214, labelSize: 17, valueSize: 17, barH: 8, gap: 49, dividerGap: 18, opts: deckOpts });
  el.push(...tracked(F.mono, 'SOURCE: FTI CONSULTING · n = 200', x, H - MARGIN + 18, 12, 3, WHITE, 0.36));

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <title>askOdin — note.com eyecatch — Why Private Equity's AI Adoption Is Hitting a Ceiling (JA)</title>
  ${el.join('\n  ')}
</svg>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// In-article figure — the deal-activity chart. note.com has no chart block,
// and the note body lists these figures as two bullet lists.
//
// Sized for note's column, as the other note figures: 1280 wide, body at 34px.
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


function dealActivitySvg() {
  const body = [];
  let y = 270;
  body.push(hline(y - 44, FM, FW - FM, 0.3));
  y = bars(body, { x: FM, w: FW - 2 * FM, y, labelSize: 30, valueSize: 30, barH: 18, gap: 92, dividerGap: 34, opts: jp('medium') });
  y += 70;
  body.push(hline(y - 20, FM, FW - FM, 0.3));
  y += 30;
  body.push(...tracked(F.mono, SOURCE, FM, y, 14, 2.4, WHITE, 0.45));
  body.push(...tracked(F.mono, 'DIVIDING LINE: ASKODIN ANNOTATION', FM, y + 30, 14, 2.4, WHITE, 0.45));

  const h = y + 80;
  const el = figureChrome(h, 'ディール活動別のAI利用率');
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
  console.log('=== note.com eyecatch — PE AI adoption ceiling (JA) ===\n');
  const name = 'askOdin-pe-ai-ceiling-note-ja';
  fs.writeFileSync(path.join(SVG_DIR, `${name}.svg`), eyecatchSvg());
  const buf = fs.readFileSync(path.join(SVG_DIR, `${name}.svg`));

  for (const [w, h, suffix] of [[1280, 670, ''], [1920, 1006, '-1920'], [2560, 1340, '-2x']]) {
    const file = path.join(PNG_DIR, `${name}${suffix}.png`);
    await sharp(buf, { density: 300 }).resize(w, h, { fit: 'fill' }).png().toFile(file);
    console.log(`  ${path.basename(file).padEnd(36)} ${w}x${h}  ${(fs.statSync(file).size / 1024).toFixed(0)}KB`);
  }

  console.log('\ncards/  (in-article chart; note.com has no chart block)');
  await emitFigure('askOdin-pe-ai-ceiling-note-ja-deal-activity', dealActivitySvg(), 'askOdin — ディール活動別のAI利用率');
  console.log(`\nWrote ${ASSET_DIR}/\n`);
}

main().catch((err) => { console.error(err); process.exit(1); });
