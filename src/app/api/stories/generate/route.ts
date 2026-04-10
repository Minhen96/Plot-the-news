/**
 * POST /api/stories/generate
 *
 * Generates a full FutureLens story from a news article and saves it to DB.
 *
 * Flow:
 *   1. Deduplicate — if sourceUrl already exists in DB, return existing id
 *   2. Call DeepSeek with headline + description + scraped full content
 *   3. Fetch 2-3 related articles from GNews as story references
 *   4. Generate images (FAL.ai or Picsum depending on GENERATE_IMAGES env var)
 *   5. Assemble Story object and upsert into news + stories tables
 *
 * Called by: /api/stories/generate-batch (cron), or manually for seeding
 *
 * Body: { headline, description, url, imageUrl?, source?, fullContent? }
 * Returns: { id: string }
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { news } from "@/db/schema";
import { eq } from "drizzle-orm";
import { upsertStory } from "@/lib/stories";
import { toStorySlug } from "@/lib/utils";
import { generateStoryContent } from "@/lib/generate/deepseek";
import { generateStoryImages } from "@/lib/generate/images";
import { searchNews } from "@/lib/gnews";
import type { Story } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { headline, description, url, imageUrl, source, fullContent } = await req.json() as {
      headline: string;
      description: string;
      url: string;
      imageUrl?: string;
      source?: string;
      fullContent?: string | null;
    };

    if (!headline || !description || !url) {
      return NextResponse.json(
        { error: "headline, description, and url are required" },
        { status: 400 }
      );
    }

    // Deduplicate by sourceUrl
    const [existing] = await db
      .select({ id: news.id })
      .from(news)
      .where(eq(news.sourceUrl, url))
      .limit(1);

    if (existing) {
      return NextResponse.json({ id: existing.id });
    }

    const id = toStorySlug(headline);

    // Generate story content (DeepSeek gets full article text if available)
    const storyData = await generateStoryContent(headline, description, source, fullContent);

    // Fetch related articles from GNews as story references (best-effort)
    const gNewsRefs = await searchNews({
      q: headline.slice(0, 100),
      lang: "en",
      max: 3,
    }).then((res) =>
      res.articles.map((a) => ({
        title: a.title,
        source: a.source.name,
        url: a.url,
      }))
    ).catch(() => [] as { title: string; source: string; url: string }[]);

    // Merge GNews refs with any AI-generated refs (GNews takes priority)
    const refs = gNewsRefs.length > 0 ? gNewsRefs : (storyData.refs ?? []);

    // Generate images
    const { coverUrl, panelUrls, portraitUrls } = await generateStoryImages(
      storyData.panels,
      storyData.roles,
      storyData.coverImageQuery,
      imageUrl
    );

    // Assemble Story
    const story: Story = {
      id,
      title: headline,
      summary: storyData.summary,
      category: storyData.category,
      imageUrl: coverUrl,
      date: new Date().toISOString().split("T")[0],
      sourceUrl: url,
      crisisLevel: storyData.crisisLevel,
      coverEmoji: storyData.coverEmoji,
      cliffhanger: storyData.cliffhanger,
      articleBody: storyData.articleBody,
      historicalContext: storyData.historicalContext,
      historicalEvidence: storyData.historicalEvidence,
      references: refs,
      status: "active",
      roles: storyData.roles.map((role, i) => ({
        id: role.id,
        name: role.name,
        faction: role.faction,
        quote: role.quote,
        portraitUrl: portraitUrls[i] ?? "",
        stats: role.stats,
        keyPlayerStance: role.keyPlayerStance,
        portraitPrompt: role.portraitPrompt,
      })),
      panels: storyData.panels.map((panel, i) => ({
        id: panel.id,
        characterName: storyData.roles[panel.characterIndex]?.name ?? "The Analyst",
        characterPortrait: portraitUrls[panel.characterIndex] ?? "",
        backgroundUrl: panelUrls[i] ?? "",
        sectorBadge: panel.sectorBadge,
        dialogue: panel.dialogue,
        bgPrompt: panel.bgPrompt,
      })),
      predictionOptions: storyData.predictionOptions,
      simulations: {},
    };

    await upsertStory(story);

    return NextResponse.json({ id });
  } catch (err) {
    console.error("[generate]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
