/**
 * POST /api/stories/[id]/generate-images
 *
 * Manual trigger to generate real FAL.ai images for a story that was saved
 * with Picsum placeholders (when GENERATE_IMAGES=false during development).
 *
 * Reads bgPrompt and portraitPrompt stored on panels/roles, calls FAL.ai,
 * then updates the story in DB with the real image URLs.
 *
 * Returns: { id, updated: true }
 */
import { NextRequest, NextResponse } from "next/server";
import { getStoryById, upsertStory } from "@/lib/stories";
import { generateStoryImages } from "@/lib/generate/images";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const story = await getStoryById(id);
  if (!story) {
    return NextResponse.json({ error: "Story not found" }, { status: 404 });
  }

  const panelPrompts = story.panels.map((p) => ({ bgPrompt: (p as any).bgPrompt ?? "" }));
  const rolePrompts = story.roles.map((r) => ({ portraitPrompt: (r as any).portraitPrompt ?? "" }));

  const { coverUrl, panelUrls, portraitUrls } = await generateStoryImages(
    panelPrompts,
    rolePrompts,
    story.title,
    story.imageUrl || undefined
  );

  const updatedStory = {
    ...story,
    imageUrl: coverUrl,
    roles: story.roles.map((role, i) => ({
      ...role,
      portraitUrl: portraitUrls[i] ?? role.portraitUrl,
    })),
    panels: story.panels.map((panel, i) => ({
      ...panel,
      backgroundUrl: panelUrls[i] ?? panel.backgroundUrl,
      characterPortrait:
        portraitUrls[(panel as any).characterIndex ?? 0] ?? panel.characterPortrait,
    })),
  };

  await upsertStory(updatedStory);

  return NextResponse.json({ id, updated: true });
}
