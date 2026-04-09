# FutureLens — Technical Specification

## Stack

| Layer | Technology | What it does |
|-------|-----------|-------------|
| Frontend + Backend | Next.js (App Router) | All pages users see + all API routes. One codebase, no separate server. |
| Styling | Tailwind CSS | Utility classes for the Illuminated Editorial design system |
| AI | Anthropic Claude | Generates stories, choices, simulations, and multi-agent analysis |
| Auth/Wallet | Privy | Users log in with Google/email/MetaMask. Auto-creates a wallet for them. |
| Blockchain | DCAI L3 + ethers.js | Stores prediction hashes permanently on-chain |
| Database | Supabase (Postgres) | Stores everything off-chain: stories, scenes, predictions, users |
| News | GNews API | Fetches real today's news headlines to seed fresh scenarios |

> There is no separate backend server. Everything lives inside Next.js API routes (`/api/...`).

---

## Architecture

```
Frontend (Next.js App Router)
        ↓
API Routes (Next.js)
        ↓
AI Service Layer (Claude — multi-agent)     News Service (GNews API)
        ↓
Database (PostgreSQL / Supabase)
        ↓
DCAI L3 Network
```

---

## AI System — When Each Module Runs

| Module | Runs when | Stored in DB | Per what |
|--------|-----------|-------------|---------|
| Scenario Generator | Admin calls `/api/stories/generate` | Yes | Per story |
| Narrative Scenes | Same time as scenario generation | Yes | Per story × role |
| Preset Choices | Same time as scenario generation | Yes | Per story × role |
| "Beat the AI" pick | Same time as scenario generation | Yes (hidden) | Per story |
| Preset Simulation | After user submits preset prediction | Yes, cached | Per story × choice × role |
| Custom Simulation | After user submits custom prediction | Yes | Per prediction (unique) |
| Multi-Agent Analysis | Async after any prediction (background) | Yes | Per story × choice/text |
| Custom Prediction Evaluation | At story resolution | Yes | Per custom prediction |

