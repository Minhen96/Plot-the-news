# FutureLens — Product & Feature Specification

## Tagline
> "Predict the Future. Prove You Did."
> AI-powered simulations. Blockchain-verified foresight.

## Brand Identity
- **App name:** FutureLens
- **Editorial brand:** "The Illuminated Editorial"
- **Tone:** Authoritative newspaper meets cinematic visual novel

---

## Route Map

| Page | URL | Notes |
|------|-----|-------|
| Chronicle Hub | `/` | Scenario cards grid |
| Article View | `/story/[id]` | Editorial article + "Enter" CTA |
| Role Selection | `/story/[id]/role` | Pick faction before entering |
| In-Game Narrative | `/story/[id]/play` | Visual novel, role param in query/state |
| Make Prediction | `/story/[id]/predict` | Community Directives — directive cards + confidence slider |
| Simulation Loading | `/story/[id]/outcome?phase=loading` | "FutureLens" branded loading screen while Claude runs |
| Mission Outcome | `/story/[id]/outcome` | 3 sequential phase screens + resolution summary |
| Oracle's Archive | `/archive` | Pre-resolved stories with on-chain proofs |
| User Profile | `/profile` | Journal, stats, badges |
| Leaderboard | `/leaderboard` | Reputation rankings |

---

## Core User Flow

```
/ → /story/[id] → /story/[id]/role → /story/[id]/play → /story/[id]/predict
                                                                  ↓
                                           /story/[id]/outcome (loading → phase 1 → 2 → 3 → summary)
                                                                  ↓
                                                         /archive    /profile
```

---

## Page-by-Page Breakdown

### Page 1 — The Daily Chronicle (Scenario Hub)
**Vibe:** Prestigious broadsheet newspaper front page.

- Masthead: `The Illuminated Editorial`
- Navigation tabs: World News / Politics / Economy / Culture / Science / Opinion / Interactive
- **Featured Story:** Large editorial headline with lede copy and image. CTA: `Launch Interactive Comic`
- **Secondary stories:** 2-column editorial grid (sidebar style)
- **Right column:** "The Editorial Brief" newsletter sign-up, Archive teaser
- Footer: full newspaper footer with policy links

**Key story shown in concept:** "The Shadow of the Crescent: A Maritime Standoff"

---

### Page 2 — Article View
**Vibe:** Long-form magazine article.

- Story headline + lede image
- Editorial body copy (serif font)
- **"Inside the Game" CTA card** — mid-article pull-out prompting user to play the scenario
- Historical Evidence section at bottom
- References section

---

### Page 3 — Role / Deployment Selection
**Vibe:** Clean, two-card choice screen. Cinematic character portraits.

- Headline: `[Story Name] — Deployment Selection`
- Subline: *"Choose your lens. The narrative of history is shaped by those who hold the pen — and the sword."*
- **Two role cards side-by-side**, each with:
  - AI-generated portrait image (full-bleed card header)
  - Role label badge (e.g. "Western Interest" / "Regional Sovereignty")
  - Role name (e.g. "The Coalition" / "The Regional Guard")
  - Faction subtitle (e.g. "U.S. & Allied Forces")
  - Quote/philosophy in italic serif
  - Dual stat bar: `Strategic Difficulty` ←→ `Stability Focus` (or Disruption Focus)
- CTA: `Start Mission →`
- Disclaimer: *"Deployment protocols will be finalised upon selection"*
- Bottom: "Did You Know?" contextual fact card

---

### Page 4 — In-Game Narrative (Visual Novel)
**Vibe:** Full-screen cinematic. Visual novel / interactive story experience.

- **Full-bleed background image** (AI-generated scene — e.g. naval command room)
- Top-left: current sector badge (e.g. "Eastern Basin Alpha")
- Bottom-left: **character portrait** (admiral, analyst, etc.) with name label
- **Speech bubble** with narrative text (serif font)
- Progress indicator: `! Click to Continue`
- Bottom toolbar: Continue / Log / Skip / Auto

This is the immersive storytelling layer before the decision point.

---

### Page 5 — Community Directives (Decision Engine)
**Vibe:** Full cinematic background. Players contribute to a "Strategic Consensus" network.

- Section label: `COMMUNITY DIRECTIVES`
- Headline: `Strategic Consensus` (uppercase, extrabold)
- Subtext: *"Real-time projections from the global intelligence network"*
- **3 preset directive cards** in a 3-column grid, each with:
  - Icon + proposed-by user label (e.g. "Proposed by Stratos_Alpha")
  - Directive title (e.g. "Strategic De-escalation")
  - 1-2 sentence description (italic serif)
  - Live vote count (e.g. "8.4k Votes")
  - SELECT button (green for most popular, neutral otherwise)
  - Most-popular card gets a `MOST POPULAR` + `TRENDSETTER` badge at top
