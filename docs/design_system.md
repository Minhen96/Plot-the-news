# FutureLens — Design System: The Illuminated Editorial

> Source: `reference/stitch design/lumina_storyboard_2.0/DESIGN.md`
> Concept screens: `reference/stitch design/`

## Creative North Star: "The Living Chronicle"
Authority of digital journalism + expressive warmth of graphic novels.
**Empathetic Authority** — truthful and educational, yet as inviting as a favourite book.

---

## Two Branding Contexts

| Brand | Usage | Screens |
|-------|-------|---------|
| **The Illuminated Editorial** | The fictional publication — editorial + in-game | Hub, Article, Role, Narrative, Predict, Outcome phases |
| **FutureLens** | The app layer — processing + personal | Loading Simulation, User Profile |

The nav component switches wordmark depending on context. Both use the same color palette and typography.

---

## Color Palette

### Surface Hierarchy (stacked vellum layers)
| Token | Hex | Use |
|-------|-----|-----|
| `surface` | `#fefdf1` | Base canvas |
| `surface_container_low` | `#fafaeb` | Secondary content areas |
| `surface_container` | `#f4f5e2` | Primary card backgrounds |
| `surface_container_high` | `#edf0d8` | Pop elements, focus areas |
| `surface_container_lowest` | `#ffffff` | Cards on top of container |

### Brand Colors
| Token | Hex | Use |
|-------|-----|-----|
| `primary` | `#336f54` | CTAs, active states, key UI |
| `primary_container` | `#b1f0ce` | Gradient ends, light accents |
| `secondary` | `#3655e3` | Nav active states |
| `secondary_container` | `#dee1ff` | Secondary buttons |
| `tertiary` | `#915700` | Ochre — "Did You Know?" callouts, educational |
| `on_primary` | `#ffffff` | Text on primary bg |
| `on_surface` | `#353a26` | Shadow tints (never pure black) |
| `outline_variant` | `#b7bca2` | Ghost border fallback (15% opacity only) |

### The "No-Line" Rule
**Never use 1px solid borders for sectioning.** Define boundaries through:
1. Background color shifts between surface layers
2. Tonal transitions (subtle hue shifts)
3. If accessibility requires a stroke: `outline_variant` at **15% opacity max**

---

## Typography

### Dual Typeface Strategy

| Voice | Font | Use |
|-------|------|-----|
| UI Voice | **Plus Jakarta Sans** | Nav, labels, headlines, metadata |
| Narrative Voice | **Newsreader** (serif) | Story body, dialogue, pull-quotes |

### Type Scale
| Name | Size | Font | Use |
|------|------|------|-----|
| Display-LG | 3.5rem | Plus Jakarta Sans | Immersive story titles |
| Headline-MD | 1.75rem | Plus Jakarta Sans | Section headers |
| Title-MD | 1.125rem | Newsreader | Pull-quotes, character intros |
| Body-LG | 1rem | Newsreader | Primary reading, dialogue |
| Label-MD | 0.75rem | Plus Jakarta Sans | Metadata, utility text |

---

## Elevation & Depth: Tonal Layering
No traditional drop shadows. Use:
- **Soft lift:** `surface_container_lowest` card on `surface_container` background
- **Ambient shadow:** diffuse blur 32px at 6% opacity, color = tint of `on_surface`
- **CTAs/Hero:** Linear gradient `primary` → `primary_container`
- **Floating Nav:** Glassmorphism — `surface` at 80% opacity + 24px backdrop-blur

---

## Key Components