**Key rule:** Everything pre-generated is cached — users never wait on page load. Simulation runs once per unique choice and is then cached for all future users who pick the same option. Custom predictions always generate fresh (they're unique). Analysis is always async.

---

## AI System — Multi-Agent Architecture

Four Claude calls per full analysis. Inspired by the swarm pattern (parallel debate → synthesis).

### Module 1 — Scenario Generator
Input: news headline/summary
```json
// Output
{
  "context": ["line1", "line2", "line3"],
  "situation": "One-sentence current state",
  "cliffhanger": "Dramatic closing question"
}
```

### Module 2 — Decision Generator
Input: scenario + selected role
```json
// Output
{
  "choices": [
    { "id": "A", "label": "...", "description": "...", "probability": "40%" },
    { "id": "B", "label": "...", "description": "...", "probability": "35%" },
    { "id": "C", "label": "...", "description": "...", "probability": "25%" }
  ]
}
```
Role (Stabilizer / Aggressor / Analyst) is injected into prompt — same event, different strategic options.

### Module 3 — Simulation Engine
Input: scenario + chosen option (preset label OR custom text) + role

Output uses **3 phases** (not Day 1/3/7):
```json
{
  "timeline": [
    { "phase": "short", "label": "Short-term",  "timeframe": "Hours to days",    "event": "...", "emoji": "🟡" },
    { "phase": "mid",   "label": "Mid-term",    "timeframe": "Weeks to months",  "event": "...", "emoji": "🟠" },
    { "phase": "long",  "label": "Long-term",   "timeframe": "Months to years",  "event": "...", "emoji": "🔴" }
  ]
}
```

For **preset choices**: simulation is cached after first run — all users who pick the same option see the same simulation instantly.
For **custom predictions**: simulation is always generated fresh (each custom text is unique).

### Module 4 — Multi-Agent Analysis (3 AI personas → Judge)

**Round 1** — 3 parallel Claude calls with distinct personas:
- **The Pessimist** — worst-case, systemic risk lens
- **The Optimist** — upside, recovery, resilience lens
- **The Realist** — data-driven, historical precedent lens

**Round 2** — Each persona reads the other two's analysis and critiques/refines (3 more parallel calls)

**Round 3** — Judge Claude synthesises all 6 outputs into the "AI Analytical Mirror":
```json
{
  "factors": ["factor1", "factor2", "factor3"],
  "evidence": [{ "title": "1973 Oil Crisis", "year": "1973", "relevance": "..." }],
  "reasoning": "Final synthesised paragraph"
}
```

**Why:** Produces richer, more defensible analysis. Shows sophisticated AI usage to judges.

### Module 5 — "Beat the AI" Prediction
Claude makes its own prediction on each scenario (stored server-side, hidden from user until after they lock). Revealed post-lock with comparison.
- User agrees with Claude + correct → normal points
- User disagrees with Claude + correct → 2× bonus

### Module 6 — Custom Prediction Evaluation (runs at story resolution)
When a story resolves and a user had submitted a custom prediction, AI reads:
- The user's custom text
- The actual resolved outcome

Returns:
```json
{
  "verdict": "correct" | "partially_correct" | "incorrect",
  "reasoning": "Your prediction aligned with X but missed Y...",
  "score": 0-100
}
```
Score maps to points: 80-100 = correct (+15pts), 40-79 = partial (+7pts), 0-39 = incorrect (+2pts participation).

### Streaming Narrative Text
Narrative scenes are **pre-generated** and stored in DB (not re-generated per user). The typewriter effect is purely frontend — fetch the stored text, then render it character by character with a setInterval. No SSE needed.

```ts
// Frontend: render pre-stored text as typewriter
const text = scene.dialogue
let i = 0
const interval = setInterval(() => {
  setDisplayed(text.slice(0, ++i))
  if (i >= text.length) clearInterval(interval)
}, 30)
```

This saves tokens and avoids per-user AI latency on the narrative page.

### Prompt Rules
- Short, structured prompts — no full articles
- Always request JSON output — no parsing guesswork
- Cache outputs per scenario in DB (same story = same panels, served instantly)

---

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/stories` | GET | List all scenarios with stats |
| `/api/stories/[id]` | GET | Single story detail |
| `/api/stories/[id]/roles` | GET | Roles for this story |
| `/api/stories/[id]/scenes` | GET | Narrative scenes for story × role (`?role=stabilizer`) |
| `/api/stories/[id]/options` | GET | Prediction options for story × role |
| `/api/stories/generate` | POST | Admin: generate scenario from GNews headline |
| `/api/predict` | POST | Submit prediction (preset or custom) → hash → store → trigger async analysis |
| `/api/predict/simulate` | POST | Generate simulation for custom prediction text |
| `/api/analysis/[storyId]/[optionId]` | GET | Poll for multi-agent analysis (status: pending/ready) |
| `/api/stories/[id]/votes` | GET | Live vote counts per preset option for this story |
| `/api/leaderboard` | GET | Reputation rankings |
| `/api/history/[address]` | GET | User prediction history |
| `/api/admin/resolve` | POST | **Admin only** — resolve story, set outcome, call recordOutcome() on-chain |

---

## Live News Pipeline (GNews API)

```
GET https://gnews.io/api/v4/top-headlines?category=world&token=...
→ POST /api/stories/generate
→ Claude: extract scenario JSON
→ Store in DB → appears in Chronicle
```

Run manually during hackathon to seed fresh scenarios. Demonstrates real-world utility — judges see today's news, not pre-baked content.

---

## Database Schema

### `stories`
```sql
id                TEXT PRIMARY KEY
title             TEXT
summary           TEXT
category          TEXT
status            TEXT       -- 'active' | 'resolved'
resolved_outcome  TEXT       -- set manually via admin API
crisis_level      INT        -- AI-generated (0-100) global tension metric
claude_prediction TEXT       -- Claude's own pick, hidden until user locks
created_at        TIMESTAMP
```

### `story_roles`
Each story has 2 roles. Role defines the faction lens (e.g. "The Coalition", "The Regional Guard").
```sql
id              TEXT PRIMARY KEY
story_id        TEXT REFERENCES stories(id)
role_key        TEXT    -- 'stabilizer' | 'aggressor' | 'analyst'
name            TEXT    -- display name e.g. "The Coalition"
faction         TEXT    -- subtitle e.g. "U.S. & Allied Forces"
quote           TEXT    -- philosophy quote (italic serif)
difficulty      INT     -- 1-5, strategic difficulty stat bar
stability       INT     -- 1-5, stability focus stat bar
portrait_url    TEXT    -- static file path or pre-generated image URL
key_player_stance TEXT  -- e.g. "Defensive / High Alert"
```

### `narrative_scenes`
Pre-generated once per story × role. Max 7 scenes.
```sql
id              TEXT PRIMARY KEY
story_id        TEXT REFERENCES stories(id)
role_key        TEXT    -- which role this scene belongs to
scene_index     INT     -- 0-based ordering
speaker         TEXT    -- character name (e.g. "The Admiral")
dialogue        TEXT    -- streamed text content
location        TEXT    -- sector/location badge e.g. "Eastern Basin Alpha"
background_url  TEXT    -- scene background image URL
created_at      TIMESTAMP
```

### `prediction_options`
```sql
id              TEXT PRIMARY KEY
story_id        TEXT REFERENCES stories(id)
role_key        TEXT    -- which role sees this option (or null = all roles)
label           TEXT    -- short choice title
description     TEXT    -- 1-2 sentence description
probability     TEXT    -- AI-estimated e.g. "40%"
vote_count      INT     DEFAULT 0   -- incremented on each prediction submit
```

### `predictions`
```sql
id                  TEXT PRIMARY KEY
user_address        TEXT
story_id            TEXT REFERENCES stories(id)
option_id           TEXT REFERENCES prediction_options(id)  -- NULL if custom
custom_prediction   TEXT    -- user's free-text prediction (NULL if preset)
is_custom           BOOL    DEFAULT false
role_key            TEXT    -- role the user played
confidence          INT     -- 1-100
hash                TEXT    -- keccak256
tx_hash             TEXT    -- DCAI L3 tx
resolved            BOOL    DEFAULT false
correct             BOOL
custom_verdict      TEXT    -- 'correct' | 'partially_correct' | 'incorrect' (custom only)
custom_score        INT     -- 0-100 AI evaluation score (custom only)
beat_ai             BOOL
crowd_champion      BOOL    -- true if user picked the most-chosen option
created_at          TIMESTAMP
```

### `users`
```sql
id              TEXT PRIMARY KEY  -- wallet address (from Privy)
display_name    TEXT
reputation_score INT
accuracy        FLOAT
streak          INT
rank            INT
on_chain_synced BOOL
```

### `analyses`
Stores multi-agent analysis per story × option. Shared for preset options (cached). Unique per custom prediction.
```sql
id              TEXT PRIMARY KEY
story_id        TEXT REFERENCES stories(id)
option_id       TEXT        -- NULL if custom
prediction_id   TEXT        -- set if custom (links to specific user prediction)
is_custom       BOOL        DEFAULT false
factors         TEXT[]
evidence        JSONB       -- [{title, year, relevance}]
reasoning       TEXT
status          TEXT        -- 'pending' | 'ready'
created_at      TIMESTAMP
```

### `simulations`
Cached simulation results. Preset options share one simulation; custom predictions each have their own.
```sql
id              TEXT PRIMARY KEY
story_id        TEXT REFERENCES stories(id)
option_id       TEXT        -- NULL if custom
prediction_id   TEXT        -- set if custom
role_key        TEXT
is_custom       BOOL        DEFAULT false
short_term      TEXT        -- Short-term event description
short_emoji     TEXT
mid_term        TEXT        -- Mid-term event description
mid_emoji       TEXT
long_term       TEXT        -- Long-term event description
long_emoji      TEXT
created_at      TIMESTAMP
```

---

## Blockchain Integration — DCAI L3

### Concepts (read this first)

**Blockchain** — A public database nobody can edit or delete. Every transaction is permanent and visible to anyone. DCAI L3 is the specific blockchain FutureLens writes to.

**Wallet** — Your identity on the blockchain. Has two parts:
- Public address (e.g. `0x71C4...976F`) — like a username, share freely
- Private key — like a password, never share, never commit to git

FutureLens uses two wallets:
| Wallet | Owner | Purpose |
|--------|-------|---------|
| Admin wallet | The team (developer) | Deploy contract, resolve stories, mint badges |
| User wallet | Each user (via Privy) | Sign `registerPrediction()` transactions |

**Chain ID** — A unique number identifying which blockchain your wallet is connected to. DCAI L3 Testnet = `18441`. You enter this when adding the network to MetaMask.

**RPC** — The server your app talks to in order to read/write the blockchain. DCAI's RPC is at `http://139.180.140.143/rpc/`. It requires an API key (get from organiser at workshop) to prevent abuse.

**tDCAI** — The gas token on DCAI L3 Testnet. Every transaction costs a tiny amount of tDCAI. It is free — claim from the faucet. No real money involved.

**Gas fees** — What you pay (in tDCAI) per transaction:
| Action | tDCAI cost |
|--------|-----------|
| Deploy contract | ~0.14 tDCAI |
| `registerPrediction()` | ~0.03 tDCAI |
| `recordOutcome()` | ~0.03 tDCAI |
| `mintBadge()` | ~0.03 tDCAI |

**Faucet** — A free dispenser of tDCAI. Claim 1 tDCAI per hour. A few claims before the hackathon covers all 48 hours of transactions.

**Full cost summary:**
| Thing | Real money |
|-------|-----------|
| All on-chain transactions | Free (tDCAI from faucet) |
| Contract deployment | Free (tDCAI from faucet) |
| Claude AI calls | ~$1–5 total |
| Supabase / Privy / Vercel | Free tier |

---

### DCAI L3 Network Details

| Field | Value |
|-------|-------|
| Chain ID | `18441` |
| Gas token | `tDCAI` |
| Block time | ~2 seconds |
| Explorer | `http://139.180.140.143/` |
| Faucet | `http://139.180.140.143/faucet/` |
| RPC | `http://139.180.140.143/rpc/` *(API key required — get from organiser)* |
| WebSocket | `ws://139.180.140.143/ws/` *(API key required)* |

**Claim tDCAI before hackathon starts:**
```bash
curl -X POST http://139.180.140.143/faucet/request \
  -H 'Content-Type: application/json' \
  -d '{"address":"0xYOUR_ADMIN_WALLET"}'
# returns: { "ok": true, "txHash": "0x..." }
```

**Pre-deployed contracts (already live, free to use):**
| Contract | Address | Use |
|----------|---------|-----|
| `OperatorRegistry` | `0xb37c81eBC4b1B4bdD5476fe182D6C72133F41db9` | Operator registration |
| `MerkleRewardDistributor` | `0x728f2C63b9A0ff0918F5ffB3D4C2d004107476B7` | Reward payouts in tDCAI |

**What to get from organiser at workshop:**
- RPC API key (`L3_RPC_API_KEY`)
- Confirm chain ID and RPC URL are still `18441` / `http://139.180.140.143/rpc/`
- Ask about the starter kit (pre-built contract templates)

---

### What Goes On-Chain
| Data | Who calls | Method |
|------|-----------|--------|
| Prediction hash | User (via Privy wallet) | `registerPrediction()` |
| Story outcome | Backend admin wallet | `recordOutcome()` |
| Reputation points | Backend admin wallet | `updateReputation()` |
| Badge (SBT) | Backend admin wallet | `mintBadge()` |

### What Stays Off-Chain
- Full story content, AI outputs, narrative scenes, raw user data

---

### Smart Contract — Full Solidity

Deploy this to DCAI L3. Owner = team's deployer wallet.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract FutureLensRegistry {

    // ── Structs ──────────────────────────────────────────────
    struct Prediction {
        bytes32 predictionHash;
        uint8   confidence;      // 1-100
        uint256 timestamp;
        bool    exists;
    }

    struct Outcome {
        bytes32 outcomeHash;
        uint256 timestamp;
        bool    exists;
    }

    struct UserScore {
        uint256 totalPredictions;
        uint256 correctPredictions;
        uint256 reputationScore;
    }

    // ── Storage ──────────────────────────────────────────────
    address public owner;

    // user → storyHash → Prediction
    mapping(address => mapping(bytes32 => Prediction)) public predictions;

    // storyHash → Outcome
    mapping(bytes32 => Outcome) public outcomes;

    // user → UserScore
    mapping(address => UserScore) public scores;

    // user → badgeId → earned
    mapping(address => mapping(uint8 => bool)) public badges;

    // ── Events ───────────────────────────────────────────────
    event PredictionRegistered(
        address indexed user,
        bytes32 indexed storyHash,
        bytes32 predictionHash,
        uint8   confidence,
        uint256 timestamp
    );
    event OutcomeRecorded(bytes32 indexed storyHash, bytes32 outcomeHash, uint256 timestamp);
    event ReputationUpdated(address indexed user, uint256 newScore);
    event BadgeMinted(address indexed user, uint8 badgeId);

    // ── Modifiers ────────────────────────────────────────────
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    // ── User-callable ────────────────────────────────────────

    /// Called by user's wallet when they lock a prediction
    function registerPrediction(
        bytes32 storyHash,
        bytes32 predictionHash,
        uint8   confidence
    ) external {
        require(!predictions[msg.sender][storyHash].exists, "Already predicted");
        require(confidence >= 1 && confidence <= 100, "Confidence must be 1-100");
        require(!outcomes[storyHash].exists, "Story already resolved");

        predictions[msg.sender][storyHash] = Prediction({
            predictionHash: predictionHash,
            confidence:     confidence,
            timestamp:      block.timestamp,
            exists:         true
        });

        scores[msg.sender].totalPredictions++;

        emit PredictionRegistered(msg.sender, storyHash, predictionHash, confidence, block.timestamp);
    }

    // ── Owner-callable (backend admin wallet) ────────────────

    /// Called by backend after story resolves — locks the outcome on-chain
    function recordOutcome(bytes32 storyHash, bytes32 outcomeHash) external onlyOwner {
        require(!outcomes[storyHash].exists, "Already resolved");
        outcomes[storyHash] = Outcome({ outcomeHash: outcomeHash, timestamp: block.timestamp, exists: true });
        emit OutcomeRecorded(storyHash, outcomeHash, block.timestamp);
    }

    /// Called by backend after verifying a user's prediction was correct
    function updateReputation(address user, uint256 points) external onlyOwner {
        scores[user].reputationScore += points;
        scores[user].correctPredictions++;
        emit ReputationUpdated(user, scores[user].reputationScore);
    }

    /// Mint a non-transferable badge (SBT pattern — no transfer function)
    function mintBadge(address user, uint8 badgeId) external onlyOwner {
        require(!badges[user][badgeId], "Already has badge");
        badges[user][badgeId] = true;
        emit BadgeMinted(user, badgeId);
    }

    // ── View functions ───────────────────────────────────────

    function getPrediction(address user, bytes32 storyHash)
        external view returns (bytes32, uint8, uint256)
    {
        Prediction memory p = predictions[user][storyHash];
        return (p.predictionHash, p.confidence, p.timestamp);
    }

    function getOutcome(bytes32 storyHash)
        external view returns (bytes32, uint256)
    {
        Outcome memory o = outcomes[storyHash];
        return (o.outcomeHash, o.timestamp);
    }

    function getUserScore(address user)
        external view returns (uint256 total, uint256 correct, uint256 reputation)
    {
        UserScore memory s = scores[user];
        return (s.totalPredictions, s.correctPredictions, s.reputationScore);
    }

    function hasBadge(address user, uint8 badgeId) external view returns (bool) {
        return badges[user][badgeId];
    }
}
```

Badge IDs: `1 = Analyst`, `2 = Strategist`, `3 = Oracle`

---

### Deployment — Remix IDE (browser, no install)

1. Go to **remix.ethereum.org**
2. Create new file → paste the contract above
3. Compile: Solidity compiler tab → `0.8.20` → Compile
4. Deploy: Deploy tab → Environment: **Injected Provider (MetaMask)**
5. In MetaMask: switch network to DCAI L3
   - Network name: `DCAI L3 Testnet`
   - RPC URL: `http://139.180.140.143/rpc/`
   - Chain ID: `18441`
   - Explorer: `http://139.180.140.143/`
