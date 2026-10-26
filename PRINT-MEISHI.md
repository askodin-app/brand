# Meishi print handoff

What to send a Japanese printer, and the three pre-press steps this repo cannot do.

Regenerate everything with `node generate-meishi.mjs`.

## Who has a card

One set per person, from one generator and one baseline grid — the cards are
designed to be handed across the same table.

| Person | Title | File prefix |
|---|---|---|
| LOK Yek Soon | Founder & CEO | `card_` |
| Dhiraj Wohra (DK) | Founding CRO | `card_dk_` |

The CEO's card is the unprefixed original; renaming it would rot links already
sent to printers. Add a person by appending to `PEOPLE` in `generate-meishi.mjs`.

**DK's card carries no phone number**, at his request. The contact block is
bottom-aligned, so it simply starts one line lower.

## Files

Both sets below; `<p>` is the person's prefix from the table above.

| File | Size | Send to printer? |
|---|---|---|
| `output/business-card/<p>meishi-print.pdf` | 97 × 61mm, 2pp | **Yes** — after CMYK conversion below |
| `output/business-card/<p>front_en.svg` | 97 × 61mm | Only if they ask for vector source |
| `output/business-card/<p>back_ja.svg` | 97 × 61mm | Only if they ask for vector source |
| `<p>meishi-review.pdf` | 91 × 55mm, 2pp | No — trim size, no bleed. Internal review only |
| `<p>*-proof.png` | 91 × 55mm, 600dpi | No — raster proofs |

Page 1 is the English front, page 2 the Japanese back. Split into 表/裏 files if
the printer wants them separately.

## Geometry

- **Trim** 91 × 55mm — meishi 4-gou (名刺4号)
- **Bleed** 3mm all round → **97 × 61mm** canvas, the Raksul / Graphic standard.
  Their automated pre-flight rejects less. A 2mm US/SG house: set `TRIM = 2.0`
  in `generate-meishi.mjs` and re-run; the composition does not move.
- **Safe area** 85 × 49mm. Verified from rendered pixels on both cards — all ink
  sits inside it, other than the accent bar, which bleeds off the top by design.
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
**0.345mm each** on both cards, encoding that person's LinkedIn profile:

| Card | Payload |
|---|---|
| `card_` | `https://www.linkedin.com/in/yeksoon` |
| `card_dk_` | `https://www.linkedin.com/in/dhirajwohra` |

LinkedIn's own QR appends a `?fromQR=1` tracking parameter. It is stripped: the
shorter payload drops the code from 33 × 33 to 29 × 29, a 14% larger module and
the difference between a marginal and a comfortable scan in a dim meeting room.

Both verified to decode from the finished card down to 100dpi. Do not let anyone
rescale, recolour or "clean up" the QR — regenerate it from the generator instead.

## Open items

- **Japanese copy has not had a native read.** Typography is verified — bracket
  hanging, tracking, weights, no font substitution possible — but not whether the
  wording lands with an Osaka partner. DK's 共同創業者 兼 最高収益責任者（CRO）is
  new and unreviewed.
- **DK's English and Japanese titles do not match.** The front reads *Founding
  CRO*; the back reads 共同創業者 兼 最高収益責任者 — "Co-Founder & CRO". Both are
  as specified, but a co-founder claim in Japanese is a stronger statement than
  the English makes. Confirm before printing.
- **Back face restructure on hold**: an OCR-friendly name-block reorder
  (Furigana → Kanji → Title) for Sansan/Eight, a Sony BSS affiliation line, and a
  `/jp` URL were proposed. The affiliation claim needs verifying and the URL needs
  to exist before either is printed.
