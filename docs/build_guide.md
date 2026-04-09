# FutureLens — Hackathon Build Guide

## Blockchain Journey — Full Timeline

**Before hackathon starts:**
1. Create a MetaMask wallet → this is your admin wallet
2. Add DCAI L3 to MetaMask (Chain ID `18441`, RPC `http://139.180.140.143/rpc/`)
3. Claim free tDCAI from faucet → `POST http://139.180.140.143/faucet/request`
4. Open Remix IDE → paste `FutureLensRegistry` contract → deploy → copy address to `.env.local`
5. Save deployer wallet private key to `.env.local` as `ADMIN_PRIVATE_KEY`
6. Get RPC API key from organiser at workshop

**During the hackathon (every user prediction):**
1. User logs in via Privy → gets a wallet address
2. User locks prediction → Privy wallet signs `registerPrediction()` → txHash on DCAI L3
3. Proof card shows txHash → clickable on explorer

**Night before demo:**
1. Team calls `POST /api/admin/resolve` with admin secret key
2. Backend admin wallet calls `recordOutcome()` on DCAI L3
3. Oracle's Archive now has a real verified story with a real on-chain proof
4. Copy the explorer URL → paste into demo notes → ready for judges to click

---

## The One Flow to Make Perfect
```
Chronicle → Role → In-Game Narrative → Decision → L3 Lock → Simulation → Outcome → Proof
```
Build less. Make this one flow flawless.

---

## Priority Order

| Priority | Feature | Reason |
|----------|---------|--------|
| P0 | Cinematic in-game screens (all 10 stitch design screens) | Judges *feel* the product |
| P0 | Typewriter narrative text (pre-stored, `setInterval` on frontend) | Alive, not static |
| P0 | Loading simulation screen (progress bar + intel carousel) | Bridges predict → outcome |
| P0 | 3-phase sequential outcome screens (Short → Mid → Long) | Core game loop payoff |
| P0 | Optimistic L3 tx + proof card | Judge WOW moment |
| P0 | Privy wallet auth | Anyone can use it, no MetaMask needed |
| P0 | 1 pre-built Hormuz scenario (roles + scenes + choices pre-generated) | Demo needs content ready |
| P1 | Shareable proof card image (html2canvas) | Viral / social hook |
| P1 | Oracle's Archive (pre-resolved story + real txHashes) | Proves full loop |
| P1 | Role-influenced simulation | Makes role choice matter mechanically |
| P1 | Multi-agent AI analysis (3 personas → Judge) | AI depth for judges |
| P2 | Live news via GNews API | "This is from today's news" |
| P2 | On-chain badges / SBT mint | Extra blockchain depth |
| P2 | Beat the AI mechanic | Competitive layer |
| P2 | Custom prediction input + simulation | Creative personalisation |
| P2 | Crowd Champion badge (most-chosen option) | Social / crowd mechanic |
| P3 | Custom prediction AI evaluation at resolve | Needed for custom accuracy scoring |
| P3 | Profile / Journal page | Nice-to-have |
| P3 | Prediction countdown timer | Urgency |
| P3 | Real-time vote count per option | Alive feel |

---

## The "Minimum Impressive" Build (if time runs short)

These 6 things alone make FutureLens win-worthy:

1. **Newspaper Chronicle Hub** — "The Illuminated Editorial" masthead, editorial grid
2. **Cinematic in-game UI** — full-screen bg, character portrait, speech bubble typewriter
3. **Community Directives** — 3 choice cards + confidence slider + LOCK PREDICTION
4. **Loading simulation** — progress bar + intelligence briefing carousel
5. **3-phase sequential outcome** — Short → Mid → Long with character dialogue per phase
6. **Optimistic L3 tx → proof card → Oracle's Archive** — real txHash, clickable explorer link

---

## AI Prompt Templates

### Scenario Generator
```
You are a news editor. Given this headline:
"{{headline}}"

Return JSON only:
{
  "context": ["<line1>", "<line2>", "<line3>"],
  "situation": "<1 sentence current state>",
  "cliffhanger": "<1 dramatic sentence ending in a question>"
}
```

