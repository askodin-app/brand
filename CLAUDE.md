# askOdin Brand Quick Reference v2.0

v2.0 from Astra, 2026-11-19, checked against the site canon (`askodin-coming-soon/CLAUDE.md`,
`BRAND-COLOR-USAGE.md`, `scripts/check-*.mjs`). Where the two differ, the site canon wins: its
build checks enforce it. Generators written before v2.0 still hardcode the v1 tokens (`#8899AA`,
`#C62828`, `#F9A825`). Use v2.0 tokens for new work, and don't change dated assets that are
already published.

## Brand Name & Lines
- **Wordmark:** **askOdin**, always camelCase: "ask" in `#DB4A2B`, "Odin" in `#147B58`. Never "AskOdin", "Askodin", "ASKODIN", "Ask Odin", or "ask odin".
- **Category:** AI Judgment Infrastructure™
- **Market slogan:** **AI Judgment Infrastructure™ for private capital.**
- **Core aphorisms:** "Hope is not an asset class." / "Audit the arithmetic before you commit capital."

Do not reuse the retired Visa/Moody's triplet ("Visa verifies transactions. Moody's verifies credit. askOdin verifies judgment.") or any variant as a tagline. Third-party marks are fine inside editorial analogies, never in a slogan position.

**Founder name.** Public site surfaces and bylines: **YekSoon Lok**. "(YS)" goes only in introductions (bio heading, byline card, first mention), never in structured data. The surname-first lockup **LOK Yek Soon (YS) / 陸 奕 順** is for print in markets that expect it (meishi, see `PRINT-MEISHI.md`), formal corporate filings and legal execution documents.

## Colors: Hardened Dark

Color is functional financial data, never decoration.

| Token | Value | Use |
|---|---|---|
| Deep Dark (base canvas) | `#111119` | Primary page background (60%) |
| Dark Surface | `#1A1A2E` | Elevated panels, table containers |
| Dark Card | `#1E293B` | Floating cards, modal bodies |
| askOdin Green (Wood) | `#147B58` | Institutional trust, PRIORITY band, Clarity / allocator CTA (25%) |
| askOdin Orange (Fire) | `#DB4A2B` | Fatal contradictions, kill shot, Crucible CTA, alerts (15%) |
| Surveillance Blue | `#60A5FA` (blue-400) | WATCH band (50–69), PE desk surveillance |
| Audit Amber | `#F59E0B` (amber-500) | HIGH severity finding, unverified broker add-back |
| Hairline Subtle | `rgba(255,255,255,0.04)` | Grid lines, internal row borders |
| Hairline Border | `rgba(255,255,255,0.08)` | Card perimeters, container boundaries |
| Hairline Focus | `rgba(255,255,255,0.16)` | Active inputs, selected states |
| Muted Text | `#94A3B8` | Metadata, micro-labels, `//` section kickers |

Score bands (canonical since 2026-09-30): PASS <50 · WATCH 50–69 · INVESTIGATE 70–84 · PRIORITY 85+.
Red is reserved for forensic alarm states (kill shots, FATAL markers, terminal error lines). Use it on
borders only, never as a primary brand color or a content accent.

```css
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=IBM+Plex+Serif:ital,wght@0,400;0,600;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap');

:root {
  /* Foundation */
  --canvas-base: #111119;
  --surface-elevated: #1A1A2E;
  --surface-card: #1E293B;

  /* Brand accents */
  --askodin-green: #147B58;   /* Wood: institutional trust, Clarity */
  --askodin-orange: #DB4A2B;  /* Fire: fatal alert, Crucible */

  /* Semantic financial indicators */
  --status-fatal: #DB4A2B;    /* Fatal contradiction (score 0) */
  --status-watch: #60A5FA;    /* WATCH band (50–69) */
  --status-high: #F59E0B;     /* HIGH severity finding */
  --status-priority: #147B58; /* PRIORITY band (85+) */

  /* Hairlines & text */
  --hairline-subtle: rgba(255, 255, 255, 0.04);
  --hairline-border: rgba(255, 255, 255, 0.08);
  --hairline-focus: rgba(255, 255, 255, 0.16);
  --text-muted: #94A3B8;

  /* Typography */
  --font-sans: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-serif: 'IBM Plex Serif', Georgia, serif;
  --font-mono: 'IBM Plex Mono', 'Courier New', monospace;
}
```

## Typography: Tri-Plex

| Family | Usage |
|---|---|
| **IBM Plex Sans** | UI, navigation, form labels, body copy, technical headings, logo |
| **IBM Plex Serif** | Boardroom headlines, primary aphorisms, pull quotes, IC memo narrative |
| **IBM Plex Mono** | Financial figures ($44.0M, −31.4%), cell coordinates (`Sheet!Cell`), SHA-256 fingerprints, rule IDs (PE-001), section kickers, patent numbers |

