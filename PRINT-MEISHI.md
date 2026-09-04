# Meishi print handoff

What to send a Japanese printer, and the three pre-press steps this repo cannot do.

Regenerate everything with `node generate-meishi.mjs`.

## Files

| File | Size | Send to printer? |
|---|---|---|
| `output/business-card/card_meishi-print.pdf` | 97 × 61mm, 2pp | **Yes** — after CMYK conversion below |
| `output/business-card/card_front_en.svg` | 97 × 61mm | Only if they ask for vector source |
| `output/business-card/card_back_ja.svg` | 97 × 61mm | Only if they ask for vector source |
| `card_meishi-review.pdf` | 91 × 55mm, 2pp | No — trim size, no bleed. Internal review only |
| `card_*-proof.png` | 91 × 55mm, 600dpi | No — raster proofs |

Page 1 is the English front, page 2 the Japanese back. Split into 表/裏 files if
the printer wants them separately.

## Geometry

- **Trim** 91 × 55mm — meishi 4-gou (名刺4号)
- **Bleed** 3mm all round → **97 × 61mm** canvas, the Raksul / Graphic standard.
  Their automated pre-flight rejects less. A 2mm US/SG house: set `TRIM = 2.0`
  in `generate-meishi.mjs` and re-run; the composition does not move.
- **Safe area** 85 × 49mm. Verified from rendered pixels — all ink sits inside it.
- **Tombo (トンボ)** not included. Raksul and Graphic's automated upload wants an
  exact-size document with no crop marks; a trade printer usually wants them.
  Ask, then add if needed — they are a small change to the generator.

## Three things that must happen downstream

The PDF is **RGB** and is **not PDF/X-1a**. There is no ICC or CMYK tooling in
this repo — no Ghostscript, no Illustrator — so these are for the printer or an
Illustrator step, and must be stated explicitly in the order notes.

**1. CMYK conversion, Japan Color 2001 Coated** (Uncoated on textured stock).
Do not let a default profile guess. The brand builds:

| Colour | RGB | CMYK |
|---|---|---|
| askOdin Orange | `#DB4A2B` | C0 / M66 / Y80 / K14 |
| askOdin Green | `#147B58` | C84 / M0 / Y28 / K52 |

Orange is the hue that shifts worst in conversion — check it on the proof.

**2. Rich black for the front background** (`#111119`).
Not K100, which prints washed-out grey on coated stock. Not a 4-colour
Photoshop black, which over-inks. Specify **C40 / M30 / Y30 / K100**, or
**C30 / K100** on a digital short-run press.

**3. Export as PDF/X-1a or PDF/X-4** with fonts outlined (曲線化). Text is
already outlined in the source — the PDFs carry **zero embedded fonts and zero
raster images** — so nothing can substitute a font, but the X-standard export
still has to happen.

## Stock

220kg (approx. 300–350 gsm), matte. **ヴァンヌーボ (Vent Nouveau)** or
**アラベール (Arabel)** take rich black with no glare and carry weight in the hand.

Matte also matters for the QR: gloss throws glare and costs scans in the dim
meeting rooms the code was sized for.

## The QR

Front, bottom-right. 13 × 13mm container, 1.5mm quiet zone, 29 × 29 modules at
**0.345mm each**, encoding `https://www.linkedin.com/in/yeksoon`.

Verified to decode from the finished card down to 100dpi. Do not let anyone
rescale, recolour or "clean up" the QR — regenerate it from the generator instead.

## Open items

- **Japanese copy has not had a native read.** Typography is verified — bracket
  hanging, tracking, weights, no font substitution possible — but not whether the
  wording lands with an Osaka partner.
- **Back face restructure on hold**: an OCR-friendly name-block reorder
  (Furigana → Kanji → Title) for Sansan/Eight, a Sony BSS affiliation line, and a
  `/jp` URL were proposed. The affiliation claim needs verifying and the URL needs
  to exist before either is printed.
