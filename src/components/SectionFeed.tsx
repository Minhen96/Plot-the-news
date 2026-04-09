'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import type { NewsArticle } from '@/lib/types'
import { toStorySlug } from '@/lib/utils'
import Link from 'next/link'

function saveArticle(article: NewsArticle) {
  try { sessionStorage.setItem(`article:${toStorySlug(article.title)}`, JSON.stringify(article)) } catch { /* ignore */ }
}

function ArticleRow({ article }: { article: NewsArticle }) {
  return (
    <Link href={`/story/${toStorySlug(article.title)}`} onClick={() => saveArticle(article)} className="group block py-4 first:pt-0">
      <div className="flex gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-headline font-bold text-base leading-snug mt-1 mb-1 group-hover:text-primary transition-colors line-clamp-2">
            {article.title}
          </h4>
          {article.description && (
            <p className="text-xs font-body opacity-60 line-clamp-2 leading-relaxed">
              {article.description}
            </p>
          )}
          <span className="text-[10px] font-label opacity-40 uppercase tracking-widest mt-1 block">
            {article.source.name} · {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
        {article.image && (
          <div className="w-16 h-16 shrink-0 overflow-hidden ring-1 ring-outline/10 group-hover:ring-primary/30 transition-all">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
        )}
      </div>
    </Link>
  )
}

interface SectionFeedProps {
  initialArticles: NewsArticle[]
  nextPage:        string | null
  // pass either category OR q (for crypto keyword search)
  category?:       string
  q?:              string
}

export default function SectionFeed({ initialArticles, nextPage: initialNextPage, category, q }: SectionFeedProps) {
  const [articles, setArticles]   = useState<NewsArticle[]>(initialArticles)
  const [nextPage, setNextPage]   = useState<string | null>(initialNextPage)
  const [loading, setLoading]     = useState(false)
  const seen                      = useRef(new Set(initialArticles.map(a => a.url)))
  const containerRef              = useRef<HTMLDivElement>(null)
  const sentinelRef               = useRef<HTMLDivElement>(null)

  const loadMore = useCallback(async () => {
    if (loading || !nextPage) return
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (q)             params.set('q', q)
      else if (category) params.set('category', category)
      params.set('page', nextPage)

      const res  = await fetch(`/api/news/feed?${params}`)
      const data = await res.json()
      const fresh = (data.articles as NewsArticle[]).filter(a => {
        if (seen.current.has(a.url)) return false
        seen.current.add(a.url)
        return true
      })
      setArticles(prev => [...prev, ...fresh])
      setNextPage(data.nextPage ?? null)
    } catch {
      setNextPage(null)
    } finally {
      setLoading(false)
    }
  }, [loading, nextPage, category, q])

  useEffect(() => {
    const sentinel  = sentinelRef.current
    const container = containerRef.current
    if (!sentinel || !container) return
    // root = the scroll container, so IntersectionObserver fires inside it
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore() },
      { root: container, rootMargin: '100px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loadMore])

  return (
    // Fixed-height scrollable container — nested scroll, does not expand the page
    <div ref={containerRef} className="h-[480px] overflow-y-auto pr-2 scrollbar-thin">
      <div className="divide-y divide-outline/15">
        {articles.map(a => <ArticleRow key={a.url} article={a} />)}
        {loading && (
          <div className="py-4 space-y-2 animate-pulse">
            <div className="h-3 bg-surface-container rounded w-3/4" />
            <div className="h-3 bg-surface-container rounded w-1/2" />
          </div>
        )}
      </div>
      <div ref={sentinelRef} className="h-1" />
      {!nextPage && articles.length > 0 && !loading && (
        <p className="text-[10px] font-label uppercase tracking-widest opacity-30 py-4">
          End of section
        </p>
      )}
    </div>
  )
}
