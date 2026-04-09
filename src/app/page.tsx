import Header from '@/components/Header'
import SectionFeed from '@/components/SectionFeed'
import TopFeed from '@/components/TopFeed'
import ArticleLink from '@/components/ArticleLink'
import { fetchLatestNews, fetchLastWeekNews, fetchMarketNews, fetchCryptoNews } from '@/lib/newsdata'
import { WORLD_FALLBACK, LAST_WEEK_FALLBACK } from '@/data/news'
import type { NewsArticle } from '@/lib/types'

// Maps URL ?category= → newsdata category keys
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

// Lead story card — used in top section (left col) and market/crypto sections
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


export default async function ChronicleHub({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const activeCategory = category && CATEGORY_MAP[category] ? category : 'world'

  const [
    { articles: primaryArticles, nextPage },
    lastWeekArticles,
    { articles: marketArticles, nextPage: marketNextPage },
    { articles: cryptoArticles, nextPage: cryptoNextPage },
  ] = await Promise.all([
    fetchLatestNews(activeCategory, 10),
    fetchLastWeekNews(activeCategory, 6),
    fetchMarketNews(6),
    fetchCryptoNews(6),
  ])

  const primary  = primaryArticles.length  > 0 ? primaryArticles  : WORLD_FALLBACK
  const lastWeek = lastWeekArticles.length  > 0 ? lastWeekArticles : LAST_WEEK_FALLBACK
  const markets  = marketArticles
  const crypto   = cryptoArticles

  const featured = primary[0]

  const marketFeatured = markets[0]
  const marketList     = markets.slice(1)
  const cryptoFeatured = crypto[0]
  const cryptoList     = crypto.slice(1)


  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-6">
      <Header brand="editorial" activeCategory={activeCategory} />

      <main className="mt-8">

        {/* ── Top section: Lead+Category (page scroll) / Last Week ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 items-start">

          {/* Left 2/3 — Lead story (left col) + category articles (both cols), page scroll */}
          <TopFeed
            key={activeCategory}
            featured={featured}
            initialArticles={primary.slice(1)}
            nextPage={nextPage}
            category={activeCategory}
            sectionLabel={activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}
          />

          {/* Right 1/3 — Last Week (sticky) */}
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
            {/* <Link
              href="/archive?week=last"
              className="mt-6 inline-flex items-center gap-1 text-[10px] font-label font-black uppercase tracking-widest text-primary border-b border-primary/30 hover:border-primary transition-colors"
            >
              See all last week →
            </Link> */}
          </aside>
        </div>

        {/* ── Markets section ── */}
        {marketFeatured && (
          <>
            <SectionDivider label="Markets" />
            <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 items-start">
              <LeadStory article={marketFeatured} size="medium" />
              <SectionFeed initialArticles={marketList} nextPage={marketNextPage} category="economy" />
            </div>
          </>
        )}

        {/* ── Crypto section ── */}
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
