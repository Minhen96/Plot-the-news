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
import { news, stories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { upsertStory, getStoriesByCategory } from "@/lib/stories";
import { toStorySlug } from "@/lib/utils";
import { generateStoryContent, generateStoryImages, scrapeArticleText } from "@/lib/generate";
import { searchNews } from "@/lib/gnews";
import type { Story } from "@/lib/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const newsId = searchParams.get("newsId");

  if (!newsId) {
    return NextResponse.json({ error: "newsId is required" }, { status: 400 });
  }

  const [item] = await db
    .select()
    .from(news)
    .where(eq(news.id, newsId))
    .limit(1);

  if (!item) {
    return NextResponse.json({ error: "Story not found" }, { status: 404 });
  }

  // On-Demand AI Hydration: If body is missing, synthesize it now!
  if (!item.articleBody || (Array.isArray(item.articleBody) && item.articleBody.length === 0)) {
    try {
      const scrapedText = await scrapeArticleText(item.sourceUrl || '');
      // Use AI to create the premium 5-paragraph version instead of raw scrape
      const storyData = await generateStoryContent(
        item.title, 
        item.summary || "", 
        item.sourceUrl || "", 
        scrapedText
      );
      
      if (storyData.articleBody && storyData.articleBody.length > 0) {
        await db.update(news).set({ 
          articleBody: storyData.articleBody,
          historicalContext: storyData.historicalContext,
          historicalEvidence: storyData.historicalEvidence,
          crisisLevel: storyData.crisisLevel,
          coverEmoji: storyData.coverEmoji
        }).where(eq(news.id, newsId));
        
        item.articleBody = storyData.articleBody;
        item.historicalContext = storyData.historicalContext;
        item.historicalEvidence = storyData.historicalEvidence;
      }
    } catch (err) {
      console.error("[generate-get] on-demand hydration failed:", err);
    }
  }

  return NextResponse.json(item);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let { headline, description, url, imageUrl, source, fullContent, category, newsId } = body as {
      headline?: string;
      description?: string;
      url?: string;
      imageUrl?: string;
      source?: string;
      fullContent?: string | null;
      category?: string;
      newsId?: string;
    };

    // If newsId is provided, fetch missing info from DB
    if (newsId && !headline) {
      const [existingNews] = await db
        .select()
        .from(news)
        .where(eq(news.id, newsId))
        .limit(1);
      
      if (existingNews) {
        headline = existingNews.title;
        description = existingNews.summary || "";
        url = existingNews.sourceUrl || "";
        imageUrl = existingNews.imageUrl || undefined;
        source = existingNews.sourceUrl || ""; 
        category = existingNews.category;
        fullContent = (existingNews.articleBody as string[])?.[0] || null;
      }
    }

    if (!headline || !description || !url) {
      return NextResponse.json(
        { error: "headline, description, and url are required" },
        { status: 400 }
      );
    }

    // Check if already fully generated in stories table
    const [existingStory] = await db
      .select({ id: stories.id })
      .from(stories)
      .where(eq(stories.id, newsId || toStorySlug(headline)))
      .limit(1);

    if (existingStory) {
      return NextResponse.json({ id: existingStory.id });
    }

    const id = newsId || toStorySlug(headline);

    // Scrape full article if missing
    if (!fullContent) {
      fullContent = await scrapeArticleText(url);
    }

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
      storyData.panels as any[],
      storyData.roles as any[],
      storyData.coverImageQuery,
      imageUrl
    );

    // Assemble Story
    const story: Story = {
      id,
      title: headline,
      summary: storyData.summary,
      category: category || storyData.category,
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
      author: storyData.author,
      authorTitle: storyData.authorTitle,
      impactSummary: storyData.impactSummary,
      status: "active",
      isGenerated: true,
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
      panels: (storyData.panels as any[]).map((panel, i) => ({
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

    // Mark news as fully generated
    await db.update(news)
      .set({ isGenerated: true })
      .where(eq(news.id, id));

    return NextResponse.json({ id });
  } catch (err) {
    console.error("[generate]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
