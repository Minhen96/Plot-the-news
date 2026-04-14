# FutureLens — Geopolitical Simulation from Real Headlines

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![DCAI L3](https://img.shields.io/badge/Blockchain-DCAI%20L3-blue)](http://139.180.140.143/)
[![Hackathon](https://img.shields.io/badge/NottsHack-2026-orange)](https://nottshack.com)

**Read a real editorial → pick a faction → live a visual novel → lock your prediction on-chain → watch an AI-simulated future unfold.**

Built for NottsHack 2026 (48h, DCAI sponsor prize $1800 USDT).

---

## How It Works

```
Cron job (removed now) → newsdata.io headlines → scrape full article text (Readability)
               → DeepSeek generates story (article body, roles, panels, prediction options)
               → GNews fetches related articles as references
               → save to DB with Picsum placeholder images

Home page → reads DB stories (falls back to live newsdata if DB empty, paginated)
  → click story → Article View → Role Selection → Visual Novel (play)
    → Play/Role page detects Picsum images → triggers FAL.ai on-demand
    → stores real images in DB → next visit skips generation entirely
    → Community Directives (predict) → lock on-chain → Outcome simulation
```

---

## Game Flow

```
/                           Chronicle Hub (DB stories, paginated, live newsdata fallback)
/story/[id]                 Article View + historical evidence + "Launch" CTA
/story/[id]/role            Role Selection — pick your faction
/story/[id]/play            Visual Novel — typewriter panels, click to advance
/story/[id]/predict         Community Directives — select + lock prediction on-chain
/story/[id]/outcome         Loading → Short-term → Mid-term → Long-term → Summary
/archive                    Oracle's Archive — resolved stories
/profile                    User Journal — prediction history + reputation
```

---

## Image Generation

Two functions, two purposes:

| Function              | When used                                       | Respects `GENERATE_IMAGES`?       |
| --------------------- | ----------------------------------------------- | --------------------------------- |
| `generateStoryImages` | Story creation (cron / generate route)          | Yes — returns Picsum when `false` |
| `generateFalImages`   | On-demand (`/api/stories/[id]/generate-images`) | No — always calls FAL.ai          |

### `GENERATE_IMAGES=false` (default in dev)

- Story creation → Picsum placeholders saved instantly, no API cost
- User visits Role page → detects Picsum portraits → calls FAL.ai → swaps portraits in state → saves to DB
- User visits Play page → detects Picsum backgrounds → calls FAL.ai → swaps silently in background
- Next visit → images already real in DB → no generation, served from cache

### `GENERATE_IMAGES=true` (production)

- Story creation → FAL.ai called immediately as part of generation
- Role/Play pages → images already real → no lazy generation needed

The `/api/stories/[id]/generate-images` route has an early exit: if all portraits and backgrounds are already real URLs (non-Picsum), it returns immediately with no FAL.ai call. Safe to call multiple times.

---

## Cron Jobs

The cron runs via an HTTP route protected by `Authorization: Bearer $CRON_SECRET`.

On Vercel, add a `vercel.json` at the project root:

```json
{
  "crons": [
    {
      "path": "/api/stories/generate-batch",
      "schedule": "0 */3 * * *"
    }
  ]
}
```

Vercel calls the route on schedule and automatically injects the `Authorization` header using your `CRON_SECRET` env var.

**The cron does not run locally.** The route itself works fine — you are the scheduler. To simulate it:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  http://localhost:3000/api/stories/generate-batch
```

---

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/Minhen/Plot-the-News.git
cd Plot-the-News
pnpm install
```

### 2. Environment Variables

Create `.env.local`:

```bash
# Database (Supabase)
DATABASE_URL=postgresql://...    # Transaction Pooler — port 6543
DIRECT_URL=postgresql://...      # Direct Connection — port 5432

# AI
DEEPSEEK_API_KEY=sk-...          # Story + scenario generation
FAL_KEY=...                      # Image generation (Flux Schnell + Flux Realism)
GENERATE_IMAGES=false            # false = Picsum in dev, true = FAL.ai in prod

# News APIs
NEWSDATA_API_KEY=...             # Cron headlines + live feed fallback
GNEWS_API_KEY=...                # Story reference articles

# Auth
NEXT_PUBLIC_PRIVY_APP_ID=...     # Wallet + social login

# Cron protection
CRON_SECRET=...                  # Shared secret for /api/stories/generate-batch

# Optional
UNSPLASH_ACCESS_KEY=...          # Cover image lookup (falls back to Picsum if absent)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

```bash
# Check DB connection
node scripts/db-check.mjs

# Push schema to Supabase (non-destructive)
npm run db:push

# Start dev server
npm run dev
```

The project uses a custom Postgres schema `plot_news_app` to isolate its tables.

---

## Local Testing (No Cron Needed)

The DB starts empty in dev. Three ways to seed it:

**Option 1 — Static demo story (no DB, works immediately):**

```
http://localhost:3000/story/strait-of-hormuz
```

Hardcoded in `src/data/stories.ts`. Full flow works end-to-end with no setup.

**Option 2 — Generate a story from a custom headline:**

```bash
curl -X POST http://localhost:3000/api/stories/generate \
  -H "Content-Type: application/json" \
  -d '{
    "headline": "North Korea fires ballistic missile toward Japan",
    "description": "Pyongyang launches ICBM as US-South Korea drills intensify.",
    "url": "https://example.com/test-article"
  }'
# Returns: { "id": "north-korea-fires-ballistic-..." }
```

Story saved with Picsum placeholders. Open `/story/[id]/role` — FAL.ai portraits generate automatically (~30–60s first time, instant on revisit).

**Option 3 — Pull real live headlines from newsdata:**

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  http://localhost:3000/api/stories/generate-batch
```

Fetches up to 3 real headlines, scrapes full article text, generates stories via DeepSeek. Same on-demand image generation applies when you visit the play page.

---

## Tech Stack

| Layer                            | Technology                           |
| -------------------------------- | ------------------------------------ |
| Frontend + API                   | Next.js 15 (App Router)              |
| Styling                          | Tailwind CSS v4                      |
| ORM                              | Drizzle ORM                          |
| Database                         | Supabase (Postgres)                  |
| AI — story generation            | DeepSeek (`deepseek-chat`)           |
| AI — image generation            | FAL.ai (Flux Schnell + Flux Realism) |
| News — cron / home feed fallback | newsdata.io                          |
| News — story references          | GNews API v4                         |
| Article scraping                 | Mozilla Readability + jsdom          |
| Auth / Wallet                    | Privy                                |
| Blockchain                       | DCAI L3 Testnet (Chain ID 18441)     |
| Cron                             | Vercel Cron (every 3h)               |

---

## Project Structure

```
src/
  app/
    page.tsx                          # Chronicle Hub (paginated feed)
    story/[id]/
      page.tsx                        # Article View
      role/page.tsx                   # Role Selection (revalidate: 60s)
      play/page.tsx                   # Visual Novel (revalidate: 60s)
      predict/page.tsx                # Community Directives (revalidate: 60s)
      outcome/page.tsx                # Simulation Outcome
    api/
      stories/route.ts                # GET stories (paginated, category filter)
      stories/[id]/route.ts           # GET single story + prediction stats
      stories/generate/route.ts       # POST generate story from headline
      stories/generate-batch/route.ts # GET cron — newsdata → generate loop
      stories/[id]/generate-images/   # POST trigger FAL.ai image generation
      stories/simulate/route.ts       # POST run outcome simulation (cached per option)
      predict/route.ts                # POST submit + persist prediction
  components/
    FeedLoader.tsx                    # Paginated feed with Load More (client)
    PlayClient.tsx                    # Visual novel — typewriter, lazy image swap
    RoleSelector.tsx                  # Role cards — lazy portrait generation
    DirectivesClient.tsx              # Prediction selection + lock animation
    OutcomeClient.tsx                 # Loading → Short → Mid → Long phases
    LiveArticleView.tsx               # Non-generated article view with skeleton
  lib/
    generate/
      narrative/handler.ts            # DeepSeek story generation (article, roles, panels)
      visuals/handler.ts              # FAL.ai image generation + Picsum fallback
      intelligence/handler.ts         # Multi-agent analysis
      simulations/handler.ts          # Outcome simulation (3-phase timeline)
      predictions/refiner.ts          # AI refinement of custom user predictions
      claude.ts                       # Claude API client
    stories.ts                        # DB story CRUD — news + stories JOIN (paginated)
    predictions.ts                    # DB prediction CRUD + simulatedTimeline cache
    blockchain.ts                     # Prediction + story hash functions
    newsdata.ts                       # newsdata.io fetch functions
    gnews/                            # GNews API client
  data/
    stories.ts                        # Static demo story (strait-of-hormuz)
  db/
    index.ts                          # Drizzle client
    schema.ts                         # news + stories + predictions + profiles + analyses
docs/
  product_feature.md                  # Screen-by-screen feature spec
  design_system.md                    # Design tokens, components, layout patterns
  tech.md                             # API routes, DB schema, blockchain spec
  build_guide.md                      # Build order, demo script, priorities
reference/
  stitch design/                      # HTML prototypes for every screen
```

---

## DB Schema

Five tables under the `plot_news_app` Postgres schema:

| Table         | Purpose                                                                 |
| ------------- | ----------------------------------------------------------------------- |
| `news`        | Editorial content — title, article body, historical context, references |
| `stories`     | Game content — roles, panels, prediction options, simulations cache     |
| `predictions` | User predictions — optionId, confidence, txHash, simulatedTimeline      |
| `profiles`    | User reputation — accuracy, streak, leaderboard rank                    |
| `analyses`    | Multi-agent AI analysis per story × option                              |

`news` and `stories` share the same `id` (slug-based, e.g. `strait-of-hormuz`). `stories` has a FK → `news` with cascade delete.

The `predictions.simulated_timeline` column caches the generated simulation result per user prediction, so revisiting the outcome page never re-calls DeepSeek.

---

## Caching Strategy

| Route                        | Cache                                           |
| ---------------------------- | ----------------------------------------------- |
| Chronicle Hub (`/`)          | ISR 5 minutes                                   |
| Article View                 | ISR 1 hour                                      |
| Role / Play / Predict pages  | ISR 60 seconds                                  |
| `GET /api/stories`           | No cache (dynamic, paginated)                   |
| `POST /api/stories/simulate` | Cached in `stories.simulations[optionId]` (DB)  |
| Prediction outcome           | Cached in `predictions.simulated_timeline` (DB) |

---

## Demo Scenario

Primary demo: **"The Shadow of the Crescent: America vs. Iran"** (Strait of Hormuz)

- Story ID: `strait-of-hormuz`
- Roles: The Coalition (Western Interest) / The Regional Guard (Regional Sovereignty)
- Pre-generated narrative, choices, and simulation data — no AI calls at runtime
- Full flow completable in under 3 minutes

Start here: `http://localhost:3000/story/strait-of-hormuz`

---

*Built for NottsHack 2026. Turning headlines into decisions.*
