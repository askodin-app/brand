import opentype from 'opentype.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// 「徹底して見える」と「徹底している」 — Japanese site images
// https://askodin.app/ja/insights/sounding-thorough-vs-being-thorough/ (2026-11-03)
//
//   og    1200x630  public/images/articles/sounding-thorough-vs-being-thorough-ja-og.png
//   hero  1600x640  public/images/articles/sounding-thorough-vs-being-thorough-ja-hero.webp
//
// and the platform crops, which never leave this repo:
//
//   x-mobile  1080x1350  X 4:5
//   square    1200x1200  LinkedIn 1:1
//   note      1280x670 (+1920, +2x)  note.com eyecatch, the OG composition, in
//             output/social/20261103-sounding-thorough-vs-being-thorough-note-ja/
//
// The same two compositions as generate-sounding-thorough-vs-being-thorough.mjs,
// set in Noto Sans JP with Plex for Latin. The quotation is our rendering of the
// model's line in the Goldman Sachs Exchanges transcript (24 Aug 2026), as on the
// page. No firm is named on either image. If the hero's words change, change
// heroAlt on that page in the same commit.
// ─────────────────────────────────────────────────────────────────────────────

const F = {
  semi: opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-SemiBold.ttf'),
  light: opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-Light.ttf'),
  mono: opentype.loadSync('./fonts/IBM_Plex_Mono/IBMPlexMono-Regular.ttf'),
  monoMed: opentype.loadSync('./fonts/IBM_Plex_Mono/IBMPlexMono-Medium.ttf'),
  jpMedium: opentype.loadSync('./fonts/Noto_Sans_JP/NotoSansJP-Medium.ttf'),
  jpRegular: opentype.loadSync('./fonts/Noto_Sans_JP/NotoSansJP-Regular.ttf'),
};

const ORANGE = '#DB4A2B';
const GREEN = '#147B58';
const GREEN_TEXT = '#2FA37A';
const DARK = '#111119';
const SURFACE = '#1A1A2E';
const WHITE = '#FFFFFF';

const SLUG = 'sounding-thorough-vs-being-thorough-ja';
const ASSET_DIR = './output/social/20261103-sounding-thorough-vs-being-thorough-ja';
const BANNER_DIR = path.join(ASSET_DIR, 'banners');
const SVG_DIR = path.join(ASSET_DIR, 'svg');
for (const d of [BANNER_DIR, SVG_DIR]) fs.mkdirSync(d, { recursive: true });

// ---------------------------------------------------------------------------
// Copy
// ---------------------------------------------------------------------------
const TITLE = '「徹底して見える」と「徹底している」';
const HEADLINE = ['「徹底して見える」は、'];
const HEADLINE_TURN = '「徹底している」ではない。';
const STANDFIRST = ['AIによる思考力の低下は、', '人材ではなく、設計の問題である。'];
const EYEBROW = '// MACRO THESIS';
const URL_LINE = 'ASKODIN.APP/JA';

const QUOTE = ['結局のところ、私は', '徹底していることより、', '徹底して見えることの', 'ほうが得意なのです。'];
const QUOTE_BY = '作り手に問い詰められた、LLMの答え';

const HERO_EYEBROW = '// 同じ資料・二つのアーキテクチャ';
const RAILS = [
  {
    label: '徹底して見える',
    nodes: [{ t: 'データルーム' }, { t: 'LLM', sub: '読んで要約する' }, null, { t: '流暢なメモ', sub: '出典の記録なし' }],
  },
  {
    label: '徹底している',
    nodes: [{ t: 'データルーム' }, { t: '抽出', sub: '言語モデル' }, { t: '評価', sub: '決定論的ルール' }, { t: '監査ログ', sub: '追跡可能な記録', record: true }],
  },
];
const HALT = '検証に通らない主張は、停止して指摘';
const CAPTION = '研修は、確認する人を鍛える。アーキテクチャは、システムが何のために作られているかを変える。';

