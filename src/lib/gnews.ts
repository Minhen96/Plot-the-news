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
      { next: { revalidate: 43200 } }
    )
    if (!res.ok) return []
    const data = await res.json()
    return data.articles ?? []
  } catch {
    return []
  }
}

export async function fetchGNewsLastWeek(
  category: string,
  max = 6
): Promise<GNewsArticle[]> {
  const key = process.env.GNEWS_API_KEY
  if (!key) return []

  const to   = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
  const from = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) // 8 days ago
  const fmt  = (d: Date) => d.toISOString().split('.')[0] + 'Z'

  try {
    const res = await fetch(
      `${BASE}/top-headlines?category=${category}&max=${max}&lang=en&from=${fmt(from)}&to=${fmt(to)}&token=${key}`,
      { next: { revalidate: 43200 } }
    )
    if (!res.ok) return []
    const data = await res.json()
    return data.articles ?? []
  } catch {
    return []
  }
}
