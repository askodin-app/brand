import opentype from 'opentype.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// ─────────────────────────────────────────────────────────────────────────────
// Japanese Open Graph cards for askodin.app/ja/ — one per page, 1200x630.
//
//   node generate-ja-og-cards.mjs
//
// Writes output/og/ja/<id>.png, copied to public/og/<id>.png in
// askodin-coming-soon, where jaOgIds in src/data/ogPages.ts declares them. They
// are built here and not by that repo's generate-og-images.mjs because librsvg
// falls back to whatever CJK face the machine has; here the type is outlined, so
// the card is the same on every machine. Identity assets, so no date in the path.
//
// Titles and decks are condensed from each page. Change a page's title and its
// card goes stale silently: update it here in the same change.
// ─────────────────────────────────────────────────────────────────────────────

const F = {
  semi: opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-SemiBold.ttf'),
  mono: opentype.loadSync('./fonts/IBM_Plex_Mono/IBMPlexMono-Regular.ttf'),
  monoMed: opentype.loadSync('./fonts/IBM_Plex_Mono/IBMPlexMono-Medium.ttf'),
  jpMedium: opentype.loadSync('./fonts/Noto_Sans_JP/NotoSansJP-Medium.ttf'),
  jpRegular: opentype.loadSync('./fonts/Noto_Sans_JP/NotoSansJP-Regular.ttf'),
};

const ORANGE = '#DB4A2B';
const GREEN = '#147B58';
const DARK = '#111119';
const WHITE = '#FFFFFF';
const W = 1200;
const H = 630;

const OUT = './output/og/ja';
fs.mkdirSync(OUT, { recursive: true });

// [id, eyebrow, headline lines, deck]
const CARDS = [
  ['ja', '// AI JUDGMENT INFRASTRUCTURE', ['資本配分のための', 'AI判断インフラ'], '投資判断の推論を、決定論的に監査する。'],
  ['ja/about', '// ABOUT', ['askOdinについて'], 'シンガポール発。プライベート・キャピタルのためのAI判断インフラ。'],
  ['ja/ai-judgment-infrastructure', '// THE CATEGORY', ['AI判断インフラとは'], 'AIは投資判断に使えるか。'],
  ['ja/allocators', '// FOR ALLOCATORS', ['LP・機関投資家のための', 'GP評価'], 'GPの投資判断の質を、IDDとODDの両面で。'],
  ['ja/architecture-ip', '// ARCHITECTURE & IP', ['決定論的AIの', 'アーキテクチャと特許'], '抽出はモデル、評価は決定論的エンジン。'],
  ['ja/clarity-framework', '// THE STANDARD', ['Clarity Framework：', '投資判断の基準'], '採点する5つの柱と3つの監査チェック。'],
  ['ja/clarity-score', '// THE METRIC', ['Clarity Scoreとは'], '投資の語りが成立しているかを、再現可能な0〜100の尺度で。'],
  ['ja/clarity', '// ASKODIN CLARITY', ['投資委員会のための', 'デューデリジェンス'], 'メモの主張を、その元になった財務モデルと突き合わせる。'],
  ['ja/crucible', '// ASKODIN CRUCIBLE', ['ピッチ資料の無料監査'], '投資委員会が見つける構造上の欠陥を、3分以内に。'],
  ['ja/insights/ai-sovereignty-investment-judgment', '// INSIGHTS', ['「AI主権」と投資判断'], 'モデルの産地は、判断の検証可能性を保証しない。'],
  ['ja/methodology', '// METHODOLOGY', ['Clarity Scoreの', '算出方法'], 'スコア帯、Kill Shot の条件、バージョン管理、独立性を文書化。'],
  ['ja/sandbox', '// SANDBOX', ['金融界の目利きを', '欺いた案件で試す'], 'アップロード不要。ブラウザの中で動く監査デモ。'],
  ['ja/security', '// SECURITY', ['生成AIと機密情報：', 'データの取り扱い'], '何を、どれだけの期間保持するか。各管理策を区別して示す。'],
  ['ja/solutions/accelerators', '// ACCELERATORS', ['アクセラレーター向け', 'ピッチ資料審査'], 'コホート全体にCrucibleを、プログラムチームにClarityを。'],
  ['ja/solutions/private-equity-ma', '// PE · M&A', ['LOI前のCIM検証'], 'QoEではない。範囲を限定したパイロットとして。'],
  ['ja/terminal-audits/theranos', '// TERMINAL AUDIT', ['セラノス（Theranos）の', 'ターミナル監査'], '語りは完璧、推論は不成立。'],
  ['ja/terminal-audits/wework', '// TERMINAL AUDIT', ['WeWork S-1 の', 'ターミナル監査'], 'S-1の15年リースと月単位の収益。'],
  ['ja/use-cases/ai-due-diligence-software', '// USE CASE', ['VC・CVC向け', 'AIデューデリジェンス'], 'ピッチ資料の主張を、財務モデルと突き合わせる。'],
  ['ja/verify', '// ASKODIN VERIFY', ['検証済みブリーフ'], '「Verified by askOdin」バッジが何を証明するか。'],
];