// ---------------------------------------------------------------------------
// Mixed-script text: Japanese in Noto, Latin in Plex. Text is outlined, so a
// kanji outside the Noto subset would ship as a tofu box; fail instead.
// ---------------------------------------------------------------------------
const isJP = (ch) => {
  const c = ch.codePointAt(0);
  return (c >= 0x3000 && c <= 0x30ff) || (c >= 0x4e00 && c <= 0x9fff) || (c >= 0xff00 && c <= 0xffef);
};
// The Noto subsets share a name, so the Latin partner is keyed by object.
const LATIN = new Map([[F.jpMedium, F.semi], [F.jpRegular, F.light]]);
function faceFor(ch, jp) {
  const f = isJP(ch) ? jp : LATIN.get(jp);
  if (f.charToGlyphIndex(ch) === 0) throw new Error(`Add to KANJI in tools/prepare-noto-sans-jp.py: ${ch}`);
  return f;
}
const adv = (ch, size, jp) => {
  const f = faceFor(ch, jp);
  return f.charToGlyph(ch).advanceWidth * (size / f.unitsPerEm);
};
const widthOf = (t, size, jp) => [...t].reduce((w, c) => w + adv(c, size, jp), 0);
function run(t, x, y, size, jp, fill, opacity = 1) {
  const parts = [];
  for (const ch of t) {
    const d = faceFor(ch, jp).getPath(ch, x, y, size).toPathData(2);
    if (d) parts.push(d);
    x += adv(ch, size, jp);
  }
  return `<path d="${parts.join(' ')}" fill="${fill}"${opacity === 1 ? '' : ` opacity="${opacity}"`}/>`;
}
const midRun = (t, cx, y, size, jp, fill, op) => run(t, cx - widthOf(t, size, jp) / 2, y, size, jp, fill, op);
const fitJP = (lines, size, jp, maxW) => {
  while (size > 10 && lines.some((l) => widthOf(l, size, jp) > maxW)) size -= 1;
  return size;
};

// Mono, letterspaced by hand; Japanese inside a mono line falls back to Noto.
function tracked(t, x, y, size, track, fill, op = 1, f = F.mono) {
  const el = [];
  for (const ch of t) {
    const face = isJP(ch) ? F.jpMedium : f;
    if (ch !== ' ') el.push(`<path d="${face.getPath(ch, x, y, size).toPathData(2)}" fill="${fill}" opacity="${op}"/>`);
    x += face.charToGlyph(ch).advanceWidth * (size / face.unitsPerEm) + track;
  }
  return el;
}

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
  el.push(`<path d="${F.semi.getPath('O', -110 * k, H / 2 + 185 * k, 620 * k).toPathData(2)}" fill="${GREEN}" opacity="0.055"/>`);
  el.push(`<rect width="${W}" height="${(6 * k).toFixed(1)}" fill="${ORANGE}"/>`);
  return el;
}

function wordmarkAt(x, y, size) {
  const askW = F.semi.getAdvanceWidth('ask', size);
  return [
    `<path d="${F.semi.getPath('ask', x, y, size).toPathData(2)}" fill="${ORANGE}"/>`,
    `<path d="${F.semi.getPath('Odin', x + askW, y, size).toPathData(2)}" fill="${GREEN}"/>`,
  ];
}

// ---------------------------------------------------------------------------
// OG — 1200x630. Title left, the model's line right.
// ---------------------------------------------------------------------------
function og(W, H) {
  const el = backdrop(W, H);
  const L = 84;
  const colW = 560;
  el.push(...wordmarkAt(L, 104, 30));
  el.push(...tracked(EYEBROW, L, 180, 16, 4.2, ORANGE, 1, F.monoMed));

  // 「 sits at the right of its em box; hang it so the column stays flush.
  const hSize = fitJP([...HEADLINE, HEADLINE_TURN], 48, F.jpRegular, colW + 24);
  const hang = hSize * 0.5;
  HEADLINE.forEach((line, i) => el.push(run(line, L - hang, 258 + i * hSize * 1.3, hSize, F.jpRegular, WHITE, 0.96)));
  const ty = 258 + HEADLINE.length * hSize * 1.3;
  el.push(run(HEADLINE_TURN, L - hang, ty, hSize, F.jpRegular, ORANGE));

  const ry = ty + 46;
  el.push(`<line x1="${L}" y1="${ry.toFixed(1)}" x2="${L + 64}" y2="${ry.toFixed(1)}" stroke="${ORANGE}" stroke-width="3"/>`);
  const sSize = fitJP(STANDFIRST, 22, F.jpRegular, colW);
  STANDFIRST.forEach((line, i) => el.push(run(line, L, ry + 46 + i * sSize * 1.6, sSize, F.jpRegular, WHITE, 0.74)));

  el.push(...tracked(URL_LINE, L, 576, 14, 3.6, WHITE, 0.4));

  const divX = 720;
  el.push(`<line x1="${divX}" y1="150" x2="${divX}" y2="540" stroke="${WHITE}" stroke-width="1" opacity="0.12"/>`);
  const R = 772;
  el.push(run('“', R - 4, 236, 90, F.jpRegular, ORANGE));
  const qSize = fitJP(QUOTE, 30, F.jpMedium, W - 64 - R);
  QUOTE.forEach((line, i) => el.push(run(line, R, 270 + i * qSize * 1.6, qSize, F.jpMedium, WHITE, 0.94)));
  const by = 270 + (QUOTE.length - 1) * qSize * 1.6 + 54;
  el.push(run(QUOTE_BY, R, by, fitJP([QUOTE_BY], 15, F.jpRegular, W - 64 - R), F.jpRegular, WHITE, 0.6));
  return el;
}

