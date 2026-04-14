'use client'

import { useState } from 'react'
import ArticleLink from '@/components/ArticleLink'
import type { FeedItem } from '@/lib/types'

interface Props {
  initialItems: FeedItem[]
  category: string
  initialHasMore: boolean
}

function CrisisBadge({ level }: { level?: number }) {
  if (!level) return null
  const color = level >= 80 ? 'bg-red-100 text-red-700' : level >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
  return (
    <span className={`text-[9px] font-label font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${color}`}>
      Crisis {level}
    </span>
  )
}

function StoryItem({ story }: { story: FeedItem }) {
  const article = {
    title: story.title,
    description: story.summary || '',
    url: `/story/${story.id}`,
    image: story.imageUrl || null,
    publishedAt: story.date,
    source: { name: story.category, url: '' },
  }
  return (
    <ArticleLink article={article} className="group block py-4 border-b border-outline/15 last:border-0">
      <div className="flex gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[9px] font-label font-black uppercase tracking-widest text-primary/60">
              {story.isGenerated ? `${story.coverEmoji} ${story.category}` : '🛰️ Live Dispatch'}
            </span>
            {story.isGenerated && <CrisisBadge level={story.crisisLevel} />}
          </div>
          <h4 className="font-headline font-bold text-sm leading-snug mb-1 group-hover:text-primary transition-colors line-clamp-2">
            {story.title}
          </h4>
        </div>
        {story.imageUrl && (
          <div className="w-14 h-14 shrink-0 overflow-hidden ring-1 ring-outline/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={story.imageUrl} alt={story.title} className="w-full h-full object-cover" />
          </div>
        )}
      </div>
    </ArticleLink>
  )
}

export default function FeedLoader({ initialItems, category, initialHasMore }: Props) {
  const [items, setItems] = useState<FeedItem[]>(initialItems)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [loading, setLoading] = useState(false)
  // +1 accounts for the lead story rendered separately above
  const [offset, setOffset] = useState(initialItems.length + 1)

  async function loadMore() {
    if (loading || !hasMore) return
    setLoading(true)
    try {
      const res = await fetch(`/api/stories?category=${category}&offset=${offset}&limit=10`)
      if (res.ok) {
        const data = await res.json()
        setItems(prev => [...prev, ...data.stories])
        setHasMore(data.hasMore)
        setOffset(prev => prev + data.stories.length)
      }
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }

  const left  = items.filter((_, i) => i % 2 === 0)
  const right = items.filter((_, i) => i % 2 !== 0)

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 items-start pb-4">
        <div className="flex flex-col gap-4">
          <h4 className="font-headline font-black uppercase text-[10px] tracking-widest opacity-40">Dispatch Briefs</h4>
          <div className="flex flex-col">
            {left.map(story => <StoryItem key={story.id} story={story} />)}
          </div>
        </div>
        <div className="lg:border-l lg:border-outline/10 lg:pl-10 flex flex-col gap-4">
          <h4 className="font-headline font-black uppercase text-[10px] tracking-widest opacity-40">Active Scenarios</h4>
          <div className="flex flex-col">
            {right.map(story => <StoryItem key={story.id} story={story} />)}
          </div>
        </div>
      </div>

      {hasMore && (
        <div className="pt-6 pb-10 flex justify-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-8 py-3 border border-outline/30 rounded-full font-headline font-bold text-xs uppercase tracking-widest text-on-background/50 hover:border-primary hover:text-primary transition-all disabled:opacity-40"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  )
}