### Decision Generator (role-aware)
```
Role: {{role}}
- Stabilizer = cautious, risk-mitigation focus
- Aggressor = bold, disruption focus
- Analyst = data-driven, balanced

Scenario: {{situation}}

Return JSON with exactly 3 role-appropriate strategic choices:
{
  "choices": [
    { "id": "A", "label": "<short label>", "description": "<1-2 sentences>", "probability": "<X%>" },
    { "id": "B", ... },
    { "id": "C", ... }
  ]
}
```

### Simulation Engine (preset or custom — role-influenced)
```
Scenario: {{situation}}
User role: {{role}} ({{roleDescription}})
Prediction: {{choiceLabel OR custom text}}

Simulate 3 phases of consequences if this prediction/action occurs.
Return JSON:
{
  "timeline": [
    { "phase": "short", "label": "Short-term",  "timeframe": "Hours to days",   "event": "<immediate reaction>", "emoji": "<emoji>" },
    { "phase": "mid",   "label": "Mid-term",    "timeframe": "Weeks to months", "event": "<developing impact>",  "emoji": "<emoji>" },
    { "phase": "long",  "label": "Long-term",   "timeframe": "Months to years", "event": "<lasting change>",     "emoji": "<emoji>" }
  ]
}
```

### Custom Prediction Evaluation (runs at story resolution)
```
Story: {{situation}}
Resolved outcome: {{resolvedOutcome}}
User's custom prediction: "{{customPredictionText}}"

Evaluate how accurate this prediction was.
Return JSON:
{
  "verdict": "correct" | "partially_correct" | "incorrect",
  "reasoning": "<2 sentences explaining why>",
  "score": <0-100>
}
```

### Multi-Agent Analysis — 3 Personas (run in parallel)
```
// Pessimist
You are a risk analyst. Scenario: {{situation}}. Outcome: {{day7event}}.
Analyse this outcome through a worst-case, systemic-risk lens.
Return JSON: { "factors": [...], "evidence": [{title, year, relevance}], "reasoning": "..." }

// Optimist
You are an optimist strategist. [Same scenario/outcome]
Analyse through an upside, recovery, resilience lens.
Return JSON: same structure

// Realist
You are a data-driven historian. [Same scenario/outcome]
Analyse through historical precedent and data.
Return JSON: same structure
```

### Judge (synthesis — after 3 parallel calls complete)
```
Three analysts reviewed this outcome. Synthesise into a final "AI Analytical Mirror":

Pessimist: {{pessimistAnalysis}}
Optimist: {{optimistAnalysis}}
Realist: {{realistAnalysis}}

Return JSON:
{
  "factors": ["<top 3 key factors>"],
  "evidence": [{ "title": "...", "year": "...", "relevance": "..." }],
  "reasoning": "<2-3 sentence balanced synthesis>"
}
```

---

## Blockchain Checklist

### Day 1 — Deploy contract (do this first, everything else depends on it)
- [ ] **At workshop:** Get starter kit from DCAI — may have base contracts to extend
- [ ] **At workshop:** Get faucet URL → fund your admin/deployer wallet with tDCAI
- [ ] **At workshop:** Confirm chain ID and RPC URL
- [ ] Add DCAI L3 Testnet to MetaMask (chainId `18441`, RPC `http://139.180.140.143/rpc/`, gas token `tDCAI`)
- [ ] Open remix.ethereum.org → paste `FutureLensRegistry` (or extend starter kit contract)
- [ ] Compile with Solidity `0.8.20` → Deploy via Injected Provider → confirm in MetaMask
- [ ] Copy deployed address → `NEXT_PUBLIC_REGISTRY_ADDRESS` in `.env.local`
- [ ] Save deployer wallet private key → `ADMIN_PRIVATE_KEY` in `.env.local` (never commit this)
- [ ] Test `registerPrediction()` from a second wallet → verify txHash on explorer

### Day 2 — Wire resolution flow (night before demo)
- [ ] Build `/api/admin/resolve` endpoint with `x-admin-key` guard
- [ ] Test it resolves a story in DB + calls `recordOutcome()` on-chain
- [ ] Run it for "Central Bank Hike" scenario → get real txHash
- [ ] Verify txHash on block explorer → copy URL for demo
- [ ] Test `updateReputation()` + `mintBadge()` for demo wallet address

