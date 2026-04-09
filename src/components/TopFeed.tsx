'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import type { NewsArticle } from '@/lib/types'
import { toStorySlug } from '@/lib/utils'

function AiTagBadge({ tag }: { tag: string }) {
  return (
    <span className="inline-block px-2 py-0.5 bg-tertiary-container/30 text-tertiary text-[9px] font-label font-black uppercase tracking-widest rounded-sm">
      {tag}
    </span>
  )
}

function ArticleItem({ article }: { article: NewsArticle }) {
  return (
    <Link href={`/story/${toStorySlug(article.title)}`} className="group block py-4 border-b border-outline/15 last:border-0">
      <div className="flex gap-3">
        <div className="flex-1 min-w-0">
          {article.aiTags && article.aiTags.length > 0 && (
            <AiTagBadge tag={article.aiTags[0]} />
          )}
          <h4 className="font-headline font-bold text-sm leading-snug mt-1 mb-1 group-hover:text-primary transition-colors line-clamp-2">
            {article.title}
          </h4>
          <p className="text-xs font-body opacity-60 line-clamp-2 leading-relaxed">
            {article.description}
          </p>
          <span className="text-[10px] font-label opacity-40 uppercase tracking-widest mt-1 block">
            {article.source.name} · {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
        {article.image && (
          <div className="w-14 h-14 shrink-0 overflow-hidden ring-1 ring-outline/10 group-hover:ring-primary/30 transition-all">
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

function SkeletonItem() {
  return (
    <div className="py-4 border-b border-outline/15 space-y-2 animate-pulse">
      <div className="h-2.5 bg-surface-container rounded w-3/4" />
      <div className="h-2.5 bg-surface-container rounded w-1/2" />
      <div className="h-2 bg-surface-container rounded w-1/3 mt-1" />
    </div>
  )
}

interface TopFeedProps {
  featured:        NewsArticle
  initialArticles: NewsArticle[]
  nextPage:        string | null
  category:        string
  sectionLabel:    string
}

export default function TopFeed({ featured, initialArticles, nextPage: initialNextPage, category, sectionLabel }: TopFeedProps) {
  const [articles, setArticles] = useState<NewsArticle[]>(initialArticles)
  const [nextPage, setNextPage] = useState<string | null>(initialNextPage)
  const [loading, setLoading]   = useState(false)
  const containerRef            = useRef<HTMLDivElement>(null)
  const sentinelRef             = useRef<HTMLDivElement>(null)
  const seen                    = useRef(new Set([featured.url, ...initialArticles.map(a => a.url)]))

  const loadMore = useCallback(async () => {
    if (loading || !nextPage) return
    setLoading(true)
    try {
      const res  = await fetch(`/api/news/feed?category=${encodeURIComponent(category)}&page=${nextPage}`)
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
  }, [loading, nextPage, category])

  useEffect(() => {
    const sentinel  = sentinelRef.current
    const container = containerRef.current
    if (!sentinel || !container) return
    // root = container → fires inside the nested scroll box, not the page
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore() },
      { root: container, rootMargin: '100px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loadMore])

  // Right col gets 2x articles to compensate for the lead story height on the left
  const leftArticles  = articles.filter((_, i) => i % 3 === 0)
  const rightArticles = articles.filter((_, i) => i % 3 !== 0)

  return (
    // Fixed-height scroll box — scrolls internally, does not expand the page
    <div ref={containerRef} className="h-[680px] overflow-y-auto pr-1 scrollbar-thin">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 items-start">

        {/* Left column — Lead Story + articles */}
        <div className="border-r border-outline/15 pr-8">
          <h4 className="font-headline font-black uppercase text-xs tracking-widest mb-4 border-b-2 border-on-background pb-1 w-fit">
            Lead Story
          </h4>

          <Link href={`/story/${toStorySlug(featured.title)}`} className="group block">
            <article className="flex flex-col gap-4">
              <div className="overflow-hidden">
                {featured.image
                  ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={featured.image}
                      alt={featured.title}
                      className="w-full aspect-video object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  )
                  : <div className="w-full aspect-video bg-surface-container-high" />
                }
              </div>
              <div className="space-y-2">
                {featured.crisisLevel !== undefined && featured.crisisLevel > 50 && (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-label font-black uppercase tracking-widest text-on-background/50">Crisis</span>
                    <div className="flex-1 h-1 bg-surface-container-high rounded-full overflow-hidden max-w-[80px]">
                      <div className="h-full bg-linear-to-r from-primary to-tertiary" style={{ width: `${featured.crisisLevel}%` }} />
                    </div>
                    <span className="text-[10px] font-label font-black text-primary">{featured.crisisLevel}</span>
                  </div>
                )}
                <h3 className="text-xl md:text-2xl font-headline font-extrabold leading-tight text-on-background group-hover:text-primary transition-colors">
                  {featured.title}
                </h3>
                <p className="text-sm font-body opacity-70 leading-relaxed line-clamp-2">{featured.description}</p>
                {featured.aiTags && featured.aiTags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {featured.aiTags.slice(0, 2).map(tag => <AiTagBadge key={tag} tag={tag} />)}
                  </div>
                )}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] font-label opacity-50 uppercase tracking-widest">
                    {featured.source.name} · {new Date(featured.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <div className="text-[10px] font-label font-black uppercase tracking-widest text-primary flex items-center gap-1 group/btn">
                    Launch <span className="transition-transform duration-300 group-hover/btn:translate-x-1 group-hover:translate-x-1">→</span>
                  </div>
                </div>
              </div>
            </article>
          </Link>

          <div className="mt-4 pt-2">
            {leftArticles.map(a => <ArticleItem key={a.url} article={a} />)}
            {loading && <><SkeletonItem /><SkeletonItem /></>}
          </div>
        </div>

        {/* Right / middle column — articles from top */}
        <div>
          <h4 className="font-headline font-black uppercase text-xs tracking-widest mb-4 border-b-2 border-on-background pb-1 w-fit">
            {sectionLabel}
          </h4>
          {rightArticles.map(a => <ArticleItem key={a.url} article={a} />)}
          {loading && <><SkeletonItem /><SkeletonItem /></>}
        </div>
      </div>

      {/* Sentinel fires inside the container scroll */}
      <div ref={sentinelRef} className="h-1" />

      {!nextPage && articles.length > 0 && !loading && (
        <p className="text-[10px] font-label uppercase tracking-widest opacity-30 py-4">
          End of section
        </p>
      )}
    </div>
  )
}
