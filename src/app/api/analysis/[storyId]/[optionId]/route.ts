import { NextResponse } from 'next/server'
import { db } from '@/db'
import { analyses } from '@/db/schema'
import { and, eq } from 'drizzle-orm'
import { getStoryById } from '@/lib/stories'
import { getStory } from '@/data/stories'
import { runMultiAgentAnalysis } from '@/lib/generate/claude'

interface RouteParams {
  params: Promise<{ storyId: string; optionId: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
  const { storyId, optionId } = await params

  // Check DB for existing analysis
  let existing: (typeof analyses.$inferSelect) | undefined
  try {
    const [row] = await db
      .select()
      .from(analyses)
      .where(and(eq(analyses.storyId, storyId), eq(analyses.optionId, optionId)))
      .limit(1)
    existing = row
  } catch {
    // DB table may not exist yet — treat as no analysis
  }

  if (existing?.status === 'ready') {
    return NextResponse.json({
      status: 'ready',
      factors: existing.factors ?? [],
      evidence: existing.evidence ?? [],
      reasoning: existing.reasoning ?? '',
    })
  }

  if (existing?.status === 'pending') {
    return NextResponse.json({ status: 'pending' })
  }

  // ── No existing record: start analysis asynchronously ────────────────────
  // Insert a pending record first so duplicate requests don't spawn extra jobs
  let analysisId: string | null = null
  try {
    const [inserted] = await db
      .insert(analyses)
      .values({ storyId, optionId, status: 'pending' })
      .returning()
    analysisId = inserted.id
  } catch {
    // Table not yet created — return pending and let the caller retry
    return NextResponse.json({ status: 'pending' })
  }

  // Run analysis in the background (fire-and-forget from the response context)
  runAnalysisInBackground(storyId, optionId, analysisId)

  return NextResponse.json({ status: 'pending' })
}

async function runAnalysisInBackground(
  storyId: string,
  optionId: string,
  analysisId: string
) {
  try {
    const story = getStory(storyId) ?? await getStoryById(storyId).catch(() => undefined)
    if (!story) return

    const option = story.predictionOptions.find(o => o.id === optionId)
    const predictionText = option ? `${option.label}: ${option.description}` : optionId
    const storyContext = story.historicalContext ?? story.summary ?? ''

    const result = await runMultiAgentAnalysis(story.title, storyContext, predictionText)

    await db
      .update(analyses)
      .set({
        factors: result.factors,
        evidence: result.evidence,
        reasoning: result.reasoning,
        status: 'ready',
      })
      .where(eq(analyses.id, analysisId))
  } catch (err) {
    console.error('[analysis] background run failed:', err)
    // Leave status as 'pending' — caller can retry later
  }
}
