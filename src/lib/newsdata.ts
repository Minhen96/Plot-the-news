import type { NewsArticle } from './types'

const BASE = 'https://newsdata.io/api/1'

// Maps our category slugs → newsdata category names
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

const COMMON = 'language=en&removeduplicate=1&image=1'

interface NewsdataRaw {
  article_id:  string
  title:       string | null
  description: string | null
  link:        string
  image_url:   string | null
  pubDate:     string
  source_name: string | null
  source_url:  string | null
}

interface NewsdataResponse {
  status:       string
  results:      NewsdataRaw[]
  nextPage:     string | null
}

function clean(value: string | null | undefined): string {
  if (!value || value.includes('ONLY AVAILABLE IN PAID PLANS')) return ''
  return value
}

function map(raw: NewsdataRaw): NewsArticle {
  return {
    title:       raw.title ?? '',
    description: clean(raw.description),
    url:         raw.link,
    image:       raw.image_url,
    publishedAt: raw.pubDate,
    source:      { name: raw.source_name ?? '', url: raw.source_url ?? '' },
  }
}

// ── Latest news (top section + category tabs) ──────────────────────────────

export async function fetchLatestNews(
  category: string,
  size = 10,
): Promise<{ articles: NewsArticle[]; nextPage: string | null }> {
  const key = process.env.NEWSDATA_API_KEY
  if (!key) return { articles: [], nextPage: null }
  const cat = CAT[category] ?? 'top'
  try {
    const res = await fetch(
      `${BASE}/latest?apikey=${key}&category=${cat}&size=${size}&${COMMON}`,
      { next: { revalidate: 43200 } },
    )
    if (!res.ok) {
      console.error(`[newsdata] latest ${res.status}:`, await res.text())
      return { articles: [], nextPage: null }
    }
    const data: NewsdataResponse = await res.json()
    const articles = (data.results ?? []).map(map)
    return { articles, nextPage: data.nextPage ?? null }
  } catch (err) {
    console.error('[newsdata] latest caught error:', err)
    return { articles: [], nextPage: null }
  }
}

// ── Last-week news (right column) ─────────────────────────────────────────
// Uses timeframe=48 (max on free tier) — labels as "Recent Past" if archive unavailable

export async function fetchLastWeekNews(
  category: string,
  size = 5,
): Promise<NewsArticle[]> {
  const key = process.env.NEWSDATA_API_KEY
  if (!key) return []
  const cat = CAT[category] ?? 'top'
  try {
    const res = await fetch(
      `${BASE}/latest?apikey=${key}&category=${cat}&size=${size}&sort=pubdateasc&language=en&removeduplicate=1`,
      { next: { revalidate: 43200 } },
    )
    if (!res.ok) return []
    const data: NewsdataResponse = await res.json()
    return (data.results ?? []).map(map)
  } catch (err) {
    console.error('[newsdata] lastweek caught error:', err)
    return []
  }
}

// ── Market news (Markets section) — uses latest with business category ────

export async function fetchMarketNews(
  size = 6,
): Promise<{ articles: NewsArticle[]; nextPage: string | null }> {
  const key = process.env.NEWSDATA_API_KEY
  if (!key) return { articles: [], nextPage: null }
  try {
    const res = await fetch(
      `${BASE}/latest?apikey=${key}&category=business&size=${size}&${COMMON}`,
      { next: { revalidate: 43200 } },
    )
    if (!res.ok) {
      console.error(`[newsdata] market ${res.status}:`, await res.text())
      return { articles: [], nextPage: null }
    }
    const data: NewsdataResponse = await res.json()
    return { articles: (data.results ?? []).map(map), nextPage: data.nextPage ?? null }
  } catch {
    return { articles: [], nextPage: null }
  }
}

// ── Crypto news (Crypto section) — uses latest with keyword search ────────

export async function fetchCryptoNews(
  size = 6,
): Promise<{ articles: NewsArticle[]; nextPage: string | null }> {
  const key = process.env.NEWSDATA_API_KEY
  if (!key) return { articles: [], nextPage: null }
  try {
    const res = await fetch(
      `${BASE}/latest?apikey=${key}&q=bitcoin,ethereum,cryptocurrency&size=${size}&${COMMON}`,
      { next: { revalidate: 43200 } },
    )
    if (!res.ok) {
      console.error(`[newsdata] crypto ${res.status}:`, await res.text())
      return { articles: [], nextPage: null }
    }
    const data: NewsdataResponse = await res.json()
    return { articles: (data.results ?? []).map(map), nextPage: data.nextPage ?? null }
  } catch {
    return { articles: [], nextPage: null }
  }
}