### Frontend
- [ ] Privy wallet → `useWallets` → `getEthereumProvider()` → ethers signer
- [ ] Wire `registerPrediction()` call on prediction submit
- [ ] Show optimistic proof card immediately, update to Confirmed when receipt arrives
- [ ] Wire "View on Explorer" button with real txHash
- [ ] `html2canvas` shareable proof card image

---

## Privy Integration (swap from raw MetaMask)

```bash
npm install @privy-io/react-auth
```

```tsx
// layout.tsx
import { PrivyProvider } from '@privy-io/react-auth'
<PrivyProvider appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID} config={{ ... }}>
  {children}
</PrivyProvider>

// Header.tsx — replace connectWallet()
import { usePrivy } from '@privy-io/react-auth'
const { login, authenticated, user } = usePrivy()
const address = user?.wallet?.address
```

---

## Live News Seeding (GNews API)

```ts
// /api/stories/generate — call manually to seed new scenarios
const res = await fetch(
  `https://gnews.io/api/v4/top-headlines?category=world&max=5&token=${GNEWS_KEY}`
)
const { articles } = await res.json()
// Pass articles[0].title + articles[0].description to Scenario Generator prompt
```

Free tier: 100 requests/day — enough for hackathon.

---

## Pre-Built Demo Scenarios (pre-generate AI content)

### 1. Strait of Hormuz Crisis
- **Headline:** Iran moves to close Strait of Hormuz — oil markets in freefall
- **Category:** Geopolitics / Energy
- **Status:** active (or resolve for Oracle's Archive)

### 2. AI Regulation Crackdown
- **Headline:** EU passes emergency AI Act — 6-month implementation window
- **Category:** Technology & Policy
- **Status:** active

### 3. Central Bank Surprise Hike *(resolve this one for the Archive)*
- **Headline:** Fed surprises markets with 75bps rate hike — recession fears spike
- **Category:** Finance
- **Status:** resolved → use for Oracle's Archive with real on-chain proof

---

## .env.local
```
NEXT_PUBLIC_L3_CHAIN_ID=18441
NEXT_PUBLIC_L3_RPC_URL=http://139.180.140.143/rpc/
NEXT_PUBLIC_L3_EXPLORER=http://139.180.140.143/
NEXT_PUBLIC_REGISTRY_ADDRESS=0x...
L3_RPC_API_KEY=...                         # from organizer at workshop
ADMIN_PRIVATE_KEY=0x...
MERKLE_REWARD_DISTRIBUTOR=0x728f2C63b9A0ff0918F5ffB3D4C2d004107476B7
OPERATOR_REGISTRY=0xb37c81eBC4b1B4bdD5476fe182D6C72133F41db9
ANTHROPIC_API_KEY=sk-ant-...
GNEWS_API_KEY=...
NEXT_PUBLIC_PRIVY_APP_ID=...
ADMIN_SECRET=some-random-secret-string
```

---

## Demo Script (3 minutes)

1. **Chronicle** → "The Illuminated Editorial — today's lead story: The Shadow of the Crescent."
2. **Article** → click "Launch Interactive Comic" → "This is the editorial brief. Now you step inside the story."
3. **Role selection** → pick The Coalition → "You're now Admiral. Every choice you see is shaped by your role."
4. **In-game narrative** → watch text appear scene by scene → "The Admiral briefs you on the crisis unfolding in the Strait."
5. **Community Directives** → choose a directive, set confidence to 80% → click **LOCK PREDICTION**
6. **L3 animation** → "Your prediction is being hashed and anchored permanently on DCAI L3."
7. **Loading simulation** → progress bar + intel briefing → "Our neural engine is generating three futures based on your choice."
8. **Short-term outcome** → character dialogue → click "Next Phase"
9. **Mid-term → Long-term** → "Three phases of consequence. Click through to see the full arc."
10. **Proof card + txHash** → click View on Explorer → live block explorer → "Immutable. Timestamped. Yours."
11. **Oracle's Archive** → show pre-resolved story → "This prediction was made 48 hours ago. The outcome is now locked on-chain forever."

**Closing line:** _"No one can claim they predicted something after it happens — except FutureLens users."_
