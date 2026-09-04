// ─────────────────────────────────────────────────────────────────────────────
// Osaka meishi — the bilingual executive card.
//
//   front  card_front_en.svg   Hardened Dark, English/global face
//   back   card_back_ja.svg    Institutional White, Japanese executive face
//
// Everything is drawn in millimetres: the SVG is `width="95mm" viewBox="0 0 95 59"`
// so one user unit is one millimetre and a printer's ruler agrees with the source.
// Point sizes from the spec are converted once, through PT.
//
// All text is outlined to <path>. A Japanese printer never has to have our fonts,
// and nothing can substitute Yu Gothic for Noto behind our backs.
//
// The QR is regenerated from the decoded URL rather than traced from the LinkedIn
// screenshot — see QR_URL below.
// ─────────────────────────────────────────────────────────────────────────────

import opentype from 'opentype.js';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = './output/business-card';
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// ── Brand ────────────────────────────────────────────────────────────────────
const ORANGE = '#DB4A2B';
const GREEN  = '#147B58';
const DARK   = '#111119';
const WHITE  = '#FFFFFF';
const MUTED  = '#8899AA';

// ── Geometry (mm) ────────────────────────────────────────────────────────────
// Japanese meishi trim is 91 x 55. Bleed adds 2mm on every side; the safe box is
// a further 3mm in, which is the 85 x 49 the spec asks us to keep text inside.
const BLEED_W = 95.0, BLEED_H = 59.0;
const TRIM    = 2.0;                       // bleed margin on each edge
const SAFE    = 5.0;                       // safe-area inset from the bleed edge
const SAFE_L = SAFE, SAFE_R = BLEED_W - SAFE, SAFE_T = SAFE, SAFE_B = BLEED_H - SAFE;

const PT = 25.4 / 72;                      // 1pt in mm
const pt = (n) => n * PT;

// ── Fonts ────────────────────────────────────────────────────────────────────
const F = {
  light:    opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-Light.ttf'),
  regular:  opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-Regular.ttf'),
  medium:   opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-Medium.ttf'),
  semibold: opentype.loadSync('./fonts/IBM_Plex_Sans/static/IBMPlexSans-SemiBold.ttf'),
  mono:     opentype.loadSync('./fonts/IBM_Plex_Mono/IBMPlexMono-Regular.ttf'),
  jp:       opentype.loadSync('./fonts/Noto_Sans_JP/NotoSansJP-Regular.ttf'),
  jpMedium: opentype.loadSync('./fonts/Noto_Sans_JP/NotoSansJP-Medium.ttf'),
  jpBold:   opentype.loadSync('./fonts/Noto_Sans_JP/NotoSansJP-Bold.ttf'),
};

// Kana, kanji, CJK punctuation and fullwidth forms come from Noto; everything
// else from Plex. Setting a Latin face against a Japanese one is the normal
// treatment for mixed copy and it keeps "CEO" and "askodin.app" on brand.
const isJP = (ch) => {
  const c = ch.codePointAt(0);
  return (c >= 0x3000 && c <= 0x30ff) ||   // CJK punctuation, hiragana, katakana
         (c >= 0x4e00 && c <= 0x9fff) ||   // kanji
         (c >= 0xff00 && c <= 0xffef);     // fullwidth forms
};

/**
 * Outline a string, optionally setting Latin runs in a different face.
 * `tracking` is in em, matching the CSS letter-spacing the spec quotes.
 */
function text(str, x, y, sizeMm, { font, jpFont = null, fill, tracking = 0 }) {
  const parts = [];
  let cursor = x;
  for (const ch of str) {
    const f = jpFont && isJP(ch) ? jpFont : font;
    const scale = sizeMm / f.unitsPerEm;
    if (ch !== ' ' || true) {
      const d = f.getPath(ch, cursor, y, sizeMm).toPathData(3);
      if (d) parts.push(d);
    }
    cursor += f.charToGlyph(ch).advanceWidth * scale + tracking * sizeMm;
  }
  return {
    svg: `<path d="${parts.join(' ')}" fill="${fill}"/>`,
    width: cursor - x - tracking * sizeMm,
  };
}

