import { type NextRequest } from 'next/server'

const BASE   = 'https://newsdata.io/api/1'
const COMMON = 'language=en&removeduplicate=1&image=1'

const CAT: Record<string, string> = {
  world:    'world',
  politics: 'politics',
  economy:  'business',
  culture:  'entertainment',
  science:  'science',
  health:   'health',
  sports:   'sports',
  opinion:  'top',
}

export async function GET(request: NextRequest) {
  const key = process.env.NEWSDATA_API_KEY
  if (!key) return Response.json({ articles: [], nextPage: null })

  const { searchParams } = request.nextUrl
  const category  = searchParams.get('category') ?? 'world'
  const q         = searchParams.get('q')
  const page      = searchParams.get('page')
  const cat       = CAT[category] ?? 'top'
  const pageParam = page ? `&page=${page}` : ''
  const query     = q ? `&q=${encodeURIComponent(q)}` : `&category=${cat}`

  try {
    const res = await fetch(
      `${BASE}/latest?apikey=${key}&size=10&${COMMON}${query}${pageParam}`,
      { next: { revalidate: 43200 } },
    )
    if (!res.ok) return Response.json({ articles: [], nextPage: null })

    const data = await res.json()

    const articles = (data.results ?? []).map((raw: {
      title: string | null
      description: string | null
      link: string
      image_url: string | null
      pubDate: string
      source_name: string | null
      source_url: string | null
      ai_tag?: string[] | null
      ai_summary?: string | null
      sentiment_stats?: { negative: number; neutral: number; positive: number } | null
    }) => ({
      title:       raw.title ?? '',
      description: raw.ai_summary ?? raw.description ?? '',
      url:         raw.link,
      image:       raw.image_url,
      publishedAt: raw.pubDate,
      source:      { name: raw.source_name ?? '', url: raw.source_url ?? '' },
      crisisLevel: raw.sentiment_stats
        ? Math.round(raw.sentiment_stats.negative)
        : undefined,
      aiTags: Array.isArray(raw.ai_tag) ? raw.ai_tag.filter(Boolean) : undefined,
    }))

    return Response.json({ articles, nextPage: data.nextPage ?? null })
  } catch {
    return Response.json({ articles: [], nextPage: null })
  }
}