6. Click **Deploy** → confirm in MetaMask
7. Copy the deployed contract address → paste into `.env.local` as `NEXT_PUBLIC_REGISTRY_ADDRESS`
8. **Save the deployer wallet's private key** → also goes in `.env.local` as `ADMIN_PRIVATE_KEY`

The deployer wallet = contract owner = the wallet that can call `recordOutcome`, `updateReputation`, `mintBadge`.

---

### Two Signing Contexts

**1. User signs `registerPrediction()` — via Privy wallet (frontend)**
```ts
// User's Privy-connected wallet signs this
import { useWallets } from '@privy-io/react-auth'

const { wallets } = useWallets()
const wallet = wallets[0]
const provider = await wallet.getEthereumProvider()
const ethersProvider = new ethers.BrowserProvider(provider)
const signer = await ethersProvider.getSigner()

const contract = new ethers.Contract(REGISTRY_ADDRESS, ABI, signer)
const tx = await contract.registerPrediction(storyHash, predictionHash, confidence)
const receipt = await tx.wait()
// receipt.hash = the txHash to show in proof card
```

**2. Admin signs `recordOutcome()` / `updateReputation()` / `mintBadge()` — backend wallet (server-side)**
```ts
// Server-side only — private key never sent to client
import { ethers } from 'ethers'

const provider = new ethers.JsonRpcProvider(process.env.L3_RPC_URL)
const adminWallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider)
const contract = new ethers.Contract(REGISTRY_ADDRESS, ABI, adminWallet)

// Called from /api/admin/resolve
await contract.recordOutcome(storyHash, outcomeHash)

// Called from /api/admin/resolve after checking predictions
await contract.updateReputation(userAddress, points)
await contract.mintBadge(userAddress, badgeId)
```

