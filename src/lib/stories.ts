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
import { news, stories } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getAllStories(): Promise<Story[]> {
  const result = await db
    .select()
    .from(news)
    .innerJoin(stories, eq(stories.id, news.id))
    .orderBy(desc(news.createdAt));

  return result.map((r) => mapJoinToStory(r.news, r.stories));
}

export async function getStoryById(id: string): Promise<Story | undefined> {
  const [result] = await db
    .select()
    .from(news)
    .innerJoin(stories, eq(stories.id, news.id))
    .where(eq(news.id, id))
    .limit(1);

  return result ? mapJoinToStory(result.news, result.stories) : undefined;
}

export async function upsertStory(story: Story): Promise<void> {
  const newsValues = {
    id: story.id,
    title: story.title,
    summary: story.summary,
    imageUrl: story.imageUrl,
    date: story.date,
    category: story.category,
    sourceUrl: story.sourceUrl ?? null,
    crisisLevel: story.crisisLevel ?? null,
    coverEmoji: story.coverEmoji ?? null,
    cliffhanger: story.cliffhanger ?? null,
    articleBody: story.articleBody,
    historicalContext: story.historicalContext,
    historicalEvidence: story.historicalEvidence ?? null,
    refs: story.references ?? [],
  };

  const storyValues = {
    id: story.id,
    status: story.status,
    roles: story.roles,
    panels: story.panels,
    predictionOptions: story.predictionOptions,
    resolvedTimeline: story.resolvedTimeline ?? null,
    resolvedOutcome: story.resolvedOutcome ?? null,
    txHash: story.txHash ?? null,
    simulations: story.simulations ?? {},
    predictionCount: story.predictionCount ?? 0,
    consensusOption: story.consensusOption ?? null,
    controversyScore: story.controversyScore ?? 0,
  };

  await db
    .insert(news)
    .values(newsValues)
    .onConflictDoUpdate({ target: news.id, set: newsValues });

  await db
    .insert(stories)
    .values(storyValues)
    .onConflictDoUpdate({ target: stories.id, set: storyValues });
}

function mapJoinToStory(
  n: typeof news.$inferSelect,
  s: typeof stories.$inferSelect
): Story {
  return {
    id: n.id,
    title: n.title,
    summary: n.summary || "",
    imageUrl: n.imageUrl || "",
    date: n.date || "",
    category: n.category,
    sourceUrl: n.sourceUrl ?? undefined,
    crisisLevel: n.crisisLevel ?? undefined,
    coverEmoji: n.coverEmoji ?? undefined,
    cliffhanger: n.cliffhanger ?? undefined,
    articleBody: (n.articleBody as string[]) || [],
    historicalContext: n.historicalContext || "",
    historicalEvidence: n.historicalEvidence as HistoricalEvidence | undefined,
    references: (n.refs as Reference[]) || [],
    status: (s.status as "active" | "resolved") || "active",
    roles: (s.roles as Role[]) || [],
    panels: (s.panels as Scene[]) || [],
    predictionOptions: (s.predictionOptions as Directive[]) || [],
    resolvedTimeline: s.resolvedTimeline as SimulationPhase[] | undefined,
    resolvedOutcome: s.resolvedOutcome ?? undefined,
    txHash: s.txHash ?? undefined,
    simulations: s.simulations as Record<string, SimulationPhase[]> | undefined,
    predictionCount: s.predictionCount ?? 0,
    consensusOption: s.consensusOption ?? undefined,
    controversyScore: s.controversyScore ?? 0,
  };
}
