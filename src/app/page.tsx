import Link from 'next/link'
import Header from '@/components/Header'
import SectionFeed from '@/components/SectionFeed'
import TopFeed from '@/components/TopFeed'
import ArticleLink from '@/components/ArticleLink'
import { fetchLatestNews, fetchLastWeekNews, fetchMarketNews, fetchCryptoNews } from '@/lib/newsdata'
import { WORLD_FALLBACK, LAST_WEEK_FALLBACK } from '@/data/news'
import { getAllStories } from '@/lib/stories'
import type { NewsArticle, Story } from '@/lib/types'

const CATEGORY_MAP: Record<string, string> = {
  world:    'world',
  politics: 'politics',
  economy:  'economy',
  culture:  'culture',
  science:  'science',
  health:   'health',
  sports:   'sports',
  opinion:  'opinion',
}

// ── Shared sub-components ─────────────────────────────────────────────────────

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

// Lead story card for live news — used in Markets/Crypto sections
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

// ── DB story sub-components ───────────────────────────────────────────────────

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
  return (
    <Link href={`/story/${story.id}`} className="group block">
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
              {story.coverEmoji} {story.category}
            </span>
            <CrisisBadge level={story.crisisLevel} />
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
            <div className="text-[10px] font-label font-black uppercase tracking-widest text-primary flex items-center gap-1 group/btn">
              Read &amp; Play <span className="transition-transform duration-300 group-hover/btn:translate-x-1 group-hover:translate-x-1">→</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}

