/**
 * claude.ts — Multi-agent analysis using DeepSeek (OpenAI-compatible API)
 *
 * Architecture: 3 parallel personas → 3 refinement calls → 1 judge synthesis
 * Total: 7 calls (3 + 3 + 1)
 *
 * Returns: { factors, evidence, reasoning }
 */

import OpenAI from 'openai'

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
})

const MODEL = 'deepseek-chat'

export interface AnalysisOutput {
  factors: string[]
  evidence: Array<{ title: string; year: string; relevance: string }>
  reasoning: string
}

interface PersonaAnalysis {
  persona: 'pessimist' | 'optimist' | 'realist'
  analysis: string
}

// ── Round 1 — 3 parallel persona analyses ────────────────────────────────────

async function runPersona(
  persona: 'pessimist' | 'optimist' | 'realist',
  storyTitle: string,
  storyContext: string,
  predictionText: string
): Promise<PersonaAnalysis> {
  const systemPrompts: Record<typeof persona, string> = {
    pessimist:
      'You are a geopolitical risk analyst with a systematic-risk lens. You focus on worst-case scenarios, cascading failures, structural vulnerabilities, and how historical crises repeated themselves. Be direct, analytical, and specific.',
    optimist:
      'You are a strategic analyst focused on resilience, recovery, and upside scenarios. You surface historical precedents of de-escalation, economic opportunity in crisis, and human adaptability. Be direct, analytical, and specific.',
    realist:
      'You are a data-driven intelligence analyst who relies strictly on historical precedent, base rates, and empirical evidence. You avoid both doom and optimism. Cite specific events, years, and outcomes. Be direct, analytical, and specific.',
  }

  const prompt = `GEOPOLITICAL SCENARIO:
${storyTitle}

CONTEXT:
${storyContext}

USER PREDICTION:
"${predictionText}"

Analyse this prediction from your analytical perspective. Identify:
1. 2-3 key causal factors that make this prediction plausible or implausible
2. 1-2 relevant historical precedents (with years)
3. Your overall assessment of the prediction's validity

Respond in 3-4 concise paragraphs. No preamble.`

  const msg = await deepseek.chat.completions.create({
    model: MODEL,
    max_tokens: 600,
    messages: [
      { role: 'system', content: systemPrompts[persona] },
      { role: 'user', content: prompt },
    ],
  })

  return {
    persona,
    analysis: msg.choices[0].message.content ?? '',
  }
}

// ── Round 2 — Each persona refines after reading the others ──────────────────

async function refinePersona(
  base: PersonaAnalysis,
  others: PersonaAnalysis[]
): Promise<string> {
  const othersText = others
    .map(o => `[${o.persona.toUpperCase()}]\n${o.analysis}`)
    .join('\n\n')

  const prompt = `You are the ${base.persona} analyst. You have just read two other analysts' assessments:

${othersText}

Here was your original analysis:
${base.analysis}

Now refine your analysis in 2 paragraphs. Acknowledge any valid points from the others and sharpen your own argument where you disagree. No preamble.`

  const msg = await deepseek.chat.completions.create({
    model: MODEL,
    max_tokens: 400,
    messages: [{ role: 'user', content: prompt }],
  })

  return msg.choices[0].message.content ?? ''
}

// ── Round 3 — Judge synthesises all 6 outputs ─────────────────────────────────

async function synthesise(
  round1: PersonaAnalysis[],
  round2: string[],
  storyTitle: string,
  predictionText: string
): Promise<AnalysisOutput> {
  const allAnalyses = round1
    .map(
      (r, i) =>
        `[${r.persona.toUpperCase()} — Initial]\n${r.analysis}\n\n[${r.persona.toUpperCase()} — Refined]\n${round2[i]}`
    )
    .join('\n\n---\n\n')

  const prompt = `You are a senior intelligence judge synthesising three analysts' debate on a geopolitical prediction.

SCENARIO: ${storyTitle}
PREDICTION: "${predictionText}"

ANALYST DEBATE:
${allAnalyses}

Your task: produce a final synthesis as valid JSON with exactly this shape:
{
  "factors": ["factor 1", "factor 2", "factor 3"],
  "evidence": [
    { "title": "Event Name", "year": "YYYY", "relevance": "One sentence" },
    { "title": "Event Name", "year": "YYYY", "relevance": "One sentence" }
  ],
  "reasoning": "2-3 sentence synthesis that acknowledges the debate and gives the most defensible verdict on the prediction."
}

Rules:
- factors: exactly 3 items, short noun phrases
- evidence: exactly 2 historical examples with real years
- reasoning: balanced, direct, no hedging
Output JSON only. No markdown. No backticks.`

  const msg = await deepseek.chat.completions.create({
    model: MODEL,
    max_tokens: 600,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'You are a senior intelligence judge. Output only valid JSON — no markdown, no backticks, no explanation.',
      },
      { role: 'user', content: prompt },
    ],
  })

  const raw = (msg.choices[0].message.content ?? '').trim()
  return JSON.parse(raw) as AnalysisOutput
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function runMultiAgentAnalysis(
  storyTitle: string,
  storyContext: string,
  predictionText: string
): Promise<AnalysisOutput> {
  // Round 1 — 3 parallel personas
  const round1 = await Promise.all([
    runPersona('pessimist', storyTitle, storyContext, predictionText),
    runPersona('optimist', storyTitle, storyContext, predictionText),
    runPersona('realist', storyTitle, storyContext, predictionText),
  ])

  // Round 2 — each persona refines after reading the others (parallel)
  const round2 = await Promise.all(
    round1.map((p, i) => refinePersona(p, round1.filter((_, j) => j !== i)))
  )

  // Round 3 — judge synthesis
  return synthesise(round1, round2, storyTitle, predictionText)
}