- **4th panel — "Author Directive"** (sidebar card, same row):
  - Label: `AUTHOR DIRECTIVE` (primary green, with edit icon)
  - Note: *"High-performing directives earn influence and Trendsetter status"*
  - Textarea: placeholder "Describe the outcome..."
  - `SUBMIT TO NETWORK` green button
- **Bottom pill bar** — full-width, rounded-full, contains:
  - `Confidence Level` label + range slider (Cautious ←→ Absolute)
  - `🔒 LOCK PREDICTION` button (dark/black, fills on hover to primary green)
- **Below (narrative anchor):** Character avatar (circular, small) + dialogue quote from The Admiral: *"Which path shall we take through the Strait?"*
- Bottom toolbar (mobile): Continue / Log / Skip / Auto

> **Design note:** The background is a full cinematic scene (naval bridge at dusk). Cards float over it with glassmorphism `backdrop-blur` and `surface-container-lowest/90`.

---

### Page 6 — L3 Lock Animation (WOW Moment)
Inline animation shown directly after clicking "LOCK PREDICTION":
```
Hashing prediction...    ▓▓▓░░░  (0.5s)
Submitting to L3...      ▓▓▓▓▓░  (0.5s)
✅ Locked on-chain
Proof ID: 0xA81F92...
```
Brief, dramatic. Then transitions to Loading Simulation screen.

---

### Page 6.5 — Loading Simulation
**Vibe:** FutureLens "processing" moment. Header switches to "FutureLens" branding (not "The Illuminated Editorial").

- Header: `FutureLens` (italic, forest green) — this is one of two screens that use FutureLens branding
- Headline: `Generating Future` + `Simulation...` (italic serif for the second word)
- **Prominent progress bar** (green gradient, animated stripe, shows percentage e.g. "64%")
  - Label above bar: "Synthesizing Variables"
- **Intelligence Briefing Carousel** — rotating educational fact cards
  - Each card: icon + category label + headline + 1-2 sentence fact
  - e.g. "The Strait of Hormuz — Approximately **20% of the world's oil** passes through daily"
  - Left/right chevron navigation arrows
  - Dot indicators below
- **Pulsing status line** at bottom: `● Neural Engine: Active Middle East Node` (pulsing green dot)
- This screen appears while Claude is generating the 3-phase simulation
- Minimum display time: 2 seconds (so user can read the briefing card)

---

### Page 7 — Mission Outcome (3 Sequential Phase Screens)
**Vibe:** The outcome is experienced as a mini-narrative — three separate cinematic screens, one per phase. Users click through them like the in-game narrative.

Each phase screen shares the same layout:

**Chrome (persistent across all 3 phases):**
- Fixed top nav: `The Illuminated Editorial` branding + Narrative / Map / Timeline nav
- **Floating phase badge** (center top): `CURRENT PHASE: SHORT-TERM OUTCOME (DAYS 1-7)` (tertiary/amber pill)
- **Left sidebar (desktop):** Fleet Command panel with nav items (Intel / Diplomacy / War Room / Archive) + `Next Phase` green button at bottom
- **Mobile bottom nav:** Narrative / Map / Timeline / Settings

**Per-phase content (center canvas):**
- Full cinematic background (atmospheric scene appropriate to the phase)
- Gradient overlay (`bg-gradient-to-t from-surface via-transparent to-transparent`) for readability
- **AI Intel sidebar (right, desktop):** floating panel with:
  - Analysis label + progress bar (e.g. "De-escalation Probability: 74%")
  - Causal Factors bullet list (tertiary dot bullets)
  - Operational Status chip (e.g. "Cooling Period")
- **Character dialogue box (bottom center):**
  - Character portrait positioned above-left, partially overlapping the dialogue card
  - Speech bubble tail (diamond `rotate-45` notch) pointing up-left toward portrait
  - Character name label (e.g. "THE ADMIRAL") in primary green
  - Narrative text in Newsreader serif (2 lines, large size)
  - `CLICK TO CONTINUE →` button (primary green, rounded-full, right-aligned)

**Phase progression:**
- Phase 1 — Short-term: "Days 1-7" → what happens immediately
- Phase 2 — Mid-term: "Weeks 1-12" → developing consequences
- Phase 3 — Long-term: "Year 1-5" → lasting structural impact
- After Phase 3: transitions to the proof card / reputation delta view

**After phases — Resolution Summary:**
- **On-Chain Verified** badge + txHash (monospace)
- Reputation points earned
- **Crowd Results** — most-chosen option + Crowd Champion winner
- If custom prediction: AI verdict (correct / partially correct / incorrect)
- CTAs: `Explore Next Story` + `Share Prediction Card`