// ---------------------------------------------------------------------------
// Hero — 1600x640, as the English one.
// ---------------------------------------------------------------------------
function hero(W, H) {
  const el = backdrop(W, H);
  const L = 84;
  const R = W - L;
  const nodeW = 272;
  const nodeH = 76;
  const gap = (R - L - nodeW * 4) / 3;
  const nodeX = [0, 1, 2, 3].map((i) => L + i * (nodeW + gap));
  const rowY = [180, 364];

  el.push(...tracked(HERO_EYEBROW, L, 92, 22, 4, ORANGE, 1, F.monoMed));
  const wmW = F.semi.getAdvanceWidth('askOdin', 36);
  el.push(...wordmarkAt(R - wmW, 96, 36));

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
    const good = r === 1;
    el.push(run(rail.label, L, top - 20, 24, F.jpMedium, good ? GREEN_TEXT : WHITE, good ? 1 : 0.7));
    rail.nodes.forEach((n, i) => {
      if (!n) return;
      const x = nodeX[i];
      el.push(`<rect x="${x}" y="${top}" width="${nodeW}" height="${nodeH}" rx="4" fill="${SURFACE}" stroke="${n.record ? GREEN : WHITE}" stroke-opacity="${n.record ? 1 : 0.2}" stroke-width="${n.record ? 2 : 1.5}" ${!good && i === 3 ? 'stroke-dasharray="8 6"' : ''}/>`);
      el.push(midRun(n.t, x + nodeW / 2, cy + 10, 27, F.jpMedium, n.record ? GREEN_TEXT : WHITE, 0.94));
      if (n.sub) el.push(midRun(n.sub, x + nodeW / 2, top + nodeH + 32, 19, F.jpRegular, n.record ? GREEN_TEXT : WHITE, n.record ? 0.9 : 0.6));
    });
    el.push(...arrow(nodeX[0] + nodeW + 8, nodeX[1] - 8, cy, WHITE, 0.5));
    if (good) {
      el.push(...arrow(nodeX[1] + nodeW + 8, nodeX[2] - 8, cy, WHITE, 0.5));
      el.push(...arrow(nodeX[2] + nodeW + 8, nodeX[3] - 8, cy, GREEN, 1));
    } else {
      el.push(...arrow(nodeX[1] + nodeW + 8, nodeX[3] - 8, cy, ORANGE, 1));
    }
  });

  const hx = nodeX[2] + nodeW / 2;
  el.push(midRun(HALT, hx, rowY[1] + nodeH + 68, 19, F.jpMedium, ORANGE));

  el.push(`<line x1="${L}" y1="530" x2="${R}" y2="530" stroke="${WHITE}" stroke-width="1" opacity="0.12"/>`);
  el.push(run(CAPTION, L, 584, fitJP([CAPTION], 28, F.jpRegular, R - L), F.jpRegular, WHITE, 0.8));
  return el;
}

// ---------------------------------------------------------------------------
// Platform crops
// ---------------------------------------------------------------------------
const QUOTE_STACKED = ['「結局のところ、私は徹底していることより、', '徹底して見えることのほうが得意なのです」'];

