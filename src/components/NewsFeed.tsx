'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import type { GNewsArticle } from '@/lib/types'
import { toStorySlug } from '@/lib/utils'

const BATCH_SIZE = 10

function ArticleCard({ article }: { article: GNewsArticle }) {
  return (
    <Link href={`/story/${toStorySlug(article.title)}`} className="group block">
      <article className="bg-surface-container-lowest h-full flex flex-col">
        {/* Image */}
        <div className="w-full h-48 overflow-hidden bg-surface-container-high shrink-0">
          {article.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-surface-container-high to-surface-container" />
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-2 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-label font-black uppercase tracking-widest text-primary">
              {article.source.name}
            </span>
            <span className="text-[9px] font-label opacity-40">·</span>
            <span className="text-[9px] font-label opacity-50">
              {new Date(article.publishedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>

          <h3 className="font-headline font-bold text-base leading-tight text-on-background group-hover:underline">
            {article.title}
          </h3>

          <p className="text-sm font-body opacity-70 leading-relaxed line-clamp-3 flex-1">
            {article.description}
          </p>

          <span className="text-[10px] font-label font-black uppercase tracking-widest text-primary mt-1">
            Launch Interactive →
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

interface NewsFeedProps {
  articles: GNewsArticle[]
}

export default function NewsFeed({ articles }: NewsFeedProps) {
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE)
  const [loading, setLoading] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < articles.length && !loading) {
          setLoading(true)
          // Small delay so the skeletons are visible — feels intentional, not janky
          setTimeout(() => {
            setVisibleCount((c) => Math.min(c + BATCH_SIZE, articles.length))
            setLoading(false)
          }, 500)
        }
      },
      { rootMargin: '300px' }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [visibleCount, articles.length, loading])

  if (articles.length === 0) return null

  const displayed = articles.slice(0, visibleCount)

  return (
    <section className="mt-16">
      {/* Section header */}
      <div className="mb-8">
        <div className="border-t-4 border-on-background mb-3" />
        <div className="flex items-baseline justify-between">
          <h2 className="font-headline font-extrabold text-2xl tracking-tight text-on-background">
            More From The Chronicle
          </h2>
          <span className="text-[10px] font-label font-black uppercase tracking-widest opacity-40">
            {articles.length} stories
          </span>
        </div>
      </div>

      {/* Article grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayed.map((article, i) => (
          <ArticleCard key={`${article.url}-${i}`} article={article} />
        ))}

        {/* Skeleton placeholders while loading next batch */}
        {loading &&
          Array.from({ length: BATCH_SIZE }).map((_, i) => (
            <SkeletonCard key={`skeleton-${i}`} />
          ))}
      </div>

      {/* Invisible sentinel — triggers load when scrolled into view */}
      <div ref={sentinelRef} className="h-1 mt-6" />

      {/* End of feed indicator */}
      {visibleCount >= articles.length && articles.length > 0 && (
        <p className="text-center font-label text-[10px] uppercase tracking-widest opacity-30 mt-10 pb-6">
          You have reached the end of today&apos;s chronicle
        </p>
      )}
    </section>
  )
}
