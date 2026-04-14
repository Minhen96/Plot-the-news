import { Suspense } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import SectionFeed from '@/components/SectionFeed'
import ArticleLink from '@/components/ArticleLink'
import FeedLoader from '@/components/FeedLoader'
import { fetchLatestNews, fetchLastWeekNews, fetchMarketNews, fetchCryptoNews } from '@/lib/newsdata'
import { LAST_WEEK_FALLBACK } from '@/data/news'
import { getAllStories, getStoriesByCategory } from '@/lib/stories'
import type { NewsArticle, Story, FeedItem } from '@/lib/types'
import { toStorySlug } from '@/lib/utils'

// Revalidate the hub every 5 minutes
export const revalidate = 300

const CATEGORY_MAP: Record<string, string> = {
  world:         'World',
  breaking:      'Breaking',
  crime:         'Crime',
  politics:      'Politics',
  economy:       'Finance',
  tech:          'Tech',
  health:        'Health',
  sports:        'Sports',
  entertainment: 'Entertainment',
}

// ── Shared sub-components ────────────────────────────────────────────────────

function ArticleImage({ src, alt, className }: { src: string | null; alt: string; className: string }) {
  if (!src) return <div className={`${className} bg-surface-container-high`} />
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} />
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 my-16">
      <div className="h-px flex-1 bg-on-background/10" />
      <h2 className="font-headline font-black uppercase text-xs tracking-[0.3em] text-on-background/40">
        {label}
      </h2>
      <div className="h-px flex-1 bg-on-background/10" />
    </div>
  )
}

function LeadStory({ article, size = 'large' }: { article: NewsArticle; size?: 'large' | 'medium' }) {
  return (
    <ArticleLink article={article} className="group block">
      <article className="flex flex-col gap-4">
        <div className="overflow-hidden">
          <ArticleImage
            src={article.image}
            alt={article.title}
            className={`w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 ${size === 'large' ? 'aspect-4/3' : 'aspect-video'}`}
          />
        </div>
        <div className="space-y-3">
          <h3 className={`font-headline font-extrabold leading-tight text-on-background group-hover:text-primary transition-colors ${
            size === 'large' ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'
          }`}>
            {article.title}
          </h3>
          {article.description && (
            <p className="text-sm font-body opacity-70 leading-relaxed line-clamp-3">
              {article.description}
            </p>
          )}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] font-label opacity-50 uppercase tracking-widest">
              {article.source.name} · {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
            <div className="text-[10px] font-label font-black uppercase tracking-widest text-primary flex items-center gap-1 group/btn">
              Launch <span className="transition-transform duration-300 group-hover/btn:translate-x-1 group-hover:translate-x-1">→</span>
            </div>
          </div>
        </div>
      </article>
    </ArticleLink>
  )
}

// ── Story Card Logic ──────────────────────────────────────────────────────────

function CrisisBadge({ level }: { level?: number }) {
  if (!level) return null
  const color = level >= 80 ? 'bg-red-100 text-red-700' : level >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
  return (
    <span className={`text-[9px] font-label font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${color}`}>
      Crisis {level}
    </span>
  )
}

