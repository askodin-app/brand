import opentype from 'opentype.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// "The Fork in Data Retention" — platform crops, English and Japanese
// https://askodin.app/insights/ai-data-retention-fork/ (2026-08-21) and
// https://askodin.app/ja/insights/ai-data-retention-fork/ (2026-11-03)
//
// The 1200x630 Substack share card is generate-substack-og-fork.mjs; this adds
// what the article was missing, in the same composition (title, standfirst, the
// conduct / capability contrast):
//
//   EN  substack-hero 1600x900, x-mobile 1080x1350, square 1200x1200
//         output/social/20260821-ai-data-retention-fork/banners/
//   JA  x-mobile, square, and the note.com eyecatch 1280x670 (+1920, +2x)
//         output/social/20261103-ai-data-retention-fork-ja/ and -note-ja/
//
// The contrast is the article's own line: one is a promise about conduct, the
// other a claim about capability. It names no vendor, so it carries none of the
// dated vendor facts corrected on 2026-11-03. Zero retention here is OpenAI's
// offering, not a claim about askOdin.
// ─────────────────────────────────────────────────────────────────────────────

const F = {
  light: opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-Light.ttf'),
  semi: opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-SemiBold.ttf'),
  mono: opentype.loadSync('./fonts/IBM_Plex_Mono/IBMPlexMono-Regular.ttf'),
  serifIt: opentype.loadSync('./fonts/IBM_Plex_Serif/IBMPlexSerif-Italic.ttf'),
  jpRegular: opentype.loadSync('./fonts/Noto_Sans_JP/NotoSansJP-Regular.ttf'),
  jpMedium: opentype.loadSync('./fonts/Noto_Sans_JP/NotoSansJP-Medium.ttf'),
};

const ORANGE = '#DB4A2B';
const GREEN = '#147B58';
const GREEN_TEXT = '#2FA37A';
const DARK = '#111119';
const WHITE = '#FFFFFF';

const COPY = {
  en: {
    dir: './output/social/20260821-ai-data-retention-fork',
    slug: 'fork-retention',
    title: ['The Fork in', 'Data Retention'],
    standfirst: 'Two AI giants. One problem. Opposite answers.',
    eyebrow: '// FIELD NOTE',
    cols: [
      { label: '30-DAY RETENTION', a: 'A promise about', b: 'conduct.', color: GREEN_TEXT },
      { label: 'ZERO RETENTION', a: 'A claim about', b: 'capability.', color: ORANGE },
    ],
    url: 'ASKODIN.APP/INSIGHTS',
  },
  ja: {
    dir: './output/social/20261103-ai-data-retention-fork-ja',
    slug: 'fork-retention-ja',
    title: ['データ保持の分岐点'],
    standfirst: 'AI大手2社が、同じ問いに正反対の答えを出した。',
    // Upright: Latin in italic serif leans against upright kana.
    standfirstFont: 'light',
    eyebrow: '// INSIGHTS',
    cols: [
      { label: '30日間の保持', a: '行動についての', b: '約束。', color: GREEN_TEXT },
      { label: 'ゼロ保持', a: '能力についての', b: '主張。', color: ORANGE },
    ],
    url: 'ASKODIN.APP/JA',
  },
};

// ── Mixed-script text: Japanese in Noto, Latin in Plex ───────────────────────
const isJP = (ch) => {
  const c = ch.codePointAt(0);
  return (c >= 0x3000 && c <= 0x30ff) || (c >= 0x4e00 && c <= 0x9fff) || (c >= 0xff00 && c <= 0xffef);
};
const JP_FOR = new Map([[F.light, F.jpRegular], [F.serifIt, F.jpRegular], [F.semi, F.jpMedium], [F.mono, F.jpRegular]]);
function face(ch, f) {
  const g = isJP(ch) ? JP_FOR.get(f) : f;
  if (g.charToGlyphIndex(ch) === 0) throw new Error(`Add to KANJI in tools/prepare-noto-sans-jp.py: ${ch}`);
  return g;
}
const adv = (ch, f, size) => { const g = face(ch, f); return g.charToGlyph(ch).advanceWidth * (size / g.unitsPerEm); };
const widthOf = (t, f, size, track = 0) => [...t].reduce((w, ch) => w + adv(ch, f, size) + track, 0) - track;
function run(t, x, y, f, size, fill, op = 1, track = 0) {
  const parts = [];
  for (const ch of t) {
    if (ch !== ' ') { const d = face(ch, f).getPath(ch, x, y, size).toPathData(2); if (d) parts.push(d); }
    x += adv(ch, f, size) + track;
  }
  return `<path d="${parts.join(' ')}" fill="${fill}"${op === 1 ? '' : ` opacity="${op}"`}/>`;
}
const mid = (t, cx, y, f, size, fill, op, track = 0) => run(t, cx - widthOf(t, f, size, track) / 2, y, f, size, fill, op, track);
const fit = (lines, f, size, maxW, track = 0) => { while (size > 10 && lines.some((l) => widthOf(l, f, size, track) > maxW)) size -= 1; return size; };

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

function wordmark(cx, y, size) {
  const askW = F.semi.getAdvanceWidth('ask', size);
  const x = cx - F.semi.getAdvanceWidth('askOdin', size) / 2;
  return [
    `<path d="${F.semi.getPath('ask', x, y, size).toPathData(2)}" fill="${ORANGE}"/>`,
    `<path d="${F.semi.getPath('Odin', x + askW, y, size).toPathData(2)}" fill="${GREEN}"/>`,
  ];
}