---

### Story Resolution Flow — `/api/admin/resolve`

Called manually by the team (curl / Postman) the night before demo.

```
POST /api/admin/resolve
Headers: x-admin-key: <ADMIN_SECRET from .env>
Body: { storyId: "strait-of-hormuz", outcomeId: "de-escalation" }
```

What it does:
1. Verify `x-admin-key` matches `ADMIN_SECRET` in env
2. Set `stories.status = 'resolved'`, `stories.resolved_outcome = outcomeId` in DB
3. Compute `outcomeHash = keccak256(storyId + outcomeId)`
4. Call `contract.recordOutcome(storyHash, outcomeHash)` from admin wallet
5. For each correct prediction: call `contract.updateReputation()` + `contract.mintBadge()` if criteria met
6. Return `{ txHash, outcomeHash }`

---

### Chain Config
```ts
export const CHAIN_CONFIG = {
  chainId: 18441,
  chainName: "DCAI L3 Testnet",
  rpcUrl: "http://139.180.140.143/rpc/",   // requires API key from organizer
  blockExplorer: "http://139.180.140.143/",
  nativeCurrency: { name: "tDCAI", symbol: "tDCAI", decimals: 18 },
}
```

**Gas token:** `tDCAI` — free from faucet. Zero real cost.
**Block time:** ~2 seconds.
**RPC:** Protected — get API key from organizer at workshop. Add as `L3_RPC_API_KEY` in `.env.local`.
**WebSocket:** `ws://139.180.140.143/ws/` — also needs API key. Use for real-time tx confirmation.

