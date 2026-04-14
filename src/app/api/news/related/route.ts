import { type NextRequest } from 'next/server'
import { hybridSearch } from '@/lib/research'
import { db } from '@/db'
import { news } from '@/db/schema'
import { eq, sql } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const q = searchParams.get('q')
  const newsId = searchParams.get('newsId')

  if (!q) return Response.json({ articles: [] })

  // 1. Try GNews
  try {
    const gnewsResults = await hybridSearch(q, 5)
    if (gnewsResults.length > 0) {
      return Response.json({ articles: gnewsResults })
    }
  } catch {
    // fall through
  }

  // 2. DB fallback — other articles in the same category
  if (newsId) {
    try {
      const [current] = await db
        .select({ category: news.category })
        .from(news)
        .where(eq(news.id, newsId))
        .limit(1)

      if (current?.category) {
        const rows = await db
          .select({
            id: news.id,
            title: news.title,
            imageUrl: news.imageUrl,
            date: news.date,
            sourceUrl: news.sourceUrl,
          })
          .from(news)
          .where(eq(news.category, current.category))
          .orderBy(sql`random()`)
          .limit(6)

        const articles = rows
          .filter(a => a.id !== newsId)
          .slice(0, 5)
          .map(a => ({
            title: a.title,
            source: a.sourceUrl ? new URL(a.sourceUrl).hostname : 'The Chronicle',
            url: `/story/${a.id}`,
            image: a.imageUrl ?? null,
            publishedAt: a.date ?? null,
          }))

        if (articles.length > 0) {
          return Response.json({ articles })
        }
      }
    } catch (err) {
      console.error('[related] DB fallback failed:', err)
    }
  }

  return Response.json({ articles: [] })
}
