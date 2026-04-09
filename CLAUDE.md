@AGENTS.md

---

# FutureLens — Project Instructions for Claude

## What This Project Is

FutureLens is a hackathon project (NottsHack 2026, 48 hours, DCAI sponsor prize 1800 USDT).
It combines AI-generated geopolitical scenarios, a visual novel game loop, and blockchain-verified predictions on DCAI L3 Testnet.

**One sentence:** Read editorial → pick a role → live a narrative → lock a prediction on-chain → see the AI-simulated future unfold.

---

## Always Read the Docs First

Before writing any code for a feature, read the relevant documentation file. Do not work from memory or assumptions — the docs are the source of truth for this project.

| What you're building | Read this first |
|----------------------|-----------------|
| Any UI screen / page flow | `docs/product_feature.md` |
| Design tokens, components, layout patterns | `docs/design_system.md` |
| AI prompts, DB schema, API routes, blockchain | `docs/tech.md` |
| Build order, priorities, demo script | `docs/build_guide.md` |

**Rule:** If what you're about to build touches design → open `design_system.md`. If it touches data → open `tech.md`. If it touches a screen → open `product_feature.md`. Do not skip this step.

---

## Reference Designs

Every screen has an HTML prototype in `reference/stitch design/`. Before building any page, read the corresponding `code.html`:

| Screen | Reference file |
|--------|----------------|
| Chronicle Hub | `reference/stitch design/the_daily_chronicle_america_vs._iran_edition/code.html` |
| Article View | `reference/stitch design/article_the_shadow_of_the_crescent/code.html` |
| Role Selection | `reference/stitch design/role_selection_america_vs._iran/code.html` |
| In-Game Narrative | `reference/stitch design/in_game_the_strait_crisis/code.html` |
| Community Directives | `reference/stitch design/in_game_community_directives/code.html` |
| Loading Simulation | `reference/stitch design/loading_strategic_simulation/code.html` |
| Short-term Outcome | `reference/stitch design/in_game_short_term_outcome/code.html` |
| Mid-term Outcome | `reference/stitch design/in_game_mid_term_outcome/code.html` |
| Long-term Outcome | `reference/stitch design/in_game_long_term_outcome/code.html` |
| User Profile | `reference/stitch design/user_profile_futurelens_journal/code.html` |

**Rule:** Match the reference design closely. Colors, spacing, font weights, component shapes — these are not suggestions.

---

## Always Explain Before Implementing

Before writing any code, state:

1. **What you're about to build** — the specific screen, component, or function
2. **Which docs/reference files you read** — confirms you checked the source of truth
3. **Your implementation plan** — what files you'll create/modify and why
4. **Any tradeoffs or decisions** — if there's more than one way, say which you chose and why

This ensures the developer always understands what is happening and can redirect before time is wasted.

Do not write a single line of code before this explanation is given and acknowledged (explicitly or implicitly).

---

## Quality Over Speed

This project is for a hackathon, but quality is the winning strategy — judges evaluate polish, not just feature count.

- **Do not rush to complete a feature** if the result is messy or fragile
- **Do not write placeholder logic** ("TODO: fix later") unless explicitly asked
- **One thing done perfectly** beats three things done badly
- If you are unsure how to implement something to a high standard, say so and discuss it rather than ship something weak

**The right question is not "how fast can I build this?" but "what is the cleanest way to build this?"**

---

## Code Quality Standards

### TypeScript
- All files are TypeScript. No `any` types unless absolutely unavoidable and commented.
- Define interfaces/types in `src/lib/types.ts` for shared data shapes.
- Use `type` for unions/primitives, `interface` for objects.

### React / Next.js
- Prefer **Server Components** by default. Only add `"use client"` when the component needs browser APIs, event handlers, or React state.
- Use `async/await` to unwrap `params` and `searchParams` in page components (they are Promises in Next.js 15).
- Do not put business logic inside page components — extract to utility functions or API routes.
- Keep page components thin: fetch data, pass to presentational components.

### Styling
- **Tailwind CSS v4** — define custom tokens in `globals.css` under `@theme`, not in a config file.
- Match `docs/design_system.md` exactly: colors, radius, typography, no hard borders.
- Never use `border` for structural dividers — use tonal surface layers.
- All narrative/dialogue text uses `font-body` (Newsreader). All UI text uses `font-headline` or `font-label` (Plus Jakarta Sans).

### Components
- One component per file. Name the file after the component.
- Components that are used on more than one page live in `src/components/`.
- Page-specific sub-components can live inline in the page file only if they are small (< 30 lines).
- Do not create a component for something that is used exactly once and is simple.

### API Routes
- All API routes return proper HTTP status codes.
- Validate inputs at the boundary (API route entry point).
- Wrap external calls (Claude, ethers.js) in try/catch. Return structured errors: `{ error: string }`.
- Never expose `ADMIN_PRIVATE_KEY` or `ADMIN_SECRET` to the client. These are server-only.

### State Between Pages
- Use `sessionStorage` (not `localStorage`) for temporary game state (selected role, prediction, simulation result).
- Clear session state when the user starts a new story.
- Never put sensitive data in sessionStorage.

### No Dead Code
- Do not leave commented-out code, `console.log` statements, or `TODO` comments in completed work.
- If something is removed, remove it completely.

---

## Project Conventions

### Branding
- `The Illuminated Editorial` — the fictional publication shown on Chronicle Hub, Article, Role Selection, In-Game, and Outcome screens
- `FutureLens` — the app name shown on the Loading Simulation screen and User Profile

### Color palette shortcuts
Key colors you'll use most:
- `primary` = `#336f54` (forest green) — CTAs, active states
- `tertiary` = `#915700` (ochre) — educational callouts, secondary badges
- `secondary` = `#3655e3` (blue) — secondary active states, intel analysis
- `background` / `surface` = `#fefdf1` (cream) — base canvas
- `on-background` / `on-surface` = `#353a26` (dark olive) — body text
- `surface-container` = `#f4f5e2` — card backgrounds
- `surface-container-lowest` = `#ffffff` — cards on top of containers

### Route structure
```
/                           Chronicle Hub
/story/[id]                 Article View
/story/[id]/role            Role Selection
/story/[id]/play            Visual Novel (typewriter narrative)
/story/[id]/predict         Community Directives (make prediction)
/story/[id]/outcome         Loading → Short → Mid → Long → Summary
/archive                    Oracle's Archive (pre-resolved stories)
/profile                    User Profile / Journal
```

### Data flow between pages
```
Role selected    → sessionStorage: { storyId, roleId }
Prediction made  → sessionStorage: { optionId, optionLabel, confidence, customText?, txHash }
Simulation done  → sessionStorage: { timeline: [...] }
```

---

## What "Done" Looks Like

A feature is done when:
1. It matches the reference design (visual fidelity)
2. It handles the happy path cleanly (no crashes on normal use)
3. It handles missing data gracefully (no white screens or unhandled errors)
4. TypeScript compiles without errors
5. No `console.log` or debug code left behind

A feature is **not** done if it only works in one specific scenario, has hardcoded values that should be dynamic, or looks noticeably different from the reference design.

---

## Demo Scenario

The primary demo scenario is **"The Shadow of the Crescent: America vs. Iran"** (Strait of Hormuz).
- Story ID: `strait-of-hormuz`
- This scenario must work end-to-end flawlessly before working on anything else
- Two roles: The Coalition (Western Interest) / The Regional Guard (Regional Sovereignty)
- Pre-generated narrative scenes, choices, and simulation data — no waiting for Claude at runtime

**Demo target: full flow completable in under 3 minutes by a judge who has never seen it before.**
