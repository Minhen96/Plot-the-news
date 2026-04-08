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
| Make Prediction | `/story/[id]/predict` | Shown at end of narrative OR same page overlay |
| Mission Outcome | `/story/[id]/outcome` | Post-prediction simulation + analysis |
| Oracle's Archive | `/archive` | Pre-resolved stories with on-chain proofs |
| User Profile | `/profile` | Journal, stats, badges |
| Leaderboard | `/leaderboard` | Reputation rankings |

---

## Core User Flow

```
/ → /story/[id] → /story/[id]/role → /story/[id]/play → /story/[id]/predict → /story/[id]/outcome
                                                                                        ↓
                                                                                   /archive  /profile
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

### Page 5 — Make Your Prediction (Decision Engine)
**Vibe:** Overlay on blurred cinematic background. High-stakes decision moment.

- **Critical Event badge** (e.g. "STRAIT OF HORMUZ")
- Headline: `MAKE YOUR PREDICTION` (display font, all caps)
- **3 choice cards** in a row, each with:
  - Icon
  - Choice title (e.g. "Strategic De-escalation")
  - 1-2 sentence description
- **Confidence slider:** `Confidence Level (0-100%)` — Cautious ←→ Absolute
- CTA button: `🔒 Lock Prediction on L3` (primary green)
- Below: Character briefing card with portrait + quote providing context
- Bottom toolbar: Continue / Log / Skip / Auto

---

### Page 6 — L3 Transaction Moment (Judge WOW Moment)
Inline animation after clicking Lock:
```
Hashing prediction...    ▓▓▓░░░  (0.5s)
Submitting to L3...      ▓▓▓▓▓░  (0.5s)
✅ Locked on-chain
Proof ID: 0xA81F92...
```
Brief, dramatic, then transitions to outcome or continues narrative.

---

### Page 7 — Mission Outcome
**Vibe:** Editorial resolution. Journalistic "verdict" page.

- **"STORY RESOLVED" badge** (green pill, top)
- Headline: `Strategic Verdict: [Outcome Title]`
- Pull quote in italic serif
- **Hero image** — cinematic resolution scene (AI-generated)
- Verdict overlay card on image: outcome label + date
- Right sidebar: floating speech bubble with key quote
- **AI Analytical Mirror section:**
  - `The Reality:` — bullet points comparing simulated vs actual trajectory
  - Each bullet: plain summary of what actually unfolded
- Right panel: **On-Chain Verified** badge + `+15 Reputation Gained`
- Bottom: "Deepen Your Context" — links to real documents/sources
- CTAs: `Explore Next Story` + `Share Prediction`

---

### Page 8 — User Profile (FutureLens Journal)
**Vibe:** Personal journalist's dossier / achievement journal.

- Avatar + display name + flair quote (e.g. *"The future belongs to those who see it unfolding."*)
- **Foresight Score:** large number (e.g. 12,840)
- Stats row: Total Predictions / Accuracy / Streak / On-Chain Proofs
- **Journal of Achievements:** scrollable list of completed stories
  - Each entry: story thumbnail + title + user's prediction quote + `Details →`
  - Status badge per entry: Correct / Incorrect / Pending
- **Achievement Badges** (right sidebar): First Foresight / Pattern Seeker / Diplomat / etc.
- Account Management: Profile Settings / Security & Privacy
- Upgrade CTA: `Elevate Your Insight` (subscription/premium prompt)

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
- 3 choices generated per role
- Confidence slider (0–100%)
- Contextual character briefing shown below choices

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
| Correct prediction | +10 base |
| High-confidence correct | +bonus |
| Participation | +2 |

| Badge | Criteria |
|-------|----------|
| First Foresight | First prediction |
| Pattern Seeker | 5 predictions |
| Diplomat | Role-specific achievement |
| Analyst | 10 predictions |
| Strategist | >70% accuracy |
| Oracle | >90% accuracy |

### 8. Proof Archive / Journal
- Full prediction history with proof IDs
- On-chain verification status per entry
- Shareable prediction cards

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
