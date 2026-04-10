# FutureLens — Implementation Plan

> Generated: 2026-04-10. Covers the full pipeline from news ingestion to outcome screen.
> Compare this against current code to know exactly what to build vs what already exists.

---

## Image Strategy

### Why not Unsplash for panels?
Unsplash is photography — it looks like a news site, not a game. We need AI-generated cinematic art for visual novel panels.

| Service | Cost/image | Speed | Panel consistency | Notes |
|---------|-----------|-------|------------------|-------|
| **Unsplash** | Free | Instant | ❌ Photography only | Used for story covers only |
| Pollinations.ai | ~$0.001 | 2–5s | ❌ Each image independent | Considered, rejected |
| Stability AI | $0.003–0.04 | 3–8s | ❌ No native consistency | OK quality, poor DX |
| Replicate | $0.002–0.005 | 3–8s (cold starts) | ❌ Unreliable for demo | Too slow |
| **FAL.ai** ✅ | ~$0.003–0.04 | **1–2s** | ✅ IP-Adapter + Redux | **Chosen** |

### Decision: FAL.ai for panels + portraits, Unsplash for covers

**Why FAL.ai:**
- **Flux Pro Redux** — takes a reference image as style anchor, every panel looks like it belongs to the same story
- **IP-Adapter** — locks character face/appearance across panels (same character looks the same in scene 1 and scene 4)
- Rock-solid uptime — no risk of going down mid-demo
- 1–2s generation — fastest option
- $2 of free credits on signup, then ~$0.003–0.04/image

**Panel generation strategy (consistency):**
```
Panel 1 → fal-ai/flux/schnell (fast, cheap) → returns URL + image
Panel 2–N → fal-ai/flux-pro/v1/redux with panel_1_url as image_url → same style locked in
Character portraits → fal-ai/flux-realism (one per role, generated once)
```

This means all panels in a story share the same visual DNA — lighting, color palette, art direction carry through.

**Panel backgrounds** (1920×1080, cinematic):
- Model: `fal-ai/flux/schnell` for panel 1, `fal-ai/flux-pro/v1/redux` for panel 2+
- Prompt style: `"dramatic naval command center interior, holographic tactical displays, cinematic lighting, photorealistic, 8k"`

**Character portraits** (512×768, per role):
- Model: `fal-ai/flux-realism`
- Prompt style: `"dignified senior naval officer, formal military uniform, stern expression, cinematic portrait, photorealistic"`

**Story cover image** (on Article View page):
- If news article has `imageUrl` → use it directly (journalistic photo, appropriate here)
- If not → Unsplash search by category keywords
  ```
  https://api.unsplash.com/search/photos?query={keywords}&per_page=1&orientation=landscape
  ```
  Unsplash access key needed (free tier: 50 req/hr, register at unsplash.com/developers)

**Setup:**
```bash
npm install @fal-ai/client
```

**New env vars:**
```
FAL_KEY=...                 # from fal.ai dashboard → API Keys
UNSPLASH_ACCESS_KEY=...     # for cover image fallback only
```

---

## Current Code State

### What already exists ✅
| File | State |
|------|-------|
| `src/app/page.tsx` | Chronicle Hub — fetches live news from newsdata.io |
| `src/app/story/[id]/page.tsx` | Article View — handles static story OR `LiveArticleView` for news |
| `src/app/story/[id]/role/page.tsx` | Role Selection — reads static story, `RoleSelector` client component |
| `src/app/story/[id]/predict/page.tsx` | Stub — `StrategicInsights` only, no directive cards |
| `src/app/story/[id]/play/page.tsx` | Empty stub — `return <div />` |
| `src/app/story/[id]/outcome/page.tsx` | Empty stub — `return <div />` |
| `src/app/api/stories/route.ts` | Fixed — reads from DB via `getAllStories()` |
| `src/app/api/stories/[id]/route.ts` | Fixed — reads from DB via `getStoryById()` |
| `src/app/api/predict/route.ts` | Fixed — uses `story.predictionOptions`, awaits DB calls |
| `src/app/api/news/feed/route.ts` | Newsdata.io feed with 12h revalidate |
| `src/app/api/news/related/route.ts` | GNews related articles search |
| `src/components/ArticleLink.tsx` | Saves article to sessionStorage, links to `/story/${slug}` |
| `src/components/LiveArticleView.tsx` | Reads article from sessionStorage, shows live article |
| `src/components/RoleSelector.tsx` | Role card grid, saves `{ storyId, roleId }` to sessionStorage |
| `src/lib/stories.ts` | DB-backed `getAllStories`, `getStoryById`, `upsertStory` |
| `src/lib/predictions.ts` | DB-backed prediction CRUD |
| `src/lib/blockchain.ts` | Shell stubs for `hashPrediction`, `hashStory` |
| `src/lib/gnews/` | Full GNews API client |
| `src/lib/types.ts` | `Story`, `Scene`, `Directive`, `SimulationPhase`, etc. |
| `src/db/schema.ts` | `stories`, `predictions`, `profiles` tables |
| `src/data/stories.ts` | Static `strait-of-hormuz` story, `getStory(id)` |
| `src/lib/utils.ts` | `toStorySlug(title)` |