### Faucet
```bash
# Check status
curl http://139.180.140.143/faucet/

# Claim 1 tDCAI (1-hour cooldown per address)
curl -X POST http://139.180.140.143/faucet/request \
  -H 'Content-Type: application/json' \
  -d '{"address":"0xYOUR_ADMIN_WALLET"}'
```
Claim immediately to fund your admin/deployer wallet before the hackathon starts.

### Pre-Deployed Contracts (use these — already audited)

| Contract | Address | Use in FutureLens |
|----------|---------|-------------------|
| `OperatorRegistry` | `0xb37c81eBC4b1B4bdD5476fe182D6C72133F41db9` | Operator/participant registration |
| `MerkleRewardDistributor` | `0x728f2C63b9A0ff0918F5ffB3D4C2d004107476B7` | **Reputation rewards — use instead of building own** |

### MerkleRewardDistributor — Reputation Rewards
Instead of writing your own `updateReputation()`, use the pre-deployed distributor:

1. After a story resolves, your backend computes who earned what points
2. Build a Merkle tree of `(address → points)` pairs
3. Publish the Merkle root to the distributor contract (owner call)
4. Users call `claim()` with their Merkle proof to receive tDCAI rewards on-chain

This means correct predictions earn **real tDCAI tokens**, not just off-chain points. Much stronger demo.

