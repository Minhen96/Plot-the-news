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

  // All categories from newsdata.ts (plus 'crypto' as a special search)
  const categories = ['world', 'politics', 'economy', 'culture', 'science', 'health', 'sports', 'opinion'];
  
  const results = await Promise.all([
    ...categories.map(c => fetchLatestNews(c, 10)),
    fetchCryptoNews(10)
  ]).catch(() => []);

  const allArticles = results.flatMap(r => (r as any).articles || []);

  if (allArticles.length === 0) {
    return NextResponse.json({ processed: 0, skipped: 0 });
  }

  // Deduplicate by sourceUrl
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
        console.log(`[sync] skipping article due to no body content: ${article.title}`);
        continue;
      }

      // 2. Intelligence: Fetch real-world GNews references
      const gNewsRefs = await searchNews({
        q: article.title.slice(0, 100),
        lang: "en",
        max: 3,
      }).then((res) =>
        res.articles.map((a) => ({
          title: a.title,
          source: a.source.name,
          url: a.url,
        }))
      ).catch(() => []);
      
      // Determine display category
      let displayCat = 'World';
      if (article.url.includes('crypto')) displayCat = 'Technology';
      // Find which search category this came from (best effort)
      const foundCat = categories.find(c => results.some(r => (r as any).articles?.some((a: any) => a.url === article.url)));
      if (foundCat) {
        const catMap: Record<string, string> = {
          world: 'World',
          politics: 'Politics',
          economy: 'Finance',
          culture: 'Culture',
          science: 'Technology',
          health: 'Health',
          sports: 'Sports',
          opinion: 'Opinion'
        };
        displayCat = catMap[foundCat] || 'World';
      }

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
