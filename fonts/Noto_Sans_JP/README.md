# Noto Sans JP — vendored subset

Japanese face for the meishi (`generate-meishi.mjs`). Latin stays IBM Plex Sans;
Noto sets kana, kanji, CJK punctuation and fullwidth forms.

**Provenance.** Instantiated from the upstream Google Fonts variable font
`NotoSansJP[wght].ttf` (googlefonts/noto-cjk), SIL Open Font License 1.1.

**Why these files and not the upstream ones.** opentype.js — which outlines every
glyph on the card to a `<path>` — cannot read variable fonts or `.ttc` collections,
and three full static weights would put ~17 MB of binary in the repo. Each weight
here is instantiated at a fixed `wght` and subset to 455 characters: ASCII, all
hiragana and katakana, fullwidth forms, CJK punctuation, and the kanji used in
askOdin Japanese collateral.

| File | Weight |
|---|---|
| `NotoSansJP-Regular.ttf` | 400 |
| `NotoSansJP-Medium.ttf` | 500 |
| `NotoSansJP-Bold.ttf` | 700 |

**Adding new Japanese copy.** If it introduces a kanji outside the current set, the
glyph will be missing. Add the character to `KANJI` in `tools/prepare-noto-sans-jp.py`
and re-run it (needs `fontTools` and network); commit the regenerated files. The
build itself needs neither the script nor the network.