### What You Still Deploy Yourself
`FutureLensRegistry` — for storing prediction hashes. The pre-deployed contracts don't support this use case.

### Contract ABI (minimal — for frontend use)
```ts
export const REGISTRY_ABI = [
  "function registerPrediction(bytes32 storyHash, bytes32 predictionHash, uint8 confidence) external",
  "function getPrediction(address user, bytes32 storyHash) external view returns (bytes32, uint8, uint256)",
  "function getOutcome(bytes32 storyHash) external view returns (bytes32, uint256)",
  "function getUserScore(address user) external view returns (uint256, uint256, uint256)",
  "function hasBadge(address user, uint8 badgeId) external view returns (bool)",
  "event PredictionRegistered(address indexed user, bytes32 indexed storyHash, bytes32 predictionHash, uint8 confidence, uint256 timestamp)",
]
```

---

### Transaction UX — Optimistic UI
1. User clicks **Lock Prediction on L3**
2. Frontend hashes locally: `keccak256(address + storyId + optionId + confidence + ts)`
3. Backend stores prediction in DB (instant)
4. Show L3 animation: "Hashing... Submitting..." (pure theatre, 1s)
5. Show proof card as **"Pending confirmation"** with the local hash
6. Background: wallet signs → `registerPrediction()` → wait for receipt
7. Update proof card to **"✅ Confirmed"** with real `txHash`

