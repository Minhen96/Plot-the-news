import Link from 'next/link'
import Header from '@/components/Header'
import NewsFeed from '@/components/NewsFeed'
import { fetchGNewsArticles } from '@/lib/gnews'
import { toStorySlug } from '@/lib/utils'
import type { GNewsArticle } from '@/lib/types'

// Shown only when GNEWS_API_KEY is not set
const WORLD_FALLBACK: GNewsArticle[] = [
  {
    title: 'Iran Moves to Close Strait of Hormuz — Oil Markets in Freefall',
    description:
      'As geopolitical tensions escalate in the Strait of Hormuz, the world watches a high-stakes chess match on the high seas. A narrow corridor where global energy security meets modern naval brinkmanship.',
    url: '#',
    image: null,
    publishedAt: new Date().toISOString(),
    source: { name: 'The Illuminated Editorial', url: '#' },
    crisisLevel: 92,
    factions: [
      { name: 'The Coalition (West)', stance: 'Defensive' },
      { name: 'The Regional Guard (Iran)', stance: 'Aggressive' }
    ]
  },
  {
    title: 'The Amazon\'s Last Breath: Satellite Data Reveals Accelerating Shifts',
    description:
      'Unprecedented shifts in the rainforest\'s ecosystem demand immediate global conservation efforts as tipping points loom.',
    url: '#',
    image: null,
    publishedAt: new Date().toISOString(),
    source: { name: 'The Illuminated Editorial', url: '#' },
  },
  {
    title: 'Urban Gridlock: The True Cost of Modern Mobility',
    description:
      'Infrastructure failures in major cities are costing the global economy trillions in lost productivity annually.',
    url: '#',
    image: null,
    publishedAt: new Date().toISOString(),
    source: { name: 'The Illuminated Editorial', url: '#' },
  },
]

const ECONOMY_FALLBACK: GNewsArticle[] = [
  {
    title: 'The Rebirth of Local Currency',
    description: 'Small communities are turning to hyper-local bartering systems as trust in central banks erodes.',
    url: '#',
    image: null,
    publishedAt: new Date().toISOString(),
    source: { name: 'The Illuminated Editorial', url: '#' },
  },
  {
    title: 'Market Analysis: The Circuit Pulse',
    description: 'Tech stocks fluctuate as global supply chains tighten further amid geopolitical uncertainty.',
    url: '#',
    image: null,
    publishedAt: new Date().toISOString(),
    source: { name: 'The Illuminated Editorial', url: '#' },
  },
]

function ArticleImage({
  src,
  alt,
  className,
}: {
  src: string | null
  alt: string
  className: string
}) {
  if (!src) {
    return <div className={`${className} bg-surface-container-high`} />
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={className} />
  )
}