function widthOf(str, sizeMm, { font, jpFont = null, tracking = 0 }) {
  let w = 0;
  for (const ch of str) {
    const f = jpFont && isJP(ch) ? jpFont : font;
    w += f.charToGlyph(ch).advanceWidth * (sizeMm / f.unitsPerEm) + tracking * sizeMm;
  }
  return w - tracking * sizeMm;
}

/** How far the deepest glyph in a string falls below the baseline, in mm. */
function descent(str, sizeMm, { font, jpFont = null }) {
  let d = 0;
  for (const ch of str) {
    const f = jpFont && isJP(ch) ? jpFont : font;
    d = Math.max(d, f.getPath(ch, 0, 0, sizeMm).getBoundingBox().y2);
  }
  return d;
}

// ── The wordmark, scaled to a target visual height ───────────────────────────
function wordmark(x, topY, targetH) {
  const probe = 100;
  const bb = F.semibold.getPath('askOdin', 0, 0, probe).getBoundingBox();
  const size = probe * (targetH / (bb.y2 - bb.y1));
  const bb2 = F.semibold.getPath('askOdin', 0, 0, size).getBoundingBox();
  const baseline = topY - bb2.y1;                       // y1 is negative (above baseline)
  const wAsk = widthOf('ask', size, { font: F.semibold });
  return {
    svg: [
      text('ask',  x,        baseline, size, { font: F.semibold, fill: ORANGE }).svg,
      text('Odin', x + wAsk, baseline, size, { font: F.semibold, fill: GREEN  }).svg,
    ].join('\n  '),
    width: wAsk + widthOf('Odin', size, { font: F.semibold }),
  };
}

// ── The logomark: the Plex "O" in green with the orange judgment diamond ─────
// Reproduces generate-wordmark.mjs exactly — same 0.95 optical size, same 20/512
// padding, same 0.11 diamond — so the 8mm mark on the back is the real logomark
// and not a lookalike. The O is deliberately oval; that is the Plex glyph.
function logomark(x, y, size) {
  const NOM = 512, PAD = 20;
  const oSize = NOM * 0.95;
  const bb = F.semibold.getPath('O', 0, 0, oSize).getBoundingBox();
  const frame = Math.max((bb.x2 - bb.x1) + PAD * 2, (bb.y2 - bb.y1) + PAD * 2);
  const k = size / frame;                       // nominal units -> mm

  const s = oSize * k;
  const b = F.semibold.getPath('O', 0, 0, s).getBoundingBox();
  const ox = x - b.x1 + (size - (b.x2 - b.x1)) / 2;
  const oy = y - b.y1 + (size - (b.y2 - b.y1)) / 2;
  const oPath = F.semibold.getPath('O', ox, oy, s).toPathData(3);

  const cx = x + size / 2, cy = y + size / 2;
  const d = size * 0.11;
  return `<path d="${oPath}" fill="${GREEN}"/>
  <path d="M ${cx.toFixed(3)} ${(cy - d).toFixed(3)} L ${(cx + d).toFixed(3)} ${cy.toFixed(3)} L ${cx.toFixed(3)} ${(cy + d).toFixed(3)} L ${(cx - d).toFixed(3)} ${cy.toFixed(3)} Z" fill="${ORANGE}"/>`;
}

/**
 * Left side bearing of a string's first glyph, in mm.
 * A Japanese opening bracket sits in the right half of its em box, so setting
 * 「資本…」 flush to the margin leaves it looking indented against the lines
 * above it. Hanging it back out by its bearing is the normal treatment.
 */