User sees the proof card immediately, confirmation trickles in behind. No blocking wait.

### Shareable Proof Card
Generated via `html2canvas` on the proof card div:
- Scenario title + user's prediction + confidence %
- Timestamp + truncated txHash
- DCAI L3 badge + `"Verify: explorer.dcai-l3.skybutter.com/tx/0x..."`

Social hook: _"I called it. Here's the proof."_

---

## Wallet Auth — Privy

Replace raw MetaMask with **Privy** for maximum accessibility:
- Users log in with Google / Twitter / email / MetaMask
- Embedded wallet created automatically for non-crypto users
- Real wallet address used for hashing on-chain

```ts
import { usePrivy } from '@privy-io/react-auth'
const { login, authenticated, user } = usePrivy()
const address = user?.wallet?.address
```

Critical for demos — judges may not have MetaMask installed.

---

## Oracle's Archive (Demo Critical)

A dedicated page showing **2-3 pre-resolved stories** with:
- Full story + what users predicted + what happened
- On-chain proof per prediction (real txHashes, submitted before demo)
- Clickable "View on Explorer" links

This is the strongest proof-of-concept. Judges verify the system works end-to-end by clicking through to the block explorer themselves.

---

## Design Tokens

| Token | Value |
|-------|-------|
| Background | `#fefdf1` (Warm Paper) |
| Primary | `#336f54` (Forest Green) |
| Tertiary | `#915700` (Ochre) |
| Headline font | Plus Jakarta Sans |
| Body/narrative font | Newsreader (serif) |
| Card radius | `2rem` (radius-lg) |
| No borders | Use tonal surface layers, never 1px solid lines |

