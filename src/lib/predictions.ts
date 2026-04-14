import { Prediction, LeaderboardEntry, SimulationPhase } from "@/lib/types";
import { db } from "@/db";
import { predictions, profiles } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function addPrediction(
  prediction: Omit<Prediction, 'id'> & { id?: string }
): Promise<Prediction> {
  const [result] = await db
    .insert(predictions)
    .values({
      ...(prediction.id ? { id: prediction.id } : {}),
      storyId: prediction.storyId,
      userAddress: prediction.userAddress,
      optionId: prediction.optionId,
      optionLabel: prediction.optionLabel,
      confidence: prediction.confidence,
      justification: prediction.justification,
      timestamp: prediction.timestamp || Date.now(),
      txHash: prediction.txHash,
      resolved: prediction.resolved,
      correct: prediction.correct,
    })
    .returning();

  return mapDbPredictionToType(result);
}

/**
 * Gets a single prediction by its UUID
 */
export async function getPredictionById(id: string): Promise<Prediction | undefined> {
  const [result] = await db
    .select()
    .from(predictions)
    .where(eq(predictions.id, id))
    .limit(1);
  return result ? mapDbPredictionToType(result) : undefined;
}

/**
 * Saves the simulated outcome timeline against a prediction row
 */
export async function saveSimulatedTimeline(
  predictionId: string,
  timeline: SimulationPhase[]
): Promise<void> {
  await db
    .update(predictions)
    .set({ simulatedTimeline: timeline })
    .where(eq(predictions.id, predictionId));
}

/**
 * Gets all predictions for a specific story
 */
export async function getPredictionsForStory(storyId: string): Promise<Prediction[]> {
  const result = await db.select().from(predictions).where(eq(predictions.storyId, storyId));
  return result.map(mapDbPredictionToType);
}

/**
 * Gets all predictions for a specific user
 */
export async function getUserPredictions(userAddress: string): Promise<Prediction[]> {
  const result = await db
    .select()
    .from(predictions)
    .where(eq(predictions.userAddress, userAddress.toLowerCase()));
  return result.map(mapDbPredictionToType);
}

/**
 * Gets a user's prediction for a specific story
 */
export async function getUserPredictionForStory(
  userAddress: string,
  storyId: string
): Promise<Prediction | undefined> {
  const [result] = await db
    .select()
    .from(predictions)
    .where(
      and(
        eq(predictions.userAddress, userAddress.toLowerCase()),
        eq(predictions.storyId, storyId)
      )
    )
    .limit(1);

  return result ? mapDbPredictionToType(result) : undefined;
}

/**
 * Gets global leaderboard from profiles table
 */
export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const result = await db
    .select()
    .from(profiles)
    .orderBy(desc(profiles.reputationScore))
    .limit(50);

  return result.map((p) => ({
    address: p.walletAddress || "",
    displayName: p.displayName || `User ${p.walletAddress?.slice(0, 6)}`,
    totalPredictions: p.totalPredictions || 0,
    correctPredictions: p.correctPredictions || 0,
    accuracy: Number(p.accuracy) || 0,
    reputationScore: p.reputationScore || 0,
    streak: p.streak || 0,
    rank: p.rank || 0,
  }));
}

/**
 * Gets statistics for a story's predictions
 */
export async function getStoryPredictionStats(storyId: string) {
  const storyPredictions = await db
    .select()
    .from(predictions)
    .where(eq(predictions.storyId, storyId));
    
  const optionCounts: Record<string, number> = {};
  let totalConfidence = 0;

  for (const p of storyPredictions) {
    optionCounts[p.optionId] = (optionCounts[p.optionId] || 0) + 1;
    totalConfidence += p.confidence;
  }

  return {
    totalPredictions: storyPredictions.length,
    optionCounts,
    averageConfidence:
      storyPredictions.length > 0
        ? Math.round((totalConfidence / storyPredictions.length) * 10) / 10
        : 0,
  };
}

/**
 * Helper to map DB row to TypeScript interface
 */
function mapDbPredictionToType(p: any): Prediction {
  return {
    id: p.id,
    storyId: p.storyId,
    userAddress: p.userAddress,
    optionId: p.optionId,
    optionLabel: p.optionLabel,
    confidence: p.confidence,
    justification: p.justification,
    timestamp: p.timestamp ? Number(p.timestamp) : Date.now(),
    txHash: p.txHash,
    resolved: p.resolved || false,
    correct: p.correct === null ? undefined : p.correct,
    simulatedTimeline: p.simulatedTimeline ?? undefined,
  };
}
