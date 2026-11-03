import opentype from 'opentype.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// Site OG + checklist PNG — LPがGPに確認すべき、AIデューデリジェンスの7つの質問
//
// For askodin.app/ja/insights/what-lps-should-ask-their-gps-about-ai-diligence/.
// Copied to public/images/articles/what-lps-should-ask-ja-{og,checklist}.png.
// The layouts mirror the English pair that ships in that repo: green rule, title
// left and seven checks right on the OG, a portrait list on the checklist.
//
// The checklist text is read from that repo's lp-ai-diligence-checklist.json (the
// ja block), so the image and the page cannot disagree. This is not the 2026-09-29
// note set: that one quotes the note text (ディールデータ, テスト), and the site
// says 案件データ and 検証.
// ─────────────────────────────────────────────────────────────────────────────

const F = {
  semi: opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-SemiBold.ttf'),
  medium: opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-Medium.ttf'),
  mono: opentype.loadSync('./fonts/IBM_Plex_Mono/IBMPlexMono-Regular.ttf'),
  monoMed: opentype.loadSync('./fonts/IBM_Plex_Mono/IBMPlexMono-Medium.ttf'),
  jpBold: opentype.loadSync('./fonts/Noto_Sans_JP/NotoSansJP-Bold.ttf'),
  jpMedium: opentype.loadSync('./fonts/Noto_Sans_JP/NotoSansJP-Medium.ttf'),
  jpRegular: opentype.loadSync('./fonts/Noto_Sans_JP/NotoSansJP-Regular.ttf'),
};

const ORANGE = '#DB4A2B';
const GREEN = '#147B58';
const GREEN_TEXT = '#2FA37A';
const DARK = '#111119';
const PANEL = '#1E293B';
const BORDER = '#334155';
const WHITE = '#FFFFFF';

const DATE = '20261102';
const SLUG = 'what-lps-should-ask-their-gps-about-ai-diligence-ja';
const ASSET_DIR = `./output/social/${DATE}-${SLUG}`;
const PNG_DIR = path.join(ASSET_DIR, 'banners');
const SVG_DIR = path.join(ASSET_DIR, 'svg');
for (const d of [PNG_DIR, SVG_DIR]) fs.mkdirSync(d, { recursive: true });

const data = JSON.parse(fs.readFileSync('../askodin-coming-soon/src/data/lp-ai-diligence-checklist.json', 'utf8')).ja;

const HEAD = ['LPがGPに確認すべき', 'AIデューデリジェンスの', '7つの質問'];
const SHORT = ['基準', '推論', '検証に通らないとき', '案件データ', '責任者', '再現性', '実際の監査'];
const TITLE = ['GPに確認すべき、', 'AIデューデリジェンスの7つの質問'];

const isJP = (ch) => {
  const c = ch.codePointAt(0);
  return (c >= 0x3000 && c <= 0x30ff) || (c >= 0x4e00 && c <= 0x9fff) || (c >= 0xff00 && c <= 0xffef);
};

// Text is outlined, so a kanji outside the Noto subset would ship as a tofu box.
function faceFor(ch, font, jpFont) {
  const f = isJP(ch) ? jpFont : font;
  if (f.charToGlyphIndex(ch) === 0) throw new Error(`Add to KANJI in tools/prepare-noto-sans-jp.py: ${ch}`);
  return f;
}

const adv = (ch, size, font, jpFont) => {
  const f = faceFor(ch, font, jpFont);
  return f.charToGlyph(ch).advanceWidth * (size / f.unitsPerEm);
};
const widthOf = (t, size, font, jpFont) => [...t].reduce((w, c) => w + adv(c, size, font, jpFont), 0);

function run(t, x, y, size, { font, jpFont, fill, opacity = 1 }) {
  const parts = [];
  for (const ch of t) {
    const d = faceFor(ch, font, jpFont).getPath(ch, x, y, size).toPathData(2);
    if (d) parts.push(d);
    x += adv(ch, size, font, jpFont);
  }
  return `<path d="${parts.join(' ')}" fill="${fill}"${opacity === 1 ? '' : ` opacity="${opacity}"`}/>`;
}

function tracked(f, t, x, y, size, track, fill, opacity = 1) {
  const out = [];
  for (const c of t) {
    if (c !== ' ') out.push(`<path d="${f.getPath(c, x, y, size).toPathData(2)}" fill="${fill}" opacity="${opacity}"/>`);
    x += f.charToGlyph(c).advanceWidth * (size / f.unitsPerEm) + track;
  }
  return out;
}

function wordmark(x, y, size) {
  const askW = F.semi.getAdvanceWidth('ask', size);
  return [
    `<path d="${F.semi.getPath('ask', x, y, size).toPathData(2)}" fill="${ORANGE}"/>`,
    `<path d="${F.semi.getPath('Odin', x + askW, y, size).toPathData(2)}" fill="${GREEN_TEXT}"/>`,
  ];
}