function stacked(cx, s, inner, spread) {
  const el = [];
  let y = 0;
  const wm = 32 * s;
  el.push(...wordmarkAt(cx - F.semi.getAdvanceWidth('askOdin', wm) / 2, (y += wm), wm));

  y += 64 * s * spread;
  const eyebrowW = [...EYEBROW].reduce((w, ch) => w + F.monoMed.charToGlyph(ch).advanceWidth * (20 * s / F.monoMed.unitsPerEm) + 5 * s, -5 * s);
  el.push(...tracked(EYEBROW, cx - eyebrowW / 2, y, 20 * s, 5 * s, ORANGE, 1, F.monoMed));

  y += 96 * s * spread;
  const hSize = fitJP([...HEADLINE, HEADLINE_TURN], 64 * s, F.jpRegular, inner);
  HEADLINE.forEach((line) => {
    el.push(midRun(line, cx, y, hSize, F.jpRegular, WHITE, 0.96));
    y += hSize * 1.36;
  });
  el.push(midRun(HEADLINE_TURN, cx, y, hSize, F.jpRegular, ORANGE));

  y += 60 * s * spread;
  el.push(`<line x1="${(cx - 32 * s).toFixed(1)}" y1="${y.toFixed(1)}" x2="${(cx + 32 * s).toFixed(1)}" y2="${y.toFixed(1)}" stroke="${ORANGE}" stroke-width="${(3 * s).toFixed(1)}"/>`);

  y += 72 * s * spread;
  const sSize = fitJP(STANDFIRST, 30 * s, F.jpRegular, inner);
  STANDFIRST.forEach((line, i) => el.push(midRun(line, cx, y + i * sSize * 1.6, sSize, F.jpRegular, WHITE, 0.78)));
  y += (STANDFIRST.length - 1) * sSize * 1.6 + 70 * s * spread;

  const qSize = fitJP(QUOTE_STACKED, 28 * s, F.jpMedium, inner);
  QUOTE_STACKED.forEach((line, i) => el.push(midRun(line, cx, y + i * qSize * 1.6, qSize, F.jpMedium, WHITE, 0.92)));
  y += (QUOTE_STACKED.length - 1) * qSize * 1.6 + 44 * s * spread;
  el.push(midRun(QUOTE_BY, cx, y, 18 * s, F.jpRegular, WHITE, 0.6));

  y += 70 * s * spread;
  const urlW = [...URL_LINE].reduce((w, ch) => w + F.mono.charToGlyph(ch).advanceWidth * (17 * s / F.mono.unitsPerEm) + 4.4 * s, -4.4 * s);
  el.push(...tracked(URL_LINE, cx - urlW / 2, y, 17 * s, 4.4 * s, WHITE, 0.4));
  return { el, height: y };
}

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

// note.com's eyecatch is 1280x670, the OG's 1.91:1 at a slightly larger size.
function noteEyecatch(W, H) {
  const k = W / 1200;
  const body = og(1200, 630).slice(backdrop(1200, 630).length);
  return [...backdrop(W, H), `<g transform="translate(0 ${((H - 630 * k) / 2).toFixed(1)}) scale(${k})">`, ...body, `</g>`];
}

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------
const svgFor = (title, W, H, el) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <title>${title}</title>
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
  const T = `${TITLE} — askOdin`;
  await emit(`askOdin-${SLUG}-og`, 1200, 630, svgFor(T, 1200, 630, og(1200, 630)));
  await emit(`askOdin-${SLUG}-hero`, 1600, 640, svgFor(T, 1600, 640, hero(1600, 640)));
  await emit(`askOdin-${SLUG}-x-mobile`, 1080, 1350,
    svgFor(T, 1080, 1350, frame(1080, 1350, stacked, { s: 1.0, margin: 90, target: 0.78 })));
  await emit(`askOdin-${SLUG}-square`, 1200, 1200,
    svgFor(T, 1200, 1200, frame(1200, 1200, stacked, { s: 1.0, margin: 110, target: 0.8 })));

  // note.com: its own publication, so its own folder, as the other note posts.
  const NOTE_DIR = './output/social/20261103-sounding-thorough-vs-being-thorough-note-ja';
  for (const d of ['banners', 'svg']) fs.mkdirSync(path.join(NOTE_DIR, d), { recursive: true });
  const name = 'askOdin-sounding-thorough-note-ja';
  const svg = svgFor(T, 1280, 670, noteEyecatch(1280, 670));
  fs.writeFileSync(path.join(NOTE_DIR, 'svg', `${name}.svg`), svg);
  for (const [w, h, suffix] of [[1280, 670, ''], [1920, 1006, '-1920'], [2560, 1340, '-2x']]) {
    await sharp(Buffer.from(svg), { density: 300 }).resize(w, h, { fit: 'fill' }).png().toFile(path.join(NOTE_DIR, 'banners', `${name}${suffix}.png`));
  }
  console.log(`  ${name}: 1280x670, 1920x1006, 2560x1340 -> ${NOTE_DIR}/`);
  console.log(`Wrote ${ASSET_DIR}/`);
}

main().catch((err) => { console.error(err); process.exit(1); });
