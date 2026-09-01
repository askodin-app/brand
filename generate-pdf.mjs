import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/usr/bin/google-chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();

  // The HTML is hand-authored source, not a build artifact — nothing generates
  // it. It lived in output/ until a clean rebuild deleted it; source now sits in
  // src/ so output/ can be wiped and regenerated without losing anything.
  const htmlPath = path.resolve(__dirname, 'src', 'askOdin-Brand-Guidelines.html');
  const pdfPath = path.resolve(__dirname, 'output', 'askOdin-Brand-Guidelines.pdf');

  console.log('Loading HTML...');
  await page.goto(`file://${htmlPath}`, {
    waitUntil: 'networkidle0',
    timeout: 30000,
  });

  // Wait for Google Fonts to load
  console.log('Waiting for fonts...');
  await page.evaluateHandle('document.fonts.ready');
  // Extra wait to ensure rendering is complete
  await new Promise(r => setTimeout(r, 2000));

  console.log('Generating PDF...');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
    preferCSSPageSize: false,
  });

  await browser.close();
  console.log(`PDF saved: ${pdfPath}`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