function FeaturedStory({ story }: { story: Story }) {
  const article: NewsArticle = {
    title: story.title,
    description: story.summary || '',
    url: `/story/${story.id}`,
    image: story.imageUrl,
    publishedAt: story.date,
    source: { name: story.category, url: '' }
  }
  return (
    <ArticleLink article={article} className="group block">
      <article className="flex flex-col gap-4">
        <div className="overflow-hidden">
          <ArticleImage
            src={story.imageUrl}
            alt={story.title}
            className="w-full aspect-video object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-label font-black uppercase tracking-widest text-primary/70">
              {story.isGenerated ? `${story.coverEmoji} ${story.category}` : '🛰️ Satellite Uplink • Breaking'}
            </span>
            {story.isGenerated && <CrisisBadge level={story.crisisLevel} />}
          </div>
          <h3 className="text-xl md:text-2xl font-headline font-extrabold leading-tight text-on-background group-hover:text-primary transition-colors">
            {story.title}
          </h3>
          {story.summary && (
            <p className="text-sm font-body opacity-70 leading-relaxed line-clamp-2">{story.summary}</p>
          )}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] font-label opacity-50 uppercase tracking-widest">
              {new Date(story.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      </article>
    </ArticleLink>
  )
}

// ── MAIN HUB (Server Component) ─────────────────────────────────────────────

export default async function ChronicleHub({
  searchParams,
}: {
  searchParams: Promise<{ category?: string, generated?: string }>
}) {
  const { category, generated } = await searchParams
  const activeCategory = category && CATEGORY_MAP[category] ? category : 'world'
  const isGeneratedFilter = generated === 'true'

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-12 py-6">
      <Header brand="editorial" activeCategory={activeCategory} isGeneratedFilter={isGeneratedFilter} />

      <main className="mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 items-start">
          
          <Suspense fallback={<MainFeedSkeleton />}>
            <MainNewsFeed activeCategory={activeCategory} generatedOnly={isGeneratedFilter} />
          </Suspense>

          <Suspense fallback={<SidebarSkeleton />}>
            <SidebarArchiveWrapper activeCategory={activeCategory} />
          </Suspense>
        </div>

        {/* Streaming Sections */}
        <Suspense fallback={<SectionSkeleton label="Markets" />}>
          <MarketSectionWrapper />
        </Suspense>

        <Suspense fallback={<SectionSkeleton label="Crypto" />}>
          <CryptoSectionWrapper />
        </Suspense>
      </main>

      <footer className="mt-20 pt-10 border-t border-on-background/10 opacity-50 text-[10px] font-label font-bold uppercase tracking-[0.2em]">
        <div className="flex justify-between items-center py-6">
          <span>© 2026 The Illuminated Editorial</span>
          <div className="flex gap-8">
            <Link href="/archive">Archive</Link>
            <span>Privacy</span>
            <span>Ethic</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ── STREAMING WRAPPERS (Async Components) ─────────────────────────────────────

async function MainNewsFeed({ activeCategory, generatedOnly }: { activeCategory: string, generatedOnly: boolean }) {
  // Fetch first 20 — fast initial load, FeedLoader handles the rest
  let dbStories = await (activeCategory === 'world'
    ? getAllStories(20)
    : getStoriesByCategory(CATEGORY_MAP[activeCategory] || 'World', 20)
  ).catch(() => []) as Story[]

  if (generatedOnly) {
    dbStories = dbStories.filter(s => s.isGenerated)
  }

  // Fallback to live news API if DB has nothing for this category
  let stories = dbStories
  if (!generatedOnly && stories.length === 0) {
    const live = await fetchLatestNews(activeCategory, 10).catch(() => ({ articles: [] }))
    stories = live.articles.map(a => ({
      id: toStorySlug(a.title),
      title: a.title,
      summary: a.description,
      imageUrl: a.image || '',
      date: a.publishedAt,
      category: CATEGORY_MAP[activeCategory] || 'World',
      articleBody: [],
      historicalContext: '',
      isGenerated: false,
      status: 'active' as const,
      roles: [],
      panels: [],
      predictionOptions: [],
    }))
  }

  if (stories.length === 0) {
    return (
      <div className="flex flex-col gap-10 border-r border-outline/15 pr-8 py-20 text-center opacity-40 italic font-headline">
        Syncing localized dispatches...
      </div>
    )
  }

  const feedItems: FeedItem[] = stories.slice(1).map(s => ({
    id: s.id,
    title: s.title,
    summary: s.summary,
    imageUrl: s.imageUrl,
    date: s.date,
    category: s.category,
    isGenerated: s.isGenerated,
    coverEmoji: s.coverEmoji,
    crisisLevel: s.crisisLevel,
  }))

  return (
    <div className="relative border-r border-outline/15 pr-4">
      <div
        className="max-h-none overflow-y-visible lg:max-h-[calc(100vh-100px)] lg:overflow-y-auto overscroll-contain custom-scrollbar pr-6 scroll-smooth"
        style={{ scrollbarGutter: 'stable' }}
      >
        <div className="flex flex-col gap-10">
          <div className="pb-10 border-b border-outline/15">
            <h4 className="font-headline font-black uppercase text-xs tracking-widest mb-6 border-b-2 border-on-background pb-1 w-fit">
              Lead Story
            </h4>
            <FeaturedStory story={stories[0]} />
          </div>

          <FeedLoader
            initialItems={feedItems}
            category={activeCategory}
            initialHasMore={!generatedOnly && stories.length === 20}
          />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-linear-to-t from-background to-transparent pointer-events-none z-10" />
    </div>
  )
}

async function SidebarArchiveWrapper({ activeCategory }: { activeCategory: string }) {
  const archive = await fetchLastWeekNews(activeCategory, 6).catch(() => LAST_WEEK_FALLBACK)
  return (
    <aside className="lg:sticky lg:top-6">
      <div className="mb-4">
        <h4 className="font-headline font-black uppercase text-xs tracking-widest border-b-2 border-on-background pb-1 w-fit">The Week Before</h4>
      </div>
      <div className="divide-y divide-outline/20">
        {archive.map((article: NewsArticle, i: number) => (
          <article key={i} className="py-4">
            <ArticleLink article={article}>
              <h5 className="text-sm font-headline font-bold leading-tight hover:text-primary transition-colors">{article.title}</h5>
              <p className="text-[10px] font-label opacity-40 uppercase tracking-widest mt-2">
                {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {article.source?.name}
              </p>
            </ArticleLink>
          </article>
        ))}
      </div>
    </aside>
  )
}

async function MarketSectionWrapper() {
  const res = await fetchMarketNews(6).catch(() => ({ articles: [] }))
  if (res.articles.length === 0) return null
  return (
    <>
      <SectionDivider label="Markets" />
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8">
        <LeadStory article={res.articles[0]} size="medium" />
        <SectionFeed initialArticles={res.articles.slice(1)} nextPage={null} category="economy" />
      </div>
    </>
  )
}

async function CryptoSectionWrapper() {
  const res = await fetchCryptoNews(6).catch(() => ({ articles: [] }))
  if (res.articles.length === 0) return null
  return (
    <>
      <SectionDivider label="Crypto" />
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8">
        <LeadStory article={res.articles[0]} size="medium" />
        <SectionFeed initialArticles={res.articles.slice(1)} nextPage={null} category="tech" />
      </div>
    </>
  )
}

// ── SKELETONS ──────────────────────────────────────────────────────────────

function MainFeedSkeleton() { return <div className="border-r border-outline/15 pr-8 pointer-events-none opacity-20 bg-on-background/5 h-[80vh] rounded-lg animate-pulse" /> }
function SidebarSkeleton() { return <div className="animate-pulse bg-on-background/5 h-64 rounded-lg" /> }
function SectionSkeleton({ label }: { label: string }) { 
  return (
    <>
      <SectionDivider label={label} />
      <div className="animate-pulse bg-on-background/5 h-48 rounded-lg" />
    </>
  )
}
