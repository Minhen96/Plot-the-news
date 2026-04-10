import { NextResponse } from "next/server";
import { getAllStories } from "@/lib/stories";
import { getStoryPredictionStats } from "@/lib/predictions";

export async function GET() {
  const storyList = await getAllStories();

  const result = await Promise.all(
    storyList.map(async (story) => {
      const stats = await getStoryPredictionStats(story.id);
      return {
        id: story.id,
        title: story.title,
        summary: story.summary,
        category: story.category,
        imageUrl: story.imageUrl,
        coverEmoji: story.coverEmoji,
        date: story.date,
        status: story.status,
        crisisLevel: story.crisisLevel,
        predictionCount: stats.totalPredictions,
        controversyScore: story.controversyScore,
      };
    })
  );

  return NextResponse.json(result);
}