// The contrast block: two columns side by side, or stacked for portrait.
function contrast(c, cx, y, s, inner, side) {
  const el = [];
  const colW = side ? inner / 2 - 40 * s : inner;
  const xs = side ? [cx - inner / 4, cx + inner / 4] : [cx, cx];
  const size = fit(c.cols.flatMap((k) => [k.a, k.b]), F.light, 40 * s, colW);
  const rowH = 32 * s + size * 2.5;
  c.cols.forEach((k, i) => {
    const top = side ? y : y + i * (rowH + 56 * s);
    el.push(mid(k.label, xs[i], top, F.mono, 18 * s, k.color, 1, 3.6 * s));
    el.push(mid(k.a, xs[i], top + 32 * s + size, F.light, size, WHITE, 0.92));
    el.push(mid(k.b, xs[i], top + 32 * s + size * 2.2, F.semi, size, WHITE));
  });
  if (side) {
    el.push(`<line x1="${cx}" y1="${(y - 28 * s).toFixed(1)}" x2="${cx}" y2="${(y + rowH).toFixed(1)}" stroke="${ORANGE}" stroke-width="${(2 * s).toFixed(1)}" opacity="0.8"/>`);
    return { el, bottom: y + rowH };
  }
  const divY = y + rowH + 16 * s;
  el.push(`<line x1="${(cx - 40 * s).toFixed(1)}" y1="${divY.toFixed(1)}" x2="${(cx + 40 * s).toFixed(1)}" y2="${divY.toFixed(1)}" stroke="${ORANGE}" stroke-width="${(2 * s).toFixed(1)}" opacity="0.8"/>`);
  return { el, bottom: y + rowH * 2 + 56 * s };
}

function layout(c, side) {
  return (cx, s, inner, spread) => {
    const el = [];
    let y = 0;
    el.push(...wordmark(cx, (y += 30 * s), 30 * s));
    y += 60 * s * spread;
    el.push(mid(c.eyebrow, cx, y, F.mono, 18 * s, ORANGE, 1, 4.4 * s));
    y += 84 * s * spread;
    const tSize = fit(c.title, F.light, (side ? 76 : 88) * s, inner);
    c.title.forEach((line, i) => el.push(mid(line, cx, y + i * tSize * 1.14, F.light, tSize, WHITE, 0.96)));
    y += (c.title.length - 1) * tSize * 1.14 + 60 * s * spread;
    const sf = c.standfirstFont === 'light' ? F.light : F.serifIt;
    el.push(mid(c.standfirst, cx, y, sf, fit([c.standfirst], sf, 30 * s, inner), WHITE, 0.74));
    y += 96 * s * spread;
    const block = contrast(c, cx, y, s, inner, side);
    el.push(...block.el);
    y = block.bottom + 70 * s * spread;
    el.push(mid(c.url, cx, y, F.mono, 16 * s, WHITE, 0.4, 4.4 * s));
    return { el, height: y };
  };
}

function solveSpread(fn, cx, s, inner, want) {
  let lo = 0.4, hi = 3.6;
  for (let i = 0; i < 30; i++) {
    const m = (lo + hi) / 2;
    if (fn(cx, s, inner, m).height < want) lo = m; else hi = m;
  }
  return lo;
}

function frame(W, H, fn, { s, margin, target }) {
  const inner = W - margin * 2;
  const spread = solveSpread(fn, W / 2, s, inner, H * target);
  const { el, height } = fn(W / 2, s, inner, spread);
  const ty = (H - height) / 2 + 12 * s;
  return [...backdrop(W, H), `<g transform="translate(0 ${ty.toFixed(1)})">`, ...el, `</g>`];
}

const svgFor = (W, H, el) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  ${el.join('\n  ')}
</svg>`;

async function emit(dir, name, W, H, el, sizes = [[W, H, ''], [W * 2, H * 2, '-2x']]) {
  for (const d of ['banners', 'svg']) fs.mkdirSync(path.join(dir, d), { recursive: true });
  const svg = svgFor(W, H, el);
  fs.writeFileSync(path.join(dir, 'svg', `${name}.svg`), svg);
  for (const [w, h, suffix] of sizes) {
    await sharp(Buffer.from(svg), { density: 300 }).resize(w, h, { fit: 'fill' }).png().toFile(path.join(dir, 'banners', `${name}${suffix}.png`));
  }
  console.log(`  ${name}: ${sizes.map(([w, h]) => `${w}x${h}`).join(', ')}`);
}

async function main() {
  const en = COPY.en;
  await emit(en.dir, `askOdin-substack-${en.slug}-hero`, 1600, 900, frame(1600, 900, layout(en, true), { s: 1.12, margin: 220, target: 0.8 }));
  await emit(en.dir, `askOdin-${en.slug}-x-mobile`, 1080, 1350, frame(1080, 1350, layout(en, false), { s: 1.0, margin: 90, target: 0.8 }));
  await emit(en.dir, `askOdin-${en.slug}-square`, 1200, 1200, frame(1200, 1200, layout(en, true), { s: 1.0, margin: 110, target: 0.78 }));

  const ja = COPY.ja;
  await emit(ja.dir, `askOdin-${ja.slug}-x-mobile`, 1080, 1350, frame(1080, 1350, layout(ja, false), { s: 1.0, margin: 90, target: 0.8 }));
  await emit(ja.dir, `askOdin-${ja.slug}-square`, 1200, 1200, frame(1200, 1200, layout(ja, true), { s: 1.0, margin: 110, target: 0.78 }));
  // note.com eyecatch: its own publication, so its own folder.
  await emit(`${ja.dir.replace(/-ja$/, '')}-note-ja`, 'askOdin-fork-retention-note-ja', 1280, 670,
    frame(1280, 670, layout(ja, true), { s: 0.8, margin: 120, target: 0.84 }),
    [[1280, 670, ''], [1920, 1006, '-1920'], [2560, 1340, '-2x']]);
}

main().catch((err) => { console.error(err); process.exit(1); });
