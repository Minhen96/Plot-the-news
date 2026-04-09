import type { GNewsArticle } from './types'

const BASE = 'https://gnews.io/api/v4'

export async function fetchGNewsArticles(
  category: string,
  max = 5
): Promise<GNewsArticle[]> {
  const key = process.env.GNEWS_API_KEY
  if (!key) return []

  try {
    const res = await fetch(
      `${BASE}/top-headlines?category=${category}&max=${max}&lang=en&token=${key}`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return []
    const data = await res.json()
    return data.articles ?? []
  } catch {
    return []
  }
}
