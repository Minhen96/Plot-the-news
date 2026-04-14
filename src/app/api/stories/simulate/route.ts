/**
 * POST /api/stories/simulate
 *
 * Generates (or returns cached) a 3-phase simulation timeline for a story + prediction.
 *
 * For preset options: checks story.simulations[optionId] cache first.
 *   - Demo story (strait-of-hormuz) uses hardcoded fallback if DeepSeek unavailable.
 *   - Caches result to DB for subsequent users who pick the same option.
 * For custom predictions: always generates fresh (each text is unique).
 *
 * Body: { storyId, optionId, optionLabel, roleId, isCustom? }
 * Returns: { timeline: SimulationPhase[], cached: boolean }
 */
import { NextResponse } from "next/server";
import { getStory } from "@/data/stories";
import { getStoryById } from "@/lib/stories";
import { getPredictionById, saveSimulatedTimeline } from "@/lib/predictions";
import { db } from "@/db";
import { stories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateSimulation } from "@/lib/generate";
import type { SimulationPhase } from "@/lib/types";

// Pre-built simulation data for the demo story — used when DeepSeek is unavailable
const DEMO_SIMULATIONS: Record<string, SimulationPhase[]> = {
  "de-escalation": [
    {
      phase: "short",
      label: "Short-term",
      timeframe: "Days 1-7",
      emoji: "🟡",
      probability: 74,
      operationalStatus: "Cooling Period",
      causalFactors: [
        "Backchannel naval deconfliction",
        "Swiss intermediary engagement",
      ],
      event:
        "The carrier groups hold position as backchannel communications are opened through Swiss intermediaries. Tehran's naval command orders its fast-attack vessels to withdraw 12 nautical miles from the median line. A fragile but real window of strategic silence opens over the Strait.",
    },
    {
      phase: "mid",
      label: "Mid-term",
      timeframe: "Weeks 1-12",
      emoji: "🟠",
      probability: 61,
      operationalStatus: "Diplomatic Momentum",
      causalFactors: [
        "European broker pressure",
        "Energy market stabilization",
      ],
      event:
        "Oil markets stabilize as the diplomatic channel produces a preliminary framework for naval deconfliction. European allies push for formal JCPOA-adjacent talks, gaining traction in Vienna. The Strait returns to monitored normalcy, though elevated tensions persist.",
    },
    {
      phase: "long",
      label: "Long-term",
      timeframe: "Year 1-3",
      emoji: "🔴",
      probability: 43,
      operationalStatus: "Structural Realignment",
      causalFactors: [
        "Maritime protocol codification",
        "Regional security architecture shift",
      ],
      event:
        "A new maritime protocol is signed, codifying rules of engagement for both navies in the Persian Gulf. The Strait of Hormuz becomes the first formally deconflicted waterway in modern naval history — a fragile peace that reshapes the architecture of Middle Eastern security for a generation.",
    },
  ],
  "show-of-force": [
    {
      phase: "short",
      label: "Short-term",
      timeframe: "Days 1-7",
      emoji: "🟡",
      probability: 78,
      operationalStatus: "Active Deterrence",
      causalFactors: [
        "Synchronized carrier maneuvers",
        "B-52 strategic flyover",
      ],
      event:
        "Three carrier groups execute synchronized maneuvers at the Strait entrance as B-52s conduct flybys from Diego Garcia. Iran broadcasts a counter-exercise. Crude markets spike 4% — the message has been received, and no shots have been fired.",
    },
    {
      phase: "mid",
      label: "Mid-term",
      timeframe: "Weeks 1-12",
      emoji: "🟠",
      probability: 55,
      operationalStatus: "Counter-Escalation",
      causalFactors: [
        "Iranian enrichment acceleration",
        "Allied lobbying pressure",
      ],
      event:
        "Tehran accelerates uranium enrichment to 84% purity, framing it as a response to Western intimidation. Three allied nations quietly lobby Washington to stand down. The naval standoff holds, but the diplomatic cost begins to mount rapidly.",
    },
    {
      phase: "long",
      label: "Long-term",
      timeframe: "Year 1-3",
      emoji: "🔴",
      probability: 38,
      operationalStatus: "New Strategic Doctrine",
      causalFactors: [
        "Precedent normalization",
        "Iranian coastal missile doctrine",
      ],
      event:
        "The show of force becomes a precedent — annual naval exercises now define the geopolitical rhythm of the Gulf. Iran develops a hardened coastal missile doctrine. The Strait remains open, but the era of unchallenged U.S. maritime supremacy in the Gulf is permanently altered.",
    },
  ],
  "economic-pressure": [
    {
      phase: "short",
      label: "Short-term",
      timeframe: "Days 1-7",
      emoji: "🟡",
      probability: 71,
      operationalStatus: "Financial Siege",
      causalFactors: [
        "G7 asset freeze coordination",
        "Alternative corridor surge",
      ],
      event:
        "The G7 announces coordinated asset freezes targeting Iran's sovereign wealth reserves. Alternative LNG transit corridors through the Red Sea surge in utilization. Tehran's rial drops 18% against the dollar within 48 hours.",
    },
    {
      phase: "mid",
      label: "Mid-term",
      timeframe: "Weeks 1-12",
      emoji: "🟠",
      probability: 58,
      operationalStatus: "Sanctions Absorption",
      causalFactors: [
        "Chinese discount oil absorption",
        "European diversification acceleration",
      ],
      event:
        "China and Russia absorb Iranian oil at a 40% discount, partially insulating Tehran from sanctions. Global shipping insurers triple war-risk premiums for Gulf transits. Europe begins accelerating energy diversification — the squeeze is real but porous.",
    },
    {
      phase: "long",
      label: "Long-term",
      timeframe: "Year 1-3",
      emoji: "🔴",
      probability: 41,
      operationalStatus: "Fractured Outcome",
      causalFactors: [
        "Limited maritime agreement",
        "Hardened nuclear program",
      ],
      event:
        "Economic pressure produces a fractured outcome — Iran signs a limited maritime agreement but accelerates its nuclear program outside IAEA oversight. The Strait is preserved, but at the cost of a more isolated, more hardened Iran with an advanced enrichment capability.",
    },
  ],
};

