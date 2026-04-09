'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import type { NewsArticle } from '@/lib/types'
import { toStorySlug } from '@/lib/utils'

function ArticleCard({ article }: { article: NewsArticle }) {
  return (
    <Link href={`/story/${toStorySlug(article.title)}`} className="group block">
      <article className="bg-surface-container-lowest h-full flex flex-col transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-15px_rgba(51,111,84,0.1)] border border-outline/5 hover:border-primary/20">
        <div className="w-full h-48 overflow-hidden bg-surface-container-high shrink-0">
          {article.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-surface-container-high to-surface-container" />
          )}
        </div>
        <div className="p-4 flex flex-col gap-2 flex-1">
          <div className="flex items-center gap-2 flex-wrap text-on-surface/50">
            {article.aiTags && article.aiTags.length > 0 && (
              <span className="text-[9px] font-label font-black uppercase tracking-widest text-tertiary bg-tertiary-container/30 px-1.5 py-0.5 rounded-sm">
                {article.aiTags[0]}
              </span>
            )}
            <span className="text-[9px] font-label font-black uppercase tracking-widest text-primary">
              {article.source.name}
            </span>
            <span className="text-[9px] font-label opacity-60">
              {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
          <h3 className="font-headline font-bold text-base leading-tight text-on-background group-hover:text-primary transition-colors line-clamp-2">
            {article.title}
          </h3>
          <p className="text-sm font-body opacity-70 leading-relaxed line-clamp-3 flex-1">
            {article.description}
          </p>
          <span className="text-[10px] font-label font-black uppercase tracking-widest text-primary mt-1 flex items-center gap-1 group-hover:gap-2 transition-all">
            Launch Interactive <span>→</span>
          </span>
        </div>
      </article>
    </Link>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-surface-container-lowest animate-pulse">
      <div className="h-48 bg-surface-container" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-surface-container rounded w-24" />
        <div className="h-5 bg-surface-container rounded w-full" />
        <div className="h-5 bg-surface-container rounded w-3/4" />
        <div className="h-4 bg-surface-container rounded w-full" />
        <div className="h-4 bg-surface-container rounded w-2/3" />
      </div>
    </div>
  )
}

export interface NewsFeedProps {
  initialArticles: NewsArticle[]
  nextPage:        string | null
  category:        string
}

export default function NewsFeed({ initialArticles, nextPage: initialNextPage, category }: NewsFeedProps) {
  const [articles, setArticles]   = useState<NewsArticle[]>(initialArticles)
  const [nextPage, setNextPage]   = useState<string | null>(initialNextPage)
  const [loading, setLoading]     = useState(false)
  const [exhausted, setExhausted] = useState(!initialNextPage)
  const sentinelRef               = useRef<HTMLDivElement>(null)
  const seen                      = useRef(new Set(initialArticles.map(a => a.url)))

  const loadMore = useCallback(async () => {
    if (loading || exhausted || !nextPage) return
    setLoading(true)
    try {
      const res  = await fetch(`/api/news/feed?category=${category}&page=${nextPage}`)
      const data = await res.json()
      const fresh = (data.articles as NewsArticle[]).filter(a => {
        if (seen.current.has(a.url)) return false
        seen.current.add(a.url)
        return true
      })
      setArticles(prev => [...prev, ...fresh])
      setNextPage(data.nextPage ?? null)
      if (!data.nextPage) setExhausted(true)
    } catch {
      setExhausted(true)
    } finally {
      setLoading(false)
    }
  }, [loading, exhausted, nextPage, category])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore() },
      { rootMargin: '400px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loadMore])

  if (articles.length === 0 && !loading) return null

  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article, i) => (
          <ArticleCard key={`${article.url}-${i}`} article={article} />
        ))}
        {loading && Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={`sk-${i}`} />)}
      </div>

      <div ref={sentinelRef} className="h-1 mt-6" />

      {exhausted && articles.length > 0 && (
        <p className="text-center font-label text-[10px] uppercase tracking-widest opacity-30 mt-10 pb-6">
          You have reached the end of today&apos;s chronicle
        </p>
      )}
    </section>
  )
}
