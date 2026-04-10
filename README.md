# FutureLens

**NottsHack 2026 · DCAI Sponsor Prize ($1,800 USDT)**

FutureLens turns real-world news into an interactive geopolitical simulation game. Read an editorial, pick a faction, live a visual novel narrative, lock a prediction on-chain, and watch an AI-simulated future unfold.

---

## Getting Started

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd NottsHack
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root directory:

```env
# Database (Supabase Transaction Pooler — port 6543)
DATABASE_URL="postgresql://postgres.[PROJ_ID]:[PASS]@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres"

# AI
DEEPSEEK_API_KEY=...         # platform.deepseek.com

# Image generation
FAL_KEY=...                  # fal.ai dashboard → API Keys
GENERATE_IMAGES=false        # false = Picsum placeholders, true = real FAL.ai images

# News
NEWSDATA_API_KEY=...         # newsdata.io
GNEWS_API_KEY=...            # gnews.io (used for story references only)
UNSPLASH_ACCESS_KEY=...      # unsplash.com/developers (cover images)

# Cron protection
CRON_SECRET=...              # any random string, match in Vercel dashboard

# Auth / Wallet
NEXT_PUBLIC_PRIVY_APP_ID=...

# Blockchain (DCAI L3)
NEXT_PUBLIC_L3_CHAIN_ID=18441
NEXT_PUBLIC_L3_RPC_URL=http://139.180.140.143/rpc/
NEXT_PUBLIC_L3_EXPLORER=http://139.180.140.143/
NEXT_PUBLIC_REGISTRY_ADDRESS=0x...
ADMIN_PRIVATE_KEY=0x...
ADMIN_SECRET=...
```

### 3. Database Setup
```bash
npm run db:push
```

### 4. Start Development
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## How It Works

```
Cron (every 2h) → Newsdata headlines → scrape full article → DeepSeek generates story
               → GNews fetches related articles as references → save to DB

Home page → reads DB stories (falls back to live newsdata if DB empty)
  → click story → Article View → Role Selection → Visual Novel (play)
    → Community Directives (predict) → lock on-chain → Outcome simulation
```

---

## Local Testing (No Cron Needed)

The DB starts empty in dev. Seed it manually:

**Option 1 — Use the static demo story** (no DB needed):
```
http://localhost:3000/story/strait-of-hormuz
```
The demo story is hardcoded in `src/data/stories.ts` and works immediately.

**Option 2 — Generate a story from a real headline:**
```bash
curl -X POST http://localhost:3000/api/stories/generate \
  -H "Content-Type: application/json" \
  -d '{
    "headline": "US and Iran tensions escalate in Persian Gulf",
    "description": "Naval confrontations increase as diplomatic talks stall.",
    "url": "https://example.com/test-article"
  }'
```
Returns `{ "id": "us-and-iran-tensions-..." }`. With `GENERATE_IMAGES=false`, uses Picsum placeholders instantly — no FAL.ai credits spent.

**Option 3 — Trigger the cron batch manually:**
```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  http://localhost:3000/api/stories/generate-batch
```
Fetches real newsdata headlines, scrapes them, generates up to 3 stories.

**Generate real images for a story (after seeding):**
```bash
curl -X POST http://localhost:3000/api/stories/{story-id}/generate-images
```
Set `GENERATE_IMAGES=true` first, otherwise still returns Picsum.

---

## Game Flow

```
/                           Chronicle Hub (DB stories or live newsdata fallback)
/story/[id]                 Article View + Deep Dive + "Launch" CTA
/story/[id]/role            Role Selection (pick faction)
/story/[id]/play            Visual Novel (typewriter panels, click to advance)
/story/[id]/predict         Community Directives (select + lock prediction)
/story/[id]/outcome         Loading → Short → Mid → Long → Summary
/archive                    Oracle's Archive (resolved stories)
/profile                    User Journal
```

---

## Tech Stack

| Layer                                         | Technology                                             |
| --------------------------------------------- | ------------------------------------------------------ |
| Frontend + API                                | Next.js 15 (App Router)                                |
| Styling                                       | Tailwind CSS v4                                        |
| ORM                                           | Drizzle ORM                                            |
| Database                                      | Supabase (Postgres)                                    |
| AI — story generation                         | DeepSeek (`deepseek-chat`)                             |
| AI — image generation                         | FAL.ai (Flux Schnell + Flux Pro Redux for consistency) |
| News — cron job / fallback for live home feed | newsdata.io                                            |
| News — story references                       | GNews API v4                                           |
| Article scraping                              | Mozilla Readability + jsdom                            |
| Auth / Wallet                                 | Privy                                                  |
| Blockchain                                    | DCAI L3 Testnet                                        |
| Cron                                          | Vercel Cron (every 2h)                                 |

---

## Project Structure

```
src/
  app/
    page.tsx                          # Chronicle Hub
    story/[id]/
      page.tsx                        # Article View
      role/page.tsx                   # Role Selection
      play/page.tsx                   # Visual Novel
      predict/page.tsx                # Community Directives
      outcome/page.tsx                # Simulation Outcome
    api/
      stories/route.ts                # GET all stories
      stories/[id]/route.ts           # GET single story
      stories/generate/route.ts       # POST generate story from headline
      stories/generate-batch/route.ts # GET cron batch (newsdata → generate)
      stories/[id]/generate-images/   # POST trigger FAL.ai image generation
      stories/simulate/route.ts       # POST run outcome simulation
      predict/route.ts                # POST submit prediction
  components/
    PlayClient.tsx                    # Visual novel (typewriter, panel navigation)
    DirectivesClient.tsx              # Prediction selection + lock animation
    OutcomeClient.tsx                 # Loading → Short → Mid → Long phases
  lib/
    generate/
      deepseek.ts                     # DeepSeek story generation
      images.ts                       # FAL.ai image generation (Picsum in dev)
      scraper.ts                      # Article URL scraper (Readability)
    stories.ts                        # DB story CRUD (news + stories JOIN)
    predictions.ts                    # DB prediction CRUD
    blockchain.ts                     # Hash stubs (ethers.js TBD)
    newsdata.ts                       # newsdata.io fetch functions
    gnews/                            # GNews API client
  data/
    stories.ts                        # Static demo story (strait-of-hormuz)
  db/
    index.ts                          # Drizzle client
    schema.ts                         # news + stories + predictions + profiles tables
docs/
  implementation_plan.md              # Full implementation plan + image strategy
  tech.md / design_system.md / ...    # Original spec docs
reference/
  stitch design/                      # HTML prototypes for every screen
```

---

## Demo Scenario

Primary demo: **"The Shadow of the Crescent: America vs. Iran"** (Strait of Hormuz)
- Story ID: `strait-of-hormuz`
- Two roles: The Coalition (Western Interest) / The Regional Guard (Regional Sovereignty)
- Full flow completable in under 3 minutes

---

## Blockchain — DCAI L3 Testnet

| Field     | Value                            |
| --------- | -------------------------------- |
| Chain ID  | `18441`                          |
| RPC       | `http://139.180.140.143/rpc/`    |
| Explorer  | `http://139.180.140.143/`        |
| Faucet    | `http://139.180.140.143/faucet/` |
| Gas token | `tDCAI` (free from faucet)       |