---

### Page 8 — User Profile (FutureLens Journal)
**Vibe:** Personal journalist's dossier / achievement journal. Header uses `FutureLens` branding (one of two screens that do).

- **Top nav:** `FutureLens` (italic, green) + Stories / Archive / Profile links
- **User Header:** circular avatar (gradient ring: primary → primary-container) + role badge ("Oracle") + display name + flair quote
- **Foresight Score:** large number displayed in a rounded-full pill (e.g. 12,840)
- **Stats Bento Grid** (2×2 on mobile, 4 columns on desktop):
  - Total Predictions / Accuracy Rate / Streak / On-Chain Proofs
  - On-Chain Proofs card has a verified checkmark icon
  - Cards lift on hover (`hover:bg-primary-container`)
- **Left (main column): Journal of Achievements** — scrollable list
  - Each entry: story thumbnail/emoji (grayscale → color on hover) + title + user's prediction quote (italic serif, chat bubble icon) + L3 proof hash in monospace + `Details →`
  - Status badge: `Resolved - Correct` (primary-container) / `Pending Resolution` (surface-container)
- **Right column (sidebar):**
  - Achievement Badges grid (2 columns): icon + badge name + criteria
  - Account management links

---

## Feature Inventory

### 1. Scenario/Article Engine (AI)
- Input: news headline/summary
- Output: editorial article copy, lede, historical evidence, "Inside the Game" hook

### 2. Role Engine
- 2-3 roles per story (real geopolitical factions or perspectives)
- Each role: portrait, philosophy quote, dual stat bars
- Role influences which narrative branches and choices are generated

### 3. Narrative Engine (Visual Novel)
- AI-generated sequential scenes with character dialogue
- Full-bleed background per scene (AI image or curated)
- Character portraits with speech bubbles
- Click-to-advance progression

### 4. Decision Engine
- 3 preset choices generated per role, each showing live community vote count
- 4th option: free-text custom prediction input
- Confidence slider (0–100%)
- Contextual character briefing shown below choices
- Custom predictions get their own AI simulation — not grouped with preset options

### 5. Proof of Intent (Blockchain)
- Hash: `keccak256(userAddress + scenarioId + choiceId + confidence + timestamp)`
- Stored on DCAI L3 via `registerPrediction()`
- Returns txHash → shown as Proof ID

### 6. Outcome / AI Analytical Mirror
- "The Reality" — what the AI simulated
- Comparison to user's prediction
- On-chain verification badge
- Reputation points delta shown

### 7. Reputation System

| Action | Points |
|--------|--------|
| Correct prediction (preset) | +10 base |
| Correct custom prediction | +15 base (harder, so more points) |
| High-confidence correct | +bonus |
| Crowd Champion (most-chosen option) | +5 |
| Participation (any prediction) | +2 |

| Badge | Criteria | Type |
|-------|----------|------|
| First Foresight | First prediction | Accuracy |
| Pattern Seeker | 5 predictions | Accuracy |
| Diplomat | Role-specific achievement | Accuracy |
| Analyst | 10 predictions | Accuracy |
| Strategist | >70% accuracy | Accuracy |
| Oracle | >90% accuracy | Accuracy |
| Crowd Champion | Picked the most-chosen option when story resolves | Popularity |
| Contrarian | Picked the least-chosen option but was correct | Special |

**Two ways to win:**
- **Accuracy badges** — be right (contrarian or not)
- **Crowd Champion** — read crowd sentiment correctly (separate skill)

### 8. Proof Archive / Journal
- Full prediction history with proof IDs
- On-chain verification status per entry
- Shareable prediction cards

### 9. Enriched News Ecosystem
- **Crisis Level**: A global metric (0-100) on the Chronicle Hub defining how volatile the scenario is.
- **Key Player Stances**: Dual-faction live stances derived from the news (e.g. `The Coalition (West): Defensive`).
- **Intelligence Briefs**: A module leveraging actual URLs (from GNews) instead of hallucinations, grounding the simulation in reality.

---

## MVP Scope

### Must Have
- 1 complete scenario (America vs. Iran / Strait of Hormuz concept)
- Article view → Role selection → Narrative → Decision → L3 lock → Outcome
- Prediction stored on-chain (real txHash)
- Proof card displayed

### Nice to Have
- 2-3 scenarios
- Full visual novel narrative scenes (with AI images)
- Profile / Journal page
- Leaderboard
- Badge system

---

## Success Metrics
- User completes full flow: article → prediction → on-chain proof
- txHash visible and verifiable on block explorer
- Prediction accuracy trackable when story resolves
- Demo completable in under 5 minutes
