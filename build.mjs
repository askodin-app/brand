// ─────────────────────────────────────────────────────────────────────────────
// Ordered build for every brand asset.
//
//   node build.mjs            all stages
//   node build.mjs brand      master marks, favicons, app icons, business card
//   node build.mjs social     article, profile and deck assets
//   node build.mjs docs       brand guidelines PDF
//
// Order matters, and it is not alphabetical. Several generators rasterise SVGs
// that an earlier generator writes — running the directory alphabetically
// produces a silently incomplete output/ (66 files short), because the
// rasterisers find nothing to read and skip without erroring. That is exactly
// what happened before this file existed, so the order lives here rather than
// in anyone's memory.
//
// output/ is disposable: `rm -rf output && node build.mjs` reproduces it whole.
// Hand-authored source lives in src/, never in output/.
// ─────────────────────────────────────────────────────────────────────────────

import { execFileSync } from 'node:child_process';

const STAGES = {
  // Masters first — everything downstream reads these SVGs.
  brand: [
    ['generate-wordmark.mjs',         'master wordmark, logomark, combined, OG + profile marks'],
    ['generate-favicon.mjs',          'favicon SVGs'],
    ['generate-pngs.mjs',             'rasterises the wordmark + favicon SVGs above'],
    ['generate-ico.mjs',              'packs .ico from the favicon PNGs above'],
    ['generate-businesscard.mjs',     'business card SVGs'],
    ['generate-card-pngs.mjs',        'rasterises the card SVGs above'],
    ['generate-meishi.mjs',           'bilingual Osaka meishi (EN front / JA back) + QR'],
    ['generate-accelerator-logo.mjs', 'composes 920x400 marks from combined/ + wordmark/'],
  ],
  // Independent of each other; each owns its own output folder.
  social: [
    ['generate-docsend-banner.mjs',           'decks/'],
    ['generate-linkedin-banner.mjs',          'profile/'],
    ['generate-twitter-cover.mjs',            'profile/'],
    ['generate-twitter-cover-centered.mjs',   'profile/'],
    ['generate-virtual-bg.mjs',               'profile/'],
    ['generate-virtual-bg-bright.mjs',        'profile/'],
    ['generate-youtube-cover.mjs',            'profile/'],
    ['generate-podcast.mjs',                  'podcast/ — The Judgment Stack show identity'],
    ['generate-product-hunt.mjs',             'campaigns/20260902-product-hunt/'],
    ['generate-substack-cover.mjs',           'social/20260508-the-judgment-stack/'],
    ['generate-substack-og-fork.mjs',         'social/20260821-ai-data-retention-fork/'],
    ['generate-substack-lastmile.mjs',        'social/20260428-last-mile-judgment-infrastructure/'],
    ['generate-substack-diligence-stack.mjs', 'social/20260828-the-diligence-stack/'],
    ['generate-faking-judgment.mjs',          'social/20260901-faking-judgment-is-easy/'],
    ['generate-faking-judgment-cards.mjs',    'social/20260901-faking-judgment-is-easy/'],
    ['generate-substack-investor-views.mjs',  'social/20260903-what-358672-investor-views-taught-me-about-pitch-decks/'],
    ['generate-crucible-proof.mjs',           'crucible/ — product proof fragments for askodin.app/crucible'],
  ],
  // Reads src/askOdin-Brand-Guidelines.html through headless Chrome.
  docs: [
    ['generate-pdf.mjs', 'brand guidelines PDF'],
  ],
};

const requested = process.argv[2];
const stages = requested ? { [requested]: STAGES[requested] } : STAGES;
if (requested && !STAGES[requested]) {
  console.error(`Unknown stage "${requested}". Expected one of: ${Object.keys(STAGES).join(', ')}`);
  process.exit(1);
}

let ran = 0;
let failed = 0;
for (const [stage, generators] of Object.entries(stages)) {
  console.log(`\n\x1b[1m${stage}\x1b[0m`);
  for (const [script, note] of generators) {
    try {
      execFileSync('node', [script], { stdio: 'pipe' });
      console.log(`  \x1b[32m✓\x1b[0m ${script.padEnd(38)} ${note}`);
      ran++;
    } catch (err) {
      console.error(`  \x1b[31m✗\x1b[0m ${script}`);
      console.error(String(err.stderr || err.stdout || err).trim().split('\n').slice(0, 4).map((l) => `      ${l}`).join('\n'));
      failed++;
    }
  }
}

console.log(`\n${ran} generator(s) ok${failed ? `, \x1b[31m${failed} failed\x1b[0m` : ''}`);
process.exit(failed ? 1 : 0);
