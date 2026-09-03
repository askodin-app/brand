// ─────────────────────────────────────────────────────────────────────────────
// Crucible proof imagery for askodin.app/crucible.
//
// The marketing page is nine prose sections and a 20-item FAQ with no product
// imagery at all. These are the fragments that give it evidence: real pixels
// from the live app at crucible.askodin.app, cropped to one idea each and
// masked to transparent rounded corners so they sit on any section surface.
//
// Sources live in src/screenshots/crucible/ — NOT in output/, which a clean
// build wipes.
//
// Every coordinate below is written against a 1200px-wide capture and scaled by
// the source's actual width, so dropping in a 2x recapture (Firefox: about:config
// layout.css.devPixelsPerPx = 2, then the usual full-page screenshot) needs no
// edits here and doubles the output resolution. That upgrade is worth making:
// at 1x the single-card plates render soft on retina displays.
//
// The three score cards are COMPOSED, not cropped whole: each card's verdict
// summary runs 2-4 lines depending on the deck, so cropping the card entire
// gives three images of different heights that cannot sit in one grid row.
// Instead the score panel and the sub-score bar row are lifted separately and
// stacked at a fixed rhythm, which makes all three exactly 890x319. The
// summary prose is not lost — it becomes the caption in crucible.astro, where
// it is live text rather than baked pixels.
//
// Output is 890px wide against a ~397px display slot (1240px container, three
// columns, 24px gaps), i.e. 2.2x — already retina without any upscaling, which
// is why a 1x source capture is fine here.
// ─────────────────────────────────────────────────────────────────────────────

import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const SRC = 'src/screenshots/crucible';
const OUT = 'output/crucible';

// Coordinates are authored against this capture width and scaled to whatever
// the source actually is. See the header note on 2x recaptures.
const BASE_W = 1200;

// The app's card column, constant across every results page.
const CARD_X = 155;
const CARD_W = 890;

// Page background behind the cards. Used to find each card's exact bounds.
const PAGE_BG = [15, 20, 25];
// Card fill. The composed score cards are drawn on this so the two lifted
// fragments join invisibly.
const CARD_BG = '#1A2332';

const RADIUS = 14;

// Score-card geometry, measured per capture. cardTop is the card's top border;
// barTrack is the first row of the coloured sub-score bars.
const SCORE_CARDS = [
  { slug: 'theranos', file: 'theranos-results.png', cardTop: 443, barTrack: 731 },
  { slug: 'airbnb', file: 'airbnb-results.png', cardTop: 443, barTrack: 783 },
  { slug: 'pass', file: 'pass-results.png', cardTop: 932, barTrack: 1272 },
];

// Height of the lifted score panel block (card top border → below the badge)
// and of the bar row (track → below the numeric values). Both are constant
// across decks; only the summary between them varies, and it is excluded.
const PANEL_H = 211;
const BARS_H = 68;
// Breathing room where the summary prose used to sit. Without it the bars
// crowd the badge and the card reads as cramped rather than composed.
const STACK_GAP = 16;
const FOOT_PAD = 24;
const SCORE_H = PANEL_H + STACK_GAP + BARS_H + FOOT_PAD;

// Whole-card fragments, cropped as-is. The window is a generous bracket; the
// exact border is found by scanning, so a recapture that shifts content by a
// few px still lands correctly.
const FRAGMENTS = [
  { slug: 'assumption-airbnb', file: 'airbnb-results.png', from: 1880, to: 2215 },
  { slug: 'breakdown-airbnb', file: 'airbnb-results.png', from: 1395, to: 1815 },
  { slug: 'dataissue-theranos', file: 'theranos-results.png', from: 1245, to: 1712 },
];

/** Scale factor of a source capture relative to the authored 1200px width. */
async function scaleOf(file) {
  const { width } = await sharp(`${SRC}/${file}`).metadata();
  return width / BASE_W;
}