See `design_system.md` for full token set and component rules.

---

## Security
- Hash before on-chain: never expose raw wallet + choice combos
- Validate all inputs server-side
- Contract owner restricted to `recordOutcome`, `updateReputation`, `mintBadge`
- Privy handles auth — no custom session management needed

## Performance
- Cache AI outputs per scenario in DB — same story = instant load, no AI latency
- Pre-generate all demo scenario content before presentation
- Optimistic UI hides L3 confirmation latency
- Short structured prompts — keep token counts low

---

## End-to-End Data Flow

```
1.  GNews API → Claude → new scenario stored in DB
2.  User logs in via Privy (email/Google/MetaMask)
3.  User reads Chronicle → clicks scenario
4.  Selects role → fetches pre-generated role-aware choices from DB
5.  In-game narrative fetched from DB → rendered as typewriter effect (frontend only, no SSE)
6.  User selects prediction + confidence
7.  Backend hashes: keccak256(address + storyId + choiceId + confidence + ts)
8.  Optimistic UI shows proof card immediately
9.  Wallet signs → registerPrediction() on DCAI L3 → txHash stored in DB
10. AI simulates outcome (role-influenced Day 1/3/7)
11. Multi-agent analysis runs (3 personas → Judge synthesis)
12. Proof card updated with confirmed txHash
13. When story resolves: updateReputation() + mintBadge() on-chain
14. Oracle's Archive shows full verified history
```

---

## .env.local
```
# DCAI L3 — public (safe to expose to frontend)
NEXT_PUBLIC_L3_CHAIN_ID=18441
NEXT_PUBLIC_L3_RPC_URL=http://139.180.140.143/rpc/
NEXT_PUBLIC_L3_EXPLORER=http://139.180.140.143/
NEXT_PUBLIC_REGISTRY_ADDRESS=0x...              # your deployed FutureLensRegistry

# DCAI L3 — server only (NEVER expose to frontend)
L3_RPC_API_KEY=...                              # get from organizer at workshop
ADMIN_PRIVATE_KEY=0x...                         # deployer wallet private key

# Pre-deployed DCAI L3 contracts (already live)
MERKLE_REWARD_DISTRIBUTOR=0x728f2C63b9A0ff0918F5ffB3D4C2d004107476B7
OPERATOR_REGISTRY=0xb37c81eBC4b1B4bdD5476fe182D6C72133F41db9

# AI
ANTHROPIC_API_KEY=sk-ant-...

# News
GNEWS_API_KEY=...

# Auth
NEXT_PUBLIC_PRIVY_APP_ID=...

# Admin
ADMIN_SECRET=some-random-secret-string          # guards /api/admin/resolve
```

---

## 48-Hour Build Plan

### Day 1 — Core Flow
| Time | Task |
|------|------|
| Morning | Privy auth, DB setup, 2-3 pre-built scenarios (AI pre-generated) |
| Afternoon | In-game visual novel UI (full-bleed bg, portrait, speech bubble, streaming text) |
| Night | Decision screen UI, prediction API, optimistic L3 tx, proof card |

### Day 2 — Depth + Polish
| Time | Task |
|------|------|
| Morning | Role-influenced simulation, multi-agent analysis, outcome page |
| Afternoon | Oracle's Archive (pre-resolved story + real txHashes), shareable proof card image |
| Night | Profile/leaderboard, on-chain badges, demo rehearsal |

### Demo Sequence (3 min target)
1. Show Chronicle → "this is from today's news"
2. Select role → enter in-game narrative → watch text stream
3. Pick prediction + confidence → click Lock → show L3 animation
4. Show proof card → "this hash is now permanent on DCAI L3"
5. Show Oracle's Archive → click explorer link → real on-chain data
6. _"No one can claim they predicted something after it happens — except here."_
