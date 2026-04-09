import { type NextRequest } from 'next/server'

const GNEWS = 'https://gnews.io/api/v4'

export async function GET(request: NextRequest) {
  const key = process.env.GNEWS_API_KEY
  const q   = request.nextUrl.searchParams.get('q')
  if (!key || !q) return Response.json({ articles: [] })

  try {
    const res = await fetch(
      `${GNEWS}/search?q=${encodeURIComponent(q)}&lang=en&max=5&token=${key}`,
      { next: { revalidate: 3600 } },
    )
    if (!res.ok) return Response.json({ articles: [] })

    const data = await res.json()
    const articles = (data.articles ?? []).map((a: {
      title: string
      description: string
      url: string
      image: string | null
      publishedAt: string
      source: { name: string; url: string }
    }) => ({
      title:       a.title,
      description: a.description,
      url:         a.url,
      image:       a.image,
      publishedAt: a.publishedAt,
      source:      a.source,
    }))

    return Response.json({ articles })
  } catch {
    return Response.json({ articles: [] })
  }
}
