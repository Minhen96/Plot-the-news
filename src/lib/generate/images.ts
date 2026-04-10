/**
 * images.ts
 *
 * Handles all image generation for FutureLens stories.
 *
 * generateStoryImages  — respects GENERATE_IMAGES env flag
 *   GENERATE_IMAGES=true  → calls FAL.ai at story creation time
 *   GENERATE_IMAGES=false → returns Picsum placeholders instantly (no API cost)
 *
 * generateFalImages    — always calls FAL.ai, ignores env flag
 *   Used by POST /api/stories/[id]/generate-images (on-demand, after story created)
 *
 * FAL.ai models:
 *   - Panel 1: fal-ai/flux/schnell (fast, cheap)
 *   - Panels 2–N: fal-ai/flux-pro/v1/redux with panel 1 as style reference (visual consistency)
 *   - Portraits: fal-ai/flux-realism (one per role)
 *   - Cover: Unsplash photo search, falls back to Picsum
 */
import { fal } from "@fal-ai/client";

fal.config({ credentials: process.env.FAL_KEY });

export interface GeneratedImages {
  coverUrl: string;
  panelUrls: string[];
  portraitUrls: string[];
}

function usePlaceholders(): boolean {
  return process.env.GENERATE_IMAGES !== "true";
}

function picsumImages(
  panels: { bgPrompt: string }[],
  roles: { portraitPrompt: string }[],
  existingCoverUrl?: string
): GeneratedImages {
  return {
    coverUrl: existingCoverUrl ?? `https://picsum.photos/seed/cover/1200/630`,
    panelUrls: panels.map((_, i) => `https://picsum.photos/seed/panel${i}/1920/1080`),
    portraitUrls: roles.map((_, i) => `https://picsum.photos/seed/portrait${i}/512/768`),
  };
}

/**
 * Always calls FAL.ai — used by the on-demand generate-images route.
 * Does not check GENERATE_IMAGES env flag.
 */
export async function generateFalImages(
  panels: { bgPrompt: string }[],
  roles: { portraitPrompt: string }[],
  coverImageQuery: string,
  existingCoverUrl?: string
): Promise<GeneratedImages> {
  const [coverUrl, ...portraitUrls] = await Promise.all([
    existingCoverUrl
      ? Promise.resolve(existingCoverUrl)
      : fetchUnsplashImage(coverImageQuery).then(
          (url) => url ?? `https://picsum.photos/seed/cover/1200/630`
        ),
    ...roles.map((role) => fetchFalPortrait(role.portraitPrompt)),
  ]);

  const panel1Url = await fetchFalPanel(panels[0].bgPrompt);
  const remainingUrls: string[] = [];
  for (const panel of panels.slice(1)) {
    remainingUrls.push(await fetchFalPanelWithReference(panel.bgPrompt, panel1Url));
  }

  return {
    coverUrl,
    panelUrls: [panel1Url, ...remainingUrls],
    portraitUrls,
  };
}

/**
 * Respects GENERATE_IMAGES env flag — used by the story creation route.
 * Returns Picsum placeholders when flag is false (no API cost during dev).
 */
export async function generateStoryImages(
  panels: { bgPrompt: string }[],
  roles: { portraitPrompt: string }[],
  coverImageQuery: string,
  existingCoverUrl?: string
): Promise<GeneratedImages> {
  if (usePlaceholders()) {
    return picsumImages(panels, roles, existingCoverUrl);
  }
  return generateFalImages(panels, roles, coverImageQuery, existingCoverUrl);
}

async function fetchFalPanel(prompt: string): Promise<string> {
  const result = await fal.subscribe("fal-ai/flux/schnell", {
    input: { prompt, image_size: { width: 1920, height: 1080 }, num_images: 1 },
  });
  return (result.data as any).images[0].url;
}

async function fetchFalPanelWithReference(
  prompt: string,
  referenceUrl: string
): Promise<string> {
  const result = await fal.subscribe("fal-ai/flux-pro/v1/redux", {
    input: { prompt, image_url: referenceUrl, image_size: { width: 1920, height: 1080 }, num_images: 1 },
  });
  return (result.data as any).images[0].url;
}

async function fetchFalPortrait(prompt: string): Promise<string> {
  const result = await fal.subscribe("fal-ai/flux-realism", {
    input: { prompt, image_size: { width: 512, height: 768 }, num_images: 1 },
  });
  return (result.data as any).images[0].url;
}

async function fetchUnsplashImage(query: string): Promise<string | null> {
  if (!process.env.UNSPLASH_ACCESS_KEY) return null;
  const res = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
    { headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` } }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.results?.[0]?.urls?.regular ?? null;
}
