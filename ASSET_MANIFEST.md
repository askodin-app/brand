# askOdin Asset Manifest

The internal index of everything `output/` holds that the **Brand Guidelines do not**.

Brand Guidelines §8 indexes core identity furniture only — the marks that are replaced
in place and referenced by stable paths. This file catalogues the other shelf: assets
tied to a moment rather than to an identity, plus the surface-level furniture that is
too operational for a brand document.

The split is Guidelines §8.3. One question decides it:

| Tied to… | Folder | Dated | Indexed in |
|---|---|---|---|
| An **identity** — replaced in place, stable path | `output/[family]/` | ❌ | Brand Guidelines §8.1 |
| A **moment** — published once, never retro-edited | `output/[surface]/YYYYMMDD-[slug]/` | ✅ | this file |

Dated folders take the **publication** date (`pubDate` in an article's frontmatter,
`datePublished` in a paper's ScholarlyArticle schema) — never the generator's file
mtime — and the **URL slug**, not the prose headline.

Every row below is produced by a generator at the repo root. `output/` is disposable:
`npm run rebuild` wipes and reproduces it whole. Nothing here is hand-authored.

---

## Dated — article and essay assets

`output/social/YYYYMMDD-slug/`

| Published | Folder | Files | Generator |
|---|---|---|---|
| 2026-04-28 | `20260428-last-mile-judgment-infrastructure/` | 6 | `generate-substack-lastmile.mjs` |
| 2026-05-08 | `20260508-the-judgment-stack/` | 3 | `generate-substack-cover.mjs` |
| 2026-08-21 | `20260821-ai-data-retention-fork/` | 3 | `generate-substack-og-fork.mjs` |
| 2026-08-28 | `20260828-the-diligence-stack/` | 9 | `generate-substack-diligence-stack.mjs` |
| 2026-09-01 | `20260901-faking-judgment-is-easy/` | 45 | `generate-faking-judgment.mjs`, `generate-faking-judgment-cards.mjs` |
| 2026-09-03 | `20260903-what-358672-investor-views-taught-me-about-pitch-decks/` | 9 | `generate-substack-investor-views.mjs` |

Inside a dated folder: `banners/` (headline and OG cards — the article's identity),
`cards/` (data, stat and pull-quote cards), `svg/` (sources for both). Empty
subfolders are skipped.

## Dated — campaigns

`output/campaigns/YYYYMMDD-name/`

| Launched | Folder | Files | Generator |
|---|---|---|---|
| 2026-09-02 | `20260902-product-hunt/` | 21 | `generate-product-hunt.mjs` |

## Dated — podcast episodes

`output/podcast/episodes/YYYYMMDD-slug/` — none published yet.

The podcast owns its whole namespace. Episode art does not go in `output/social/`,
even though it is dated like an article: *The Judgment Stack* podcast and the Substack
essay series share a name but publish on independent schedules, and filing an episode
beside an essay makes two unrelated cadences look like one.

---

## Undated — operational surfaces

Stable paths, but operational rather than brand furniture, so they sit here rather
than in Guidelines §8.1.

| Surface | Folder | Files | Generator |
|---|---|---|---|
| DocSend / data-room banners | `output/decks/` | 9 | `generate-docsend-banner.mjs` |
| Crucible product proof | `output/crucible/` | 6 | `generate-crucible-proof.mjs` |
| Podcast show identity | `output/podcast/` | 9 | `generate-podcast.mjs` |
| Profile furniture (X, YouTube, Zoom) | `output/profile/` | 19 | `generate-twitter-cover.mjs`, `generate-twitter-cover-centered.mjs`, `generate-youtube-cover.mjs`, `generate-virtual-bg.mjs`, `generate-virtual-bg-bright.mjs`, `generate-linkedin-banner.mjs` |

The LinkedIn banner and social profile marks in `output/profile/` are the exception
that is indexed in **both** places: they are core identity furniture (Guidelines §8.1)
that happens to share a folder with operational covers.

---

## Rules that apply to everything here

- **One generator per folder.** `generate-<slug>.mjs` at the repo root; the script ↔
  folder pairing is how an asset is traced back to its source.
- **Build order is declared, not alphabetical.** `build.mjs` owns it. Several
  generators rasterise SVGs an earlier one writes.
- **Figures carry their denominator.** A card travels without its article attached, so
  any number on one states its sample size, engine version or date window in the
  footer. Figures are hardcoded in the generator — if the article restates a number,
  the generator changes in the same commit.
- **Naming.** `askOdin-<slug>-<variant>.png`, `-2x` for retina. Crop suffixes: `og`
  (1200×630), `x-mobile` (1080×1350), `square` (1200×1200), `hero` (1600×900).
