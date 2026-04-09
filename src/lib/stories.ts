import { Story } from "@/lib/types";
import { db } from "@/db";
import { stories } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

/**
 * Fetches all stories from Supabase using Drizzle
 */
export async function getAllStories(): Promise<Story[]> {
  const result = await db
    .select()
    .from(stories)
    .orderBy(desc(stories.createdAt));

  return result.map(mapDbStoryToType);
}

/**
 * Fetches a single story by ID
 */
export async function getStoryById(id: string): Promise<Story | undefined> {
  const [result] = await db
    .select()
    .from(stories)
    .where(eq(stories.id, id))
    .limit(1);

  return result ? mapDbStoryToType(result) : undefined;
}

/**
 * Upserts a story (for admin/crawlers) using Drizzle
 */
export async function upsertStory(story: Story): Promise<void> {
  await db.insert(stories).values({
    id: story.id,
    title: story.title,
    category: story.category,
    summary: story.summary,
    coverEmoji: story.coverEmoji,
    date: story.date,
    predictionCount: story.predictionCount,
    consensusOption: story.consensusOption,
    controversyScore: story.controversyScore,
    status: story.status,
    resolvedOutcome: story.resolvedOutcome,
    panels: story.panels,
    cliffhanger: story.cliffhanger,
    predictionOptions: story.predictionOptions,
    historicalEvidence: story.historicalEvidence,
  }).onConflictDoUpdate({
    target: stories.id,
    set: {
      title: story.title,
      category: story.category,
      summary: story.summary,
      coverEmoji: story.coverEmoji,
      date: story.date,
      predictionCount: story.predictionCount,
      consensusOption: story.consensusOption,
      controversyScore: story.controversyScore,
      status: story.status,
      resolvedOutcome: story.resolvedOutcome,
      panels: story.panels,
      cliffhanger: story.cliffhanger,
      predictionOptions: story.predictionOptions,
      historicalEvidence: story.historicalEvidence,
    }
  });
}

/**
 * Helper to map DB row to TypeScript interface
 */
function mapDbStoryToType(s: any): Story {
  return {
    id: s.id,
    title: s.title,
    category: s.category,
    summary: s.summary,
    coverEmoji: s.coverEmoji,
    date: s.date,
    predictionCount: s.predictionCount || 0,
    consensusOption: s.consensusOption,
    controversyScore: s.controversyScore || 0,
    status: (s.status as "active" | "resolved") || "active",
    resolvedOutcome: s.resolvedOutcome,
    panels: (s.panels as any) || [],
    cliffhanger: s.cliffhanger || "",
    predictionOptions: (s.predictionOptions as any) || [],
    historicalEvidence: (s.historicalEvidence as any) || [],
  };
}
