import { type NextRequest } from 'next/server'
import { hybridSearch } from '@/lib/research'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')
  if (!q) return Response.json({ articles: [] })

  try {
    const articles = await hybridSearch(q, 5)
    return Response.json({ articles })
  } catch {
    return Response.json({ articles: [] })
  }
}