### What needs to be built 🔨
| File | Status | What |
|------|--------|------|
| `src/app/page.tsx` | **Rewrite** | Replace live news fetch with DB stories |
| `src/app/story/[id]/page.tsx` | **Update** | Add DB lookup fallback after static miss |
| `src/app/story/[id]/play/page.tsx` | **Build** | Full visual novel |
| `src/app/story/[id]/predict/page.tsx` | **Build** | Full directives + lock flow |
| `src/app/story/[id]/outcome/page.tsx` | **Build** | Loading → Short → Mid → Long → Summary |
| `src/components/PlayClient.tsx` | **Create** | Visual novel client logic |
| `src/components/DirectivesClient.tsx` | **Create** | Directives selection + lock animation |
| `src/components/OutcomeClient.tsx` | **Create** | All outcome phases |
| `src/app/api/stories/generate/route.ts` | **Create** | Claude + Pollinations, full story |
| `src/app/api/stories/generate-batch/route.ts` | **Create** | Cron target |
| `src/app/api/stories/simulate/route.ts` | **Create** | Simulation engine |
| `src/db/schema.ts` | **Update** | Add `sourceUrl`, `simulations` columns |
| `vercel.json` | **Create** | Cron schedule |

---

## Phase 0 — Schema Changes

### `src/db/schema.ts`
Add two columns to `stories` table:

```ts
sourceUrl: text('source_url'),            // original news article URL
simulations: jsonb('simulations').default({}), // { "optionId_roleId": SimulationPhase[] }
```

Run in Supabase SQL editor (no password needed, use the dashboard):
```sql
ALTER TABLE stories ADD COLUMN source_url text;
ALTER TABLE stories ADD COLUMN simulations jsonb DEFAULT '{}'::jsonb;
```

---

## Phase 1 — Story Generation Pipeline

### `src/app/api/stories/generate/route.ts` (POST)

**Input:**
```ts
{ headline: string, description: string, url: string, imageUrl?: string, source?: string }
```

**Step 1 — Deduplicate**
```ts
const existing = await db.select().from(stories).where(eq(stories.sourceUrl, url)).limit(1)
if (existing[0]) return NextResponse.json({ id: existing[0].id })
```

**Step 2 — Generate story ID**
```ts
import { toStorySlug } from '@/lib/utils'
const id = toStorySlug(headline) // already exists in utils.ts
```

**Step 3 — Claude call (single call, full story)**

Model: `claude-sonnet-4-6` (fast enough, good quality)

Prompt:
```
You are an editorial AI for a geopolitical simulation game called FutureLens.
Given this news article, generate a complete interactive scenario.

Headline: "${headline}"
Description: "${description}"

Return ONLY valid JSON, no markdown:
{
  "summary": "2-sentence dramatic lede",
  "articleBody": ["paragraph 1", "paragraph 2", "paragraph 3"],
  "historicalContext": "1-2 sentences of relevant historical fact",
  "historicalEvidence": {
    "title": "Historical event title",
    "quote": "2-sentence historical parallel",
    "summary": "1 sentence connecting past to present"
  },
  "cliffhanger": "1 dramatic sentence ending in a question",
  "category": "one of: Geopolitics, Finance, Technology, Climate, Security",
  "crisisLevel": <integer 0-100>,
  "coverImageQuery": "unsplash search query for the article cover photo",
  "roles": [
    {
      "id": "faction-a",
      "name": "Role name",
      "faction": "Faction label",
      "quote": "In-character quote starting with a double-quote",
      "stats": { "strategic": <0-100>, "stability": <0-100> },
      "keyPlayerStance": "e.g. Defensive / High Alert",
      "portraitPrompt": "Pollinations prompt for character portrait, realistic, cinematic"
    },
    { /* second role */ }
  ],
  "panels": [
    {
      "id": "scene-1",
      "characterIndex": 0,
      "sectorBadge": "Location name e.g. Eastern Basin Alpha",
      "dialogue": "2-3 sentence in-character monologue, dramatic, present tense",
      "bgPrompt": "Pollinations image prompt, cinematic, dramatic lighting, photorealistic, wide angle"
    },
    { "id": "scene-2", ... },
    { "id": "scene-3", ... }
  ],
  "predictionOptions": [
    {
      "id": "option-a",
      "label": "Short label (3-5 words)",
      "description": "1-2 sentence description of this strategic choice",
      "votes": <realistic vote count 3000-12000>,
      "proposedBy": "username like Stratos_Alpha",
      "popular": true
    },
    { "id": "option-b", "popular": false, ... },
    { "id": "option-c", "popular": false, ... }
  ]
}
```