function lsb(str, sizeMm, { font, jpFont = null }) {
  const ch = [...str][0];
  const f = jpFont && isJP(ch) ? jpFont : font;
  return f.getPath(ch, 0, 0, sizeMm).getBoundingBox().x1;
}

// ── QR ───────────────────────────────────────────────────────────────────────
// Decoded from the founder's LinkedIn profile QR (v4, EC M, "?fromQR=1" tracking
// parameter stripped). Dropping the parameter shortens the payload enough to
// fall from 33x33 to 29x29, which buys a 14% larger module — the difference
// between a marginal and a comfortable scan at 13mm in a dim meeting room.
const QR_URL = 'https://www.linkedin.com/in/yeksoon';
const QR_EC  = 'M';

/**
 * Horizontal runs are merged into one path. Adjacent <rect>s can leave hairline
 * seams on some RIPs; a single path with one subpath per run removes the
 * vertical ones and keeps the file small.
 */
function qrPath(url, ec, originX, originY, dataSize) {
  const qr = QRCode.create(url, { errorCorrectionLevel: ec });
  const n = qr.modules.size;
  const m = dataSize / n;
  const dark = (r, c) => qr.modules.data[r * n + c] === 1;

  const subpaths = [];
  for (let r = 0; r < n; r++) {
    let c = 0;
    while (c < n) {
      if (!dark(r, c)) { c++; continue; }
      let end = c;
      while (end + 1 < n && dark(r, end + 1)) end++;
      const x = originX + c * m, y = originY + r * m, w = (end - c + 1) * m;
      subpaths.push(`M${x.toFixed(4)} ${y.toFixed(4)}h${w.toFixed(4)}v${m.toFixed(4)}h-${w.toFixed(4)}Z`);
      c = end + 1;
    }
  }
  return { path: `<path d="${subpaths.join('')}" fill="${DARK}"/>`, modules: n, module: m, version: qr.version };
}

// ─────────────────────────────────────────────────────────────────────────────
// FACE 1 — card_front_en.svg
// ─────────────────────────────────────────────────────────────────────────────
function front() {
  const el = [];

  el.push(`<rect x="0" y="0" width="${BLEED_W}" height="${BLEED_H}" fill="${DARK}"/>`);

  // Accent bar: 1.0mm must survive the cut, so it runs off the top of the bleed
  // and shows exactly 1.0mm below the trim line. Drawn flush to y=0 it would be
  // trimmed away entirely.
  el.push(`<rect x="0" y="0" width="${BLEED_W}" height="${TRIM + 1.0}" fill="${ORANGE}"/>`);

  const mark = wordmark(SAFE_L, SAFE_T, 6.5);
  el.push(mark.svg);

  // Executive identity
  el.push(text('LOK Yek Soon',    SAFE_L, 21.6, pt(11), { font: F.semibold, fill: WHITE }).svg);
  el.push(text('Founder & CEO',   SAFE_L, 26.4, pt(8),  { font: F.regular,  fill: MUTED }).svg);
  el.push(text('askOdin Pte Ltd', SAFE_L, 30.4, pt(8),  { font: F.regular,  fill: MUTED }).svg);

  // Positioning and defensibility
  el.push(text('Building AI Judgment Infrastructure™', SAFE_L, 37.4, pt(7), { font: F.light, fill: WHITE }).svg);
  el.push(text('U.S. Patents Pending (4 Applications)',      SAFE_L, 42.0, pt(5.5), { font: F.mono, fill: MUTED }).svg);

  // QR, bottom-right, inside the safe box
  const QR_BOX = 13.0, QUIET = 1.5;
  const boxX = SAFE_R - QR_BOX, boxY = SAFE_B - QR_BOX;
  const q = qrPath(QR_URL, QR_EC, boxX + QUIET, boxY + QUIET, QR_BOX - QUIET * 2);
  el.push(`<rect x="${boxX}" y="${boxY}" width="${QR_BOX}" height="${QR_BOX}" rx="0.5" fill="${WHITE}"/>`);
  el.push(q.path);

  // Coordinates. The block is bottom-aligned on the QR container's lower edge by
  // its descender rather than its baseline, so the 'p' of .app stays inside the
  // safe box and the two still read flush.
  const lh = pt(6.5) * 1.4;
  const lines = ['+65 9684 2308', 'yeksoon@askodin.app', 'askodin.app · Singapore'];
  const lastBase = SAFE_B - descent(lines[lines.length - 1], pt(6.5), { font: F.regular });
  lines.forEach((line, i) => {
    const y = lastBase - (lines.length - 1 - i) * lh;
    el.push(text(line, SAFE_L, y, pt(6.5), { font: F.regular, fill: WHITE }).svg);
  });

  return { svg: svg('askOdin Meishi — Front (EN)', el), qr: q };
}

