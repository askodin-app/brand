import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const CARD_DIR = './output/business-card';

async function svgToPng(svgPath, pngPath, width) {
  const svgBuffer = fs.readFileSync(svgPath);
  await sharp(svgBuffer, { density: 600 })
    .resize(width, null, { fit: 'inside' })
    .png()
    .toFile(pngPath);
  console.log(`  ${path.basename(pngPath)}`);
}

async function main() {
  console.log('Generating business card PNGs (print-quality):\n');

  const cards = [
    'askOdin-card-front-dark',
    'askOdin-card-front-light',
    'askOdin-card-back-dark',
    'askOdin-card-back-light',
  ];

  for (const card of cards) {
    // High-res for print (300 DPI at 3.5" = 1050px, but we'll do 2100 for 600DPI)
    await svgToPng(
      path.join(CARD_DIR, `${card}.svg`),
      path.join(CARD_DIR, `${card}-print.png`),
      2100
    );
    // Preview size
    await svgToPng(
      path.join(CARD_DIR, `${card}.svg`),
      path.join(CARD_DIR, `${card}-preview.png`),
      800
    );
  }

  console.log('\nDone!');
}

main().catch(console.error);