function checkBox(x, y, size, color) {
  const top = y - size * 0.84;
  const sw = (size * 0.085).toFixed(1);
  return [
    `<rect x="${x}" y="${top.toFixed(1)}" width="${size}" height="${size}" rx="${(size * 0.14).toFixed(1)}" fill="none" stroke="${color}" stroke-width="${sw}"/>`,
    `<path d="M${(x + size * 0.24).toFixed(1)} ${(top + size * 0.52).toFixed(1)} L${(x + size * 0.43).toFixed(1)} ${(top + size * 0.72).toFixed(1)} L${(x + size * 0.77).toFixed(1)} ${(top + size * 0.3).toFixed(1)}" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`,
  ];
}

const head = { font: F.semi, jpFont: F.jpBold };
const body = { font: F.medium, jpFont: F.jpMedium };
const copy = { font: F.medium, jpFont: F.jpRegular };

function ogSvg() {
  const W = 1200;
  const H = 630;
  const L = 72;
  const el = [`<rect width="${W}" height="${H}" fill="${DARK}"/>`, `<rect width="${W}" height="8" fill="${GREEN}"/>`];
  el.push(...tracked(F.mono, '// LP CHECKLIST', L, 92, 20, 3.6, GREEN_TEXT));

  const size = Math.min(48, ...HEAD.map((l) => 520 / widthOf(l, 1, head.font, head.jpFont)));
  HEAD.forEach((line, i) => el.push(run(line, L, 190 + i * size * 1.42, size, { ...head, fill: WHITE })));

  el.push(...tracked(F.mono, 'askodin.app/ja', L, 502, 17, 1, '#94A3B8'));
  el.push(...wordmark(L, 556, 38));

  const px = 640;
  el.push(`<rect x="${px}" y="122" width="488" height="396" rx="12" fill="${PANEL}" stroke="${BORDER}"/>`);
  SHORT.forEach((label, i) => {
    const y = 180 + i * 50;
    el.push(...checkBox(px + 36, y, 27, GREEN_TEXT));
    el.push(...tracked(F.monoMed, String(i + 1).padStart(2, '0'), px + 82, y - 1, 19, 1, GREEN_TEXT));
    el.push(run(label, px + 130, y, 25, { ...body, fill: WHITE }));
  });
  return { W, H, el };
}

// Break after the last 、 or 。 that fits, so a word never splits across lines.
function wrap(t, size, opts, maxW) {
  const lines = [];
  let rest = t;
  while (widthOf(rest, size, opts.font, opts.jpFont) > maxW) {
    let cut = 0;
    [...rest].forEach((ch, i) => {
      if ('、。'.includes(ch) && widthOf(rest.slice(0, i + 1), size, opts.font, opts.jpFont) <= maxW) cut = i + 1;
    });
    if (!cut) throw new Error(`No break point that fits: ${rest}`);
    lines.push(rest.slice(0, cut));
    rest = rest.slice(cut);
  }
  return [...lines, rest];
}

function checklistSvg() {
  const W = 1080;
  const H = 1350;
  const L = 84;
  const el = [`<rect width="${W}" height="${H}" fill="${DARK}"/>`, `<rect width="${W}" height="10" fill="${GREEN}"/>`];
  el.push(...tracked(F.mono, 'LP CHECKLIST', L, 104, 22, 4, GREEN_TEXT));
  TITLE.forEach((line, i) => el.push(run(line, L, 180 + i * 62, 44, { ...head, fill: WHITE })));

  const tx = 186;
  const textW = W - L - tx;
  let y = 340;
  data.items.forEach((it, i) => {
    el.push(...tracked(F.monoMed, String(i + 1).padStart(2, '0'), 124, y, 26, 1, GREEN_TEXT));
    el.push(run(it.q, tx, y, 30, { ...head, fill: WHITE }));
    y += 42;
    const tag = '良い回答';
    el.push(run(tag, tx, y, 20, { ...head, fill: '#94A3B8' }));
    const lines = wrap(it.good, 23, copy, textW - 104);
    lines.forEach((line, j) => el.push(run(line, tx + 104, y + j * 34, 23, { ...copy, fill: '#CBD5E1' })));
    y += (lines.length - 1) * 34 + 72;
  });
  if (y - 72 > 1200) throw new Error(`Checklist runs to ${y - 72}px; the footer starts at 1208.`);

  el.push(`<line x1="${L}" y1="1208" x2="${W - L}" y2="1208" stroke="${WHITE}" stroke-width="1" opacity="0.14"/>`);
  el.push(...tracked(F.mono, 'askodin.app/ja', L, 1274, 21, 0.6, '#94A3B8'));
  const size = 40;
  el.push(...wordmark(W - L - F.semi.getAdvanceWidth('askOdin', size), 1276, size));
  return { W, H, el };
}

async function emit(name, { W, H, el }) {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  ${el.join('\n  ')}
</svg>`;
  fs.writeFileSync(path.join(SVG_DIR, `${name}.svg`), svg);
  const file = path.join(PNG_DIR, `${name}.png`);
  await sharp(Buffer.from(svg), { density: 300 }).resize(W, H, { fit: 'fill' }).png().toFile(file);
  console.log(`  ${file}  ${(fs.statSync(file).size / 1024).toFixed(0)}KB`);
}

async function main() {
  await emit('askOdin-what-lps-should-ask-ja-og', ogSvg());
  await emit('askOdin-what-lps-should-ask-ja-checklist', checklistSvg());
}

main().catch((err) => { console.error(err); process.exit(1); });