// ─────────────────────────────────────────────────────────────────────────────
// FACE 2 — card_back_ja.svg
// ─────────────────────────────────────────────────────────────────────────────
function back() {
  const el = [];
  el.push(`<rect x="0" y="0" width="${BLEED_W}" height="${BLEED_H}" fill="${WHITE}"/>`);

  const jp = { font: F.regular, jpFont: F.jp };

  // Company
  el.push(text('askOdin Pte Ltd', SAFE_L, 9.0, pt(8), { font: F.semibold, fill: DARK }).svg);
  el.push(text('アスクオーディン（シンガポール法人）',
    SAFE_L, 13.0, pt(6.5), { ...jp, fill: MUTED }).svg);

  // Executive identity
  el.push(text('創業者 兼 代表取締役CEO',
    SAFE_L, 19.5, pt(7.5), { font: F.medium, jpFont: F.jpMedium, fill: GREEN }).svg);
  el.push(text('ロック・イェック・スーン',
    SAFE_L, 23.4, pt(5.5), { ...jp, fill: MUTED, tracking: 0.05 }).svg);
  el.push(text('陸 奕 順',
    SAFE_L, 30.5, pt(13), { font: F.jpBold, jpFont: F.jpBold, fill: DARK, tracking: 0.15 }).svg);
  el.push(text('LOK Yek Soon', SAFE_L, 34.8, pt(7), { font: F.regular, fill: MUTED }).svg);

  // Category and patents. The opening bracket hangs into the margin so the line
  // reads flush with the block above it.
  const catSize = pt(7.5);
  el.push(text('「資本配分のためのAI判断インフラ™」',
    SAFE_L - lsb('「', catSize, jp), 40.5, catSize, { ...jp, fill: DARK }).svg);
  el.push(text('米国特許出願中（4件）',
    SAFE_L, 44.2, pt(6), { ...jp, fill: MUTED }).svg);

  // Logomark, bottom-right, matching the QR's optical corner on the front
  const LOGO = 8.0;
  el.push(logomark(SAFE_R - LOGO, SAFE_B - LOGO, LOGO));

  // Coordinates, bottom-aligned on the logomark's lower edge by descender.
  const lh = pt(6.5) * 1.4;
  const lines = [
    '+65 9684 2308',
    'yeksoon@askodin.app',
    'askodin.app · 所在地: シンガポール',
  ];
  const lastBase = SAFE_B - descent(lines[lines.length - 1], pt(6.5), jp);
  lines.forEach((line, i) => {
    const y = lastBase - (lines.length - 1 - i) * lh;
    el.push(text(line, SAFE_L, y, pt(6.5), { ...jp, fill: DARK }).svg);
  });

  return { svg: svg('askOdin Meishi — Back (JA)', el) };
}

function svg(title, elements) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${BLEED_W}mm" height="${BLEED_H}mm" viewBox="0 0 ${BLEED_W} ${BLEED_H}">
  <title>${title}</title>
  <desc>Bleed ${BLEED_W}x${BLEED_H}mm · Trim ${BLEED_W - TRIM * 2}x${BLEED_H - TRIM * 2}mm · Safe ${BLEED_W - SAFE * 2}x${BLEED_H - SAFE * 2}mm. All text outlined.</desc>
  ${elements.join('\n  ')}
