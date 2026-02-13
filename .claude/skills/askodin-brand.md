---
name: askodin-brand
description: "askOdin brand guidelines and design system for consistent visual identity across all materials. Use this skill when creating presentations, documents, websites, or any branded content for askOdin."
license: Proprietary. Copyright askOdin Pte Ltd
version: "1.0"
updated: "2026-02"
---

# askOdin Brand Guidelines v1.0

## Brand Overview

askOdin is **judgment infrastructure for capital allocation**. We operate at the judgment layer — where $3.1 trillion in private market capital flows through decisions that were never compiled, standardized, or made auditable. Until now.

**Mission**: Make investment judgment auditable, traceable, and institutional-grade — the way exchanges compiled trading and rating agencies compiled credit.

**Positioning**: Visa verifies transactions. Moody's verifies credit. **askOdin verifies judgment.**

### Brand Attributes

| Attribute | Description |
|-----------|-------------|
| **Forensic** | Every claim tested. Every assumption surfaced. Precision over polish. |
| **Institutional** | Built for funds, regulators, and LPs. Enterprise-grade. Audit-ready. |
| **Definitive** | Kill Shot. Do Not Proceed. Clarity Score 0/100. We don't hedge — we judge. |

### Brand Voice

| We Are | We Are Not | Example |
|--------|------------|---------|
| Direct | Hedging | "Score: 0. Do Not Proceed." not "This may have some concerns." |
| Technical | Jargon-heavy | "RUNE compiles narrative into judgment" not "Our AI leverages synergies." |
| Institutional | Corporate-bland | "Judgment Infrastructure" not "AI-powered analytics platform." |
| Precise | Vague | "40+ forensic dimensions, 5 failure modes" not "comprehensive analysis." |

---

## Logo System

### Wordmark Rules

The wordmark is set in **IBM Plex Sans SemiBold (600)**. The camelCase split is intentional and must never be altered.

**CRITICAL**: The only correct rendering is **askOdin**. Never write it as "AskOdin", "Askodin", "ASKODIN", "Ask Odin", or "ask odin".

| Element | Specification |
|---------|--------------|
| Typeface | IBM Plex Sans |
| Weight | SemiBold (600) |
| Case | camelCase — askOdin |
| "ask" color | #DB4A2B (askOdin Orange) |
| "Odin" color | #147B58 (askOdin Green) |
| Letter-spacing | Default (0). No tracking adjustments. |
| SVG format | All logo SVGs use outlined paths, not live text. |

### Logo Variants

| Variant | Usage |
|---------|-------|
| Horizontal colored | Default. Use whenever space allows. |
| Stacked (ask/Odin) | Square/near-square layouts: social media, app splash, conference badges. |
| Combined mark (icon + wordmark) | Extra visual weight: website headers, document letterheads, co-branding. |
| Monochrome black | Single-color print. |
| Monochrome white | Dark backgrounds when color contrast is insufficient. |
| Favicon "aO" | Browser tabs (16–48px). Lowercase "a" in orange, uppercase "O" in green. |

### Logomark — The Judgment Eye

Green "O" (IBM Plex Sans SemiBold) with an orange diamond at center. The "O" represents Odin — wisdom, the all-seeing. The diamond represents the focused point of judgment.

| Use Case | Asset |
|----------|-------|
| App icon (iOS/Android) | Logomark on white background |
| Dashboard corner mark | Logomark colored, small |
| Watermark on reports | Logomark at 5–10% opacity |
| Social media profile | Stacked wordmark or "aO" favicon |

### Clear Space & Minimum Sizes

Minimum clear space = cap-height of "O" in "Odin" (1x) on all sides.

| Variant | Digital Min | Print Min |
|---------|-------------|-----------|
| Horizontal wordmark | 120px wide | 30mm wide |
| Stacked wordmark | 80px wide | 20mm wide |
| Logomark (O icon) | 24px | 6mm |
| Favicon (aO) | 16px | N/A |

### Background Usage

