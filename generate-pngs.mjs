import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = './output';
const PNG_DIR = path.join(OUTPUT_DIR, 'png');

// Ensure directories exist
const dirs = [
  'png/wordmark',
  'png/logomark',
  'png/combined',
  'png/og',
  'png/profile',
  'png/favicon',
  'png/app-icons',
];
dirs.forEach(d => fs.mkdirSync(path.join(OUTPUT_DIR, d.replace('png/', 'png/')), { recursive: true }));
// Actually create them properly
fs.mkdirSync(path.join(PNG_DIR, 'wordmark'), { recursive: true });
fs.mkdirSync(path.join(PNG_DIR, 'logomark'), { recursive: true });
fs.mkdirSync(path.join(PNG_DIR, 'combined'), { recursive: true });
fs.mkdirSync(path.join(PNG_DIR, 'og'), { recursive: true });
fs.mkdirSync(path.join(PNG_DIR, 'profile'), { recursive: true });
fs.mkdirSync(path.join(PNG_DIR, 'favicon'), { recursive: true });
fs.mkdirSync(path.join(PNG_DIR, 'app-icons'), { recursive: true });

async function svgToPng(svgPath, pngPath, width, opts = {}) {
  const svgBuffer = fs.readFileSync(svgPath);

  let pipeline = sharp(svgBuffer, { density: 300 })
    .resize(width, null, { fit: 'inside' });

  if (opts.background) {
    pipeline = pipeline.flatten({ background: opts.background });
  }

  await pipeline.png().toFile(pngPath);
  console.log(`  ${path.basename(pngPath)} (${width}px)`);
}

async function svgToPngExact(svgPath, pngPath, width, height, opts = {}) {
  const svgBuffer = fs.readFileSync(svgPath);

  let pipeline = sharp(svgBuffer, { density: 300 })
    .resize(width, height, { fit: 'contain', background: opts.background || { r: 0, g: 0, b: 0, alpha: 0 } });

  if (opts.flatten) {
    pipeline = pipeline.flatten({ background: opts.background });
  }

  await pipeline.png().toFile(pngPath);
  console.log(`  ${path.basename(pngPath)} (${width}x${height})`);
}

