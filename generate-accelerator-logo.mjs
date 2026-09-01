import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// 920x400 logo for accelerator application submission.
// Centers the horizontal combined logo (logomark + wordmark) with clean padding.

const OUT_DIR = './output/accelerator';
const W = 920;
const H = 400;

// Combined logo native aspect ratio is ~4.27:1. Fit it inside a padded box.
const PAD_X = 90;              // horizontal padding
const MAX_INNER_W = W - PAD_X * 2;   // 740
const MAX_INNER_H = 200;             // keep comfortable vertical breathing room

async function renderLogo(svgPath, innerW, innerH) {
  const svgBuffer = fs.readFileSync(svgPath);
  return sharp(svgBuffer, { density: 600 })
    .resize(innerW, innerH, { fit: 'inside' })
    .png()
    .toBuffer();
}

async function compose(svgPath, bg, outPath) {
  // Render logo, then measure so we can center precisely.
  const logo = await renderLogo(svgPath, MAX_INNER_W, MAX_INNER_H);
  const meta = await sharp(logo).metadata();
  const left = Math.round((W - meta.width) / 2);
  const top = Math.round((H - meta.height) / 2);

  const base = bg
    ? { create: { width: W, height: H, channels: 4, background: bg } }
    : { create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } };

  await sharp(base)
    .composite([{ input: logo, left, top }])
    .png()
    .toFile(outPath);
  console.log(`  ${path.basename(outPath)}  (logo ${meta.width}x${meta.height})`);
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log('Generating 920x400 accelerator logos:\n');

  const colored = './output/combined/askOdin-combined-colored.svg';
  const white = './output/combined/askOdin-combined-white.svg';

  // Transparent background (colored logo)
  await compose(colored, null, path.join(OUT_DIR, 'askOdin-logo-920x400-transparent.png'));
  // White background (colored logo)
  await compose(colored, { r: 255, g: 255, b: 255, alpha: 1 }, path.join(OUT_DIR, 'askOdin-logo-920x400-white.png'));
  // Deep Dark background (white logo) — brand #111119
  await compose(white, { r: 0x11, g: 0x11, b: 0x19, alpha: 1 }, path.join(OUT_DIR, 'askOdin-logo-920x400-dark.png'));

  // Wordmark only, no logomark — some application forms ask for a text-only
  // mark. This shipped as a hand-export with no generator behind it until a
  // clean rebuild of output/ turned up the orphan.
  const wordmark = './output/wordmark/askOdin-horizontal-colored.svg';
  await compose(wordmark, null, path.join(OUT_DIR, 'askOdin-wordmark-920x400-transparent.png'));

  console.log('\nDone!');
}

main().catch(console.error);