function StoryItem({ story }: { story: Story }) {
  return (
    <Link href={`/story/${story.id}`} className="group block py-4 border-b border-outline/15 last:border-0">
      <div className="flex gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[9px] font-label font-black uppercase tracking-widest text-primary/60">
              {story.coverEmoji} {story.category}
            </span>
            <CrisisBadge level={story.crisisLevel} />
          </div>
          <h4 className="font-headline font-bold text-sm leading-snug mb-1 group-hover:text-primary transition-colors line-clamp-2">
            {story.title}
          </h4>
          {story.summary && (
            <p className="text-xs font-body opacity-60 line-clamp-2 leading-relaxed">{story.summary}</p>
          )}
          <span className="text-[10px] font-label opacity-40 uppercase tracking-widest mt-1 block">
            {new Date(story.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
        {story.imageUrl && (
          <div className="w-14 h-14 shrink-0 overflow-hidden ring-1 ring-outline/10 group-hover:ring-primary/30 transition-all">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={story.imageUrl} alt={story.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
          </div>
        )}
      </div>
    </Link>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function ChronicleHub({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const activeCategory = category && CATEGORY_MAP[category] ? category : 'world'

  // Try DB first — if empty, fall back to live news, then static
  const dbStories = await getAllStories().catch(() => [])
  const hasDbStories = dbStories.length > 0

  const [
    lastWeekArticles,
    { articles: marketArticles, nextPage: marketNextPage },
    { articles: cryptoArticles, nextPage: cryptoNextPage },
    primaryResult,
  ] = await Promise.all([
    fetchLastWeekNews(activeCategory, 6).catch(() => []),
    fetchMarketNews(6).catch(() => ({ articles: [], nextPage: null })),
    fetchCryptoNews(6).catch(() => ({ articles: [], nextPage: null })),
    // Fetch live news when DB is empty OR has too few stories to fill the feed
    hasDbStories && dbStories.length >= 4
      ? Promise.resolve(null)
      : fetchLatestNews(activeCategory, 10).catch(() => null),
  ])

  // Resolve main feed source
  const liveArticles = primaryResult?.articles ?? []
  const primary = liveArticles.length > 0 ? liveArticles : WORLD_FALLBACK
  const lastWeek = lastWeekArticles.length > 0 ? lastWeekArticles : LAST_WEEK_FALLBACK

  const marketFeatured = marketArticles[0]
  const marketList     = marketArticles.slice(1)
  const cryptoFeatured = cryptoArticles[0]
  const cryptoList     = cryptoArticles.slice(1)

  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-6">
      <Header brand="editorial" activeCategory={activeCategory} />

      <main className="mt-8">

        {/* ── Top section: main feed + The Week Before ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 items-start">

          {/* Left 2/3 — DB stories OR live news TopFeed */}
          {hasDbStories ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 items-start border-r border-outline/15 pr-8">
              <div>
                <h4 className="font-headline font-black uppercase text-xs tracking-widest mb-4 border-b-2 border-on-background pb-1 w-fit">
                  Lead Story
                </h4>
                <FeaturedStory story={dbStories[0]} />
              </div>
              <div>
                <h4 className="font-headline font-black uppercase text-xs tracking-widest mb-4 border-b-2 border-on-background pb-1 w-fit">
                  {dbStories.slice(1).length > 0 ? 'Active Scenarios' : 'Latest Dispatches'}
                </h4>
                {dbStories.slice(1).length > 0
                  ? dbStories.slice(1).map(story => (
                      <StoryItem key={story.id} story={story} />
                    ))
                  : primary.slice(0, 6).map(article => (
                      <ArticleLink key={article.url} article={article} className="group block py-4 border-b border-outline/15 last:border-0">
                        <article className="flex gap-3">
                          <div className="flex-1 min-w-0">
                            <span className="text-[9px] font-label font-black uppercase tracking-widest text-primary/60 block mb-1">
                              {article.source.name}
                            </span>
                            <h4 className="font-headline font-bold text-sm leading-snug mb-1 group-hover:text-primary transition-colors line-clamp-2">
                              {article.title}
                            </h4>
                            <span className="text-[10px] font-label opacity-40 uppercase tracking-widest">
                              {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          {article.image && (
                            <div className="w-14 h-14 shrink-0 overflow-hidden ring-1 ring-outline/10">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                            </div>
                          )}
                        </article>
                      </ArticleLink>
                    ))
                }
              </div>
            </div>
          ) : (
            <TopFeed
              key={activeCategory}
              featured={primary[0]}
              initialArticles={primary.slice(1)}
              nextPage={primaryResult?.nextPage ?? null}
              category={activeCategory}
              sectionLabel={activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}
            />
          )}

          {/* Right 1/3 — The Week Before (always live) */}
          <aside className="lg:sticky lg:top-6">
            <div className="mb-4">
              <h4 className="font-headline font-black uppercase text-xs tracking-widest border-b-2 border-on-background pb-1 w-fit">
                The Week Before
              </h4>
              <p className="text-[10px] font-label opacity-50 uppercase tracking-widest mt-1">
                {activeCategory} · earlier
              </p>
            </div>
            <div className="divide-y divide-outline/20">
              {lastWeek.map((article) => (
                <ArticleLink key={article.url} article={article} className="group block pt-5 first:pt-0">
                  <article>
                    <h5 className="text-sm font-headline font-bold leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </h5>
                    {article.description && (
                      <p className="text-xs opacity-60 font-body line-clamp-2 mb-2">
                        {article.description}
                      </p>
                    )}
                    <span className="text-[10px] font-label opacity-40 uppercase tracking-widest">
                      {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {' · '}{article.source.name}
                    </span>
                  </article>
                </ArticleLink>
              ))}
            </div>
          </aside>
        </div>

        {/* ── Markets section (always live) ── */}
        {marketFeatured && (
          <>
            <SectionDivider label="Markets" />
            <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 items-start">
              <LeadStory article={marketFeatured} size="medium" />
              <SectionFeed initialArticles={marketList} nextPage={marketNextPage} category="economy" />
            </div>
          </>
        )}

        {/* ── Crypto section (always live) ── */}
        {cryptoFeatured && (
          <>
            <SectionDivider label="Crypto" />
            <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 items-start">
              <LeadStory article={cryptoFeatured} size="medium" />
              <SectionFeed initialArticles={cryptoList} nextPage={cryptoNextPage} q="bitcoin,ethereum,cryptocurrency" />
            </div>
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="mt-20 pt-10 border-t-4 border-on-background">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-12">
          <div>
            <h2 className="text-3xl font-headline font-extrabold italic mb-4 leading-none text-on-background">
              The Illuminated Editorial
            </h2>
            <p className="max-w-md text-sm opacity-70 leading-relaxed font-body italic">
              Established 2026. A journal dedicated to the intersection of human narrative
              and systemic complexity. Powered by AI foresight and blockchain-verified truth.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-4 font-label text-[10px] font-black uppercase tracking-widest">
            {['Archives', 'Ethics Policy', 'Masthead', 'Contact', 'Privacy', 'Newsletter'].map((link) => (
              <a key={link} href="#" className="hover:text-primary transition-colors hover:underline">
                {link}
              </a>
            ))}
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center py-6 border-t border-outline/20 text-[10px] font-label font-bold tracking-[0.2em] uppercase opacity-50">
          <span>© 2026 The Illuminated Editorial · FutureLens. All Rights Reserved.</span>
          <div className="flex gap-6 mt-4 md:mt-0">
            {['Twitter', 'Instagram', 'RSS'].map((s) => (
              <span key={s} className="cursor-pointer hover:opacity-100">{s}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
