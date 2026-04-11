import { NextResponse } from 'next/server'
import { db } from '@/db'
import { stories, predictions } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { hashStory, hashOutcome } from '@/lib/blockchain'
import {
  recordOutcomeOnChain,
  updateReputationOnChain,
  mintBadgeOnChain,
  BADGE_IDS,
} from '@/lib/admin-blockchain'

export async function POST(request: Request) {
  // ── Auth check ──────────────────────────────────────────────────────────────
  const adminKey = request.headers.get('x-admin-key')
  if (!adminKey || adminKey !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (!body || !body.storyId || !body.outcomeId) {
    return NextResponse.json(
      { error: 'Missing storyId or outcomeId' },
      { status: 400 }
    )
  }

  const { storyId, outcomeId } = body as { storyId: string; outcomeId: string }

  // ── 1. Mark story resolved in DB ────────────────────────────────────────────
  await db
    .update(stories)
    .set({ status: 'resolved', resolvedOutcome: outcomeId })
    .where(eq(stories.id, storyId))

  // ── 2. Hash and record outcome on-chain ─────────────────────────────────────
  const storyHash = hashStory(storyId)
  const outcomeHash = hashOutcome(storyId, outcomeId)

  let outcomeTxHash: string | null = null
  try {
    outcomeTxHash = await recordOutcomeOnChain(storyHash, outcomeHash)
    // Store txHash in stories row
    await db
      .update(stories)
      .set({ txHash: outcomeTxHash })
      .where(eq(stories.id, storyId))
  } catch (err) {
    console.error('[resolve] recordOutcome failed:', err)
  }

  // ── 3. Mark correct predictions + award reputation + badge ─────────────────
  const storyPredictions = await db
    .select()
    .from(predictions)
    .where(eq(predictions.storyId, storyId))

  const correctUsers: string[] = []

  for (const pred of storyPredictions) {
    const isCorrect = pred.optionId === outcomeId
    await db
      .update(predictions)
      .set({ resolved: true, correct: isCorrect })
      .where(eq(predictions.id, pred.id))

    if (isCorrect && pred.userAddress && pred.userAddress !== 'demo-user') {
      correctUsers.push(pred.userAddress)
      // +15 reputation points for a correct prediction
      try {
        await updateReputationOnChain(pred.userAddress, 15)
      } catch (err) {
        console.error(`[resolve] updateReputation failed for ${pred.userAddress}:`, err)
      }
      // Mint Analyst badge (id=1) for first correct prediction
      try {
        await mintBadgeOnChain(pred.userAddress, BADGE_IDS.analyst)
      } catch {
        // User may already have the badge — ignore
      }
    }
  }

  return NextResponse.json({
    ok: true,
    storyId,
    outcomeId,
    outcomeHash,
    outcomeTxHash,
    correctPredictions: correctUsers.length,
    totalPredictions: storyPredictions.length,
  })
}
