import { NextResponse } from "next/server";
import { getStoryById } from "@/lib/stories";
import { getStoryPredictionStats } from "@/lib/predictions";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const story = await getStoryById(id);

  if (!story) {
    return NextResponse.json({ error: "Story not found" }, { status: 404 });
  }

  const stats = await getStoryPredictionStats(story.id);

  return NextResponse.json({ ...story, stats });
}
