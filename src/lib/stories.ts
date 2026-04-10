import {
  Story,
  Role,
  Scene,
  Directive,
  SimulationPhase,
  HistoricalEvidence,
  Reference,
} from "@/lib/types";
import { db } from "@/db";
import { stories } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getAllStories(): Promise<Story[]> {
  const result = await db
    .select()
    .from(stories)
    .orderBy(desc(stories.createdAt));

  return result.map(mapDbStoryToType);
}

export async function getStoryById(id: string): Promise<Story | undefined> {
  const [result] = await db
    .select()
    .from(stories)
    .where(eq(stories.id, id))
    .limit(1);

  return result ? mapDbStoryToType(result) : undefined;
}

export async function upsertStory(story: Story): Promise<void> {
  const values = {
    id: story.id,
    title: story.title,
    summary: story.summary,
    category: story.category,
    imageUrl: story.imageUrl,
    date: story.date,
    status: story.status,
    crisisLevel: story.crisisLevel ?? null,
    coverEmoji: story.coverEmoji ?? null,
    articleBody: story.articleBody,
    historicalContext: story.historicalContext,
    historicalEvidence: story.historicalEvidence ?? null,
    references: story.references ?? [],
    roles: story.roles,
    panels: story.panels,
    predictionOptions: story.predictionOptions,
    cliffhanger: story.cliffhanger ?? null,
    resolvedTimeline: story.resolvedTimeline ?? null,
    resolvedOutcome: story.resolvedOutcome ?? null,
    txHash: story.txHash ?? null,
    predictionCount: story.predictionCount ?? 0,
    consensusOption: story.consensusOption ?? null,
    controversyScore: story.controversyScore ?? 0,
  };

  await db
    .insert(stories)
    .values(values)
    .onConflictDoUpdate({ target: stories.id, set: values });
}

function mapDbStoryToType(s: any): Story {
  return {
    id: s.id,
    title: s.title,
    summary: s.summary || "",
    category: s.category,
    imageUrl: s.imageUrl || "",
    date: s.date || "",
    status: (s.status as "active" | "resolved") || "active",
    crisisLevel: s.crisisLevel ?? undefined,
    coverEmoji: s.coverEmoji ?? undefined,
    articleBody: (s.articleBody as string[]) || [],
    historicalContext: s.historicalContext || "",
    historicalEvidence: s.historicalEvidence as HistoricalEvidence | undefined,
    references: (s.references as Reference[]) || [],
    roles: (s.roles as Role[]) || [],
    panels: (s.panels as Scene[]) || [],
    predictionOptions: (s.predictionOptions as Directive[]) || [],
    cliffhanger: s.cliffhanger ?? undefined,
    resolvedTimeline: s.resolvedTimeline as SimulationPhase[] | undefined,
    resolvedOutcome: s.resolvedOutcome ?? undefined,
    txHash: s.txHash ?? undefined,
    predictionCount: s.predictionCount ?? 0,
    consensusOption: s.consensusOption ?? undefined,
    controversyScore: s.controversyScore ?? 0,
  };
}
