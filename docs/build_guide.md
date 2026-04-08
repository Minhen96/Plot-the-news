# FutureLens — Hackathon Build Guide

## The One Flow to Make Perfect
```
Chronicle → Role → In-Game Narrative → Decision → L3 Lock → Simulation → Outcome → Proof
```
Build less. Make this one flow flawless.

---

## Priority Order

| Priority | Feature | Reason |
|----------|---------|--------|
| P0 | Cinematic in-game screens (stitch design UI) | Judges *feel* the product |
| P0 | Streaming narrative text (typewriter via SSE) | Alive, not static |
| P0 | Optimistic L3 tx + proof card | Judge WOW moment |
| P0 | Privy wallet auth | Anyone can use it, no MetaMask needed |
| P0 | 1-2 pre-built scenarios (AI pre-generated) | Demo needs content ready |
| P1 | Shareable proof card image (html2canvas) | Viral / social hook |
| P1 | Oracle's Archive (pre-resolved story + real txHashes) | Proves full loop |
| P1 | Role-influenced simulation | Makes role choice matter mechanically |
| P1 | Multi-agent AI analysis (3 personas → Judge) | AI depth for judges |
| P2 | Live news via GNews API | "This is from today's news" |
| P2 | On-chain badges / SBT mint | Extra blockchain depth |
| P2 | Beat the AI mechanic | Competitive layer |
| P3 | Profile / Journal page | Nice-to-have |
| P3 | Prediction countdown timer | Urgency |
| P3 | Real-time prediction counter | Alive feel |

---

## The "Minimum Impressive" Build (if time runs short)

These 5 things alone make FutureLens win-worthy:

1. **Cinematic in-game UI** — full-bleed bg, character portrait, speech bubble
2. **Streaming narrative text** — typewriter effect via Claude streaming
3. **Optimistic L3 tx animation → proof card** — the WOW moment
4. **Shareable proof card image** — "I called it. Here's the proof."
5. **Oracle's Archive** — one pre-resolved story, real txHash, clickable explorer link

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

### Simulation Engine (role-influenced)
```
Scenario: {{situation}}
User role: {{role}} ({{roleDescription}})
User chose: {{choiceLabel}} — {{choiceDescription}}

Simulate how THIS actor ({{role}}) would execute this choice and the 7-day consequences.
Return JSON:
{
  "timeline": [
    { "day": 1, "event": "<what happens>", "emoji": "<emoji>" },
    { "day": 3, "event": "<what happens>", "emoji": "<emoji>" },
    { "day": 7, "event": "<resolution>", "emoji": "<emoji>" }
  ]
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

1. **Chronicle** → "This scenario was generated from today's news via GNews API."
2. **Role selection** → pick The Analyst → "Your role shapes the choices you see."
3. **In-game narrative** → watch text stream in → "Claude is narrating the crisis in real time."
4. **Decision screen** → pick a choice, set confidence → click **Lock Prediction on L3**
5. **L3 animation** → "Your prediction is being hashed and anchored permanently on DCAI L3."
6. **Proof card** → show txHash → click View on Explorer → live block explorer
7. **Simulation + Analysis** → Day 1/3/7 panels → "Three AI analysts debated this outcome."
8. **Oracle's Archive** → show pre-resolved story → "This prediction was made 48 hours ago. The outcome resolved. The proof is immutable."

**Closing line:** _"No one can claim they predicted something after it happens — except FutureLens users."_