**Step 4 — Fetch images**

Character portraits and panel 1 can run in parallel. Panels 2–N must run sequentially after panel 1 (need panel 1 URL as style reference).

```ts
import { fal } from '@fal-ai/client'

// Step 4a — portraits + panel 1 in parallel
const [coverImageUrl, ...portraits] = await Promise.all([
  imageUrl ? Promise.resolve(imageUrl) : fetchUnsplashImage(storyData.coverImageQuery),
  ...storyData.roles.map(role => fetchFalPortrait(role.portraitPrompt)),
])

// Step 4b — panel 1 (base style)
const panel1Url = await fetchFalPanel(storyData.panels[0].bgPrompt)

// Step 4c — panels 2–N using panel 1 as style reference (sequential for consistency)
const remainingPanelUrls: string[] = []
for (const panel of storyData.panels.slice(1)) {
  const url = await fetchFalPanelWithReference(panel.bgPrompt, panel1Url)
  remainingPanelUrls.push(url)
}
const panelUrls = [panel1Url, ...remainingPanelUrls]
```

Helper functions:
```ts
async function fetchFalPanel(prompt: string): Promise<string> {
  const result = await fal.subscribe('fal-ai/flux/schnell', {
    input: { prompt, image_size: { width: 1920, height: 1080 }, num_images: 1 }
  })
  return result.data.images[0].url
}

async function fetchFalPanelWithReference(prompt: string, referenceUrl: string): Promise<string> {
  const result = await fal.subscribe('fal-ai/flux-pro/v1/redux', {
    input: { prompt, image_url: referenceUrl, image_size: { width: 1920, height: 1080 }, num_images: 1 }
  })
  return result.data.images[0].url
}

async function fetchFalPortrait(prompt: string): Promise<string> {
  const result = await fal.subscribe('fal-ai/flux-realism', {
    input: { prompt, image_size: { width: 512, height: 768 }, num_images: 1 }
  })
  return result.data.images[0].url
}

async function fetchUnsplashImage(query: string): Promise<string | null> {
  if (!process.env.UNSPLASH_ACCESS_KEY) return null
  const res = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
    { headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` } }
  )
  const data = await res.json()
  return data.results?.[0]?.urls?.regular ?? null
}
```

FAL client config (in the route file, before use):
```ts
import { fal } from '@fal-ai/client'
fal.config({ credentials: process.env.FAL_KEY })
```

**Step 5 — Assemble Story and upsert**

Map Claude output + image URLs into a full `Story` object, then call `upsertStory()`.

Character portraits: each panel's `characterPortrait` = `portraitUrls[panel.characterIndex]`.
Panel `backgroundUrl` = `panelImageUrls[panelIndex]`.

**Step 6 — Return `{ id }`**

---

### `src/app/api/stories/generate-batch/route.ts` (GET)

Protected: checks `Authorization: Bearer ${process.env.CRON_SECRET}` header.

```ts
1. Fetch GNews top-headlines (world, max 10)
2. Filter: skip any whose URL already exists in DB (query sourceUrl)
3. Take first 3 new articles
4. Call /api/stories/generate for each (sequential to avoid Pollinations overload)
5. Return { generated: string[], skipped: number }
```

---

### `vercel.json` (create at project root)

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

Vercel Cron sends a `GET` with `Authorization: Bearer $CRON_SECRET` automatically (set in Vercel env vars).

---

### `src/app/api/stories/simulate/route.ts` (POST)

**Input:**
```ts
{ storyId: string, roleId: string, optionId: string, confidence: number, customText?: string }
```

**Caching check:**
```ts
const story = await getStoryById(storyId) // or getStory() from static data
const cacheKey = `${optionId}_${roleId}`
const cached = (story.simulations as Record<string, SimulationPhase[]>)?.[cacheKey]
if (cached) return NextResponse.json({ timeline: cached })
```

**Claude call — Simulation Engine (from build_guide.md):**
```
Scenario: ${story.summary}
User role: ${role.name} (${role.faction})
Prediction: ${customText ?? optionLabel}

