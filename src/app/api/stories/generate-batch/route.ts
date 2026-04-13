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
import { scrapeArticleText } from "@/lib/generate";
import { db } from "@/db";
import { news } from "@/db/schema";
import { inArray } from "drizzle-orm";

const BATCH_SIZE = 3; // Max stories generated per cron run

export async function GET(req: NextRequest) {
  // Auth check
  const cronSecret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch from multiple channels
  const [worldResp, marketResp, cryptoResp] = await Promise.all([
    fetchLatestNews("world", 6),
    fetchLatestNews("economy", 6), // Business -> Finance
    fetchLatestNews("science", 6), // Science/Tech -> Technology
  ]).catch(() => [ { articles: [] }, { articles: [] }, { articles: [] } ]);

  // Tag articles by category
  const tagged = [
    ...(worldResp?.articles || []).map(a => ({ ...a, cat: 'World' })),
    ...(marketResp?.articles || []).map(a => ({ ...a, cat: 'Finance' })),
    ...(cryptoResp?.articles || []).map(a => ({ ...a, cat: 'Technology' })),
  ];

  if (tagged.length === 0) {
    return NextResponse.json({ generated: [], skipped: 0, failed: 0 });
  }

  // Filter out articles already in DB by sourceUrl
  const urls = tagged.map((a) => a.url);
  const existing = await db
    .select({ id: news.sourceUrl })
    .from(news)
    .where(inArray(news.sourceUrl as any, urls));

  const existingUrls = new Set(existing.map((r) => r.id));
  const newArticles = tagged.filter((a) => !existingUrls.has(a.url));

  const toProcess = newArticles.slice(0, BATCH_SIZE);
  const skipped = tagged.length - toProcess.length;

  const generated: string[] = [];
  let failed = 0;

  // Process sequentially to avoid hammering DeepSeek + FAL.ai
  for (const article of toProcess) {
    try {
      const fullContent = await scrapeArticleText(article.url);
      const baseUrl = req.nextUrl.origin;
      const res = await fetch(`${baseUrl}/api/stories/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.CRON_SECRET}`,
        },
        body: JSON.stringify({
          headline: article.title,
          description: article.description ?? "",
          url: article.url,
          imageUrl: article.image ?? undefined,
          source: article.source.name,
          fullContent,
          category: article.cat, // Passing the tagged category
        }),
      });

      if (!res.ok) {
        console.error(`[generate-batch] failed for ${article.url}:`, await res.text());
        failed++;
        continue;
      }

      const { id } = await res.json();
      generated.push(id);
    } catch (err) {
      console.error(`[generate-batch] error for ${article.url}:`, err);
      failed++;
    }
  }

  return NextResponse.json({ generated, skipped, failed });
}