</svg>`;
}

/**
 * Proof render: the card as it looks after the cutter takes the 2mm bleed off,
 * so the 1mm accent reads as 1mm and nothing that falls outside the trim is
 * flattering us. 600dpi.
 */
async function proof(svgStr, outPath) {
  const { default: sharp } = await import('sharp');
  const px = (n) => Math.round(n / 25.4 * 600);
  const full = await sharp(Buffer.from(svgStr), { density: 600 })
    .resize(px(BLEED_W), px(BLEED_H), { fit: 'fill' }).png().toBuffer();
  await sharp(full)
    .extract({ left: px(TRIM), top: px(TRIM), width: px(BLEED_W - TRIM * 2), height: px(BLEED_H - TRIM * 2) })
    .png().toFile(outPath);
}

/**
 * Review PDF: both faces, one per page, at trim size and still vector — so a
 * reviewer sees the card at the size it will be held and can zoom into the
 * Japanese without hitting pixels. This is a REVIEW artefact, not the print
 * file: it carries no bleed, and it is RGB.
 */
async function reviewPdf(faces, outPath) {
  const { default: puppeteer } = await import('puppeteer');
  const TW = BLEED_W - TRIM * 2, TH = BLEED_H - TRIM * 2;
  const trimmed = (svgStr) => svgStr
    .replace(/<\?xml[^>]*\?>/, '')
    .replace(`width="${BLEED_W}mm" height="${BLEED_H}mm"`, `width="${TW}mm" height="${TH}mm"`)
    .replace(`viewBox="0 0 ${BLEED_W} ${BLEED_H}"`, `viewBox="${TRIM} ${TRIM} ${TW} ${TH}"`);

  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    @page { size: ${TW}mm ${TH}mm; margin: 0; }
    html, body { margin: 0; padding: 0; }
    .face { width: ${TW}mm; height: ${TH}mm; overflow: hidden; break-after: page; }
    .face:last-child { break-after: auto; }
    svg { display: block; }
  </style></head><body>${faces.map((f) => `<div class="face">${trimmed(f)}</div>`).join('')}</body></html>`;

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'load' });
  await page.pdf({ path: outPath, width: `${TW}mm`, height: `${TH}mm`,
                   printBackground: true, preferCSSPageSize: true });
  await browser.close();
}

// ─────────────────────────────────────────────────────────────────────────────
const f = front();
const b = back();
fs.writeFileSync(path.join(OUTPUT_DIR, 'card_front_en.svg'), f.svg);
fs.writeFileSync(path.join(OUTPUT_DIR, 'card_back_ja.svg'), b.svg);
await proof(f.svg, path.join(OUTPUT_DIR, 'card_front_en-proof.png'));
await proof(b.svg, path.join(OUTPUT_DIR, 'card_back_ja-proof.png'));
await reviewPdf([f.svg, b.svg], path.join(OUTPUT_DIR, 'card_meishi-review.pdf'));

console.log('=== Osaka meishi ===');
console.log(`  card_front_en.svg   ${BLEED_W}x${BLEED_H}mm bleed / ${BLEED_W - TRIM * 2}x${BLEED_H - TRIM * 2}mm trim`);
console.log(`  card_back_ja.svg    ${BLEED_W}x${BLEED_H}mm bleed / ${BLEED_W - TRIM * 2}x${BLEED_H - TRIM * 2}mm trim`);
console.log(`  *-proof.png         trimmed 600dpi proofs`);
console.log(`  card_meishi-review.pdf  2pp vector, trim size — review only, no bleed`);
console.log(`  QR  v${f.qr.version} ${f.qr.modules}x${f.qr.modules} EC-${QR_EC} · module ${f.qr.module.toFixed(3)}mm · ${QR_URL}`);
