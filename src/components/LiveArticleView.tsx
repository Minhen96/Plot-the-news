'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { NewsArticle } from '@/lib/types'

interface Props {
  slug: string
}

interface RelatedArticle {
  title: string
  description: string
  url: string
  image: string | null
  publishedAt: string
  source: { name: string; url: string }
}

// Strip HTML tags and normalise whitespace
function stripHtml(text: string): string {
  return text
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Split text into display paragraphs (~3 sentences each)
function toParagraphs(raw: string): string[] {
  const text = stripHtml(raw)
  if (!text) return []
  const sentences = text.match(/[^.!?]+[.!?]+/g) ?? [text]
  const paras: string[] = []
  for (let i = 0; i < sentences.length; i += 3) {
    paras.push(sentences.slice(i, i + 3).join(' ').trim())
  }
  return paras.filter(Boolean)
}

// Extract a short search query from article title
function toSearchQuery(article: NewsArticle): string {
  if (article.keywords?.length) return article.keywords.slice(0, 3).join(' ')
  // Fall back to first 5 meaningful words from title
  const stop = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'and', 'or', 'in', 'on', 'at', 'to', 'of', 'for', 'with', 'by'])
  const words = article.title.split(/\s+/).filter(w => !stop.has(w.toLowerCase()) && w.length > 2)
  return words.slice(0, 5).join(' ')
}

export default function LiveArticleView({ slug }: Props) {
  const [article, setArticle]   = useState<NewsArticle | null>(null)
  const [related, setRelated]   = useState<RelatedArticle[]>([])
  const [ready, setReady]       = useState(false)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(`article:${slug}`)
      if (raw) setArticle(JSON.parse(raw) as NewsArticle)
    } catch { /* ignore */ }
    setReady(true)
  }, [slug])

  useEffect(() => {
    if (!article) return
    const q = toSearchQuery(article)
    fetch(`/api/news/related?q=${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then(d => setRelated(d.articles ?? []))
      .catch(() => {})
  }, [article])

  if (!ready) return null

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-24 text-center">
        <p className="font-headline font-bold text-2xl text-on-surface/40 mb-6">Article not found</p>
        <Link href="/" className="text-[10px] font-label font-black uppercase tracking-widest text-primary border-b border-primary/30 hover:border-primary transition-colors">
          ← Back to Chronicle
        </Link>
      </div>
    )
  }

  const date = new Date(article.publishedAt).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })

  const paragraphs = toParagraphs(article.content || article.description || '')

  return (
    <main className="max-w-4xl mx-auto px-6 pt-12 pb-24">

      {/* Breadcrumb */}
      <div className="mb-10 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-on-surface/50 font-label text-xs uppercase tracking-widest font-bold">
          <Link href="/" className="hover:text-primary transition-colors">The Chronicle</Link>
          <span>›</span>
          <span className="text-primary">{article.source.name}</span>
        </div>

        <h2 className="font-headline text-4xl md:text-5xl font-extrabold text-on-surface leading-[1.1] tracking-tight">
          {article.title}
        </h2>

        <div className="flex items-center gap-4 mt-2">
          <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center shrink-0">
            <span className="font-headline font-black text-primary text-sm">
              {article.source.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-headline font-bold text-sm text-on-surface">{article.source.name}</p>
            <p className="font-body text-sm text-on-surface/60 italic">{date}</p>
          </div>
        </div>
      </div>

      {/* Hero image */}
      <div className="relative group mb-12">
        <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary-container/20 rounded-full blur-3xl -z-10" />
        <div className="overflow-hidden bg-surface-container-high aspect-video">
          {article.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover grayscale-10 hover:grayscale-0 transition-all duration-700 scale-105 hover:scale-100"
            />
          ) : (
            <div className="w-full h-full bg-linear-to-br from-on-surface/70 via-on-surface/40 to-primary/20" />
          )}
        </div>
      </div>

      {/* Article body */}
      <article className="mb-16 space-y-6">
        {paragraphs.length > 0 ? (
          paragraphs.map((para, i) => (
            <p
              key={i}
              className={`font-body leading-relaxed text-on-surface ${
                i === 0
                  ? 'text-xl md:text-2xl first-letter:text-7xl first-letter:font-bold first-letter:text-primary first-letter:mr-3 first-letter:float-left first-letter:font-headline first-letter:leading-none'
                  : 'text-lg'
              }`}
            >
              {para}
            </p>
          ))
        ) : (
          <div className="py-10 border-l-4 border-outline/20 pl-6">
            <p className="font-headline font-bold text-on-surface/50 mb-1">Preview not available</p>
            <p className="font-body text-sm text-on-surface/40">
              This article&apos;s text isn&apos;t included in the free news feed. Read it in full at the original source below.
            </p>
          </div>
        )}
      </article>

      {/* Read original */}
      {article.url && !article.url.startsWith('#') && (
        <div className="mb-16 p-6 bg-surface-container-low border-l-4 border-outline/30">
          <p className="font-label text-[10px] uppercase tracking-widest text-on-surface/50 mb-2">Original Source</p>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-headline font-bold text-sm text-primary hover:underline flex items-center gap-1"
          >
            Read full article at {article.source.name} ↗
          </a>
        </div>
      )}

      {/* Launch Interactive CTA */}
      <div className="flex flex-col items-center justify-center py-16 px-8 bg-linear-to-br from-primary to-on-surface text-white mb-20">
        <h4 className="font-headline text-3xl font-bold mb-4 text-center">
          Inside the Shadow War
        </h4>
        <p className="font-body text-lg opacity-90 text-center mb-10 max-w-lg leading-relaxed">
          Experience the high-stakes world of geopolitical brinkmanship through an immersive
          visual narrative. Pick your faction. Lock your prediction on-chain.
        </p>
        <Link
          href="/story/strait-of-hormuz/role"
          className="bg-primary-container text-on-surface px-12 py-5 font-headline font-bold text-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
        >
          ✦ Launch Interactive
        </Link>
      </div>

      {/* Deep Dive — related coverage from GNews */}
      {related.length > 0 && (
        <section className="mt-20 pt-16 border-t border-outline-variant/30">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-px flex-1 bg-outline-variant/30" />
            <h3 className="font-headline text-sm font-black uppercase tracking-[0.3em] text-on-surface/50">
              Deep Dive
            </h3>
            <div className="h-px flex-1 bg-outline-variant/30" />
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-1 mb-6">
              <h4 className="font-headline font-bold text-2xl text-on-surface">
                Related Coverage
              </h4>
              <p className="font-body text-sm text-on-surface/60 italic">
                Real-world sources covering this story.
              </p>
            </div>
            <ul className="space-y-3">
              {related.map((ref) => (
                <li key={ref.url}>
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between p-4 bg-surface-container-low hover:bg-surface-container-lowest hover:shadow-sm border border-outline-variant/15 hover:border-primary/30 transition-all"
                  >
                    <div className="flex gap-4 items-start flex-1 min-w-0">
                      {ref.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={ref.image}
                          alt={ref.title}
                          className="w-14 h-14 object-cover shrink-0"
                        />
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className="font-headline font-bold text-sm text-on-surface group-hover:text-primary transition-colors line-clamp-2">
                          {ref.title}
                        </span>
                        <span className="font-label text-[10px] uppercase tracking-widest text-tertiary mt-1">
                          {ref.source.name} · {new Date(ref.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <span className="text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0 ml-3">
                      ↗
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

    </main>
  )
}
