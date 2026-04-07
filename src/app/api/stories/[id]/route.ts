import { NextResponse } from "next/server";
import { getStoryById } from "@/data/stories";
import { getStoryPredictionStats } from "@/lib/predictions";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const story = getStoryById(id);

  if (!story) {
    return NextResponse.json({ error: "Story not found" }, { status: 404 });
  }

  const stats = getStoryPredictionStats(story.id);

  return NextResponse.json({
    ...story,
    stats,
  });
}
