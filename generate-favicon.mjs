import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = './output';
const FAVICON_DIR = path.join(OUTPUT_DIR, 'favicon');

fs.mkdirSync(FAVICON_DIR, { recursive: true });

// ============================================================
// Source geometry — lifted from output/logomark/askOdin-icon-*.svg
// so the favicon IS the logomark, not a separate lettermark.
//
// The O spans +/-147.87 x, +/-175.59 y around the origin.
// The diamond spans +/-43.03 around the origin.
// Height (351.18) is the constraining dimension on a square canvas.
// ============================================================
const O_PATH = 'M0 175.59L0 175.59Q-44.26 175.59-77.82 155.65Q-111.39 135.71-129.63 96.55Q-147.87 57.40-147.87 0L-147.87 0Q-147.87-57.40-129.63-96.55Q-111.39-135.71-77.82-155.65Q-44.26-175.59 0-175.59L0-175.59Q44.75-175.59 78.07-155.65Q111.39-135.71 129.63-96.55Q147.87-57.40 147.87 0L147.87 0Q147.87 57.40 129.63 96.55Q111.39 135.71 78.07 155.65Q44.75 175.59 0 175.59ZM0 118.68L0 118.68Q24.81 118.68 42.56 107.49Q60.31 96.31 70.04 75.64Q79.77 54.96 79.77 26.27L79.77 26.27L79.77-26.27Q79.77-55.45 70.04-75.88Q60.31-96.31 42.56-107.49Q24.81-118.68 0-118.68L0-118.68Q-23.83-118.68-41.83-107.49Q-59.83-96.31-69.80-75.88Q-79.77-55.45-79.77-26.27L-79.77-26.27L-79.77 26.27Q-79.77 54.96-69.80 75.64Q-59.83 96.31-41.83 107.49Q-23.83 118.68 0 118.68Z';
const DIAMOND_PATH = 'M 0 -43.029888 L 43.029888 0 L 0 43.029888 L -43.029888 0 Z';

const MARK_HEIGHT = 175.59 * 2;
const CANVAS = 512;

const GREEN = '#147B58';
const ORANGE = '#DB4A2B';
const DARK_SURFACE = '#1A1A2E';

/**
 * @param {object} opts
 * @param {number} opts.fill      Fraction of canvas height the O should occupy.
 * @param {number} opts.diamond   Extra scale applied to the diamond only.
 * @param {string} [opts.bg]      Background fill; omitted = transparent.
 * @param {string} [opts.oColor]
 * @param {string} [opts.dColor]
 */
function buildFavicon({ fill, diamond = 1, bg, oColor = GREEN, dColor = ORANGE }) {
  const scale = ((CANVAS * fill) / MARK_HEIGHT).toFixed(5);
  const half = CANVAS / 2;

  // Full-bleed square: iOS and Android apply their own corner mask, so baking
  // a radius in here produces double-rounded corners with a light fringe.
  const bgRect = bg
    ? `\n  <rect x="${-half}" y="${-half}" width="${CANVAS}" height="${CANVAS}" fill="${bg}"/>`
    : '';

  const diamondTransform = diamond === 1 ? '' : ` transform="scale(${diamond})"`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-half} ${-half} ${CANVAS} ${CANVAS}" width="${CANVAS}" height="${CANVAS}">
  <title>askOdin</title>${bgRect}
  <g transform="scale(${scale})">
    <path d="${O_PATH}" fill="${oColor}"/>
    <path d="${DIAMOND_PATH}"${diamondTransform} fill="${dColor}"/>
  </g>
</svg>
`;
}

const variants = [
  {
    name: 'askOdin-favicon.svg',
    // 80% height fill leaves a ~10% vertical safe area — enough that the mark
    // never kisses the frame in a browser tab or a rounded bookmark chip.
    opts: { fill: 0.80 },
  },
  {
    name: 'askOdin-favicon-small.svg',
    // 16-48px. Fill harder and open the diamond up, otherwise the eye drops
    // below a pixel and the mark reads as a plain ring.
    opts: { fill: 0.92, diamond: 1.2 },
  },
  {
    name: 'askOdin-favicon-whiteBg.svg',
    // App icon / Apple touch icon. Tighter fill because the platform mask
    // eats the corners.
    opts: { fill: 0.72, bg: '#FFFFFF' },
  },
  {
    name: 'askOdin-favicon-darkBg.svg',
    opts: { fill: 0.72, bg: DARK_SURFACE },
  },
];

console.log('=== Generating favicon SVGs (from logomark) ===\n');

for (const { name, opts } of variants) {
  const out = path.join(FAVICON_DIR, name);
  fs.writeFileSync(out, buildFavicon(opts));
  console.log(`  ${name}`);
}

console.log('\nDone. Next: node generate-pngs.mjs && node generate-ico.mjs');
