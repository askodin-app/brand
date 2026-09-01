import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// ICO file format: https://en.wikipedia.org/wiki/ICO_(file_format)
// Contains multiple PNG images packed into one .ico file

async function createIco(pngPaths, outputPath) {
  const images = [];

  for (const pngPath of pngPaths) {
    const buf = fs.readFileSync(pngPath);
    const metadata = await sharp(buf).metadata();
    images.push({
      width: metadata.width,
      height: metadata.height,
      data: buf,
    });
  }

  // ICO header: 6 bytes
  // ICONDIR entries: 16 bytes each
  // Then image data

  const headerSize = 6;
  const entrySize = 16;
  const dirSize = headerSize + entrySize * images.length;

  let offset = dirSize;
  const entries = [];

  for (const img of images) {
    entries.push({
      width: img.width >= 256 ? 0 : img.width,
      height: img.height >= 256 ? 0 : img.height,
      dataSize: img.data.length,
      offset: offset,
    });
    offset += img.data.length;
  }

  const totalSize = offset;
  const buffer = Buffer.alloc(totalSize);

  // ICONDIR header
  buffer.writeUInt16LE(0, 0);        // Reserved
  buffer.writeUInt16LE(1, 2);        // Type: 1 = ICO
  buffer.writeUInt16LE(images.length, 4); // Count

  // ICONDIRENTRY for each image
  for (let i = 0; i < entries.length; i++) {
    const pos = headerSize + i * entrySize;
    buffer.writeUInt8(entries[i].width, pos);       // Width
    buffer.writeUInt8(entries[i].height, pos + 1);  // Height
    buffer.writeUInt8(0, pos + 2);                  // Color palette
    buffer.writeUInt8(0, pos + 3);                  // Reserved
    buffer.writeUInt16LE(1, pos + 4);               // Color planes
    buffer.writeUInt16LE(32, pos + 6);              // Bits per pixel
    buffer.writeUInt32LE(entries[i].dataSize, pos + 8);  // Size
    buffer.writeUInt32LE(entries[i].offset, pos + 12);   // Offset
  }

  // Image data
  for (let i = 0; i < images.length; i++) {
    images[i].data.copy(buffer, entries[i].offset);
  }

  fs.writeFileSync(outputPath, buffer);
  console.log(`ICO: ${outputPath} (${images.length} sizes, ${(totalSize / 1024).toFixed(1)}KB)`);
}

async function main() {
  const pngDir = './output/png/favicon';
  const outputDir = './output/favicon';

  // Standard favicon.ico with 16, 32, 48px
  await createIco(
    [
      path.join(pngDir, 'askOdin-favicon-16.png'),
      path.join(pngDir, 'askOdin-favicon-32.png'),
      path.join(pngDir, 'askOdin-favicon-48.png'),
    ],
    path.join(outputDir, 'favicon.ico')
  );

  // Extended favicon with more sizes
  await createIco(
    [
      path.join(pngDir, 'askOdin-favicon-16.png'),
      path.join(pngDir, 'askOdin-favicon-32.png'),
      path.join(pngDir, 'askOdin-favicon-48.png'),
      path.join(pngDir, 'askOdin-favicon-64.png'),
      path.join(pngDir, 'askOdin-favicon-128.png'),
    ],
    path.join(outputDir, 'favicon-extended.ico')
  );

  console.log('Done!');
}

main().catch(console.error);
