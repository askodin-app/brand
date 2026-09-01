import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const ORANGE = '#DB4A2B';
const GREEN = '#147B58';
const DARK = '#111119';

// Zoom virtual background — identity furniture, replaced in place rather than published
// once, so it lives at a stable undated path.
const OUTPUT_DIR = './output/profile';
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const W = 1920;
const H = 1080;

function generateBackground() {
  const elements = [];

  // Defs: gradients — brighter center
  elements.push(`<defs>`);
  elements.push(`  <radialGradient id="bgGrad" cx="50%" cy="45%" r="70%">`);
  elements.push(`    <stop offset="0%" stop-color="#252540"/>`);
  elements.push(`    <stop offset="100%" stop-color="#131320"/>`);
  elements.push(`  </radialGradient>`);
  elements.push(`  <radialGradient id="glowGreen" cx="50%" cy="50%" r="50%">`);
  elements.push(`    <stop offset="0%" stop-color="${GREEN}" stop-opacity="0.30"/>`);
  elements.push(`    <stop offset="100%" stop-color="${GREEN}" stop-opacity="0"/>`);
  elements.push(`  </radialGradient>`);
  elements.push(`  <radialGradient id="glowOrange" cx="50%" cy="50%" r="50%">`);
  elements.push(`    <stop offset="0%" stop-color="${ORANGE}" stop-opacity="0.20"/>`);
  elements.push(`    <stop offset="100%" stop-color="${ORANGE}" stop-opacity="0"/>`);
  elements.push(`  </radialGradient>`);
  elements.push(`</defs>`);

  // Background
  elements.push(`<rect width="${W}" height="${H}" fill="url(#bgGrad)"/>`);

  // Top accent bar — solid orange, thicker
  elements.push(`<rect width="${W}" height="5" fill="${ORANGE}"/>`);

  // Bottom accent bar — solid green, thicker
  elements.push(`<rect y="${H - 5}" width="${W}" height="5" fill="${GREEN}"/>`);

  // Ambient glow zones — stronger color washes
  elements.push(`<ellipse cx="${W * 0.25}" cy="${H * 0.4}" rx="600" ry="500" fill="url(#glowGreen)"/>`);
  elements.push(`<ellipse cx="${W * 0.75}" cy="${H * 0.6}" rx="550" ry="450" fill="url(#glowOrange)"/>`);

  // Infrastructure grid — more visible
  for (let x = 120; x < W; x += 120) {
    elements.push(`<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="${GREEN}" stroke-width="1" opacity="0.12"/>`);
  }
  for (let y = 80; y < H; y += 80) {
    elements.push(`<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="${GREEN}" stroke-width="1" opacity="0.12"/>`);
  }

  // Grid intersection dots — brighter
  for (let x = 120; x < W; x += 120) {
    for (let y = 80; y < H; y += 80) {
      const dx = x - W / 2;
      const dy = y - H / 2;
      if (Math.sqrt(dx * dx + dy * dy) < 300) continue;
      elements.push(`<circle cx="${x}" cy="${y}" r="2.5" fill="${GREEN}" opacity="0.22"/>`);
    }
  }

  // Diamond accents — brighter across the board
  const diamonds = [
    // Outer frame — large diamonds
    { x: 120, y: 120, size: 16, color: ORANGE, opacity: 0.5 },
    { x: 1800, y: 120, size: 16, color: ORANGE, opacity: 0.5 },
    { x: 120, y: 960, size: 16, color: ORANGE, opacity: 0.5 },
    { x: 1800, y: 960, size: 16, color: ORANGE, opacity: 0.5 },

    // Secondary frame
    { x: 300, y: 80, size: 12, color: GREEN, opacity: 0.55 },
    { x: 1620, y: 80, size: 12, color: GREEN, opacity: 0.55 },
    { x: 300, y: 1000, size: 12, color: GREEN, opacity: 0.55 },
    { x: 1620, y: 1000, size: 12, color: GREEN, opacity: 0.55 },

    // Mid sides
    { x: 100, y: 540, size: 12, color: GREEN, opacity: 0.45 },
    { x: 1820, y: 540, size: 12, color: GREEN, opacity: 0.45 },

    // Inner ring
    { x: 480, y: 160, size: 10, color: ORANGE, opacity: 0.4 },
    { x: 1440, y: 160, size: 10, color: ORANGE, opacity: 0.4 },
    { x: 480, y: 920, size: 10, color: ORANGE, opacity: 0.4 },
    { x: 1440, y: 920, size: 10, color: ORANGE, opacity: 0.4 },

    { x: 360, y: 300, size: 8, color: GREEN, opacity: 0.35 },
    { x: 1560, y: 300, size: 8, color: GREEN, opacity: 0.35 },
    { x: 360, y: 780, size: 8, color: GREEN, opacity: 0.35 },
    { x: 1560, y: 780, size: 8, color: GREEN, opacity: 0.35 },

    // Small accents near edges
    { x: 200, y: 400, size: 7, color: ORANGE, opacity: 0.35 },
    { x: 1720, y: 400, size: 7, color: ORANGE, opacity: 0.35 },
    { x: 200, y: 680, size: 7, color: ORANGE, opacity: 0.35 },
    { x: 1720, y: 680, size: 7, color: ORANGE, opacity: 0.35 },

    { x: 600, y: 100, size: 7, color: GREEN, opacity: 0.3 },
    { x: 1320, y: 100, size: 7, color: GREEN, opacity: 0.3 },
    { x: 600, y: 980, size: 7, color: GREEN, opacity: 0.3 },
    { x: 1320, y: 980, size: 7, color: GREEN, opacity: 0.3 },
  ];

  for (const d of diamonds) {
    const { x, y, size: s, color, opacity } = d;
    elements.push(`<path d="M ${x} ${y - s} L ${x + s} ${y} L ${x} ${y + s} L ${x - s} ${y} Z" fill="${color}" opacity="${opacity}"/>`);
  }

  // Corner brackets — bold framing
  const bracketSize = 70;
  const bracketOffset = 35;
  const bracketStroke = 3;
  const bracketOpacity = 0.45;

  elements.push(`<path d="M ${bracketOffset} ${bracketOffset + bracketSize} L ${bracketOffset} ${bracketOffset} L ${bracketOffset + bracketSize} ${bracketOffset}" fill="none" stroke="${ORANGE}" stroke-width="${bracketStroke}" opacity="${bracketOpacity}" stroke-linecap="round"/>`);
  elements.push(`<path d="M ${W - bracketOffset - bracketSize} ${bracketOffset} L ${W - bracketOffset} ${bracketOffset} L ${W - bracketOffset} ${bracketOffset + bracketSize}" fill="none" stroke="${ORANGE}" stroke-width="${bracketStroke}" opacity="${bracketOpacity}" stroke-linecap="round"/>`);
  elements.push(`<path d="M ${bracketOffset} ${H - bracketOffset - bracketSize} L ${bracketOffset} ${H - bracketOffset} L ${bracketOffset + bracketSize} ${H - bracketOffset}" fill="none" stroke="${GREEN}" stroke-width="${bracketStroke}" opacity="${bracketOpacity}" stroke-linecap="round"/>`);
  elements.push(`<path d="M ${W - bracketOffset - bracketSize} ${H - bracketOffset} L ${W - bracketOffset} ${H - bracketOffset} L ${W - bracketOffset} ${H - bracketOffset - bracketSize}" fill="none" stroke="${GREEN}" stroke-width="${bracketStroke}" opacity="${bracketOpacity}" stroke-linecap="round"/>`);

  // Concentric circles at center — more visible
  for (let r = 120; r <= 400; r += 70) {
    const op = (0.14 - (r / 400) * 0.08).toFixed(3);
    elements.push(`<circle cx="${W / 2}" cy="${H / 2}" r="${r}" fill="none" stroke="${GREEN}" stroke-width="1.5" opacity="${op}"/>`);
  }

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
  <title>askOdin Virtual Background (Bright)</title>
  ${elements.join('\n  ')}
</svg>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'askOdin-virtual-bg-bright.svg'), svg);
  console.log('Virtual background (bright) SVG generated');

  return svg;
}

async function main() {
  console.log('=== Virtual Background Generator — Bright Variant ===\n');
  generateBackground();

  const svgBuf = fs.readFileSync(path.join(OUTPUT_DIR, 'askOdin-virtual-bg-bright.svg'));

  await sharp(svgBuf, { density: 150 })
    .resize(1920, 1080, { fit: 'fill' })
    .png()
    .toFile(path.join(OUTPUT_DIR, 'askOdin-virtual-bg-bright.png'));
  console.log('Virtual background (bright) PNG generated (1920x1080)');

  await sharp(svgBuf, { density: 150 })
    .resize(1280, 720, { fit: 'fill' })
    .png()
    .toFile(path.join(OUTPUT_DIR, 'askOdin-virtual-bg-bright-720p.png'));
  console.log('Virtual background (bright) PNG 720p generated (1280x720)');
}

main().catch(console.error);
