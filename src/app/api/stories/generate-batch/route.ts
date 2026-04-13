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
import { fetchLatestNews } from "@/lib/newsdata";
import { hybridSearch } from "@/lib/research";
import { db } from "@/db";
import { news } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { toStorySlug } from "@/lib/utils";
import { scrapeArticleText } from "@/lib/generate";

export async function GET(req: NextRequest) {
  // Auth check
  const cronSecret = process.env.CRON_SECRET;
  const isEnabled = process.env.ENABLE_CRON === "true";
  const auth = req.headers.get("authorization");
  
  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isEnabled) {
    return NextResponse.json({ message: "Cron sync is currently disabled via ENABLE_CRON" });
  }

  // Specific order: search specific categories first, then world (fallback)
  const categoryKeys = ['breaking', 'crime', 'politics', 'economy', 'tech', 'health', 'sports', 'entertainment', 'world'];
  
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

  // 1. Intake: Fetch and paginate through categories
  for (const key of categoryKeys) {
    try {
      // Page 1
      let { articles, nextPage } = await fetchLatestNews(key, 10);
      
      if (articles.length === 0) continue;

      // Identify which are NEW before deciding to paginate
      const urls = articles.map(a => a.url);
      const existing = await db
        .select({ url: news.sourceUrl })
        .from(news)
        .where(inArray(news.sourceUrl as any, urls));
      const existingUrls = new Set(existing.map(r => r.url));
      
      // Filter p1 for new items
      const p1Filtered = articles.filter(a => !existingUrls.has(a.url));
      let newCount = p1Filtered.length;

      // Deep Sync: If we have very few new items, go to Page 2
      if (newCount < 3 && nextPage) {
        console.log(`[sync] Deep syncing ${key} (Page 2)...`);
        const p2 = await fetchLatestNews(key, 10, nextPage);
        const p2Urls = p2.articles.map(a => a.url);
        
        // Deduplicate P2
        const p2Existing = await db
          .select({ url: news.sourceUrl })
          .from(news)
          .where(inArray(news.sourceUrl as any, p2Urls));
        const p2ExistingUrls = new Set(p2Existing.map(r => r.url));
        const p2Filtered = p2.articles.filter(a => !p2ExistingUrls.has(a.url));
        
        articles = [...p1Filtered, ...p2Filtered];
      } else {
        articles = p1Filtered;
      }

      // Add to global set (now purely new articles)
      for (const article of articles) {
        if (!urlToCategory.has(article.url)) {
          urlToCategory.set(article.url, catMap[key]);
          allArticles.push(article);
        }
      }
    } catch (err) {
      console.error(`[sync] category ${key} failed:`, err);
    }
  }

  if (allArticles.length === 0) {
    return NextResponse.json({ processed: 0, skipped: 0 });
  }

  // Final check: filter allArticles purely for safety (though they should already be filtered)
  const newArticles = allArticles;

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

      // 2. Intelligence: Fetch real-world hybrid references (GNews first, fallback NewsData)
      // Clean query for better hit rate
      const query = article.title.replace(/[^\w\s]/gi, ' ').split(' ').slice(0, 8).join(' ');
      
      let gNewsRefs = await hybridSearch(query, 3).catch(() => []);

      // Fallback: If no refs found by title, try a broader search
      if (gNewsRefs.length === 0) {
        const fallbackQuery = (article.keywords?.slice(0, 3).join(' ') || article.title.slice(0, 30));
        gNewsRefs = await hybridSearch(fallbackQuery, 2).catch(() => []);
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
