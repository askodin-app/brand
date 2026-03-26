# askOdin Brand Assets

Generator scripts for askOdin brand assets — logos, icons, social media banners, business cards, and more.

## Setup

```bash
npm install
```

## Generators

| Script | Output |
|--------|--------|
| `node generate-pngs.mjs` | Logo PNGs (multiple sizes) |
| `node generate-wordmark.mjs` | Wordmark SVG/PNG |
| `node generate-ico.mjs` | Favicon `.ico` |
| `node generate-linkedin-banner.mjs` | LinkedIn cover (1584x396) |
| `node generate-twitter-cover.mjs` | Twitter/X cover (1500x500) |
| `node generate-virtual-bg.mjs` | Virtual background (dark) |
| `node generate-virtual-bg-bright.mjs` | Virtual background (bright) |
| `node generate-businesscard.mjs` | Business card SVG |
| `node generate-card-pngs.mjs` | Business card PNGs |
| `node generate-pdf.mjs` | Brand guidelines PDF |

## Output

Generated assets are written to `output/` organized by type:

- `output/social/` — LinkedIn banner, Twitter/X cover
- `output/png/` — Logo rasters
- `output/wordmark/` — Wordmark variants
- `output/favicon/` — Favicons
- `output/business-card/` — Business cards
- `output/logomark/` — Logomark variants

## Brand

- **Name**: askOdin (always camelCase)
- **Fonts**: IBM Plex Sans, Serif, Mono
- **Colors**: Orange `#DB4A2B`, Green `#147B58`, Deep Dark `#111119`
- **U.S. Patents Pending**: 63/948,559, 63/994,876, 64/011,252, 64/017,488

See `CLAUDE.md` for full brand guidelines.
