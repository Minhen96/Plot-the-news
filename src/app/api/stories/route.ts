import { NextResponse } from "next/server";
import { demoStories } from "@/data/stories";
import { getStoryPredictionStats } from "@/lib/predictions";

export async function GET() {
  const stories = demoStories.map((story) => {
    const stats = getStoryPredictionStats(story.id);
    return {
      id: story.id,
      title: story.title,
      category: story.category,
      summary: story.summary,
      coverEmoji: story.coverEmoji,
      date: story.date,
      predictionCount: stats.totalPredictions + story.predictionCount,
      controversyScore: story.controversyScore,
      status: story.status,
      panelCount: story.panels.length,
      optionCount: story.predictionOptions.length,
    };
  });

  return NextResponse.json(stories);
}
