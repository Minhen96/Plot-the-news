/**
 * images.ts
 *
 * Handles all image generation for FutureLens stories.
 *
 * When GENERATE_IMAGES=true  → uses FAL.ai (real AI-generated images)
 *   - Panel 1: fal-ai/flux/schnell (fast, cheap)
 *   - Panels 2–N: fal-ai/flux-pro/v1/redux with panel 1 as style reference (visual consistency)
 *   - Portraits: fal-ai/flux-realism (one per role)
 *   - Cover: Unsplash photo search, falls back to Picsum
 *
 * When GENERATE_IMAGES=false → returns Picsum placeholder URLs instantly (no API cost)
 *   Use POST /api/stories/[id]/generate-images to trigger real image generation later.
 *
 * Used by: src/app/api/stories/generate/route.ts
 *          src/app/api/stories/[id]/generate-images/route.ts
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

/**
 * Placeholder image generator (used when GENERATE_IMAGES=false)
 */
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
 * Main image generation function
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

  // Portraits + cover in parallel
  const [coverUrl, ...portraitUrls] = await Promise.all([
    existingCoverUrl
      ? Promise.resolve(existingCoverUrl)
      : fetchUnsplashImage(coverImageQuery).then(
        (url) => url ?? `https://picsum.photos/seed/cover/1200/630`
      ),
    ...roles.map((role) => fetchFalPortrait(role.portraitPrompt)),
  ]);

  // Panel 1 as base style, panels 2–N reference panel 1 for consistency
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
 * Fetch a single panel image using FAL.ai (fast model)
 */
async function fetchFalPanel(prompt: string): Promise<string> {
  const result = await fal.subscribe("fal-ai/flux/schnell", {
    input: { prompt, image_size: { width: 1920, height: 1080 }, num_images: 1 },
  });
  return (result.data as any).images[0].url;
}

/**
 * Fetch a panel image using FAL.ai with reference image for style consistency
 */
async function fetchFalPanelWithReference(
  prompt: string,
  referenceUrl: string
): Promise<string> {
  const result = await fal.subscribe("fal-ai/flux-pro/v1/redux", {
    input: { prompt, image_url: referenceUrl, image_size: { width: 1920, height: 1080 }, num_images: 1 },
  });
  return (result.data as any).images[0].url;
}

/**
 * Fetch a portrait image using FAL.ai (realism model)
 */
async function fetchFalPortrait(prompt: string): Promise<string> {
  const result = await fal.subscribe("fal-ai/flux-realism", {
    input: { prompt, image_size: { width: 512, height: 768 }, num_images: 1 },
  });
  return (result.data as any).images[0].url;
}

/**
 * Fetch a cover image using Unsplash search (fallback to Picsum)
 */
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