Weights: Light 300 for display 40px+ only · Regular 400 body · Medium 500 labels/nav · SemiBold 600 section headers, logo, CTAs · Bold 700 sparingly.

**Section kickers.** The `//` is the compiler's voice and stays on marketing and platform surfaces. Set it in
mono, 11px, uppercase, tracking-wider, muted slate `#94A3B8` (`text-text-muted`). Do not use
`text-neutral-500` or `text-white/40`: at 11px on `#111119` they measure under 4 : 1, which fails WCAG AA.
Never color a kicker orange or green.

## Product Names: Masterbrand

Products follow the IBM pattern. The formal name is used where a page introduces the product, in schema and in the
press kit. Running copy uses the bare word. Product words are not claimed marks and carry **no ™**.

- **askOdin Clarity**: the institutional diligence platform, with two desks (below).
- **askOdin Crucible**: pre-IC forensic stress test for venture-backed founders.
- **askOdin Verify**: the public verification ledger and badge destination.
- **askOdin Clarity Brief**: the deliverable (Pre-LOI Brief for PE, IC Brief for VC). No ™.
- **Sandbox** (`/sandbox/`): the interactive demo running synthetic and benchmark rooms. It is a page, not a product line.

Claimed marks that do carry ™: AI Judgment Infrastructure™, Clarity Score™, Clarity Framework™, Judgment Graph™,
RUNE / RAVEN / NORN / JUDGE Protocol™, Defensible Audit Log™.

## Clarity Desks

**PE & M&A desk (shipped; `pkg/rune/pe_rules.go`).** Pre-LOI triage. It reads a CIM, the seller's Excel
databook and, optionally, the seller's QoE, then tests each add-back in minutes:

- **PE-001** (HIGH): a "one-time" add-back that recurs in 2+ fiscal years at ≥50% of the claim.
- **PE-002** (MEDIUM): owner pay added back above an analyst-entered replacement salary. Skipped without that input.
- **PE-003** (MEDIUM): pro forma / run-rate savings inside trailing EBITDA.
- **PE-004** (HIGH / FATAL): CIM reported EBITDA vs databook LTM. HIGH above 5%, FATAL above 10%.
- **PE-005** (HIGH / FATAL): CIM adjusted EBITDA vs the seller's QoE, same bands. Runs only when a QoE is uploaded.

Outputs: supported EBITDA, disqualified add-backs ($ and %), supported EV at the seller's implied multiple,
PE score, questions for management, and a leverage scenario built from inputs the analyst types. State it as
a scenario ("at 4.0x on the broker figure, debt is 5.8x supported EBITDA against a 4.5x ceiling"), never as a
detected covenant breach or "Day-1 default". Out of scope: QoE replacement, ledger/trial-balance
reconciliation, data-room connectors.

**Venture & CVC desk (shipped).** Cross-audits the deck against the operating model and cap table: five
scored pillars plus three audit checks (stated revenue vs model formula, gross-margin divergence, runway and
unstated CapEx, dilution).

## Truth-in-Advertising Lexicon

The site enforces these with build checks; copy here must pass them too.

- **No Training Use**: the policy phrase. Client documents never train, tune or calibrate a model. Never "Zero-Training Enterprise Guarantee".
- **Stateless processing**: ephemeral containers, documented 30-day purge. Never "isolated memory enclaves".
- **No connector claims**: deal teams download from VDRs (Datasite, Intralinks) and upload. Never claim VDR integration or scraping.
- **RAVEN mechanics are sealed**: say "smooths over variances" / "narrative smoothing", never "auto-reconciliation bias".
- **No superlatives**: no "the only verification engine" or other unprovable absolutes.
- **Patents**: full line on IP pages/memos: `U.S. Patents Pending: 63/948,559 · 63/994,876 · 64/011,252 · 64/017,488`. Compact line on footers/UI/meishi: "U.S. Patents Pending (4 applications)" / 「米国特許出願中（4件）」. Always "pending".
- **NORN is roadmap**: describe it as designed-to, with "on the roadmap" on the same line. Never present tense. What ships today: IOI and LOI runs on the same company side by side.
- **The 7 archetypes** are YekSoon Lok's research taxonomy for venture deals, not an engine classifier. Never present an archetype count as a product stat.
- **Proof separation**: `/terminal-audits/` covers real public filings only (WeWork, Theranos, FTX, Sonder, Bird). `/research/` covers synthetic benchmarks (Apex Industrial, Halvard Computing), always labelled synthetic.
- **PDFs**: none ship to `public/` without SHA-256 registration and technical / compliance / narrative sign-off in `src/data/pdf-signoffs.json`.

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
| note.com magazine identity (header) | `output/note/` | ❌ |

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