### Buttons
- **Primary:** `primary` (#336f54) bg, white text, `ROUND_FULL` shape, inner-glow on hover
- **Secondary:** `secondary_container` bg, `on_secondary_container` text, no border
- Lock Prediction CTA: primary green, lock icon prefix, full-width on mobile

### Comic / Narrative Speech Bubbles
- Background: `surface_container_lowest`
- Font: Newsreader Body-MD (always — separates from UI)
- Tail component pointing to character portrait

### Role/Story Cards
- No dividers — use `spacing-xl` (3rem) or nested surface layers
- Corner radius: `radius-lg` (2rem) — soft, approachable
- AI portrait images as full-bleed card headers with gradient overlay

### Interactive Cards (Decision Choices)
- 3 cards side-by-side, equal width
- Icon + title + description
- Selected state: `primary` border glow (ghost, 20% opacity) + bg shift to `surface_container_lowest`

### Confidence Slider
- Pill-shaped track (`ROUND_FULL`)
- Fill: `primary` gradient
- Labels: "Cautious" ←→ "Absolute"

### Input Fields
- Default: `surface_variant` bg
- Focus: `primary` ghost border (20% opacity) + bg → `surface_container_lowest`
- Shape: `ROUND_FULL`

### Navigation
- Transparent + backdrop-blur
- Active state: soft `secondary` glowing dot under icon
- Logo: "The Illuminated Editorial" or "FutureLens" depending on context

### On-Chain Proof Badge
- Dark card (zinc-900 or deep forest green bg)
- Monospace font for hash/txHash
- "✅ On-Chain Verified" with emerald dot indicator

---

## Page-Specific Design Patterns

### The Daily Chronicle (Hub)
- Full broadsheet newspaper layout
- Asymmetric editorial grid — intentionally uneven columns
- Thick editorial rules (not full borders — top rule on sections only)
- Black & white typography on warm cream

### Role Selection
- Clean centered layout, two columns
- Full-bleed portrait photos in card headers
- Faction badge pill (top-left of card image)
- Dual-stat progress bars at card bottom

### In-Game Narrative
- **Full-bleed background** — cinematic AI image
- Character portrait: bottom-left, circular crop with faction badge
- Speech bubble: overlaid mid-screen, serif font
- Minimal UI — maximum immersion
- Glassmorphic sector badge (top-left)

### Community Directives (Predict)
- Full cinematic background (not blurred overlay)
- Three directive cards in a 3-column grid + 1 "Author Directive" sidebar panel
- Most-popular card has a `MOST POPULAR` badge at top edge (positioned with `-top-3`)
- Bottom pill: confidence slider + LOCK PREDICTION button in a single `rounded-full` container
- Character avatar (circular, small) + briefing quote anchored below all cards
- Card state: selected = `border-2 border-primary shadow-xl shadow-primary/5`

### Loading Simulation
- Uses "FutureLens" branding in header (not "The Illuminated Editorial")
- Center layout: title → progress bar → intel briefing carousel
- Progress bar: `bg-gradient-to-r from-primary to-primary-container` + animated stripe overlay
- Intel briefing: `surface-container-low` card, left/right chevron buttons, pagination dots
- Status line: pulsing dot animation + "Neural Engine" label

### Mission Outcome Phase Screens
- Full cinematic background (different scene per phase)
- `bg-gradient-to-t from-surface via-transparent to-transparent opacity-90` overlay
- **Left sidebar (desktop):** `w-72 bg-surface-container-low rounded-r-[2rem]` fixed panel
  - Nav items with icon + label
  - "Next Phase" green rounded-full button at bottom
- **Floating phase badge (top center):** `bg-tertiary-container/20 border border-tertiary/20 rounded-full` pill
- **AI Intel sidebar (right, desktop):** `bg-surface-container-lowest/80 backdrop-blur-md rounded-lg`
  - Probability bar + causal factors list
  - Operational status with secondary-colored border-l-4
- **Dialogue box (bottom center):**
  - `bg-surface-container-lowest rounded-xl border border-outline-variant/15`
  - Diamond speech bubble tail: `w-8 h-8 bg-surface-container-lowest rotate-45 border-l border-t` at `-top-4 left-24`
  - Character portrait positioned `absolute -top-32 left-12 w-48 h-48`
  - Character name label in `text-primary font-headline font-bold`

### Mission Outcome
- Full editorial layout again (back to "newspaper of record" feel)
- Hero image with verdict overlay card
- "AI Analytical Mirror" section — bulleted reality comparison
- On-chain badge sidebar

### User Profile
- Dossier/journal aesthetic
- Avatar + name + flair quote at top
- Large Foresight Score number (amber/gold)
- Achievement badges grid (right column)

---

## Do's and Don'ts

### Do
- Asymmetrical margins — "scrapbook / graphic novel" rhythm
- Overlapping elements that break their container boundaries
- `tertiary` ochre (#915700) for educational/contextual callouts
- Warm cream backgrounds on every surface
- Serif font for all story/narrative text

### Don't
- No 90-degree corners anywhere
- No dark mode or high-contrast black UI
- No horizontal divider lines — increase whitespace instead
- No standard Material/Android shadow style
- No pure white or harsh grey backgrounds
- No 1px solid borders for structure

---

## Screens Reference

| Screen | File | Branding |
|--------|------|----------|
| The Daily Chronicle (Hub) | `stitch design/the_daily_chronicle_america_vs._iran_edition/` | The Illuminated Editorial |
| Article View | `stitch design/article_the_shadow_of_the_crescent/` | The Illuminated Editorial |
| Role Selection | `stitch design/role_selection_america_vs._iran/` | The Illuminated Editorial |
| In-Game Narrative | `stitch design/in_game_the_strait_crisis/` | The Illuminated Editorial |
| Community Directives (Predict) | `stitch design/in_game_community_directives/` | The Illuminated Editorial |
| Loading Simulation | `stitch design/loading_strategic_simulation/` | **FutureLens** |
| Short-term Outcome | `stitch design/in_game_short_term_outcome/` | The Illuminated Editorial |
| Mid-term Outcome | `stitch design/in_game_mid_term_outcome/` | The Illuminated Editorial |
| Long-term Outcome | `stitch design/in_game_long_term_outcome/` | The Illuminated Editorial |
| User Profile | `stitch design/user_profile_futurelens_journal/` | **FutureLens** |
