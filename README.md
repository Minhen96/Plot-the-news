# FutureLens

**NottsHack 2026 · DCAI Sponsor Prize ($1,800 USDT)**

Read editorial → pick a role → live a narrative → lock a prediction on-chain → see the AI-simulated future unfold.

---

## What It Does

FutureLens turns real-world news into an interactive geopolitical simulation game:

1. **Chronicle Hub** — live news feed powered by newsdata.io, cached in Supabase
2. **Article View** — editorial deep-dive on the scenario
3. **Role Selection** — choose your faction (e.g. The Coalition vs The Regional Guard)
4. **Visual Novel** — typewriter narrative driven by pre-generated Claude scenes
5. **Community Directives** — submit a prediction with confidence level
6. **Lock on-chain** — prediction hash written to DCAI L3 Testnet via Privy wallet
7. **Simulation** — AI-generated short/mid/long-term outcome timeline
8. **Oracle's Archive** — pre-resolved stories with verified on-chain proofs

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend + API | Next.js 15 (App Router) |
| Styling | Tailwind CSS v4 |
| AI | Anthropic Claude (multi-agent) |
| Auth / Wallet | Privy |
| Blockchain | DCAI L3 Testnet + ethers.js |
| Database | Supabase (Postgres) |
| News | newsdata.io (DB-cached, 12h TTL) |

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Create `.env.local` in the project root:

```env
# News
NEWSDATA_API_KEY=...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# AI
ANTHROPIC_API_KEY=sk-ant-...

# Auth
NEXT_PUBLIC_PRIVY_APP_ID=...

# Blockchain (DCAI L3)
NEXT_PUBLIC_L3_CHAIN_ID=18441
NEXT_PUBLIC_L3_RPC_URL=http://139.180.140.143/rpc/
NEXT_PUBLIC_L3_EXPLORER=http://139.180.140.143/
NEXT_PUBLIC_REGISTRY_ADDRESS=0x...
L3_RPC_API_KEY=...
ADMIN_PRIVATE_KEY=0x...

# Admin
ADMIN_SECRET=...
```

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Note:** Without `NEWSDATA_API_KEY` the Chronicle Hub renders fallback editorial content. All other pages work independently.

---

## Project Structure

```
src/
  app/
    page.tsx                  # Chronicle Hub (home)
    story/[id]/               # Article → Role → Play → Predict → Outcome
    api/
      news/feed/route.ts      # Paginated news feed (cache-first)
      stories/                # Story CRUD + AI generation
      predict/                # Prediction submit + simulate
      admin/                  # resolve, outcome recording
  components/
    Header.tsx                # Masthead + category nav
    TopFeed.tsx               # Lead story + 2-col nested scroll feed
    SectionFeed.tsx           # Nested scroll feed (Markets / Crypto)
    MobileNav.tsx             # Hamburger sidebar
    NewsFeed.tsx              # Infinite scroll card grid
  lib/
    newsdata.ts               # newsdata.io fetch functions (cache-first via Supabase)
    types.ts                  # Shared TypeScript types
  data/
    news.ts                   # Fallback articles (shown when API key absent)
docs/
  tech.md                     # Full technical specification
  design_system.md            # Design tokens, components, layout rules
  product_feature.md          # Screen-by-screen feature spec
  build_guide.md              # Build order + demo script
reference/
  stitch design/              # HTML prototypes for every screen
```

---

## Docs

Before building any feature, read the relevant doc:

| Building | Read |
|----------|------|
| Any screen / page | `docs/product_feature.md` |
| Design tokens, layout | `docs/design_system.md` |
| AI, DB schema, blockchain, API routes | `docs/tech.md` |
| Build order, demo script | `docs/build_guide.md` |

---

## Demo Scenario

Primary demo: **"The Shadow of the Crescent: America vs. Iran"** (Strait of Hormuz)

- Story ID: `strait-of-hormuz`
- Two roles: The Coalition / The Regional Guard
- Full flow completable in under 3 minutes

---

## Blockchain — DCAI L3 Testnet

| Field | Value |
|-------|-------|
| Chain ID | `18441` |
| RPC | `http://139.180.140.143/rpc/` |
| Explorer | `http://139.180.140.143/` |
| Faucet | `http://139.180.140.143/faucet/` |
| Gas token | `tDCAI` (free from faucet) |

All on-chain transactions use free testnet tokens — no real money involved.
