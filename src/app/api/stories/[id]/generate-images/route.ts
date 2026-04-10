/**
 * POST /api/stories/[id]/generate-images
 *
 * On-demand FAL.ai image generation — called when a user hits the Play page
 * and the story still has Picsum placeholder images.
 *
 * Always calls FAL.ai regardless of the GENERATE_IMAGES env flag (force=true).
 * Falls back gracefully if FAL_KEY is missing (keeps existing URLs).
 *
 * Returns the updated panels and roles so PlayClient can swap images
 * without a page refresh.
 */
import { NextRequest, NextResponse } from "next/server";
import { getStory } from "@/data/stories";
import { getStoryById, upsertStory } from "@/lib/stories";
import { generateStoryImages } from "@/lib/generate/images";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const story =
    getStory(id) ?? (await getStoryById(id).catch(() => undefined));

  if (!story) {
    return NextResponse.json({ error: "Story not found" }, { status: 404 });
  }

  // Build prompts — use stored bgPrompt/portraitPrompt, fall back to dialogue/name
  const panelPrompts = story.panels.map((p) => ({
    bgPrompt:
      p.bgPrompt ??
      `Cinematic geopolitical scene: ${p.sectorBadge}. ${p.dialogue.slice(0, 120)}. Dramatic lighting, photorealistic.`,
  }));

  const rolePrompts = story.roles.map((r) => ({
    portraitPrompt:
      r.portraitPrompt ??
      `Cinematic portrait of ${r.name}, ${r.faction} leader, dramatic lighting, photorealistic`,
  }));

  const { coverUrl, panelUrls, portraitUrls } = await generateStoryImages(
    panelPrompts,
    rolePrompts,
    story.title,
    story.imageUrl || undefined,
    true  // force FAL.ai regardless of GENERATE_IMAGES env flag
  );

  // Update roles with new portrait URLs
  const updatedRoles = story.roles.map((role, i) => ({
    ...role,
    portraitUrl: portraitUrls[i] ?? role.portraitUrl,
  }));

  // Update panels: new background + match portrait to role by character name
  const updatedPanels = story.panels.map((panel, i) => {
    const matchingRoleIndex = story.roles.findIndex(
      (r) => r.name === panel.characterName
    );
    const roleIndex = matchingRoleIndex >= 0 ? matchingRoleIndex : 0;
    return {
      ...panel,
      backgroundUrl: panelUrls[i] ?? panel.backgroundUrl,
      characterPortrait: portraitUrls[roleIndex] ?? panel.characterPortrait,
    };
  });

  const updatedStory = {
    ...story,
    imageUrl: coverUrl,
    roles: updatedRoles,
    panels: updatedPanels,
  };

  await upsertStory(updatedStory).catch(() => {
    // Best-effort — if upsert fails (e.g. static story not in DB yet), still return images
  });

  return NextResponse.json({
    id,
    panels: updatedPanels,
    roles: updatedRoles,
    coverUrl,
  });
}