| Background | Logo Version |
|------------|-------------|
| White / Light (#FFFFFF – #F0F0F0) | Colored wordmark (orange + green) |
| Dark (#111119 – #2D2D44) | Colored wordmark or White wordmark |
| Photographic / Busy | White wordmark on semi-transparent overlay |
| Single-color print | Black or White monochrome |

**Never** place the colored logo on a background close in hue to orange or green — use monochrome instead.

### Logo Do's and Don'ts

**DO**: Use the logo exactly as provided with correct colors and proportions.
**DO**: Use monochrome white on dark backgrounds when color contrast is insufficient.
**DO**: Maintain the camelCase: lowercase "ask", uppercase "O", lowercase "din".
**DO**: Use provided SVG files with outlined paths.
**DO**: Place on clean, uncluttered backgrounds with sufficient contrast.

**DON'T**: Change the brand colors.
**DON'T**: Rotate, skew, or distort the logo.
**DON'T**: Add spaces, change capitalization, or separate the words.
**DON'T**: Recreate in a different typeface — always use provided assets.
**DON'T**: Place colored logo on gradient/patterned backgrounds where colors clash.

---

## Color Palette

### Primary Colors

```css
--askodin-orange: #DB4A2B;  /* RGB: 219, 74, 43 · HSL: 11°, 72%, 51% · CMYK: 0, 66, 80, 14 */
--askodin-green: #147B58;   /* RGB: 20, 123, 88 · HSL: 160°, 72%, 28% · CMYK: 84, 0, 28, 52 */
```

**askOdin Orange (#DB4A2B)** — Urgency, action, emphasis
- Use for: CTAs, warnings, accent highlights, "ask" in logo
- Use sparingly (15% of layout)

**askOdin Green (#147B58)** — Institutional trust, stability
- Use for: Institutional weight, success states, "Odin" in logo
- Carries the visual weight (25% of layout)

### Foundation Colors (Dark Theme)

```css
--deep-dark: #111119;       /* Page backgrounds, decks */
--dark-surface: #1A1A2E;    /* Cards, panels on dark bg */
--dark-card: #1E293B;       /* Elevated cards, tables */
```

### UI / Extended Palette

```css
--white: #FFFFFF;
--background-light: #F7F8FA;
--border: #E2E8F0;
--muted-text: #8899AA;
```

### Semantic / Status Colors (Clarity Framework)

```css
--kill-shot-fatal: #C62828;  /* Kill Shot / Fatal */
--priority-high: #DB4A2B;    /* Priority / High Risk (same as brand orange) */
--watch-medium: #F9A825;     /* Watch / Medium */
--cleared-pass: #147B58;     /* Cleared / Pass (same as brand green) */
```

### Color Usage Ratios

| Proportion | Color Role | Usage |
|------------|-----------|-------|
| **60%** | Dark / Neutral | Foundation, backgrounds |
| **25%** | Green | Institutional weight, trust elements |
| **15%** | Orange | Accent — CTAs, warnings, emphasis only |

**Rules**:
- Orange is the accent — use sparingly for CTAs, warnings, and emphasis
- Green carries the institutional weight
- Dark tones provide the foundation
- Maintain 4.5:1 minimum contrast ratio for accessibility

---

## Typography

IBM Plex is the askOdin type system. Three families serve distinct purposes.

### Font Imports

```html
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=IBM+Plex+Serif:ital,wght@0,400;0,600;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
```

```css
--font-sans: 'IBM Plex Sans', Arial, Helvetica, sans-serif;
--font-serif: 'IBM Plex Serif', Georgia, 'Times New Roman', serif;
--font-mono: 'IBM Plex Mono', 'Courier New', monospace;
```

### IBM Plex Sans — Primary

Used for: Headlines, body text, UI elements, the logo itself.

| Weight | Value | Usage |
|--------|-------|-------|
| Light | 300 | Large display headlines (40px+) |
| Regular | 400 | Body text, descriptions, long-form |
| Medium | 500 | Subheadings, navigation, labels |
| SemiBold | 600 | Section headers, emphasis, logo, CTAs |
| Bold | 700 | Sparingly — key stats, Kill Shot labels |

### IBM Plex Mono — Technical

Used for: Code, data labels, technical identifiers, section numbers, metadata, Clarity Scores, patent numbers.

Examples: `CLARITY SCORE: 78/100 · ALMOST THERE`, `RUNE v2.1`, `U.S. PATENT PENDING NO. 63/948,559`

### IBM Plex Serif — Editorial

Used for: Clarity Brief reports, investment memos, quotes, long-form editorial content.

Use Regular Italic (400i) for quotes and editorial emphasis.

### Type Scale

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| Display | 48–96px | 300 or 600 | 1.1 |
| H1 | 36–48px | 600 | 1.2 |
| H2 | 28–36px | 600 | 1.3 |
| H3 | 20–24px | 600 | 1.4 |
| Body Large | 18px | 400 | 1.7 |
| Body | 16px | 400 | 1.6 |
| Small / Caption | 13–14px | 400 or 500 | 1.5 |
| Label / Overline | 12–13px | 500, uppercase, 0.1em tracking | 1.4 |

### Typography Rules

1. Use Light (300) for large display headlines only (40px+); SemiBold (600) for section headers
2. Never use Light weight at small sizes — it becomes illegible
3. IBM Plex Mono for all data labels, scores, technical identifiers, and metadata
4. IBM Plex Serif Italic for quotes and editorial emphasis in Clarity Briefs
5. Labels/overlines: uppercase with 0.1em letter-spacing
6. Stick to 2–3 font sizes per slide for clear hierarchy
7. Color for emphasis — use orange/green for highlighting, not italics or underlining
8. Never mix more than 2 font families on a single page

---

## Design Principles

### 1. Dark & Bold ("Hardened Dark" Aesthetic)

- Primary background: Deep Dark (#111119), not pure black
- Cards on Dark Surface (#1A1A2E) or Dark Card (#1E293B)
- White text with orange/green accents
- Strong contrast hierarchy

### 2. Structured & Systematic

- Clear visual hierarchy with defined sections
- Use cards/panels for grouping related content
- Consistent spacing (use multiples of 8px)
- Orange accent bars (4px) for visual anchoring

### 3. Professional Minimalism

- Clean, uncluttered designs with intentional whitespace
- 3–5 bullets maximum per slide
- One key message per slide

### 4. Data-Forward

- Charts and metrics prominently displayed
- Orange for primary data series, green for secondary
- Always include axis labels and clear legends
- Use IBM Plex Mono for all data/metric labels

---

## Application Quick Reference

### Context → Asset Mapping

| Context | Primary Asset |
|---------|--------------|
| Website navbar | Horizontal wordmark, colored SVG |
| Clarity Dashboard header | Combined mark (icon + wordmark) |
| Pitch deck title slide | Horizontal wordmark on dark background |
| Pitch deck closing slide | Horizontal wordmark, large |
| Browser favicon | "aO" monogram, 16+32+48px |
| LinkedIn / Twitter profile | Profile dark (square) 400x400 or 800x800 PNG |
| LinkedIn cover banner | Branded banner with logo, tagline, patent, CTA (1584x396) |
| Twitter/X cover | Branded cover with logo, tagline, patent, CTA (1500x500) |
| OpenGraph / link preview | OG image 1200x630 PNG |
| Email signature | Horizontal wordmark, small (400w PNG) |
| Clarity Brief / Report header | Combined mark SVG or high-res PNG |
| Conference badge | Stacked wordmark, print-ready |
| Patent / legal filings | Horizontal wordmark, black monochrome |

### Co-Branding Rules

When the askOdin logo appears alongside partner logos (SGX, CFA, accelerator partners):

1. **Equal or greater prominence** — askOdin logo must be equal or larger when askOdin is primary product
2. **Visual separator** — thin vertical line (1px, #E2E8F0 on light / rgba(255,255,255,0.15) on dark)
3. **Spacing** — minimum 2x clear space between marks
4. **No lockups** — never combine logos into a single fused mark

---

## Component Patterns

### Quick Start (HTML/Web)

```html
<head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=IBM+Plex+Serif:ital,wght@0,400;0,600;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">

  <style>
    :root {
      /* Primary Colors */
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

    body {
      font-family: var(--font-sans);
      font-size: 16px;
      line-height: 1.6;
      color: var(--white);
      background: var(--deep-dark);
    }

    h1, h2, h3 { font-family: var(--font-sans); }
    h1 { font-size: 48px; font-weight: 600; line-height: 1.2; }
    h2 { font-size: 32px; font-weight: 600; line-height: 1.3; }
    h3 { font-size: 22px; font-weight: 600; line-height: 1.4; }

    .display { font-size: 72px; font-weight: 300; line-height: 1.1; }
    .body-large { font-size: 18px; line-height: 1.7; }
    .label { font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em; }
    .mono { font-family: var(--font-mono); }
  </style>
</head>
```

### Content Card (Dark Theme)

```css
.card {
  background: #1E293B;
  padding: 24px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.08);
}
```

### Accent Box (Green Left Border)

```css
.accent-box {
  background: rgba(20, 123, 88, 0.12);
  border-left: 4px solid #147B58;
  padding: 20px;
  border-radius: 6px;
}
```

### CTA Button

```css
.cta-primary {
  background: #DB4A2B;
  color: #FFFFFF;
  padding: 12px 24px;
  border-radius: 8px;
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 600;
  font-size: 16px;
}

.cta-secondary {
  background: #147B58;
  color: #FFFFFF;
  padding: 12px 24px;
  border-radius: 8px;
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 500;
  font-size: 16px;
}
```

---

## Presentations (Slide Decks)

- **16:9 ratio** (960x540px for HTML)
- **Dark theme default** — Deep Dark (#111119) background
- Headlines: IBM Plex Sans SemiBold (600), 36–48px
- Body: IBM Plex Sans Regular (400), 18px
- Section labels: IBM Plex Mono, uppercase, 12–13px
- **Maximum 7 slides** for executive summaries
- **One key takeaway per slide**
- Orange accent bar (4px top) on title slides

### Documents

- **A4 size** for proposals and reports
- **1-inch margins** minimum
- **askOdin combined mark** in header or footer
- Light background for readability
- Headlines: IBM Plex Sans SemiBold
- Body: IBM Plex Serif Regular (for reports) or IBM Plex Sans Regular (for one-pagers)
- Data labels: IBM Plex Mono

---

## File Naming Conventions

- Presentations: `askOdin_[Topic]_[Date].pptx`
- Documents: `askOdin_[DocType]_[Topic]_[Version].docx`
- Images: `askodin_[description]_[size].png`

---

## LinkedIn Banner Spec (1584 × 396px)

| Element | Spec |
|---------|------|
| Background | Deep Dark (#111119) with orange accent bar (4px top) |
| Logo | askOdin wordmark, 62px, right-aligned |
| Tagline | IBM Plex Sans Light, 22px, white |
| Separator | Orange line, 70px wide, 2.5px stroke |
| Patent line | IBM Plex Mono, 16px, white at 70% opacity |
| CTA button | Green solid pill, white text, IBM Plex Sans Medium, 18px |
| Safe zone | Keep important content to x > 450px (profile photo overlap) |

## Twitter/X Cover Spec (1500 × 500px)

| Element | Spec |
|---------|------|
| Background | Deep Dark (#111119) with orange accent bar (4px top) |
| Logo | askOdin wordmark, 62px, right-aligned |
| Tagline | IBM Plex Sans Light, 22px, white |
| Separator | Orange line, 70px wide, 2.5px stroke |
| Patent line | IBM Plex Mono, 16px, white at 70% opacity |
| CTA button | Green solid pill, white text, IBM Plex Sans Medium, 18px |
| Safe zone | Avoid bottom-left ~120px × 130px (profile photo overlap on desktop) |
