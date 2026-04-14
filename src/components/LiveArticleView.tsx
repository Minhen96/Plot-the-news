'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import SimulationLoading from '@/components/SimulationLoading'
import type { NewsArticle } from '@/lib/types'

interface InitialArticleData {
  title: string
  summary?: string
  imageUrl?: string
  date?: string
  articleBody?: string[]
  sourceUrl?: string
}

interface Props {
  slug: string
  initialData?: InitialArticleData
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
  // Priority 1: Use keywords if available
  if (article.keywords?.length) return article.keywords.slice(0, 3).join(' ')
  
  // Priority 2: Cleaned headline (first 6 words, no special chars)
  const clean = article.title
    .replace(/[^\w\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(w => w.length > 2)
    .slice(0, 6)
    .join(' ')
    
  return clean || article.title.slice(0, 30)
}

export default function LiveArticleView({ slug, initialData }: Props) {
  // Synchronous initialization — sessionStorage first, then server-passed data, then null
  const [article, setArticle] = useState<NewsArticle | null>(() => {
    if (typeof window === 'undefined') {
      // SSR: seed from initialData so the shell renders with content
      if (initialData) {
        return {
          title: initialData.title,
          description: initialData.summary ?? '',
          url: initialData.sourceUrl ?? '',
          image: initialData.imageUrl ?? null,
          publishedAt: initialData.date ?? new Date().toISOString(),
          source: { name: initialData.sourceUrl ? new URL(initialData.sourceUrl).hostname : 'Intelligence', url: '' },
          articleBody: initialData.articleBody,
        } as any
      }
      return null
    }
    try {
      const raw = sessionStorage.getItem(`article:${slug}`)
      if (raw) return JSON.parse(raw) as NewsArticle
    } catch { /* ignore */ }
    // Seed from server data so we can render immediately
    if (initialData) {
      return {
        title: initialData.title,
        description: initialData.summary ?? '',
        url: initialData.sourceUrl ?? '',
        image: initialData.imageUrl ?? null,
        publishedAt: initialData.date ?? new Date().toISOString(),
        source: { name: initialData.sourceUrl ? new URL(initialData.sourceUrl).hostname : 'Intelligence', url: '' },
        articleBody: initialData.articleBody,
      } as any
    }
    return null
  })

  const [related, setRelated]           = useState<RelatedArticle[]>([])
  const [enrichedBody, setEnrichedBody] = useState<string>('')
  const [ready, setReady]               = useState(!!article)
  const [isCrawling, setIsCrawling]     = useState(!article || !(article as any).articleBody)
  
  const [showConfirm, setShowConfirm]   = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [genStep, setGenStep]           = useState('')

  useEffect(() => {
    let retries = 0
    const maxRetries = 3

    async function loadArticle() {
      // If we already have the full body (from cache, sessionStorage, or initialData), we're done
      if (article && (article as any).articleBody && (article as any).articleBody.length > 0) {
        setReady(true)
        setIsCrawling(false)
        return
      }

      try {
        // Fetch/Generate from our DB (handles Deep Crawl if needed)
        const res = await fetch(`/api/stories/generate?newsId=${slug}`)
        if (res.ok) {
          const data = await res.json()
          
          // Check if we still have an empty body
          const hasBody = data.articleBody && data.articleBody.length > 0
          
          const fullArticle = {
            title: data.title,
            description: data.summary,
            url: data.sourceUrl || '',
            image: data.imageUrl,
            publishedAt: data.date,
            source: { name: data.sourceUrl ? new URL(data.sourceUrl).hostname : 'Intelligence', url: '' },
            articleBody: data.articleBody,
            references: data.refs || [],
          } as any

          setArticle(fullArticle)

          // If body is STILL missing, retry after a delay
          if (!hasBody && retries < maxRetries) {
            retries++
            setTimeout(loadArticle, 2000)
            return
          }

          // Once we have a body OR maxed out retries, update cache and UI
          if (hasBody) {
            try { sessionStorage.setItem(`article:${slug}`, JSON.stringify(fullArticle)) } catch {}
            setReady(true)
            setIsCrawling(false)
          } else if (retries >= maxRetries) {
            setReady(true)
            setIsCrawling(false)
          }
        }
      } catch (err) {
        console.error('Failed to load article:', err)
        setReady(true)
        setIsCrawling(false)
      }
    }
    
    loadArticle()
  }, [slug])

  useEffect(() => {
    if (!article) return
    
    // OPTIMIZATION: If we already have references from the DB, don't hunt for more
    if ((article as any).references?.length > 0) {
      setRelated((article as any).references)
      return
    }

    const q = toSearchQuery(article)
    fetch(`/api/news/related?q=${encodeURIComponent(q)}&newsId=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then(async d => {
        const articles: RelatedArticle[] = d.articles ?? []
        setRelated(articles)
        
        // PERSISTENCE: Save these discovered refs back to the DB to avoid future API costs
        if (articles.length > 0 && slug) {
          try {
            await fetch('/api/stories/save-refs', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                newsId: slug,
                refs: articles.map(a => ({
                  title: a.title,
                  source: a.source.name,
                  url: a.url
                }))
              })
            })
          } catch (e) { console.error('Failed to cache refs:', e) }
        }

        if (articles.length > 0 && articles[0].description) {
          const own = article.content || article.description || ''
          if (own.length < 200 && articles[0].description.length > own.length) {
            setEnrichedBody(articles[0].description)
          }
        }
      })
      .catch(() => {})
  }, [article, slug])

  async function activateMission() {
    setIsGenerating(true)
    setShowConfirm(false)
    setGenStep('Initializing Satellite Uplink...')
    
    try {
      setGenStep('Analyzing Geopolitical Context...')
      const res = await fetch('/api/stories/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newsId: slug })
      })
      
      if (!res.ok) throw new Error('Activation failed')
      
      setGenStep('Synthesizing Comics...')
      const data = await res.json()
      
      window.location.href = `/story/${data.id}/role`
    } catch (err) {
      console.error(err)
      setIsGenerating(false)
      setShowConfirm(false)
    }
  }

  if (!ready) {
    return (
      <main className="max-w-4xl mx-auto px-4 md:px-6 pt-12 pb-24 animate-pulse">
        <div className="mb-10 flex flex-col gap-4">
          <div className="h-3 w-32 bg-on-surface/10 rounded" />
          <div className="h-10 w-3/4 bg-on-surface/10 rounded" />
          <div className="h-10 w-1/2 bg-on-surface/10 rounded" />
          <div className="flex items-center gap-4 mt-2">
            <div className="w-10 h-10 rounded-full bg-on-surface/10 shrink-0" />
            <div className="flex flex-col gap-1.5">
              <div className="h-3 w-28 bg-on-surface/10 rounded" />
              <div className="h-3 w-20 bg-on-surface/10 rounded" />
            </div>
          </div>
        </div>
        <div className="aspect-video w-full bg-on-surface/10 rounded mb-12" />
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="h-4 bg-on-surface/10 rounded w-full" />
          <div className="h-4 bg-on-surface/10 rounded w-5/6" />
          <div className="h-4 bg-on-surface/10 rounded w-4/6" />
          <div className="h-4 bg-on-surface/10 rounded w-full" />
          <div className="h-4 bg-on-surface/10 rounded w-3/4" />
        </div>
      </main>
    )
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-6 pt-24 pb-24 text-center">
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

  const body = enrichedBody || (article as any).content || article.description || ''
  // Ensure even DB-stored articleBody gets formatted into readable chunks
  const paragraphs = toParagraphs(
    Array.isArray((article as any).articleBody) 
      ? (article as any).articleBody.join('\n\n') 
      : body
  )

  return (
    <>
      {/* Simulation Activation Overlay */}
      {isGenerating && (
        <div className="fixed inset-0 z-[200] bg-background overflow-hidden animate-in fade-in duration-500">
          <SimulationLoading />
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-surface/80 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="max-w-md w-full bg-surface-container-high p-6 md:p-8 rounded-3xl shadow-[0_32px_64px_-15px_rgba(0,0,0,0.2)] border border-primary/10 mx-4">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary text-2xl mb-6">
              🛰️
            </div>
            <h2 className="text-2xl font-headline font-black text-on-surface mb-3 tracking-tight">
              Activate Dossier?
            </h2>
            <p className="text-on-surface/70 font-body leading-relaxed mb-8">
              This event has not been simulated. Compiling the AI narration and comic sequence will take ~45 seconds. 
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={activateMission}
                className="w-full py-4 bg-primary text-on-primary rounded-xl font-headline font-black uppercase tracking-widest text-[11px] hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                Compile Intelligence
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="w-full py-4 bg-surface-container-highest text-on-surface/50 rounded-xl font-headline font-black uppercase tracking-widest text-[11px] hover:bg-surface-container-highest/80 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 md:px-6 pt-12 pb-24">
        {/* Breadcrumb */}
        <div className="mb-10 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-on-surface/50 font-label text-[10px] sm:text-xs uppercase tracking-widest font-bold min-w-0">
            <Link href="/" className="hover:text-primary transition-colors shrink-0">The Chronicle</Link>
            <span className="shrink-0">›</span>
            <span className="text-primary truncate">{article.source.name}</span>
          </div>

          <h2 className="font-headline text-3xl md:text-4xl lg:text-5xl font-extrabold text-on-surface leading-[1.1] tracking-tight break-words">
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

        {/* Intelligence Briefing */}
        <div className="max-w-2xl mx-auto bg-surface-container-low rounded-2xl p-6 mb-12 border-l-2 border-primary/40 relative overflow-hidden group/briefing">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-4xl select-none group-hover/briefing:opacity-10 transition-opacity">✦</div>
          <h3 className="text-[10px] font-label font-black uppercase tracking-[0.2em] text-primary mb-4">
            Intelligence Briefing
          </h3>
          <ul className="space-y-3">
            {paragraphs.slice(0, 2).map((p, i) => (
              <li key={i} className="flex gap-3 text-sm font-body leading-relaxed text-on-surface/80">
                <span className="text-primary/40 shrink-0 mt-1.5">•</span>
                <span className="line-clamp-3">{p}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Article body */}
        <article className="max-w-2xl mx-auto mb-16 space-y-8">
          {paragraphs.length > 0 ? (
            paragraphs.map((para: string, i: number) => (
              <p
                key={i}
                className={`font-body leading-relaxed text-on-surface/90 ${
                  i === 0
                    ? 'text-xl md:text-2xl first-letter:text-5xl md:first-letter:text-7xl first-letter:font-bold first-letter:text-primary first-letter:mr-4 first-letter:float-left first-letter:font-headline first-letter:leading-none'
                    : 'text-lg italic:mb-4'
                }`}
              >
                {para}
              </p>
            ))
          ) : isCrawling ? (
            <div className="space-y-6 animate-pulse">
              <div className="h-4 bg-on-surface/5 rounded w-full" />
              <div className="h-4 bg-on-surface/5 rounded w-5/6" />
              <div className="h-4 bg-on-surface/5 rounded w-4/6" />
              <div className="pt-8 flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                <span className="text-[10px] font-label font-bold uppercase tracking-[0.2em] text-primary/60">
                  Synchronizing Deep Intelligence...
                </span>
              </div>
            </div>
          ) : (
            <div className="py-10 border-l-4 border-outline/20 pl-6">
              <p className="font-headline font-bold text-on-surface/50 mb-1">Preview not available</p>
              <p className="font-body text-sm text-on-surface/40">
                This article&apos;s text isn&apos;t included in the free news feed. Read it in full at the original source below.
              </p>
            </div>
          )}
        </article>

        {/* Launch Interactive CTA */}
        <div className="flex flex-col items-center justify-center py-16 px-6 md:px-8 bg-linear-to-br from-primary to-on-surface text-white mb-20">
          <h4 className="font-headline text-2xl md:text-3xl font-bold mb-4 text-center">
            Inside the Shadow War
          </h4>
          <p className="font-body text-lg opacity-90 text-center mb-10 max-w-lg leading-relaxed">
            Experience the high-stakes world of geopolitical brinkmanship through an immersive
            visual narrative. Pick your faction. Lock your prediction on-chain.
          </p>
          <button
            onClick={() => setShowConfirm(true)}
            className="bg-primary-container text-on-surface px-12 py-5 font-headline font-bold text-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
          >
            ✦ Launch Mission
          </button>
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
                            {typeof ref.source === 'string' ? ref.source : (ref.source as any)?.name || 'News'}{ref.publishedAt ? ` · ${new Date(ref.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}
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
    </>
  )
}
