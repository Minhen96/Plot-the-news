import { NextResponse } from "next/server";
import { getAllStories, getStoriesByCategory } from "@/lib/stories";
import type { FeedItem } from "@/lib/types";

const CATEGORY_MAP: Record<string, string> = {
  world:         'World',
  breaking:      'Breaking',
  crime:         'Crime',
  politics:      'Politics',
  economy:       'Finance',
  tech:          'Tech',
  health:        'Health',
  sports:        'Sports',
  entertainment: 'Entertainment',
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category') ?? 'world'
  const limit = Math.min(Number(searchParams.get('limit') ?? 10), 50)
  const offset = Number(searchParams.get('offset') ?? 0)

  // Fetch one extra to determine if there are more pages
  const fetchLimit = limit + 1
  const dbCategory = CATEGORY_MAP[category]

  const rows = await (dbCategory && category !== 'world'
    ? getStoriesByCategory(dbCategory, fetchLimit, offset)
    : getAllStories(fetchLimit, offset)
  ).catch(() => [])

  const hasMore = rows.length === fetchLimit
  const stories = rows.slice(0, limit)

  const items: FeedItem[] = stories.map(s => ({
    id: s.id,
    title: s.title,
    summary: s.summary,
    imageUrl: s.imageUrl,
    date: s.date,
    category: s.category,
    isGenerated: s.isGenerated,
    coverEmoji: s.coverEmoji,
    crisisLevel: s.crisisLevel,
  }))

  return NextResponse.json({ stories: items, hasMore })
}
