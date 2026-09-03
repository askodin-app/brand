# askOdin Brand Quick Reference v1.0

## Brand Name
**askOdin** — always camelCase. Never "AskOdin", "Askodin", "ASKODIN", "Ask Odin", or "ask odin".

## Colors (Hex)

| Color | Hex | Role |
|-------|-----|------|
| askOdin Orange | `#DB4A2B` | Accent — CTAs, warnings, emphasis (15%) |
| askOdin Green | `#147B58` | Institutional weight, trust (25%) |
| Deep Dark | `#111119` | Page backgrounds, decks (60%) |
| Dark Surface | `#1A1A2E` | Cards, panels on dark bg |
| Dark Card | `#1E293B` | Elevated cards, tables |
| Border | `#E2E8F0` | Borders and dividers |
| Muted Text | `#8899AA` | Secondary text |
| Kill Shot | `#C62828` | Fatal severity |
| Watch | `#F9A825` | Medium severity |

## Typography

| Family | Usage |
|--------|-------|
| **IBM Plex Sans** | Headlines, body text, UI, logo |
| **IBM Plex Mono** | Code, data labels, scores, metadata, patent numbers |
| **IBM Plex Serif** | Clarity Briefs, investment memos, quotes, editorial |

### Key Weights
- Light (300): Display headlines 40px+ only
- Regular (400): Body text
- Medium (500): Subheadings, navigation, labels
- SemiBold (600): Section headers, emphasis, logo, CTAs
- Bold (700): Sparingly — key stats, Kill Shot labels

## Quick Copy-Paste

```css
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=IBM+Plex+Serif:ital,wght@0,400;0,600;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap');

:root {
  /* Primary */
  --askodin-orange: #DB4A2B;
  --askodin-green: #147B58;

  /* Foundation */
  --deep-dark: #111119;
  --dark-surface: #1A1A2E;
  --dark-card: #1E293B;

  /* UI */
  --white: #FFFFFF;
  --background-light: #F7F8FA;
  --border: #E2E8F0;
  --muted-text: #8899AA;

  /* Semantic */
  --kill-shot: #C62828;
  --watch: #F9A825;

  /* Typography */
  --font-sans: 'IBM Plex Sans', Arial, Helvetica, sans-serif;
  --font-serif: 'IBM Plex Serif', Georgia, serif;
  --font-mono: 'IBM Plex Mono', 'Courier New', monospace;
}
```

## Positioning One-Liner
Visa verifies transactions. Moody's verifies credit. **askOdin verifies judgment.**

## Messaging Snippets
- "Judgment infrastructure for capital allocation"
- "RUNE compiles narrative into judgment"
- "40+ forensic dimensions, 5 failure modes"
- "Score: 0. Do Not Proceed."
- "The Last Mile of AI Isn't Information. It's Judgment."

## Voice Cheat Sheet
Direct, Technical, Institutional, Precise — never hedging, jargon-heavy, corporate-bland, or vague.

---

## Asset Output Convention

**Create the destination folder before generating.** Never emit loose files into a
shared directory — every run belongs to a named batch.

Point the generator's `ASSET_DIR` at that folder and let it write there. The script,
not a later `mv`, is the source of truth: re-running must reproduce the folder exactly.

**`output/` is disposable.** `npm run rebuild` wipes it and regenerates everything.
Anything hand-authored — the brand guidelines HTML, say — lives in `src/`, because
whatever sits in `output/` will eventually be deleted by a clean build.

**Build order is declared, not alphabetical.** `build.mjs` owns it. Several
generators rasterise SVGs an earlier generator writes, so running the directory
in filename order silently produces an incomplete `output/` — the rasterisers find
nothing to read and skip without erroring. Add new generators to a stage there.

### Date it, or don't

The one rule that decides the folder name:

- **Tied to a moment** (published once, never retro-edited) → **date it**. Last
  month's post image is history; a new version is a new folder.
- **Tied to an identity** (replaced in place, referenced by a stable path) → **no
  date**. A dated favicon folder means every consumer's link rots on each revision.

### Layout

| Scenario | Folder | Dated |
|---|---|---|
| Article / essay assets | `output/social/YYYYMMDD-slug/` | ✅ |
| Research paper / SSRN covers | `output/social/YYYYMMDD-slug/` | ✅ |
| Campaign or launch push | `output/campaigns/YYYYMMDD-name/` | ✅ |
| Event, conference, demo day | `output/events/YYYYMMDD-name/` | ✅ |
| DocSend / data-room banners | `output/decks/` | ❌ |
| Logo, wordmark, favicon, app icons | `output/{logomark,wordmark,combined,favicon,png}/` | ❌ |
| Profile furniture (X/LinkedIn header, Zoom bg, avatars) | `output/profile/` | ❌ |
| Podcast show identity (cover, avatars, channel art) | `output/podcast/` | ❌ |
| Podcast episode art | `output/podcast/episodes/YYYYMMDD-slug/` | ✅ |
| Product proof fragments for a marketing page | `output/crucible/` | ❌ |
| Site-wide default OG mark | `output/og/` | ❌ |
| Accelerator / application marks | `output/accelerator/` | ❌ |

**The podcast owns its whole namespace.** Episode art does not go in `output/social/`,
even though it is dated like an article. The show and the Substack essay series share the
name *The Judgment Stack* but publish on independent schedules, and filing an episode
beside an essay makes two unrelated release cadences look like one. Episodes are dated by
the publication date and named with the episode slug, inside `output/podcast/episodes/`.

Dated folders use the publication date — `pubDate` in an article's frontmatter, or
`datePublished` in the ScholarlyArticle schema for a paper — not the date the images
were generated. A generator's file mtime is not a substitute: the Last Mile covers
were filed four months off that way before the schema was checked. Name the folder
with the **URL slug** rather than the prose title:
`20260901-faking-judgment-is-easy` resolves against
`/insights/faking-judgment-is-easy/` in both directions. Prose titles need shell
quoting and drift when an editor rewrites the headline.

### Inside a dated folder

```
20260901-faking-judgment-is-easy/
  banners/   headline + OG cards — the article's identity
  cards/     data, stat and pull-quote cards
  svg/       source SVGs for both
```

Deliverable PNGs stay in `banners/` and `cards/` so they can be grabbed without
hunting. Skip a subfolder that would be empty.

### Naming

- Generator script: `generate-<slug>.mjs` at repo root, one per folder — the
  script ↔ folder pairing is how an asset gets traced back to its source.
- Files: `askOdin-<slug>-<variant>.png`, plus `-2x` for retina.
- Crop suffixes: `og` (1200×630), `x-mobile` (1080×1350), `square` (1200×1200),
  `hero` (1600×900).

### Figures on data cards

A card travels without its article attached, so any number on one must carry its
denominator (sample size, engine version, date window) in the footer. Figures are
hardcoded in the generator — if the article restates a number, update the generator
in the same change.
