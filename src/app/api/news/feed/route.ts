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

    const clean = (v: string | null | undefined) =>
      !v || v.includes('ONLY AVAILABLE IN PAID PLANS') ? '' : v

    const cleanContent = (v: string | null | undefined) => {
      if (!v || v.includes('ONLY AVAILABLE IN PAID PLANS')) return undefined
      const stripped = v.replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
      return stripped || undefined
    }

    const articles = (data.results ?? []).map((raw: {
      title: string | null
      description: string | null
      content: string | null
      keywords: string[] | null
      link: string
      image_url: string | null
      pubDate: string
      source_name: string | null
      source_url: string | null
    }) => ({
      title:       raw.title ?? '',
      description: clean(raw.description),
      content:     cleanContent(raw.content),
      keywords:    raw.keywords?.length ? raw.keywords.slice(0, 8) : undefined,
      url:         raw.link,
      image:       raw.image_url,
      publishedAt: raw.pubDate,
      source:      { name: raw.source_name ?? '', url: raw.source_url ?? '' },
    }))

    return Response.json({ articles, nextPage: data.nextPage ?? null })
  } catch {
    return Response.json({ articles: [], nextPage: null })
  }
}