const GENERIC_FALLBACK: SimulationPhase[] = [
  {
    phase: "short",
    label: "Short-term",
    timeframe: "Days 1-7",
    emoji: "🟡",
    probability: 72,
    operationalStatus: "Initial Response",
    causalFactors: ["Strategic execution", "Allied response"],
    event:
      "The immediate consequences of this strategic decision begin to ripple through the theatre of operations. Initial indicators suggest the choice is reshaping the balance of power in the region.",
  },
  {
    phase: "mid",
    label: "Mid-term",
    timeframe: "Weeks 1-12",
    emoji: "🟠",
    probability: 58,
    operationalStatus: "Developing Situation",
    causalFactors: ["Diplomatic realignment", "Economic adjustment"],
    event:
      "Regional actors respond to the strategic shift, recalibrating their positions across diplomatic and economic channels. The second-order effects are becoming increasingly visible.",
  },
  {
    phase: "long",
    label: "Long-term",
    timeframe: "Year 1-3",
    emoji: "🔴",
    probability: 44,
    operationalStatus: "New Equilibrium",
    causalFactors: ["Structural transformation", "Precedent establishment"],
    event:
      "The structural transformation of the geopolitical landscape is now evident. This decision will serve as a precedent — reshaping alliance structures and deterrence doctrines for a generation.",
  },
];

export async function POST(request: Request) {
  const body = await request.json();
  const { storyId, optionId, optionLabel, roleId, isCustom, predictionId } = body;

  if (!storyId || !optionId) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // If we have a predictionId, check if this prediction already has a cached timeline
  if (predictionId) {
    const existing = await getPredictionById(predictionId).catch(() => undefined);
    if (existing?.simulatedTimeline?.length) {
      return NextResponse.json({ timeline: existing.simulatedTimeline, cached: true });
    }
  }

  // Get story for context and cache check
  const story =
    getStory(storyId) ?? (await getStoryById(storyId).catch(() => undefined));

  if (!story) {
    return NextResponse.json({ error: "Story not found" }, { status: 404 });
  }

  // For preset options: check story-level cache (shared across all users)
  if (!isCustom) {
    const cached = (
      story.simulations as Record<string, SimulationPhase[]> | undefined
    )?.[optionId];
    if (cached?.length) {
      // Also backfill the prediction row so future visits skip this lookup
      if (predictionId) {
        saveSimulatedTimeline(predictionId, cached).catch(() => {});
      }
      return NextResponse.json({ timeline: cached, cached: true });
    }

    // Demo story: use hardcoded fallback (no DeepSeek needed for judges)
    if (storyId === "strait-of-hormuz" && DEMO_SIMULATIONS[optionId]) {
      const timeline = DEMO_SIMULATIONS[optionId];
      if (predictionId) {
        saveSimulatedTimeline(predictionId, timeline).catch(() => {});
      }
      return NextResponse.json({ timeline, cached: false });
    }
  }

  // Generate via DeepSeek
  try {
    const timeline = await generateSimulation(
      story.title,
      optionLabel ?? optionId,
      roleId ?? "analyst",
      story.cliffhanger
    );

    // Cache preset simulation at story level so all users who pick the same option benefit
    if (!isCustom) {
      const currentSims =
        (story.simulations as Record<string, SimulationPhase[]>) ?? {};
      const updated = { ...currentSims, [optionId]: timeline };
      await db
        .update(stories)
        .set({ simulations: updated })
        .where(eq(stories.id, storyId))
        .catch(() => {});
    }

    // Always save to the prediction row (custom predictions especially need this)
    if (predictionId) {
      saveSimulatedTimeline(predictionId, timeline).catch(() => {});
    }

    return NextResponse.json({ timeline, cached: false });
  } catch {
    // Fallback: demo story hardcoded data, or generic fallback
    if (storyId === "strait-of-hormuz" && DEMO_SIMULATIONS[optionId]) {
      const timeline = DEMO_SIMULATIONS[optionId];
      if (predictionId) {
        saveSimulatedTimeline(predictionId, timeline).catch(() => {});
      }
      return NextResponse.json({ timeline, cached: false });
    }
    return NextResponse.json({ timeline: GENERIC_FALLBACK, cached: false });
  }
}