/** Exact top and bottom border of the single card inside [from, to). */
async function findCardRows(file, from, to, k) {
  const { data, info } = await sharp(`${SRC}/${file}`)
    .removeAlpha()
    .extract({
      left: Math.round(CARD_X * k),
      top: Math.round(from * k),
      width: Math.round(CARD_W * k),
      height: Math.round((to - from) * k),
    })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, channels } = info;
  const isPage = (y) => {
    // Sample across the card column; a page-background row matches everywhere.
    for (let x = 4; x < width - 4; x += 7) {
      const i = (y * width + x) * channels;
      if (
        Math.abs(data[i] - PAGE_BG[0]) > 4 ||
        Math.abs(data[i + 1] - PAGE_BG[1]) > 4 ||
        Math.abs(data[i + 2] - PAGE_BG[2]) > 4
      ) {
        return false;
      }
    }
    return true;
  };

  let top = null;
  let bottom = null;
  for (let y = 0; y < info.height; y++) {
    if (!isPage(y)) {
      if (top === null) top = y;
      bottom = y;
    }
  }
  if (top === null) throw new Error(`no card found in ${file} [${from}, ${to})`);
  return { top: Math.round(from * k) + top, height: bottom - top + 1 };
}

/** Round the corners to transparent so the fragment sits on any surface. */
function roundCorners(width, height, r) {
  return Buffer.from(
    `<svg width="${width}" height="${height}"><rect x="0" y="0" width="${width}" height="${height}" rx="${r}" fill="#fff"/></svg>`,
  );
}

/** Hairline border, drawn on top so the fragment reads as a contained object. */
function hairline(width, height, r, stroke) {
  const inset = stroke / 2;
  return Buffer.from(
    `<svg width="${width}" height="${height}"><rect x="${inset}" y="${inset}" width="${width - stroke}" height="${height - stroke}" rx="${r - inset}" fill="none" stroke="rgba(255,255,255,0.09)" stroke-width="${stroke}"/></svg>`,
  );
}

async function writeRounded(buffer, width, height, name, k = 1) {
  const r = Math.round(RADIUS * k);
  const stroke = Math.max(1, Math.round(k));
  await sharp(buffer)
    .composite([
      { input: hairline(width, height, r, stroke), top: 0, left: 0 },
      { input: roundCorners(width, height, r), blend: 'dest-in' },
    ])
    .png({ compressionLevel: 9 })
    .toFile(`${OUT}/${name}.png`);
  console.log(`  ${name}.png`.padEnd(42), `${width}x${height}`);
}

async function buildScoreCard({ slug, file, cardTop, barTrack }) {
  const src = `${SRC}/${file}`;
  const k = await scaleOf(file);
  const px = (v) => Math.round(v * k);

  const panel = await sharp(src)
    .extract({ left: px(CARD_X), top: px(cardTop), width: px(CARD_W), height: px(PANEL_H) })
    .toBuffer();
  const bars = await sharp(src)
    .extract({ left: px(CARD_X), top: px(barTrack - 14), width: px(CARD_W), height: px(BARS_H) })
    .toBuffer();

  const width = px(CARD_W);
  const height = px(SCORE_H);
  const composed = await sharp({
    create: { width, height, channels: 4, background: CARD_BG },
  })
    .composite([
      { input: panel, top: 0, left: 0 },
      { input: bars, top: px(PANEL_H + STACK_GAP), left: 0 },
    ])
    .png()
    .toBuffer();

  await writeRounded(composed, width, height, `askOdin-crucible-score-${slug}`, k);
}

async function buildFragment({ slug, file, from, to }) {
  const k = await scaleOf(file);
  const { top, height } = await findCardRows(file, from, to, k);
  const width = Math.round(CARD_W * k);
  const cropped = await sharp(`${SRC}/${file}`)
    .extract({ left: Math.round(CARD_X * k), top, width, height })
    .png()
    .toBuffer();
  await writeRounded(cropped, width, height, `askOdin-crucible-${slug}`, k);
}

mkdirSync(OUT, { recursive: true });
console.log('crucible proof imagery →', OUT);
for (const card of SCORE_CARDS) await buildScoreCard(card);
for (const fragment of FRAGMENTS) await buildFragment(fragment);