export default async function ChronicleHub() {
  const [worldArticles, economyArticles, techArticles, politicsArticles] = await Promise.all([
    fetchGNewsArticles('world', 10),
    fetchGNewsArticles('business', 10),
    fetchGNewsArticles('technology', 10),
    fetchGNewsArticles('politics', 10),
  ])

  const world = worldArticles.length > 0 ? worldArticles : WORLD_FALLBACK
  const economy = economyArticles.length > 0 ? economyArticles : ECONOMY_FALLBACK

  const featured = world[0]
  const sidebarArticles = world.slice(1, 3)

  // Feed = everything not used in the 3-col layout, mixed across categories
  const feedArticles = [
    ...world.slice(3),
    ...techArticles,
    ...politicsArticles,
    ...economyArticles.slice(2),
  ]

  return (
    <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-6">
      <Header brand="editorial" />

      <main className="mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr_1fr] gap-8">

          {/* ── Left column: World News + Opinion ── */}
          <aside className="space-y-8">
            <section>
              <h4 className="font-headline font-black uppercase text-xs tracking-widest mb-4 border-b-2 border-on-background pb-1 w-fit">
                World News
              </h4>
              <div className="space-y-6">
                {sidebarArticles[0] && (
                  <article className="group">
                    <h5 className="text-xl font-headline font-bold leading-tight mb-2 group-hover:underline">
                      {sidebarArticles[0].title}
                    </h5>
                    <p className="text-sm opacity-80 leading-relaxed mb-3 font-body">
                      {sidebarArticles[0].description}
                    </p>
                    <a
                      href={sidebarArticles[0].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-label font-black uppercase tracking-widest text-primary"
                    >
                      Enter Story →
                    </a>
                  </article>
                )}

                <div className="border-t border-outline/20" />

                {sidebarArticles[1] && (
                  <article className="group">
                    <h5 className="text-xl font-headline font-bold leading-tight mb-2 group-hover:underline">
                      {sidebarArticles[1].title}
                    </h5>
                    <ArticleImage
                      src={sidebarArticles[1].image}
                      alt={sidebarArticles[1].title}
                      className="w-full h-32 object-cover mb-3 grayscale hover:grayscale-0 transition-all duration-500"
                    />
                    <p className="text-sm opacity-80 leading-relaxed font-body">
                      {sidebarArticles[1].description}
                    </p>
                  </article>
                )}
              </div>
            </section>

            <div className="border-t border-outline/20" />

            <section>
              <h4 className="font-headline font-black uppercase text-xs tracking-widest mb-4 border-b-2 border-on-background pb-1 w-fit">
                Opinion
              </h4>
              <article>
                <span className="italic text-sm font-body mb-1 block opacity-70">
                  By Dr. Aris Vane
                </span>
                <h5 className="text-2xl font-body italic font-bold leading-tight mb-2">
                  Beyond the Neural Net: A Philosophical Crisis
                </h5>
                <p className="text-sm opacity-80 leading-relaxed font-body">
                  The emergence of conscious-adjacent algorithms is forcing us to redefine
                  what it means to be sentient in the age of machine foresight.
                </p>
              </article>
            </section>
          </aside>

          {/* ── Center column: Featured story (top GNews article) ── */}
          <section className="lg:px-8 lg:border-x border-outline/15">
            <article className="flex flex-col gap-6">
              <div className="space-y-4">
                <span className="bg-primary text-on-primary px-3 py-1 rounded-sm text-[10px] font-label font-bold tracking-widest uppercase">
                  Lead Story
                </span>
                <h2 className="text-5xl md:text-7xl font-headline font-extrabold leading-[0.9] tracking-tighter text-on-background">
                  {featured.title}
                </h2>
                <p className="text-2xl font-body italic opacity-90 leading-snug">
                  {featured.description}
                </p>

                {featured.crisisLevel && featured.factions && (
                  <div className="flex flex-col md:flex-row gap-4 pt-4">
                    <div className="flex-1 bg-surface-container-low border border-outline/10 p-4 rounded-xl">
                      <div className="text-[10px] font-label font-black uppercase tracking-widest text-on-background/70 mb-2">
                        Crisis Level
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-3xl font-headline font-black text-primary">
                          {featured.crisisLevel}
                        </div>
                        <div className="flex-1 h-1.5 bg-surface-container-lowest rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-linear-to-r from-primary to-tertiary"
                            style={{ width: `${featured.crisisLevel}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-2 bg-surface-container-low border border-outline/10 p-4 rounded-xl">
                      <div className="text-[10px] font-label font-black uppercase tracking-widest text-on-background/70 mb-2">
                        Key Player Stances
                      </div>
                      <div className="flex flex-wrap items-center gap-2 font-headline text-sm font-bold">
                        <span className="text-primary">{featured.factions[0].name}: <span className="opacity-70 font-normal">{featured.factions[0].stance}</span></span>
                        <span className="text-on-background/40 italic px-2">vs</span>
                        <span className="text-tertiary">{featured.factions[1].name}: <span className="opacity-70 font-normal">{featured.factions[1].stance}</span></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <ArticleImage
                  src={featured.image}
                  alt={featured.title}
                  className="w-full aspect-video object-cover"
                />
                <p className="text-[10px] font-label mt-2 opacity-60 uppercase tracking-widest">
                  {featured.source.name} · {new Date(featured.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>

              <div className="flex flex-col md:flex-row gap-8 py-6 border-y border-outline/15">
                <div className="flex-1">
                  <Link
                    href={`/story/${toStorySlug(featured.title)}`}
                    className="inline-flex items-center gap-2 bg-on-background text-surface px-6 py-3 font-label font-black text-[10px] uppercase tracking-widest hover:bg-primary transition-colors"
                  >
                    Launch Interactive Comic →
                  </Link>
                </div>
                <div className="flex-1">
                  <a
                    href={featured.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-bold underline decoration-primary/30 underline-offset-4 text-sm"
                  >
                    Read original article → {featured.source.name}
                  </a>
                </div>
              </div>
            </article>
          </section>

          {/* ── Right column: Economy + Newsletter + Archive ── */}
          <aside className="space-y-8">
            <section>
              <h4 className="font-headline font-black uppercase text-xs tracking-widest mb-4 border-b-2 border-on-background pb-1 w-fit">
                Economy
              </h4>
              <div className="space-y-6">
                {economy.map((article) => (
                  <article key={article.title} className="flex gap-4 group cursor-pointer">
                    <div className="flex-1">
                      <h5 className="text-lg font-headline font-bold leading-tight mb-1 group-hover:text-primary transition-colors">
                        {article.title}
                      </h5>
                      <p className="text-xs opacity-70 font-body">{article.description}</p>
                    </div>
                    <ArticleImage
                      src={article.image}
                      alt={article.title}
                      className="w-16 h-16 object-cover grayscale shrink-0"
                    />
                  </article>
                ))}
              </div>
            </section>

            {/* Newsletter */}
            <div className="bg-surface-container p-6">
              <h5 className="font-headline font-black italic text-xl mb-3 text-on-background">
                The Editorial Brief
              </h5>
              <p className="text-sm mb-4 leading-relaxed italic opacity-80 font-body">
                Every Sunday, we distill the week&apos;s complexities into a narrative that
                matters. Delivered to your inbox.
              </p>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full bg-surface-container-lowest border border-outline/20 px-4 py-2 text-xs mb-3 font-label outline-none focus:border-primary/40 transition-colors"
              />
              <button className="w-full bg-on-background text-surface py-2 text-[10px] font-label font-black uppercase tracking-widest hover:bg-primary transition-colors">
                Subscribe
              </button>
            </div>

            {/* Archive teaser */}
            <section>
              <h4 className="font-headline font-black uppercase text-xs tracking-widest mb-4 border-b-2 border-on-background pb-1 w-fit">
                The Archive
              </h4>
              <article className="group">
                <div className="w-full h-40 mb-3 bg-linear-to-br from-surface-container-high to-surface-container sepia-[0.3]" />
                <h5 className="text-xl font-headline font-bold mb-1 group-hover:text-primary transition-colors">
                  Verified Predictions, Immutable Proofs
                </h5>
                <p className="text-sm opacity-70 italic mb-2 font-body">
                  Oracle&apos;s Archive — on-chain resolved scenarios
                </p>
                <Link
                  href="/archive"
                  className="text-[10px] font-label font-bold uppercase tracking-widest border-b border-on-background hover:text-primary hover:border-primary transition-colors"
                >
                  View Archive
                </Link>
              </article>
            </section>
          </aside>

        </div>

        <NewsFeed articles={feedArticles} />
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
            {['Archives', 'Ethics Policy', 'Masthead', 'Contact', 'Privacy', 'Newsletter'].map(
              (link) => (
                <a key={link} href="#" className="hover:text-primary transition-colors hover:underline">
                  {link}
                </a>
              )
            )}
          </div>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center py-6 border-t border-outline/20 text-[10px] font-label font-bold tracking-[0.2em] uppercase opacity-50">
          <span>© 2026 The Illuminated Editorial · FutureLens. All Rights Reserved.</span>
          <div className="flex gap-6 mt-4 md:mt-0">
            {['Twitter', 'Instagram', 'RSS'].map((s) => (
              <span key={s} className="cursor-pointer hover:opacity-100">
                {s}
              </span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