// Text is outlined, so a kanji outside the Noto subset has no fallback: it would
// ship as a tofu box. Fail with the characters instead, in the form KANJI wants
// in tools/prepare-noto-sans-jp.py.
const copy = CARDS.flatMap(([, , head, deck]) => [...head, deck]).join('');
const missing = [...new Set(copy)].filter((ch) => ch !== ' ' && F.jpMedium.charToGlyph(ch).index === 0);
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

// Mono is letterspaced by hand — opentype has no tracking.
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

// House chrome: fading grid, faint green O bleeding off the left, orange hairline.
function backdrop() {
  const el = [`<rect width="${W}" height="${H}" fill="${DARK}"/>`];
  el.push(`<defs><linearGradient id="gridFade" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="${WHITE}" stop-opacity="0.05"/>
    <stop offset="55%" stop-color="${WHITE}" stop-opacity="0.022"/>
    <stop offset="100%" stop-color="${WHITE}" stop-opacity="0"/>
  </linearGradient></defs>`);
  for (let x = 0; x <= W; x += 75) el.push(`<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="url(#gridFade)" stroke-width="1"/>`);
  for (let y = 70; y < H; y += 70) el.push(`<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="url(#gridFade)" stroke-width="1"/>`);
  el.push(`<path d="${pathOf(F.semi, 'O', -110, H / 2 + 185, 620)}" fill="${GREEN}" opacity="0.055"/>`);
  el.push(`<rect width="${W}" height="6" fill="${ORANGE}"/>`);
  return el;
}

function card(eyebrow, head, deck) {
  const el = backdrop();
  const L = 84;
  const inner = W - L * 2;

  const askW = width(F.semi, 'ask', 32);
  el.push(`<path d="${pathOf(F.semi, 'ask', L, 108, 32)}" fill="${ORANGE}"/>`);
  el.push(`<path d="${pathOf(F.semi, 'Odin', L + askW, 108, 32)}" fill="${GREEN}"/>`);

  el.push(...tracked(F.monoMed, eyebrow, L, 196, 18, 4.4, ORANGE, 1));

  const hSize = fit(F.jpMedium, head, 76, inner);
  const lead = hSize * 1.3;
  const top = head.length === 1 ? 318 : 292;
  head.forEach((line, i) => {
    // 「 sits at the right of its em box; hang it so the line stays flush left.
    const x = line.startsWith('「') ? L - hSize * 0.5 : L;
    el.push(at(F.jpMedium, line, x, top + i * lead, hSize, WHITE, 0.96));
  });

  const ry = top + (head.length - 1) * lead + 46;
  el.push(`<line x1="${L}" y1="${ry.toFixed(1)}" x2="${L + 64}" y2="${ry.toFixed(1)}" stroke="${ORANGE}" stroke-width="3"/>`);

  const dSize = fit(F.jpRegular, [deck], 28, inner);
  el.push(at(F.jpRegular, deck, L, ry + 52, dSize, WHITE, 0.74));

  el.push(...tracked(F.mono, 'ASKODIN.APP/JA', L, 584, 15, 3.8, WHITE, 0.42));
  return el;
}

async function main() {
  for (const [id, eyebrow, head, deck] of CARDS) {
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  ${card(eyebrow, head, deck).join('\n  ')}
</svg>`;
    const file = path.join('./output/og', `${id}.png`);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    await sharp(Buffer.from(svg), { density: 300 }).resize(W, H, { fit: 'fill' }).png().toFile(file);
  }
  console.log(`${CARDS.length} Japanese OG cards → output/og/ja*`);
}

main().catch((err) => { console.error(err); process.exit(1); });
