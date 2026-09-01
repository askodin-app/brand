# askOdin Brand Assets

Every mark, card and banner in this repo is generated from source. Nothing is a
hand-export: `output/` can be deleted and rebuilt whole.

```bash
npm install
npm run build          # everything, in dependency order
npm run rebuild        # wipe output/ first, then build
```

Individual stages: `npm run build:brand`, `build:social`, `build:docs`.

## Layout

```
build.mjs        declares the build order (it is NOT alphabetical — see below)
generate-*.mjs   one generator per asset family
fonts/           IBM Plex statics, vendored
src/             hand-authored source (brand guidelines HTML)
output/          generated — disposable
```

`output/` splits on one rule: **date it when the asset is tied to a moment, leave
it undated when it is tied to an identity.**

```
output/
  social/YYYYMMDD-slug/   article assets — banners/, cards/, svg/
  profile/                X + LinkedIn headers, Zoom backgrounds, avatars
  decks/                  DocSend and data-room banners
  og/                     site-wide default OG mark
  accelerator/            920x400 application marks
  logomark/ wordmark/ combined/ favicon/ business-card/   master marks
  png/                    rasterised versions of the above
```

An article banner is published once and never retro-edited, so a revision is a new
folder and the old one is history. A favicon is the opposite: it is referenced by a
stable path and replaced in place, so dating its folder would rot every link that
points at it.

## Build order

`build.mjs` declares the order because several generators rasterise SVGs that an
earlier generator writes. Running the directory alphabetically produces a silently
incomplete `output/` — the rasterisers find nothing to read and exit cleanly. Add
new generators to a stage in that file rather than relying on filename order.

## Fonts

Generators convert text to vector paths with `opentype.js`, reading the TTFs in
`fonts/`. That is why output is byte-reproducible on any machine: nothing depends
on a system-installed font. The `@ibm/plex` npm package ships only woff/woff2 and
cannot replace these.

See `CLAUDE.md` for colours, type scale and the full asset convention.
