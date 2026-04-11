import { fal } from "@fal-ai/client";
import { GeneratedImages } from "../types";

fal.config({ credentials: process.env.FAL_KEY });

function usePlaceholders(): boolean {
  return process.env.GENERATE_IMAGES !== "true";
}

function picsumImages(
  panels: { bgPrompt?: string }[],
  roles: { portraitPrompt?: string }[],
  existingCoverUrl?: string
): GeneratedImages {
  return {
    coverUrl: existingCoverUrl ?? `https://picsum.photos/seed/cover/1200/630`,
    panelUrls: panels.map((_, i) => `https://picsum.photos/seed/panel${i}/1920/1080`),
    portraitUrls: roles.map((_, i) => `https://picsum.photos/seed/portrait${i}/512/768`),
  };
}

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