async function main() {
  console.log('=== Generating PNG exports ===\n');

  // ============================================================
  // WORDMARK PNGs
  // ============================================================
  console.log('Wordmark PNGs:');

  // Horizontal colored - multiple sizes
  for (const w of [3000, 1500, 800, 400, 200]) {
    await svgToPng(
      path.join(OUTPUT_DIR, 'wordmark', 'askOdin-horizontal-colored.svg'),
      path.join(PNG_DIR, 'wordmark', `askOdin-horizontal-colored-${w}w.png`),
      w
    );
  }

  // Horizontal white
  for (const w of [3000, 1500, 800]) {
    await svgToPng(
      path.join(OUTPUT_DIR, 'wordmark', 'askOdin-horizontal-white.svg'),
      path.join(PNG_DIR, 'wordmark', `askOdin-horizontal-white-${w}w.png`),
      w
    );
  }

  // Horizontal black
  for (const w of [3000, 1500, 800]) {
    await svgToPng(
      path.join(OUTPUT_DIR, 'wordmark', 'askOdin-horizontal-black.svg'),
      path.join(PNG_DIR, 'wordmark', `askOdin-horizontal-black-${w}w.png`),
      w
    );
  }

  // Horizontal on dark background
  for (const w of [3000, 1500, 800]) {
    await svgToPng(
      path.join(OUTPUT_DIR, 'wordmark', 'askOdin-horizontal-on-dark.svg'),
      path.join(PNG_DIR, 'wordmark', `askOdin-horizontal-on-dark-${w}w.png`),
      w
    );
  }

  // Stacked colored
  for (const w of [1500, 800, 400]) {
    await svgToPng(
      path.join(OUTPUT_DIR, 'wordmark', 'askOdin-stacked-colored.svg'),
      path.join(PNG_DIR, 'wordmark', `askOdin-stacked-colored-${w}w.png`),
      w
    );
  }

  // Stacked white
  await svgToPng(
    path.join(OUTPUT_DIR, 'wordmark', 'askOdin-stacked-white.svg'),
    path.join(PNG_DIR, 'wordmark', `askOdin-stacked-white-1500w.png`),
    1500
  );

  // Stacked black
  await svgToPng(
    path.join(OUTPUT_DIR, 'wordmark', 'askOdin-stacked-black.svg'),
    path.join(PNG_DIR, 'wordmark', `askOdin-stacked-black-1500w.png`),
    1500
  );

  // Grayscale
  await svgToPng(
    path.join(OUTPUT_DIR, 'wordmark', 'askOdin-horizontal-grayscale.svg'),
    path.join(PNG_DIR, 'wordmark', `askOdin-horizontal-grayscale-1500w.png`),
    1500
  );

  // Email signature
  await svgToPng(
    path.join(OUTPUT_DIR, 'wordmark', 'askOdin-email-signature.svg'),
    path.join(PNG_DIR, 'wordmark', `askOdin-email-signature.png`),
    400
  );

  // ============================================================
  // LOGOMARK PNGs
  // ============================================================
  console.log('\nLogomark PNGs:');

  for (const size of [1024, 512, 256, 128, 64, 32]) {
    await svgToPngExact(
      path.join(OUTPUT_DIR, 'logomark', 'askOdin-icon-colored.svg'),
      path.join(PNG_DIR, 'logomark', `askOdin-icon-colored-${size}.png`),
      size, size
    );
  }

  for (const size of [512, 256]) {
    await svgToPngExact(
      path.join(OUTPUT_DIR, 'logomark', 'askOdin-icon-white.svg'),
      path.join(PNG_DIR, 'logomark', `askOdin-icon-white-${size}.png`),
      size, size
    );
  }

  for (const size of [512, 256]) {
    await svgToPngExact(
      path.join(OUTPUT_DIR, 'logomark', 'askOdin-icon-black.svg'),
      path.join(PNG_DIR, 'logomark', `askOdin-icon-black-${size}.png`),
      size, size
    );
  }

  // On dark bg
  for (const size of [512, 256]) {
    await svgToPngExact(
      path.join(OUTPUT_DIR, 'logomark', 'askOdin-icon-on-dark.svg'),
      path.join(PNG_DIR, 'logomark', `askOdin-icon-on-dark-${size}.png`),
      size, size
    );
  }

  // ============================================================
  // COMBINED PNGs
  // ============================================================
  console.log('\nCombined PNGs:');

  for (const w of [3000, 1500, 800]) {
    await svgToPng(
      path.join(OUTPUT_DIR, 'combined', 'askOdin-combined-colored.svg'),
      path.join(PNG_DIR, 'combined', `askOdin-combined-colored-${w}w.png`),
      w
    );
  }

  await svgToPng(
    path.join(OUTPUT_DIR, 'combined', 'askOdin-combined-white.svg'),
    path.join(PNG_DIR, 'combined', `askOdin-combined-white-1500w.png`),
    1500
  );

  // ============================================================
  // SOCIAL PNGs
  // ============================================================
  console.log('\nSocial PNGs:');

  // OG Image (1200x630)
  await svgToPngExact(
    path.join(OUTPUT_DIR, 'og', 'askOdin-og-image.svg'),
    path.join(PNG_DIR, 'og', 'askOdin-og-1200x630.png'),
    1200, 630,
    { flatten: true, background: { r: 17, g: 17, b: 25 } }
  );

  // Profile pics
  for (const size of [800, 400, 200]) {
    await svgToPngExact(
      path.join(OUTPUT_DIR, 'profile', 'askOdin-profile-dark.svg'),
      path.join(PNG_DIR, 'profile', `askOdin-profile-dark-${size}.png`),
      size, size,
      { flatten: true, background: { r: 17, g: 17, b: 25 } }
    );
  }

  for (const size of [800, 400, 200]) {
    await svgToPngExact(
      path.join(OUTPUT_DIR, 'profile', 'askOdin-profile-light.svg'),
      path.join(PNG_DIR, 'profile', `askOdin-profile-light-${size}.png`),
      size, size,
      { flatten: true, background: { r: 255, g: 255, b: 255 } }
    );
  }

  // ============================================================
  // FAVICON PNGs
  // ============================================================
  console.log('\nFavicon PNGs:');

  // At and below 48px the standard mark's diamond falls under ~1px, so those
  // sizes render from the small variant (tighter fill, larger eye).
  for (const size of [512, 192, 180, 128, 64, 48, 32, 16]) {
    const src = size <= 48 ? 'askOdin-favicon-small.svg' : 'askOdin-favicon.svg';
    await svgToPngExact(
      path.join(OUTPUT_DIR, 'favicon', src),
      path.join(PNG_DIR, 'favicon', `askOdin-favicon-${size}.png`),
      size, size
    );
  }

  // White background (Apple Touch Icon)
  await svgToPngExact(
    path.join(OUTPUT_DIR, 'favicon', 'askOdin-favicon-whiteBg.svg'),
    path.join(PNG_DIR, 'favicon', 'apple-touch-icon-180.png'),
    180, 180,
    { flatten: true, background: { r: 255, g: 255, b: 255 } }
  );

  // Dark background
  await svgToPngExact(
    path.join(OUTPUT_DIR, 'favicon', 'askOdin-favicon-darkBg.svg'),
    path.join(PNG_DIR, 'favicon', 'askOdin-favicon-dark-512.png'),
    512, 512,
    { flatten: true, background: { r: 26, g: 26, b: 46 } }
  );

  // ============================================================
  // APP ICONS (Android / iOS standard sizes)
  // ============================================================
  console.log('\nApp Icons:');

  const appIconSizes = [
    { size: 1024, name: 'app-icon-1024' },   // iOS App Store
    { size: 512, name: 'app-icon-512' },      // Google Play Store
    { size: 192, name: 'app-icon-192' },      // Android
    { size: 180, name: 'app-icon-180' },      // iPhone @3x
    { size: 167, name: 'app-icon-167' },      // iPad Pro
    { size: 152, name: 'app-icon-152' },      // iPad
    { size: 120, name: 'app-icon-120' },      // iPhone @2x
    { size: 76, name: 'app-icon-76' },        // iPad @1x
  ];

  for (const { size, name } of appIconSizes) {
    await svgToPngExact(
      path.join(OUTPUT_DIR, 'favicon', 'askOdin-favicon-whiteBg.svg'),
      path.join(PNG_DIR, 'app-icons', `${name}.png`),
      size, size,
      { flatten: true, background: { r: 255, g: 255, b: 255 } }
    );
  }

  console.log('\n=== All PNGs generated ===');

  // Summary
  const pngFiles = [];
  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        walkDir(fullPath);
      } else if (file.endsWith('.png')) {
        pngFiles.push(fullPath);
      }
    }
  }
  walkDir(PNG_DIR);
  console.log(`\nTotal PNG files: ${pngFiles.length}`);
}

main().catch(console.error);