Simulate 3 phases. Return JSON:
{
  "timeline": [
    { "phase": "short", "label": "Short-term", "timeframe": "Hours to days", "event": "...", "emoji": "🟡" },
    { "phase": "mid",   "label": "Mid-term",   "timeframe": "Weeks to months", "event": "...", "emoji": "🟠" },
    { "phase": "long",  "label": "Long-term",  "timeframe": "Months to years", "event": "...", "emoji": "🔴" }
  ]
}
```

**Cache result** (only for preset options, not custom):
```ts
if (!customText) {
  await db.update(stories)
    .set({ simulations: { ...story.simulations, [cacheKey]: timeline } })
    .where(eq(stories.id, storyId))
}
```

**Return:** `{ timeline: SimulationPhase[] }`

---

## Phase 2 — Chronicle Hub Rewrite

### `src/app/page.tsx` — Changes needed

**Current:** Fetches live news from newsdata.io, shows `NewsArticle[]` objects.

**New:** Reads `Story[]` from DB, renders the same card layout but with story data.

| Current field | Maps to |
|--------------|---------|
| `article.title` | `story.title` |
| `article.description` | `story.summary` |
| `article.image` | `story.imageUrl` |
| `article.publishedAt` | `story.date` |
| `article.source.name` | `story.category` |
| `ArticleLink` (saves to sessionStorage) | `<Link href={/story/${story.id}}>` directly |

**Remove:** All newsdata.io imports, `WORLD_FALLBACK`, `LAST_WEEK_FALLBACK`, `fetchLatestNews`, etc.

**Keep:** The existing card layout components (`LeadStory`, `SectionDivider`, etc.) — just feed them story data instead.

**New sections:** World stories (all active stories), Resolved stories sidebar ("The Week Before" → "Oracle's Archive preview").

---

## Phase 3 — Story Article Page Update

### `src/app/story/[id]/page.tsx` — Small change

**Current:** Tries `getStory(id)` (static data). If not found → shows `LiveArticleView` (reads from sessionStorage).

**New:** Add DB fallback between static and live:
```ts
const story = getStory(id) ?? await getStoryById(id) // DB lookup
if (!story) return <LiveArticleView slug={id} />     // sessionStorage fallback (keep for now)
```

This means all DB-generated stories work immediately without changing the page structure.

**`LiveArticleView`** — keep as-is for now. Will be removed once all articles go through the DB pipeline.

---

## Phase 4 — Play Page (Visual Novel)

### `src/app/story/[id]/play/page.tsx`

Server component. Reads story (static → DB fallback). Passes `panels` and `roles` to `PlayClient`.

```ts
export default async function PlayPage({ params }) {
  const { id } = await params
  const story = getStory(id) ?? await getStoryById(id)
  if (!story) notFound()
  return <PlayClient storyId={id} panels={story.panels} roles={story.roles} />
}
```

### `src/components/PlayClient.tsx` (NEW — "use client")

**State:**
```ts
currentPanel: number       // 0 → panels.length - 1
displayed: string          // typewriter accumulator
isTyping: boolean
role: Role | null          // read from sessionStorage on mount
```

**Typewriter effect:**
```ts
useEffect(() => {
  const full = panels[currentPanel].dialogue
  setDisplayed('')
  setIsTyping(true)
  let i = 0
  const interval = setInterval(() => {
    i++
    setDisplayed(full.slice(0, i))
    if (i >= full.length) { clearInterval(interval); setIsTyping(false) }
  }, 28)
  return () => clearInterval(interval)
}, [currentPanel])
```

**Click handler:**
```ts
function handleClick() {
  if (isTyping) {
    // Skip to full text
    setDisplayed(panels[currentPanel].dialogue)
    setIsTyping(false)
    return
  }
  if (currentPanel < panels.length - 1) {
    setCurrentPanel(p => p + 1)
  } else {
    router.push(`/story/${storyId}/predict`)
  }
}
```

**UI (matches reference `in_game_the_strait_crisis/code.html`):**
```
- Full-screen: <Image fill objectFit="cover" src={panel.backgroundUrl} className="grayscale-[20%] sepia-[10%]" />
- gradient overlay: from-[#fefdf1] via-transparent to-transparent opacity-40
- Top header: "The Illuminated Editorial" + nav links
- Bottom-left character: w-48 md:w-64 h-[400px], rounded-t-full, overflow-hidden
  - <Image src={role.portraitUrl or panel.characterPortrait} />
  - Name label below: bg-primary text-on-primary font-headline text-[9px] font-black px-3 py-1 rounded-full
- Speech bubble: bg-surface-container-lowest/90 backdrop-blur-xl p-8 md:p-10 rounded-2xl md:rounded-3xl
  - border-l-8 border-primary
  - font-body text-xl md:text-2xl leading-relaxed
  - Bottom-right: "CLICK TO CONTINUE" text + pulsing green dot (animate-pulse)
- Top-left sidebar: sector badge pill + "Current Sector" label
- Mobile bottom nav: Chronicle / Archive / Roles / Profile
```

---

## Phase 5 — Predict Page (Community Directives)

### `src/app/story/[id]/predict/page.tsx`

Server component. Passes `predictionOptions`, `cliffhanger`, last panel's character data.

```ts
const story = getStory(id) ?? await getStoryById(id)
if (!story) notFound()
const narrativePanel = story.panels[story.panels.length - 1]
return (
  <DirectivesClient
    storyId={id}
    predictionOptions={story.predictionOptions}
    narrativeDialogue={story.cliffhanger ?? narrativePanel?.dialogue ?? ''}
    characterName={narrativePanel?.characterName ?? 'The Analyst'}
    characterPortrait={narrativePanel?.characterPortrait ?? ''}
  />
)
```

### `src/components/DirectivesClient.tsx` (NEW — "use client")

**State:**
```ts
selectedId: string | null    // selected option id, or 'custom'
confidence: number           // 0-100, starts at 50
customText: string           // textarea value
lockPhase: null | 'hashing' | 'submitting' | 'locked'
role: { id, name } | null    // from sessionStorage
```

**UI (matches reference `in_game_community_directives/code.html`):**
```
Background: full-screen cinematic image + gradient overlay
Header:
  - "COMMUNITY DIRECTIVES" pill badge (bg-primary-container text-on-primary-container rounded-full)
  - "Strategic Consensus" h2 (font-headline text-4xl font-extrabold uppercase)
  - Subtext: "Real-time projections from the global intelligence network"

4-col grid (lg:grid-cols-4):
  LEFT: lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6
    - 3 DirectiveCard components:
      Most popular card:
        border-2 border-primary shadow-xl
        absolute badge: bg-primary text-white "-top-3 left-4" "MOST POPULAR" + "TRENDSETTER"
        SELECT button: bg-primary text-on-primary
      Other cards:
        border border-outline-variant/30 hover:border-secondary
        SELECT button: bg-surface-container hover:bg-secondary hover:text-white

  RIGHT: Author Directive card
    bg-surface-container/60 backdrop-blur-xl border border-primary/20 rounded-xl
    "AUTHOR DIRECTIVE" label with edit icon
    textarea → sets customText, also sets selectedId = 'custom'
    "SUBMIT TO NETWORK" green button

Confidence pill (bottom, rounded-full):
  bg-surface-container-low/80 backdrop-blur border border-outline-variant/10 rounded-full
  Left: "Confidence Level" label + range input (accent-primary)
  Right: "🔒 LOCK PREDICTION" (bg-on-surface text-surface hover:bg-primary)

Lock animation (replaces LOCK button after click):
  lockPhase='hashing'    → "Hashing prediction...    ▓▓▓░░░" (600ms)
  lockPhase='submitting' → "Submitting to L3...      ▓▓▓▓▓░" (600ms)
  lockPhase='locked'     → "✅ Locked  Proof ID: 0xA81F..." (800ms then navigate)

Narrative anchor (bottom):
  bg-surface-container-lowest/90 backdrop-blur border border-outline-variant/10 rounded-2xl
  Character portrait: w-24 h-24 rounded-full border-4 border-primary-container
  Dialogue: font-body text-xl md:text-2xl italic
```

**Lock flow:**
```ts
async function handleLock() {
  if (!selectedId && !customText) return
  const effectiveId = selectedId ?? 'custom'
  const effectiveLabel = selectedId
    ? predictionOptions.find(o => o.id === selectedId)?.label ?? ''
    : customText

  setLockPhase('hashing')
  await delay(600)
  setLockPhase('submitting')

  // Fire prediction to API (optimistic — don't block on result)
  const userAddress = wallet?.address ?? 'demo-user'
  const timestamp = Date.now()
  const predictionHash = hashPrediction(storyId, effectiveId, userAddress, timestamp)

  fetch('/api/predict', {
    method: 'POST',
    body: JSON.stringify({ storyId, optionId: effectiveId, userAddress, confidence, justification: customText }),
    headers: { 'Content-Type': 'application/json' }
  }) // fire-and-forget

  await delay(600)
  setLockPhase('locked')

  // Save to sessionStorage
  sessionStorage.setItem('game_prediction', JSON.stringify({
    storyId, roleId: role?.id, optionId: effectiveId,
    optionLabel: effectiveLabel, confidence,
    customText: effectiveId === 'custom' ? customText : undefined,
    txHash: predictionHash
  }))

  await delay(800)
  router.push(`/story/${storyId}/outcome`)
}
```

---

## Phase 6 — Outcome Page

### `src/app/story/[id]/outcome/page.tsx`

Server component — passes story data to `OutcomeClient`.

```ts
const story = getStory(id) ?? await getStoryById(id)
if (!story) notFound()
return <OutcomeClient storyId={id} story={story} />
```

### `src/components/OutcomeClient.tsx` (NEW — "use client")

**Phase machine:**
```ts
type Phase = 'loading' | 'short' | 'mid' | 'long' | 'summary'
const [phase, setPhase] = useState<Phase>('loading')
const [timeline, setTimeline] = useState<SimulationPhase[]>([])
const [progress, setProgress] = useState(0)
```

---

#### `loading` phase

**Header:** FutureLens branding (not "The Illuminated Editorial")

**Progress bar animation:**
```ts
useEffect(() => {
  // Fake progress: fast to 85%, then slow, waits for API
  const interval = setInterval(() => {
    setProgress(p => {
      if (p >= 85) return p + 0.3  // slow crawl
      return p + 2.5               // fast start
    })
  }, 150)
  return () => clearInterval(interval)
}, [])
```

**Simulate API call (fires immediately on mount):**
```ts
useEffect(() => {
  const prediction = JSON.parse(sessionStorage.getItem('game_prediction') ?? '{}')
  fetch('/api/stories/simulate', {
    method: 'POST',
    body: JSON.stringify({ storyId, roleId: prediction.roleId, optionId: prediction.optionId,
      confidence: prediction.confidence, customText: prediction.customText }),
    headers: { 'Content-Type': 'application/json' }
  })
  .then(r => r.json())
  .then(data => {
    setTimeline(data.timeline)
    // Wait for progress to reach 100 before advancing
    const waitForProgress = setInterval(() => {
      setProgress(p => {
        if (p >= 99) {
          clearInterval(waitForProgress)
          setTimeout(() => setPhase('short'), 500)
          return 100
        }
        return p + 1
      })
    }, 50)
  })
}, [])
```

**Intelligence Briefing Carousel:**
```ts
// Cards: story.historicalEvidence converted to 3 cards + 2 hardcoded facts
// Auto-rotates every 3 seconds
// Left/right chevron buttons
// Dot indicators
```

**UI (matches reference `loading_strategic_simulation/code.html`):**
```
Header: "FutureLens" (italic, text-primary, font-headline font-black text-2xl)
H1: "Generating Future" + <br/> + <span italic>Simulation...</span>
Progress bar:
  label: "Synthesizing Variables" + percentage number (text-primary font-black text-xl)
  bar: h-3 bg-gradient-to-r from-primary to-primary-container rounded-full
  animated stripe: bg-[linear-gradient(45deg,...)] bg-[length:20px_20px] animate-pulse
Carousel:
  bg-surface-container-low rounded-xl p-8 md:p-12 border border-outline-variant/10 shadow-lg
  Left/right chevron buttons (absolute -left-4 / -right-4)
  Category icon + label + headline + body text
  Dot indicators below
Status: pulsing green dot + "Neural Engine: Active Middle East Node"
```

---

#### `short` / `mid` / `long` phases

Uses `timeline[phaseIndex]` where phaseIndex = `{ short: 0, mid: 1, long: 2 }[phase]`.

**UI (matches reference `in_game_short_term_outcome/code.html`):**
```
Background: story.panels[2].backgroundUrl (or per-phase atmospheric image)
  + gradient: bg-gradient-to-t from-surface via-transparent to-transparent opacity-90

Fixed header: "The Illuminated Editorial" + Narrative / Map / Timeline tabs

Phase badge (center-top, floating):
  "CURRENT PHASE: SHORT-TERM OUTCOME (DAYS 1-7)"
  bg-tertiary-container text-on-tertiary-container rounded-full font-headline text-xs font-bold

Left sidebar (desktop only, fixed left):
  "Fleet Command" title + nav items (Intel / Diplomacy / War Room / Archive)
  "Next Phase" green button at bottom → advances to next phase

Right sidebar (desktop only, absolute right-8 top-28):
  Intel Analysis card:
    bg-surface-container-lowest/80 backdrop-blur-md p-6 rounded-lg border border-outline-variant/15
    Progress bar: "De-escalation Probability"
    Causal Factors bullet list (text-tertiary dots)
    Operational Status chip (bg-secondary/10 text-secondary)

Character portrait (absolute -top-32 left-12 w-48 h-48):
  overlaps the dialogue card from above
  drop-shadow-2xl

Dialogue card:
  bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/15
  Diamond notch: absolute left-24 -top-4 w-8 h-8 bg-surface-container-lowest rotate-45
  "THE ADMIRAL" in primary green + verified icon
  font-body text-xl md:text-2xl leading-relaxed (timeline event text)
  "CLICK TO CONTINUE →" button (bg-primary)

Mobile bottom nav: Narrative / Map / Timeline / Settings
```

**Phase navigation:**
```ts
function handleNextPhase() {
  const next = { short: 'mid', mid: 'long', long: 'summary' }[phase as 'short'|'mid'|'long']
  setPhase(next as Phase)
}
```

---

#### `summary` phase

```
On-chain verified badge + Proof ID (monospace txHash truncated)
Crowd Results: most-chosen option + percentage bar
Reputation: "+10 pts earned"  
CTAs: "Explore Next Story" → "/" + "Share Prediction Card"
```

---

## Session Storage Map

```ts
// Written by RoleSelector (already done)
sessionStorage.setItem('game_role', JSON.stringify({ storyId, roleId }))

// Written by DirectivesClient (to build)
sessionStorage.setItem('game_prediction', JSON.stringify({
  storyId, roleId, optionId, optionLabel, confidence, customText?, txHash
}))

// Written by OutcomeClient after simulate (to build)
sessionStorage.setItem('game_timeline', JSON.stringify({ timeline }))
```

> Note: `RoleSelector` currently writes `sessionStorage.setItem('selectedRole', ...)` — check the actual key name and align with the above.

---

## New Env Vars Needed

```
FAL_KEY=...                    # fal.ai dashboard → API Keys
UNSPLASH_ACCESS_KEY=...        # free, register at unsplash.com/developers
CRON_SECRET=...                # any random string, also set in Vercel dashboard
```

---

## Build Order (recommended)

| # | Task | Why this order |
|---|------|---------------|
| 1 | `npm install @fal-ai/client` + add `FAL_KEY` to `.env.local` | Unblocks image generation |
| 2 | Add `sourceUrl` + `simulations` columns in Supabase SQL editor | Unblocks everything |
| 3 | `/api/stories/generate` | Core pipeline |
| 4 | `/api/stories/generate-batch` + `vercel.json` | Cron infra |
| 5 | Update `page.tsx` (Chronicle Hub → DB) | Connects pipeline to UI |
| 6 | Update `story/[id]/page.tsx` (DB fallback) | Unblocks generated stories |
| 7 | `PlayClient.tsx` + `play/page.tsx` | P0 feature |
| 8 | `DirectivesClient.tsx` + `predict/page.tsx` | P0 feature |
| 9 | `/api/stories/simulate` | Required before outcome |
| 10 | `OutcomeClient.tsx` + `outcome/page.tsx` | P0 feature |
| 11 | Seed DB: run generate endpoint for `strait-of-hormuz` article | Demo readiness |
