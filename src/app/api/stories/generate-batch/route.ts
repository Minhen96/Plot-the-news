/**
 * GET /api/stories/generate-batch
 *
 * Cron endpoint — fetches latest newsdata headlines, scrapes full article content,
 * and calls /api/stories/generate for each new article.
 *
 * Protected by Authorization: Bearer $CRON_SECRET header.
 * Vercel Cron sets this automatically. For manual testing, pass the header yourself.
 *
 * Schedule (vercel.json): every 3 hours → "0 *\/3 * * *"
 *
 * Returns: { generated: string[], skipped: number, failed: number }
 */
import { NextRequest, NextResponse } from "next/server";
import { fetchLatestNews, fetchCryptoNews } from "@/lib/newsdata";
import { db } from "@/db";
import { news } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { toStorySlug } from "@/lib/utils";
import { searchNews } from "@/lib/gnews";
import { scrapeArticleText } from "@/lib/generate";

export async function GET(req: NextRequest) {
  // Auth check
  const cronSecret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Specific order: search specific categories first, then world (fallback)
  const categoryKeys = ['breaking', 'crime', 'politics', 'economy', 'tech', 'health', 'sports', 'entertainment', 'world'];
  
  // Fetch from all categories
  const categoryResults = await Promise.all(
    categoryKeys.map(async (key) => {
      const res = await fetchLatestNews(key, 10).catch(() => ({ articles: [] }));
      return { key, articles: res.articles };
    })
  ).catch(() => []);

  const allArticles: any[] = [];
  const urlToCategory = new Map<string, string>();

  const catMap: Record<string, string> = {
    world: 'World',
    breaking: 'Breaking',
    crime: 'Crime',
    politics: 'Politics',
    economy: 'Finance',
    tech: 'Tech',
    health: 'Health',
    sports: 'Sports',
    entertainment: 'Entertainment'
  };

  // Populate articles and map URLs to categories (prioritizing specific ones)
  for (const { key, articles } of categoryResults) {
    for (const article of articles) {
      if (!urlToCategory.has(article.url)) {
        urlToCategory.set(article.url, catMap[key]);
        allArticles.push(article);
      }
    }
  }

  if (allArticles.length === 0) {
    return NextResponse.json({ processed: 0, skipped: 0 });
  }

  // Deduplicate by sourceUrl against DB
  const urls = allArticles.map((a) => a.url);
  const existing = await db
    .select({ url: news.sourceUrl })
    .from(news)
    .where(inArray(news.sourceUrl as any, urls));

  const existingUrls = new Set(existing.map((r) => r.url));
  const newArticles = allArticles.filter((a) => !existingUrls.has(a.url));

  let saved = 0;
  for (const article of newArticles) {
    try {
      const id = toStorySlug(article.title);

      // 1. Deep-Crawl: Fetch full article body
      const fullText = await scrapeArticleText(article.url).catch(() => null);
      const articleBody = fullText ? [fullText] : [];

      // Quality Gate: Skip articles with no body content
      if (articleBody.length === 0) {
        continue;
      }

      // 2. Intelligence: Fetch real-world GNews references
      // Clean query for better hit rate
      const query = article.title.replace(/[^\w\s]/gi, ' ').split(' ').slice(0, 8).join(' ');
      
      let gNewsRefs = await searchNews({
        q: query,
        lang: "en",
        max: 3,
        in: 'title'
      }).then((res) =>
        res.articles.map((a) => ({
          title: a.title,
          source: a.source.name,
          url: a.url,
        }))
      ).catch(() => []);

      // Fallback: If no refs found by title, try a broader search
      if (gNewsRefs.length === 0) {
        const fallbackQuery = (article.keywords?.slice(0, 3).join(' ') || article.title.slice(0, 30));
        gNewsRefs = await searchNews({
          q: fallbackQuery,
          lang: "en",
          max: 2,
        }).then((res) =>
          res.articles.map((a) => ({
            title: a.title,
            source: a.source.name,
            url: a.url,
          }))
        ).catch(() => []);
      }
      
      const displayCat = urlToCategory.get(article.url) || 'World';

      await db.insert(news).values({
        id,
        title: article.title,
        summary: article.description,
        imageUrl: article.image,
        date: article.publishedAt,
        category: displayCat,
        sourceUrl: article.url,
        isGenerated: false,
        articleBody,
        refs: gNewsRefs,
      }).onConflictDoNothing();
      
      saved++;
    } catch (err) {
      console.error(`[sync] failed to save article:`, err);
    }
  }

  return NextResponse.json({ processed: saved, skipped: allArticles.length - saved });
}
